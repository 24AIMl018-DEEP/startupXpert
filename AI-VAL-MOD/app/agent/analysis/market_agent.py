from services.llm.router import get_llm_response
from schema.analysis_schema import ValidatedSignal, DomainAnalysisReport
from schema.extracted_schema import NormalizedStartupData

class MarketOpportunityAgent:
    async def analyze(self, startup_data: NormalizedStartupData, signals: ValidatedSignal) -> DomainAnalysisReport:
        """
        Analyze market opportunity based on startup data and verified signals
        """
        
        prompt = f"""You are a Market Sizing & Trends Expert for a VC firm.
Analyze the Market Opportunity for '{startup_data.startup_name}'.
Domain: {startup_data.domain} | Target: {startup_data.target_market}
Facts: {', '.join(signals.verified_facts) or 'None'}
Red Flags: {', '.join(signals.red_flags) or 'None'}
Return ONLY JSON: {{"domain_name": "Market Opportunity", "score": 0, "key_findings": [], "critical_risks": [], "strategic_advice": ""}}"""
        
        try:
            """
            Regarding to the market Analysis this agent Generates the analysis
            """
            
            data = await get_llm_response(prompt, tier="high", temperature=0.4)
            return DomainAnalysisReport(**data)
        except Exception as e:
            return DomainAnalysisReport(domain_name="Market Opportunity", score=0, key_findings=[str(e)], critical_risks=[], strategic_advice="Error")

market_agent = MarketOpportunityAgent()
