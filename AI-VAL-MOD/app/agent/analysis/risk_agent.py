from services.llm.router import get_llm_response
from schema.analysis_schema import ValidatedSignal, DomainAnalysisReport
from schema.extracted_schema import NormalizedStartupData

class RiskAnalysisAgent:
    async def analyze(self, startup_data: NormalizedStartupData, signals: ValidatedSignal) -> DomainAnalysisReport:
        prompt = f"""You are a Regulatory and Execution Risk Auditor for a VC firm.
Analyze the Risks for '{startup_data.startup_name}'.
Location: {startup_data.location} | Domain: {startup_data.domain}
Facts: {', '.join(signals.verified_facts) or 'None'}
Red Flags: {', '.join(signals.red_flags) or 'None'}
Return ONLY JSON: {{"domain_name": "Risk Analysis", "score": 0, "key_findings": [], "critical_risks": [], "strategic_advice": ""}}"""
        try:
            data = await get_llm_response(prompt, tier="high", temperature=0.3)
            return DomainAnalysisReport(**data)
        except Exception as e:
            return DomainAnalysisReport(domain_name="Risk Analysis", score=0, key_findings=[str(e)], critical_risks=[], strategic_advice="Error")

risk_agent = RiskAnalysisAgent()
