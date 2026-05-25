"""
StartupXpert — AI-VAL-MOD
──────────────────────────
Compress internet chaos into business clarity.

Pipeline:
  Raw Internet Data
        ↓
  Embedding Model (MiniLM)
        ↓
  Vector Space
        ↓
  HDBSCAN Clustering
        ↓
  Multi-Signal Extraction
  (sentiment + keywords + NER + urgency + workaround + spending + competitors)
        ↓
  Noise Filtering
        ↓
  Score Calculation (aggregation per cluster)
        ↓
  LLM Summary (structured signals only — not raw posts)
        ↓
  Startup Validation Report
"""

import sys
import os
import time
import json
from datetime import datetime

# Make sure project root is on path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


DIVIDER = "=" * 64
THIN    = "─" * 64


def print_banner():
    print(f"\n{DIVIDER}")
    print("  STARTUPXPERT  —  AI Validation Module")
    print("  Mission: Compress internet chaos into business clarity")
    print(DIVIDER)


def collect_input() -> dict:
    """Multi-field founder input collection."""
    print("\n  📝  FOUNDER INPUT")
    print(THIN)

    fields = [
        ("problem",            "What is the core problem?              "),
        ("target_users",       "Who experiences this problem?          "),
        ("current_solutions",  "What do people use today to solve it?  "),
        ("why_bad",            "Why do current solutions fail?         "),
        ("proposed_solution",  "What is your proposed solution?        "),
    ]

    user_input = {}
    for key, label in fields:
        value = input(f"  {label}: ").strip()
        user_input[key] = value if value else "not provided"

    return user_input


def print_pipeline_start():
    print(f"\n{DIVIDER}")
    print("  PIPELINE STARTING")
    print(f"  {'Step':<40} {'Status'}")
    print(THIN)
    steps = [
        "[1/8] Genre Detection",
        "[2/8] Problem Structuring",
        "[3/8] Query Generation",
        "[4/8] Evidence Collection (Web Search)",
        "[5/8] Cleaning (Semantic Filter)",
        "[6/8] Clustering (HDBSCAN)",
        "[7/8] Signal Extraction + Compression",
        "[8/8] Founder Report (LLM)"
    ]
    for step in steps:
        print(f"  {step:<40} ⏳")
    print(DIVIDER)


def print_intelligence_summary(state: dict):
    """Print the structured intelligence before the final report."""
    compressed = state.get("intelligence", {}).get("compressed", {})
    if not compressed:
        return

    print(f"\n{DIVIDER}")
    print("  📊  STRUCTURED INTELLIGENCE (what went to LLM)")
    print(DIVIDER)

    intent_map = {
        "problem":  ("problem_clusters",  "PAIN SIGNALS"),
        "behavior": ("behavior_clusters", "BEHAVIOR SIGNALS"),
        "spending": ("spending_clusters", "SPENDING SIGNALS")
    }

    for intent, (cluster_key, label) in intent_map.items():
        clusters = compressed.get(cluster_key, [])
        if not clusters:
            continue

        print(f"\n  ▸ {label}")
        print(THIN)
        for i, c in enumerate(clusters[:3], 1):
            print(f"  Cluster {i} (n={c['size']})")
            print(f"    Summary    : {c.get('summary', 'N/A')}")
            print(f"    Sentiment  : {c.get('sentiment_label', 'N/A')} "
                  f"(avg={c.get('avg_sentiment', 0):.3f})")
            kws   = ", ".join(c.get("top_keywords", [])[:5])
            comps = ", ".join(c.get("top_competitors", [])[:3])
            if kws:
                print(f"    Keywords   : {kws}")
            if comps:
                print(f"    Competitors: {comps}")
            print(f"    Urgency    : {c.get('urgency_count', 0)} signals  |  "
                  f"Workarounds: {c.get('workaround_count', 0)}  |  "
                  f"Spending: {c.get('spending_count', 0)}")
            print()


def print_report(state: dict):
    """Print the final founder validation report."""
    report = state.get("reasoning", {}).get("founder_report", "")

    print(f"\n{DIVIDER}")
    print("  🚀  STARTUP VALIDATION REPORT")
    print(DIVIDER)
    print()

    if report:
        # Wrap paragraphs nicely
        for para in report.split("\n"):
            if para.strip():
                print(f"  {para.strip()}")
            else:
                print()
    else:
        print("  [Report could not be generated — check signal extraction]")

    print(f"\n{DIVIDER}")


def print_meta(state: dict, elapsed: float):
    """Print metadata summary."""
    evidence  = state.get("evidence", {})
    raw_count = len(evidence.get("raw", []))

    problem_clusters  = len(state.get("intelligence", {}).get("compressed", {}).get("problem_clusters", []))
    behavior_clusters = len(state.get("intelligence", {}).get("compressed", {}).get("behavior_clusters", []))
    spending_clusters = len(state.get("intelligence", {}).get("compressed", {}).get("spending_clusters", []))

    trend_score = state.get("trend_score", 0)
    genre       = state.get("genre", "unknown")

    print(f"  📈 Trend Score     : {trend_score}")
    print(f"  🏷️  Problem Genre   : {genre[:50]}")
    print(f"  🔍 Raw Evidence    : {raw_count} internet posts collected")
    print(f"  🧩 Clusters        : {problem_clusters} pain | "
          f"{behavior_clusters} behavior | {spending_clusters} spending")
    print(f"  ⏱️  Time            : {elapsed:.1f}s")
    print(DIVIDER)


