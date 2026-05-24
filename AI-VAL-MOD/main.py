from graph.startup_graph import run_pipeline

W = 60

PROBLEM = """
People feel sad when their phone battery goes below 20%, so they want an AI-powered emotional support app that talks to them during low battery moments and motivates them until charging is available. The app would detect “battery anxiety,” generate calming conversations, and create a community of users sharing their low-battery struggles daily. It would also recommend “battery healing music” and track emotional stress caused by charging speed. The startup would target smartphone users who panic when their phone is about to die and want emotional comfort instead of just a charger.
"""

print("=" * W)
print("  STARTUP VALIDATION PIPELINE")
print("  Graph : pipeline_graph.png")
print("=" * W)
print("")

state = run_pipeline(PROBLEM)

# ── GENRE ─────────────────────────────────────────────────
print("\n" + "=" * W)
print("  GENRE")
print("=" * W)
print(f"\n  Genre      : {state['genre']}")
print(f"  Confidence : {state['confidence_score']}")
for i, g in enumerate(state["top_genres"], 1):
    print(f"    {i}. [{g['score']}]  {g['genre']}")

# ── STRUCTURED PROBLEM ────────────────────────────────────
print("\n" + "=" * W)
print("  STRUCTURED PROBLEM")
print("=" * W)
sp = state["structured_problem"]
print(f"\n  Core Problem : {sp['core_problem']}")
print(f"  Main Pain    : {sp['main_pain']}")
print(f"  Environment  : {sp['environment']}")
print(f"  Target Users : {sp['target_users']}")

# ── SEARCH QUERIES ────────────────────────────────────────
print("\n" + "=" * W)
print("  SEARCH QUERIES")
print("=" * W)
for intent, queries in state["search_queries"].items():
    print(f"\n  [{intent.upper()}]")
    for i, q in enumerate(queries, 1):
        print(f"    {i}. {q}")

# ── EVIDENCE ──────────────────────────────────────────────
print("\n" + "=" * W)
print("  EVIDENCE")
print("=" * W)
print(f"\n  Trend Keyword : {state['trend_keyword']}")
print(f"  Trend Score   : {state['trend_score']}")
ev = state["evidence"]
for intent in ["problem", "behavior", "spending"]:
    raw     = len(ev.get(intent, []))
    cleaned = len(ev.get(f"{intent}_cleaned", []))
    cluster = len(ev.get(f"{intent}_clustered", []))
    print(f"\n  [{intent.upper()}]")
    print(f"    Raw: {raw}  |  Cleaned: {cleaned}  |  Clusters: {cluster}")

# ── COMPRESSED INTELLIGENCE ───────────────────────────────
print("\n" + "=" * W)
print("  COMPRESSED INTELLIGENCE")
print("=" * W)
ci = state["intelligence"].get("compressed", {})

print(f"\n  Top Pains:")
for p in ci.get("top_pains", []):
    print(f"    - {p}")

print(f"\n  Behavior Patterns:")
for p in ci.get("behavior_patterns", []):
    print(f"    - {p}")

print(f"\n  Spending Patterns:")
for p in ci.get("spending_patterns", []):
    print(f"    - {p}")

print(f"\n  Sentiment Per Cluster:")
for intent, sent_key in [
    ("PROBLEM",  "problem_sentiment"),
    ("BEHAVIOR", "behavior_sentiment"),
    ("SPENDING", "spending_sentiment")
]:
    sentiments = ci.get(sent_key, [])
    if not sentiments:
        continue
    print(f"\n  [{intent}]")
    for i, sent in enumerate(sentiments, 1):
        print(f"    {i}. {sent.get('label')} ({sent.get('score')})") 

# ── FOUNDER INTELLIGENCE REPORT ───────────────────────────
print("\n" + "=" * W)
print("  FOUNDER INTELLIGENCE REPORT")
print("=" * W)
report = state.get("reasoning", {}).get("founder_report", "")
print(f"\n{report}\n")

print("\n" + "=" * W)
print("  DONE")
print("=" * W + "\n")
