from services.founder_intelligence_service import FounderIntelligenceService

service = FounderIntelligenceService()


def founder_intelligence_node(state: dict) -> dict:
    state.setdefault("reasoning", {})

    print("    [founder_intelligence] generating report...")

    state["reasoning"]["founder_report"] = service.analyze({
        "problem":            state.get("problem", ""),
        "structured_problem": state.get("structured_problem", {}),
        "intelligence":       state.get("intelligence", {}),
        "evidence":           state.get("evidence", {})
    })

    return state
