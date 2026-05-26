from tavily import TavilyClient
from app.core.config import settings

def fetch_web_data(queries: list[str]) -> str:
    if not settings.TAVILY_API_KEY:
        return "No web data — TAVILY_API_KEY not set."
    combined_result = []
    client = TavilyClient(api_key=settings.TAVILY_API_KEY)
    for query in queries:
        try:
            response = client.search(query=query, search_depth="advanced")
            for result in response.get("results", []):
                combined_result.append(f"URL: {result.get('url','')}\nContent: {result.get('content','')}\n")
        except Exception as e:
            print(f"[Warning] Web search failed for query '{query}': {e}")
    return "\n\n---\n\n".join(combined_result)
