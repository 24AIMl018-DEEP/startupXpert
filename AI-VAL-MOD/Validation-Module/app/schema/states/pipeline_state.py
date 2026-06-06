from pydantic import BaseModel
from typing import Dict, Optional
from schema.states.pitch_state import PitchState
from schema.states.query_state import QueryPhaseState
from schema.states.analysis_state import AnalysisPhaseState


class PipelineState(BaseModel):
    session_id:                 Optional[str] = None   # set after DB insert, returned to frontend
    status:                     str
    startup_name:               str
    pitch_state:                PitchState
    query_phase_state:          QueryPhaseState
    analysis_phase_state:       AnalysisPhaseState
    aggregate_validation_score: float
    final_vector_stats:         Dict
