from services.raw_market_service import RawMarketService

service = RawMarketService()


def raw_market_node(state: dict) -> dict:
    state.setdefault("intelligence", {})

    for intent in ["problem", "behavior", "spending"]:
        raw = state["evidence"].get(intent, [])
        state["intelligence"][f"{intent}_raw_market"] = service.analyze(raw)

    return state
