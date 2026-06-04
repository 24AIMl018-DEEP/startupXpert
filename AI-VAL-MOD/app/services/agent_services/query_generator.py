import json
import re
import time
from typing import List
from core.llm_factory import get_llm

_RETRY_DELAYS = [2, 5, 10]


def _parse_queries(raw: str) -> List[str]:
    text = raw.strip()
    fenced = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if fenced:
        text = fenced.group(1).strip()
    else:
        brace = re.search(r"(\{[\s\S]*\})", text)
        if brace:
            text = brace.group(1).strip()
    parsed = json.loads(text)
    queries = parsed.get("queries", [])
    return [q["query"] if isinstance(q, dict) else str(q) for q in queries]


def generate_queries(name: str, prompt: str) -> List[str]:
    last_err = None
    for attempt, delay in enumerate([0] + _RETRY_DELAYS):
        if delay:
            print(f"[{name}] Retry {attempt} after {delay}s...")
            time.sleep(delay)
        try:
            raw = get_llm(tier=2, temperature=0.3)(prompt)
            return _parse_queries(raw if isinstance(raw, str) else str(raw))
        except Exception as e:
            last_err = e
            if "429" not in str(e) and "rate" not in str(e).lower():
                break
    print(f"[{name}] Query generation failed: {last_err}")
    return []
