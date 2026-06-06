import os
import sys
from pathlib import Path

# /app/Validation-Module/app/main.py
# parents[0] = /app/Validation-Module/app  ← module's own app dir (for schema, workflow, services)
# parents[2] = /app                        ← AI-VAL-MOD root (for shared package)
_here = Path(__file__).resolve()
sys.path.insert(0, str(_here.parent))       # Validation-Module/app
sys.path.insert(0, str(_here.parents[2]))   # AI-VAL-MOD (shared lives here)

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import Request

from schema.startup_input import StartupInput
from schema.states.pipeline_state import PipelineState
from services.vector.store import vector_store
from workflow.graph import run_pipeline

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warm up sentence-transformer model in background — don't block startup
    # The model downloads ~90MB on first run; healthcheck must pass before that completes
    import asyncio
    async def _warmup():
        try:
            logger.info("[Startup] Warming up vector store model (background)...")
            await asyncio.get_event_loop().run_in_executor(None, lambda: (
                vector_store.add("warmup", {"agent": "warmup"}),
                vector_store.clear()
            ))
            logger.info("[Startup] Model ready")
        except Exception as e:
            logger.warning(f"[Startup] Model warmup failed (non-fatal): {e}")
    asyncio.create_task(_warmup())
    yield


app = FastAPI(title="AI Startup Validator", version="2.0.0", lifespan=lifespan)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
# When ALLOWED_ORIGINS is wildcard, credentials must be disabled
# (browsers block credentialed requests to wildcard origins)
_allow_credentials = "*" not in ALLOWED_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r".*" if "*" in ALLOWED_ORIGINS else None,
    allow_credentials=_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def _validation_error(request: Request, exc: RequestValidationError):
    errors = [{"field": " -> ".join(str(l) for l in e["loc"] if l != "body"), "issue": e["msg"]} for e in exc.errors()]
    return JSONResponse(status_code=422, content={"status": "invalid_input", "errors": errors})


@app.get("/health")
def health():
    return {"status": "active"}


@app.post("/api/v1/validate", response_model=PipelineState)
async def validate(startup_data: StartupInput):
    try:
        return await run_pipeline(startup_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/sessions/{user_id}")
def get_user_sessions(user_id: str):
    """Return all startup_input session IDs + metadata for a user."""
    try:
        from shared.db.supabase_client import get_supabase
        res = get_supabase().table("startup_input") \
            .select("id, created_at, startup_name, startup_domain, current_startup_stage") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/vector/search")
def vector_search(query: str, top_k: int = 5, agent: str = None):
    return {"query": query, "results": vector_store.search(query=query, top_k=top_k, agent_filter=agent)}


@app.get("/api/v1/vector/stats")
def vector_stats():
    return vector_store.stats()


@app.delete("/api/v1/vector/clear")
def vector_clear():
    vector_store.clear()
    return {"status": "cleared"}
