from agent.research.base_research_agent import BaseResearchAgent
from typing import List


class BusinessResearchAgent(BaseResearchAgent):
    def __init__(self):
        super().__init__(domain="Business")

    def _default_platforms(self) -> List[str]:
        return ["Substack", "HackerNews", "Reddit", "ProductHunt"]


business_research_agent = BusinessResearchAgent()
