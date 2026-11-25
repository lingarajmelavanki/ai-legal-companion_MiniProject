from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf, docx, img, txt
    file_size = Column(Integer, nullable=False)
    file_path = Column(String, nullable=False)
    category = Column(String, default="Unclassified")  # e.g., Rental, Employment, NDA, Loan
    status = Column(String, default="uploaded")  # uploaded, processing, analyzed, failed
    page_count = Column(Integer, default=1)
    ocr_applied = Column(Integer, default=0)  # 0 or 1
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    analysis = relationship("AnalysisResult", back_populates="document", uselist=False, cascade="all, delete-orphan")
    risks = relationship("RiskFinding", back_populates="document", cascade="all, delete-orphan")
    missing_clauses = relationship("MissingClauseFinding", back_populates="document", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="document", cascade="all, delete-orphan")
    reports = relationship("GeneratedReport", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, default=1)
    clause_heading = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    cleaned_content = Column(Text, nullable=False)
    embedding = Column(JSON, nullable=True)  # List of floats for cosine similarity

    document = relationship("Document", back_populates="chunks")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), unique=True, nullable=False)
    
    # Multilingual plain-language summaries
    summary_en = Column(Text, nullable=False)
    summary_kn = Column(Text, nullable=True)  # Kannada
    summary_hi = Column(Text, nullable=True)  # Hindi

    overall_risk_level = Column(String, default="Low")  # Low, Moderate, Elevated, High
    key_obligations = Column(JSON, default=list)  # list of {party, obligation, deadline, consequence}
    party_rights = Column(JSON, default=list)     # list of {party, right, condition}
    unclear_terms = Column(JSON, default=list)    # list of {term, context, why_unclear, suggested_clarification}
    suggested_questions = Column(JSON, default=list) # general questions for user to ask
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    document = relationship("Document", back_populates="analysis")


class RiskFinding(Base):
    __tablename__ = "risk_findings"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    clause_reference = Column(String, nullable=False)  # e.g., "Clause 5.1: Termination & Liquidated Damages"
    page_number = Column(Integer, default=1)
    original_text = Column(Text, nullable=False)
    severity = Column(String, nullable=False)  # High, Medium, Low
    category = Column(String, nullable=False)  # Financial Penalty, Termination, Liability, IP/Restraint, Dispute Resolution
    
    # Multilingual explanations
    explanation_en = Column(Text, nullable=False)
    explanation_kn = Column(Text, nullable=True)
    explanation_hi = Column(Text, nullable=True)

    legal_rationale = Column(Text, nullable=False)
    questions_to_ask = Column(JSON, default=list)  # list of strings
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    document = relationship("Document", back_populates="risks")


class MissingClauseFinding(Base):
    __tablename__ = "missing_clause_findings"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    clause_name = Column(String, nullable=False)
    status = Column(String, nullable=False)  # Absent, Incomplete, Ambiguous
    clause_type = Column(String, default="Recommended")  # Statutory / Mandatory vs Commercial Recommendation
    importance_level = Column(String, default="Moderate")  # Critical, High, Moderate
    
    # Multilingual importance descriptions
    why_it_matters_en = Column(Text, nullable=False)
    why_it_matters_kn = Column(Text, nullable=True)
    why_it_matters_hi = Column(Text, nullable=True)

    recommended_standard_language = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    document = relationship("Document", back_populates="missing_clauses")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)  # user, assistant
    language = Column(String, default="en")
    content = Column(Text, nullable=False)
    citations = Column(JSON, default=list)  # list of {page_number, clause_heading, snippet}
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    document = relationship("Document", back_populates="chat_messages")
    user = relationship("User", back_populates="chat_messages")


class GeneratedReport(Base):
    __tablename__ = "generated_reports"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_type = Column(String, default="pdf")  # pdf, json
    file_path = Column(String, nullable=False)
    download_url = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    document = relationship("Document", back_populates="reports")
    user = relationship("User", back_populates="reports")
