from states.startup_state import StartupState
from agents.base_agent import BaseAgent
from collectors.search_collector import SearchCollector
from collectors.trends_collector import TrendsCollector


class EvidenceAgent(BaseAgent):

    def __init__(self):
        self.search = SearchCollector()
        self.trends = TrendsCollector()

    def run(self, state: StartupState) -> StartupState:

        queries = state["search_queries"]
        all_evidence = []

        for i, query in enumerate(queries, 1):
            print(f"    Searching [{i}/{len(queries)}]: {query}")
            results = self.search.collect([query])
            all_evidence.extend(results)
            print(f"      → {len(results)} results collected")

        print(f"    Total combined: {len(all_evidence)} results")

        sp = state["structured_problem"]
        trend_keyword = sp["core_problem"]
        trend_data = self.trends.collect(trend_keyword)

        state["raw_evidence"]  = all_evidence
        state["trend_keyword"] = trend_keyword
        state["trend_score"]   = trend_data["trend_score"]

        return state
