"""
DB Service — saves pipeline phases to Supabase one by one as they complete.
Does NOT store startup_input (handled by UI).
Validates data before every insert.
"""

import logging
from typing import Optional
from postgrest.exceptions import APIError

from schema.states.pitch_state import PitchState
from schema.states.query_state import QueryPhaseState
from schema.states.analysis_state import AnalysisPhaseState
from schema.states.pipeline_state import PipelineState
from services.db.supabase_client import get_supabase

logger = logging.getLogger(__name__)


# ── helpers ────────────────────────────────────────────────────────────────────

def _safe_float(val) -> Optional[float]:
    try:
        return round(float(val), 2) if val is not None else None
    except (TypeError, ValueError):
        return None


def _safe_str(val, max_len: int = 5000) -> Optional[str]:
    if val is None:
        return None
    return str(val)[:max_len].strip() or None


def _safe_list(val) -> list:
    if isinstance(val, list):
        return [str(i) for i in val if i is not None]
    return []


def _insert(table: str, payload: dict) -> Optional[dict]:
    """Insert into Supabase, return inserted row or None on failure."""
    try:
        res = get_supabase().table(table).insert(payload).execute()
        if res.data:
            return res.data[0]
        logger.error("[DB:%s] insert returned no data — payload=%s", table, payload)
        return None
    except APIError as e:
        logger.error("[DB:%s] APIError — %s", table, e.message)
        return None
    except Exception as e:
        logger.error("[DB:%s] Unexpected error — %s", table, str(e))
        return None


# ── Phase 1: Pitch ─────────────────────────────────────────────────────────────

def save_pitch_phase(session_id: str, state: PitchState) -> Optional[str]:
    """
    Called right after pitch_node completes.
    Returns pitch_phase row id or None.
    """
    if not session_id:
        logger.warning("[DB:pitch_phase] Missing session_id — skipping")
        return None

    if not state.pitch_text or len(state.pitch_text.strip()) < 10:
        logger.warning("[DB:pitch_phase] pitch_text too short or empty — skipping")
        return None

    payload = {
        "session_id":     session_id,
        "startup_name":   _safe_str(state.startup_name, 200),
        "pitch_text":     _safe_str(state.pitch_text, 10000),
        "pitch_length":   max(0, int(state.pitch_length or 0)),
        "indexed_chunks": max(0, int(state.indexed_chunks or 0)),
    }

    row = _insert("pitch_phase", payload)
    if row:
        logger.info("[DB:pitch_phase] Saved — id=%s", row.get("id"))
        return row.get("id")
    return None


# ── Phase 2: Query ─────────────────────────────────────────────────────────────

def save_query_phase(session_id: str, state: QueryPhaseState) -> Optional[str]:
    """
    Called right after query_collector_node completes.
    Saves summary + per-agent rows. Returns query_phase row id or None.
    """
    if not session_id:
        logger.warning("[DB:query_phase] Missing session_id — skipping")
        return None

    summary_payload = {
        "session_id":        session_id,
        "total_agents":      max(0, int(state.total_agents or 0)),
        "successful_agents": max(0, int(state.successful_agents or 0)),
        "failed_agents":     max(0, int(state.failed_agents or 0)),
        "empty_agents":      max(0, int(state.empty_agents or 0)),
        "total_docs_indexed": max(0, int(state.total_docs_indexed or 0)),
    }

    row = _insert("query_phase", summary_payload)
    if not row:
        return None

    phase_id = row.get("id")
    logger.info("[DB:query_phase] Summary saved — id=%s", phase_id)

    for agent in (state.agent_results or []):
        if not agent.agent_name:
            continue
        agent_payload = {
            "query_phase_id":      phase_id,
            "agent_name":          _safe_str(agent.agent_name, 100),
            "queries_generated":   _safe_list(agent.queries_generated),
            "results_collected":   max(0, int(agent.results_collected or 0)),
            "indexed_count":       max(0, int(agent.indexed_count or 0)),
            "duplicates_dropped":  max(0, int(agent.duplicates_dropped or 0)),
            "status":              _safe_str(agent.status, 20),
        }
        _insert("query_agent_results", agent_payload)

    logger.info("[DB:query_agent_results] Saved %d agent rows", len(state.agent_results or []))
    return phase_id


# ── Phase 3: Analysis ──────────────────────────────────────────────────────────

