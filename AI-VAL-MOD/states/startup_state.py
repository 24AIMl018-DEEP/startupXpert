from typing import TypedDict, Dict, List, Any, Optional


# ── Sub-shapes (mirrors JSON output exactly) ───────────────────────────────────

class ClusterSignal(TypedDict, total=False):
    """
    Shape of one cluster entry in intelligence.compressed.*_clusters
    AND in the saved JSON output.

    ── Produced by: compression_intelligence_service.py ──
    ── Saved to JSON by: build_output_json() in main.py ──
    """
    cluster_id:          int           # HDBSCAN cluster label
    size:                int           # number of posts grouped in this cluster
    summary:             str           # LLM 1-sentence insight (grounded in extracted patterns)
    sentiment_label:     str           # "negative" | "neutral" | "positive"
    avg_sentiment:       float         # signed avg score across cluster (-1.0 to +1.0)
    urgency_count:       int           # total urgency regex hits across all posts
    workaround_count:    int           # total workaround regex hits across all posts
    spending_count:      int           # total spending/money regex hits across all posts
    top_keywords:        List[str]     # top 8 keywords by frequency (TF-IDF, no stopwords)
    top_competitors:     List[str]     # top 5 competitor/tool mentions (spaCy ORG + brands)

    # ── Pattern extraction (NLP-extracted BEFORE LLM — prevents hallucination) ──
    repeated_complaints: List[str]     # 2-3 word n-grams repeated across cluster posts
    emotional_patterns:  List[str]     # top emotion words by frequency (hate/broken/trash...)

    # ── Internal only (NOT saved to JSON output) ──────────────────────────────
    representative_text: str           # text closest to cluster centroid (MiniLM)
    top_posts:           List[str]     # top 5 posts by relevance score (excluded from JSON)
    sentiment:           Dict[str, Any]  # {label, score} — legacy compat for founder_intelligence
    high_pain_sample:    str           # highest pain_intensity post in cluster (internal only)


class CompressedIntelligence(TypedDict, total=False):
    """
    Shape of intelligence["compressed"].
    Produced by: compression_intelligence_node.py
    Saved to JSON by: build_output_json() → clean_intelligence
    """
    # ── Flat summaries (LLM 1-sentence per cluster, quick access) ─────────────
    top_pains:          List[str]           # LLM summaries of problem_clusters
    behavior_patterns:  List[str]           # LLM summaries of behavior_clusters
    spending_patterns:  List[str]           # LLM summaries of spending_clusters

    # ── Full cluster intelligence ──────────────────────────────────────────────
    problem_clusters:   List[ClusterSignal]   # pain/frustration theme clusters
    behavior_clusters:  List[ClusterSignal]   # workaround/habit theme clusters
    spending_clusters:  List[ClusterSignal]   # payment/spending theme clusters


class EvidenceCounts(TypedDict, total=False):
    """
    Shape of meta.evidence_counts in JSON output.
    Counts only — no raw text saved to JSON.
    """
    raw_collected:      int   # total internet posts fetched
    problem_cleaned:    int   # posts kept after semantic filter (problem intent)
    behavior_cleaned:   int   # posts kept after semantic filter (behavior intent)
    spending_cleaned:   int   # posts kept after semantic filter (spending intent)
    problem_clusters:   int   # HDBSCAN clusters found (problem intent)
    behavior_clusters:  int   # HDBSCAN clusters found (behavior intent)
    spending_clusters:  int   # HDBSCAN clusters found (spending intent)


class OutputMeta(TypedDict, total=False):
    """
    Shape of the top-level "meta" block in the JSON output file.
    Produced by: build_output_json() in main.py
    """
    generated_at:     str            # ISO 8601 timestamp of run
    elapsed_seconds:  float          # total pipeline wall-clock time
    trend_score:      float          # Google Trends avg interest score (0–100)
    trend_keyword:    str            # keyword used for trends lookup
    genre:            str            # top problem genre (from GenreService)
    confidence_score: float          # cosine similarity score of genre match
    top_genres:       List[Dict[str, Any]]  # [{genre, score}, ...] top 3
    evidence_counts:  EvidenceCounts


# ── Main pipeline state ────────────────────────────────────────────────────────

