from services.relevant_market_service import RelevantMarketService

service = RelevantMarketService()


def relevant_market_node(state: dict) -> dict:
    state.setdefault("intelligence", {})

    for intent in ["problem", "behavior", "spending"]:
        cleaned = state["evidence"].get(f"{intent}_cleaned", [])
        state["intelligence"][f"{intent}_market"] = service.analyze(cleaned)

    return state
