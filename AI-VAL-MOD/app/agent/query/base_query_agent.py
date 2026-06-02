import json
from groq import AsyncGroq
from core.config import settings
from schema.query_schema import AgentQueries

class BaseQueryAgent:
    def __init__(self, domain_name: str, priority_tier: str = "mid"):
        self.domain_name = domain_name
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        
        # Dynamic Model Routing Strategy
        if priority_tier == "high":
            self.model = "llama-3.3-70b-versatile"
        else:
            self.model = "llama-3.1-8b-instant"

    async def generate(self, system_prompt: str) -> list[str]:
        """Executes the LLM call, sanitizes the output, and enforces JSON validation."""
        try:
            response = await self.client.chat.completions.create(
                messages=[{"role": "user", "content": system_prompt}],
                model=self.model,
                response_format={"type": "json_object"},
                temperature=0.2 # Lowered slightly for strict adherence
            )
            
            raw_json = json.loads(response.choices[0].message.content)
            
            # --- AUTO-FIXER START ---
            # If the LLM returned dictionaries instead of strings, extract the string.
            cleaned_queries = []
            for item in raw_json.get("queries", []):
                if isinstance(item, dict):
                    # Try to grab common keys the LLM might invent, otherwise stringify the dict
                    extracted_str = item.get("query") or item.get("question") or str(item)
                    cleaned_queries.append(extracted_str)
                else:
                    cleaned_queries.append(str(item))
            
            raw_json["queries"] = cleaned_queries
            # --- AUTO-FIXER END ---

            # Validate through Pydantic
            validated = AgentQueries(**raw_json)
            return validated.queries
            
        except Exception as e:
            print(f"[{self.domain_name}] Query Generation failed: {e}")
            return [] # Fallback to empty list so it doesn't crash the whole pipeline