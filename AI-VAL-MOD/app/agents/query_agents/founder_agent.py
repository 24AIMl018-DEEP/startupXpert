from typing import Dict
from agents.query_agents.base_agent import BaseQueryAgent
from schema.prompts.query_prompts import FounderQueryPrompt


class FounderAgent(BaseQueryAgent):
    name = "founder"
    platforms = ["ddg", "hackernews"]
    query_count = 3

    def _build_prompt(self, pitch: str, startup_data: Dict) -> str:
        skillset = startup_data.get("founder_skillset", [])
        return FounderQueryPrompt.TEMPLATE.format(
            count=self.query_count,
            startup_domain=startup_data.get("startup_domain", ""),
            founder_skillset=", ".join(skillset) if isinstance(skillset, list) else skillset,
            industry_experience=startup_data.get("industry_experience", ""),
            founder_count=startup_data.get("founder_count", ""),
            profession=startup_data.get("profession", ""),
        )

founder_agent = FounderAgent()
