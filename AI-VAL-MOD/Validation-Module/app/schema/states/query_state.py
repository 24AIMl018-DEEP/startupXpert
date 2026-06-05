from pydantic import BaseModel
from typing import List


class QueryAgentResult(BaseModel):
    agent_name: str
    queries_generated: List[str]
    results_collected: int
    indexed_count: int
    duplicates_dropped: int
    status: str  # success | failed | empty


class QueryPhaseState(BaseModel):
    total_agents: int
    successful_agents: int
    failed_agents: int
    empty_agents: int
    agent_results: List[QueryAgentResult]
    total_docs_indexed: int
