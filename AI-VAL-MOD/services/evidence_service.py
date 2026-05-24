from collectors.search_collector import SearchCollector
from collectors.trends_collector import TrendsCollector


class EvidenceService:

    def __init__(self):
        self.search = SearchCollector()
        self.trends = TrendsCollector()

    def _collect_intent(self, queries: list, intent: str) -> list:
        results = []
        for i, query in enumerate(queries, 1):
            print(f"    [{intent}] [{i}/{len(queries)}] {query}")
            hits = self.search.collect([query])
            results.extend(hits)
            print(f"      -> {len(hits)} results")
        return results

    def run(self, search_queries: dict, trend_keyword: str) -> dict:

        problem_evidence  = self._collect_intent(search_queries.get("problem_queries",  []), "problem")
        behavior_evidence = self._collect_intent(search_queries.get("behavior_queries", []), "behavior")
        spending_evidence = self._collect_intent(search_queries.get("spending_queries", []), "spending")

        # combine into master pool
        all_evidence = problem_evidence + behavior_evidence + spending_evidence

        print(f"    Total: {len(problem_evidence)} problem + {len(behavior_evidence)} behavior + {len(spending_evidence)} spending = {len(all_evidence)} combined")

        trend_data = self.trends.collect(trend_keyword)

        return {
            "raw_evidence":      all_evidence,
            "problem_evidence":  problem_evidence,
            "behavior_evidence": behavior_evidence,
            "spending_evidence": spending_evidence,
            "trend_keyword":     trend_keyword,
            "trend_score":       trend_data["trend_score"]
        }
