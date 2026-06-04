from typing import Dict
from agents.query_agents.base_agent import BaseQueryAgent
from schema.prompts.query_prompts import ProblemQueryPrompt


class ProblemAgent(BaseQueryAgent):
    name = "problem"
    platforms = ["ddg", "quora", "hackernews"]
    query_count = 4

    def _build_prompt(self, pitch: str, startup_data: Dict) -> str:
        return ProblemQueryPrompt.TEMPLATE.format(
            count=self.query_count,
            problem_statement=startup_data.get("problem_statement", ""),
            target_audience=startup_data.get("target_audience", ""),
            existing_competitors=startup_data.get("existing_competitors", ""),
            geographic_market=startup_data.get("geographic_market", ""),
            revenue_model=startup_data.get("revenue_model", ""),
        )

problem_agent = ProblemAgent()
