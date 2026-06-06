from typing import Dict
from schema.states.graph_state import GraphState

from agents.analysis.feasibility_agent import feasibility_agent
from agents.analysis.market_opportunity_agent import market_opportunity_agent
from agents.analysis.competition_analysis_agent import competition_analysis_agent
from agents.analysis.risk_analysis_agent import risk_analysis_agent
from agents.analysis.innovation_usp_agent import innovation_usp_agent


def _make_analysis_node(agent):
    def node(state: GraphState) -> Dict:
        pitch = state["pitch"]
        data  = state["startup_data"].model_dump()
        print(f"[Node:{agent.name}] Running analysis...")
        try:
            result = agent.run(pitch, data)
            result["status"] = "parse_error" if result.get("parse_error") else "success"
            entry = result
        except Exception as e:
            print(f"[Node:{agent.name}] FAILED — {e}")
            entry = {"agent": agent.name, "status": "failed"}

        return {"analysis_results": [entry]}
    node.__name__ = f"{agent.name}_node"
    return node


feasibility_node          = _make_analysis_node(feasibility_agent)
market_opportunity_node   = _make_analysis_node(market_opportunity_agent)
competition_analysis_node = _make_analysis_node(competition_analysis_agent)
risk_analysis_node        = _make_analysis_node(risk_analysis_agent)
innovation_usp_node       = _make_analysis_node(innovation_usp_agent)
