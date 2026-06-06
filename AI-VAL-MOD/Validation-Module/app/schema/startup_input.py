from pydantic import BaseModel
from typing import List, Optional


class StartupInput(BaseModel):
    user_id: Optional[str] = None   # Supabase auth user UUID — links idea to account
    full_name: str
    age: int
    gender: str
    city: str
    country: str
    profession: str
    industry_experience: str
    founder_count: int
    founder_skillset: List[str]
    startup_name: str
    startup_domain: str
    problem_statement: str
    startup_description: str
    target_audience: str
    geographic_market: str
    existing_competitors: str
    revenue_model: str
    estimated_pricing: str
    available_funding: str
    monthly_burn_capacity: str
    platform_type: List[str]
    technology_complexity: str
    mvp_timeline: str
    scalability_goal: str
    customer_acquisition_strategy: str
    current_startup_stage: str
