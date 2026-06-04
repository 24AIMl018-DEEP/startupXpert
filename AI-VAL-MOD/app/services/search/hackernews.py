from typing import List, Dict
import httpx

async def search(query: str, max_results: int = 5) -> List[Dict]:
    """Free Hacker News search via Algolia API. Strong tech/startup community."""
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                "https://hn.algolia.com/api/v1/search",
                params={"query": query, "hitsPerPage": max_results},
                timeout=10
            )
            hits = res.json().get("hits", [])
            return [{"title": h.get("title", ""), "snippet": h.get("story_text") or h.get("comment_text") or h.get("title", ""), "url": h.get("url") or f"https://news.ycombinator.com/item?id={h.get('objectID')}", "source": "hackernews"} for h in hits if h.get("title")]
    except Exception as e:
        print(f"[HackerNews] Error: {e}")
        return []
