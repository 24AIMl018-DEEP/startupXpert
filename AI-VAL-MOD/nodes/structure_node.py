"""
structure_node.py — Node: Problem Structuring
Rule: Nodes contain ZERO logic. Only read state → call service → write state.
"""
from services.problem_structuring_service import ProblemStructuringService

_svc = ProblemStructuringService()


def structure_node(state: dict) -> dict:
    print("\n[2/8] Problem Structuring")
    result = _svc.run(state.get("user_input", {"problem": state["problem"]}))
    print(f"  → Core: {result.get('core_problem', '')}")
    print(f"  → Pain: {result.get('main_pain', '')}")
    print(f"  → Users: {result.get('target_users', '')}")
    return {"structured_problem": result}
