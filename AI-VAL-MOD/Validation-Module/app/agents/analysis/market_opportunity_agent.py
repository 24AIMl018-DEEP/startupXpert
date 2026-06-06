from agents.analysis.base_analysis_agent import BaseAnalysisAgent
from schema.prompts.analysis_prompts import MarketOpportunityPrompt


class MarketOpportunityAgent(BaseAnalysisAgent):
    name = "market_opportunity"
    llm_tier = 2
    top_k_per_query = 4
    json_fields = [
        "startup_name", "startup_domain", "problem_statement", "target_audience",
        "geographic_market", "revenue_model", "estimated_pricing",
        "customer_acquisition_strategy", "scalability_goal",
    ]
    vector_queries = [
        "{startup_domain} market size growth rate {geographic_market}",
        "{target_audience} demand pain {problem_statement}",
        "{revenue_model} pricing model viability {startup_domain}",
        "VC funding investment {startup_domain} {geographic_market} trends",
        "{target_audience} willingness to pay {estimated_pricing} {startup_domain}",
    ]

    def _get_prompt_template(self) -> str:
        return MarketOpportunityPrompt.TEMPLATE


market_opportunity_agent = MarketOpportunityAgent()
