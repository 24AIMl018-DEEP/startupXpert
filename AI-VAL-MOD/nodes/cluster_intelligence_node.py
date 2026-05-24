from services.cluster_intelligence_service import ClusterIntelligenceService

service = ClusterIntelligenceService()


def cluster_intelligence_node(state: dict) -> dict:
    state.setdefault("intelligence", {})

    for intent in ["problem", "behavior", "spending"]:
        clustered = state["evidence"].get(f"{intent}_clustered", [])
        state["intelligence"][f"{intent}_cluster_intelligence"] = service.analyze(clustered)

    return state
