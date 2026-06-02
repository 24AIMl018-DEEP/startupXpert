from pydantic import BaseModel, Field
from typing import List

class AgentQueries(BaseModel):
    queries: List[str] = Field(..., description="Targeted search queries for the specific research domain.")

class MasterQueryOutput(BaseModel):
    market_research: List[str]
    competitor_research: List[str]
    customer_validation: List[str]
    business_model: List[str]
    regulatory_risk: List[str]
    founder_feasibility: List[str]
    technology_research: List[str]