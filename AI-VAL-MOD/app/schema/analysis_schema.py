from pydantic import BaseModel, Field
from typing import List

# Ye Gatekeeper ka output hoga (Clean Data)
class ValidatedSignal(BaseModel):
    domain: str = Field(..., description="E.g., Market, Competitor, Tech")
    verified_facts: List[str] = Field(..., description="Hard facts extracted from the noisy web data.")
    red_flags: List[str] = Field(..., description="Any critical risks or negative signals found.")
    data_quality_score: int = Field(..., ge=1, le=10, description="Reliability of this data. 1-10")

# Ye 5 Analysis Agents ka output hoga (Final Report for each panel)
class DomainAnalysisReport(BaseModel):
    domain_name: str = Field(..., description="Name of the analysis domain")
    score: int = Field(..., ge=0, le=100, description="Feasibility score out of 100")
    key_findings: List[str] = Field(..., description="Top 3 deep insights derived from the signals")
    critical_risks: List[str] = Field(..., description="Major threats to the startup in this domain")
    strategic_advice: str = Field(..., description="Actionable advice for the founder")
    
from typing import Literal

# ... (Tere purane schemas: ValidatedSignal, DomainAnalysisReport waise hi rahenge)

class FinalRecommendationReport(BaseModel):
    overall_score: int = Field(..., ge=0, le=100, description="Holistic score out of 100.")
    investment_decision: Literal["Strong Go", "Go with Caution", "Pivot Required", "No-Go"] = Field(..., description="Final verdict.")
    executive_summary: str = Field(..., description="A brutal, honest 3-4 sentence summary of the startup's viability.")
    immediate_action_items: List[str] = Field(..., description="Top 3 immediate next steps for the founder.")