import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """
    This Imports the apikey getways from environment
    """
    
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY")
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY")
    APP_NAME: str = "AI Startup Validator"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = True

settings = Settings()
