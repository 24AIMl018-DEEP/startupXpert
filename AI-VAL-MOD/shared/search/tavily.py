from typing import List, Dict
from shared.core.config import Config

_client = None


def _get_client():
    global _client
    if _client is None and Config.TAVILY_API_KEY:
        from tavily import TavilyClient
        _client = TavilyClient(api_key=Config.TAVILY_API_KEY)
    return _client


async def search(query: str, max_results: int = 5) -> List[Dict]:
    client = _get_client()
    if not client:
        print("[Tavily] API key not set, skipping.")
        return []
    try:
        response = client.search(query, max_results=max_results)
        return [{"title": r.get("title", ""), "snippet": r.get("content", ""), "url": r.get("url", ""), "source": "tavily"} for r in response.get("results", [])]
    except Exception as e:
        print(f"[Tavily] Error: {e}")
        return []
