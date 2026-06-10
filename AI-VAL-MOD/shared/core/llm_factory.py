import asyncio
import concurrent.futures
import logging
import time
import requests
from groq import AsyncGroq
from openai import AsyncOpenAI
from shared.core.config import Config

# Suppress noisy TCPTransport-closed errors from httpx/anyio during event loop teardown
logging.getLogger("asyncio").setLevel(logging.CRITICAL)

logger = logging.getLogger(__name__)


# ── Async runner ──────────────────────────────────────────────────────────────

def _run_async(coro):
    try:
        asyncio.get_running_loop()
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            return pool.submit(asyncio.run, coro).result()
    except RuntimeError:
        return asyncio.run(coro)


# ── Provider coroutines ───────────────────────────────────────────────────────

async def _groq(prompt: str, temperature: float) -> str:
    client = AsyncGroq(api_key=Config.GROQ_API_KEY)
    try:
        res = await client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=temperature,
        )
        return res.choices[0].message.content
    finally:
        try:
            await client.close()
        except Exception:
            pass


async def _openai_compat(
    prompt: str,
    temperature: float,
    api_key: str,
    base_url: str,
    model: str,
) -> str:
    """Generic async caller for any OpenAI-compatible endpoint."""
    client = AsyncOpenAI(api_key=api_key, base_url=base_url)
    try:
        res = await client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=model,
            temperature=temperature,
        )
        return res.choices[0].message.content
    finally:
        try:
            await client.close()
        except Exception:
            pass


def _ollama_sync(prompt: str) -> str:
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


# ── Provider registry ─────────────────────────────────────────────────────────
#
# Each entry:
#   id          – unique int used in tiers_to_try lists
#   name        – display name in logs
#   available() – returns True only if the required API key is set
#   call(p, t)  – executes the LLM call, returns str
#
# Fallback order when Groq (primary) is rate-limited:
#   Groq(2) → DeepSeek(4) → Cerebras(5) → Together(6) → OpenRouter(7) → NVIDIA(3) → Ollama(1)
#
# DeepSeek & Cerebras come first because they are fastest and most reliable
# among the free-tier providers. OpenRouter is last (free model, slower).

_PROVIDERS = {
    1: {
        "name": "Ollama (local)",
        "available": lambda: True,  # always try; will fail gracefully if not running
        "call": lambda p, t: _ollama_sync(p),
    },
    2: {
        "name": "Groq",
        "available": lambda: bool(Config.GROQ_API_KEY),
        "call": lambda p, t: _run_async(_groq(p, t)),
    },
    3: {
        "name": "NVIDIA NIM",
        "available": lambda: bool(Config.NVIDIA_API_KEY),
        "call": lambda p, t: _run_async(_openai_compat(
            p, t,
            api_key=Config.NVIDIA_API_KEY,
            base_url="https://integrate.api.nvidia.com/v1",
            model="meta/llama-3.3-70b-instruct",
        )),
    },
    4: {
        "name": "DeepSeek",
        "available": lambda: bool(Config.DEEPSEEK_API_KEY),
        "call": lambda p, t: _run_async(_openai_compat(
            p, t,
            api_key=Config.DEEPSEEK_API_KEY,
            base_url="https://api.deepseek.com/v1",
            model="deepseek-chat",
        )),
    },
    5: {
        "name": "Cerebras",
        "available": lambda: bool(Config.CEREBRAS_API_KEY),
        "call": lambda p, t: _run_async(_openai_compat(
            p, t,
            api_key=Config.CEREBRAS_API_KEY,
            base_url="https://api.cerebras.ai/v1",
            model="llama-3.3-70b",
        )),
    },
    6: {
        "name": "OpenRouter (free)",
        "available": lambda: bool(Config.OPENROUTER_API_KEY),
        "call": lambda p, t: _run_async(_openai_compat(
            p, t,
            api_key=Config.OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1",
            model="deepseek/deepseek-chat-v3-0324:free",
        )),
    },
    7: {
        "name": "Together AI",
        "available": lambda: bool(Config.TOGETHER_API_KEY),
        "call": lambda p, t: _run_async(_openai_compat(
            p, t,
            api_key=Config.TOGETHER_API_KEY,
            base_url="https://api.together.xyz/v1",
            model="meta-llama/Llama-3.3-70b-instruct-turbo",
        )),
    },
    8: {
        "name": "Google Gemini",
        "available": lambda: bool(Config.GEMINI_API_KEY),
        "call": lambda p, t: _run_async(_openai_compat(
            p, t,
            api_key=Config.GEMINI_API_KEY,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            model="gemini-1.5-flash",
        )),
    },
}

