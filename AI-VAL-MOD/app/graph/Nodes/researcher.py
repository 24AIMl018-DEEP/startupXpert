from app.graph.state import ValidatorState
from app.services.scraper_web import fetch_web_data
from app.services.scraper_apis import (
    _hn_search, _stackoverflow_search, _github_search, _devto_search, _ddg_search,
)
from app.core.config import settings

FILLER_THRESHOLD = 3

# Maps community_target chosen by planner to the actual search function
COMMUNITY_TARGET_MAP = {
    "HackerNews": _hn_search,
    "Dev.to":     _devto_search,
    "Reddit":     _ddg_search,   # Reddit has no free API — DDG searches reddit.com results
}

# Backup sources per category when community target returns nothing
CATEGORY_BACKUP_MAP = {
    "HARDWARE/DEEPTECH":    [_hn_search, _github_search, _ddg_search],
    "REGULATED/MEDTECH":    [_ddg_search, _hn_search],
    "MARKETPLACE":          [_hn_search, _ddg_search],
    "B2B/SAAS/API-WRAPPER": [_stackoverflow_search, _github_search, _hn_search, _devto_search],
    "B2C/CONSUMER":         [_hn_search, _devto_search, _ddg_search],
}

def _blog_fallback(query: str) -> list[str]:
    from duckduckgo_search import DDGS
    results = []
    with DDGS() as ddgs:
        for r in ddgs.text(f"{query} blog review", max_results=5):
            results.append(
                f"[BLOG] {r.get('title', '')}\n{r.get('href', '')}\n{r.get('body', '')[:300]}"
            )
    return results


def fetch_market_data(state: ValidatorState):
    category         = state.get("category", "B2C/CONSUMER")
    community_target = state.get("community_target", "HackerNews")
    queries          = state.get("community_queries", [])
    print(f"--- [NODE] RESEARCHER: Category='{category}' | Community='{community_target}' ---")

    decision_log = []
    all_results  = []

    primary_fn     = COMMUNITY_TARGET_MAP.get(community_target, _hn_search)
    backup_sources = [s for s in CATEGORY_BACKUP_MAP.get(category, [_ddg_search]) if s != primary_fn]

    for query in queries:
        query_results    = []
        sources_with_data = []

        # Step 1 — primary community source chosen by planner
        try:
            results = primary_fn(query)
            if results:
                query_results.extend(results)
                sources_with_data.append(community_target)
        except Exception as e:
            decision_log.append(f"[SKIP] {community_target} failed for '{query}': {e}")

        if sources_with_data:
            decision_log.append(f"[PRIMARY] '{query}' → data found on: {community_target}")
        else:
            decision_log.append(
                f"[PRIMARY] '{query}' → no data on {community_target}. Trying category backups."
            )

            # Step 2 — category-specific backup sources
            backup_hits = []
            for source_fn in backup_sources:
                name = source_fn.__name__.replace("_", "").upper()
                try:
                    results = source_fn(query)
                    if results:
                        query_results.extend(results)
                        backup_hits.append(name)
                except Exception as e:
                    decision_log.append(f"[SKIP] {name} backup failed for '{query}': {e}")

            if backup_hits:
                decision_log.append(f"[BACKUP] '{query}' → data found on: {', '.join(backup_hits)}")
            else:
                decision_log.append(
                    f"[BACKUP] '{query}' → no data on backup sources. Trying blog fallback."
                )
                # Step 3 — blog fallback
                try:
                    blog_results = _blog_fallback(query)
                    if blog_results:
                        query_results.extend(blog_results)
                        decision_log.append(
                            f"[BLOG FALLBACK] '{query}' → found {len(blog_results)} blog results."
                        )
                    else:
                        decision_log.append(f"[NO DATA] '{query}' → exhausted all sources.")
                except Exception as e:
                    decision_log.append(f"[NO DATA] '{query}' → blog fallback failed: {e}")

        if query_results:
            all_results.append(f"QUERY: {query}\n" + "\n".join(query_results))

            # Broad DDG filler — appended when specific results are thin
            if len(query_results) < FILLER_THRESHOLD:
                try:
                    broad = _ddg_search(query)
                    if broad:
                        all_results.append(
                            f"[LOW-PRIORITY BROAD SEARCH] QUERY: {query}\n" + "\n".join(broad)
                        )
                        decision_log.append(
                            f"[BROAD FILLER] '{query}' — thin results ({len(query_results)}), "
                            f"added {len(broad)} broad DDG results as low-priority filler."
                        )
                except Exception as e:
                    decision_log.append(f"[BROAD FILLER] DDG failed for '{query}': {e}")
        else:
            # Nothing at all — broad DDG is the only option
            try:
                broad = _ddg_search(query)
                if broad:
                    all_results.append(f"[BROAD SEARCH ONLY] QUERY: {query}\n" + "\n".join(broad))
                    decision_log.append(
                        f"[BROAD FALLBACK] '{query}' — all sources empty, "
                        f"using {len(broad)} DDG broad results as sole evidence."
                    )
                else:
                    decision_log.append(f"[NO DATA] '{query}' — exhausted all sources including DDG.")
            except Exception as e:
                decision_log.append(f"[NO DATA] '{query}' — broad DDG fallback failed: {e}")

    # Web queries via Tavily (only if key exists)
    web_queries = state.get("web_queries", [])
    raw_web = "No web data."
    if web_queries and settings.TAVILY_API_KEY:
        raw_web = fetch_web_data(web_queries)
        decision_log.append(f"[WEB] Tavily searched {len(web_queries)} web queries.")
    elif web_queries:
        # Fallback: use DDG for web queries too when Tavily key is missing
        web_results = []
        for q in web_queries:
            try:
                web_results.extend(_ddg_search(q))
                decision_log.append(f"[WEB] No Tavily key — used DDG for web query: '{q}'")
            except Exception as e:
                decision_log.append(f"[WEB] DDG web fallback failed for '{q}': {e}")
        raw_web = "\n\n---\n\n".join(web_results) if web_results else "No web data."

    raw_api = "\n\n======\n\n".join(all_results) if all_results else "No API data found."

    print("[RESEARCHER] Decision log:\n" + "\n".join(decision_log))

    return {
        "raw_web_data": raw_web,
        "raw_api_data": raw_api,
        "decision_log": decision_log,
    }
