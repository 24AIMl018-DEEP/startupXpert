import json
import re
from typing import Dict


def parse_llm_output(name: str, raw: str) -> Dict:
    if not isinstance(raw, str):
        raw = str(raw)
    text = raw.strip()

    # strip markdown code fences
    fenced = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if fenced:
        text = fenced.group(1).strip()
    else:
        # extract first {...} block
        brace = re.search(r"(\{[\s\S]*\})", text)
        if brace:
            text = brace.group(1).strip()

    try:
        result = json.loads(text)
        if not isinstance(result, dict):
            raise ValueError("not a dict")
        result.setdefault("agent", name)
        return result
    except Exception:
        return {"agent": name, "parse_error": True, "raw_output": raw[:500]}
