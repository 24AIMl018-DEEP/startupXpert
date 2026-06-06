"""
Fetches and structures validation research data for roadmap grounding.
Uses DB reader — never touches supabase directly.
"""
from typing import Dict
from services.db.reader import get_pipeline_output, get_analysis_phase, get_analysis_agent_results


def fetch_validation_context(session_id: str) -> Dict:
    ctx: Dict = {"session_id": session_id, "available": False}

    po = get_pipeline_output(session_id)
    if not po:
        return ctx
    ctx["aggregate_score"]   = po.get("aggregate_validation_score")
    ctx["validation_status"] = po.get("status")

    ap = get_analysis_phase(session_id)
    if not ap:
        return ctx

    rows = get_analysis_agent_results(ap["id"])
    if not rows:
        return ctx

    agents = {r["agent"]: r for r in rows}
    ctx["available"] = True
    ctx["agents"]    = agents

    fe  = agents.get("feasibility_analysis", {})
    mo  = agents.get("market_opportunity",   {})
    co  = agents.get("competition_analysis", {})
    ri  = agents.get("risk_analysis",        {})
    inn = agents.get("innovation_usp",       {})

    ctx["summary"] = {
        "feasibility": {
            "score":           fe.get("score"),
            "verdict":         fe.get("verdict"),
            "strengths":       fe.get("strengths")       or [],
            "weaknesses":      fe.get("weaknesses")      or [],
            "recommendations": fe.get("recommendations") or [],
        },
        "market": {
            "score":             mo.get("score"),
            "verdict":           mo.get("verdict"),
            "tam_signal":        mo.get("tam_signal"),
            "demand_signals":    mo.get("demand_signals")  or [],
            "timing_assessment": mo.get("timing_assessment"),
        },
        "competition": {
            "score":                    co.get("score"),
            "verdict":                  co.get("verdict"),
            "key_competitors":          co.get("key_competitors")     or [],
            "competitive_gaps":         co.get("competitive_gaps")    or [],
            "differentiation_strength": co.get("differentiation_strength"),
        },
        "risk": {
            "score":              ri.get("score"),
            "verdict":            ri.get("verdict"),
            "overall_risk_level": ri.get("overall_risk_level"),
            "top_risks":          ri.get("risks") or [],
        },
        "innovation": {
            "score":              inn.get("score"),
            "verdict":            inn.get("verdict"),
            "usp_statement":      inn.get("usp_statement"),
            "innovation_factors": inn.get("innovation_factors") or [],
            "defensibility":      inn.get("defensibility"),
        },
    }

    print(f"[ValidationFetcher] session={session_id} score={ctx['aggregate_score']}")
    return ctx
