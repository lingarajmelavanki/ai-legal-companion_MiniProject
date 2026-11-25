from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.document import Document, ChatMessage
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse, ChatHistoryResponse
from app.services.ai_engine import AIEngine

router = APIRouter(prefix="/chat", tags=["AI Legal Assistant"])

@router.post("/{document_id}/message", response_model=ChatMessageResponse)
async def send_chat_message(
    document_id: int,
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    # Record user message
    user_msg = ChatMessage(
        document_id=doc.id,
        user_id=current_user.id,
        role="user",
        language=payload.language or "en",
        content=payload.message,
        citations=[]
    )
    db.add(user_msg)
    db.commit()

    # Prepare chunks
    chunks_data = [
        {
            "page_number": c.page_number,
            "clause_heading": c.clause_heading,
            "content": c.content
        }
        for c in doc.chunks
    ]

    # Retrieve answer + citations via AIEngine
    answer, citations = await AIEngine.chat_rag(
        chunks=chunks_data,
        query=payload.message,
        language=payload.language or "en"
    )

    # Record assistant message
    asst_msg = ChatMessage(
        document_id=doc.id,
        user_id=current_user.id,
        role="assistant",
        language=payload.language or "en",
        content=answer,
        citations=citations
    )
    db.add(asst_msg)
    db.commit()
    db.refresh(asst_msg)

    return asst_msg

@router.get("/{document_id}/history", response_model=ChatHistoryResponse)
def get_chat_history(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    messages = db.query(ChatMessage).filter(ChatMessage.document_id == document_id).order_by(ChatMessage.created_at.asc()).all()
    return ChatHistoryResponse(
        document_id=document_id,
        messages=messages
    )
