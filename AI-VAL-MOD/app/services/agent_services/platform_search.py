import asyncio
from typing import Dict, List


def _get_search_fn(platform: str):
    if platform == "ddg":
        from services.search.ddg import search
    elif platform == "tavily":
        from services.search.tavily import search
    elif platform == "hackernews":
        from services.search.hackernews import search
    elif platform == "github":
        from services.search.github import search
    elif platform == "producthunt":
        from services.search.producthunt import search
    elif platform == "quora":
        from services.search.quora import search
    else:
        return None
    return search


async def search_all_platforms(queries: List[str], platforms: List[str]) -> List[Dict]:
    tasks = [
        _get_search_fn(p)(q, max_results=3)
        for q in queries
        for p in platforms
        if _get_search_fn(p)
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return [item for r in results if isinstance(r, list) for item in r]
