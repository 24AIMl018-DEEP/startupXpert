from agent.research.base_research_agent import BaseResearchAgent
from typing import List


class CompetitorResearchAgent(BaseResearchAgent):
    def __init__(self):
        super().__init__(domain="Competitor")

    def _default_platforms(self) -> List[str]:
        return ["ProductHunt", "Reddit", "Quora", "HackerNews"]


competitor_research_agent = CompetitorResearchAgent()
