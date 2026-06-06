import json
import re
import time
from typing import Any

from shared.core.llm_factory import call_llm_with_fallback


# Tier guide:
#   1 = Ollama local   (free, slow)  — always available, used as final fallback
#   2 = Groq           (low,  fast)  — standard generation tasks
#   3 = NVIDIA/OpenAI  (high, best)  — complex reasoning tasks


def _sanitize(text: str) -> str:
    """Remove control characters that break JSON parsing (common in Ollama output)."""
    # Replace literal tab/newline/carriage-return INSIDE strings with escaped versions,
    # but we can't know context — so just strip ASCII control chars except \t \n \r
    # which json.loads handles fine when they're outside string values.
    # The real culprit is raw control chars (0x00-0x1F) embedded inside string values.
    return re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)


def _extract_json_block(raw: str, array: bool = False) -> str:
    """Try progressively looser extraction strategies to find a JSON object/array."""
    # 1. Strip markdown fences: ```json ... ``` or ``` ... ```
    fence = re.search(r'```(?:json)?\s*(\{.*?\}|\[.*?\])\s*```', raw, re.DOTALL | re.IGNORECASE)
    if fence:
        return fence.group(1)

    def _find_balanced(text: str, open_char: str, close_char: str) -> str:
        idx = text.find(open_char)
        if idx == -1:
            return ""
        depth, end = 0, -1
        for i, ch in enumerate(text[idx:], start=idx):
            if ch == open_char:
                depth += 1
            elif ch == close_char:
                depth -= 1
                if depth == 0:
                    end = i
                    break
        return text[idx:end + 1] if end != -1 else ""

    # 2. For arrays, try [ first, then { (Ollama may wrap in object)
    if array:
        block = _find_balanced(raw, '[', ']')
        if block:
            return block
        # fallback: find wrapping object that contains a list
        block = _find_balanced(raw, '{', '}')
        if block:
            return block
    else:
        block = _find_balanced(raw, '{', '}')
        if block:
            return block

    # 3. Regex fallback
    pattern = r'\[.*\]' if array else r'\{.*\}'
    match = re.search(pattern, raw, re.DOTALL)
    return match.group() if match else ""


def _unwrap_array(result: Any, array: bool) -> Any:
    """
    Ollama sometimes wraps arrays in a dict, e.g. {"tasks": [...]} or {"result": [...]}.
    When array=True, unwrap the first list value found in the dict.
    When array=False and a list is returned, try to use the first element if it's a dict.
    """
    if array:
        if isinstance(result, list):
            return result
        if isinstance(result, dict):
            # Find the first value that is a list
            for v in result.values():
                if isinstance(v, list):
                    return v
            # Single-item dict wrapping a non-list? Return empty to trigger fallback
            return []
    else:
        if isinstance(result, dict):
            return result
        if isinstance(result, list) and len(result) == 1 and isinstance(result[0], dict):
            return result[0]
    return result


class BaseAgent:
    name: str          = "base_agent"
    llm_tier: int      = 2
    temperature: float = 0.2

    def _call_llm(self, prompt: str, tier: int = None, temperature: float = None) -> str:
        t    = tier        if tier        is not None else self.llm_tier
        temp = temperature if temperature is not None else self.temperature
        return call_llm_with_fallback(prompt, tier=t, temperature=temp)

    def _parse_json(self, raw: str, array: bool = False) -> Any:
        if not raw or not raw.strip():
            raise ValueError(f"[{self.name}] LLM returned empty response.")

        # Pass 1 — try direct parse on sanitized raw
        cleaned = _sanitize(raw.strip())
        # Strip markdown fences if present
        if cleaned.startswith("```"):
            parts = cleaned.split("```")
            cleaned = parts[1] if len(parts) > 1 else cleaned
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
            cleaned = cleaned.strip()

        try:
            result = json.loads(cleaned)
            return _unwrap_array(result, array)
        except json.JSONDecodeError:
            pass

        # Pass 2 — extract balanced JSON block then sanitize
        block = _extract_json_block(raw, array=array)
        if block:
            try:
                result = json.loads(_sanitize(block))
                return _unwrap_array(result, array)
            except json.JSONDecodeError:
                # Pass 3 — aggressive: replace unescaped newlines inside strings
                fixed = re.sub(r'(?<!\\)\n', ' ', _sanitize(block))
                fixed = re.sub(r'(?<!\\)\r', '', fixed)
                try:
                    result = json.loads(fixed)
                    return _unwrap_array(result, array)
                except json.JSONDecodeError:
                    pass

        raise ValueError(
            f"[{self.name}] JSON parse failed after all attempts. "
            f"Raw (first 300 chars): {raw[:300]!r}"
        )
