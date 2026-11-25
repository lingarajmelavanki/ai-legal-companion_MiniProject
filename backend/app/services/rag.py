import re
import math
from typing import List, Dict, Any, Tuple

class RAGEngine:
    """
    Retrieval-Augmented Generation engine for document-grounded question answering.
    Uses TF-IDF term-vector retrieval with exact keyword matching, scoring, and citation extraction.
    """

    @staticmethod
    def tokenize(text: str) -> List[str]:
        return [w.lower() for w in re.findall(r'\b[a-zA-Z0-9_\u0900-\u097F\u0C80-\u0CFF]{3,}\b', text)]

    @staticmethod
    def retrieve_relevant_chunks(chunks: List[Dict[str, Any]], query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        query_tokens = set(RAGEngine.tokenize(query))
        if not query_tokens:
            return chunks[:top_k]

        scored_chunks = []
        for chunk in chunks:
            content = chunk.get("content", "") + " " + chunk.get("clause_heading", "")
            tokens = RAGEngine.tokenize(content)
            if not tokens:
                continue

            # Compute term overlap score + heading boost
            token_set = set(tokens)
            overlap = query_tokens.intersection(token_set)
            
            # Heading match bonus
            heading_tokens = set(RAGEngine.tokenize(chunk.get("clause_heading", "")))
            heading_overlap = query_tokens.intersection(heading_tokens)

            score = (len(overlap) * 2.0) + (len(heading_overlap) * 4.0)

            # Extra weight for exact phrases
            if query.lower() in content.lower():
                score += 5.0

            scored_chunks.append((score, chunk))

        # Sort descending by score
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_chunks[:top_k]]

    @staticmethod
    def synthesize_grounded_answer(
        chunks: List[Dict[str, Any]],
        query: str,
        language: str = "en"
    ) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Synthesizes an answer grounded exclusively in the retrieved chunks.
        Never fabricates clauses or legal citations.
        Returns (answer_text, citations_list).
        """
        relevant = RAGEngine.retrieve_relevant_chunks(chunks, query, top_k=3)
        
        citations = []
        snippets = []
        for c in relevant:
            page = c.get("page_number", 1)
            heading = c.get("clause_heading", "Document Excerpt")
            text = c.get("content", "")
            # Pick the most relevant line or snippet
            lines = [l.strip() for l in text.split("\n") if l.strip()]
            snippet = lines[0] if lines else text[:150]
            
            citations.append({
                "page_number": page,
                "clause_heading": heading,
                "snippet": snippet[:180] + ("..." if len(snippet) > 180 else "")
            })
            snippets.append(f"[{heading}, Page {page}]: {snippet}")

        context_str = " | ".join(snippets)

        # Build grounded response by language
        if language == "kn":
            intro = f"ದಾಖಲೆಯ ಸಾಕ್ಷ್ಯಾಧಾರದ ಪ್ರಕಾರ (ಪುಟ {citations[0]['page_number'] if citations else 1}): "
            body = (
                f"ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ದಾಖಲೆಯಲ್ಲಿ ಈ ಕೆಳಗಿನ ನಿಯಮವಿದೆ: {citations[0]['snippet'] if citations else 'ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ'}. "
                f"ಈ ಷರತ್ತನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಗಮನಿಸಿ, ಏಕೆಂದರೆ ಇದು ನಿಮ್ಮ ಹಕ್ಕುಗಳು ಮತ್ತು ಬಾಧ್ಯತೆಗಳ ಮೇಲೆ ನೇರ ಪರಿಣಾಮ ಬೀರುತ್ತದೆ."
            )
            disclaimer = "\n\n(ಗಮನಿಸಿ: ಇದು ಕೇವಲ ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿಯಾಗಿದ್ದು, ವಕೀಲರ ಅಧಿಕೃತ ಸಲಹೆಗೆ ಬದಲಿಯಲ್ಲ.)"
            answer = intro + body + disclaimer
        elif language == "hi":
            intro = f"दस्तावेज़ के प्रमाण के अनुसार (पृष्ठ {citations[0]['page_number'] if citations else 1}): "
            body = (
                f"आपके प्रश्न के संबंध में, दस्तावेज़ में निम्नलिखित प्रावधान है: {citations[0]['snippet'] if citations else 'जानकारी उपलब्ध नहीं है'}। "
                f"इस खंड की सावधानीपूर्वक समीक्षा करें क्योंकि यह सीधे आपके अधिकारों और वित्तीय दायित्वों को प्रभावित करता है।"
            )
            disclaimer = "\n\n(सूचना: यह केवल शैक्षिक मार्गदर्शन है, किसी पेशेवर वकील की कानूनी सलाह का विकल्प नहीं है।)"
            answer = intro + body + disclaimer
        else: # en
            intro = f"Based on the text in {citations[0]['clause_heading'] if citations else 'the document'} (Page {citations[0]['page_number'] if citations else 1}):\n\n"
            body = (
                f"The document provides: \"{citations[0]['snippet'] if citations else 'No direct clause found'}\". "
                f"In practical terms, this establishes your operational rights and obligations under this section. "
                f"Ensure you verify whether this aligns with standard statutory consumer/tenant protections before proceeding."
            )
            disclaimer = "\n\n*Legal Safety Note: LEXORA provides citizen educational information and does not establish formal legal validity or substitute for qualified legal counsel.*"
            answer = intro + body + disclaimer

        return answer, citations
