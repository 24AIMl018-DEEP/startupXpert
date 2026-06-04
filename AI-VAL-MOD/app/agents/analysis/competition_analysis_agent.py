from agents.analysis.base_analysis_agent import BaseAnalysisAgent
from schema.prompts.analysis_prompts import CompetitionAnalysisPrompt


class CompetitionAnalysisAgent(BaseAnalysisAgent):
    name = "competition_analysis"
    llm_tier = 2
    top_k_per_query = 4
    json_fields = [
        "startup_name", "startup_domain", "startup_description", "existing_competitors",
        "target_audience", "geographic_market", "revenue_model", "estimated_pricing",
    ]
    vector_queries = [
        "{existing_competitors} weakness complaints users {startup_domain}",
        "{existing_competitors} alternative why users switch {geographic_market}",
        "{startup_domain} competitive gap whitespace {target_audience}",
        "{startup_description} differentiation unique advantage {startup_domain}",
        "{startup_domain} {geographic_market} market leader dominance switching cost",
    ]

    def _get_prompt_template(self) -> str:
        return CompetitionAnalysisPrompt.TEMPLATE


competition_analysis_agent = CompetitionAnalysisAgent()
