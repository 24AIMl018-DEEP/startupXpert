from services.final_summary_service import FinalSummaryService

service = FinalSummaryService()


def final_summary_node(state: dict) -> dict:
    state.setdefault("reasoning", {})

    state["reasoning"]["final_summary"] = service.run({
        "structured_problem": state.get("structured_problem", {}),
        "genre":              state.get("genre", ""),
        "confidence_score":   state.get("confidence_score", 0),
        "trend_score":        state.get("trend_score", 0),
        "intelligence":       state.get("intelligence", {})
    })

    return state
