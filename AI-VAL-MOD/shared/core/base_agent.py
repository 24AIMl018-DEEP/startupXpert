import json
import re
import time
from typing import Any

from shared.core.llm_factory import get_llm

_RETRY_DELAYS = [2, 5, 10]

# Tier guide:
#   1 = Ollama local   (free,  slow)  — simple classification tasks
#   2 = Groq           (low,   fast)  — standard generation tasks
#   3 = NVIDIA/OpenAI  (high,  best)  — complex reasoning tasks


class BaseAgent:
    name: str        = "base_agent"
    llm_tier: int    = 2
    temperature: float = 0.2

    def _call_llm(self, prompt: str, tier: int = None, temperature: float = None) -> str:
        t    = tier        if tier        is not None else self.llm_tier
        temp = temperature if temperature is not None else self.temperature
        last_err = None
        for attempt, delay in enumerate([0] + _RETRY_DELAYS):
            if delay:
                print(f"[{self.name}] Retry {attempt} after {delay}s (tier={t})...")
                time.sleep(delay)
            try:
                return get_llm(tier=t, temperature=temp)(prompt)
            except Exception as e:
                last_err = e
                if "429" not in str(e) and "rate" not in str(e).lower():
                    break
        raise RuntimeError(f"[{self.name}] LLM tier={t} failed after retries: {last_err}")

    def _parse_json(self, raw: str, array: bool = False) -> Any:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
        try:
            return json.loads(cleaned.strip())
        except json.JSONDecodeError:
            pattern = r'\[.*\]' if array else r'\{.*\}'
            match = re.search(pattern, raw, re.DOTALL)
            if match:
                return json.loads(match.group())
            raise ValueError(f"[{self.name}] JSON parse failed. Raw: {raw[:200]}")
