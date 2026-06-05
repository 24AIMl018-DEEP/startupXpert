"""
Test runner — NO DB, pure JSON input.
Run: python test_pipeline.py
"""
import sys
import json
import asyncio
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
sys.path.insert(0, str(Path(__file__).resolve().parent))

# ── import app modules first, then patch ──────────────────────────────────────
from schema.startup_input import StartupInput
import services.db.writer as _writer
import services.validation_fetcher as _fetcher

# ── monkey-patch DB calls to no-ops ───────────────────────────────────────────
_writer.write_profiler = lambda *a, **kw: "test-profiler-id"
_writer.write_branch   = lambda *a, **kw: "test-branch-id"
_writer.write_tasks    = lambda *a, **kw: None
_fetcher.fetch_validation_context = lambda session_id: {"available": False}

# ── import pipeline AFTER patching ────────────────────────────────────────────
from workflow.pipeline import run_roadmap_pipeline

# ── Test cases ─────────────────────────────────────────────────────────────────
KIRANA = {
    "full_name": "Ramesh Kumar", "age": 35, "gender": "Male",
    "city": "Jaipur", "country": "India",
    "profession": "Shopkeeper", "industry_experience": "5 years in retail",
    "founder_count": 1, "founder_skillset": ["retail operations", "customer handling"],
    "startup_name": "Kumar Kirana Store",
    "startup_domain": "Retail / Grocery",
    "problem_statement": "Local people lack a nearby trusted grocery store with fresh produce",
    "startup_description": "A physical kirana store selling daily grocery items, fresh vegetables, and household goods in a residential area of Jaipur",
    "target_audience": "Households in 2km radius",
    "geographic_market": "Jaipur, Rajasthan",
    "existing_competitors": "Big Bazaar, local kiranas, JioMart delivery",
    "revenue_model": "Direct retail sales",
    "estimated_pricing": "Market rate",
    "available_funding": "5 Lakhs INR",
    "monthly_burn_capacity": "30,000 INR",
    "platform_type": ["None / Offline only"],
    "technology_complexity": "None",
    "mvp_timeline": "1 month",
    "scalability_goal": "Open 2 more stores in 3 years",
    "customer_acquisition_strategy": "Word of mouth, local pamphlets",
    "current_startup_stage": "Idea / Pre-launch",
}

SAAS = {
    "full_name": "Priya Sharma", "age": 28, "gender": "Female",
    "city": "Bangalore", "country": "India",
    "profession": "Software Engineer", "industry_experience": "4 years in ML/AI",
    "founder_count": 2, "founder_skillset": ["Python", "Machine Learning", "Product Management"],
    "startup_name": "HireIQ",
    "startup_domain": "HR Tech / AI Recruitment",
    "problem_statement": "Companies waste weeks screening unqualified resumes",
    "startup_description": "AI-powered SaaS platform that auto-screens resumes, ranks candidates, and schedules interviews using LLMs",
    "target_audience": "HR teams in mid-size companies (50-500 employees)",
    "geographic_market": "India, Southeast Asia",
    "existing_competitors": "HackerEarth, Keka, Darwinbox",
    "revenue_model": "Monthly SaaS subscription per seat",
    "estimated_pricing": "Rs 999/month per recruiter seat",
    "available_funding": "20 Lakhs INR bootstrapped",
    "monthly_burn_capacity": "1.5 Lakhs INR",
    "platform_type": ["Web App", "API"],
    "technology_complexity": "High",
    "mvp_timeline": "3 months",
    "scalability_goal": "10,000 companies in 2 years",
    "customer_acquisition_strategy": "LinkedIn outreach, product-led growth",
    "current_startup_stage": "MVP in progress",
}

TEAM_KIRANA = [
    {"name": "Ramesh Kumar", "role": "Founder",         "skills": ["retail", "negotiation", "customer handling"]},
    {"name": "Sunita Devi",  "role": "Store Assistant", "skills": ["billing", "inventory", "customer service"]},
]

TEAM_SAAS = [
    {"name": "Priya Sharma", "role": "CTO",             "skills": ["Python", "ML", "system design"]},
    {"name": "Amit Roy",     "role": "Product Manager", "skills": ["product strategy", "GTM", "user research"]},
]


async def main():
    # ── choose test case ───────────────────────────────────────────
    INPUT = KIRANA
    TEAM  = TEAM_KIRANA
    # INPUT = SAAS; TEAM = TEAM_SAAS   # uncomment for SaaS case

    result = await run_roadmap_pipeline(
        startup_data=       StartupInput(**INPUT),
        session_id=         "test-session-001",
        team_members=       TEAM,
        validation_context= {},
    )

    # ── print summary ──────────────────────────────────────────────
    print("\n" + "="*60)
    print(f"STARTUP  : {result.startup_name}")
    print(f"BUSINESS : {result.profiler_output.business_type}")
    print(f"TECH REQ : {result.profiler_output.tech_required}")
    print(f"REASONING: {result.profiler_output.reasoning}")
    print(f"BRANCHES : {result.profiler_output.prioritized_branches}")
    print("="*60)

    for br in result.branch_roadmaps:
        print(f"\n▶ {br.branch.upper()}  [{br.status}]")
        if br.summary:
            print(f"  {br.summary}")
        for t in (br.tasks or []):
            print(f"  [{t.get('priority','?'):6}] {t.get('title')}  ({t.get('timeline','')})")

    print(f"\n── SYNCED TASKS: {len(result.synced_tasks)} ──")
    for t in result.synced_tasks:
        tag = f" ← BLOCKED by {t.blocked_by}" if t.blocked_by else ""
        owner = t.assigned_to or "Unassigned"
        print(f"  [{t.status:7}] {t.task_id:<40} {owner}{tag}")

    out = Path(__file__).parent / "test_output.json"
    out.write_text(json.dumps(result.model_dump(), indent=2, default=str), encoding="utf-8")
    print(f"\n✓ Full JSON saved → {out}")


if __name__ == "__main__":
    asyncio.run(main())
