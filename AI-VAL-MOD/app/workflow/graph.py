import asyncio
import logging
from langgraph.graph import StateGraph, END

from schema.startup_input import StartupInput
from schema.states.graph_state import GraphState
from schema.states.pipeline_state import PipelineState
from schema.states.pitch_state import PitchState
from schema.states.query_state import QueryAgentResult, QueryPhaseState
from schema.states.analysis_state import AnalysisAgentResult, AnalysisPhaseState
from schema.states.recommendation_state import RecommendationState
from services.vector.store import vector_store
from services.db.db_service import (
    save_pitch_phase,
    save_query_phase,
    save_analysis_phase,
    save_pipeline_output,
)

logger = logging.getLogger(__name__)
# from agents.recommendation_agent import recommendation_agent

from workflow.nodes.pitch_node import pitch_node
from workflow.nodes.query_nodes import (
    market_node, competitor_node, founder_node,
    customer_node, trend_node, problem_node, technology_node,
)
from workflow.nodes.analysis_nodes import (
    feasibility_node, market_opportunity_node, competition_analysis_node,
    risk_analysis_node, innovation_usp_node,
)

# ── Query layer fan-out/fan-in ─────────────────────────────────────────────────
# LangGraph runs nodes listed in send() in parallel.
# We use a collector node to merge all query results after parallel execution.

QUERY_NODE_NAMES = [
    "market", "competitor", "founder",
    "customer", "trend", "problem", "technology",
]

ANALYSIS_NODE_NAMES = [
    "feasibility", "market_opportunity", "competition_analysis",
    "risk_analysis", "innovation_usp",
]


def query_collector_node(state: GraphState) -> dict:
    print(f"[Node:query_collector] All query agents done — {len(state.get('query_results', []))} results")
    return {}


def analysis_collector_node(state: GraphState) -> dict:
    print(f"[Node:analysis_collector] All analysis agents done — {len(state.get('analysis_results', []))} results")
    return {}


# ── Build graph ────────────────────────────────────────────────────────────────

def _build_graph():
    g = StateGraph(GraphState)

    # Phase 1
    g.add_node("pitch", pitch_node)

    # Phase 2 — query layer (parallel)
    g.add_node("market",      market_node)
    g.add_node("competitor",  competitor_node)
    g.add_node("founder",     founder_node)
    g.add_node("customer",    customer_node)
    g.add_node("trend",       trend_node)
    g.add_node("problem",     problem_node)
    g.add_node("technology",  technology_node)
    g.add_node("query_collector", query_collector_node)

    # Phase 3 — analysis layer (parallel)
    g.add_node("feasibility",          feasibility_node)
    g.add_node("market_opportunity",   market_opportunity_node)
    g.add_node("competition_analysis", competition_analysis_node)
    g.add_node("risk_analysis",        risk_analysis_node)
    g.add_node("innovation_usp",       innovation_usp_node)
    g.add_node("analysis_collector",   analysis_collector_node)

    # ── Edges ──────────────────────────────────────────────────────────────────

    # pitch → all query nodes (fan-out)
    g.set_entry_point("pitch")
    for name in QUERY_NODE_NAMES:
        g.add_edge("pitch", name)

    # all query nodes → collector (fan-in)
    for name in QUERY_NODE_NAMES:
        g.add_edge(name, "query_collector")

    # collector → all analysis nodes (fan-out)
    for name in ANALYSIS_NODE_NAMES:
        g.add_edge("query_collector", name)

    # all analysis nodes → collector (fan-in)
    for name in ANALYSIS_NODE_NAMES:
        g.add_edge(name, "analysis_collector")

    g.add_edge("analysis_collector", END)

    return g.compile()


_graph = _build_graph()


# ── Public entry point ─────────────────────────────────────────────────────────

