import json
import re
from typing import List
from shared.core.llm_factory import call_llm_with_fallback


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
    try:
        raw = call_llm_with_fallback(prompt, tier=2, temperature=0.3)
        return _parse_queries(raw if isinstance(raw, str) else str(raw))
    except Exception as e:
        print(f"[{name}] Query generation failed: {e}")
        return []
