from services.compression_service import CompressionService

service = CompressionService()


def clustering_node(state: dict) -> dict:
    state.setdefault("evidence", {})

    for intent in ["problem", "behavior", "spending"]:
        cleaned = state["evidence"].get(f"{intent}_cleaned", [])
        state["evidence"][f"{intent}_clustered"] = service.run(cleaned)

    return state
