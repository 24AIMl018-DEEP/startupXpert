from services.query_generation_service import QueryGenerationService

service = QueryGenerationService()


def query_node(state: dict) -> dict:
    state["search_queries"] = service.run(state["structured_problem"])
    return state
