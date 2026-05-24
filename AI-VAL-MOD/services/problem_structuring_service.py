import json
from services.llm_service import ask_llm


class ProblemStructuringService:

    def run(self, problem: str) -> dict:

        prompt = f"""You are a startup problem analyst. Extract a precise structure from the problem statement below.

Problem:
{problem}

Respond ONLY with valid JSON:
{{
  "core_problem": "one short phrase describing the specific problem",
  "main_pain": "the exact emotional or physical frustration the user feels",
  "environment": "the specific place or context where this pain happens",
  "target_users": "real humans who suffer this pain daily — use plain human labels like: daily commuters, hospital patients, bank customers, retail shoppers, students. NOT solution builders or developers."
}}

Strict rules:
- core_problem: problem only, no solution language
- main_pain: describe the suffering, not the feature needed
- environment: physical or digital location, be specific
- target_users: people who FEEL the pain, not people who BUILD for it
- max 10 words per field
- No explanation. No extra text. Only JSON."""

        raw   = ask_llm(prompt)
        start = raw.find("{")
        end   = raw.rfind("}") + 1

        return json.loads(raw[start:end])
