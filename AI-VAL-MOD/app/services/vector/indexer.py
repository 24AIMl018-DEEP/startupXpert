from typing import Dict, List
from services.vector.store import vector_store


def index_pitch(pitch: str, startup_name: str):
    """Index the generated pitch text."""
    vector_store.add(
        text=pitch,
        metadata={"agent": "pitch", "startup": startup_name, "type": "pitch"}
    )


def index_startup_json(data: Dict) -> int:
    """Index key startup fields as searchable text chunks. Returns count added."""
    startup_name = data.get("startup_name", "")
    platform_str = ", ".join(data.get("platform_type", [])) if isinstance(data.get("platform_type"), list) else str(data.get("platform_type", ""))
    chunks = [
        (f"Problem: {data.get('problem_statement', '')}", "problem"),
        (f"Solution: {data.get('startup_description', '')}", "solution"),
        (f"Target Audience: {data.get('target_audience', '')} in {data.get('geographic_market', '')}", "market"),
        (f"Competitors: {data.get('existing_competitors', '')}", "competitors"),
        (f"Revenue Model: {data.get('revenue_model', '')} at {data.get('estimated_pricing', '')}", "business"),
        (f"Tech: {platform_str} complexity {data.get('technology_complexity', '')}", "technology"),
        (f"Stage: {data.get('current_startup_stage', '')} | MVP in {data.get('mvp_timeline', '')} | Goal: {data.get('scalability_goal', '')}", "execution"),
    ]
    added = 0
    for text, chunk_type in chunks:
        if vector_store.add(text=text, metadata={"agent": "startup_json", "startup": startup_name, "type": chunk_type}):
            added += 1
    return added


def index_agent_results(agent_name: str, startup_name: str, results: List[Dict]):
    """Index search results from an agent."""
    items = []
    for r in results:
        title   = r.get("title", "").strip()
        snippet = r.get("snippet", "").strip()
        text    = f"{title} — {snippet}" if title and snippet else (title or snippet)
        if len(text) > 20:
            items.append({
                "text": text,
                "metadata": {
                    "agent": agent_name,
                    "startup": startup_name,
                    "source": r.get("source", ""),
                    "url": r.get("url", ""),
                    "type": "search_result"
                }
            })
    stats = vector_store.add_batch(items)
    print(f"[Vector] {agent_name}: +{stats['added']} docs, {stats['skipped_duplicates']} dupes skipped")
    return stats
