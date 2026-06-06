from typing import List, Dict
from tavily import TavilyClient
from shared.core.config import Config

_client = TavilyClient(api_key=Config.TAVILY_API_KEY) if Config.TAVILY_API_KEY else None


async def search(query: str, max_results: int = 5) -> List[Dict]:
    if not _client:
        print("[Tavily] API key not set, skipping.")
        return []
    try:
        response = _client.search(query, max_results=max_results)
        return [{"title": r.get("title", ""), "snippet": r.get("content", ""), "url": r.get("url", ""), "source": "tavily"} for r in response.get("results", [])]
    except Exception as e:
        print(f"[Tavily] Error: {e}")
        return []
