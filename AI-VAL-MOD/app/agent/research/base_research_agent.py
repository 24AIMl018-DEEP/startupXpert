import asyncio
from typing import List
from services.llm.router import get_llm_response
from schema.document_schema import SearchDocument

# Weight tiers — LLM is guided to prefer community platforms
COMMUNITY_PLATFORMS = ["Reddit", "HackerNews", "Quora", "StackExchange", "Substack"]
BLOG_PLATFORMS      = ["Medium", "DevTo", "ProductHunt"]
RESEARCH_PLATFORMS  = ["ArXiv", "Wikipedia", "GitHub"]
WEB_PLATFORMS       = ["Tavily", "DuckDuckGo"]  # lowest priority / filler


class BaseResearchAgent:
    """
    Autonomous research agent:
    - Free Ollama routes the platform strategy JSON
    - Community sources are weighted highest
    - SEO/web (DDG, Tavily) used as secondary filler only
    """

    ALL_PLATFORMS = COMMUNITY_PLATFORMS + BLOG_PLATFORMS + RESEARCH_PLATFORMS + WEB_PLATFORMS

    def __init__(self, domain: str, tier: str = "free"):
        self.domain = domain
        self.tier = tier

    async def _decide_strategy(self, queries: List[str]) -> dict:
        """Free local LLM picks platforms, guided by community-first priority."""
        prompt = (
            f"You are an autonomous {self.domain} research agent picking data sources. "
            f"Priority order: community forums first, then blogs, then research, then web. "
            f"Community (highest weight): {COMMUNITY_PLATFORMS}. "
            f"Blogs (medium weight): {BLOG_PLATFORMS}. "
            f"Research (medium weight): {RESEARCH_PLATFORMS}. "
            f"Web/SEO (lowest weight, use only as filler): {WEB_PLATFORMS}. "
            f"Queries: {queries}. "
            f"Pick 2-3 platforms best for {self.domain} domain. "
            f"Always prefer community platforms. Only add a web platform if no community platform fits. "
            f"Set results_per_query between 2 and 4. "
            f'Output ONLY valid JSON: {{"platforms": ["p1", "p2"], "results_per_query": 3}}'
        )
        try:
            decision = await get_llm_response(prompt, tier=self.tier, temperature=0.1)
            platforms = [p for p in decision.get("platforms", []) if p in self.ALL_PLATFORMS]
            if not platforms:
                platforms = self._default_platforms()
            depth = max(2, min(int(decision.get("results_per_query", 3)), 4))
            return {"platforms": platforms, "depth": depth}
        except Exception:
            return {"platforms": self._default_platforms(), "depth": 3}

    def _default_platforms(self) -> List[str]:
        return ["Reddit", "HackerNews"]  # community-first fallback

    async def research(self, queries: List[str]) -> List[SearchDocument]:
        if not queries:
            return []

        strategy = await self._decide_strategy(queries)
        platforms = strategy["platforms"]
        depth = strategy["depth"]

        print(f"[{self.domain}Agent] platforms={platforms}, depth={depth}/query")

        tasks = [
            self._search_platform(platform, query, depth)
            for query in queries
            for platform in platforms
        ]

        nested = await asyncio.gather(*tasks, return_exceptions=True)

        docs = []
        for batch in nested:
            if isinstance(batch, Exception):
                print(f"[{self.domain}Agent] Search error: {batch}")
                continue
            docs.extend(batch)

        print(f"[{self.domain}Agent] Collected {len(docs)} documents")
        return docs

    async def _search_platform(self, platform: str, query: str, depth: int) -> List[SearchDocument]:
        from services.search.ddg_service import ddg_service
        from services.search.hn_service import hn_service
        from services.search.github_service import github_service
        from services.search.reddit_service import reddit_service
        from services.search.wikipedia_service import wikipedia_service
        from services.search.arxiv_service import arxiv_service
        from services.search.producthunt_scraper import producthunt_scraper
        from services.search.devto_service import devto_service
        from services.search.quora_scraper import quora_scraper
        from services.search.stackexchange_service import stackexchange_service
        from services.search.medium_scraper import medium_scraper
        from services.search.substack_scraper import substack_scraper
        from services.search.tavily_service import tavily_service

        platform_map = {
            # Community — highest priority
            "Reddit":        lambda: reddit_service.search(query, self.domain, depth),
            "HackerNews":    lambda: hn_service.search(query, self.domain, depth),
            "Quora":         lambda: quora_scraper.search(query, self.domain, depth),
            "StackExchange": lambda: stackexchange_service.search(query, self.domain, depth),
            "Substack":      lambda: substack_scraper.search(query, self.domain, depth),
            # Blogs — medium priority
            "Medium":        lambda: medium_scraper.search(query, self.domain, depth),
            "DevTo":         lambda: devto_service.search(query, self.domain, depth),
            "ProductHunt":   lambda: producthunt_scraper.search(query, self.domain, depth),
            # Research — medium priority
            "ArXiv":         lambda: arxiv_service.search(query, self.domain, depth),
            "Wikipedia":     lambda: wikipedia_service.search(query, self.domain, depth),
            "GitHub":        lambda: github_service.search(query, self.domain, depth),
            # Web/SEO — filler only
            "Tavily":        lambda: tavily_service.search(query, self.domain, depth),
            "DuckDuckGo":    lambda: ddg_service.search(query, self.domain, depth),
        }

        handler = platform_map.get(platform)
        if not handler:
            return []
        return await handler()
