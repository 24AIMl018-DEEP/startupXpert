"""
compression_intelligence_node.py — Node: Signal Extraction + Aggregation + LLM Insight
Rule: Nodes contain ZERO logic. Only read state → call service → write state.

Per cluster per intent:
  1. Extract 8 signals from all posts
  2. Aggregate signals to cluster level
  3. Send ONLY structured JSON to LLM → 1-sentence insight
  4. Produce final structured intelligence
"""
from services.compression_intelligence_service import CompressionIntelligenceService

_svc = CompressionIntelligenceService()

_INTENT_MAP = {
    "problem":  ("problem_clusters",  "top_pains"),
    "behavior": ("behavior_clusters", "behavior_patterns"),
    "spending": ("spending_clusters", "spending_patterns")
}


def compression_intelligence_node(state: dict) -> dict:
    print("\n[7/8] Signal Extraction + Intelligence Compression")
    evidence   = state.get("evidence", {})
    compressed = {}

    for intent, (cluster_key, summary_key) in _INTENT_MAP.items():
        clustered = evidence.get(f"{intent}_clustered", [])
        print(f"  → [{intent}] Processing {len(clustered)} clusters...")

        enriched  = _svc.run(clustered, intent)

        # Store full enriched clusters
        compressed[cluster_key] = enriched

        # Store flat summaries
        compressed[summary_key] = [c["summary"] for c in enriched if c.get("summary")]

        for c in enriched[:2]:
            print(f"       [{intent}] '{c['summary'][:70]}...'")
            print(f"       urgency={c['urgency_count']} | workaround={c['workaround_count']} | "
                  f"spending={c['spending_count']} | sentiment={c['sentiment_label']}")

    return {"intelligence": {"compressed": compressed}}