def save_analysis_phase(session_id: str, state: AnalysisPhaseState) -> Optional[str]:
    """
    Called right after analysis_collector_node completes.
    Saves summary + per-agent rows + critical_risks. Returns analysis_phase row id or None.
    """
    if not session_id:
        logger.warning("[DB:analysis_phase] Missing session_id — skipping")
        return None

    score = _safe_float(state.aggregate_score)
    if score is None or not (0.0 <= score <= 100.0):
        logger.warning("[DB:analysis_phase] Invalid aggregate_score=%s — clamping", score)
        score = max(0.0, min(100.0, score or 0.0))

    summary_payload = {
        "session_id":        session_id,
        "total_agents":      max(0, int(state.total_agents or 0)),
        "successful_agents": max(0, int(state.successful_agents or 0)),
        "failed_agents":     max(0, int(state.failed_agents or 0)),
        "aggregate_score":   score,
    }

    row = _insert("analysis_phase", summary_payload)
    if not row:
        return None

    phase_id = row.get("id")
    logger.info("[DB:analysis_phase] Summary saved — id=%s score=%s", phase_id, score)

    for agent in (state.agent_results or []):
        if not agent.agent:
            continue

        agent_score = _safe_float(agent.score)
        if agent_score is not None and not (0.0 <= agent_score <= 100.0):
            agent_score = max(0.0, min(100.0, agent_score))

        agent_payload = {
            "analysis_phase_id":               phase_id,
            "agent":                            _safe_str(agent.agent, 100),
            "score":                            agent_score,
            "verdict":                          _safe_str(agent.verdict, 200),
            "status":                           _safe_str(agent.status, 20),
            "summary":                          _safe_str(agent.summary),
            "strengths":                        _safe_list(agent.strengths),
            "weaknesses":                       _safe_list(agent.weaknesses),
            "tam_signal":                       _safe_str(agent.tam_signal),
            "demand_signals":                   _safe_list(agent.demand_signals),
            "timing_assessment":                _safe_str(agent.timing_assessment),
            "key_competitors":                  _safe_list(agent.key_competitors),
            "competitive_gaps":                 _safe_list(agent.competitive_gaps),
            "differentiation_strength":         _safe_str(agent.differentiation_strength),
            "overall_risk_level":               _safe_str(agent.overall_risk_level, 20),
            "usp_statement":                    _safe_str(agent.usp_statement),
            "innovation_factors":               _safe_list(agent.innovation_factors),
            "defensibility":                    _safe_str(agent.defensibility),
            "differentiation_vs_competitors":   _safe_list(agent.differentiation_vs_competitors),
            "risks":                            _safe_list(agent.risks),
            "recommendations":                  _safe_list(agent.recommendations),
        }

        agent_row = _insert("analysis_agent_results", agent_payload)

        # save critical_risks sub-table
        if agent_row and agent.critical_risks:
            agent_result_id = agent_row.get("id")
            for cr in agent.critical_risks:
                if not cr.risk:
                    continue
                severity = _safe_str(cr.severity, 20)
                if severity and severity.lower() not in ("low", "medium", "high", "critical"):
                    severity = "medium"
                _insert("critical_risks", {
                    "analysis_agent_result_id": agent_result_id,
                    "risk":       _safe_str(cr.risk),
                    "severity":   severity,
                    "mitigation": _safe_str(cr.mitigation),
                })

    logger.info("[DB:analysis_agent_results] Saved %d agent rows", len(state.agent_results or []))
    return phase_id


# ── Final: Pipeline Output ─────────────────────────────────────────────────────

def save_pipeline_output(session_id: str, state: PipelineState) -> Optional[str]:
    """
    Called after the full pipeline completes.
    Returns pipeline_output row id or None.
    """
    if not session_id:
        logger.warning("[DB:pipeline_output] Missing session_id — skipping")
        return None

    score = _safe_float(state.aggregate_validation_score)
    score = max(0.0, min(100.0, score or 0.0))

    vector_stats = state.final_vector_stats or {}
    total_docs   = int(vector_stats.get("total_docs", 0))

    payload = {
        "session_id":                session_id,
        "status":                    _safe_str(state.status, 50),
        "aggregate_validation_score": score,
        "total_docs_in_vector_store": max(0, total_docs),
    }

    row = _insert("pipeline_output", payload)
    if row:
        logger.info("[DB:pipeline_output] Saved — id=%s score=%s", row.get("id"), score)
        return row.get("id")
    return None
