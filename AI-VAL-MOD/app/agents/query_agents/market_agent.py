from typing import Dict
from agents.query_agents.base_agent import BaseQueryAgent
from schema.prompts.query_prompts import MarketQueryPrompt


class MarketAgent(BaseQueryAgent):
    name = "market"
    platforms = ["ddg", "tavily", "hackernews"]
    query_count = 4

    def _build_prompt(self, pitch: str, startup_data: Dict) -> str:
        return MarketQueryPrompt.TEMPLATE.format(
            count=self.query_count,
            startup_name=startup_data.get("startup_name", ""),
            startup_domain=startup_data.get("startup_domain", ""),
            problem_statement=startup_data.get("problem_statement", ""),
            target_audience=startup_data.get("target_audience", ""),
            geographic_market=startup_data.get("geographic_market", ""),
            revenue_model=startup_data.get("revenue_model", ""),
            estimated_pricing=startup_data.get("estimated_pricing", ""),
        )

market_agent = MarketAgent()
