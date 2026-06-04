from pydantic import BaseModel, model_validator
from typing import List, Dict, Optional, Any


class CriticalRisk(BaseModel):
    risk: str
    severity: str
    mitigation: str


class AnalysisAgentResult(BaseModel):
    agent: str
    score: Optional[float] = None
    verdict: Optional[str] = None
    status: str  # success | failed | parse_error

    # feasibility
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None

    # market_opportunity
    tam_signal: Optional[str] = None
    demand_signals: Optional[List[str]] = None
    timing_assessment: Optional[str] = None

    # competition_analysis
    key_competitors: Optional[List[str]] = None
    competitive_gaps: Optional[List[str]] = None
    differentiation_strength: Optional[str] = None

    # risk_analysis
    critical_risks: Optional[List[CriticalRisk]] = None
    overall_risk_level: Optional[str] = None

    # innovation_usp
    usp_statement: Optional[str] = None
    innovation_factors: Optional[List[str]] = None
    defensibility: Optional[str] = None
    differentiation_vs_competitors: Optional[List[str]] = None

    # shared
    risks: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    summary: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def coerce_score(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        s = values.get("score")
        if s is not None:
            try:
                values["score"] = float(s)
            except (ValueError, TypeError):
                values["score"] = None
        return values


class AnalysisPhaseState(BaseModel):
    total_agents: int
    successful_agents: int
    failed_agents: int
    agent_results: List[AnalysisAgentResult]
    aggregate_score: float
