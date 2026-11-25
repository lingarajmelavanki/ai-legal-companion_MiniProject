import uuid
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.document import Document, DocumentChunk
from app.schemas.document import DocumentResponse, DocumentDetailResponse
from app.services.extractor import DocumentExtractor
from app.services.classifier import DocumentClassifier

router = APIRouter(prefix="/documents", tags=["Documents"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must have a valid filename."
        )

    safe_filename = Path(file.filename).name
    ext = Path(safe_filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed: PDF, DOCX, TXT, PNG, JPG."
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 25 MB limit."
        )

    # Save file to disk with a unique prefix to avoid overwrites and path traversal
    unique_name = f"{current_user.id}_{uuid.uuid4().hex[:12]}_{safe_filename}"
    file_path = settings.UPLOAD_DIR / unique_name
    with open(file_path, "wb") as f:
        f.write(contents)

    # Extract text & clauses
    try:
        raw_chunks = DocumentExtractor.extract_text_from_file(str(file_path))
    except Exception as e:
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to process document: {str(e)}"
        )

    full_text = " ".join(c.get("content", "") for c in raw_chunks)
    detected_category = category or DocumentClassifier.classify(full_text, safe_filename)
    page_count = max([c.get("page_number", 1) for c in raw_chunks], default=1)

    # Create document record
    doc_record = Document(
        user_id=current_user.id,
        title=Path(safe_filename).stem.replace("_", " ").title(),
        filename=safe_filename,
        file_type=ext.replace(".", ""),
        file_size=len(contents),
        file_path=str(file_path),
        category=detected_category,
        status="uploaded",
        page_count=page_count,
        ocr_applied=1 if ext in [".png", ".jpg", ".jpeg"] else 0
    )
    db.add(doc_record)
    db.commit()
    db.refresh(doc_record)

    # Save chunks
    for idx, c in enumerate(raw_chunks):
        chunk_rec = DocumentChunk(
            document_id=doc_record.id,
            chunk_index=idx,
            page_number=c.get("page_number", 1),
            clause_heading=c.get("clause_heading"),
            content=c.get("content", ""),
            cleaned_content=c.get("cleaned_content", "")
        )
        db.add(chunk_rec)
    
    db.commit()
    return doc_record

@router.post("/load-sample/{sample_id}", response_model=DocumentResponse)
def load_sample_document(
    sample_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sample_files = {
        1: ("1_residential_lease_agreement.txt", "Rental / Lease Agreement", "Residential Tenancy Agreement (Bengaluru)"),
        2: ("2_tech_employment_agreement.txt", "Employment Contract", "Software Engineer Employment & Service Bond"),
        3: ("3_mutual_nda.txt", "Non-Disclosure Agreement (NDA)", "Mutual Non-Disclosure Agreement")
    }

    if sample_id not in sample_files:
        raise HTTPException(status_code=404, detail="Sample document not found.")

    filename, category, title = sample_files[sample_id]
    src_path = settings.SAMPLE_DIR / filename
    if not src_path.exists():
        raise HTTPException(status_code=404, detail="Sample file missing from disk.")

    with open(src_path, "r", encoding="utf-8") as f:
        content = f.read()

    target_path = settings.UPLOAD_DIR / f"{current_user.id}_{uuid.uuid4().hex[:12]}_{filename}"
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(content)

    raw_chunks = DocumentExtractor.extract_text_from_file(str(target_path))
    page_count = max([c.get("page_number", 1) for c in raw_chunks], default=1)

    doc_record = Document(
        user_id=current_user.id,
        title=title,
        filename=filename,
        file_type="txt",
        file_size=len(content.encode("utf-8")),
        file_path=str(target_path),
        category=category,
        status="uploaded",
        page_count=page_count,
        ocr_applied=0
    )
    db.add(doc_record)
    db.commit()
    db.refresh(doc_record)

    for idx, c in enumerate(raw_chunks):
        chunk_rec = DocumentChunk(
            document_id=doc_record.id,
            chunk_index=idx,
            page_number=c.get("page_number", 1),
            clause_heading=c.get("clause_heading"),
            content=c.get("content", ""),
            cleaned_content=c.get("cleaned_content", "")
        )
        db.add(chunk_rec)

    db.commit()
    return doc_record

@router.get("/", response_model=List[DocumentResponse])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.created_at.desc()).all()

@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    # Remove file from disk if exists
    try:
        if Path(doc.file_path).exists():
            Path(doc.file_path).unlink()
    except Exception:
        pass

    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully."}
