from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class CitationItem(BaseModel):
    page_number: int
    clause_heading: Optional[str] = None
    snippet: str

class ChatMessageCreate(BaseModel):
    message: str
    language: Optional[str] = "en"  # en, kn, hi

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    language: str
    content: str
    citations: List[CitationItem] = []
    created_at: datetime

    class Config:
        from_attributes = True

class ChatHistoryResponse(BaseModel):
    document_id: int
    messages: List[ChatMessageResponse] = []
