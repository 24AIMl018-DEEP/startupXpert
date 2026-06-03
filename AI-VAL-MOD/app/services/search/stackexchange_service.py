import httpx
from schema.document_schema import SearchDocument

# Map research domain → best Stack Exchange community sites
DOMAIN_SITES = {
    "Technology":  ["stackoverflow", "softwareengineering", "datascience"],
    "Business":    ["money", "startups", "economics"],
    "Regulatory":  ["law", "politics", "money"],
    "Market":      ["startups", "economics", "money"],
    "Competitor":  ["startups", "money"],
    "Customer":    ["ux", "startups"],
    "Founder":     ["startups", "workplace"],
}


class StackExchangeService:
    BASE_URL = "https://api.stackexchange.com/2.3/search/advanced"

    async def search(self, query: str, agent_name: str, max_results: int = 3) -> list[SearchDocument]:
        documents = []
        sites = DOMAIN_SITES.get(agent_name, ["startups"])

        async with httpx.AsyncClient(timeout=10) as client:
            for site in sites[:2]:  # max 2 sites per call
                try:
                    safe_query = query[:120]  # SE 400s on long query strings
                    resp = await client.get(self.BASE_URL, params={
                        "q": safe_query,
                        "site": site,
                        "pagesize": max_results,
                        "order": "desc",
                        "sort": "relevance",
                        "filter": "withbody",  # includes answer body
                    })
                    resp.raise_for_status()
                    items = resp.json().get("items", [])

                    for item in items:
                        # Strip HTML tags from body
                        from bs4 import BeautifulSoup
                        body = BeautifulSoup(item.get("body", ""), "html.parser").get_text(separator=" ").strip()
                        title = item.get("title", "")
                        if not body:
                            continue
                        documents.append(SearchDocument(
                            content=f"Q: {title}. {body[:1200]}",
                            source_url=item.get("link", ""),
                            platform="StackExchange",
                            metadata={
                                "agent_owner": agent_name,
                                "search_query": query,
                                "site": site,
                                "score": item.get("score", 0),
                                "answer_count": item.get("answer_count", 0)
                            }
                        ))
                except Exception as e:
                    print(f"[StackExchange] {site} '{query}': {e}")

        return documents[:max_results * 2]


stackexchange_service = StackExchangeService()
