from pydantic import BaseModel, model_validator
from typing import List, Dict, Optional, Any


# ── Per-agent typed models ─────────────────────────────────────────────────────

class CriticalRisk(BaseModel):
    risk: str
    severity: str       # High | Medium | Low
    mitigation: str


class FeasibilityResult(BaseModel):
    agent: str = "feasibility_analysis"
    score: Optional[float] = None
    verdict: Optional[str] = None       # Feasible | Risky | Not Feasible
    status: str = "failed"
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    summary: Optional[str] = None


class MarketOpportunityResult(BaseModel):
    agent: str = "market_opportunity"
    score: Optional[float] = None
    verdict: Optional[str] = None       # Strong | Moderate | Weak
    status: str = "failed"
    tam_signal: Optional[str] = None
    demand_signals: Optional[List[str]] = None
    timing_assessment: Optional[str] = None
    risks: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    summary: Optional[str] = None


class CompetitionResult(BaseModel):
    agent: str = "competition_analysis"
    score: Optional[float] = None
    verdict: Optional[str] = None       # Low Competition | Moderate | Highly Competitive
    status: str = "failed"
    key_competitors: Optional[List[str]] = None
    competitive_gaps: Optional[List[str]] = None
    differentiation_strength: Optional[str] = None
    risks: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    summary: Optional[str] = None


class RiskResult(BaseModel):
    agent: str = "risk_analysis"
    score: Optional[float] = None
    verdict: Optional[str] = None       # Low Risk | Medium Risk | High Risk
    status: str = "failed"
    critical_risks: Optional[List[CriticalRisk]] = None
    overall_risk_level: Optional[str] = None
    recommendations: Optional[List[str]] = None
    summary: Optional[str] = None


class InnovationUSPResult(BaseModel):
    agent: str = "innovation_usp"
    score: Optional[float] = None
    verdict: Optional[str] = None       # Highly Innovative | Incremental | Me-Too
    status: str = "failed"
    usp_statement: Optional[str] = None
    innovation_factors: Optional[List[str]] = None
    defensibility: Optional[str] = None
    differentiation_vs_competitors: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    summary: Optional[str] = None


# ── Phase state ────────────────────────────────────────────────────────────────

class AnalysisPhaseState(BaseModel):
    total_agents: int
    successful_agents: int
    failed_agents: int
    aggregate_score: float
    feasibility: FeasibilityResult
    market_opportunity: MarketOpportunityResult
    competition: CompetitionResult
    risk: RiskResult
    innovation_usp: InnovationUSPResult
