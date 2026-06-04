from typing import List, Dict
import httpx

async def search(query: str, max_results: int = 5) -> List[Dict]:
    """Free GitHub repo search. Great for technology validation."""
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                "https://api.github.com/search/repositories",
                params={"q": query, "per_page": max_results, "sort": "stars"},
                headers={"Accept": "application/vnd.github.v3+json"},
                timeout=10
            )
            items = res.json().get("items", [])
            return [{"title": r.get("full_name", ""), "snippet": r.get("description") or "", "url": r.get("html_url", ""), "source": "github", "stars": r.get("stargazers_count", 0)} for r in items]
    except Exception as e:
        print(f"[GitHub] Error: {e}")
        return []
