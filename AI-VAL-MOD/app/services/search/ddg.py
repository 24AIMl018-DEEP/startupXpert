import asyncio
from typing import List, Dict
from ddgs import DDGS

async def search(query: str, max_results: int = 5) -> List[Dict]:
    """Free web search via DuckDuckGo. No API key needed."""
    try:
        results = await asyncio.to_thread(
            lambda: list(DDGS().text(query, max_results=max_results))
        )
        return [{"title": r.get("title", ""), "snippet": r.get("body", ""), "url": r.get("href", ""), "source": "duckduckgo"} for r in results]
    except Exception as e:
        print(f"[DDG] Error: {e}")
        return []
