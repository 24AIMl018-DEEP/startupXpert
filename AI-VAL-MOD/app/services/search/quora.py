from typing import List, Dict
from services.search.ddg import search as ddg_search

async def search(query: str, max_results: int = 5) -> List[Dict]:
    """Quora search via DDG. Great for customer pain points and demand validation."""
    results = await ddg_search(f"site:quora.com {query}", max_results=max_results)
    for r in results:
        r["source"] = "quora"
    return results
