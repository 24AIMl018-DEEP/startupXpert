import json
from services.llm_service import ask_llm


class FinalSummaryService:

    def run(self, state: dict) -> dict:

        sp  = state.get("structured_problem", {})
        ci  = state.get("intelligence", {}).get("compressed", {})
        exc = ci.get("executive_context", {})

        # ── BUILD COMPRESSED CONTEXT FOR LLM ─────────────────
        # only top signals — no raw text

        problem_s  = ci.get("problem_summary",  {})
        behavior_s = ci.get("behavior_summary", {})
        spending_s = ci.get("spending_summary", {})

        def top_patterns(summary, n=3):
            return [
                {
                    "theme":     p.get("key_phrase", ""),
                    "centroid":  p.get("centroid", ""),
                    "frequency": p.get("frequency", 0),
                    "emotion":   p.get("core_emotion", ""),
                    "sentiment": p.get("avg_sentiment", 0)
                }
                for p in summary.get("dominant_patterns", [])[:n]
            ]

        context = {
            "genre":             state.get("genre", ""),
            "confidence":        state.get("confidence_score", 0),
            "trend_score":       state.get("trend_score", 0),
            "core_problem":      sp.get("core_problem", ""),
            "main_pain":         sp.get("main_pain", ""),
            "target_users":      sp.get("target_users", ""),
            "environment":       sp.get("environment", ""),
            "problem_severity":  problem_s.get("market_severity", 0),
            "problem_coverage":  problem_s.get("coverage_ratio", 0),
            "problem_clusters":  len(problem_s.get("dominant_patterns", [])),
            "behavior_severity": behavior_s.get("market_severity", 0),
            "behavior_coverage": behavior_s.get("coverage_ratio", 0),
            "behavior_clusters": len(behavior_s.get("dominant_patterns", [])),
            "spending_severity": spending_s.get("market_severity", 0),
            "spending_coverage": spending_s.get("coverage_ratio", 0),
            "spending_clusters": len(spending_s.get("dominant_patterns", [])),
            "pain_spending_overlap": exc.get("pain_spending_overlap", 0),
            "opportunity_zone_count": len(exc.get("opportunity_zones", [])),
            "top_problem_patterns":  top_patterns(problem_s),
            "top_behavior_patterns": top_patterns(behavior_s),
            "top_spending_patterns": top_patterns(spending_s)
        }

        prompt = f"""You are a startup market analyst. Based ONLY on the structured market signals below, produce a factual startup validation summary.

MARKET SIGNALS:
{json.dumps(context, indent=2)}

Respond ONLY with valid JSON:
{{
  "market_verdict": "STRONG / MODERATE / WEAK / NOT_VALIDATED",
  "verdict_reason": "one sentence factual reason based on the signals",
  "pain_assessment": "factual description of the pain intensity and focus",
  "behavior_assessment": "factual description of behavioral adaptation signals",
  "spending_assessment": "factual description of economic willingness signals",
  "opportunity_statement": "one clear sentence describing the startup opportunity",
  "key_risks": ["risk 1", "risk 2", "risk 3"],
  "recommended_focus": "the single most important thing a founder should validate next"
}}

Rules:
- Base ONLY on the signals provided, no external knowledge
- Be factual and specific, not generic
- No hallucination
- No explanation outside JSON
Only JSON."""

        raw   = ask_llm(prompt)
        start = raw.find("{")
        end   = raw.rfind("}") + 1

        return json.loads(raw[start:end])
