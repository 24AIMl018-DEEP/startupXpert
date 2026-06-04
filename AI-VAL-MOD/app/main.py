import os
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
from typing import Optional

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # warm up sentence-transformer model at startup so first request is fast
    logger.info("[Startup] Warming up vector store model...")
    vector_store.add("warmup", {"agent": "warmup"})
    vector_store.clear()
    logger.info("[Startup] Model ready")
    yield


app = FastAPI(title="AI Startup Validator", version="2.0.0", lifespan=lifespan)

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


@app.get("/health")
def health():
    return {"status": "active"}


@app.post("/api/v1/validate", response_model=PipelineState)
async def validate(startup_data: StartupInput, session_id: Optional[str] = None):
    try:
        return await run_pipeline(startup_data, session_id=session_id)
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
