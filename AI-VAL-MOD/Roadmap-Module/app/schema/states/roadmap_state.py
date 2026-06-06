from typing import TypedDict, List, Dict, Annotated, Optional


def _merge_list(a: List[Dict], b: List[Dict]) -> List[Dict]:
    return a + b


class RoadmapGraphState(TypedDict):
    session_id: str                                        # from validation pipeline_output
    startup_data: Dict                                     # raw startup_input fields
    team_members: List[Dict]                               # [{name, role, skills}] from request
    validation_context: Dict                               # scores + verdicts from validation module
    profiler_output: Dict                                  # Module 1 output (master JSON)
    branch_results: Annotated[List[Dict], _merge_list]    # Module 2 per-branch roadmaps
    enriched_tasks: List[Dict]                             # Module 3 resource-allocated tasks
    synced_tasks: List[Dict]                               # Module 4 dependency-linked tasks
