from services.pain_reasoning_service import PainReasoningService

service = PainReasoningService()


def pain_reasoning_node(state: dict) -> dict:
    state.setdefault("intelligence", {})

    for intent in ["problem", "behavior", "spending"]:
        rv = state["intelligence"].get(f"{intent}_market", {})
        ci = state["intelligence"].get(f"{intent}_cluster_intelligence", {})

        state["intelligence"][f"{intent}_reasoning"] = service.run(
            extracted_pains  = rv.get("extracted_pains", []),
            pain_patterns    = rv.get("pain_patterns", []),
            cluster_strength = ci.get("cluster_strength", 0)
        )

    return state
