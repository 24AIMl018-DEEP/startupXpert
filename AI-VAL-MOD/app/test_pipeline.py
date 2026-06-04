import asyncio
import json
from schema.startup_input import StartupInput
from workflow.graph import run_pipeline

sample = StartupInput(
    full_name="Ramesh Yadav",
    age=22,
    gender="Male",
    city="Nagpur",
    country="India",
    profession="Agriculture Graduate",
    industry_experience="0 years, fresh graduate",
    founder_count=1,
    founder_skillset=["Farming Knowledge"],
    startup_name="KisanBot",
    startup_domain="AgriTech",
    problem_statement="Farmers don't know the right time to sell crops and lose money to middlemen",
    startup_description="A chatbot that tells farmers crop prices and best selling time via SMS",
    target_audience="Wheat and soybean farmers in Vidarbha region aged 35-60",
    geographic_market="Maharashtra, India",
    existing_competitors="DeHaat, AgroStar, Ninjacart, IFFCO Kisan",
    revenue_model="Not decided yet",
    estimated_pricing="Free for now",
    available_funding="Rs 50,000 personal savings",
    monthly_burn_capacity="Rs 20,000 per month",
    platform_type=["Web App"],
    technology_complexity="Low",
    mvp_timeline="6 months",
    scalability_goal="1000 farmers in 12 months",
    customer_acquisition_strategy="Word of mouth",
    current_startup_stage="Idea / Pre-MVP",
)

async def main():
    result = await run_pipeline(sample)
    print("\n" + "=" * 60)
    print("FINAL OUTPUT JSON:")
    print("=" * 60)
    print(json.dumps(result.model_dump(), indent=2, ensure_ascii=False))


asyncio.run(main())
