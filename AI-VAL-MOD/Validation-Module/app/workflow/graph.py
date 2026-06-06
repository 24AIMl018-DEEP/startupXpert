import asyncio
from langgraph.graph import StateGraph, END

from schema.startup_input import StartupInput
from schema.states.graph_state import GraphState
from schema.states.pipeline_state import PipelineState
from schema.states.pitch_state import PitchState
from schema.states.query_state import QueryAgentResult, QueryPhaseState
from schema.states.analysis_state import (
    AnalysisPhaseState, FeasibilityResult, MarketOpportunityResult,
    CompetitionResult, RiskResult, InnovationUSPResult, CriticalRisk,
)
from services.vector.store import vector_store
from services.db.db_service import (
    save_startup_input,
    save_pitch_phase,
    save_query_phase,
    save_analysis_phase,
    save_pipeline_output,
)

from workflow.nodes.pitch_node import pitch_node
from workflow.nodes.query_nodes import (
    market_node, competitor_node, founder_node,
    customer_node, trend_node, problem_node, technology_node,
)
from workflow.nodes.analysis_nodes import (
    feasibility_node, market_opportunity_node, competition_analysis_node,
    risk_analysis_node, innovation_usp_node,
)

QUERY_NODE_NAMES    = ["market", "competitor", "founder", "customer", "trend", "problem", "technology"]
ANALYSIS_NODE_NAMES = ["feasibility", "market_opportunity", "competition_analysis", "risk_analysis", "innovation_usp"]


def query_collector_node(state: GraphState) -> dict:
    print(f"[Node:query_collector] done — {len(state.get('query_results', []))} results")
    return {"query_results": state.get("query_results", [])}

def analysis_collector_node(state: GraphState) -> dict:
    print(f"[Node:analysis_collector] done — {len(state.get('analysis_results', []))} results")
    return {"analysis_results": state.get("analysis_results", [])}


def _build_graph():
    g = StateGraph(GraphState)
    g.add_node("pitch_step",       pitch_node)   # renamed: "pitch" conflicts with GraphState.pitch key
    g.add_node("market",           market_node)
    g.add_node("competitor",       competitor_node)
    g.add_node("founder",          founder_node)
    g.add_node("customer",         customer_node)
    g.add_node("trend",            trend_node)
    g.add_node("problem",          problem_node)
    g.add_node("technology",       technology_node)
    g.add_node("query_collector",  query_collector_node)
    g.add_node("feasibility",          feasibility_node)
    g.add_node("market_opportunity",   market_opportunity_node)
    g.add_node("competition_analysis", competition_analysis_node)
    g.add_node("risk_analysis",        risk_analysis_node)
    g.add_node("innovation_usp",       innovation_usp_node)
    g.add_node("analysis_collector",   analysis_collector_node)
    g.set_entry_point("pitch_step")
    for n in QUERY_NODE_NAMES:
        g.add_edge("pitch_step", n)
    for n in QUERY_NODE_NAMES:
        g.add_edge(n, "query_collector")
    for n in ANALYSIS_NODE_NAMES:
        g.add_edge("query_collector", n)
    for n in ANALYSIS_NODE_NAMES:
        g.add_edge(n, "analysis_collector")
    g.add_edge("analysis_collector", END)
    return g.compile()


_graph = _build_graph()


