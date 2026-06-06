import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env for local development — in production (Railway), env vars are injected directly
_env_path = Path(__file__).resolve().parents[2] / ".env"
if _env_path.exists():
    load_dotenv(_env_path)


class Config:
    GROQ_API_KEY              = os.getenv("GROQ_API_KEY")
    NVIDIA_API_KEY            = os.getenv("NVIDIA_API_KEY")
    TAVILY_API_KEY            = os.getenv("TAVILY_API_KEY")
    DEFAULT_TEMPERATURE       = float(os.getenv("DEFAULT_TEMPERATURE", "0.7"))
    SUPABASE_URL              = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    # Ollama is local-only — not used in production Railway deployments
    OLLAMA_BASE_URL           = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL              = os.getenv("OLLAMA_MODEL", "llama3.2")
    ENVIRONMENT               = os.getenv("ENVIRONMENT", "development")
