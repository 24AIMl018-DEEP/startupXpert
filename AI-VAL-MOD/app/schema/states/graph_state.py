from typing import TypedDict, List, Dict, Annotated
from schema.startup_input import StartupInput


def _merge_list(a: List[Dict], b: List[Dict]) -> List[Dict]:
    return a + b


class GraphState(TypedDict):
    startup_data: StartupInput
    pitch: str
    indexed_chunks: int
    query_results: Annotated[List[Dict], _merge_list]
    analysis_results: Annotated[List[Dict], _merge_list]
