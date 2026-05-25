"""
clustering_node.py — Node: HDBSCAN Clustering
Rule: Nodes contain ZERO logic. Only read state → call service → write state.

Runs CompressionService (HDBSCAN) per intent:
  cleaned evidence → vector space → clusters → representative texts
"""
from services.compression_service import CompressionService

_svc = CompressionService(min_cluster_size=3, min_samples=2)


def clustering_node(state: dict) -> dict:
    print("\n[6/8] Clustering (HDBSCAN — Vector Space Grouping)")
    evidence = state.get("evidence", {})

    for intent in ("problem", "behavior", "spending"):
        cleaned   = evidence.get(f"{intent}_cleaned", [])
        clustered = _svc.run(cleaned)
        evidence[f"{intent}_clustered"] = clustered
        print(f"  → [{intent}] {len(cleaned)} cleaned → {len(clustered)} clusters")
        for c in clustered[:3]:
            print(f"       Cluster {c['cluster_id']}: size={c['size']}  "
                  f"| '{c['representative_text'][:60]}...'")

    return {"evidence": evidence}
