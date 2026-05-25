"""
evidence_node.py — Node: Raw Data Collection
Rule: Nodes contain ZERO logic. Only read state → call service → write state.

Stores raw evidence per intent — exactly as described in the pipeline:
  {text, source, url, timestamp} stored in evidence dict
"""
from services.evidence_service import EvidenceService

_svc = EvidenceService()


def evidence_node(state: dict) -> dict:
    print("\n[4/8] Evidence Collection (Raw Internet Data)")
    result = _svc.run(
        state["search_queries"],
        state["trend_keyword"]
    )

    evidence = state.get("evidence", {})
    evidence.update({
        "problem":  result["problem_evidence"],
        "behavior": result["behavior_evidence"],
        "spending": result["spending_evidence"],
        "raw":      result["raw_evidence"]
    })

    total = len(result["raw_evidence"])
    print(f"  → Collected: {len(result['problem_evidence'])} problem + "
          f"{len(result['behavior_evidence'])} behavior + "
          f"{len(result['spending_evidence'])} spending = {total} total")

    return {
        "evidence":    evidence,
        "trend_score": result["trend_score"]
    }
