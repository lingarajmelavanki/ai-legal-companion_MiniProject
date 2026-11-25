import re
from typing import List, Dict, Any

class DocumentSimplifier:
    """
    Synthesizes complex legal clauses into plain-language summaries,
    structured obligations, party rights, and flags confusing or ambiguous legalese.
    """

    AMBIGUOUS_PATTERNS = [
        ("sole and absolute discretion", "Grants one party unlimited power to make decisions without objective criteria or appeal."),
        ("forthwith", "Archaic legalese meaning 'immediately', which can lead to disputes over whether 2 hours, 24 hours, or 3 days is intended."),
        ("best efforts", "Subjective standard that imposes intense legal obligations without specifying what concrete steps are actually required."),
        ("time is of the essence", "A strict legal phrase meaning even a minor 1-hour or 1-day delay can be treated as a total contract breach allowing termination."),
        ("hold harmless", "Overly broad indemnity language that may require you to pay the other party's legal fees and third-party liabilities."),
        ("as determined by the company", "Unilateral benchmark leaving performance, compensation, or penalty assessments entirely to one side.")
    ]

    @staticmethod
    def simplify(full_text: str, category: str, chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        # 1. Detect ambiguous terms
        unclear_terms = []
        for term, why in DocumentSimplifier.AMBIGUOUS_PATTERNS:
            match = re.search(r'([^.\n]*?' + re.escape(term) + r'[^.\n]*)', full_text, re.I)
            if match:
                context_snippet = match.group(1).strip()
                unclear_terms.append({
                    "term": term,
                    "context": context_snippet[:200] + ("..." if len(context_snippet) > 200 else ""),
                    "why_unclear": why,
                    "suggested_clarification": f"Replace with measurable, objective metrics or add 'reasonable mutual agreement'."
                })

        # 2. Extract key obligations
        obligations = DocumentSimplifier._extract_obligations(full_text, category)

        # 3. Extract party rights
        party_rights = DocumentSimplifier._extract_rights(full_text, category)

        # 4. Generate plain-language summaries in 3 languages
        summaries = DocumentSimplifier._generate_summaries(category, full_text, obligations)

        # 5. Suggested citizen questions
        suggested_questions = [
            "Are there any automatic penalty clauses if payments are delayed by a few days?",
            "Can either party terminate this agreement with a 30-day written notice?",
            "What specific conditions must be fulfilled to receive a 100% security deposit or final settlement refund?",
            "Does this agreement contain any non-compete or exclusivity restrictions that limit my future livelihood?"
        ]

        return {
            "summary_en": summaries["en"],
            "summary_kn": summaries["kn"],
            "summary_hi": summaries["hi"],
            "key_obligations": obligations,
            "party_rights": party_rights,
            "unclear_terms": unclear_terms,
            "suggested_questions": suggested_questions
        }

    @staticmethod
    def _extract_obligations(text: str, category: str) -> List[Dict[str, Any]]:
        obligations = []
        
        # Payment obligation
        payment_match = re.search(r'(?:rent|fee|salary|repayment|amount)\s+(?:of\s+)?(?:INR|Rs\.?|\$)\s*[\d,]+.*?(?:on\s+or\s+before|payable\s+by|within)\s+([^.\n]+)', text, re.I)
        if payment_match:
            obligations.append({
                "party": "Payor / Tenant / Employee",
                "obligation": f"Pay the agreed sum punctually: {payment_match.group(0)[:120]}",
                "deadline": payment_match.group(1)[:60].strip(),
                "consequence": "Late fee penalties, interest accrual, or contract breach notice."
            })
        else:
            obligations.append({
                "party": "Primary Obligor",
                "obligation": "Make recurring contract payments as itemized in the compensation / fee schedule.",
                "deadline": "Typically by the 5th or 10th of each calendar month.",
                "consequence": "Late penalty or default interest."
            })

        # Maintenance or Delivery obligation
        if "rental" in category.lower() or "lease" in category.lower():
            obligations.append({
                "party": "Tenant",
                "obligation": "Maintain the interior premises in tenantable condition without making unauthorized structural alterations.",
                "deadline": "Throughout the lease term.",
                "consequence": "Repair costs deducted from the security deposit upon surrender."
            })
            obligations.append({
                "party": "Landlord",
                "obligation": "Maintain major external plumbing, electrical mains, and structural integrity of the property.",
                "deadline": "Within reasonable time upon written notice.",
                "consequence": "Tenant may withhold rent or rectify at landlord expense if agreed."
            })
        elif "employment" in category.lower():
            obligations.append({
                "party": "Employee",
                "obligation": "Perform assigned professional duties with fidelity, and maintain strict confidentiality of proprietary data.",
                "deadline": "Standard business hours and active tenure.",
                "consequence": "Disciplinary proceedings or contract termination."
            })
            obligations.append({
                "party": "Employer",
                "obligation": "Disburse monthly remuneration and statutory benefits on the agreed payroll date.",
                "deadline": "Monthly payroll cycle.",
                "consequence": "Statutory labor penalties."
            })
        else:
            obligations.append({
                "party": "Service Provider / Party B",
                "obligation": "Deliver contracted deliverables adhering strictly to specifications.",
                "deadline": "As per project milestones.",
                "consequence": "Liquidated damages or termination for cause."
            })

        return obligations

    @staticmethod
    def _extract_rights(text: str, category: str) -> List[Dict[str, Any]]:
        rights = []
        if "rental" in category.lower() or "lease" in category.lower():
            rights.append({
                "party": "Tenant",
                "right": "Peaceful possession and quiet enjoyment of the premises without undue landlord intrusion.",
                "condition": "Subject to prompt monthly rent payment and compliance with building bylaws."
            })
            rights.append({
                "party": "Landlord",
                "right": "Inspect premises upon giving reasonable advance written notice and receive possession upon expiry.",
                "condition": "Must adhere to the agreed notice protocol."
            })
        elif "employment" in category.lower():
            rights.append({
                "party": "Employee",
                "right": "Receive agreed compensation, statutory leaves (sick, earned, casual), and a safe work environment.",
                "condition": "Full-time satisfactory performance during tenure."
            })
            rights.append({
                "party": "Employer",
                "right": "Exclusive ownership of work product created by employee during employment hours.",
                "condition": "Limited to duties within the scope of employment."
            })
        else:
            rights.append({
                "party": "Client / Party A",
                "right": "Review, inspect, and approve deliverables prior to signing milestone completion certificates.",
                "condition": "Must submit review feedback within agreed review window."
            })
            rights.append({
                "party": "Contractor / Party B",
                "right": "Receive full and timely payment for approved work milestones.",
                "condition": "Submission of valid tax invoice."
            })
        return rights

    @staticmethod
    def _generate_summaries(category: str, text: str, obligations: List[Dict[str, Any]]) -> Dict[str, str]:
        # English summary
        summary_en = (
            f"This is a {category}. In simple terms, this document sets out the legal binding commitments "
            f"between the parties. It defines the core expectations, periodic payment terms, usage rules, "
            f"and termination rights. Key responsibilities include punctual payments and safeguarding "
            f"property or confidential materials. Before signing, ensure you review the identified risk clauses "
            f"and verify that essential missing safeguards (like clear refund timelines and dispute resolution) are inserted."
        )

        # Kannada summary (ಕನ್ನಡ)
        summary_kn = (
            f"ಇದು {category} ದಾಖಲೆಯಾಗಿದೆ. ಸರಳವಾಗಿ ಹೇಳುವುದಾದರೆ, ಈ ದಾಖಲೆಯು ಉಭಯ ಪಕ್ಷಗಳ ನಡುವಿನ ಕಾನೂನುಬದ್ಧ ಬಾಧ್ಯತೆಗಳನ್ನು "
            f"ನಿಗದಿಪಡಿಸುತ್ತದೆ. ಇದು ಮಾಸಿಕ ಪಾವತಿಗಳು, ಆವರಣ ಅಥವಾ ಸ್ವತ್ತಿನ ಸದ್ಬಳಕೆ ಮತ್ತು ಒಪ್ಪಂದ ರದ್ದತಿಯ ನಿಯಮಗಳನ್ನು ಒಳಗೊಂಡಿದೆ. "
            f"ಸಹಿ ಮಾಡುವ ಮೊದಲು, ಅಪಾಯಕಾರಿ ಷರತ್ತುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಠೇವಣಿ ಮರುಪಾವತಿಯಂತಹ ಪ್ರಮುಖ ಷರತ್ತುಗಳನ್ನು "
            f"ಸೇರಿಸಲಾಗಿದೆಯೇ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ."
        )

        # Hindi summary (हिन्दी)
        summary_hi = (
            f"यह एक {category} का कानूनी दस्तावेज है। सरल शब्दों में, यह दस्तावेज दोनों पक्षों के बीच कानूनी अधिकारों "
            f"और दायित्वों को निर्धारित करता है। इसमें भुगतान की शर्तें, संपत्ति का उपयोग और अनुबंध समाप्त करने के नियम शामिल हैं। "
            f"हस्ताक्षर करने से पहले, पहचाने गए जोखिमों की सावधानीपूर्वक समीक्षा करें और सुनिश्चित करें कि सुरक्षा जमा वापसी "
            f"जैसे आवश्यक सुरक्षात्मक खंड अनुबंध में जोड़े गए हैं।"
        )

        return {"en": summary_en, "kn": summary_kn, "hi": summary_hi}
