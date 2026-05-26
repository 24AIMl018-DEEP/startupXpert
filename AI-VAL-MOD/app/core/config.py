import os
from dotenv import load_dotenv

# load environment variables from the .env file
load_dotenv()

class Settings:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

    # GitHub personal access token — needed to avoid 10 req/min unauthenticated limit
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

    # Stack Overflow API key — raises limit from 300 to 10,000 req/day
    STACKOVERFLOW_KEY = os.getenv("STACKOVERFLOW_KEY")

    LLM_MODEL = "llama-3.3-70b-versatile"
    
settings = Settings()
