import httpx
from schema.document_schema import SearchDocument

class GitHubService:
    def __init__(self):
        self.base_url = "https://api.github.com/search/repositories"
        # Optional: Setup GitHub Token in .env if you hit rate limits
        # self.headers = {"Authorization": f"Bearer {settings.GITHUB_TOKEN}"}

    async def search(self, query: str, agent_name: str, max_results: int = 3) -> list[SearchDocument]:
        documents = []
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    self.base_url, 
                    params={"q": query, "per_page": max_results}
                )
                response.raise_for_status()
                data = response.json()

                for repo in data.get("items", []):
                    desc = repo.get("description") or "No description"
                    tech = repo.get("language") or "Unknown"
                    content = f"Repository: {repo.get('name')}. Tech: {tech}. Description: {desc}"
                    
                    doc = SearchDocument(
                        content=content,
                        source_url=repo.get("html_url", ""),
                        platform="GitHub",
                        metadata={"agent_owner": agent_name, "search_query": query}
                    )
                    documents.append(doc)
        except Exception as e:
            print(f"[GitHub Service] Error searching '{query}': {e}")
            
        return documents

github_service = GitHubService()