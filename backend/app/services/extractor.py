import os
import re
from pathlib import Path
from typing import List, Dict, Any
import fitz  # PyMuPDF
from docx import Document as DocxDocument
from PIL import Image

class DocumentExtractor:
    @staticmethod
    def extract_text_from_file(file_path: str) -> List[Dict[str, Any]]:
        """
        Extracts structured text from PDF, DOCX, TXT, or Image files.
        Returns a list of chunk dictionaries:
        [
            {
                "page_number": int,
                "clause_heading": str,
                "content": str,
                "cleaned_content": str
            }
        ]
        """
        path = Path(file_path)
        ext = path.suffix.lower()

        if ext == ".pdf":
            return DocumentExtractor._extract_pdf(file_path)
        elif ext == ".docx":
            return DocumentExtractor._extract_docx(file_path)
        elif ext in [".txt", ".md"]:
            return DocumentExtractor._extract_txt(file_path)
        elif ext in [".jpg", ".jpeg", ".png"]:
            return DocumentExtractor._extract_image(file_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}")

    @staticmethod
    def _extract_pdf(file_path: str) -> List[Dict[str, Any]]:
        chunks = []
        with fitz.open(file_path) as doc:
            for page_idx in range(len(doc)):
                page = doc[page_idx]
                page_num = page_idx + 1
                raw_text = page.get_text("text")

                if not raw_text.strip():
                    continue

                page_chunks = DocumentExtractor._segment_text_into_clauses(raw_text, page_num)
                chunks.extend(page_chunks)

        # If PDF was scanned and had no embedded text, attempt Gemini Vision OCR if configured
        if not chunks:
            ocr_text = DocumentExtractor._ocr_with_gemini_pdf(file_path)
            if ocr_text:
                return DocumentExtractor._segment_text_into_clauses(ocr_text, page_number=1)
            chunks.append({
                "page_number": 1,
                "clause_heading": "Scanned Document Notice",
                "content": (
                    "This PDF appears to be a scanned image without embedded selectable text. "
                    "Configure GEMINI_API_KEY in .env to enable automatic Vision OCR extraction, "
                    "or upload a text-selectable PDF/DOCX/TXT file."
                ),
                "cleaned_content": "Scanned PDF without selectable text."
            })
        return chunks

    @staticmethod
    def _extract_docx(file_path: str) -> List[Dict[str, Any]]:
        doc = DocxDocument(file_path)
        full_text = []
        for para in doc.paragraphs:
            if para.text.strip():
                full_text.append(para.text.strip())

        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                if row_text:
                    full_text.append(row_text)

        combined_text = "\n\n".join(full_text)
        return DocumentExtractor._segment_text_into_clauses(combined_text, page_number=1)

    @staticmethod
    def _extract_txt(file_path: str) -> List[Dict[str, Any]]:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
        return DocumentExtractor._segment_text_into_clauses(text, page_number=1)

    @staticmethod
    def _extract_image(file_path: str) -> List[Dict[str, Any]]:
        with Image.open(file_path) as img:
            width, height = img.size

        ocr_text = DocumentExtractor._ocr_with_gemini_image(file_path)
        if ocr_text:
            return DocumentExtractor._segment_text_into_clauses(ocr_text, page_number=1)

        info_text = (
            f"[Image Document ({width}x{height}px): No embedded text layer. "
            f"Configure GEMINI_API_KEY in .env to enable Vision OCR text extraction.]"
        )
        return [{
            "page_number": 1,
            "clause_heading": "Visual Document Analysis",
            "content": info_text,
            "cleaned_content": info_text
        }]

    @staticmethod
    def _ocr_with_gemini_image(file_path: str) -> str:
        """Uses Gemini Vision API for OCR when GEMINI_API_KEY is configured."""
        import base64
        import mimetypes
        import httpx
        from app.core.config import settings

        if not settings.GEMINI_API_KEY:
            return ""
        mime_type, _ = mimetypes.guess_type(file_path)
        mime_type = mime_type or "image/png"
        try:
            b64 = base64.b64encode(Path(file_path).read_bytes()).decode("ascii")
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.DEFAULT_LLM_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{
                    "parts": [
                        {"text": "Transcribe all text from this legal document image verbatim, preserving clause numbers and headings."},
                        {"inline_data": {"mime_type": mime_type, "data": b64}}
                    ]
                }],
                "generationConfig": {"temperature": 0.0, "maxOutputTokens": 4096}
            }
            with httpx.Client(timeout=30.0) as client:
                resp = client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
        except Exception:
            pass
        return ""

    @staticmethod
    def _ocr_with_gemini_pdf(file_path: str) -> str:
        """Renders first few pages of a scanned PDF to PNG and runs Gemini Vision OCR."""
        from app.core.config import settings
        if not settings.GEMINI_API_KEY:
            return ""
        import tempfile
        texts = []
        try:
            with fitz.open(file_path) as doc:
                for page_idx in range(min(len(doc), 5)):
                    pix = doc[page_idx].get_pixmap(dpi=150)
                    with tempfile.NamedTemporaryFile(suffix=".png", delete=True) as tmp:
                        pix.save(tmp.name)
                        page_text = DocumentExtractor._ocr_with_gemini_image(tmp.name)
                        if page_text:
                            texts.append(page_text)
        except Exception:
            pass
        return "\n\n".join(texts)

    @staticmethod
    def _segment_text_into_clauses(text: str, page_number: int) -> List[Dict[str, Any]]:
        """
        Segments text by identifiable clauses, numbering patterns, or logical paragraphs.
        """
        # Patterns like: "1. Term", "Clause 2:", "Section 3.1", "Article IV", "WHEREAS", "IN WITNESS WHEREOF"
        clause_pattern = re.compile(
            r'(?=(?:^(?:\d+\.|\([a-z0-9]+\)|Section\s+\d+|Clause\s+\d+|Article\s+[IVX\d]+|WHEREAS|NOW THEREFORE|IN WITNESS WHEREOF|SCHEDULE\s+[A-Z\d]+))[\s\.:])',
            re.MULTILINE | re.IGNORECASE
        )
        
        raw_sections = clause_pattern.split(text)
        cleaned_sections = [s.strip() for s in raw_sections if s.strip()]
        
        # If no clause headers detected, split by double newlines or chunks of ~800 chars
        if len(cleaned_sections) <= 1:
            paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
            if paragraphs:
                cleaned_sections = paragraphs
            else:
                cleaned_sections = [text.strip()]

        chunks = []
        for idx, section in enumerate(cleaned_sections):
            lines = section.split("\n")
            first_line = lines[0].strip()
            # Determine clause heading from first line or generate one
            if len(first_line) < 80:
                heading = first_line
            else:
                heading = f"Clause {idx + 1}"

            clean = re.sub(r'\s+', ' ', section).strip()
            
            chunks.append({
                "page_number": page_number,
                "clause_heading": heading,
                "content": section,
                "cleaned_content": clean
            })
            
        return chunks
