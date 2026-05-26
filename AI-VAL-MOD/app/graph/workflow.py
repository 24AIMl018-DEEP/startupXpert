from langgraph.graph import StateGraph, END
from app.graph.state import ValidatorState
from app.graph.Nodes.planner import generate_queries
from app.graph.Nodes.researcher import fetch_market_data
from app.graph.Nodes.decision_maker import evaluate_evidence
from app.graph.Nodes.filter import filter_noise
from app.graph.Nodes.synthesizer import synthesize_json

print("--- INITIALIZING LANGGRAPH WORKFLOW ---")

workflow = StateGraph(ValidatorState)

workflow.add_node("planner",        generate_queries)
workflow.add_node("researcher",     fetch_market_data)
workflow.add_node("decision_maker", evaluate_evidence)
workflow.add_node("filter",         filter_noise)
workflow.add_node("synthesizer",    synthesize_json)

workflow.set_entry_point("planner")
workflow.add_edge("planner",        "researcher")
workflow.add_edge("researcher",     "decision_maker")
workflow.add_edge("decision_maker", "filter")
workflow.add_edge("filter",         "synthesizer")
workflow.add_edge("synthesizer",    END)

app = workflow.compile()
