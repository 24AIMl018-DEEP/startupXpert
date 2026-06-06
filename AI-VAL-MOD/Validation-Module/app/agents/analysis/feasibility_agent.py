from agents.analysis.base_analysis_agent import BaseAnalysisAgent
from schema.prompts.analysis_prompts import FeasibilityPrompt


class FeasibilityAnalysisAgent(BaseAnalysisAgent):
    name = "feasibility_analysis"
    llm_tier = 2
    top_k_per_query = 4
    json_fields = [
        "startup_name", "startup_domain", "startup_description", "problem_statement",
        "platform_type", "technology_complexity", "mvp_timeline", "scalability_goal",
        "available_funding", "monthly_burn_capacity", "founder_count", "founder_skillset",
        "industry_experience", "current_startup_stage",
    ]
    vector_queries = [
        "build {platform_type} {startup_domain} technical requirements complexity",
        "{technology_complexity} architecture MVP timeline {mvp_timeline} realistic",
        "founder {founder_skillset} required {startup_domain} startup success",
        "{available_funding} burn rate {monthly_burn_capacity} runway months",
        "{startup_domain} scalability challenges {platform_type}",
    ]

    def _get_prompt_template(self) -> str:
        return FeasibilityPrompt.TEMPLATE


feasibility_agent = FeasibilityAnalysisAgent()
