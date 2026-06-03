import httpx
from core.config import settings
from schema.document_schema import SearchDocument


class TavilyService:
    BASE_URL = "https://api.tavily.com/search"

    async def search(self, query: str, agent_name: str, max_results: int = 3) -> list[SearchDocument]:
        documents = []
        if not settings.TAVILY_API_KEY:
            print("[Tavily Service] No API key set, skipping.")
            return documents
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.post(self.BASE_URL, json={
                    "api_key": settings.TAVILY_API_KEY,
                    "query": query,
                    "max_results": max_results,
                    "search_depth": "advanced",
                    "include_answer": True,
                    "include_raw_content": False,
                })
                resp.raise_for_status()
                data = resp.json()

                # Tavily top-level answer is a gold nugget — add it first
                answer = (data.get("answer") or "").strip()
                if answer:
                    documents.append(SearchDocument(
                        content=f"[Tavily Summary] {answer}",
                        source_url="https://tavily.com",
                        platform="Tavily",
                        metadata={"agent_owner": agent_name, "search_query": query, "type": "summary"}
                    ))

                for result in data.get("results", []):
                    content = (result.get("content") or "").strip()
                    if not content:
                        continue
                    documents.append(SearchDocument(
                        content=content[:1500],
                        source_url=result.get("url", ""),
                        platform="Tavily",
                        metadata={
                            "agent_owner": agent_name,
                            "search_query": query,
                            "score": result.get("score", 0)
                        }
                    ))
        except Exception as e:
            print(f"[Tavily Service] Error searching '{query}': {e}")
        return documents


tavily_service = TavilyService()
