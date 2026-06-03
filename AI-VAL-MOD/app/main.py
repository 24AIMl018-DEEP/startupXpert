from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from schema.startup_schema import StartupInputSchema
from core.config import settings

from agent.extraction.extraction_agent import extraction_agent
from workflow.research_orchestrator import research_orchestrator
from workflow.analysis_orchestrator import analysis_orchestrator

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join(str(l) for l in err["loc"] if l != "body")
        errors.append({"field": field, "issue": err["msg"], "your_value": err.get("input")})
    return JSONResponse(status_code=422, content={"status": "invalid_input", "errors": errors})

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/validate-startup")
async def start_validation_process(startup_data: StartupInputSchema):
    try:
        print(f"--- STARTING VALIDATION FOR: {startup_data.startupName} ---")

        print(">> PHASE 1: EXTRACTION")
        normalized_data = extraction_agent.extract_and_normalize(startup_data)

        print(">> PHASE 2: RESEARCH & STORAGE")
        research_status = await research_orchestrator.run_full_research_cycle(normalized_data)

        print(">> PHASE 3: ANALYSIS & FINAL VERDICT")
        final_analysis = await analysis_orchestrator.run_full_analysis(normalized_data)

        # Pull top relevant docs per domain using startup-specific cosine queries
        from services.nlp.unified_vector_store import vector_store
        research_data = vector_store.retrieve_top_by_domain(startup=normalized_data, top_k=5)

        return {
            "status": "success",
            "startup": normalized_data.startup_name,
            "research_stats": research_status,
            "research_data": research_data,
            "full_report": final_analysis
        }
    except Exception as e:
        print(f"PIPELINE CRASHED: {e}")
        raise HTTPException(status_code=500, detail=str(e))
