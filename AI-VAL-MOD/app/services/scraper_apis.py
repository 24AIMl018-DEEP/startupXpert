import requests
from app.core.config import settings

HEADERS = {"User-Agent": "StartupValidator/1.0"}


def _hn_search(query: str) -> list[str]:
    """
    Hacker News via Algolia Search API.
    Docs: https://hn.algolia.com/api
    100% free, no auth required.
    """
    url = f"https://hn.algolia.com/api/v1/search?query={requests.utils.quote(query)}&tags=story&hitsPerPage=10"
    r = requests.get(url, headers=HEADERS, timeout=8)
    r.raise_for_status()
    hits = r.json().get("hits", [])
    return [
        f"[HN] {h['title']} (points:{h.get('points', 0)}, comments:{h.get('num_comments', 0)})\n{h.get('url', '')}"
        for h in hits if h.get("title")
    ]


def _stackoverflow_search(query: str) -> list[str]:
    """
    Stack Exchange API v2.3 — /search/advanced endpoint.
    Docs: https://api.stackexchange.com/docs/advanced-search
    Free key raises daily quota from 300 to 10,000 requests.
    Add STACKOVERFLOW_KEY to .env to unlock higher limits.
    """
    params = {
        "order": "desc",
        "sort": "votes",
        "q": query,
        "site": "stackoverflow",
        "pagesize": 10,
        "filter": "default",
    }
    if settings.STACKOVERFLOW_KEY:
        params["key"] = settings.STACKOVERFLOW_KEY

    r = requests.get(
        "https://api.stackexchange.com/2.3/search/advanced",
        params=params,
        headers=HEADERS,
        timeout=8,
    )
    r.raise_for_status()
    items = r.json().get("items", [])
    return [
        f"[SO] {i['title']} (votes:{i.get('score', 0)}, answers:{i.get('answer_count', 0)})\n{i.get('link', '')}"
        for i in items if i.get("title")
    ]


def _github_search(query: str) -> list[str]:
    """
    GitHub REST API — Search Issues endpoint.
    Docs: https://docs.github.com/en/rest/search/search#search-issues-and-pull-requests
    Unauthenticated: 10 req/min. With token: 30 req/min.
    Add GITHUB_TOKEN to .env — any personal access token works.
    """
    headers = {**HEADERS, "Accept": "application/vnd.github+json"}
    if settings.GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {settings.GITHUB_TOKEN}"

    params = {
        "q": f"{query} type:issue",
        "sort": "reactions",
        "order": "desc",
        "per_page": 10,
    }
    r = requests.get(
        "https://api.github.com/search/issues",
        params=params,
        headers=headers,
        timeout=8,
    )
    r.raise_for_status()
    items = r.json().get("items", [])
    return [
        f"[GH] {i['title']} (reactions:{i.get('reactions', {}).get('total_count', 0)})\n{i.get('html_url', '')}"
        for i in items if i.get("title")
    ]


def _devto_search(query: str) -> list[str]:
    """
    Dev.to API — /api/articles endpoint.
    Docs: https://developers.forem.com/api/v1#tag/articles/operation/getArticles
    Real documented params: tag, username, top, per_page.
    No free-text search endpoint exists — we use the first word as a tag proxy.
    100% free, no auth required.
    """
    # Extract the most meaningful single word as a tag (Dev.to tags are single words)
    tag = query.split()[0].lower().strip("?.,")

    r = requests.get(
        "https://dev.to/api/articles",
        params={"tag": tag, "top": 7, "per_page": 10},
        headers=HEADERS,
        timeout=8,
    )
    r.raise_for_status()
    items = r.json() if isinstance(r.json(), list) else []
    return [
        f"[DEV.TO] {i['title']} (reactions:{i.get('public_reactions_count', 0)})\n{i.get('url', '')}"
        for i in items if i.get("title")
    ]


def _ddg_search(query: str) -> list[str]:
    """
    DuckDuckGo web search via ddgs library — free, no auth, real search results.
    Used for general/non-tech domains where specialist platforms have no signal.
    """
    from duckduckgo_search import DDGS
    results = []
    with DDGS() as ddgs:
        for r in ddgs.text(query, max_results=10):
            results.append(
                f"[DDG] {r.get('title', '')}\n{r.get('href', '')}\n{r.get('body', '')[:300]}"
            )
    return results


def _tavily_fallback(query: str) -> list[str]:
    """
    Tavily Search — used as fallback for non-tech/consumer domains
    where HN/SO/GitHub have no relevant data.
    Requires TAVILY_API_KEY in .env.
    """
    from tavily import TavilyClient
    client = TavilyClient(api_key=settings.TAVILY_API_KEY)
    response = client.search(query=query, search_depth="basic")
    return [
        f"[WEB] {r.get('title', '')} \n{r.get('url', '')}\n{r.get('content', '')[:300]}"
        for r in response.get("results", [])
    ]


# --- Intent-Based Domain Router ---
# Each domain maps to an ordered list of sources most likely to have signal.
# Tavily is the fallback when structured APIs return nothing.

DOMAIN_SOURCE_MAP = {
    "dev_tools":     [_stackoverflow_search, _github_search, _hn_search, _devto_search],
    "b2b_saas":      [_hn_search, _stackoverflow_search, _github_search],
    "consumer_apps": [_hn_search, _devto_search, _ddg_search],
    "general":       [_ddg_search],  # not tech-related — go straight to web search
}

# Low-priority broad search — used as filler when specific search returns thin results
GENERAL_BROAD_SOURCES = [_ddg_search]


def fetch_api_data(queries: list[str], domain: str = "general") -> str:
    sources = DOMAIN_SOURCE_MAP.get(domain, DOMAIN_SOURCE_MAP["general"])
    all_results = []

    for query in queries:
        query_results = []

        for source_fn in sources:
            try:
                results = source_fn(query)
                query_results.extend(results)
            except Exception as e:
                print(f"[Warning] {source_fn.__name__} failed for '{query}': {e}")

        # Real fallback: Tavily web search (not a fake instant-answer API)
        if not query_results and settings.TAVILY_API_KEY:
            try:
                query_results = _tavily_fallback(query)
                print(f"[Info] Tavily fallback used for '{query}'")
            except Exception as e:
                print(f"[Warning] Tavily fallback failed for '{query}': {e}")

        if query_results:
            all_results.append(f"QUERY: {query}\n" + "\n".join(query_results))

    return "\n\n======\n\n".join(all_results) if all_results else "No data found from APIs."
