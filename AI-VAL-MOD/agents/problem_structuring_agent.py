import json
from agents.base_agent import BaseAgent
from states.startup_state import StartupState
from services.llm_service import ask_llm


class ProblemStructuringAgent(BaseAgent):

    def run(self, state: StartupState) -> StartupState:

        prompt = f"""You are a problem analyst. Extract the core structure from this problem statement.

Problem:
{state['problem']}

Respond ONLY with valid JSON in this exact format:
{{
  "core_problem": "...",
  "main_pain": "...",
  "environment": "...",
  "target_users": "..."
}}

No explanation. No extra text. Only JSON."""

        raw = ask_llm(prompt)

        start = raw.find("{")
        end = raw.rfind("}") + 1
        structured = json.loads(raw[start:end])

        state["structured_problem"] = structured
        return state