# Default fallback chain — most reliable free providers first, Ollama last
_DEFAULT_CHAIN = [2, 5, 6, 3, 4, 8, 7, 1]  # Groq → Cerebras → OpenRouter → NVIDIA → DeepSeek → Gemini → Together → Ollama


# ── Helpers ───────────────────────────────────────────────────────────────────

_QUOTA_ERRORS = ("tokens per day", "daily", "tpd", "quota", "insufficient_quota", "billing")

def _is_rate_limit(err: Exception) -> bool:
    s = str(err).lower()
    return "429" in s or "rate" in s or "quota" in s or "limit" in s

def _is_quota_exhausted(err: Exception) -> bool:
    s = str(err).lower()
    return any(q in s for q in _QUOTA_ERRORS)


# ── Public API ────────────────────────────────────────────────────────────────

def get_llm(tier: int, temperature: float = None):
    """Return a callable(prompt) -> str for the given provider tier id."""
    temp = temperature if temperature is not None else Config.DEFAULT_TEMPERATURE
    provider = _PROVIDERS.get(tier)
    if not provider:
        raise ValueError(f"Unknown tier {tier}. Valid ids: {list(_PROVIDERS)}")
    return lambda prompt: provider["call"](prompt, temp)


_RETRY_DELAYS = [2, 5, 10]


def call_llm_with_fallback(prompt: str, tier: int, temperature: float = None) -> str:
    """
    Try `tier` first, then walk the fallback chain until one succeeds.
    Skips providers whose API key is not configured.
    """
    temp = temperature if temperature is not None else Config.DEFAULT_TEMPERATURE

    # Build ordered list: requested tier first, then the rest of the chain
    chain = [tier] + [t for t in _DEFAULT_CHAIN if t != tier]

    last_err = None
    for current_tier in chain:
        provider = _PROVIDERS.get(current_tier)
        if not provider:
            continue
        if not provider["available"]():
            logger.debug(f"[LLM] Skipping {provider['name']} — API key not set")
            continue

        # Ollama gets a single attempt; cloud providers get retries on rate-limit
        retry_delays = [] if current_tier == 1 else _RETRY_DELAYS

        for attempt, delay in enumerate([0] + retry_delays):
            if delay:
                logger.info(f"[LLM] Retry {attempt} after {delay}s ({provider['name']})...")
                time.sleep(delay)
            try:
                t_start = time.time()
                result = provider["call"](prompt, temp)
                elapsed = round(time.time() - t_start, 1)
                if current_tier != tier:
                    logger.info(
                        f"[LLM] ✓ FALLBACK — used {provider['name']} "
                        f"(requested {_PROVIDERS[tier]['name']}) — {elapsed}s — {len(result)} chars"
                    )
                else:
                    logger.info(f"[LLM] ✓ {provider['name']} — {elapsed}s — {len(result)} chars")
                return result
            except Exception as e:
                last_err = e
                logger.warning(f"[LLM] ✗ {provider['name']} error: {str(e)[:120]}")
                if _is_quota_exhausted(e):
                    logger.info(f"[LLM] Quota exhausted on {provider['name']} → skipping retries")
                    break
                if not _is_rate_limit(e):
                    break  # non-rate-limit → don't retry, try next provider

        logger.info(f"[LLM] {provider['name']} exhausted → trying next fallback...")

    raise RuntimeError(
        f"[LLM] All providers exhausted. Chain tried: "
        f"{[_PROVIDERS[t]['name'] for t in chain if _PROVIDERS.get(t) and _PROVIDERS[t]['available']()]}. "
        f"Last error: {last_err}"
    )
