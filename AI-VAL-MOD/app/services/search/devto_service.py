import httpx
from schema.document_schema import SearchDocument


class DevToService:
    BASE_URL = "https://dev.to/api/articles"

    async def search(self, query: str, agent_name: str, max_results: int = 3) -> list[SearchDocument]:
        documents = []
        seen_urls: set = set()

        # Dev.to search API uses tags — extract first 2 meaningful words as tag attempts
        words = [w.lower() for w in query.split() if len(w) > 3][:2]
        tag = words[0] if words else "programming"

        # Try tag-based search first, fall back to keyword search
        search_attempts = [
            {"tag": tag, "per_page": max_results},
            {"q": " ".join(words), "per_page": max_results},
        ]

        try:
            async with httpx.AsyncClient(timeout=10) as client:
                for params in search_attempts:
                    if len(documents) >= max_results:
                        break
                    resp = await client.get(self.BASE_URL, params=params)
                    if resp.status_code != 200:
                        continue
                    for article in resp.json():
                        url = article.get("url", "")
                        if url in seen_urls:
                            continue
                        seen_urls.add(url)

                        desc = article.get("description") or article.get("title") or ""
                        if not desc or len(desc) < 40:
                            continue
                        tags = ", ".join(article.get("tag_list") or [])
                        documents.append(SearchDocument(
                            content=f"{article.get('title', '')}: {desc}. Tags: {tags}",
                            source_url=url,
                            platform="DevTo",
                            metadata={
                                "agent_owner": agent_name,
                                "search_query": query,
                                "reactions": article.get("positive_reactions_count", 0)
                            }
                        ))
                        if len(documents) >= max_results:
                            break
        except Exception as e:
            print(f"[DevTo Service] Error searching '{query}': {e}")
        return documents


devto_service = DevToService()
