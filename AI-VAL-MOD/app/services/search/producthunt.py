from typing import List, Dict
from services.search.ddg import search as ddg_search

async def search(query: str, max_results: int = 5) -> List[Dict]:
    """ProductHunt search via DDG. Great for competitor product validation."""
    results = await ddg_search(f"site:producthunt.com {query}", max_results=max_results)
    for r in results:
        r["source"] = "producthunt"
    return results
