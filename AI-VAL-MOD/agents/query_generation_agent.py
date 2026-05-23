import json
from agents.base_agent import BaseAgent
from states.startup_state import StartupState
from services.llm_service import ask_llm


class QueryGenerationAgent(BaseAgent):

    def run(self, state: StartupState) -> StartupState:

        sp = state["structured_problem"]

        prompt = f"""You are a search query generator. Generate 6 search queries to find real user complaints and evidence for this problem.

Core Problem: {sp['core_problem']}
Main Pain: {sp['main_pain']}
Environment: {sp['environment']}

Respond ONLY with valid JSON in this exact format:
{{
  "queries": [
    "query one",
    "query two",
    "query three",
    "query four",
    "query five",
    "query six"
  ]
}}

No explanation. No extra text. Only JSON."""

        raw = ask_llm(prompt)

        start = raw.find("{")
        end = raw.rfind("}") + 1
        result = json.loads(raw[start:end])

        state["search_queries"] = result["queries"]
        return state
