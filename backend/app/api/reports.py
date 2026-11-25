from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.document import Document, GeneratedReport
from app.schemas.report import ReportResponse
from app.services.report_generator import ReportGenerator

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/{document_id}/generate", response_model=ReportResponse)
def generate_report(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc or not doc.analysis:
        raise HTTPException(status_code=400, detail="Document must be analyzed before generating a report.")

    risks_data = [
        {
            "severity": r.severity,
            "clause_reference": r.clause_reference,
            "explanation_en": r.explanation_en,
            "legal_rationale": r.legal_rationale,
            "questions_to_ask": r.questions_to_ask or []
        }
        for r in doc.risks
    ]

    missing_data = [
        {
            "clause_name": mc.clause_name,
            "clause_type": mc.clause_type,
            "importance_level": mc.importance_level,
            "why_it_matters_en": mc.why_it_matters_en,
            "recommended_standard_language": mc.recommended_standard_language
        }
        for mc in doc.missing_clauses
    ]

    pdf_path = ReportGenerator.generate_pdf_report(
        document_id=doc.id,
        title=doc.title,
        category=doc.category,
        overall_risk=doc.analysis.overall_risk_level,
        summary_en=doc.analysis.summary_en,
        obligations=doc.analysis.key_obligations or [],
        risks=risks_data,
        missing_clauses=missing_data
    )

    download_url = f"/api/v1/reports/{doc.id}/download"
    report_record = GeneratedReport(
        document_id=doc.id,
        user_id=current_user.id,
        report_type="pdf",
        file_path=pdf_path,
        download_url=download_url
    )
    db.add(report_record)
    db.commit()
    db.refresh(report_record)

    return report_record

@router.get("/{document_id}/download")
def download_report(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    latest_report = db.query(GeneratedReport).filter(GeneratedReport.document_id == document_id).order_by(GeneratedReport.created_at.desc()).first()
    if not latest_report or not Path(latest_report.file_path).exists():
        # Auto-generate if missing
        if doc.analysis:
            return generate_report(document_id=document_id, db=db, current_user=current_user)
        raise HTTPException(status_code=404, detail="No report found. Please analyze the document first.")

    return FileResponse(
        path=latest_report.file_path,
        filename=f"LEXORA_Analysis_{doc.id}.pdf",
        media_type="application/pdf"
    )
