import json
import logging
from typing import List, Dict, Any, Tuple
import httpx
from app.core.config import settings
from app.services.risk_detector import RiskDetector
from app.services.missing_clause_detector import MissingClauseDetector
from app.services.simplifier import DocumentSimplifier
from app.services.rag import RAGEngine

logger = logging.getLogger(__name__)

class AIEngine:
    @staticmethod
    async def analyze_document(chunks: List[Dict[str, Any]], category: str) -> Dict[str, Any]:
        """
        Executes end-to-end document intelligence pipeline:
        1. Simplifies clauses into plain English, Kannada, and Hindi
        2. Detects high/medium/low severity legal risks with supporting evidence
        3. Identifies absent and incomplete protective clauses against standard checklists
        4. Detects ambiguous legalese and crafts citizen questions
        """
        full_text = "\n\n".join(c["content"] for c in chunks)

        # First obtain high-confidence rule-based legal findings
        risks = RiskDetector.analyze_chunks(chunks, category)
        missing_clauses = MissingClauseDetector.detect_missing_clauses(full_text, category)
        simplification = DocumentSimplifier.simplify(full_text, category, chunks)

        # Compute overall risk level
        high_risk_count = sum(1 for r in risks if r["severity"] == "High")
        med_risk_count = sum(1 for r in risks if r["severity"] == "Medium")
        
        if high_risk_count >= 2:
            overall_risk = "High"
        elif high_risk_count == 1 or med_risk_count >= 2:
            overall_risk = "Elevated"
        elif med_risk_count >= 1 or len(missing_clauses) >= 2:
            overall_risk = "Moderate"
        else:
            overall_risk = "Low"

        result = {
            "summary_en": simplification["summary_en"],
            "summary_kn": simplification["summary_kn"],
            "summary_hi": simplification["summary_hi"],
            "overall_risk_level": overall_risk,
            "key_obligations": simplification["key_obligations"],
            "party_rights": simplification["party_rights"],
            "unclear_terms": simplification["unclear_terms"],
            "suggested_questions": simplification["suggested_questions"],
            "risks": risks,
            "missing_clauses": missing_clauses
        }

        # If Gemini API Key is available, optionally enrich summaries
        if settings.GEMINI_API_KEY:
            try:
                gemini_summary = await AIEngine._call_gemini_summary(full_text[:4000], category)
                if gemini_summary:
                    if "summary_en" in gemini_summary and gemini_summary["summary_en"]:
                        result["summary_en"] = gemini_summary["summary_en"]
                    if "summary_kn" in gemini_summary and gemini_summary["summary_kn"]:
                        result["summary_kn"] = gemini_summary["summary_kn"]
                    if "summary_hi" in gemini_summary and gemini_summary["summary_hi"]:
                        result["summary_hi"] = gemini_summary["summary_hi"]
            except Exception as e:
                logger.warning(f"Gemini API enrichment skipped: {e}")

        return result

    @staticmethod
    async def chat_rag(
        chunks: List[Dict[str, Any]],
        query: str,
        history: List[Dict[str, Any]] = None,
        language: str = "en"
    ) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Document-grounded question answering with citations.
        """
        # If Gemini API Key is configured, attempt LLM-augmented grounded synthesis
        if settings.GEMINI_API_KEY:
            try:
                relevant_chunks = RAGEngine.retrieve_relevant_chunks(chunks, query, top_k=3)
                context_passages = "\n\n".join(
                    f"[Section: {c.get('clause_heading', 'Clause')}, Page {c.get('page_number', 1)}]:\n{c.get('content', '')}"
                    for c in relevant_chunks
                )

                prompt = (
                    f"You are LEXORA, an expert citizen legal intelligence companion.\n"
                    f"Answer the user's question STRICTLY based on the provided document excerpts.\n"
                    f"Do not hallucinate clauses or citations. If the document does not mention the topic, state that clearly.\n"
                    f"Provide response in language: {language} (en=English, kn=Kannada, hi=Hindi).\n"
                    f"Include specific references to the relevant clause names and page numbers.\n\n"
                    f"DOCUMENT EXCERPTS:\n{context_passages}\n\n"
                    f"USER QUESTION: {query}"
                )

                url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.DEFAULT_LLM_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.2, "maxOutputTokens": 800}
                }
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        text = data["candidates"][0]["content"]["parts"][0]["text"]
                        citations = [
                            {
                                "page_number": c.get("page_number", 1),
                                "clause_heading": c.get("clause_heading", "Excerpt"),
                                "snippet": c.get("content", "")[:180] + "..."
                            }
                            for c in relevant_chunks
                        ]
                        return text, citations
            except Exception as e:
                logger.warning(f"Gemini live chat call failed, falling back to grounded RAG engine: {e}")

        # Grounded RAGEngine fallback
        return RAGEngine.synthesize_grounded_answer(chunks, query, language=language)

    @staticmethod
    async def _call_gemini_summary(text: str, category: str) -> Dict[str, str]:
        prompt = (
            f"You are LEXORA legal simplifier. Analyze this {category} document.\n"
            f"Provide a concise, simplified plain-language explanation for an ordinary citizen in JSON format:\n"
            f"{{\"summary_en\": \"...\", \"summary_kn\": \"... (in Kannada)\", \"summary_hi\": \"... (in Hindi)\"}}\n\n"
            f"DOCUMENT TEXT:\n{text}"
        )
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.DEFAULT_LLM_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"response_mime_type": "application/json", "temperature": 0.2}
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                raw_json = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(raw_json)
        return None
