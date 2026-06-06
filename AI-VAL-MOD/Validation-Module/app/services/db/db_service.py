"""
DB Service — phase-by-phase saves to Supabase.

Tables (exact schema):
  startup_input          → session root
  pitch_phase            → phase 1
  query_phase            → phase 2 summary
  query_agent_results    → phase 2 per-agent
  analysis_phase         → phase 3 summary
  analysis_agent_results → phase 3 per-agent
  critical_risks         → phase 3 risk detail
  pipeline_output        → phase 4 final
"""

import logging
from typing import Optional
from postgrest.exceptions import APIError

from schema.startup_input import StartupInput
from schema.states.pitch_state import PitchState
from schema.states.query_state import QueryPhaseState
from schema.states.analysis_state import (
    AnalysisPhaseState, RiskResult,
)
from schema.states.pipeline_state import PipelineState
from shared.db.supabase_client import get_supabase

logger = logging.getLogger(__name__)


# ── helpers ────────────────────────────────────────────────────────────────────

def _sf(val, max_len: int = 5000) -> Optional[str]:
    if val is None:
        return None
    return str(val)[:max_len].strip() or None

def _sl(val) -> list:
    return [str(i) for i in val if i is not None] if isinstance(val, list) else []

def _ff(val) -> Optional[float]:
    try:
        return round(float(val), 2) if val is not None else None
    except (TypeError, ValueError):
        return None

def _insert(table: str, payload: dict) -> Optional[dict]:
    try:
        res = get_supabase().table(table).insert(payload).execute()
        if res.data:
            return res.data[0]
        logger.error("[DB:%s] insert returned no data", table)
        return None
    except APIError as e:
        logger.error("[DB:%s] APIError — %s", table, e.message)
        return None
    except Exception as e:
        logger.error("[DB:%s] Error — %s", table, str(e))
        return None


# ── Phase 0: startup_input ─────────────────────────────────────────────────────

def save_startup_input(data: StartupInput) -> Optional[str]:
    """Insert startup_input row. Returns session_id (uuid)."""
    payload = {
        "user_id":                      _sf(data.user_id, 36) if data.user_id else None,
        "full_name":                    _sf(data.full_name, 200),
        "age":                          data.age,
        "gender":                       _sf(data.gender, 50),
        "city":                         _sf(data.city, 100),
        "country":                      _sf(data.country, 100),
        "profession":                   _sf(data.profession, 200),
        "industry_experience":          _sf(data.industry_experience),
        "founder_count":                data.founder_count,
        "founder_skillset":             _sl(data.founder_skillset),
        "startup_name":                 _sf(data.startup_name, 200),
        "startup_domain":               _sf(data.startup_domain, 200),
        "problem_statement":            _sf(data.problem_statement),
        "startup_description":          _sf(data.startup_description),
        "target_audience":              _sf(data.target_audience),
        "geographic_market":            _sf(data.geographic_market, 200),
        "existing_competitors":         _sf(data.existing_competitors),
        "revenue_model":                _sf(data.revenue_model),
        "estimated_pricing":            _sf(data.estimated_pricing, 200),
        "available_funding":            _sf(data.available_funding, 200),
        "monthly_burn_capacity":        _sf(data.monthly_burn_capacity, 200),
        "platform_type":                _sl(data.platform_type),
        "technology_complexity":        _sf(data.technology_complexity, 100),
        "mvp_timeline":                 _sf(data.mvp_timeline, 100),
        "scalability_goal":             _sf(data.scalability_goal),
        "customer_acquisition_strategy": _sf(data.customer_acquisition_strategy),
        "current_startup_stage":        _sf(data.current_startup_stage, 100),
    }
    row = _insert("startup_input", payload)
    if row:
        logger.info("[DB:startup_input] saved — session_id=%s user_id=%s", row["id"], data.user_id)
        return row["id"]
    return None


# ── Phase 1: pitch_phase ───────────────────────────────────────────────────────

def save_pitch_phase(session_id: str, state: PitchState) -> Optional[str]:
    """Insert pitch_phase row. Returns pitch_phase id."""
    payload = {
        "session_id":     session_id,
        "startup_name":   _sf(state.startup_name, 200),
        "pitch_text":     _sf(state.pitch_text, 20000),
        "pitch_length":   max(0, state.pitch_length or 0),
        "indexed_chunks": max(0, state.indexed_chunks or 0),
    }
    row = _insert("pitch_phase", payload)
    if row:
        logger.info("[DB:pitch_phase] saved — id=%s", row["id"])
        return row["id"]
    return None


# ── Phase 2: query_phase + query_agent_results ────────────────────────────────

