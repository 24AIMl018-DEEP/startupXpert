from pydantic import BaseModel, Field
from typing import List

class ValidatedSignal(BaseModel):
    domain: str = Field(..., description="E.g., Market, Competitor, Tech")
    verified_facts: List[str] = Field(..., description="Hard facts extracted from the noisy web data.")
    red_flags: List[str] = Field(..., description="Any critical risks or negative signals found.")
    data_quality_score: int = Field(..., ge=1, le=10, description="How reliable is this data? 1-10")