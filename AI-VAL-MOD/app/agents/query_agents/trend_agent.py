from typing import Dict
from agents.query_agents.base_agent import BaseQueryAgent
from schema.prompts.query_prompts import TrendQueryPrompt


class TrendAgent(BaseQueryAgent):
    name = "trend"
    platforms = ["ddg", "tavily", "hackernews"]
    query_count = 3

    def _build_prompt(self, pitch: str, startup_data: Dict) -> str:
        return TrendQueryPrompt.TEMPLATE.format(
            count=self.query_count,
            startup_domain=startup_data.get("startup_domain", ""),
            geographic_market=startup_data.get("geographic_market", ""),
            startup_description=startup_data.get("startup_description", ""),
            target_audience=startup_data.get("target_audience", ""),
            scalability_goal=startup_data.get("scalability_goal", ""),
        )

trend_agent = TrendAgent()
