import json
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.config import settings
from app.core.prompts import SYNTHESIZER_PROMPT
from app.graph.state import ValidatorState

def synthesize_json(state: ValidatorState):
    print("--- [NODE] SYNTHESIZER: Generating Final Report ---")
    llm = ChatGroq(model=settings.LLM_MODEL, api_key=settings.GROQ_API_KEY, temperature=0.2)

    pitch      = state["pitch"]
    claim      = state.get("extracted_claim", pitch)
    category   = state.get("category", "")
    risk_focus = state.get("primary_risk_focus", "")
    chunks     = state.get("filtered_chunks", [])
    decision_log = state.get("decision_log", [])
    evidence_string = "\n\n".join(chunks)

    print(f"\n[SYNTHESIZER] Category: {category} | Risk: {risk_focus}")
    print(f"[SYNTHESIZER] Evidence chunks: {len(chunks)} | Length: {len(evidence_string)} chars")

    formatted_prompt = SYNTHESIZER_PROMPT.format(
        category=category, risk_focus=risk_focus, claim=claim, evidence=evidence_string
    )

    messages = [
        SystemMessage(content=formatted_prompt),
        HumanMessage(content=f"STARTUP PITCH: {pitch}\n\nValidate based strictly on the evidence provided.")
    ]

    response = llm.invoke(messages).content

    try:
        clean = response.replace("```json", "").replace("```", "").strip()
        final_report = json.loads(clean)
    except json.JSONDecodeError:
        print("[Error] Final synthesis failed to output valid JSON.")
        final_report = {"error": "Failed to generate structured report", "raw_output": response}

    # Attach the full decision log so the caller can see every routing choice made
    final_report["routing_decisions"] = decision_log

    return {"final_report": final_report}
