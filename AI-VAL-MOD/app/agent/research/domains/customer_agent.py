from agent.research.base_research_agent import BaseResearchAgent
from typing import List


class CustomerResearchAgent(BaseResearchAgent):
    def __init__(self):
        super().__init__(domain="Customer")

    def _default_platforms(self) -> List[str]:
        # Heaviest community focus — real human voices only
        return ["Reddit", "Quora", "HackerNews", "StackExchange"]


customer_research_agent = CustomerResearchAgent()
