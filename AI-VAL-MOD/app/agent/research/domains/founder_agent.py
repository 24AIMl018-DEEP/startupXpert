from agent.research.base_research_agent import BaseResearchAgent
from typing import List


class FounderResearchAgent(BaseResearchAgent):
    def __init__(self):
        super().__init__(domain="Founder")

    def _default_platforms(self) -> List[str]:
        return ["Reddit", "HackerNews", "Quora", "Substack"]


founder_research_agent = FounderResearchAgent()
