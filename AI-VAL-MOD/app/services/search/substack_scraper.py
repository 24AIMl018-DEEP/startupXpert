import httpx
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from schema.document_schema import SearchDocument

# Curated domain-relevant Substack publications
DOMAIN_FEEDS = {
    "Market":      ["https://stratechery.com/feed/", "https://www.exponentialview.co/feed"],
    "Business":    ["https://www.saastr.com/feed/", "https://lennysnewsletter.com/feed"],
    "Competitor":  ["https://stratechery.com/feed/", "https://www.saastr.com/feed/"],
    "Customer":    ["https://lennysnewsletter.com/feed", "https://uxdesign.cc/feed"],
    "Founder":     ["https://www.saastr.com/feed/", "https://avc.com/feed/"],
    "Regulatory":  ["https://www.techdirt.com/feed/"],
    "Technology":  ["https://www.exponentialview.co/feed", "https://stratechery.com/feed/"],
}


class SubstackScraper:
    async def search(self, query: str, agent_name: str, max_results: int = 3) -> list[SearchDocument]:
        documents = []
        feeds = DOMAIN_FEEDS.get(agent_name, ["https://www.notboring.co/feed"])
        query_words = set(query.lower().split())

        async with httpx.AsyncClient(timeout=12, headers={"User-Agent": "Mozilla/5.0"}) as client:
            for feed_url in feeds[:2]:
                try:
                    resp = await client.get(feed_url)
                    if resp.status_code != 200:
                        continue
                    root = ET.fromstring(resp.text)
                    for item in root.findall(".//item"):
                        title = item.findtext("title") or ""
                        link  = item.findtext("link") or ""
                        raw   = item.findtext("{http://purl.org/rss/1.0/modules/content/}encoded") or \
                                item.findtext("description") or ""
                        text  = BeautifulSoup(raw, "html.parser").get_text(separator=" ").strip()

                        # Relevance filter: use first 5 meaningful words of query, not full sentence
                        query_words = set(query.lower().split()[:8]) - {"what","how","why","the","are","is","do","in","of","to","a","an","and","for"}
                        combined = (title + " " + text).lower()
                        if not any(w in combined for w in query_words):
                            continue

                        documents.append(SearchDocument(
                            content=f"{title}. {text[:1500]}",
                            source_url=link,
                            platform="Substack",
                            metadata={"agent_owner": agent_name, "search_query": query}
                        ))
                        if len(documents) >= max_results:
                            return documents
                except Exception as e:
                    print(f"[Substack Scraper] feed '{feed_url}': {e}")

        return documents


substack_scraper = SubstackScraper()
