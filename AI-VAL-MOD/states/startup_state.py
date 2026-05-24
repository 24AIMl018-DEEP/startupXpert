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
    raw:                List[str]
    problem:            List[str]
    behavior:           List[str]
    spending:           List[str]
    # cleaned per intent
    problem_cleaned:    List[Dict[str, Any]]
    behavior_cleaned:   List[Dict[str, Any]]
    spending_cleaned:   List[Dict[str, Any]]
    # clustered per intent
    problem_clustered:  List[Dict[str, Any]]
    behavior_clustered: List[Dict[str, Any]]
    spending_clustered: List[Dict[str, Any]]


class ClusterSummary(TypedDict, total=False):
    summary:   str                  # LLM one-sentence summary
    sentiment: Dict[str, Any]       # {label: positive/neutral/negative, score: float}
    size:      int                  # number of evidence items in cluster


class CompressedState(TypedDict, total=False):
    # LLM summaries per intent
    top_pains:          List[str]
    behavior_patterns:  List[str]
    spending_patterns:  List[str]
    # sentiment per cluster per intent
    problem_sentiment:  List[Dict[str, Any]]
    behavior_sentiment: List[Dict[str, Any]]
    spending_sentiment: List[Dict[str, Any]]
    # full cluster details
    problem_clusters:   List[ClusterSummary]
    behavior_clusters:  List[ClusterSummary]
    spending_clusters:  List[ClusterSummary]


class IntelligenceState(TypedDict, total=False):
    compressed: CompressedState


class ReasoningState(TypedDict, total=False):
    founder_report: str          # conversational LLM startup analysis
    final_summary:  Dict[str, Any]


# ── MAIN STATE ────────────────────────────────────────────

class StartupState(TypedDict, total=False):

    problem:       str

    understanding: UnderstandingState
    evidence:      EvidenceState
    intelligence:  IntelligenceState
    reasoning:     ReasoningState
