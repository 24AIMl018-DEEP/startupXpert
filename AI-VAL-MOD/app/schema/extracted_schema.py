from pydantic import BaseModel
from typing import List, Dict, Any

class NLPKeywords(BaseModel):
    problem_entities: List[str]
    solution_entities: List[str]
    strategy_entities: List[str]
    extracted_core_features: List[str] # New: Specific product features

class NormalizedStartupData(BaseModel):
    startup_name: str
    domain: str
    target_market: str
    location: str
    
    # Deep Founder Analysis
    founder_profile: Dict[str, Any]
    
    # Deep Market Analysis
    competitors_list: List[str]
    inferred_business_type: str # New: B2B, B2C, or B2B2C
    
    # Deep Financials
    financials: Dict[str, Any]
    revenue_streams: List[str] # New: Split list of how they make money
    
    # Deep Tech & Product
    tech_stack_summary: str
    core_problem: str
    core_solution: str
    stage: str
    
    nlp_extracted_keywords: NLPKeywords