from typing import Dict, List, Tuple
from services.vector.store import vector_store

MIN_SCORE = 0.30  # chunks below this are noise, skip them


def build_vector_context(name: str, vector_queries: List[str], top_k: int, startup_data: Dict) -> Tuple[str, List[Dict]]:
    flat = {k: (", ".join(v) if isinstance(v, list) else str(v)) for k, v in startup_data.items()}
    seen, all_docs = set(), []

    for q_template in vector_queries:
        try:
            query = q_template.format(**flat)
        except KeyError:
            query = q_template

        results = vector_store.search(query=query, top_k=top_k)
        for r in results:
            if r["score"] < MIN_SCORE:
                continue
            if r["text"] not in seen:
                seen.add(r["text"])
                all_docs.append(r)
        print(f"  [Vector:{name}] query='{query[:60]}' hits={len(results)} above_threshold={sum(1 for r in results if r['score'] >= MIN_SCORE)}")

    # sort all collected docs by relevance score — best evidence first
    all_docs.sort(key=lambda x: x["score"], reverse=True)

    if not all_docs:
        return "No relevant research data found in vector store.", []

    lines = [
        f"[score={r['score']} | source={r['metadata'].get('agent', 'unknown')}] {r['text']}"
        for r in all_docs
    ]
    return "\n".join(lines), all_docs
