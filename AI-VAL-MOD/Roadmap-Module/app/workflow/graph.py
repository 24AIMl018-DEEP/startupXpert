from langgraph.graph import StateGraph, END
from typing import List

from schema.states.roadmap_state import RoadmapGraphState
from workflow.nodes.profiler_node import profiler_node
from workflow.nodes.branch_node import make_branch_node
from workflow.nodes.resource_node import resource_node
from workflow.nodes.sync_node import sync_node


def _collector_node(state: dict) -> dict:
    print(f"[Node:collector] {len(state.get('branch_results', []))} branches collected")
    return {}


def build_graph(branches: List[str]) -> StateGraph:
    """
    Build LangGraph at runtime with ONLY the branches profiler approved.
    Called once per pipeline run — branches are dynamic per startup.
    """
    g = StateGraph(RoadmapGraphState)

    g.add_node("profiler",  profiler_node)
    g.add_node("collector", _collector_node)
    g.add_node("resource",  resource_node)
    g.add_node("sync",      sync_node)

    for branch in branches:
        g.add_node(f"branch_{branch}", make_branch_node(branch))

    g.set_entry_point("profiler")
    for branch in branches:
        g.add_edge("profiler", f"branch_{branch}")
    for branch in branches:
        g.add_edge(f"branch_{branch}", "collector")

    g.add_edge("collector", "resource")
    g.add_edge("resource",  "sync")
    g.add_edge("sync",      END)

    return g.compile()
