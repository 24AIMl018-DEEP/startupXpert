"""
Evidence Service  (v2 — handles structured evidence dicts from SearchCollector v2)
────────────────────────────────────────────────────────────────────────────────────
SearchCollector now returns:
    [{text, source, url, source_weight}, ...]

instead of raw strings.

This service collects per-intent, merges, and passes structured evidence
to the rest of the pipeline. CleaningService reads source_weight to boost
high-trust sources (Reddit > blog > PDF).
"""
from collectors.search_collector import SearchCollector
from collectors.trends_collector import TrendsCollector


class EvidenceService:

    def __init__(self):
        self.search = SearchCollector()
        self.trends = TrendsCollector()

    def _collect(self, queries: list, intent: str) -> list:
        results = []
        for i, q in enumerate(queries, 1):
            print(f"    [{intent}] [{i}/{len(queries)}] {q}")
            hits = self.search.collect([q])
            results.extend(hits)
            # Show source breakdown for first hit
            if hits:
                top_source = hits[0].get("source", "?")
                top_weight = hits[0].get("source_weight", 0)
                print(f"      → {len(hits)} results  (top source: {top_source} w={top_weight})")
        return results

    def run(self, search_queries: dict, trend_keyword: str) -> dict:
        problem_evidence  = self._collect(search_queries.get("problem_queries",  []), "problem")
        behavior_evidence = self._collect(search_queries.get("behavior_queries", []), "behavior")
        spending_evidence = self._collect(search_queries.get("spending_queries", []), "spending")

        all_evidence = problem_evidence + behavior_evidence + spending_evidence

        # Source distribution summary
        from collections import Counter
        source_counts = Counter(e.get("source", "unknown") for e in all_evidence)
        print(f"\n    Source distribution:")
        for src, count in source_counts.most_common(8):
            weight = next((e["source_weight"] for e in all_evidence if e.get("source") == src), 0)
            print(f"      {src:<20} {count:>4} items  weight={weight}")

        print(f"\n    Total: {len(problem_evidence)} + {len(behavior_evidence)} + "
              f"{len(spending_evidence)} = {len(all_evidence)}")

        trend_data = self.trends.collect(trend_keyword)

        return {
            "raw_evidence":      all_evidence,
            "problem_evidence":  problem_evidence,
            "behavior_evidence": behavior_evidence,
            "spending_evidence": spending_evidence,
            "trend_keyword":     trend_keyword,
            "trend_score":       trend_data["trend_score"]
        }
