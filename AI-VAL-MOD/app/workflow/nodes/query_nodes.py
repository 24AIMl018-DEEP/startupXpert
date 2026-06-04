from typing import Dict
from schema.states.graph_state import GraphState
from services.vector.indexer import index_agent_results

from agents.query_agents.market_agent import market_agent
from agents.query_agents.competitor_agent import competitor_agent
from agents.query_agents.founder_agent import founder_agent
from agents.query_agents.customer_agent import customer_agent
from agents.query_agents.trend_agent import trend_agent
from agents.query_agents.problem_agent import problem_agent
from agents.query_agents.technology_agent import technology_agent


def _make_query_node(agent):
    async def node(state: GraphState) -> Dict:
        pitch = state["pitch"]
        data  = state["startup_data"].model_dump()
        print(f"[Node:{agent.name}] Running...")
        try:
            result  = await agent.run(pitch, data)
            queries = result.get("queries", [])
            hits    = result.get("results", [])
            print(f"[Node:{agent.name}] queries={queries}")
            if hits:
                stats = index_agent_results(agent.name, data["startup_name"], hits)
                print(f"[Node:{agent.name}] indexed={stats['added']} dupes={stats['skipped_duplicates']}")
            else:
                print(f"[Node:{agent.name}] 0 results")
            entry = {"agent": agent.name, "queries": queries, "hits": len(hits), "status": "success" if hits else "empty"}
        except Exception as e:
            print(f"[Node:{agent.name}] FAILED — {e}")
            entry = {"agent": agent.name, "queries": [], "hits": 0, "status": "failed"}

        return {"query_results": [entry]}
    node.__name__ = f"{agent.name}_node"
    return node


market_node      = _make_query_node(market_agent)
competitor_node  = _make_query_node(competitor_agent)
founder_node     = _make_query_node(founder_agent)
customer_node    = _make_query_node(customer_agent)
trend_node       = _make_query_node(trend_agent)
problem_node     = _make_query_node(problem_agent)
technology_node  = _make_query_node(technology_agent)
