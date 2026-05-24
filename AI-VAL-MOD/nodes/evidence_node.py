from services.evidence_service import EvidenceService

service = EvidenceService()


def evidence_node(state: dict) -> dict:
    result = service.run(
        search_queries=state["search_queries"],
        trend_keyword=state["structured_problem"]["core_problem"]
    )
    state.setdefault("evidence", {})
    state["evidence"]["raw"]      = result["raw_evidence"]
    state["evidence"]["problem"]  = result["problem_evidence"]
    state["evidence"]["behavior"] = result["behavior_evidence"]
    state["evidence"]["spending"] = result["spending_evidence"]
    state["trend_keyword"]        = result["trend_keyword"]
    state["trend_score"]          = result["trend_score"]
    return state
