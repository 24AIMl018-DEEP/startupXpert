from pydantic import BaseModel
from typing import List, Optional


class RecommendationState(BaseModel):
    verdict: str                              # e.g. "INVEST", "PASS", "CONDITIONAL"
    confidence: str                           # e.g. "High", "Medium", "Low"
    aggregate_score: float
    one_liner: str
    invest_rationale: List[str]
    concerns: List[str]
    pivot_suggestions: Optional[List[str]] = None
    next_steps: List[str]
    summary: str
