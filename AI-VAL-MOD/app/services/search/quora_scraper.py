import asyncio
from ddgs import DDGS
from schema.document_schema import SearchDocument

_SKIP_URLS = {
    "https://www.quora.com/",
    "https://quora.com/",
    "https://q.quora.com/",
    "https://signin-1.quora.com/",
    "https://pt.quora.com/",
}
_JUNK_BODIES = ("site owner hides", "something went wrong", "quora is a place to gain")


class QuoraScraper:
    async def search(self, query: str, agent_name: str, max_results: int = 3) -> list[SearchDocument]:
        documents = []
        try:
            results = await asyncio.to_thread(
                lambda: list(DDGS().text(f"{query[:80]} site:quora.com", max_results=max_results + 3))
            )
            for res in results:
                url  = res.get("href", "")
                body = res.get("body", "").strip()
                if not body or url in _SKIP_URLS:
                    continue
                if len(body) < 40 or any(j in body.lower() for j in _JUNK_BODIES):
                    continue
                documents.append(SearchDocument(
                    content=body,
                    source_url=url,
                    platform="Quora",
                    metadata={"agent_owner": agent_name, "search_query": query}
                ))
                if len(documents) >= max_results:
                    break
        except Exception as e:
            print(f"[Quora Scraper] Error searching '{query}': {e}")
        return documents


quora_scraper = QuoraScraper()