async def run_pipeline(startup_data: StartupInput) -> PipelineState:
    print(f"\n{'='*60}\n[Pipeline] START — {startup_data.startup_name}\n{'='*60}")

    # ── Phase 0: save startup_input, get session_id ────────────────────────────
    session_id = None
    try:
        session_id = save_startup_input(startup_data)
        print(f"[Pipeline] Phase 0 saved — session_id={session_id}")
    except Exception as e:
        print(f"[Pipeline] Phase 0 DB save failed (non-fatal) — {e}")

    # ── Run LangGraph ──────────────────────────────────────────────────────────
    final_state: GraphState = await _graph.ainvoke({
        "startup_data":     startup_data,
        "pitch":            "",
        "indexed_chunks":   0,
        "query_results":    [],
        "analysis_results": [],
    })

    # ── Phase 1: pitch ─────────────────────────────────────────────────────────
    pitch_state = PitchState(
        startup_name   = startup_data.startup_name,
        pitch_text     = final_state["pitch"],
        pitch_length   = len(final_state["pitch"]),
        indexed_chunks = final_state["indexed_chunks"],
    )
    if session_id:
        try:
            save_pitch_phase(session_id, pitch_state)
            print("[Pipeline] Phase 1 saved")
        except Exception as e:
            print(f"[Pipeline] Phase 1 DB save failed (non-fatal) — {e}")

    # ── Phase 2: query ─────────────────────────────────────────────────────────
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
    if session_id:
        try:
            save_query_phase(session_id, query_phase_state)
            print("[Pipeline] Phase 2 saved")
        except Exception as e:
            print(f"[Pipeline] Phase 2 DB save failed (non-fatal) — {e}")

    # ── Phase 3: analysis ──────────────────────────────────────────────────────
    ar = final_state.get("analysis_results", [])
    scores = [r["score"] for r in ar if isinstance(r.get("score"), (int, float))]
    aggregate = round(sum(scores) / len(scores), 1) if scores else 0.0

    def _get(name: str) -> dict:
        return next((r for r in ar if r.get("agent") == name), {})

    def _score(r: dict):
        try: return float(r["score"]) if r.get("score") is not None else None
        except: return None

    def _risks(r: dict):
        raw = r.get("critical_risks")
        if not raw: return None
        return [
            CriticalRisk(
                risk=i.get("risk", ""),
                severity=i.get("severity", "Medium"),
                mitigation=i.get("mitigation", ""),
            )
            for i in raw if isinstance(i, dict)
        ] or None

    fe  = _get("feasibility_analysis")
    mo  = _get("market_opportunity")
    co  = _get("competition_analysis")
    ri  = _get("risk_analysis")
    inn = _get("innovation_usp")

    analysis_phase_state = AnalysisPhaseState(
        total_agents      = len(ANALYSIS_NODE_NAMES),
        successful_agents = sum(1 for r in ar if r.get("status") == "success"),
        failed_agents     = sum(1 for r in ar if r.get("status") != "success"),
        aggregate_score   = aggregate,
        feasibility = FeasibilityResult(
            score=_score(fe), verdict=fe.get("verdict"), status=fe.get("status", "failed"),
            strengths=fe.get("strengths"), weaknesses=fe.get("weaknesses"),
            recommendations=fe.get("recommendations"), summary=fe.get("summary"),
        ),
        market_opportunity = MarketOpportunityResult(
            score=_score(mo), verdict=mo.get("verdict"), status=mo.get("status", "failed"),
            tam_signal=mo.get("tam_signal"), demand_signals=mo.get("demand_signals"),
            timing_assessment=mo.get("timing_assessment"), risks=mo.get("risks"),
            recommendations=mo.get("recommendations"), summary=mo.get("summary"),
        ),
        competition = CompetitionResult(
            score=_score(co), verdict=co.get("verdict"), status=co.get("status", "failed"),
            key_competitors=co.get("key_competitors"), competitive_gaps=co.get("competitive_gaps"),
            differentiation_strength=co.get("differentiation_strength"), risks=co.get("risks"),
            recommendations=co.get("recommendations"), summary=co.get("summary"),
        ),
        risk = RiskResult(
            score=_score(ri), verdict=ri.get("verdict"), status=ri.get("status", "failed"),
            critical_risks=_risks(ri), overall_risk_level=ri.get("overall_risk_level"),
            recommendations=ri.get("recommendations"), summary=ri.get("summary"),
        ),
        innovation_usp = InnovationUSPResult(
            score=_score(inn), verdict=inn.get("verdict"), status=inn.get("status", "failed"),
            usp_statement=inn.get("usp_statement"), innovation_factors=inn.get("innovation_factors"),
            defensibility=inn.get("defensibility"),
            differentiation_vs_competitors=inn.get("differentiation_vs_competitors"),
            recommendations=inn.get("recommendations"), summary=inn.get("summary"),
        ),
    )
    if session_id:
        try:
            save_analysis_phase(session_id, analysis_phase_state)
            print("[Pipeline] Phase 3 saved")
        except Exception as e:
            print(f"[Pipeline] Phase 3 DB save failed (non-fatal) — {e}")

    print(f"\n{'='*60}\n[Pipeline] COMPLETE — score={aggregate}/100\n{'='*60}\n")

    pipeline_state = PipelineState(
        session_id                 = session_id,
        status                     = "success",
        startup_name               = startup_data.startup_name,
        pitch_state                = pitch_state,
        query_phase_state          = query_phase_state,
        analysis_phase_state       = analysis_phase_state,
        aggregate_validation_score = aggregate,
        final_vector_stats         = vector_store.stats(),
    )

    if session_id:
        try:
            save_pipeline_output(session_id, pipeline_state)
            print(f"[Pipeline] Final output saved — session_id={session_id}")
        except Exception as e:
            print(f"[Pipeline] Final DB save failed (non-fatal) — {e}")

    return pipeline_state
