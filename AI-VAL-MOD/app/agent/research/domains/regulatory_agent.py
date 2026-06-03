from agent.research.base_research_agent import BaseResearchAgent
from typing import List


class RegulatoryResearchAgent(BaseResearchAgent):
    def __init__(self):
        super().__init__(domain="Regulatory")

    def _default_platforms(self) -> List[str]:
        # StackExchange has dedicated law/money communities — gold for regulatory
        return ["StackExchange", "Reddit", "Wikipedia", "Tavily"]


regulatory_research_agent = RegulatoryResearchAgent()
