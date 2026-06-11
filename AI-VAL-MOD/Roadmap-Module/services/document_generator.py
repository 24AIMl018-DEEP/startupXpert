import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, SystemMessage

from services.db.reader import (
    get_startup_input,
    get_pipeline_output,
    get_roadmap_profiler,
    get_roadmap_branches,
    get_roadmap_tasks
)

def generate_document_stream(session_id: str, document_type: str):
    """
    Fetches startup context from the database and yields a streaming markdown document.
    """
    # 1. Gather Context
    startup = get_startup_input(session_id)
    if not startup:
        yield "Error: Startup session not found."
        return

    pipeline = get_pipeline_output(session_id)
    profiler = get_roadmap_profiler(session_id)
    branches = get_roadmap_branches(session_id)
    
    tasks = []
    for b in branches:
        tasks.extend(get_roadmap_tasks(b["id"]))

    # Compress context to avoid token limits
    context = {
        "Startup Details": startup,
        "Validation Output": pipeline.get("aggregate_validation_score") if pipeline else "N/A",
        "Roadmap Profiler": profiler,
        "Branches": [{"name": b["branch"], "summary": b["summary"]} for b in branches],
        "Tasks": [{"title": t["title"], "complexity": t["complexity"]} for t in tasks]
    }

    prompt = f"""
You are StartupXpert's elite document generator.
The user requested a **{document_type}** for their startup.

Here is the context we have about their startup:
{json.dumps(context, default=str, indent=2)}

INSTRUCTIONS:
1. Generate a highly professional, comprehensive {document_type} in Markdown format.
2. Structure the document with appropriate headings (#, ##, ###).
3. Be specific to the provided startup context. Do not use generic placeholders like [Company Name].
4. Include Mermaid.js diagrams where highly relevant (e.g., flowcharts, timelines, architecture). Use ```mermaid syntax.
5. Provide actionable insights and a polished tone suitable for investors or executives.
"""

    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-pro",
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.4,
        max_output_tokens=8192
    )

    messages = [
        SystemMessage(content="You are an expert startup consultant and technical writer."),
        HumanMessage(content=prompt)
    ]

    for chunk in llm.stream(messages):
        yield chunk.content
