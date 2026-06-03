import httpx
import xml.etree.ElementTree as ET
from schema.document_schema import SearchDocument

_NS = "http://www.w3.org/2005/Atom"


class ArxivService:
    BASE_URL = "https://export.arxiv.org/api/query"

    async def search(self, query: str, agent_name: str, max_results: int = 3) -> list[SearchDocument]:
        documents = []
        safe_query = query[:120]  # ArXiv 429s on long queries
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(self.BASE_URL, params={
                    "search_query": f"all:{safe_query}",
                    "start": 0,
                    "max_results": max_results
                })
                resp.raise_for_status()
                root = ET.fromstring(resp.text)

                for entry in root.findall(f"{{{_NS}}}entry"):
                    title   = (entry.findtext(f"{{{_NS}}}title") or "").strip()
                    summary = (entry.findtext(f"{{{_NS}}}summary") or "").strip()
                    link    = entry.findtext(f"{{{_NS}}}id") or ""
                    if not summary:
                        continue
                    documents.append(SearchDocument(
                        content=f"{title}. {summary[:1200]}",
                        source_url=link,
                        platform="ArXiv",
                        metadata={"agent_owner": agent_name, "search_query": query}
                    ))
        except Exception as e:
            print(f"[ArXiv Service] Error searching '{query}': {e}")
        return documents


arxiv_service = ArxivService()
