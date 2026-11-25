from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.document import Document, AnalysisResult, RiskFinding, MissingClauseFinding
from app.schemas.analysis import AnalysisResultResponse
from app.services.ai_engine import AIEngine

router = APIRouter(prefix="/analysis", tags=["Document Analysis"])

@router.post("/{document_id}/analyze", response_model=AnalysisResultResponse)
async def analyze_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    chunks_data = [
        {
            "page_number": c.page_number,
            "clause_heading": c.clause_heading,
            "content": c.content,
            "cleaned_content": c.cleaned_content
        }
        for c in doc.chunks
    ]

    doc.status = "processing"
    db.commit()

    # Clear previous analysis if re-running
    if doc.analysis:
        db.delete(doc.analysis)
    for r in doc.risks:
        db.delete(r)
    for mc in doc.missing_clauses:
        db.delete(mc)
    db.commit()

    # Run AI analysis
    try:
        ai_result = await AIEngine.analyze_document(chunks_data, doc.category)
    except Exception as e:
        db.rollback()
        doc.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Document analysis failed: {str(e)}")

    # Save AnalysisResult
    analysis_record = AnalysisResult(
        document_id=doc.id,
        summary_en=ai_result["summary_en"],
        summary_kn=ai_result.get("summary_kn"),
        summary_hi=ai_result.get("summary_hi"),
        overall_risk_level=ai_result["overall_risk_level"],
        key_obligations=ai_result["key_obligations"],
        party_rights=ai_result["party_rights"],
        unclear_terms=ai_result["unclear_terms"],
        suggested_questions=ai_result["suggested_questions"]
    )
    db.add(analysis_record)

    # Save Risk findings
    for r in ai_result["risks"]:
        risk_rec = RiskFinding(
            document_id=doc.id,
            clause_reference=r["clause_reference"],
            page_number=r.get("page_number", 1),
            original_text=r["original_text"],
            severity=r["severity"],
            category=r["category"],
            explanation_en=r["explanation_en"],
            explanation_kn=r.get("explanation_kn"),
            explanation_hi=r.get("explanation_hi"),
            legal_rationale=r["legal_rationale"],
            questions_to_ask=r.get("questions_to_ask", [])
        )
        db.add(risk_rec)

    # Save Missing Clause findings
    for mc in ai_result["missing_clauses"]:
        mc_rec = MissingClauseFinding(
            document_id=doc.id,
            clause_name=mc["clause_name"],
            status=mc["status"],
            clause_type=mc["clause_type"],
            importance_level=mc["importance_level"],
            why_it_matters_en=mc["why_it_matters_en"],
            why_it_matters_kn=mc.get("why_it_matters_kn"),
            why_it_matters_hi=mc.get("why_it_matters_hi"),
            recommended_standard_language=mc.get("recommended_standard_language")
        )
        db.add(mc_rec)

    doc.status = "analyzed"
    db.commit()
    db.refresh(analysis_record)
    db.refresh(doc)

    # Construct response
    return AnalysisResultResponse(
        id=analysis_record.id,
        document_id=doc.id,
        summary_en=analysis_record.summary_en,
        summary_kn=analysis_record.summary_kn,
        summary_hi=analysis_record.summary_hi,
        overall_risk_level=analysis_record.overall_risk_level,
        key_obligations=analysis_record.key_obligations or [],
        party_rights=analysis_record.party_rights or [],
        unclear_terms=analysis_record.unclear_terms or [],
        suggested_questions=analysis_record.suggested_questions or [],
        risks=doc.risks,
        missing_clauses=doc.missing_clauses,
        created_at=analysis_record.created_at
    )

@router.get("/{document_id}", response_model=AnalysisResultResponse)
def get_analysis(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc or not doc.analysis:
        raise HTTPException(status_code=404, detail="Analysis not found for this document.")

    return AnalysisResultResponse(
        id=doc.analysis.id,
        document_id=doc.id,
        summary_en=doc.analysis.summary_en,
        summary_kn=doc.analysis.summary_kn,
        summary_hi=doc.analysis.summary_hi,
        overall_risk_level=doc.analysis.overall_risk_level,
        key_obligations=doc.analysis.key_obligations or [],
        party_rights=doc.analysis.party_rights or [],
        unclear_terms=doc.analysis.unclear_terms or [],
        suggested_questions=doc.analysis.suggested_questions or [],
        risks=doc.risks,
        missing_clauses=doc.missing_clauses,
        created_at=doc.analysis.created_at
    )
