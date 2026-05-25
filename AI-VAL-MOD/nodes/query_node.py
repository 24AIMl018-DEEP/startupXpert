"""
query_node.py — Node: Search Query Generation
Rule: Nodes contain ZERO logic. Only read state → call service → write state.
"""
from services.query_generation_service import QueryGenerationService

_svc = QueryGenerationService()


def query_node(state: dict) -> dict:
    print("\n[3/8] Query Generation  (internet-native style)")
    result = _svc.run(
        state["structured_problem"],
        state.get("user_input", {}),
        genre=state.get("genre", "")
    )
    total = sum(len(v) for v in result.values())
    print(f"  → {total} search queries generated across 3 intents")
    for intent, queries in result.items():
        print(f"     [{intent[:8]}] e.g. '{queries[0]}'")
    trend_kw = state["structured_problem"].get("core_problem", state["problem"])[:50]
    return {
        "search_queries": result,
        "trend_keyword":  trend_kw
    }
