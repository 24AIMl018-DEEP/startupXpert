from agents.analysis.base_analysis_agent import BaseAnalysisAgent
from schema.prompts.analysis_prompts import InnovationUSPPrompt


class InnovationUSPAgent(BaseAnalysisAgent):
    name = "innovation_usp"
    llm_tier = 2
    top_k_per_query = 4
    json_fields = [
        "startup_name", "startup_domain", "startup_description", "problem_statement",
        "existing_competitors", "platform_type", "technology_complexity",
        "founder_skillset", "scalability_goal",
    ]
    vector_queries = [
        "{startup_domain} innovation novel approach 10x improvement existing solution",
        "{platform_type} {technology_complexity} replication difficulty build cost {startup_domain}",
        "{existing_competitors} feature gap unmet need {startup_domain}",
        "{startup_domain} proprietary data moat network effect defensibility",
        "{startup_description} similar existing product {startup_domain} already built",
    ]

    def _get_prompt_template(self) -> str:
        return InnovationUSPPrompt.TEMPLATE


innovation_usp_agent = InnovationUSPAgent()
