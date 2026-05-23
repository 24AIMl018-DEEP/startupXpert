from typing import TypedDict, List, Dict, Any


class StartupState(TypedDict, total=False):

    problem: str

    structured_problem: Dict[str, str]
    search_queries: List[str]

    genre: str
    top_genres: List[Dict[str, Any]]
    confidence_score: float

    raw_evidence: List[str]
    trend_keyword: str
    trend_score: float

    cleaned_evidence: List[Dict[str, Any]]
    
    compressed_evidence: List[Dict[str, Any]]
    