"""
Central DB Reader — all SELECT operations for Roadmap Module.
"""
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


def _db():
    from shared.db.supabase_client import get_supabase
    return get_supabase()


def _select(table: str, query_fn) -> list:
    try:
        return query_fn(_db().table(table)).execute().data or []
    except Exception as e:
        logger.error("[DBReader:%s] %s", table, e)
        return []


# ── startup_input ──────────────────────────────────────────────────────────────

def get_startup_input(session_id: str) -> Optional[Dict]:
    rows = _select("startup_input", lambda t:
        t.select("*").eq("id", session_id).limit(1)
    )
    if not rows:
        return None
    raw = rows[0]
    # jsonb fields come back as list from Supabase — keep as-is for StartupInput
    # (StartupInput expects List[str] for platform_type and founder_skillset)
    raw["platform_type"]    = raw.get("platform_type")    or []
    raw["founder_skillset"] = raw.get("founder_skillset") or []
    return raw


# ── validation module reads ────────────────────────────────────────────────────

def get_pipeline_output(session_id: str) -> Optional[Dict]:
    rows = _select("pipeline_output", lambda t:
        t.select("aggregate_validation_score, status")
         .eq("session_id", session_id)
         .order("created_at", desc=True).limit(1)
    )
    return rows[0] if rows else None


def get_analysis_phase(session_id: str) -> Optional[Dict]:
    rows = _select("analysis_phase", lambda t:
        t.select("id, aggregate_score")
         .eq("session_id", session_id)
         .order("created_at", desc=True).limit(1)
    )
    return rows[0] if rows else None


def get_analysis_agent_results(phase_id: str) -> List[Dict]:
    return _select("analysis_agent_results", lambda t:
        t.select(
            "agent, score, verdict, summary,"
            "strengths, weaknesses, recommendations, risks,"
            "tam_signal, demand_signals, timing_assessment,"
            "key_competitors, competitive_gaps, differentiation_strength,"
            "overall_risk_level, usp_statement, innovation_factors,"
            "defensibility, differentiation_vs_competitors"
        ).eq("analysis_phase_id", phase_id)
    )


# ── roadmap module reads ───────────────────────────────────────────────────────

def get_roadmap_profiler(session_id: str) -> Optional[Dict]:
    rows = _select("roadmap_profiler", lambda t:
        t.select("*").eq("session_id", session_id)
         .order("created_at", desc=True).limit(1)
    )
    return rows[0] if rows else None
