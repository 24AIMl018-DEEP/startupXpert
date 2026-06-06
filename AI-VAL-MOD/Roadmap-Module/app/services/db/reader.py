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
    try:
        db = _db()
        res = db.table("startup_input").select("*").eq("id", session_id).limit(1).execute()
        rows = res.data or []
        logger.info("[DBReader:startup_input] session_id=%s → %d row(s) returned", session_id, len(rows))
    except Exception as e:
        logger.error("[DBReader:startup_input] query failed for session_id=%s — %s", session_id, e)
        return None

    if not rows:
        logger.warning(
            "[DBReader:startup_input] No row found for session_id=%s. "
            "Check: (1) session exists in Supabase, (2) SUPABASE_URL + SERVICE_ROLE_KEY in .env are correct, "
            "(3) RLS is not blocking service role.",
            session_id,
        )
        return None

    raw = rows[0]
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


def get_roadmap_branches(session_id: str) -> List[Dict]:
    """Get all branches for a session."""
    return _select("roadmap_branches", lambda t:
        t.select("*").eq("session_id", session_id)
         .order("created_at", asc=True)
    )


def get_roadmap_tasks(branch_id: str) -> List[Dict]:
    """Get all tasks for a branch."""
    return _select("roadmap_tasks", lambda t:
        t.select("*").eq("branch_id", branch_id)
    )


def get_sessions_by_user(user_id: str) -> List[Dict]:
    """Fetch all startup_input rows for a given user, newest first."""
    return _select("startup_input", lambda t:
        t.select(
            "id, created_at, startup_name, startup_domain, current_startup_stage"
        ).eq("user_id", user_id).order("created_at", desc=True)
    )


def get_validated_sessions_by_user(user_id: str) -> List[Dict]:
    """Fetch startup sessions that have completed validation (pipeline_output row exists)."""
    # Fetch user sessions first, then cross-check pipeline_output
    sessions = get_sessions_by_user(user_id)
    if not sessions:
        return []
    session_ids = [s["id"] for s in sessions]

    validated_ids: set = set()
    try:
        res = _db().table("pipeline_output") \
            .select("session_id, aggregate_validation_score, status") \
            .in_("session_id", session_ids) \
            .execute()
        for row in (res.data or []):
            validated_ids.add(row["session_id"])
    except Exception as e:
        logger.error("[DBReader:pipeline_output] %s", e)

    result = []
    for s in sessions:
        s["is_validated"] = s["id"] in validated_ids
        result.append(s)
    return result
