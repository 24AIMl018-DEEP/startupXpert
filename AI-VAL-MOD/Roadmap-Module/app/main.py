import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import Request
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from schema.states.pipeline_state import RoadmapPipelineState, TeamMember
from workflow.pipeline import run_roadmap_pipeline
from services.db.reader import (
    get_sessions_by_user,
    get_validated_sessions_by_user,
    get_roadmap_profiler,
    get_roadmap_branches,
    get_roadmap_tasks,
    get_pipeline_output,
)
from services.db.writer import update_branch, update_task

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Startup Roadmap Generator", version="2.0.0")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def _validation_error(request: Request, exc: RequestValidationError):
    errors = [{"field": " -> ".join(str(l) for l in e["loc"] if l != "body"), "issue": e["msg"]} for e in exc.errors()]
    return JSONResponse(status_code=422, content={"status": "invalid_input", "errors": errors})


class RoadmapRequest(BaseModel):
    session_id: str          # startup_input.id from Validation Module DB
    team: List[TeamMember] = []


class BranchUpdateRequest(BaseModel):
    status:  Optional[str] = None
    summary: Optional[str] = None


class TaskUpdateRequest(BaseModel):
    dep_status:      Optional[str]      = None
    priority:        Optional[str]      = None
    assigned_to:     Optional[str]      = None
    assignee_role:   Optional[str]      = None
    title:           Optional[str]      = None
    description:     Optional[str]      = None
    timeline:        Optional[str]      = None
    estimated_hours: Optional[int]      = None
    complexity:      Optional[str]      = None
    cost_impact:     Optional[str]      = None
    blocked_by:      Optional[List[str]] = None
    unblocks:        Optional[List[str]] = None


@app.get("/health")
def health():
    return {"status": "active", "module": "roadmap"}


# Debug endpoint — only available in non-production environments
@app.get("/api/v1/debug/session/{session_id}")
def debug_session(session_id: str):
    if os.getenv("ENVIRONMENT", "development") == "production":
        raise HTTPException(status_code=404, detail="Not found")
    from services.db.reader import get_startup_input
    row = get_startup_input(session_id)
    return {
        "session_id":      session_id,
        "found":           row is not None,
        "startup_name":    row.get("startup_name") if row else None,
        "has_service_key": bool(os.getenv("SUPABASE_SERVICE_ROLE_KEY")),
    }


@app.post("/api/v1/roadmap", response_model=RoadmapPipelineState)
async def generate_roadmap(payload: RoadmapRequest):
    try:
        return await run_roadmap_pipeline(
            session_id=   payload.session_id,
            team_members= [m.model_dump() for m in payload.team],
        )
    except ValueError as e:
        msg = str(e)
        # Only treat "not found" ValueErrors as 404; everything else is a 500
        if "not found" in msg.lower() or "no startup_input" in msg.lower():
            raise HTTPException(status_code=404, detail=msg)
        logger.exception("[API] pipeline ValueError (not a 404)")
        raise HTTPException(status_code=500, detail=msg)
    except Exception as e:
        logger.exception("[API] roadmap generation failed")
        raise HTTPException(status_code=500, detail=str(e))


# ── User-scoped idea & roadmap queries ────────────────────────────────────────

@app.get("/api/v1/sessions/{user_id}")
def get_user_sessions(user_id: str):
    """Return all startup_input sessions for a user, with validation status."""
    try:
        return get_validated_sessions_by_user(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/roadmap/{session_id}")
def get_session_roadmap(session_id: str):
    """Return full roadmap (profiler + branches + tasks) for a validated session."""
    profiler = get_roadmap_profiler(session_id)
    if not profiler:
        raise HTTPException(status_code=404, detail="No roadmap found for this session.")

    branches = get_roadmap_branches(session_id)
    result = []
    for branch in branches:
        tasks = get_roadmap_tasks(branch["id"])
        result.append({**branch, "tasks": tasks})

    pipeline = get_pipeline_output(session_id)

    return {
        "session_id":       session_id,
        "profiler":         profiler,
        "branches":         result,
        "pipeline_output":  pipeline,
    }


# ── Node edit → DB sync endpoints ─────────────────────────────────────────────

@app.patch("/api/v1/branches/{branch_id}")
def patch_branch(branch_id: str, payload: BranchUpdateRequest):
    """Sync a branch status/summary edit from the frontend to Supabase."""
    fields = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update.")
    updated = update_branch(branch_id, fields)
    if not updated:
        raise HTTPException(status_code=404, detail="Branch not found or update failed.")
    return {"status": "updated", "branch": updated}


@app.patch("/api/v1/tasks/{task_id}")
def patch_task(task_id: str, payload: TaskUpdateRequest):
    """Sync a task edit from the frontend to Supabase."""
    fields = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update.")
    updated = update_task(task_id, fields)
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found or update failed.")
    return {"status": "updated", "task": updated}