def save_query_phase(session_id: str, state: QueryPhaseState) -> Optional[str]:
    """Insert query_phase summary + per-agent rows. Returns query_phase id."""
    summary = {
        "session_id":        session_id,
        "total_agents":      state.total_agents,
        "successful_agents": state.successful_agents,
        "failed_agents":     state.failed_agents,
        "empty_agents":      state.empty_agents,
        "total_docs_indexed": state.total_docs_indexed,
    }
    row = _insert("query_phase", summary)
    if not row:
        return None

    phase_id = row["id"]
    logger.info("[DB:query_phase] saved — id=%s", phase_id)

    for a in (state.agent_results or []):
        _insert("query_agent_results", {
            "query_phase_id":    phase_id,
            "agent_name":        _sf(a.agent_name, 100),
            "queries_generated": _sl(a.queries_generated),
            "results_collected": max(0, a.results_collected or 0),
            "indexed_count":     max(0, a.indexed_count or 0),
            "duplicates_dropped": max(0, a.duplicates_dropped or 0),
            "status":            _sf(a.status, 20),
        })

    logger.info("[DB:query_agent_results] saved %d rows", len(state.agent_results or []))
    return phase_id


# ── Phase 3: analysis_phase + analysis_agent_results + critical_risks ─────────

def save_analysis_phase(session_id: str, state: AnalysisPhaseState) -> Optional[str]:
    """Insert analysis_phase summary + per-agent rows + critical_risks. Returns analysis_phase id."""
    summary = {
        "session_id":        session_id,
        "total_agents":      state.total_agents,
        "successful_agents": state.successful_agents,
        "failed_agents":     state.failed_agents,
        "aggregate_score":   _ff(state.aggregate_score),
    }
    row = _insert("analysis_phase", summary)
    if not row:
        return None

    phase_id = row["id"]
    logger.info("[DB:analysis_phase] saved — id=%s", phase_id)

    agents = [
        ("feasibility_analysis", state.feasibility,      {}),
        ("market_opportunity",   state.market_opportunity, {}),
        ("competition_analysis", state.competition,       {}),
        ("risk_analysis",        state.risk,              {}),
        ("innovation_usp",       state.innovation_usp,    {}),
    ]

    for agent_name, r, _ in agents:
        payload = {
            "analysis_phase_id":  phase_id,
            "agent":              agent_name,
            "score":              _ff(r.score),
            "verdict":            _sf(r.verdict, 200),
            "status":             _sf(r.status, 20),
            "summary":            _sf(r.summary),
            "recommendations":    _sl(r.recommendations),
            # feasibility
            "strengths":          _sl(getattr(r, "strengths", None)),
            "weaknesses":         _sl(getattr(r, "weaknesses", None)),
            # market_opportunity
            "tam_signal":         _sf(getattr(r, "tam_signal", None)),
            "demand_signals":     _sl(getattr(r, "demand_signals", None)),
            "timing_assessment":  _sf(getattr(r, "timing_assessment", None)),
            # shared risks list
            "risks":              _sl(getattr(r, "risks", None)),
            # competition
            "key_competitors":    _sl(getattr(r, "key_competitors", None)),
            "competitive_gaps":   _sl(getattr(r, "competitive_gaps", None)),
            "differentiation_strength": _sf(getattr(r, "differentiation_strength", None)),
            # risk
            "overall_risk_level": _sf(getattr(r, "overall_risk_level", None), 20),
            # innovation_usp
            "usp_statement":      _sf(getattr(r, "usp_statement", None)),
            "innovation_factors": _sl(getattr(r, "innovation_factors", None)),
            "defensibility":      _sf(getattr(r, "defensibility", None)),
            "differentiation_vs_competitors": _sl(getattr(r, "differentiation_vs_competitors", None)),
        }

        agent_row = _insert("analysis_agent_results", payload)

        # critical_risks sub-table (only for risk_analysis)
        if agent_row and agent_name == "risk_analysis":
            agent_result_id = agent_row["id"]
            for cr in (r.critical_risks or []):
                sev = _sf(cr.severity, 20)
                if sev and sev.lower() not in ("low", "medium", "high", "critical"):
                    sev = "medium"
                _insert("critical_risks", {
                    "analysis_agent_result_id": agent_result_id,
                    "risk":       _sf(cr.risk),
                    "severity":   sev,
                    "mitigation": _sf(cr.mitigation),
                })

    logger.info("[DB:analysis_agent_results] saved 5 rows for phase_id=%s", phase_id)
    return phase_id


# ── Phase 4: pipeline_output ───────────────────────────────────────────────────

def save_pipeline_output(session_id: str, state: PipelineState) -> Optional[str]:
    """Insert pipeline_output row. Returns pipeline_output id."""
    payload = {
        "session_id":                 session_id,
        "status":                     _sf(state.status, 50),
        "aggregate_validation_score": _ff(state.aggregate_validation_score),
        "total_docs_in_vector_store": int((state.final_vector_stats or {}).get("total_docs", 0)),
    }
    row = _insert("pipeline_output", payload)
    if row:
        logger.info("[DB:pipeline_output] saved — id=%s", row["id"])
        return row["id"]
    return None
