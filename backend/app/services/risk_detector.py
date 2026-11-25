import re
from typing import List, Dict, Any

class RiskDetector:
    """
    Evaluates legal clauses against citizen-protection heuristics and legal doctrines.
    Every finding includes direct supporting evidence, severity, legal rationale,
    multilingual explanations (English, Kannada, Hindi), and tailored questions for legal review.
    """

    @staticmethod
    def analyze_chunks(chunks: List[Dict[str, Any]], category: str) -> List[Dict[str, Any]]:
        findings = []

        for chunk in chunks:
            text = chunk["content"]
            page_num = chunk.get("page_number", 1)
            heading = chunk.get("clause_heading", "Clause Analysis")

            # 1. Unilateral / Immediate Termination without cure period
            if re.search(r'(terminate\s+(?:immediately|forthwith|without\s+notice|at\s+any\s+time\s+without\s+cause))', text, re.I):
                findings.append({
                    "clause_reference": f"{heading} (Page {page_num})",
                    "page_number": page_num,
                    "original_text": text[:400] + ("..." if len(text) > 400 else ""),
                    "severity": "High",
                    "category": "Termination Rights",
                    "explanation_en": "This clause allows the other party to terminate this contract immediately without providing prior written notice or an opportunity to cure a breach.",
                    "explanation_kn": "ಈ ಷರತ್ತು ಇತರ ಪಕ್ಷಕ್ಕೆ ಯಾವುದೇ ಪೂರ್ವ ಲಿಖಿತ ಸೂಚನೆ ನೀಡದೆ ಅಥವಾ ತಪ್ಪು ಸರಿಪಡಿಸಲು ಅವಕಾಶ ನೀಡದೆ ತಕ್ಷಣವೇ ಒಪ್ಪಂದವನ್ನು ರದ್ದುಗೊಳಿಸಲು ಅನುಮತಿಸುತ್ತದೆ.",
                    "explanation_hi": "यह खंड दूसरी पार्टी को बिना किसी पूर्व लिखित नोटिस या गलती सुधारने का मौका दिए अनुबंध को तुरंत समाप्त करने की अनुमति देता है।",
                    "legal_rationale": "Fair contracting principles require a reasonable notice period (typically 15-30 days) and a cure period before termination for default.",
                    "questions_to_ask": [
                        "Can we insert a mandatory 30-day prior written notice requirement for both parties?",
                        "Is there a 15-day cure period before either party can declare a material breach?"
                    ]
                })

            # 2. Complete Security Deposit Forfeiture / Onerous Penalty
            if re.search(r'(forfeit(?:ure)?\s+(?:of\s+)?(?:the\s+entire|all)\s+(?:security\s+)?deposit|liquidated\s+damages\s+(?:of|amounting\s+to|equal\s+to))', text, re.I):
                findings.append({
                    "clause_reference": f"{heading} (Page {page_num})",
                    "page_number": page_num,
                    "original_text": text[:400] + ("..." if len(text) > 400 else ""),
                    "severity": "High",
                    "category": "Financial Penalty",
                    "explanation_en": "Permits full forfeiture of the security deposit or imposes predetermined damages regardless of actual financial loss incurred.",
                    "explanation_kn": "ವಾಸ್ತವಿಕ ಹಾನಿಯನ್ನು ಲೆಕ್ಕಿಸದೆ ಸಂಪೂರ್ಣ ಭದ್ರತಾ ಠೇವಣಿಯನ್ನು ಮುಟ್ಟುಗೋಲು ಹಾಕಿಕೊಳ್ಳಲು ಅಥವಾ ಭಾರಿ ದಂಡ ವಿಧಿಸಲು ಅನುಮತಿಸುತ್ತದೆ.",
                    "explanation_hi": "वास्तविक वित्तीय नुकसान की परवाह किए बिना पूरी सुरक्षा जमा राशि को जब्त करने या भारी जुर्माना लगाने की अनुमति देता है।",
                    "legal_rationale": "Courts generally disallow arbitrary penalty clauses unless genuine pre-estimated damages can be proven by the claimant.",
                    "questions_to_ask": [
                        "Can deductions from the security deposit be restricted only to actual, documented physical damages or arrears?",
                        "What is the maximum itemized cap on repair deductions upon handover?"
                    ]
                })

            # 3. Post-Employment Non-Compete / Restraint of Trade
            if re.search(r'(shall\s+not\s+(?:directly\s+or\s+indirectly\s+)?(?:engage|work|participate|render\s+services)\s+in\s+any\s+(?:competing|similar)\s+business|non-compete\s+for\s+a\s+period\s+of)', text, re.I):
                findings.append({
                    "clause_reference": f"{heading} (Page {page_num})",
                    "page_number": page_num,
                    "original_text": text[:400] + ("..." if len(text) > 400 else ""),
                    "severity": "High",
                    "category": "Restraint of Trade / Non-Compete",
                    "explanation_en": "Imposes a post-employment restriction on your right to work for competing firms or within your professional domain.",
                    "explanation_kn": "ಕೆಲಸ ಬಿಟ್ಟ ನಂತರ ನಿಮ್ಮ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅಥವಾ ಸ್ಪರ್ಧಿ ಕಂಪನಿಗಳಲ್ಲಿ ಕೆಲಸ ಮಾಡುವುದನ್ನು ನಿರ್ಬಂಧಿಸುತ್ತದೆ.",
                    "explanation_hi": "नौकरी छोड़ने के बाद आपके पेशेवर क्षेत्र या प्रतिस्पर्धी कंपनियों में काम करने पर प्रतिबंध लगाता है।",
                    "legal_rationale": "Under Indian Contract Act Section 27, post-termination non-compete agreements are prima facie void as unlawful restraints on lawful profession/trade.",
                    "questions_to_ask": [
                        "Is this post-employment non-compete enforceable under governing state and national labor laws?",
                        "Can this restriction be narrowed strictly to non-solicitation of active clients and non-disclosure of proprietary trade secrets?"
                    ]
                })

            # 4. Mandatory Employment Service Bond / Training Cost Clawback
            if re.search(r'(service\s+bond|minimum\s+lock-in\s+period\s+of\s+\d+|reimburse\s+the\s+entire\s+training\s+cost|pay\s+(?:INR|Rs\.?|\$)\s*[\d,]+\s+(?:as\s+compensation|upon\s+resignation))', text, re.I):
                findings.append({
                    "clause_reference": f"{heading} (Page {page_num})",
                    "page_number": page_num,
                    "original_text": text[:400] + ("..." if len(text) > 400 else ""),
                    "severity": "High",
                    "category": "Financial Penalty / Bond",
                    "explanation_en": "Mandates financial compensation or cost recovery if you resign before completing a mandatory minimum service period.",
                    "explanation_kn": "ನಿಗದಿತ ಅವಧಿಗಿಂತ ಮುಂಚೆ ರಾಜೀನಾಮೆ ನೀಡಿದರೆ ಭಾರಿ ಮೊತ್ತದ ತರಬೇತಿ ವೆಚ್ಚ ಅಥವಾ ಪರಿಹಾರ ಪಾವತಿಸಲು ಒತ್ತಾಯಿಸುತ್ತದೆ.",
                    "explanation_hi": "न्यूनतम सेवा अवधि पूरी होने से पहले इस्तीफा देने पर भारी मुआवजा या प्रशिक्षण लागत चुकाने की मांग करता है।",
                    "legal_rationale": "Employer bonds are only enforceable to the extent of actual, verifiable expenses incurred for specialized training, not as punitive deterrents.",
                    "questions_to_ask": [
                        "Has the employer provided itemized invoices proving real specialized external training expenses?",
                        "Can the repayment amount be prorated proportionately based on the months already served?"
                    ]
                })

            # 5. Landlord Unrestricted Entry / Inspection without Notice
            if re.search(r'(landlord\s+(?:or\s+agent\s+)?shall\s+(?:be\s+entitled|have\s+the\s+right)\s+to\s+enter\s+(?:at\s+all\s+times|any\s+time|without\s+notice))', text, re.I):
                findings.append({
                    "clause_reference": f"{heading} (Page {page_num})",
                    "page_number": page_num,
                    "original_text": text[:400] + ("..." if len(text) > 400 else ""),
                    "severity": "Medium",
                    "category": "Privacy & Quiet Enjoyment",
                    "explanation_en": "Grants the landlord the right to enter the leased premises at any time without advance written notification.",
                    "explanation_kn": "ಯಾವುದೇ ಮುನ್ಸೂಚನೆ ಇಲ್ಲದೆ ಮನೆಮಾಲೀಕರಿಗೆ ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಆವರಣ ಪ್ರವೇಶಿಸಲು ಅನುಮತಿಸುತ್ತದೆ.",
                    "explanation_hi": "मकान मालिक को बिना किसी अग्रिम सूचना के किसी भी समय परिसर में प्रवेश करने का अधिकार देता है।",
                    "legal_rationale": "Model Tenancy law and common law guarantee the tenant's right to quiet enjoyment; entry typically requires at least 24 hours written notice except during natural emergencies.",
                    "questions_to_ask": [
                        "Can we revise this to require at least 24 hours prior written notice (via email/message) during normal daytime hours (9 AM - 6 PM)?"
                    ]
                })

            # 6. Unlimited Indemnity / One-sided Liability Waiver
            if re.search(r'(indemnify\s+(?:and\s+hold\s+harmless\s+)?against\s+all\s+(?:claims|losses|damages)|sole\s+and\s+exclusive\s+liability|disclaim\s+all\s+liability)', text, re.I):
                findings.append({
                    "clause_reference": f"{heading} (Page {page_num})",
                    "page_number": page_num,
                    "original_text": text[:400] + ("..." if len(text) > 400 else ""),
                    "severity": "Medium",
                    "category": "Liability & Indemnity",
                    "explanation_en": "Creates an unbalanced indemnity requirement where you bear full financial liability, while the other party caps or disclaims their own liability.",
                    "explanation_kn": "ಅಸಮಾನ ಹೊಣೆಗಾರಿಕೆಯನ್ನು ಸೃಷ್ಟಿಸುತ್ತದೆ; ನಿಮ್ಮ ಮೇಲೆ ಎಲ್ಲ ನಷ್ಟದ ಹೊಣೆ ಹೊರಿಸುತ್ತದೆ ಆದರೆ ಎದುರು ಪಕ್ಷವು ತನ್ನ ಹೊಣೆಗಾರಿಕೆಯನ್ನು ತಪ್ಪಿಸಿಕೊಳ್ಳುತ್ತದೆ.",
                    "explanation_hi": "एकतरफा क्षतिपूर्ति दायित्व बनाता है, जहां आपको सभी नुकसानों के लिए उत्तरदायी ठहराया जाता है लेकिन दूसरी पार्टी अपनी जिम्मेदारी से बचती है।",
                    "legal_rationale": "Indemnity should be mutual, tied to direct losses caused by willful negligence or material breach, and capped at contract value.",
                    "questions_to_ask": [
                        "Can this indemnity obligation be made mutual?",
                        "Is there a reasonable aggregate cap on total liability (e.g. total contract fees paid in 6 months)?"
                    ]
                })

            # 7. Unilateral Modification / Automatic Renewal
            if re.search(r'(reserve\s+the\s+right\s+to\s+(?:alter|modify|amend)\s+these\s+terms\s+at\s+any\s+time|automatically\s+renew\s+unless\s+notified)', text, re.I):
                findings.append({
                    "clause_reference": f"{heading} (Page {page_num})",
                    "page_number": page_num,
                    "original_text": text[:400] + ("..." if len(text) > 400 else ""),
                    "severity": "Low",
                    "category": "Contract Amendment",
                    "explanation_en": "Allows unilateral changes to the terms or automatically renews the agreement without requiring your explicit written consent.",
                    "explanation_kn": "ನಿಮ್ಮ ಲಿಖಿತ ಒಪ್ಪಿಗೆಯಿಲ್ಲದೆ ನಿಯಮಗಳನ್ನು ಬದಲಾಯಿಸಲು ಅಥವಾ ಒಪ್ಪಂದವನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ನವೀಕರಿಸಲು ಅನುಮತಿಸುತ್ತದೆ.",
                    "explanation_hi": "आपकी स्पष्ट सहमति के बिना शर्तों को एकतरफा बदलने या अनुबंध को स्वतः नवीनीकृत करने की अनुमति देता है।",
                    "legal_rationale": "Contract variations require mutual agreement and consideration to be enforceable.",
                    "questions_to_ask": [
                        "Can any amendment require written consent signed by both authorized parties?"
                    ]
                })

        # Ensure we don't duplicate identical findings within the same clause
        unique_findings = []
        seen = set()
        for f in findings:
            key = (f["category"], f["page_number"], f["clause_reference"], f["original_text"][:80])
            if key not in seen:
                seen.add(key)
                unique_findings.append(f)

        return unique_findings
