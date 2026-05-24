from services.problem_structuring_service import ProblemStructuringService

service = ProblemStructuringService()


def structure_node(state: dict) -> dict:
    state["structured_problem"] = service.run(state["problem"])
    return state
