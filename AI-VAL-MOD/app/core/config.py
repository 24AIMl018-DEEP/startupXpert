import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GROQ_API_KEY            = os.getenv("GROQ_API_KEY")
    NVIDIA_API_KEY          = os.getenv("NVIDIA_API_KEY")
    TAVILY_API_KEY          = os.getenv("TAVILY_API_KEY")
    DEFAULT_TEMPERATURE     = float(os.getenv("DEFAULT_TEMPERATURE", "0.7"))
    SUPABASE_URL            = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