class StartupState(TypedDict, total=False):
    """
    Shared state flowing through the entire LangGraph pipeline.

    Field presence by node:
      genre_node             → genre, top_genres, confidence_score
      structure_node         → structured_problem
      query_node             → search_queries, trend_keyword
      evidence_node          → evidence.{raw,problem,behavior,spending}, trend_score
      cleaning_node          → evidence.{problem,behavior,spending}_cleaned
      clustering_node        → evidence.{problem,behavior,spending}_clustered
      compression_intel_node → intelligence.compressed
      founder_report_node    → reasoning.founder_report

    JSON output (build_output_json in main.py) includes:
      meta, user_input, structured_problem, search_queries,
      intelligence.compressed (signals only, no raw text),
      reasoning.founder_report
    """

    # ── [INPUT] ───────────────────────────────────────────────────────────────
    problem:    str             # raw problem string from founder
    user_input: Dict[str, str]
    # user_input["problem"]           → raw problem description
    # user_input["target_users"]      → who experiences the pain
    # user_input["current_solutions"] → what exists today
    # user_input["why_bad"]           → why current solutions fail
    # user_input["proposed_solution"] → founder's proposed solution

    # ── [GENRE NODE → JSON: meta.genre, meta.top_genres, meta.confidence_score]
    genre:            str              # top matched genre label
    top_genres:       List[Dict[str, Any]]  # [{genre: str, score: float}, ...]
    confidence_score: float            # cosine similarity of top genre match

    # ── [STRUCTURE NODE → JSON: structured_problem] ───────────────────────────
    structured_problem: Dict[str, str]
    # structured_problem["core_problem"]  → specific 1-phrase problem
    # structured_problem["main_pain"]     → exact user frustration
    # structured_problem["environment"]   → where the pain occurs
    # structured_problem["target_users"]  → real humans who suffer daily

    # ── [QUERY NODE → JSON: search_queries, meta.trend_keyword] ──────────────
    search_queries: Dict[str, List[str]]
    # search_queries["problem_queries"]   → 6 complaint/frustration queries
    # search_queries["behavior_queries"]  → 6 workaround/habit queries
    # search_queries["spending_queries"]  → 6 economic/payment queries

    trend_keyword: str    # extracted from core_problem for Google Trends

    # ── [EVIDENCE NODE → JSON: meta.evidence_counts, meta.trend_score] ───────
    trend_score: float    # Google Trends avg interest score (0–100)

    evidence: Dict[str, Any]
    #
    # Set by evidence_node (raw — NOT saved to JSON):
    #   evidence["raw"]               List[Dict]  all posts combined
    #   evidence["problem"]           List[Dict]  problem-intent search results
    #   evidence["behavior"]          List[Dict]  behavior-intent search results
    #   evidence["spending"]          List[Dict]  spending-intent search results
    #
    #   Each Dict shape (from SearchCollector v2):
    #     {"text": str, "source": str, "url": str, "source_weight": int}
    #     source_weight: Reddit=10, Steam/AppStore=9, YouTube/Discord=8,
    #                    Twitter=7, Quora=6, Blogs=2, PDFs=1
    #
    # Set by cleaning_node (NOT saved to JSON — only counts saved):
    #   evidence["problem_cleaned"]   List[Dict]:
    #     {"text": str, "relevance_score": float, "raw_sim": float,
    #      "source": str, "url": str, "source_weight": int}
    #     relevance_score = semantic_sim × source_weight_multiplier
    #     Reddit (w=10) × 1.40, Blogs (w=2) × 0.80, PDFs (w=1) × 0.60
    #   evidence["behavior_cleaned"]  List[Dict]  same shape
    #   evidence["spending_cleaned"]  List[Dict]  same shape
    #
    # Set by clustering_node (NOT saved to JSON — only counts saved):
    #   evidence["problem_clustered"]  List[Dict]:
    #     {"cluster_id": int, "size": int,
    #      "representative_text": str, "relevance_score": float,
    #      "top_posts": List[str]}
    #   evidence["behavior_clustered"] List[Dict]  same shape
    #   evidence["spending_clustered"] List[Dict]  same shape
    #
    # Only evidence_counts (integers) are saved to JSON — never the raw text.

    # ── [COMPRESSION INTELLIGENCE NODE → JSON: intelligence] ─────────────────
    intelligence: Dict[str, Any]
    # intelligence["compressed"] → CompressedIntelligence
    #
    # Saved to JSON (signals only — top_posts and representative_text excluded):
    #   compressed["top_pains"]          List[str]          LLM summaries of problem clusters
    #   compressed["behavior_patterns"]  List[str]          LLM summaries of behavior clusters
    #   compressed["spending_patterns"]  List[str]          LLM summaries of spending clusters
    #   compressed["problem_clusters"]   List[ClusterSignal]
    #     Each ClusterSignal in JSON contains:
    #       cluster_id      int
    #       size            int
    #       summary         str    ← LLM 1-sentence (input: structured signals JSON)
    #       sentiment_label str    ← "negative" | "neutral" | "positive"
    #       avg_sentiment   float  ← HuggingFace cardiffnlp model, aggregated
    #       urgency_count   int    ← regex hits: urgent|ASAP|stuck|blocking|...
    #       workaround_count int   ← regex hits: manually|instead|excel|hack|...
    #       spending_count  int    ← regex hits: $|paying|cost|budget|bought|...
    #       top_keywords    List[str]  ← TF-IDF frequency, stopwords removed
    #       top_competitors List[str]  ← spaCy ORG/PRODUCT + known brand list
    #   compressed["behavior_clusters"]  List[ClusterSignal]  same shape
    #   compressed["spending_clusters"]  List[ClusterSignal]  same shape

    # ── [FOUNDER REPORT NODE → JSON: reasoning.founder_report] ───────────────
    reasoning: Dict[str, Any]
    # reasoning["founder_report"] → str
    #   YC-style LLM analysis.
    #   Input to LLM: compressed cluster summaries + signal counts (NOT raw posts)
    #   Output: candid founder-facing analysis referencing real signals
