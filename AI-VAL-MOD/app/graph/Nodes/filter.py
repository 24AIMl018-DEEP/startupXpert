from app.graph.state import ValidatorState
from app.services.chunking_engine import filter_relevant_chunks

def filter_noise(state: ValidatorState):
    print("--- [NODE] FILTER: Cosine Similarity Ranking ---")

    # primary_risk_focus is the sharpest anchor — it's the exact fatal flaw being hunted
    claim = state.get("primary_risk_focus") or state.get("extracted_claim") or state["pitch"]
    raw_web = state.get("raw_web_data", "")
    raw_api = state.get("raw_api_data", "")

    print(f"\n[FILTER] Claim used as anchor: {claim}")
    print(f"[FILTER] Raw API data length: {len(raw_api)} chars")
    print(f"[FILTER] Raw Web data length: {len(raw_web)} chars")

    combined = f"WEB DATA:\n{raw_web}\n\nAPI DATA:\n{raw_api}"
    top_chunks = filter_relevant_chunks(combined, claim, top_k=5)

    print(f"[FILTER] Total chunks after ranking: {len(top_chunks)}")
    for i, chunk in enumerate(top_chunks):
        print(f"\n[CHUNK {i+1}]\n{chunk[:300]}...")

    return {"filtered_chunks": top_chunks}
