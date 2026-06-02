import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schema.startup_schema import StartupInputSchema
from core.config import settings
from agent.extraction.extraction_agent import extraction_agent
from agent.analysis.signal_gatekeeper import signal_gatekeeper
from workflow.research_orchestrator import research_orchestrator
from services.nlp.unified_vector_store import vector_store

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "active"}

@app.post("/api/v1/validate-startup")
async def start_validation_process(startup_data: StartupInputSchema):
    try:
        # Step 1: Extract & normalize
        normalized_data = extraction_agent.extract_and_normalize(startup_data)

        # Step 2: Research phase — generate queries, search, store in vector DB
        research_status = await research_orchestrator.run_full_research_cycle(normalized_data)

        # Step 3: Signal Gatekeeper — filter noise across all 7 domains concurrently
        domains = ["Market", "Competitor", "Customer", "Business", "Regulatory", "Founder", "Technology"]
        gatekeeper_tasks = [
            signal_gatekeeper.extract_valid_signals(domain, normalized_data.startup_name, normalized_data.core_problem)
            for domain in domains
        ]
        validated_signals = await asyncio.gather(*gatekeeper_tasks)

        return {
            "status": "success",
            "research_stats": research_status,
            "validated_signals": [s.dict() for s in validated_signals]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
