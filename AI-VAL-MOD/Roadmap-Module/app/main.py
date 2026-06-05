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
from typing import List

from schema.states.pipeline_state import RoadmapPipelineState, TeamMember
from workflow.pipeline import run_roadmap_pipeline

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


@app.get("/health")
def health():
    return {"status": "active"}


@app.post("/api/v1/roadmap", response_model=RoadmapPipelineState)
async def generate_roadmap(payload: RoadmapRequest):
    try:
        return await run_roadmap_pipeline(
            session_id=   payload.session_id,
            team_members= [m.model_dump() for m in payload.team],
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("[API] roadmap generation failed")
        raise HTTPException(status_code=500, detail=str(e))
