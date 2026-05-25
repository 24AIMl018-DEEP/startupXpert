import sys
import os
import time
import json

# add project root to path so services/graph/nodes are importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import streamlit as st

# ── Page config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="StartupXpert — AI Validation",
    page_icon="🚀",
    layout="wide"
)

# ── Styles ────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
    .block-container { padding-top: 2rem; }
    .signal-card {
        background: #1e1e2e;
        border-radius: 10px;
        padding: 1rem 1.2rem;
        margin-bottom: 0.8rem;
        border-left: 4px solid #7c3aed;
    }
    .signal-card.behavior { border-left-color: #0ea5e9; }
    .signal-card.spending { border-left-color: #10b981; }
    .metric-row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .report-box {
        background: #0f172a;
        border-radius: 10px;
        padding: 1.5rem;
        line-height: 1.8;
        font-size: 1.05rem;
    }
</style>
""", unsafe_allow_html=True)


# ── Header ────────────────────────────────────────────────────────────────────
st.title("🚀 StartupXpert — AI Validation Module")
st.caption("Compress internet chaos into business clarity.")
st.divider()


# ── Input Form ────────────────────────────────────────────────────────────────
st.subheader("📝 Founder Input")

with st.form("founder_form"):
    col1, col2 = st.columns(2)

    with col1:
        problem           = st.text_area("What is the core problem?",           height=100, placeholder="e.g. People struggle to find reliable hackathon teammates")
        target_users      = st.text_input("Who experiences this problem?",       placeholder="e.g. college students, indie hackers")
        current_solutions = st.text_input("What do people use today to solve it?", placeholder="e.g. Discord servers, LinkedIn, word of mouth")

    with col2:
        why_bad           = st.text_area("Why do current solutions fail?",       height=100, placeholder="e.g. No skill matching, people ghost, no accountability")
        proposed_solution = st.text_area("What is your proposed solution?",      height=100, placeholder="e.g. AI-matched hackathon team builder with commitment scores")

    submitted = st.form_submit_button("🔍 Run Validation", use_container_width=True, type="primary")


# ── Pipeline execution ────────────────────────────────────────────────────────
if submitted:
    if not problem.strip():
        st.error("Please enter the core problem.")
        st.stop()

    user_input = {
        "problem":            problem.strip(),
        "target_users":       target_users.strip()       or "not provided",
        "current_solutions":  current_solutions.strip()  or "not provided",
        "why_bad":            why_bad.strip()             or "not provided",
        "proposed_solution":  proposed_solution.strip()  or "not provided"
    }

    # ── Progress ──────────────────────────────────────────────────────────────
    progress = st.progress(0, text="Starting pipeline...")
    steps = [
        "Genre Detection",
        "Problem Structuring",
        "Query Generation",
        "Evidence Collection",
        "Cleaning",
        "Clustering",
        "Signal Extraction",
        "Founder Report"
    ]

    status_placeholder = st.empty()

    with st.spinner("Running pipeline — this takes 2-4 minutes..."):
        from graph.startup_graph import build_graph

        initial_state = {
            "problem":      user_input["problem"],
            "user_input":   user_input,
            "evidence":     {},
            "intelligence": {},
            "reasoning":    {}
        }

        graph       = build_graph()
        start       = time.time()
        step_idx    = 0
        final_state = initial_state.copy()

        for step_output in graph.stream(initial_state, stream_mode="updates"):
            node_name = list(step_output.keys())[0]
            # merge node output into final_state
            for k, v in step_output[node_name].items():
                if isinstance(v, dict) and isinstance(final_state.get(k), dict):
                    final_state[k].update(v)
                else:
                    final_state[k] = v
            step_idx  = min(step_idx + 1, len(steps))
            pct       = int((step_idx / len(steps)) * 100)
            label     = steps[step_idx - 1] if step_idx <= len(steps) else "Done"
            progress.progress(pct, text=f"[{step_idx}/{len(steps)}] {label}...")
            status_placeholder.caption(f"✅ {node_name} completed")

        elapsed = time.time() - start

    progress.progress(100, text="Done!")
    status_placeholder.empty()

    st.success(f"Pipeline completed in {elapsed:.1f}s")
    st.divider()

    # ── Results ───────────────────────────────────────────────────────────────
    compressed = final_state.get("intelligence", {}).get("compressed", {})
    evidence   = final_state.get("evidence", {})

    # ── Meta metrics ──────────────────────────────────────────────────────────
    st.subheader("📊 Pipeline Summary")
    m1, m2, m3, m4, m5 = st.columns(5)
    m1.metric("Raw Posts",       len(evidence.get("raw", [])))
    m2.metric("Pain Clusters",   len(compressed.get("problem_clusters",  [])))
    m3.metric("Behavior Clusters", len(compressed.get("behavior_clusters", [])))
    m4.metric("Spending Clusters", len(compressed.get("spending_clusters", [])))
    m5.metric("Trend Score",     final_state.get("trend_score", 0))

    st.divider()

    # ── Genre ─────────────────────────────────────────────────────────────────
    st.subheader("🏷️ Problem Genre")
    genre      = final_state.get("genre", "unknown")
    confidence = final_state.get("confidence_score", 0)
    col_g1, col_g2 = st.columns([3, 1])
    col_g1.markdown(f"**{genre}**")
    col_g2.metric("Confidence", f"{confidence:.2%}")

    with st.expander("Top 3 Genre Matches"):
        for g in final_state.get("top_genres", []):
            st.write(f"- `{g['score']:.3f}` — {g['genre']}")

    st.divider()

    # ── Structured Problem ────────────────────────────────────────────────────
    st.subheader("🔍 Structured Problem")
    sp = final_state.get("structured_problem", {})
    c1, c2 = st.columns(2)
    c1.markdown(f"**Core Problem:** {sp.get('core_problem', '')}")
    c1.markdown(f"**Main Pain:** {sp.get('main_pain', '')}")
    c2.markdown(f"**Environment:** {sp.get('environment', '')}")
    c2.markdown(f"**Target Users:** {sp.get('target_users', '')}")

    st.divider()

    # ── Intelligence Signals ──────────────────────────────────────────────────
    st.subheader("🧠 Compressed Intelligence")

    tab_pain, tab_behavior, tab_spending = st.tabs(["😤 Pain Signals", "🔄 Behavior Signals", "💰 Spending Signals"])

    def render_clusters(tab, cluster_key, color):
        clusters = compressed.get(cluster_key, [])
        if not clusters:
            tab.info("No clusters found for this intent.")
            return
        for i, c in enumerate(clusters, 1):
            with tab.container():
                tab.markdown(f"**Cluster {i}** — {c.get('size', 0)} discussions")
                tab.markdown(f"> {c.get('summary', 'N/A')}")
                col_a, col_b, col_c = tab.columns(3)
                col_a.metric("Sentiment",   c.get("sentiment_label", "N/A"))
                col_b.metric("Urgency",     c.get("urgency_count", 0))
                col_c.metric("Workarounds", c.get("workaround_count", 0))
                kws   = c.get("top_keywords", [])
                comps = c.get("top_competitors", [])
                if kws:
                    tab.caption(f"🔑 Keywords: {', '.join(kws[:6])}")
                if comps:
                    tab.caption(f"🏢 Competitors: {', '.join(comps[:4])}")
                emotions = c.get("emotional_patterns", [])
                if emotions:
                    tab.caption(f"😤 Emotions: {', '.join(emotions)}")
                tab.divider()

    render_clusters(tab_pain,     "problem_clusters",  "#7c3aed")
    render_clusters(tab_behavior, "behavior_clusters", "#0ea5e9")
    render_clusters(tab_spending, "spending_clusters", "#10b981")

    st.divider()

    # ── Founder Report ────────────────────────────────────────────────────────
    st.subheader("🚀 Startup Validation Report")
    report = final_state.get("reasoning", {}).get("founder_report", "")
    if report:
        st.markdown(report)
    else:
        st.warning("Report could not be generated. Check signal extraction.")

    st.divider()

    # ── Download JSON ─────────────────────────────────────────────────────────
    st.subheader("💾 Export Results")

    def build_export(state, elapsed):
        compressed_out = state.get("intelligence", {}).get("compressed", {})
        def clean_cluster(c):
            return {k: v for k, v in c.items() if k != "top_posts"}
        return {
            "meta": {
                "elapsed_seconds": round(elapsed, 2),
                "trend_score":     state.get("trend_score", 0),
                "genre":           state.get("genre", ""),
                "confidence_score": state.get("confidence_score", 0)
            },
            "user_input":         state.get("user_input", {}),
            "structured_problem": state.get("structured_problem", {}),
            "search_queries":     state.get("search_queries", {}),
            "intelligence": {
                "top_pains":         compressed_out.get("top_pains", []),
                "behavior_patterns": compressed_out.get("behavior_patterns", []),
                "spending_patterns": compressed_out.get("spending_patterns", []),
                "problem_clusters":  [clean_cluster(c) for c in compressed_out.get("problem_clusters", [])],
                "behavior_clusters": [clean_cluster(c) for c in compressed_out.get("behavior_clusters", [])],
                "spending_clusters": [clean_cluster(c) for c in compressed_out.get("spending_clusters", [])]
            },
            "reasoning": {"founder_report": report}
        }

    export_data = build_export(final_state, elapsed)
    st.download_button(
        label="⬇️ Download JSON Report",
        data=json.dumps(export_data, indent=2, ensure_ascii=False),
        file_name=f"startupxpert_{int(time.time())}.json",
        mime="application/json",
        use_container_width=True
    )
