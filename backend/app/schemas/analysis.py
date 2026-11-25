from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ObligationItem(BaseModel):
    party: str
    obligation: str
    deadline: Optional[str] = None
    consequence: Optional[str] = None

class PartyRightItem(BaseModel):
    party: str
    right: str
    condition: Optional[str] = None

class UnclearTermItem(BaseModel):
    term: str
    context: str
    why_unclear: str
    suggested_clarification: str

class RiskFindingResponse(BaseModel):
    id: int
    clause_reference: str
    page_number: int
    original_text: str
    severity: str  # High, Medium, Low
    category: str
    explanation_en: str
    explanation_kn: Optional[str] = None
    explanation_hi: Optional[str] = None
    legal_rationale: str
    questions_to_ask: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True

class MissingClauseFindingResponse(BaseModel):
    id: int
    clause_name: str
    status: str  # Absent, Incomplete, Ambiguous
    clause_type: str  # Mandatory, Recommended
    importance_level: str  # Critical, High, Moderate
    why_it_matters_en: str
    why_it_matters_kn: Optional[str] = None
    why_it_matters_hi: Optional[str] = None
    recommended_standard_language: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AnalysisResultResponse(BaseModel):
    id: int
    document_id: int
    summary_en: str
    summary_kn: Optional[str] = None
    summary_hi: Optional[str] = None
    overall_risk_level: str
    key_obligations: List[ObligationItem] = []
    party_rights: List[PartyRightItem] = []
    unclear_terms: List[UnclearTermItem] = []
    suggested_questions: List[str] = []
    risks: List[RiskFindingResponse] = []
    missing_clauses: List[MissingClauseFindingResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True
