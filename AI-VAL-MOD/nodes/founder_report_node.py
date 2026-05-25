"""
founder_report_node.py — Node: Final LLM Startup Report
Rule: Nodes contain ZERO logic. Only read state → call service → write state.

Takes ONLY the compressed structured intelligence and generates
a candid, YC-style founder analysis report.
"""
from services.founder_intelligence_service import FounderIntelligenceService

_svc = FounderIntelligenceService()


def founder_report_node(state: dict) -> dict:
    print("\n[8/8] Generating Founder Report (LLM Reasoning)")
    report   = _svc.analyze(state)
    reasoning = state.get("reasoning", {})
    reasoning["founder_report"] = report
    print(f"  → Report generated ({len(report)} chars)")
    return {"reasoning": reasoning}
