from pydantic import BaseModel, Field
from typing import Dict, Any
import uuid

class SearchDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content: str = Field(..., description="The actual text/snippet scraped.")
    source_url: str = Field(..., description="URL of the source.")
    platform: str = Field(..., description="e.g., 'GitHub', 'HackerNews', 'DuckDuckGo'")
    metadata: Dict[str, Any] = Field(..., description="Stores agent name and original query.")