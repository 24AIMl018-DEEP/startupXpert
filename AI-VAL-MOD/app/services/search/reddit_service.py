import asyncio
from ddgs import DDGS
from schema.document_schema import SearchDocument

# Best subreddits per domain — used as search scope hints in the query
DOMAIN_SUBREDDITS = {
    "Customer":   ["r/startups", "r/Entrepreneur", "r/SaaS", "r/smallbusiness"],
    "Competitor": ["r/startups", "r/Entrepreneur", "r/investing"],
    "Market":     ["r/startups", "r/business", "r/Entrepreneur"],
    "Business":   ["r/Entrepreneur", "r/smallbusiness", "r/SaaS"],
    "Founder":    ["r/startups", "r/Entrepreneur", "r/IAmA"],
    "Regulatory": ["r/legaladvice", "r/law", "r/business"],
    "Technology": ["r/programming", "r/MachineLearning", "r/webdev"],
}


class RedditService:
    async def search(self, query: str, agent_name: str, max_results: int = 3) -> list[SearchDocument]:
        documents = []
        subreddits = DOMAIN_SUBREDDITS.get(agent_name, ["r/startups"])

        for sub in subreddits[:2]:
            try:
                # Tight query: keywords only (first 60 chars) + subreddit scope
                short_query = query[:60]
                scoped_query = f"{short_query} site:reddit.com/{sub}"
                results = await asyncio.to_thread(
                    lambda q=scoped_query: list(DDGS().text(q, max_results=max_results))
                )
                for res in results:
                    url  = res.get("href", "")
                    body = res.get("body", "").strip()
                    # Hard filter: skip homepage hits and empty bodies
                    if not body or url in ("https://www.reddit.com/", "https://reddit.com/"):
                        continue
                    if "site owner hides" in body.lower() or len(body) < 40:
                        continue
                    documents.append(SearchDocument(
                        content=body,
                        source_url=url,
                        platform="Reddit",
                        metadata={
                            "agent_owner": agent_name,
                            "search_query": query,
                            "subreddit": sub,
                        }
                    ))
                if len(documents) >= max_results:
                    break
            except Exception as e:
                print(f"[Reddit Service] {sub} '{query}': {e}")

        return documents[:max_results]


reddit_service = RedditService()
