import time
from typing import Dict, List
from core.llm_factory import get_llm
from services.agent_services.vector_context import build_vector_context
from services.agent_services.json_builder import build_limited_json
from services.agent_services.output_parser import parse_llm_output

_RETRY_DELAYS = [2, 5, 10]


class BaseAnalysisAgent:
    name: str = "base_analysis"
    llm_tier: int = 2
    top_k_per_query: int = 3
    vector_queries: List[str] = []
    json_fields: List[str] = []

    def _get_prompt_template(self) -> str:
        raise NotImplementedError

    def _call_llm(self, prompt: str) -> str:
        last_err = None
        for attempt, delay in enumerate([0] + _RETRY_DELAYS):
            if delay:
                print(f"[AnalysisAgent:{self.name}] Retry {attempt} after {delay}s...")
                time.sleep(delay)
            try:
                return get_llm(tier=self.llm_tier, temperature=0.2)(prompt)
            except Exception as e:
                last_err = e
                if "429" not in str(e) and "rate" not in str(e).lower():
                    break
        raise RuntimeError(f"LLM call failed after retries: {last_err}")

    def run(self, pitch: str, startup_data: Dict) -> Dict:
        print(f"[AnalysisAgent:{self.name}] Starting — llm_tier={self.llm_tier}")
        vector_context, retrieved_docs = build_vector_context(self.name, self.vector_queries, self.top_k_per_query, startup_data)
        prompt = self._get_prompt_template().format(
            startup_json=build_limited_json(self.json_fields, startup_data),
            pitch=pitch,
            vector_context=vector_context,
        )
        raw = self._call_llm(prompt)
        result = parse_llm_output(self.name, raw)
        result["retrieved_docs"] = [{"score": d["score"], "agent_collected_by": d["metadata"].get("agent", "")} for d in retrieved_docs]
        print(f"[AnalysisAgent:{self.name}] Done — score={result.get('score')} verdict={result.get('verdict')}")
        return result
