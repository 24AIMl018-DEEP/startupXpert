import asyncio
from ddgs import DDGS
from schema.document_schema import SearchDocument

class DuckDuckGoService:
    async def search(self, query: str, agent_name: str, max_results: int = 3) -> list[SearchDocument]:
        documents = []
        try:
            results = await asyncio.to_thread(lambda: list(DDGS().text(query, max_results=max_results)))
            
            for res in results:
                doc = SearchDocument(
                    content=res.get("body", ""),
                    source_url=res.get("href", ""),
                    platform="DuckDuckGo",
                    metadata={"agent_owner": agent_name, "search_query": query}
                )
                documents.append(doc)
        except Exception as e:
            print(f"[DDG Service] Error searching '{query}': {e}")
            
        return documents

ddg_service = DuckDuckGoService()