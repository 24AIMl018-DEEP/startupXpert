"""
Central DB Writer — all INSERT/UPDATE operations go through here.
Agents and pipeline call this, never supabase directly.
"""
import logging
from typing import Optional, Dict, List

logger = logging.getLogger(__name__)


def _insert(table: str, payload: dict) -> Optional[Dict]:
    try:
        from postgrest.exceptions import APIError
        from shared.db.supabase_client import get_supabase
        res = get_supabase().table(table).insert(payload).execute()
        if res.data:
            return res.data[0]
        logger.error("[DBWriter:%s] insert returned no data", table)
        return None
    except Exception as e:
        logger.error("[DBWriter:%s] Error — %s", table, e)
        return None


def _update(table: str, row_id: str, payload: dict) -> Optional[Dict]:
    try:
        from shared.db.supabase_client import get_supabase
        res = get_supabase().table(table).update(payload).eq("id", row_id).execute()
        if res.data:
            return res.data[0]
        logger.error("[DBWriter:%s] update returned no data for id=%s", table, row_id)
        return None
    except Exception as e:
        logger.error("[DBWriter:%s] Update Error — %s", table, e)
        return None


# ── Roadmap writes ─────────────────────────────────────────────────────────────

def write_profiler(session_id: str, startup_name: str, profiler: Dict) -> Optional[str]:
    row = _insert("roadmap_profiler", {
        "session_id":            session_id,
        "startup_name":          startup_name,
        "business_type":         profiler["business_type"],
        "tech_required":         profiler["tech_required"],
        "prioritized_branches":  profiler.get("prioritized_branches", []),  # jsonb
        "branch_tier_map":       profiler.get("branch_tier_map", {}),       # jsonb
        "reasoning":             profiler.get("reasoning", ""),
    })
    if row:
        logger.info("[DBWriter:roadmap_profiler] saved id=%s", row["id"])
        return row["id"]
    return None


def write_branch(profiler_id: str, session_id: str, branch: str, status: str, summary: Optional[str]) -> Optional[str]:
    row = _insert("roadmap_branches", {
        "profiler_id": profiler_id,
        "session_id":  session_id,
        "branch":      branch,
        "status":      status,
        "summary":     summary,
    })
    return row["id"] if row else None


def write_tasks(branch_id: str, tasks: List[Dict]) -> List[Dict]:
    """Insert tasks and return list of {task_id, db_id} mappings."""
    results = []
    for task in tasks:
        row = _insert("roadmap_tasks", {
            "branch_id":       branch_id,
            "task_id":         task["task_id"],
            "title":           task.get("title"),
            "description":     task.get("description"),
            "timeline":        task.get("timeline"),
            "priority":        task.get("priority"),
            "assigned_to":     task.get("assigned_to"),
            "assignee_role":   task.get("assignee_role"),
            "estimated_hours": task.get("estimated_hours"),
            "complexity":      task.get("complexity"),
            "cost_impact":     task.get("cost_impact"),
            "dep_status":      task.get("status", "Ready"),
            "blocked_by":      task.get("blocked_by", []),
            "unblocks":        task.get("unblocks", []),
        })
        results.append({
            "task_id": task["task_id"],
            "db_id":   row["id"] if row else None,
        })
    logger.info("[DBWriter:roadmap_tasks] wrote %d tasks for branch_id=%s", len(tasks), branch_id)
    return results


# ── Roadmap edits (frontend node editing → DB sync) ────────────────────────────

def update_branch(branch_id: str, fields: Dict) -> Optional[Dict]:
    """Patch allowed fields on a roadmap_branches row."""
    allowed = {"status", "summary"}
    patch = {k: v for k, v in fields.items() if k in allowed}
    if not patch:
        return None
    return _update("roadmap_branches", branch_id, patch)


def update_task(task_id: str, fields: Dict) -> Optional[Dict]:
    """Patch allowed fields on a roadmap_tasks row."""
    allowed = {
        "title", "description", "timeline", "priority",
        "assigned_to", "assignee_role", "estimated_hours",
        "complexity", "cost_impact", "dep_status", "blocked_by", "unblocks"
    }
    patch = {k: v for k, v in fields.items() if k in allowed}
    if not patch:
        return None
    return _update("roadmap_tasks", task_id, patch)

