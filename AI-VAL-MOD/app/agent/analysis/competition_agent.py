from services.llm.router import get_llm_response
from schema.analysis_schema import ValidatedSignal, DomainAnalysisReport
from schema.extracted_schema import NormalizedStartupData

class CompetitionAnalysisAgent:
    async def analyze(self, startup_data: NormalizedStartupData, signals: ValidatedSignal) -> DomainAnalysisReport:
        prompt = f"""You are a Strategic Competitor Analyst for a VC firm.
Analyze the Competition for '{startup_data.startup_name}'.
Known Competitors: {', '.join(startup_data.competitors_list)}
Facts: {', '.join(signals.verified_facts) or 'None'}
Red Flags: {', '.join(signals.red_flags) or 'None'}
Return ONLY JSON: {{"domain_name": "Competition Analysis", "score": 0, "key_findings": [], "critical_risks": [], "strategic_advice": ""}}"""
        
        try:
            """
            This agent is analysis the compitition theme
            """
            
            data = await get_llm_response(prompt, tier="high", temperature=0.4)
            return DomainAnalysisReport(**data)
        except Exception as e:
            return DomainAnalysisReport(domain_name="Competition Analysis", score=0, key_findings=[str(e)], critical_risks=[], strategic_advice="Error")

competition_agent = CompetitionAnalysisAgent()
