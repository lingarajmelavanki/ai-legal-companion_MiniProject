import re
from typing import List, Dict, Any

class MissingClauseDetector:
    """
    Compares the document's extracted clauses against standardized checklists
    tailored to each legal document category. Identifies whether mandatory or
    recommended protective clauses are absent, incomplete, or ambiguous.
    """

    CHECKLISTS = {
        "Rental / Lease Agreement": [
            {
                "clause_name": "Security Deposit Refund Timeline & Deductions Audit",
                "patterns": [r"refund.*(?:security\s+deposit|deposit)", r"deposit.*shall\s+be\s+refunded\s+within\s+\d+\s+days"],
                "clause_type": "Statutory / Recommended",
                "importance_level": "Critical",
                "why_it_matters_en": "Without a specific refund timeline (e.g. within 15 to 30 days of vacating) and itemized deduction criteria, landlords may delay or unjustifiably withhold deposit funds.",
                "why_it_matters_kn": "ಖಾಲಿ ಮಾಡಿದ ನಂತರ 15-30 ದಿನಗಳಲ್ಲಿ ಭದ್ರತಾ ಠೇವಣಿ ಮರುಪಾವತಿಸುವ ನಿರ್ದಿಷ್ಟ ಗಡುವು ಇಲ್ಲದಿದ್ದರೆ, ಮನೆಮಾಲೀಕರು ಹಣವನ್ನು ಅನಿರ್ದಿಷ್ಟವಾಗಿ ಹಿಡಿದಿಟ್ಟುಕೊಳ್ಳುವ ಅಪಾಯವಿರುತ್ತದೆ.",
                "why_it_matters_hi": "खाली करने के 15-30 दिनों के भीतर सुरक्षा जमा वापस करने की समय सीमा के बिना, मकान मालिक अनुचित रूप से धन रोक सकते हैं।",
                "recommended_standard_language": "The Landlord shall refund the entire Security Deposit to the Tenant within 30 (thirty) days of peaceful handover of keys, after deducting verifiable, itemized charges for actual physical damages beyond fair wear and tear."
            },
            {
                "clause_name": "Landlord Inspection Advance Notice (24-Hour Rule)",
                "patterns": [r"24\s*(?:hours|hrs).*(?:notice|inspection|enter)", r"prior\s+written\s+notice.*enter\s+the\s+premises"],
                "clause_type": "Statutory Protection",
                "importance_level": "High",
                "why_it_matters_en": "Guarantees tenant privacy and quiet enjoyment by preventing landlords from entering the home without at least 24 hours written notice.",
                "why_it_matters_kn": "ಕನಿಷ್ಠ 24 ಗಂಟೆಗಳ ಮುಂಚಿನ ಲಿಖಿತ ಸೂಚನೆಯಿಲ್ಲದೆ ಮನೆಮಾಲೀಕರು ಮನೆಗೆ ಪ್ರವೇಶಿಸುವುದನ್ನು ತಡೆಯುವ ಮೂಲಕ ಬಾಡಿಗೆದಾರರ ಗೌಪ್ಯತೆಯನ್ನು ರಕ್ಷಿಸುತ್ತದೆ.",
                "why_it_matters_hi": "कम से कम 24 घंटे की पूर्व लिखित सूचना के बिना मकान मालिक के प्रवेश को रोककर किरायेदार की निजता सुनिश्चित करता है।",
                "recommended_standard_language": "The Landlord or authorized agent shall provide at least twenty-four (24) hours prior written notice to the Tenant before conducting any inspection or repairs during reasonable daytime hours."
            },
            {
                "clause_name": "Major Structural Repairs & Maintenance Division",
                "patterns": [r"structural\s+repairs?", r"major\s+repairs.*landlord", r"routine\s+maintenance.*tenant"],
                "clause_type": "Commercial Standard",
                "importance_level": "High",
                "why_it_matters_en": "Distinguishes tenant responsibility for minor day-to-day upkeep (bulbs, fuses) from landlord obligation for major structural faults, plumbing seepage, or roof leaks.",
                "why_it_matters_kn": "ಸಣ್ಣಪುಟ್ಟ ದಿನನಿತ್ಯದ ನಿರ್ವಹಣೆ ಮತ್ತು ದೊಡ್ಡ ಕಟ್ಟಡ ದೋಷಗಳು (ಸೋರಿಕೆ, ಗೋಡೆ ಬಿರುಕು) ದುರಸ್ತಿಯ ಜವಾಬ್ದಾರಿಯನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಬೇರ್ಪಡಿಸುತ್ತದೆ.",
                "why_it_matters_hi": "दैनिक रखरखाव और बड़े ढांचागत दोषों (पाइपलाइन, छत रिसाव) की मरम्मत के लिए मकान मालिक की जिम्मेदारी को स्पष्ट करता है।",
                "recommended_standard_language": "The Landlord shall remain responsible for all major structural repairs, plumbing seepage, and external facade maintenance, while Tenant shall be responsible for routine day-to-day electrical and sanitary consumables."
            },
            {
                "clause_name": "Mutual Termination & Reasonable Notice Period",
                "patterns": [r"(?:either\s+party\s+may\s+terminate|mutual\s+termination).*(?:notice\s+of\s+\d+\s+month|30\s+days\s+notice)"],
                "clause_type": "Commercial Standard",
                "importance_level": "High",
                "why_it_matters_en": "Ensures that both tenant and landlord have equal rights to terminate the lease with 1 or 2 months prior written notice after any agreed initial period.",
                "why_it_matters_kn": "ಉಭಯ ಪಕ್ಷಗಳಿಗೂ ಸಮಾನವಾಗಿ 1 ಅಥವಾ 2 ತಿಂಗಳ ಲಿಖಿತ ಮುನ್ಸೂಚನೆ ನೀಡಿ ಒಪ್ಪಂದ ಮುಕ್ತಾಯಗೊಳಿಸುವ ಹಕ್ಕನ್ನು ಖಚಿತಪಡಿಸುತ್ತದೆ.",
                "why_it_matters_hi": "दोनों पक्षों को 1 या 2 महीने की पूर्व लिखित सूचना देकर अनुबंध समाप्त करने का समान अधिकार देता है।",
                "recommended_standard_language": "Either party may terminate this Agreement by giving one (1) calendar month prior written notice to the other party without penalty."
            },
            {
                "clause_name": "Force Majeure / Premise Uninhabitability",
                "patterns": [r"force\s+majeure", r"act\s+of\s+god", r"unfit\s+for\s+(?:habitation|occupation)", r"natural\s+calamity"],
                "clause_type": "Recommended",
                "importance_level": "Moderate",
                "why_it_matters_en": "Suspends rent obligations if the property becomes damaged or uninhabitable due to flood, fire, earthquake, or governmental lockdowns.",
                "why_it_matters_kn": "ಪ್ರವಾಹ, ಬೆಂಕಿ ಅಥವಾ ನೈಸರ್ಗಿಕ ವಿಕೋಪಗಳಿಂದ ಮನೆ ವಾಸಕ್ಕೆ ಯೋಗ್ಯವಲ್ಲದಿದ್ದರೆ ಬಾಡಿಗೆ ಪಾವತಿಯನ್ನು ತಾತ್ಕಾಲಿಕವಾಗಿ ನಿಲ್ಲಿಸುವ ರಕ್ಷಣೆ ನೀಡುತ್ತದೆ.",
                "why_it_matters_hi": "बाढ़, आग या प्राकृतिक आपदाओं के कारण परिसर रहने योग्य न होने पर किराया स्थगित करने का प्रावधान करता है।",
                "recommended_standard_language": "If the leased premises become substantially destroyed or uninhabitable due to fire, flood, act of God, or force majeure, the payment of rent shall be suspended until the premises are fully restored."
            }
        ],

        "Employment Contract": [
            {
                "clause_name": "Clear Probation Duration & Confirmation Mechanism",
                "patterns": [r"probation\s+period\s+of\s+\d+\s+months?", r"confirmation\s+in\s+writing"],
                "clause_type": "Statutory / Standard",
                "importance_level": "Critical",
                "why_it_matters_en": "Without an explicit probation cap (e.g. 3-6 months) and written confirmation process, employers may prolong probation indefinitely at reduced benefits.",
                "why_it_matters_kn": "ಸ್ಪಷ್ಟ ಪ್ರೊಬೇಷನ್ ಅವಧಿ (3-6 ತಿಂಗಳು) ಮತ್ತು ಲಿಖಿತ ದೃಢೀಕರಣ ಇಲ್ಲದಿದ್ದರೆ, ಕಂಪನಿಯು ಕಡಿಮೆ ಸವಲತ್ತುಗಳಲ್ಲಿ ಪ್ರೊಬೇಷನ್ ಅನ್ನು ಅನಿರ್ದಿಷ್ಟವಾಗಿ ವಿಸ್ತರಿಸಬಹುದು.",
                "why_it_matters_hi": "स्पष्ट परिवीक्षा अवधि (3-6 महीने) के बिना, नियोक्ता कम लाभों पर परिवीक्षा को अनिश्चित काल के लिए बढ़ा सकते हैं।",
                "recommended_standard_language": "The Employee shall serve a probation period of three (3) months. Upon satisfactory completion, the Employer shall issue a formal written letter of confirmation."
            },
            {
                "clause_name": "Intellectual Property Carve-Out for Prior & Personal Work",
                "patterns": [r"prior\s+inventions", r"excluded\s+intellectual\s+property", r"outside\s+working\s+hours.*unrelated"],
                "clause_type": "Recommended Protection",
                "importance_level": "High",
                "why_it_matters_en": "Prevents the employer from claiming ownership over software, writing, or inventions you created prior to joining or outside work hours without company resources.",
                "why_it_matters_kn": "ಕಂಪನಿಗೆ ಸೇರುವ ಮುನ್ನ ಅಥವಾ ಕೆಲಸದ ಸಮಯದ ಹೊರಗೆ ಸ್ವಂತವಾಗಿ ರಚಿಸಿದ ತಂತ್ರಾಂಶ ಅಥವಾ ಯೋಜನೆಗಳ ಮಾಲೀಕತ್ವವನ್ನು ಕಂಪನಿ ಕಸಿದುಕೊಳ್ಳದಂತೆ ರಕ್ಷಿಸುತ್ತದೆ.",
                "why_it_matters_hi": "कंपनी में शामिल होने से पहले या काम के घंटों के बाहर स्वतंत्र रूप से बनाए गए प्रोजेक्ट्स पर कंपनी के अनुचित मालिकाना हक को रोकता है।",
                "recommended_standard_language": "All intellectual property conceived or developed by the Employee prior to employment or outside working hours without using Employer resources or confidential data shall remain the sole property of the Employee."
            },
            {
                "clause_name": "Standard Working Hours & Overtime Policy",
                "patterns": [r"working\s+hours\s+shall\s+be", r"overtime\s+compensation", r"standard\s+work\s+week\s+of\s+\d+\s+hours"],
                "clause_type": "Statutory Labor Law",
                "importance_level": "High",
                "why_it_matters_en": "Under Factories and Shops & Establishments Acts, employment contracts should define standard daily/weekly working hours (e.g. 48 hours/week maximum) to prevent 24/7 uncompensated demands.",
                "why_it_matters_kn": "ದೈನಂದಿನ/ವಾರದ ಕೆಲಸದ ಗಂಟೆಗಳನ್ನು ಸ್ಪಷ್ಟಪಡಿಸುವ ಮೂಲಕ ಅತಿಯಾದ ಮತ್ತು ಹೆಚ್ಚುವರಿ ಪರಿಹಾರವಿಲ್ಲದ ದುಡಿಮೆಯನ್ನು ತಡೆಯುತ್ತದೆ.",
                "why_it_matters_hi": "काम के मानक घंटों को परिभाषित करता है ताकि बिना वेतन के अनियंत्रित घंटों तक काम कराने से बचा जा सके।",
                "recommended_standard_language": "The Employee's standard work week shall not exceed 40 to 48 hours per week, with structured overtime compensation or compensatory time off as mandated by local labor enactments."
            },
            {
                "clause_name": "Internal Grievance Redressal & PoSH Compliance",
                "patterns": [r"internal\s+complaints\s+committee", r"posh\s+act", r"grievance\s+redressal"],
                "clause_type": "Statutory Mandatory",
                "importance_level": "Critical",
                "why_it_matters_en": "Mandated by law in many jurisdictions (such as India's PoSH Act 2013) to provide a safe, harassment-free workplace with an active Internal Complaints Committee.",
                "why_it_matters_kn": "ಲೈಂಗಿಕ ಕಿರುಕುಳ ಮುಕ್ತ ಮತ್ತು ಸುರಕ್ಷಿತ ಕೆಲಸದ ವಾತಾವರಣಕ್ಕಾಗಿ ಆಂತರಿಕ ದೂರು ಸಮಿತಿ (PoSH) ಇರುವುದನ್ನು ಕಾನೂನಿನ ಪ್ರಕಾರ ಖಚಿತಪಡಿಸುತ್ತದೆ.",
                "why_it_matters_hi": "कार्यस्थल पर उत्पीड़न मुक्त वातावरण और आंतरिक शिकायत समिति (PoSH कानून) के अनुपालन को अनिवार्य बनाता है।",
                "recommended_standard_language": "The Employer maintains zero tolerance for harassment and provides an active Internal Committee pursuant to the Prevention of Sexual Harassment at Workplace (PoSH) Act."
            }
        ],

        "Non-Disclosure Agreement (NDA)": [
            {
                "clause_name": "Standard Exclusions from Confidentiality",
                "patterns": [r"shall\s+not\s+include.*publicly\s+known", r"public\s+domain.*prior\s+knowledge.*court\s+order"],
                "clause_type": "Legal Standard",
                "importance_level": "Critical",
                "why_it_matters_en": "Must exclude information already public, independently developed, received from third parties, or compelled by judicial subpoena to avoid impossible liability.",
                "why_it_matters_kn": "ಸಾರ್ವಜನಿಕವಾಗಿ ಲಭ್ಯವಿರುವ ಮಾಹಿತಿ ಅಥವಾ ನ್ಯಾಯಾಲಯದ ಆದೇಶದ ಮೇರೆಗೆ ಬಹಿರಂಗಪಡಿಸಬೇಕಾದ ಮಾಹಿತಿಯನ್ನು ಗೌಪ್ಯತೆಯ ಹೊಣೆಗಾರಿಕೆಯಿಂದ ಹೊರಗಿಡುತ್ತದೆ.",
                "why_it_matters_hi": "सार्वजनिक डोमेन में पहले से मौजूद जानकारी या अदालत के आदेश पर आवश्यक प्रकटीकरण को गोपनीयता के दायित्व से बाहर रखता है।",
                "recommended_standard_language": "Confidential Information shall not include information that: (a) is or becomes publicly available without breach; (b) was known prior to disclosure; (c) is independently developed; or (d) is legally compelled to be disclosed under court order."
            },
            {
                "clause_name": "Definite Term of Confidentiality (Sunset Clause)",
                "patterns": [r"confidentiality.*shall\s+survive\s+for\s+(?:a\s+period\s+of\s+)?\d+\s+years?", r"term\s+of\s+\d+\s+years?\s+from\s+disclosure"],
                "clause_type": "Commercial Standard",
                "importance_level": "High",
                "why_it_matters_en": "Without a reasonable time limit (typically 2-3 years, or 5 years for technical secrets), perpetual confidentiality creates ongoing personal exposure for decades.",
                "why_it_matters_kn": "ಗೌಪ್ಯತೆಯ ನಿರ್ದಿಷ್ಟ ಅವಧಿ (ಉದಾ. 2-3 ವರ್ಷಗಳು) ಇಲ್ಲದಿದ್ದರೆ, ಜೀವನಪರ್ಯಂತ ಶಾಶ್ವತ ಹೊಣೆಗಾರಿಕೆಯ ಅಪಾಯವಿರುತ್ತದೆ.",
                "why_it_matters_hi": "निश्चित समय सीमा (जैसे 2-3 वर्ष) के बिना, अनिश्चित काल के लिए गोपनीयता का दायित्व बना रहता है।",
                "recommended_standard_language": "The recipient's duty to protect Confidential Information shall expire three (3) years from the date of disclosure."
            },
            {
                "clause_name": "Return or Destruction of Materials Certification",
                "patterns": [r"return\s+or\s+destroy", r"certificate\s+of\s+destruction", r"promptly\s+return\s+all\s+confidential"],
                "clause_type": "Recommended",
                "importance_level": "Moderate",
                "why_it_matters_en": "Clarifies protocols for safely deleting or returning sensitive files upon project completion, including carve-outs for automated archival backups.",
                "why_it_matters_kn": "ಯೋಜನೆ ಮುಗಿದ ನಂತರ ಸೂಕ್ಷ್ಮ ದಾಖಲೆಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಅಳಿಸಲು ಅಥವಾ ಹಿಂತಿರುಗಿಸಲು ಸ್ಪಷ್ಟ ಪ್ರಕ್ರಿಯೆ ಒದಗಿಸುತ್ತದೆ.",
                "why_it_matters_hi": "प्रोजेक्ट समाप्त होने पर गोपनीय फाइलों को सुरक्षित रूप से वापस करने या नष्ट करने की स्पष्ट प्रक्रिया तय करता है।",
                "recommended_standard_language": "Upon written request, Receiving Party shall return or destroy all copies of Confidential Information, retaining only routine automated secure system backups."
            }
        ],

        "Freelance / Service Agreement": [
            {
                "clause_name": "Detailed Milestone Acceptance & Payment Schedule",
                "patterns": [r"milestones?.*acceptance\s+criteria", r"payment\s+within\s+\d+\s+days\s+of\s+invoice", r"deemed\s+accepted"],
                "clause_type": "Commercial Standard",
                "importance_level": "Critical",
                "why_it_matters_en": "Prevents endless client rejections by specifying clear acceptance testing periods (e.g. 7 days deemed accepted) and invoice payment timelines (e.g. Net 15/30).",
                "why_it_matters_kn": "ಗ್ರಾಹಕರು ಪಾವತಿಯನ್ನು ಅನಗತ್ಯವಾಗಿ ವಿಳಂಬ ಮಾಡದಂತೆ ಕೆಲಸದ ಹಂತಗಳ ಸ್ವೀಕಾರ ಮತ್ತು ಸರಕುಪಟ್ಟಿ ಪಾವತಿಯ ನಿಖರ ದಿನಗಳನ್ನು ನಿಗದಿಪಡಿಸುತ್ತದೆ.",
                "why_it_matters_hi": "भुगतान में देरी को रोकने के लिए कार्य स्वीकृति के नियम और बिल भुगतान की समय सीमा (जैसे 15-30 दिन) तय करता है।",
                "recommended_standard_language": "Deliverables shall be deemed accepted if no written rejection specifying deficiencies is received within seven (7) business days of submission. Invoices shall be payable within fifteen (15) days."
            },
            {
                "clause_name": "Scope Change Request Procedure (Scope Creep Protection)",
                "patterns": [r"change\s+order\s+procedure", r"scope\s+of\s+work.*written\s+amendment", r"additional\s+compensation\s+for\s+changes"],
                "clause_type": "Recommended",
                "importance_level": "High",
                "why_it_matters_en": "Protects freelancers from unpaid additional work by requiring formal written change orders with additional fee quotes before expanding deliverables.",
                "why_it_matters_kn": "ಹೆಚ್ಚುವರಿ ಕೆಲಸಕ್ಕೆ ಲಿಖಿತ ಒಪ್ಪಿಗೆ ಮತ್ತು ಹೆಚ್ಚುವರಿ ಶುಲ್ಕವನ್ನು ಕಡ್ಡಾಯಗೊಳಿಸುವ ಮೂಲಕ ಉಚಿತ ದುಡಿಮೆಯಿಂದ ರಕ್ಷಿಸುತ್ತದೆ.",
                "why_it_matters_hi": "अतिरिक्त काम के लिए लिखित सहमति और अतिरिक्त शुल्क अनिवार्य करके मुफ्त काम करवाने से बचाता है।",
                "recommended_standard_language": "Any modifications to the Statement of Work shall be documented in a written Change Order specifying additional timeline and compensation prior to commencement."
            }
        ]
    }

    @staticmethod
    def detect_missing_clauses(full_text: str, category: str) -> List[Dict[str, Any]]:
        checklist = MissingClauseDetector.CHECKLISTS.get(category)
        if not checklist:
            # Fallback to general checklist
            checklist = MissingClauseDetector.CHECKLISTS["Rental / Lease Agreement"]

        findings = []
        for item in checklist:
            patterns = item["patterns"]
            matched = False
            for pat in patterns:
                if re.search(pat, full_text, re.I):
                    matched = True
                    break

            if not matched:
                findings.append({
                    "clause_name": item["clause_name"],
                    "status": "Absent",
                    "clause_type": item["clause_type"],
                    "importance_level": item["importance_level"],
                    "why_it_matters_en": item["why_it_matters_en"],
                    "why_it_matters_kn": item["why_it_matters_kn"],
                    "why_it_matters_hi": item["why_it_matters_hi"],
                    "recommended_standard_language": item["recommended_standard_language"]
                })

        return findings
