import asyncio
import concurrent.futures
import time
import requests
from groq import AsyncGroq
from openai import AsyncOpenAI
from shared.core.config import Config


# ── Async runner (for Groq + NVIDIA only) ────────────────────────────────────
# Ollama uses a plain synchronous requests call — no event loop needed.
# Groq and NVIDIA use their async SDKs, so we bridge them here.

def _run_async(coro):
    """
    Run an async coroutine from sync code without nesting event loops.
    Works correctly when called from LangGraph's run_in_executor threads.
    """
    try:
        asyncio.get_running_loop()
        # Already inside an event loop (e.g. LangGraph async context) —
        # delegate to a fresh thread that creates its own loop.
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            return pool.submit(asyncio.run, coro).result()
    except RuntimeError:
        # No running loop — safe to create one directly.
        return asyncio.run(coro)


# ── LLM provider calls ────────────────────────────────────────────────────────

async def _groq(prompt: str, temperature: float) -> str:
    client = AsyncGroq(api_key=Config.GROQ_API_KEY)
    res = await client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile",
        temperature=temperature,
    )
    return res.choices[0].message.content


async def _nvidia(prompt: str, temperature: float) -> str:
    client = AsyncOpenAI(
        api_key=Config.NVIDIA_API_KEY,
        base_url="https://integrate.api.nvidia.com/v1",
    )
    res = await client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="meta/llama-3.3-70b-instruct",
        temperature=temperature,
    )
    return res.choices[0].message.content


def _ollama_sync(prompt: str) -> str:
    """
    Fully synchronous Ollama call using requests — no event loop dependency.
    Uses /api/chat with format:'json' for reliable JSON output.
    """
    url = f"{Config.OLLAMA_BASE_URL.rstrip('/')}/api/chat"
    payload = {
        "model": Config.OLLAMA_MODEL,
        "format": "json",
        "stream": False,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a JSON-only assistant. "
                    "Always respond with valid JSON and nothing else. "
                    "No markdown, no explanations, no code fences."
                ),
            },
            {"role": "user", "content": prompt},
        ],
    }
    resp = requests.post(url, json=payload, timeout=180)
    resp.raise_for_status()
    data = resp.json()
    content = data.get("message", {}).get("content", "")
    if not content:
        raise RuntimeError(f"Ollama returned empty content. Full response: {data}")
    return content


# ── Tier dispatch ─────────────────────────────────────────────────────────────

def get_llm(tier: int, temperature: float = None):
    temp = temperature if temperature is not None else Config.DEFAULT_TEMPERATURE
    if tier == 1:
        return lambda prompt: _ollama_sync(prompt)
    elif tier == 2:
        if not Config.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY missing in .env")
        return lambda prompt: _run_async(_groq(prompt, temp))
    elif tier == 3:
        if not Config.NVIDIA_API_KEY:
            raise ValueError("NVIDIA_API_KEY missing in .env")
        return lambda prompt: _run_async(_nvidia(prompt, temp))
    raise ValueError(f"Invalid tier {tier}. Use 1, 2, or 3.")


# ── Cascading fallback with retries ───────────────────────────────────────────

_RETRY_DELAYS = [2, 5, 10]


def _is_rate_limit(err: Exception) -> bool:
    s = str(err).lower()
    return "429" in s or "rate" in s or "quota" in s or "limit" in s


_TIER_NAMES = {1: "Ollama (local)", 2: "Groq", 3: "NVIDIA"}

# On daily quota exhausted, skip retries and go straight to Ollama
_QUOTA_ERRORS = ("tokens per day", "daily", "tpd", "quota")

def _is_quota_exhausted(err: Exception) -> bool:
    s = str(err).lower()
    return any(q in s for q in _QUOTA_ERRORS)

def call_llm_with_fallback(prompt: str, tier: int, temperature: float = None) -> str:
    temp = temperature if temperature is not None else Config.DEFAULT_TEMPERATURE
    tiers_to_try = list(dict.fromkeys([tier] + list(range(tier - 1, 0, -1))))

    last_err = None
    for current_tier in tiers_to_try:
        # For Ollama (tier 1) — no retries, just one attempt
        retry_delays = [] if current_tier == 1 else _RETRY_DELAYS

        for attempt, delay in enumerate([0] + retry_delays):
            if delay:
                print(f"[LLM] Retry {attempt} after {delay}s ({_TIER_NAMES.get(current_tier)})...")
                time.sleep(delay)
            try:
                t_start = time.time()
                result = get_llm(tier=current_tier, temperature=temp)(prompt)
                elapsed = round(time.time() - t_start, 1)
                tier_name = _TIER_NAMES.get(current_tier, f"tier-{current_tier}")
                if current_tier != tier:
                    print(f"[LLM] ✓ FALLBACK — used {tier_name} (requested {_TIER_NAMES.get(tier)}) — {elapsed}s — {len(result)} chars")
                else:
                    print(f"[LLM] ✓ {tier_name} — {elapsed}s — {len(result)} chars")
                return result
            except Exception as e:
                last_err = e
                print(f"[LLM] ✗ {_TIER_NAMES.get(current_tier)} error: {str(e)[:120]}")
                # If daily quota exhausted → skip ALL retries, jump straight to Ollama
                if _is_quota_exhausted(e):
                    print(f"[LLM] Daily quota exhausted on {_TIER_NAMES.get(current_tier)} → falling back to Ollama immediately")
                    tiers_to_try = [1]  # only Ollama remaining
                    break
                if not _is_rate_limit(e):
                    break  # non-rate-limit error → skip retries, try next tier

        print(f"[LLM] {_TIER_NAMES.get(current_tier)} exhausted → trying next fallback...")

    raise RuntimeError(
        f"[LLM] All tiers exhausted (tried {[_TIER_NAMES.get(t) for t in tiers_to_try]}). "
        f"Last error: {last_err}"
    )

    raise RuntimeError(
        f"[LLM] All tiers exhausted (tried {[_TIER_NAMES.get(t) for t in tiers_to_try]}). "
        f"Last error: {last_err}"
    )
