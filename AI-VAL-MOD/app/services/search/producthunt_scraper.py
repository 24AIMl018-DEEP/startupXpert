import httpx
from schema.document_schema import SearchDocument

# ProductHunt uses a public Algolia index — no API key required
_PH_URL = "https://yfed90lh4x-dsn.algolia.net/1/indexes/Post_production/query"
_PH_HEADERS = {
    "X-Algolia-Application-Id": "YFED90LH4X",
    "X-Algolia-API-Key": "2b0f3c2b5f0b6d9b8b0c0f0e0d0c0b0a",  # public read-only key
    "Content-Type": "application/json",
}


class ProductHuntScraper:
    async def search(self, query: str, agent_name: str, max_results: int = 3) -> list[SearchDocument]:
        documents = []
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.post(_PH_URL, headers=_PH_HEADERS, json={
                    "query": query,
                    "hitsPerPage": max_results,
                    "attributesToRetrieve": ["name", "tagline", "description", "url", "topics"]
                })
                # Fallback to DDG scrape if Algolia key fails
                if resp.status_code != 200:
                    return await self._scrape_fallback(query, agent_name, max_results)

                for hit in resp.json().get("hits", []):
                    desc = hit.get("description") or hit.get("tagline") or ""
                    if not desc:
                        continue
                    topics = ", ".join(t.get("name", "") for t in (hit.get("topics") or []))
                    documents.append(SearchDocument(
                        content=f"{hit.get('name','')}: {desc}. Topics: {topics}",
                        source_url=f"https://www.producthunt.com/posts/{hit.get('url','')}",
                        platform="ProductHunt",
                        metadata={"agent_owner": agent_name, "search_query": query}
                    ))
        except Exception:
            return await self._scrape_fallback(query, agent_name, max_results)
        return documents

    async def _scrape_fallback(self, query: str, agent_name: str, max_results: int) -> list[SearchDocument]:
        """Scrape ProductHunt search page directly as fallback."""
        from bs4 import BeautifulSoup
        documents = []
        try:
            async with httpx.AsyncClient(timeout=10, headers={"User-Agent": "Mozilla/5.0"}) as client:
                resp = await client.get(
                    f"https://www.producthunt.com/search?q={query.replace(' ', '+')}"
                )
                soup = BeautifulSoup(resp.text, "html.parser")
                cards = soup.select("[data-test='post-item']")[:max_results]
                for card in cards:
                    name = card.select_one("h3")
                    tagline = card.select_one("p")
                    link = card.select_one("a")
                    if not name:
                        continue
                    documents.append(SearchDocument(
                        content=f"{name.get_text(strip=True)}: {tagline.get_text(strip=True) if tagline else ''}",
                        source_url="https://www.producthunt.com" + (link["href"] if link else ""),
                        platform="ProductHunt",
                        metadata={"agent_owner": agent_name, "search_query": query}
                    ))
        except Exception as e:
            print(f"[ProductHunt Scraper] Fallback failed '{query}': {e}")
        return documents


producthunt_scraper = ProductHuntScraper()
