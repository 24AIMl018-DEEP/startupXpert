from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

# Creating client for the llm
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("LLM_API_KEY")
)


def ask_llm(prompt, max_tokens=1024):
    
    response = client.chat.completions.create(
        model="meta/llama-3.1-8b-instruct",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=max_tokens
    )

    return response.choices[0].message.content
