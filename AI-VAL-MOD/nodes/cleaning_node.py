from services.cleaning_service import CleaningService

service = CleaningService()


def cleaning_node(state: dict) -> dict:
    state.setdefault("evidence", {})

    for intent in ["problem", "behavior", "spending"]:
        raw = state["evidence"].get(intent, [])
        state["evidence"][f"{intent}_cleaned"] = service.run(
            problem=state["problem"],
            genre=state["genre"],
            raw_evidence=raw
        )

    return state
