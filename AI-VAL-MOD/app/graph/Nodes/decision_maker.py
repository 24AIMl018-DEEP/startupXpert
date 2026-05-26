from app.graph.state import ValidatorState

# Minimum chars of raw data considered "enough evidence"
EVIDENCE_THRESHOLD = 500

# Explains WHY each category maps to its platforms
DOMAIN_REASONING = {
    "B2B/SAAS/API-WRAPPER": {
        "platforms": ["StackOverflow", "GitHub", "HackerNews", "Dev.to"],
        "reason": "Category: B2B/SaaS/API-Wrapper. Hunting for platform risk, enterprise friction, and free OSS alternatives. Developers document these pain points on StackOverflow, GitHub Issues, HackerNews, and Dev.to."
    },
    "B2C/CONSUMER": {
        "platforms": ["HackerNews", "Dev.to", "DuckDuckGo"],
        "reason": "Category: B2C/Consumer. Hunting for high CAC, low retention, and free alternatives. HackerNews covers early adopter sentiment. DDG covers blogs and review sites. WARNING: Reddit/Instagram/TikTok not yet connected."
    },
    "MARKETPLACE": {
        "platforms": ["HackerNews", "DuckDuckGo"],
        "reason": "Category: Marketplace. Hunting for cold-start problem and unit economic failure. HackerNews has deep founder discussions on marketplace dynamics. DDG covers graveyard startups and case studies."
    },
    "HARDWARE/DEEPTECH": {
        "platforms": ["HackerNews", "GitHub", "DuckDuckGo"],
        "reason": "Category: Hardware/DeepTech. Hunting for BOM costs, physics constraints, and supply chain limits. HackerNews has hardware founder discussions. GitHub has open hardware projects. DDG covers manufacturer and supplier data."
    },
    "REGULATED/MEDTECH": {
        "platforms": ["DuckDuckGo", "HackerNews"],
        "reason": "Category: Regulated/MedTech. Hunting for FDA/SEC compliance blockers and liability risk. DDG is primary since regulatory data lives on government and legal sites, not developer forums."
    },
}

def evaluate_evidence(state: ValidatorState):
    print("--- [NODE] DECISION MAKER: Evaluating Evidence Quality ---")

    domain        = state.get("category", "B2C/CONSUMER")
    claim         = state.get("extracted_claim", state["pitch"])
    risk_focus    = state.get("primary_risk_focus", "")
    raw_api       = state.get("raw_api_data", "")
    decision_log  = list(state.get("decision_log", []))

    evidence_len  = len(raw_api.strip())
    has_so        = "[SO]" in raw_api
    has_gh        = "[GH]" in raw_api
    has_hn        = "[HN]" in raw_api
    has_devto     = "[DEV.TO]" in raw_api
    has_blog      = "[BLOG]" in raw_api

    sources_found = [s for s, flag in [
        ("StackOverflow", has_so), ("GitHub", has_gh),
        ("HackerNews", has_hn), ("Dev.to", has_devto), ("Blogs", has_blog)
    ] if flag]

    # --- Decision 0: Explain WHY these platforms were chosen for this category ---
    domain_info = DOMAIN_REASONING.get(domain, DOMAIN_REASONING["B2C/CONSUMER"])
    decision_log.insert(0,
        f"[CATEGORY ROUTING] {domain_info['reason']} "
        f"Platforms selected: {', '.join(domain_info['platforms'])}. "
        f"Risk being hunted: {risk_focus}"
    )

    # --- Decision 1: Is there enough evidence? ---
    if evidence_len < EVIDENCE_THRESHOLD:
        decision_log.append(
            f"[DECISION] Evidence too thin ({evidence_len} chars). "
            f"Domain '{domain}' may not have strong community presence on tech platforms. "
            f"Confidence will be LOW."
        )
    else:
        decision_log.append(
            f"[DECISION] Sufficient evidence collected ({evidence_len} chars) "
            f"from: {', '.join(sources_found) if sources_found else 'unknown sources'}."
        )

    # --- Decision 2: Domain-source mismatch warning ---
    if domain == "B2C/CONSUMER" and not has_hn and not has_devto:
        decision_log.append(
            "[DECISION] WARNING — Consumer app validated without HackerNews or Dev.to data. "
            "Results may not reflect real consumer sentiment. "
            "Consider adding Reddit/Instagram/TikTok sources."
        )

    if domain == "B2B/SAAS/API-WRAPPER" and not has_so and not has_gh:
        decision_log.append(
            "[DECISION] WARNING — SaaS/API tool validated without StackOverflow or GitHub data. "
            "Platform risk and OSS alternative evidence is missing."
        )

    # --- Decision 3: Confidence verdict ---
    if evidence_len == 0:
        confidence_verdict = "NO EVIDENCE — all sources returned empty. Report will be speculative."
    elif evidence_len < EVIDENCE_THRESHOLD:
        confidence_verdict = f"LOW — only {evidence_len} chars of evidence from {len(sources_found)} source(s)."
    elif len(sources_found) >= 3:
        confidence_verdict = f"HIGH — {evidence_len} chars across {len(sources_found)} independent sources: {', '.join(sources_found)}."
    else:
        confidence_verdict = f"MEDIUM — {evidence_len} chars from {len(sources_found)} source(s): {', '.join(sources_found)}."

    decision_log.append(f"[CONFIDENCE] {confidence_verdict}")

    print(f"[DECISION MAKER] Category: {domain} | Verdict: {confidence_verdict}")

    return {"decision_log": decision_log}
