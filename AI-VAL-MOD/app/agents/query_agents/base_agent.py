from typing import Dict, List
from services.agent_services.query_generator import generate_queries
from services.agent_services.platform_search import search_all_platforms


class BaseQueryAgent:
    name: str = "base"
    platforms: List[str] = ["ddg", "hackernews"]
    query_count: int = 3

    def _build_prompt(self, pitch: str, startup_data: Dict) -> str:
        raise NotImplementedError

    async def run(self, pitch: str, startup_data: Dict) -> Dict:
        print(f"[QueryAgent:{self.name}] Generating queries...")
        queries = generate_queries(self.name, self._build_prompt(pitch, startup_data))
        print(f"[QueryAgent:{self.name}] queries={queries}")
        results = await search_all_platforms(queries, self.platforms)
        print(f"[QueryAgent:{self.name}] collected={len(results)}")
        return {"agent": self.name, "queries": queries, "results": results}
