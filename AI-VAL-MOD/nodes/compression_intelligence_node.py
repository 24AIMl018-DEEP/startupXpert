from services.compression_intelligence_service import CompressionIntelligenceService

service = CompressionIntelligenceService()


def compression_intelligence_node(state: dict) -> dict:
    state.setdefault("intelligence", {})

    state["intelligence"]["compressed"] = service.compress(
        state["evidence"]
    )

    return state
