from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Literal

class StartupInputSchema(BaseModel):
    
    """
    Class For schema..
    """
    
    # Founder Profile
    fullName: str = Field(..., description="Full name of the primary founder")
    age: int = Field(..., ge=18, description="Age of the founder")
    gender: str = Field(..., description="Gender of the founder")
    city: str = Field(..., description="City of operation")
    country: str = Field(..., description="Country of origin/operation")
    profession: str = Field(..., description="Current or previous profession of the founder")
    industryExperience: str = Field(..., description="Years and specific domain of industry experience")
    
    # Team Dynamics
    founderCount: int = Field(..., ge=1, description="Total number of co-founders")
    founderSkillset: List[str] = Field(..., description="Key technical or business skillsets of the founding team")
    
    # Core Startup Details
    startupName: str = Field(..., description="Name of the venture")
    startupDomain: str = Field(..., description="Industry vertical/domain (e.g., HealthTech, FinTech)")
    problemStatement: str = Field(..., description="The core pain point being addressed")
    startupDescription: str = Field(..., description="High-level breakdown of the solution/product")
    targetAudience: str = Field(..., description="Primary consumer or enterprise profile target")
    geographicMarket: str = Field(..., description="Target geographic market size/scope")
    
    # Market Landscape
    existingCompetitors: str = Field(..., description="Comma-separated or text breakdown of known market competitors")
    
    # Financials & Execution
    revenueModel: str = Field(..., description="How the startup intends to monetize")
    estimatedPricing: str = Field(..., description="Pricing structure details")
    availableFunding: float = Field(..., description="Total current runway capital in native currency")
    monthlyBurnCapacity: float = Field(..., description="Estimated maximum monthly operational expenditure")
    
    # Technical Architecture
    platformType: List[str] = Field(..., description="Deployment platforms (e.g., Mobile App, Web)")
    technologyComplexity: Literal["Low", "Medium", "High"] = Field(..., description="Inferred engineering layer complexity")
    mVPTimeline: str = Field(..., description="Target duration to deploy the minimum viable product")
    scalabilityGoal: str = Field(..., description="Long term milestone objective")
    customerAcquisitionStrategy: str = Field(..., description="GTM framework plan")
    currentStartupStage: Literal["Ideation", "Validation", "MVP Development", "Scaling"] = Field(..., description="Current operational milestone")

    class Config:
        json_schema_extra = {
            "example": {
                "fullName": "Riya Sharma",
                "age": 28,
                "gender": "Female",
                "city": "Pune",
                "country": "India",
                "profession": "Healthcare Consultant",
                "industryExperience": "6 Years in Healthcare Operations",
                "founderCount": 2,
                "founderSkillset": ["Healthcare Management", "Product Strategy", "Sales"],
                "startupName": "MediBridge",
                "startupDomain": "HealthTech",
                "problemStatement": "Patients in small towns face long wait times and difficulty accessing specialist doctors...",
                "startupDescription": "A telemedicine platform connecting patients in tier-2 and tier-3 cities...",
                "targetAudience": "Patients, clinics, and hospitals in tier-2 and tier-3 cities.",
                "geographicMarket": "India",
                "existingCompetitors": "Practo, Tata 1mg, Apollo 24/7",
                "revenueModel": "Commission per consultation and subscription plans",
                "estimatedPricing": "299 INR per consultation",
                "availableFunding": 5000000.0,
                "monthlyBurnCapacity": 200000.0,
                "platformType": ["Mobile App", "Web Platform"],
                "technologyComplexity": "High",
                "mVPTimeline": "6 Months",
                "scalabilityGoal": "Pan-India healthcare network",
                "customerAcquisitionStrategy": "Hospital partnerships, digital marketing, and referral programs",
                "currentStartupStage": "MVP Development"
            }
        }