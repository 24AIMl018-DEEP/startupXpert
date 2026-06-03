from agent.research.base_research_agent import BaseResearchAgent
from typing import List


class MarketResearchAgent(BaseResearchAgent):
    def __init__(self):
        super().__init__(domain="Market")

    def _default_platforms(self) -> List[str]:
        # Community + knowledge base, Tavily as filler
        return ["Reddit", "HackerNews", "Wikipedia", "Tavily"]


market_research_agent = MarketResearchAgent()
