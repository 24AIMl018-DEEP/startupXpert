import json
from groq import AsyncGroq
from openai import AsyncOpenAI
from core.config import settings

# Api clients
_groq = AsyncGroq(api_key=settings.GROQ_API_KEY)

_nvidia = AsyncOpenAI(
    api_key=settings.NVIDIA_API_KEY,
    base_url="https://integrate.api.nvidia.com/v1"
)

# Model Configrations 
_MODELS = {
    "high": ("nvidia", "meta/llama-3.3-70b-instruct"),  # NVIDIA NIM — best accuracy
    "mid":  ("groq",   "llama-3.3-70b-versatile"),      # Groq — fast + capable
    "low":  ("groq",   "llama-3.1-8b-instant"),         # Groq — fastest, cheapest
    "free": ("ollama", "llama3.2"),                      # Local Ollama — zero cost
}

async def get_llm_response(
    prompt: str,
    tier: str = "mid",
    temperature: float = 0.3,
    json_mode: bool = True
) -> dict | str:
    """
    Global LLM caller — mix of NVIDIA NIMs + Groq + Ollama.

    Args:
        prompt      : The full prompt string.
        tier        : "high" (NVIDIA) | "mid" (Groq) | "low" (Groq) | "free" (Ollama)
        temperature : 0.0 - 1.0
        json_mode   : True returns parsed dict, False returns raw string.
    """
    provider, model = _MODELS.get(tier, _MODELS["mid"])

    # Free / Local via Ollama 
    if provider == "ollama":
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                res = await client.post(
                    "http://localhost:11434/api/generate",
                    json={"model": model, "prompt": prompt, "stream": False},
                    timeout=60
                )
                text = res.json().get("response", "")
                return json.loads(text) if json_mode else text
        except Exception as e:
            raise RuntimeError(f"[LLM:free] Ollama failed: {e}")

    # NVIDIA NIMs 
    if provider == "nvidia":
        kwargs = dict(
            messages=[{"role": "user", "content": prompt}],
            model=model,
            temperature=temperature,
        )
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}
        res = await _nvidia.chat.completions.create(**kwargs)
        content = res.choices[0].message.content
        return json.loads(content) if json_mode else content

    # Groq (mid / low)
    kwargs = dict(
        messages=[{"role": "user", "content": prompt}],
        model=model,
        temperature=temperature,
    )
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}
    res = await _groq.chat.completions.create(**kwargs)
    content = res.choices[0].message.content
    return json.loads(content) if json_mode else content
