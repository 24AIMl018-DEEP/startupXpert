from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Dict, Any

from nodes.genre_node                    import genre_node
from nodes.structure_node                import structure_node
from nodes.query_node                    import query_node
from nodes.evidence_node                 import evidence_node
from nodes.cleaning_node                 import cleaning_node
from nodes.clustering_node               import clustering_node
from nodes.compression_intelligence_node import compression_intelligence_node
from nodes.founder_intelligence_node     import founder_intelligence_node



# ── STATE ─────────────────────────────────────────────────

class PipelineState(TypedDict, total=False):
    problem:            str
    genre:              str
    top_genres:         list
    confidence_score:   float
    structured_problem: dict
    search_queries:     dict
    trend_keyword:      str
    trend_score:        float
    evidence:           Dict[str, Any]
    intelligence:       Dict[str, Any]
    reasoning:          Dict[str, Any]


# ── BUILD GRAPH ───────────────────────────────────────────

def build_graph():

    graph = StateGraph(PipelineState)

    graph.add_node("genre",                    genre_node)
    graph.add_node("structure",                structure_node)
    graph.add_node("query",                    query_node)
    graph.add_node("evidence",                 evidence_node)
    graph.add_node("cleaning",                 cleaning_node)
    graph.add_node("clustering",               clustering_node)
    graph.add_node("compression_intelligence", compression_intelligence_node)
    graph.add_node("founder_intelligence",     founder_intelligence_node)

    graph.add_edge(START,                      "genre")
    graph.add_edge("genre",                    "structure")
    graph.add_edge("structure",                "query")
    graph.add_edge("query",                    "evidence")
    graph.add_edge("evidence",                 "cleaning")
    graph.add_edge("cleaning",                 "clustering")
    graph.add_edge("clustering",               "compression_intelligence")
    graph.add_edge("compression_intelligence", "founder_intelligence")
    graph.add_edge("founder_intelligence",     END)

    return graph.compile()


# ── RUN ───────────────────────────────────────────────────

def run_pipeline(problem: str) -> dict:

    app = build_graph()

    state = {
        "problem":      problem,
        "evidence":     {},
        "intelligence": {},
        "reasoning":    {}
    }

    for step in app.stream(state, stream_mode="updates"):
        node_name = list(step.keys())[0]
        print(f"    [{node_name}] done")

    return app.invoke(state)
