import json
import re
from typing import Dict, List
from shared.core.llm_factory import call_llm_with_fallback
from schema.prompts.recommendation_prompt import RecommendationPrompt


def _find(results: List[Dict], agent: str) -> Dict:
    return next((r for r in results if r.get("agent") == agent), {})


def _fmt(val) -> str:
    if isinstance(val, list):
        return "; ".join(
            f"{r.get('risk','?')} [{r.get('severity','?')}]" if isinstance(r, dict) else str(r)
            for r in val
        ) or "None identified"
    return str(val) if val else "Not provided"


class RecommendationAgent:
    name = "recommendation"

    def run(self, startup_data: Dict, analysis_results: List[Dict]) -> Dict:
        print(f"[RecommendationAgent] Building final verdict...")

        fe  = _find(analysis_results, "feasibility_analysis")
        mo  = _find(analysis_results, "market_opportunity")
        co  = _find(analysis_results, "competition_analysis")
        ri  = _find(analysis_results, "risk_analysis")
        inn = _find(analysis_results, "innovation_usp")

        scores = [r.get("score") for r in analysis_results if isinstance(r.get("score"), (int, float))]
        aggregate = round(sum(scores) / len(scores), 1) if scores else 0.0

        prompt = RecommendationPrompt.TEMPLATE.format(
            startup_name          = startup_data.get("startup_name", ""),
            startup_domain        = startup_data.get("startup_domain", ""),
            current_startup_stage = startup_data.get("current_startup_stage", ""),
            aggregate_score       = aggregate,
            feasibility_score     = fe.get("score", "N/A"),
            feasibility_verdict   = fe.get("verdict", "N/A"),
            feasibility_strengths = _fmt(fe.get("strengths")),
            feasibility_weaknesses= _fmt(fe.get("weaknesses")),
            feasibility_summary   = fe.get("summary", ""),
            market_score          = mo.get("score", "N/A"),
            market_verdict        = mo.get("verdict", "N/A"),
            tam_signal            = mo.get("tam_signal", "Not found"),
            timing_assessment     = mo.get("timing_assessment", "N/A"),
            demand_signals        = _fmt(mo.get("demand_signals")),
            market_summary        = mo.get("summary", ""),
            competition_score     = co.get("score", "N/A"),
            competition_verdict   = co.get("verdict", "N/A"),
            key_competitors       = _fmt(co.get("key_competitors")),
            competitive_gaps      = _fmt(co.get("competitive_gaps")),
            differentiation_strength = co.get("differentiation_strength", "N/A"),
            competition_summary   = co.get("summary", ""),
            risk_score            = ri.get("score", "N/A"),
            risk_verdict          = ri.get("verdict", "N/A"),
            critical_risks        = _fmt(ri.get("critical_risks")),
            overall_risk_level    = ri.get("overall_risk_level", "N/A"),
            risk_summary          = ri.get("summary", ""),
            innovation_score      = inn.get("score", "N/A"),
            innovation_verdict    = inn.get("verdict", "N/A"),
            usp_statement         = inn.get("usp_statement", "N/A"),
            defensibility         = inn.get("defensibility", "N/A"),
            innovation_summary    = inn.get("summary", ""),
        )

        raw = call_llm_with_fallback(prompt, tier=2, temperature=0.1)
        text = raw.strip()
        fenced = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
        if fenced:
            text = fenced.group(1).strip()
        else:
            brace = re.search(r"(\{[\s\S]*\})", text)
            if brace:
                text = brace.group(1).strip()

        try:
            result = json.loads(text)
        except Exception:
            result = {"verdict": "PASS", "parse_error": True, "raw": raw[:500]}

        result["agent"] = self.name
        print(f"[RecommendationAgent] Done — verdict={result.get('verdict')} confidence={result.get('confidence')}")
        return result


recommendation_agent = RecommendationAgent()
