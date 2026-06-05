from pydantic import BaseModel
from typing import Dict
from schema.states.pitch_state import PitchState
from schema.states.query_state import QueryPhaseState
from schema.states.analysis_state import AnalysisPhaseState


class PipelineState(BaseModel):
    status: str
    startup_name: str
    pitch_state: PitchState
    query_phase_state: QueryPhaseState
    analysis_phase_state: AnalysisPhaseState
    aggregate_validation_score: float
    final_vector_stats: Dict
