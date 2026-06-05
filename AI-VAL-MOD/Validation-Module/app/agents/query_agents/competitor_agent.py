from typing import Dict
from agents.query_agents.base_agent import BaseQueryAgent
from schema.prompts.query_prompts import CompetitorQueryPrompt


class CompetitorAgent(BaseQueryAgent):
    name = "competitor"
    platforms = ["ddg", "tavily", "producthunt"]
    query_count = 4

    def _build_prompt(self, pitch: str, startup_data: Dict) -> str:
        return CompetitorQueryPrompt.TEMPLATE.format(
            count=self.query_count,
            startup_name=startup_data.get("startup_name", ""),
            startup_domain=startup_data.get("startup_domain", ""),
            existing_competitors=startup_data.get("existing_competitors", ""),
            startup_description=startup_data.get("startup_description", ""),
            target_audience=startup_data.get("target_audience", ""),
            geographic_market=startup_data.get("geographic_market", ""),
            estimated_pricing=startup_data.get("estimated_pricing", ""),
        )

competitor_agent = CompetitorAgent()
