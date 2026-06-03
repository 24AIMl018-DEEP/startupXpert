import httpx
from schema.document_schema import SearchDocument


class WikipediaService:
    BASE_URL = "https://en.wikipedia.org/w/api.php"

    async def search(self, query: str, agent_name: str, max_results: int = 3) -> list[SearchDocument]:
        documents = []
        # Wikipedia 403s on very long queries — cap at 100 chars
        safe_query = query[:100]
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                search_resp = await client.get(self.BASE_URL, params={
                    "action": "query", "list": "search",
                    "srsearch": safe_query, "srlimit": max_results, "format": "json"
                })
                search_resp.raise_for_status()
                titles = [r["title"] for r in search_resp.json().get("query", {}).get("search", [])]

                if not titles:
                    return documents

                # Step 2: Fetch extracts for found titles
                extract_resp = await client.get(self.BASE_URL, params={
                    "action": "query", "prop": "extracts|info",
                    "titles": "|".join(titles), "exintro": True,
                    "explaintext": True, "inprop": "url", "format": "json"
                })
                extract_resp.raise_for_status()
                pages = extract_resp.json().get("query", {}).get("pages", {})

                for page in pages.values():
                    extract = (page.get("extract") or "").strip()
                    if not extract:
                        continue
                    documents.append(SearchDocument(
                        content=extract[:1500],
                        source_url=f"https://en.wikipedia.org/wiki/{page['title'].replace(' ', '_')}",
                        platform="Wikipedia",
                        metadata={"agent_owner": agent_name, "search_query": query}
                    ))
        except Exception as e:
            print(f"[Wikipedia Service] Error searching '{query}': {e}")
        return documents


wikipedia_service = WikipediaService()
