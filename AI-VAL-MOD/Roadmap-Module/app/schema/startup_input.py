from pydantic import BaseModel
from typing import List, Optional


class StartupInput(BaseModel):
    user_id: Optional[str] = None

    # Personal profile fields — nullable in DB (older rows may not have these)
    full_name:           Optional[str] = None
    age:                 Optional[int] = None
    gender:              Optional[str] = None
    city:                Optional[str] = None
    country:             Optional[str] = None
    profession:          Optional[str] = None
    industry_experience: Optional[str] = None
    founder_count:       Optional[int] = None
    founder_skillset:    List[str]     = []

    # Core startup fields — required for the pipeline
    startup_name:                  str
    startup_domain:                str
    problem_statement:             str
    startup_description:           str
    target_audience:               str
    geographic_market:             str
    existing_competitors:          str
    revenue_model:                 str
    estimated_pricing:             Optional[str] = None
    available_funding:             Optional[str] = None
    monthly_burn_capacity:         Optional[str] = None
    platform_type:                 List[str]     = []
    technology_complexity:         str
    mvp_timeline:                  Optional[str] = None
    scalability_goal:              Optional[str] = None
    customer_acquisition_strategy: Optional[str] = None
    current_startup_stage:         str