async def run_pipeline(startup_data: StartupInput, session_id: str | None = None) -> PipelineState:
    print(f"\n{'='*60}\n[Pipeline] START — {startup_data.startup_name}\n{'='*60}")

    initial_state: GraphState = {
        "startup_data":     startup_data,
        "pitch":            "",
        "indexed_chunks":   0,
        "query_results":    [],
        "analysis_results": [],
    }

    final_state: GraphState = await _graph.ainvoke(initial_state)

    # ── Build typed phase states from final_state ──────────────────────────────

    pitch_state = PitchState(
        startup_name   = startup_data.startup_name,
        pitch_text     = final_state["pitch"],
        pitch_length   = len(final_state["pitch"]),
        indexed_chunks = final_state["indexed_chunks"],
    )

    # ── Phase 1 DB save ────────────────────────────────────────────────────────
    if session_id:
        save_pitch_phase(session_id, pitch_state)
        logger.info("[Pipeline] Phase 1 (pitch) saved to DB")

    qr = final_state.get("query_results", [])
    query_phase_state = QueryPhaseState(
        total_agents      = len(QUERY_NODE_NAMES),
        successful_agents = sum(1 for r in qr if r["status"] == "success"),
        failed_agents     = sum(1 for r in qr if r["status"] == "failed"),
        empty_agents      = sum(1 for r in qr if r["status"] == "empty"),
        agent_results     = [QueryAgentResult(
            agent_name         = r["agent"],
            queries_generated  = r.get("queries", []),
            results_collected  = r.get("hits", 0),
            indexed_count      = r.get("hits", 0),
            duplicates_dropped = 0,
            status             = r["status"],
        ) for r in qr],
        total_docs_indexed = vector_store.stats()["total_docs"],
    )

    # ── Phase 2 DB save ────────────────────────────────────────────────────────
    if session_id:
        save_query_phase(session_id, query_phase_state)
        logger.info("[Pipeline] Phase 2 (query) saved to DB")

    ar = final_state.get("analysis_results", [])
    scores = [r["score"] for r in ar if isinstance(r.get("score"), (int, float))]
    aggregate = round(sum(scores) / len(scores), 1) if scores else 0.0

    analysis_phase_state = AnalysisPhaseState(
        total_agents      = len(ANALYSIS_NODE_NAMES),
        successful_agents = sum(1 for r in ar if r.get("status") == "success"),
        failed_agents     = sum(1 for r in ar if r.get("status") != "success"),
        agent_results     = [AnalysisAgentResult(
            agent                        = r.get("agent", ""),
            score                        = r.get("score"),
            verdict                      = r.get("verdict"),
            status                       = r.get("status", "failed"),
            strengths                    = r.get("strengths"),
            weaknesses                   = r.get("weaknesses"),
            tam_signal                   = r.get("tam_signal"),
            demand_signals               = r.get("demand_signals"),
            timing_assessment            = r.get("timing_assessment"),
            key_competitors              = r.get("key_competitors"),
            competitive_gaps             = r.get("competitive_gaps"),
            differentiation_strength     = r.get("differentiation_strength"),
            critical_risks               = r.get("critical_risks"),
            overall_risk_level           = r.get("overall_risk_level"),
            usp_statement                = r.get("usp_statement"),
            innovation_factors           = r.get("innovation_factors"),
            defensibility                = r.get("defensibility"),
            differentiation_vs_competitors = r.get("differentiation_vs_competitors"),
            risks                        = r.get("risks"),
            recommendations              = r.get("recommendations"),
            summary                      = r.get("summary"),
        ) for r in ar],
        aggregate_score   = aggregate,
    )

    # ── Phase 3 DB save ────────────────────────────────────────────────────────
    if session_id:
        save_analysis_phase(session_id, analysis_phase_state)
        logger.info("[Pipeline] Phase 3 (analysis) saved to DB")

    print(f"\n{'='*60}\n[Pipeline] COMPLETE — score={aggregate}/100\n{'='*60}\n")

    pipeline_state = PipelineState(
        status                     = "success",
        startup_name               = startup_data.startup_name,
        pitch_state                = pitch_state,
        query_phase_state          = query_phase_state,
        analysis_phase_state       = analysis_phase_state,
        aggregate_validation_score = aggregate,
        final_vector_stats         = vector_store.stats(),
    )

    # ── Final pipeline output DB save ──────────────────────────────────────────
    if session_id:
        save_pipeline_output(session_id, pipeline_state)
        logger.info("[Pipeline] Final output saved to DB")

    return pipeline_state
