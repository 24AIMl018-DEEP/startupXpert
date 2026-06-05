import json
from typing import Dict, List

from shared.core.base_agent import BaseAgent
from schema.prompts.profiler_prompt import PROFILER_PROMPT

_FIELDS = [
    "startup_name", "startup_domain", "startup_description",
    "platform_type", "technology_complexity", "current_startup_stage",
    "revenue_model", "geographic_market", "problem_statement",
    "target_audience", "existing_competitors",
]


class ProfilerAgent(BaseAgent):
    name        = "master_profiler"
    llm_tier    = 2
    temperature = 0.1

    def run(self, startup_data: Dict, validation_context: Dict) -> Dict:
        print(f"[{self.name}] START — '{startup_data.get('startup_name')}'")

        prompt = PROFILER_PROMPT.format(
            startup_json=json.dumps(
                {k: startup_data.get(k) for k in _FIELDS}, indent=2
            ),
            validation_summary=_build_validation_summary(validation_context),
        )

        raw    = self._call_llm(prompt, tier=2, temperature=0.1)
        result = self._parse_json(raw)

        # Normalise output — extract branch names list + outlines dict
        branches: List[Dict] = result.get("branches", [])
        result["prioritized_branches"] = [b["name"] for b in branches]
        result["branch_outlines"]      = {b["name"]: b.get("outline", "") for b in branches}
        result["branch_tier_map"]      = result.get("branch_tier_map") or {
            b["name"]: b.get("tier", 2) for b in branches
        }
        result.setdefault("business_type", "Unknown")
        result.setdefault("tech_required",  False)
        result.setdefault("reasoning",      "")

        print(
            f"[{self.name}] DONE — type='{result['business_type']}' "
            f"tech={result['tech_required']} "
            f"branches={result['prioritized_branches']}"
        )
        return result


def _build_validation_summary(ctx: Dict) -> str:
    if not ctx or not ctx.get("available"):
        return "No prior validation data available."

    s     = ctx.get("summary", {})
    lines = [f"Overall Score: {ctx.get('aggregate_score')}/100"]

    fe = s.get("feasibility", {})
    if fe.get("score"):
        lines.append(f"Feasibility {fe['score']}/100 — {fe.get('verdict','')}")
        if fe.get("strengths"):   lines.append(f"  Strengths: {', '.join(fe['strengths'][:3])}")
        if fe.get("weaknesses"):  lines.append(f"  Weaknesses: {', '.join(fe['weaknesses'][:3])}")

    mo = s.get("market", {})
    if mo.get("score"):
        lines.append(f"Market {mo['score']}/100 — {mo.get('verdict','')}")
        if mo.get("tam_signal"):      lines.append(f"  TAM: {mo['tam_signal']}")
        if mo.get("demand_signals"):  lines.append(f"  Demand: {', '.join(mo['demand_signals'][:3])}")
        if mo.get("timing_assessment"): lines.append(f"  Timing: {mo['timing_assessment']}")

    co = s.get("competition", {})
    if co.get("score"):
        lines.append(f"Competition {co['score']}/100 — {co.get('verdict','')}")
        if co.get("key_competitors"):   lines.append(f"  Competitors: {', '.join(co['key_competitors'][:3])}")
        if co.get("competitive_gaps"):  lines.append(f"  Gaps: {', '.join(co['competitive_gaps'][:2])}")

    ri = s.get("risk", {})
    if ri.get("score"):
        lines.append(f"Risk {ri['score']}/100 — Level: {ri.get('overall_risk_level','')}")
        if ri.get("top_risks"): lines.append(f"  Top risks: {', '.join(ri['top_risks'][:2])}")

    inn = s.get("innovation", {})
    if inn.get("usp_statement"): lines.append(f"USP: {inn['usp_statement']}")

    return "\n".join(lines)


profiler_agent = ProfilerAgent()
