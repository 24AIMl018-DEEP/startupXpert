from services.llm.router import get_llm_response
from schema.analysis_schema import FinalRecommendationReport


def _compress_reports(all_domain_reports: dict) -> str:
    """Flatten 5 domain reports into a compact prompt-safe string."""
    lines = []
    for domain, report in all_domain_reports.items():
        score    = report.get("score", "?")
        findings = "; ".join(report.get("key_findings", [])[:3])
        risks    = "; ".join(report.get("critical_risks", [])[:2])
        advice   = report.get("strategic_advice", "")[:200]
        lines.append(
            f"[{domain}] Score:{score}/100 | "
            f"Findings: {findings} | "
            f"Risks: {risks} | "
            f"Advice: {advice}"
        )
    return "\n".join(lines)


class RecommendationAgent:
    async def generate_final_verdict(self, startup_name: str, all_domain_reports: dict) -> FinalRecommendationReport:
        compressed = _compress_reports(all_domain_reports)

        prompt = (
            f"You are the Managing Partner at an elite VC firm.\n"
            f"Your 5 analysts have submitted their reports for '{startup_name}':\n\n"
            f"{compressed}\n\n"
            f"Make a final investment decision. Be objective and brutal.\n"
            f'Return ONLY JSON: {{"overall_score": 72, "investment_decision": "Go with Caution", '
            f'"executive_summary": "3-4 sentence honest summary", "immediate_action_items": ["action1", "action2", "action3"]}}'
        )
        try:
            data = await get_llm_response(prompt, tier="high", temperature=0.3)
            return FinalRecommendationReport(**data)
        except Exception as e:
            print(f"[Recommendation Agent] Failed: {e}")
            return FinalRecommendationReport(
                overall_score=0,
                investment_decision="Pivot Required",
                executive_summary="Analysis failed — check logs.",
                immediate_action_items=["Review logs"]
            )


recommendation_agent = RecommendationAgent()
