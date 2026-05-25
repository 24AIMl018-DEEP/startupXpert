import json
from services.llm_service import ask_llm


class ProblemStructuringService:

    def run(self, user_input: dict) -> dict:

        prompt = f"""You are a startup problem analyst. Extract precise structure from the founder's input.

Problem: {user_input.get('problem', '')}
Target Users: {user_input.get('target_users', '')}
Current Solutions: {user_input.get('current_solutions', '')}
Why Current Solutions Fail: {user_input.get('why_bad', '')}
Proposed Solution: {user_input.get('proposed_solution', '')}

Respond ONLY with valid JSON:
{{
  "core_problem": "specific problem in one short phrase",
  "main_pain": "exact frustration the user feels",
  "environment": "where this pain happens",
  "target_users": "real humans who suffer this daily"
}}

Rules: max 12 words per field. No solution language. Only JSON."""

        for _ in range(3):
            try:
                raw   = ask_llm(prompt)
                start = raw.find("{")
                end   = raw.rfind("}") + 1
                if start != -1 and end > 0:
                    return json.loads(raw[start:end])
            except Exception:
                continue

        return {
            "core_problem": user_input.get("problem", "")[:60],
            "main_pain":    "unclear",
            "environment":  "unknown",
            "target_users": user_input.get("target_users", "general users")
        }
