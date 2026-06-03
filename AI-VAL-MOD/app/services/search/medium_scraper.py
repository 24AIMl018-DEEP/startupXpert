import httpx
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from schema.document_schema import SearchDocument

_NS = {"atom": "http://www.w3.org/2005/Atom"}


class MediumScraper:
    async def search(self, query: str, agent_name: str, max_results: int = 3) -> list[SearchDocument]:
        documents = []
        # Medium RSS feed for tag-based search (free, no API key)
        tag = query.split()[0].lower().replace(" ", "-")
        urls_to_try = [
            f"https://medium.com/feed/tag/{tag}",
            f"https://medium.com/feed/tag/startup",
        ]

        async with httpx.AsyncClient(timeout=12, headers={"User-Agent": "Mozilla/5.0"}) as client:
            for feed_url in urls_to_try:
                try:
                    resp = await client.get(feed_url)
                    if resp.status_code != 200:
                        continue

                    root = ET.fromstring(resp.text)
                    items = root.findall(".//item")[:max_results]

                    for item in items:
                        title = item.findtext("title") or ""
                        link  = item.findtext("link") or ""
                        # Medium puts content in <content:encoded>
                        content_raw = item.findtext("{http://purl.org/rss/1.0/modules/content/}encoded") or \
                                      item.findtext("description") or ""
                        text = BeautifulSoup(content_raw, "html.parser").get_text(separator=" ").strip()
                        if not text:
                            continue
                        documents.append(SearchDocument(
                            content=f"{title}. {text[:1500]}",
                            source_url=link,
                            platform="Medium",
                            metadata={"agent_owner": agent_name, "search_query": query}
                        ))

                    if documents:
                        break  # found results, no need to try fallback tag
                except Exception as e:
                    print(f"[Medium Scraper] feed '{feed_url}': {e}")

        return documents[:max_results]


medium_scraper = MediumScraper()
