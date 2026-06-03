from services.llm.router import get_llm_response
from schema.analysis_schema import ValidatedSignal, DomainAnalysisReport
from schema.extracted_schema import NormalizedStartupData

class InnovationAgent:
    async def analyze(self, startup_data: NormalizedStartupData, signals: ValidatedSignal) -> DomainAnalysisReport:
        prompt = f"""You are a Product Visionary & UX Expert for a VC firm.
Analyze the Innovation & USP for '{startup_data.startup_name}'.
Problem: {startup_data.core_problem}
Solution Features: {', '.join(startup_data.nlp_extracted_keywords.extracted_core_features)}
Facts: {', '.join(signals.verified_facts) or 'None'}
Red Flags: {', '.join(signals.red_flags) or 'None'}
Return ONLY JSON: {{"domain_name": "Innovation & USP", "score": 0, "key_findings": [], "critical_risks": [], "strategic_advice": ""}}"""
        try:
            data = await get_llm_response(prompt, tier="high", temperature=0.5)
            return DomainAnalysisReport(**data)
        except Exception as e:
            return DomainAnalysisReport(domain_name="Innovation & USP", score=0, key_findings=[str(e)], critical_risks=[], strategic_advice="Error")

innovation_agent = InnovationAgent()
