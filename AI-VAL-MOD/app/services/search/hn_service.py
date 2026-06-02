import httpx
from schema.document_schema import SearchDocument

class HackerNewsService:
    def __init__(self):
        self.base_url = "https://hn.algolia.com/api/v1/search"

    async def search(self, query: str, agent_name: str, max_results: int = 3) -> list[SearchDocument]:
        documents = []
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    self.base_url, 
                    params={"query": query, "hitsPerPage": max_results}
                )
                response.raise_for_status()
                data = response.json()

                for hit in data.get("hits", []):
                    # Fallback to title if story_text is empty
                    text_content = hit.get("story_text") or hit.get("title", "")
                    if not text_content:
                        continue
                        
                    doc = SearchDocument(
                        content=text_content,
                        source_url=hit.get("url") or f"https://news.ycombinator.com/item?id={hit.get('objectID')}",
                        platform="HackerNews",
                        metadata={"agent_owner": agent_name, "search_query": query}
                    )
                    documents.append(doc)
        except Exception as e:
            print(f"[HN Service] Error searching '{query}': {e}")
            
        return documents

hn_service = HackerNewsService()