from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Dict, Any


class PipelineState(TypedDict, total=False):
    problem:            str
    genre:              str
    top_genres:         list
    confidence_score:   float
    structured_problem: dict
    search_queries:     list
    trend_keyword:      str
    trend_score:        float
    evidence:           Dict[str, Any]
    intelligence:       Dict[str, Any]


# dummy nodes — just for visualization
def genre_node(s):               return s
def structure_node(s):           return s
def query_node(s):               return s
def evidence_node(s):            return s
def cleaning_node(s):            return s
def clustering_node(s):          return s
def raw_market_node(s):          return s
def relevant_market_node(s):     return s
def cluster_intelligence_node(s):return s


graph = StateGraph(PipelineState)

graph.add_node("genre",                genre_node)
graph.add_node("structure",            structure_node)
graph.add_node("query",                query_node)
graph.add_node("evidence",             evidence_node)
graph.add_node("cleaning",             cleaning_node)
graph.add_node("clustering",           clustering_node)
graph.add_node("raw_market",           raw_market_node)
graph.add_node("relevant_market",      relevant_market_node)
graph.add_node("cluster_intelligence", cluster_intelligence_node)

graph.add_edge(START,                  "genre")
graph.add_edge("genre",                "structure")
graph.add_edge("structure",            "query")
graph.add_edge("query",                "evidence")
graph.add_edge("evidence",             "cleaning")
graph.add_edge("cleaning",             "clustering")
graph.add_edge("clustering",           "raw_market")
graph.add_edge("raw_market",           "relevant_market")
graph.add_edge("relevant_market",      "cluster_intelligence")
graph.add_edge("cluster_intelligence", END)

app = graph.compile()

image_bytes = app.get_graph().draw_mermaid_png()

with open("pipeline_graph.png", "wb") as f:
    f.write(image_bytes)

print("Graph image saved: pipeline_graph.png")
