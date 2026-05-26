from typing import TypedDict

class ValidatorState(TypedDict):
    pitch: str
    category: str            # HARDWARE/DEEPTECH | REGULATED/MEDTECH | MARKETPLACE | B2B/SAAS/API-WRAPPER | B2C/CONSUMER
    primary_risk_focus: str  # 1-sentence fatal flaw the agent is hunting
    extracted_claim: str     # core pain point assumption
    community_target: str    # HackerNews | Reddit | Dev.to
    community_queries: list[str]
    web_queries: list[str]
    raw_web_data: str
    raw_api_data: str
    filtered_chunks: list[str]
    decision_log: list[str]
    final_report: dict
