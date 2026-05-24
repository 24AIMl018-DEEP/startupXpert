from graph.startup_graph import run_pipeline

W  = 60
W2 = 50

PROBLEM = """
Citizens repeatedly visit government offices because
processes, documentation, and queues are unclear.
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
sq = state["search_queries"]
for intent, queries in sq.items():
    print(f"\n  [{intent.upper()}]")
    for i, q in enumerate(queries, 1):
        print(f"    {i}. {q}")

# ── EVIDENCE COUNTS ───────────────────────────────────────
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

# ── PER INTENT INTELLIGENCE ───────────────────────────────
for intent in ["problem", "behavior", "spending"]:

    print("\n" + "=" * W)
    print(f"  [{intent.upper()} INTELLIGENCE]")
    print("=" * W)

    rm = state["intelligence"].get(f"{intent}_raw_market", {})
    rv = state["intelligence"].get(f"{intent}_market", {})
    ci = state["intelligence"].get(f"{intent}_cluster_intelligence", {})
    pr = state["intelligence"].get(f"{intent}_reasoning", {})

    print(f"\n  Discussion Volume : {rm.get('discussion_volume', 0)}")
    print(f"  Market Demand     : {rm.get('market_demand', 0)}")
    print(f"  Pain Intensity    : {rv.get('pain_intensity', 0)}")
    print(f"  Cluster Strength  : {ci.get('cluster_strength', 0)}")
    print(f"  Unique Patterns   : {ci.get('unique_patterns', 0)}")

    print(f"\n  Extracted Pain Signals:")
    for p in rv.get("extracted_pains", [])[:3]:
        print(f"    [{p['size']}]  {p['pain_signal'][:90]}")

    print(f"\n  Root Frustrations:")
    for r in pr.get("root_frustrations", [])[:3]:
        print(f"    - {r[:90]}")

    print(f"\n  Hidden Pains:")
    for h in pr.get("hidden_pains", [])[:2]:
        print(f"    - {h[:90]}")

    print(f"\n  Opportunity Gaps:")
    for o in pr.get("opportunity_gaps", [])[:2]:
        print(f"    - {o[:90]}")

# ── COMPRESSED INTELLIGENCE ──────────────────────────────
print("\n" + "=" * W)
print("  COMPRESSED INTELLIGENCE")
print("=" * W)
ci = state["intelligence"].get("compressed", {})

for intent in ["problem", "behavior", "spending"]:
    s = ci.get(f"{intent}_summary", {})
    if not s:
        continue
    print(f"\n  [{intent.upper()}]")
    print(f"  Total Evidence  : {s.get('total_evidence', 0)}")
    print(f"  Clustered       : {s.get('clustered_count', 0)}  ({s.get('coverage_ratio', 0)} coverage)")
    print(f"  Market Severity : {s.get('market_severity', 0)}")
    print(f"  Strongest Pain  : {s.get('strongest_pain', '')[:100]}")
    print(f"  Dominant Patterns:")
    for p in s.get("dominant_patterns", [])[:3]:
        print(f"    [{p['frequency']}] [{p['core_emotion']}] {p['key_phrase']}")
        print(f"      {p['centroid'][:100]}")

exec_ctx = ci.get("executive_context", {})
print(f"\n  Pain-Spending Overlap : {exec_ctx.get('pain_spending_overlap', 0)}")
print(f"  Strongest Signal      : {exec_ctx.get('strongest_signal', '')[:100]}")
print(f"  Opportunity Zones:")
for oz in exec_ctx.get("opportunity_zones", [])[:3]:
    print(f"    [{oz['overlap']}] Pain: {oz['pain'][:60]}")
    print(f"           Spend: {oz['spending'][:60]}")

print("\n" + "=" * W)
print("  FINAL STARTUP VERDICT")
print("=" * W)
fs = state.get("reasoning", {}).get("final_summary", {})

print(f"\n  VERDICT   : {fs.get('market_verdict')}")
print(f"  REASON    : {fs.get('verdict_reason')}")
print(f"\n  Pain      : {fs.get('pain_assessment')}")
print(f"  Behavior  : {fs.get('behavior_assessment')}")
print(f"  Spending  : {fs.get('spending_assessment')}")
print(f"\n  Opportunity:")
print(f"  {fs.get('opportunity_statement')}")
print(f"\n  Key Risks:")
for r in fs.get("key_risks", []):
    print(f"    - {r}")
print(f"\n  Recommended Focus:")
print(f"  {fs.get('recommended_focus')}")

print("\n" + "=" * W)
print("  DONE")
print("=" * W + "\n")
