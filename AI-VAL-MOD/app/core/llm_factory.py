import asyncio
import concurrent.futures
from groq import AsyncGroq
from openai import AsyncOpenAI
from core.config import Config


import asyncio
import concurrent.futures
from groq import AsyncGroq
from openai import AsyncOpenAI
from core.config import Config


def _run_async(coro):
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        # already inside an event loop (LangGraph) — run in a new thread
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            future = pool.submit(asyncio.run, coro)
            return future.result()
    else:
        return asyncio.run(coro)


async def _groq(prompt: str, temperature: float) -> str:
    client = AsyncGroq(api_key=Config.GROQ_API_KEY)
    res = await client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile",
        temperature=temperature,
    )
    return res.choices[0].message.content


async def _nvidia(prompt: str, temperature: float) -> str:
    client = AsyncOpenAI(api_key=Config.NVIDIA_API_KEY, base_url="https://integrate.api.nvidia.com/v1")
    res = await client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="meta/llama-3.3-70b-instruct",
        temperature=temperature,
    )
    return res.choices[0].message.content


async def _ollama(prompt: str) -> str:
    import httpx
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "http://localhost:11434/api/generate",
            json={"model": "llama3.2", "prompt": prompt, "stream": False},
            timeout=60,
        )
        return res.json().get("response", "")


# ── Single public function ────────────────────────────────────────────────────
# tier 1 = Ollama (free, local)
# tier 2 = Groq  (fast cloud)
# tier 3 = NVIDIA NIM (high accuracy)

def get_llm(tier: int, temperature: float = None):
    temp = temperature if temperature is not None else Config.DEFAULT_TEMPERATURE

    if tier == 1:
        return lambda prompt: _run_async(_ollama(prompt))
    elif tier == 2:
        if not Config.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY missing in .env")
        return lambda prompt: _run_async(_groq(prompt, temp))
    elif tier == 3:
        if not Config.NVIDIA_API_KEY:
            raise ValueError("NVIDIA_API_KEY missing in .env")
        return lambda prompt: _run_async(_nvidia(prompt, temp))
    else:
        raise ValueError(f"Invalid tier {tier}. Use 1, 2, or 3.")
