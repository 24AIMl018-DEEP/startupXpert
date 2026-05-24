import json
from services.llm_service import ask_llm


class QueryGenerationService:

    def run(self, structured_problem: dict) -> dict:

        sp = structured_problem

        prompt = f"""You are a search intelligence engine for startup validation.
Generate search queries across 3 intent types to find real human evidence about this problem.

Core Problem: {sp['core_problem']}
Main Pain: {sp['main_pain']}
Environment: {sp['environment']}
Target Users: {sp['target_users']}

Respond ONLY with valid JSON:
{{
  "problem_queries": [
    "query finding complaints and frustrations about this problem",
    "query finding reddit quora forum discussions about this pain",
    "query finding people struggling with this specific issue",
    "query finding negative experiences and rants about this",
    "query finding how bad this problem is for users",
    "query finding real user suffering around this pain"
  ],
  "behavior_queries": [
    "query finding what users already do as workaround for this problem",
    "query finding existing habits or tools users use despite the pain",
    "query finding communities or groups formed around this need",
    "query finding how often users deal with this situation",
    "query finding user routines that show this problem exists",
    "query finding social proof that people care about this"
  ],
  "spending_queries": [
    "query finding money users spend related to this problem",
    "query finding products or services users already pay for in this space",
    "query finding time users waste because of this problem",
    "query finding willingness to pay for a solution",
    "query finding existing market alternatives users use",
    "query finding economic impact of this problem on users"
  ]
}}

Strict rules:
- problem_queries: emotional, complaint-heavy, use words like hate frustrated terrible worst annoying
- behavior_queries: behavioral signals, use words like using trying workaround habit daily routine
- spending_queries: economic signals, use words like paying buying spending cost worth price
- All queries must target {sp['target_users']} specifically
- No tutorial, educational or informational queries
- No explanation. No extra text. Only JSON."""

        for attempt in range(3):
            try:
                raw   = ask_llm(prompt)
                start = raw.find("{")
                end   = raw.rfind("}") + 1
                if start == -1 or end == 0:
                    continue
                result = json.loads(raw[start:end])
                return {
                    "problem_queries":  result.get("problem_queries", []),
                    "behavior_queries": result.get("behavior_queries", []),
                    "spending_queries": result.get("spending_queries", [])
                }
            except (json.JSONDecodeError, Exception):
                continue

        # fallback
        base = sp['core_problem']
        return {
            "problem_queries":  [f"{base} complaints", f"{base} frustration", f"hate {base}"],
            "behavior_queries": [f"{base} workaround", f"how people deal with {base}"],
            "spending_queries": [f"{base} cost", f"paying to solve {base}"]
        }
