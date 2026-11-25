from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DocumentCreate(BaseModel):
    title: str
    category: Optional[str] = "Unclassified"

class DocumentChunkResponse(BaseModel):
    id: int
    chunk_index: int
    page_number: int
    clause_heading: Optional[str]
    content: str
    cleaned_content: str

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: int
    title: str
    filename: str
    file_type: str
    file_size: int
    category: str
    status: str
    page_count: int
    ocr_applied: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DocumentDetailResponse(DocumentResponse):
    chunks: List[DocumentChunkResponse] = []

    class Config:
        from_attributes = True
