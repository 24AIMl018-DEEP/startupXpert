from agents.analysis.base_analysis_agent import BaseAnalysisAgent
from schema.prompts.analysis_prompts import RiskAnalysisPrompt


class RiskAnalysisAgent(BaseAnalysisAgent):
    name = "risk_analysis"
    llm_tier = 2
    top_k_per_query = 4
    json_fields = [
        "startup_name", "startup_domain", "problem_statement", "startup_description",
        "technology_complexity", "available_funding", "monthly_burn_capacity",
        "existing_competitors", "mvp_timeline", "current_startup_stage",
        "geographic_market", "revenue_model",
    ]
    vector_queries = [
        "{startup_domain} startup failure reasons common risks",
        "{geographic_market} {startup_domain} regulatory compliance legal requirements",
        "{technology_complexity} platform technical failure bottleneck {startup_domain}",
        "{current_startup_stage} startup burn rate runway {monthly_burn_capacity} benchmark",
        "{startup_domain} {geographic_market} market risk demand collapse competitors",
    ]

    def _get_prompt_template(self) -> str:
        return RiskAnalysisPrompt.TEMPLATE


risk_analysis_agent = RiskAnalysisAgent()
