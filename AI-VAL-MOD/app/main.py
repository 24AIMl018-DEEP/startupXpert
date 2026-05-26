from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.graph.workflow import app as validator_graph

# Initialize the FastAPI server
app = FastAPI(
    title="Startup Problem Validator API",
    description="A LangGraph-powered due diligence pipeline for startup pitches.",
    version="1.0.0"
)

# Define the expected format of incoming requests
class PitchRequest(BaseModel):
    pitch: str

@app.get("/")
def health_check():
    return {"status": "online", "message": "Startup Validator API is running."}

@app.post("/validate")
async def validate_startup(request: PitchRequest):
    """
    Takes a raw startup pitch, runs it through the LangGraph AI pipeline, 
    and returns a structured JSON validation report.
    """
    if not request.pitch.strip():
        raise HTTPException(status_code=400, detail="Pitch cannot be empty.")
        
    try:
        print(f"\n[API] Received new pitch: {request.pitch[:50]}...")
        
        # 1. Initialize the starting state
        initial_state = {"pitch": request.pitch}
        
        # 2. Trigger the LangGraph state machine
        # This will synchronously run planner -> researcher -> filter -> synthesizer
        final_state = validator_graph.invoke(initial_state)
        
        # 3. Extract and return ONLY the final JSON report
        return final_state.get("final_report", {"error": "No report generated."})
        
    except Exception as e:
        print(f"[API Error] Pipeline failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))