# ── Evidence keys to exclude (raw text — not useful in JSON output) ────────────
_EVIDENCE_EXCLUDE = {"raw", "problem", "behavior", "spending",
                     "problem_cleaned", "behavior_cleaned", "spending_cleaned"}


def build_output_json(state: dict, elapsed: float) -> dict:
    """
    Build a clean output dict — everything EXCEPT raw/cleaned evidence strings.

    Includes:
      - meta          (timestamp, elapsed, trend_score, genre)
      - user_input    (what the founder entered)
      - structured_problem
      - search_queries
      - intelligence  (all cluster signals: sentiment, keywords, competitors,
                       urgency, workaround, spending, summaries)
      - reasoning     (founder_report)

    Excludes:
      - evidence.raw, evidence.problem, evidence.behavior, evidence.spending
      - evidence.problem_cleaned, evidence.behavior_cleaned, evidence.spending_cleaned
      - evidence.problem_clustered, evidence.behavior_clustered, evidence.spending_clustered
        (raw post lists inside clusters are also removed — only signals kept)
    """
    compressed = state.get("intelligence", {}).get("compressed", {})

    # Strip top_posts (raw text) from each cluster — keep only signals
    def clean_cluster(c: dict) -> dict:
        return {
            "cluster_id":          c.get("cluster_id"),
            "size":                c.get("size"),
            "summary":             c.get("summary"),
            "sentiment_label":     c.get("sentiment_label"),
            "avg_sentiment":       c.get("avg_sentiment"),
            "urgency_count":       c.get("urgency_count"),
            "workaround_count":    c.get("workaround_count"),
            "spending_count":      c.get("spending_count"),
            "top_keywords":        c.get("top_keywords", []),
            "top_competitors":     c.get("top_competitors", []),
            # NLP-extracted patterns (grounded, not LLM-generated)
            "repeated_complaints": c.get("repeated_complaints", []),
            "emotional_patterns":  c.get("emotional_patterns", [])
        }

    clean_intelligence = {
        "top_pains":         compressed.get("top_pains", []),
        "behavior_patterns": compressed.get("behavior_patterns", []),
        "spending_patterns": compressed.get("spending_patterns", []),
        "problem_clusters":  [clean_cluster(c) for c in compressed.get("problem_clusters", [])],
        "behavior_clusters": [clean_cluster(c) for c in compressed.get("behavior_clusters", [])],
        "spending_clusters": [clean_cluster(c) for c in compressed.get("spending_clusters", [])]
    }

    evidence = state.get("evidence", {})

    return {
        "meta": {
            "generated_at":   datetime.now().isoformat(),
            "elapsed_seconds": round(elapsed, 2),
            "trend_score":    state.get("trend_score", 0),
            "trend_keyword":  state.get("trend_keyword", ""),
            "genre":          state.get("genre", ""),
            "confidence_score": state.get("confidence_score", 0),
            "top_genres":     state.get("top_genres", []),
            "evidence_counts": {
                "raw_collected":     len(evidence.get("raw", [])),
                "problem_cleaned":   len(evidence.get("problem_cleaned", [])),
                "behavior_cleaned":  len(evidence.get("behavior_cleaned", [])),
                "spending_cleaned":  len(evidence.get("spending_cleaned", [])),
                "problem_clusters":  len(evidence.get("problem_clustered", [])),
                "behavior_clusters": len(evidence.get("behavior_clustered", [])),
                "spending_clusters": len(evidence.get("spending_clustered", []))
            }
        },
        "user_input":         state.get("user_input", {}),
        "structured_problem": state.get("structured_problem", {}),
        "search_queries":     state.get("search_queries", {}),
        "intelligence":       clean_intelligence,
        "reasoning": {
            "founder_report": state.get("reasoning", {}).get("founder_report", "")
        }
    }


def save_output_json(state: dict, elapsed: float) -> str:
    """Save pipeline output to outputs/<timestamp>.json. Returns saved file path."""
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "outputs")
    os.makedirs(output_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # Slugify problem for filename
    problem_slug = state.get("problem", "unknown")[:30]
    problem_slug = "".join(c if c.isalnum() else "_" for c in problem_slug).strip("_")
    filename     = f"{timestamp}_{problem_slug}.json"
    filepath     = os.path.join(output_dir, filename)

    output = build_output_json(state, elapsed)

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    return filepath


def run():
    print_banner()
    user_input = collect_input()

    print_pipeline_start()

    from graph.startup_graph import build_graph

    initial_state = {
        "problem":    user_input["problem"],
        "user_input": user_input,
        "evidence":   {},
        "intelligence": {},
        "reasoning":  {}
    }

    graph     = build_graph()
    start     = time.time()

    print(f"\n{DIVIDER}")
    print("  RUNNING PIPELINE...")
    print(DIVIDER)

    final_state = graph.invoke(initial_state)
    elapsed     = time.time() - start

    print_intelligence_summary(final_state)
    print_report(final_state)
    print_meta(final_state, elapsed)

    # ── Save output JSON ──────────────────────────────────────────────────────
    saved_path = save_output_json(final_state, elapsed)
    print(f"\n  💾  Output saved → {saved_path}")
    print(DIVIDER)


if __name__ == "__main__":
    run()
