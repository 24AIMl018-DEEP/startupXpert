"""
startup_graph.py — LangGraph Orchestration
───────────────────────────────────────────
Wires all 8 nodes into a linear StateGraph pipeline.

Pipeline order (matches the 7-step architecture):
  genre → structure → query → evidence → cleaning → clustering
       → compression_intelligence → founder_report

Rule: This file contains ZERO business logic.
      It only wires nodes and compiles the graph.
"""
from langgraph.graph import StateGraph, END
from states.startup_state import StartupState

from nodes.genre_node                      import genre_node
from nodes.structure_node                  import structure_node
from nodes.query_node                      import query_node
from nodes.evidence_node                   import evidence_node
from nodes.cleaning_node                   import cleaning_node
from nodes.clustering_node                 import clustering_node
from nodes.compression_intelligence_node   import compression_intelligence_node
from nodes.founder_report_node             import founder_report_node


def build_graph():
    """Construct and compile the startup validation pipeline graph."""
    graph = StateGraph(StartupState)

    # ── Add nodes ─────────────────────────────────────────────────────────────
    graph.add_node("structure",                structure_node)
    graph.add_node("genre",                    genre_node)
    graph.add_node("query",                    query_node)
    graph.add_node("evidence",                 evidence_node)
    graph.add_node("cleaning",                 cleaning_node)
    graph.add_node("clustering",               clustering_node)
    graph.add_node("compression_intelligence", compression_intelligence_node)
    graph.add_node("founder_report",           founder_report_node)

    # ── Wire edges ────────────────────────────────────────────────────────────
    # structure first → gives genre full context (core_problem, main_pain, environment)
    graph.set_entry_point("structure")
    graph.add_edge("structure",                "genre")
    graph.add_edge("genre",                    "query")
    graph.add_edge("query",                    "evidence")
    graph.add_edge("evidence",                 "cleaning")
    graph.add_edge("cleaning",                 "clustering")
    graph.add_edge("clustering",               "compression_intelligence")
    graph.add_edge("compression_intelligence", "founder_report")
    graph.add_edge("founder_report",           END)

    return graph.compile()
