from typing import TypedDict, Dict, List, Any


# ── SUB-STATES ────────────────────────────────────────────

class UnderstandingState(TypedDict, total=False):
    genre:              str
    top_genres:         List[Dict[str, Any]]
    confidence_score:   float
    structured_problem: Dict[str, str]
    search_queries:     Dict[str, List[str]]
    trend_keyword:      str
    trend_score:        float


class EvidenceState(TypedDict, total=False):
    # raw per intent
    raw:               List[str]
    problem:           List[str]
    behavior:          List[str]
    spending:          List[str]
    # cleaned per intent
    problem_cleaned:   List[Dict[str, Any]]
    behavior_cleaned:  List[Dict[str, Any]]
    spending_cleaned:  List[Dict[str, Any]]
    # clustered per intent
    problem_clustered:  List[Dict[str, Any]]
    behavior_clustered: List[Dict[str, Any]]
    spending_clustered: List[Dict[str, Any]]


class IntelligenceState(TypedDict, total=False):
    # raw market per intent
    problem_raw_market:            Dict[str, Any]
    behavior_raw_market:           Dict[str, Any]
    spending_raw_market:           Dict[str, Any]
    # relevant market per intent
    problem_market:                Dict[str, Any]
    behavior_market:               Dict[str, Any]
    spending_market:               Dict[str, Any]
    # cluster intelligence per intent
    problem_cluster_intelligence:  Dict[str, Any]
    behavior_cluster_intelligence: Dict[str, Any]
    spending_cluster_intelligence: Dict[str, Any]
    # pain reasoning per intent
    problem_reasoning:             Dict[str, Any]
    behavior_reasoning:            Dict[str, Any]
    spending_reasoning:            Dict[str, Any]
    # compression layer
    compressed:                    Dict[str, Any]


class ReasoningState(TypedDict, total=False):
    final_summary: Dict[str, Any]


# ── MAIN STATE ────────────────────────────────────────────

class StartupState(TypedDict, total=False):

    problem:        str

    understanding:  UnderstandingState
    evidence:       EvidenceState
    intelligence:   IntelligenceState
    reasoning:      ReasoningState
