from typing import Dict
from agents.query_agents.base_agent import BaseQueryAgent
from schema.prompts.query_prompts import TechnologyQueryPrompt


class TechnologyAgent(BaseQueryAgent):
    name = "technology"
    platforms = ["github", "hackernews", "ddg"]
    query_count = 3

    def _build_prompt(self, pitch: str, startup_data: Dict) -> str:
        platform_type = startup_data.get("platform_type", [])
        return TechnologyQueryPrompt.TEMPLATE.format(
            count=self.query_count,
            platform_type=", ".join(platform_type) if isinstance(platform_type, list) else platform_type,
            technology_complexity=startup_data.get("technology_complexity", ""),
            startup_domain=startup_data.get("startup_domain", ""),
            mvp_timeline=startup_data.get("mvp_timeline", ""),
            scalability_goal=startup_data.get("scalability_goal", ""),
            startup_description=startup_data.get("startup_description", ""),
        )

technology_agent = TechnologyAgent()
