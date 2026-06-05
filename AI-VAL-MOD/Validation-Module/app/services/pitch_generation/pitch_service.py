from schema.startup_input import StartupInput
from schema.prompts.pitch_prompts import PitchPrompts
from shared.core.llm_factory import get_llm


def create_pitch(payload: StartupInput) -> str:
    data = payload.model_dump()
    data["founder_skillset"] = ", ".join(data["founder_skillset"])
    data["platform_type"]    = ", ".join(data["platform_type"])
    prompt = f"{PitchPrompts.SYSTEM_INSTRUCTION}\n\n{PitchPrompts.MAIN_TEMPLATE.format(**data)}"

    # prefer local Ollama (free); fall back to Groq if Ollama unavailable
    try:
        result = get_llm(tier=1)(prompt)
        if result and len(result.strip()) > 200:
            return result
        raise ValueError("Ollama output too short")
    except Exception as e:
        print(f"[Pitch] Ollama failed ({e}), falling back to Groq")
        return get_llm(tier=2, temperature=0.3)(prompt)
