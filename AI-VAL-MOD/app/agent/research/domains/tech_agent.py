from agent.research.base_research_agent import BaseResearchAgent
from typing import List


class TechnologyResearchAgent(BaseResearchAgent):
    def __init__(self):
        super().__init__(domain="Technology")

    def _default_platforms(self) -> List[str]:
        # Dev community first, then research papers, then dev blogs
        return ["StackExchange", "HackerNews", "GitHub", "ArXiv", "DevTo"]


technology_research_agent = TechnologyResearchAgent()
