"""
cleaning_node.py — Node: Semantic Relevance Filtering (Mitti Removal)
Rule: Nodes contain ZERO logic. Only read state → call service → write state.

Runs CleaningService per intent:
  raw evidence → relevance filter → deduplicate → cleaned evidence
"""
from services.cleaning_service import CleaningService

_svc = CleaningService()


def cleaning_node(state: dict) -> dict:
    print("\n[5/8] Cleaning (Semantic Filter + Deduplication)")
    sp       = state["structured_problem"]
    evidence = state.get("evidence", {})

    for intent in ("problem", "behavior", "spending"):
        raw   = evidence.get(intent, [])
        clean = _svc.run(raw, sp)
        evidence[f"{intent}_cleaned"] = clean
        print(f"  → [{intent}] {len(raw)} raw → {len(clean)} cleaned")

    return {"evidence": evidence}
