import json
from typing import Dict

from shared.core.base_agent import BaseAgent
from schema.prompts.branch_prompt import BRANCH_PROMPT

_FIELDS = [
    "startup_name", "startup_domain", "startup_description",
    "target_audience", "geographic_market", "revenue_model",
    "estimated_pricing", "available_funding", "monthly_burn_capacity",
    "current_startup_stage", "mvp_timeline", "founder_skillset",
    "customer_acquisition_strategy", "problem_statement",
]


class BranchAgent(BaseAgent):
    name        = "branch_agent"
    temperature = 0.3

    def run(self, branch: str, startup_data: Dict, profiler_output: Dict, validation_context: Dict) -> Dict:
        # Tier comes from profiler's decision — not hardcoded here
        tier = profiler_output.get("branch_tier_map", {}).get(branch, 2)
        outline = profiler_output.get("branch_outlines", {}).get(branch, "")

        print(f"[{self.name}] START — branch='{branch}' tier={tier}")

        prompt = BRANCH_PROMPT.format(
            branch=branch,
            startup_json=json.dumps(
                {k: startup_data.get(k) for k in _FIELDS}, indent=2
            ),
            business_type=profiler_output.get("business_type", ""),
            tech_required=profiler_output.get("tech_required", False),
            branch_outline=outline or "No outline available — generate from scratch.",
            validation_summary=_extract_branch_signals(branch, validation_context),
        )

        raw = self._call_llm(prompt, tier=tier, temperature=0.3)

        try:
            result = self._parse_json(raw)
        except ValueError:
            print(f"[{self.name}] JSON parse failed — branch='{branch}'")
            return {"branch": branch, "status": "failed", "tasks": None, "summary": None}

        result["branch"] = branch
        result["status"] = "success"
        print(f"[{self.name}] DONE — branch='{branch}' tier={tier} tasks={len(result.get('tasks', []))}")
        return result


def _extract_branch_signals(branch: str, ctx: Dict) -> str:
    """Pull only the validation signals relevant to this branch — no noise."""
    if not ctx or not ctx.get("available"):
        return "No validation data."

    s     = ctx.get("summary", {})
    lines = []

    fe  = s.get("feasibility",  {})
    mo  = s.get("market",       {})
    co  = s.get("competition",  {})
    ri  = s.get("risk",         {})
    inn = s.get("innovation",   {})

    b = branch.lower()

    # Operations / Setup / Legal / Hiring → feasibility signals
    if any(k in b for k in ("legal", "licens", "setup", "real_estate", "inventory",
                             "supply", "staff", "hiring", "operations", "compliance",
                             "regulatory", "manufacturing", "production")):
        if fe.get("weaknesses"):      lines.append(f"Feasibility weaknesses: {', '.join(fe['weaknesses'][:3])}")
        if fe.get("recommendations"): lines.append(f"Recommended actions: {', '.join(fe['recommendations'][:2])}")

    # Marketing / Sales / GTM / Customer → market + competition signals
    if any(k in b for k in ("market", "sales", "gtm", "go_to", "customer", "brand",
                             "advertising", "influencer", "retention", "acquisition",
                             "distribution", "channel", "digital", "local")):
        if mo.get("demand_signals"):    lines.append(f"Validated demand: {', '.join(mo['demand_signals'][:3])}")
        if mo.get("timing_assessment"): lines.append(f"Market timing: {mo['timing_assessment']}")
        if mo.get("tam_signal"):        lines.append(f"TAM: {mo['tam_signal']}")
        if co.get("key_competitors"):   lines.append(f"Competitors: {', '.join(co['key_competitors'][:3])}")
        if co.get("competitive_gaps"):  lines.append(f"Gaps to exploit: {', '.join(co['competitive_gaps'][:2])}")

    # Tech / Product → innovation + USP signals
    if any(k in b for k in ("tech", "system", "architecture", "backend", "frontend",
                             "api", "infra", "product", "ai", "ml", "data", "platform",
                             "software", "mobile", "web", "devops")):
        if inn.get("usp_statement"):      lines.append(f"USP to build around: {inn['usp_statement']}")
        if inn.get("innovation_factors"): lines.append(f"Innovation factors: {', '.join(inn['innovation_factors'][:3])}")
        if inn.get("defensibility"):      lines.append(f"Defensibility: {inn['defensibility']}")

    # Finance / Fundraising / Partnerships → risk + feasibility signals
    if any(k in b for k in ("financ", "fundrais", "invest", "capital", "partner",
                             "alliance", "vendor", "procurement", "export", "import")):
        if ri.get("top_risks"):    lines.append(f"Key risks: {', '.join(ri['top_risks'][:2])}")
        if fe.get("strengths"):    lines.append(f"Strengths for pitch: {', '.join(fe['strengths'][:2])}")
        if ri.get("overall_risk_level"): lines.append(f"Risk level: {ri['overall_risk_level']}")

    # Default fallback — overall score
    if not lines:
        lines.append(f"Overall validation score: {ctx.get('aggregate_score')}/100")
        if fe.get("verdict"): lines.append(f"Feasibility: {fe['verdict']}")

    return "\n".join(lines)


branch_agent = BranchAgent()
