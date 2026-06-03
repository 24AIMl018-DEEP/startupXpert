from services.llm.router import get_llm_response
from schema.query_schema import AgentQueries

class BaseQueryAgent:
    def __init__(self, domain_name: str, priority_tier: str = "mid"):
        self.domain_name = domain_name
        # Map priority_tier to LLM router tiers
        self.tier = "high" if priority_tier == "high" else "low"

    async def generate(self, system_prompt: str) -> list[str]:
        try:
            raw_json = await get_llm_response(system_prompt, tier=self.tier, temperature=0.2)

            # Auto-fix: LLM sometimes returns list of dicts instead of strings
            cleaned = []
            for item in raw_json.get("queries", []):
                if isinstance(item, dict):
                    cleaned.append(item.get("query") or item.get("question") or str(item))
                else:
                    cleaned.append(str(item))

            raw_json["queries"] = cleaned
            return AgentQueries(**raw_json).queries

        except Exception as e:
            print(f"[{self.domain_name}] Query generation failed: {e}")
            return []
