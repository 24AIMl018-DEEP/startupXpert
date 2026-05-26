import json
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.config import settings
from app.core.prompts import PLANNER_PROMPT
from app.graph.state import ValidatorState

def generate_queries(state: ValidatorState):
    print("--- [NODE] PLANNER: Classifying Risk + Generating Queries ---")
    pitch = state["pitch"]

    llm = ChatGroq(model=settings.LLM_MODEL, api_key=settings.GROQ_API_KEY, temperature=0)
    messages = [
        SystemMessage(content=PLANNER_PROMPT),
        HumanMessage(content=f"STARTUP PITCH: {pitch}")
    ]

    response = llm.invoke(messages).content

    try:
        clean = response.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(clean)
    except json.JSONDecodeError:
        print("[Error] Planner failed to output valid JSON. Defaulting.")
        parsed = {
            "category": "B2C/CONSUMER",
            "primary_risk_focus": "Unknown risk — JSON parse failed.",
            "community_target": "HackerNews",
            "community_queries": [pitch],
            "web_queries": [pitch],
        }

    print(f"[PLANNER] Category: {parsed.get('category')} | Risk: {parsed.get('primary_risk_focus')}")

    return {
        "category":           parsed.get("category", "B2C/CONSUMER"),
        "primary_risk_focus": parsed.get("primary_risk_focus", ""),
        "extracted_claim":    parsed.get("primary_risk_focus", pitch),  # use risk focus as semantic anchor
        "community_target":   parsed.get("community_target", "HackerNews"),
        "community_queries":  parsed.get("community_queries", []),
        "web_queries":        parsed.get("web_queries", []),
    }
