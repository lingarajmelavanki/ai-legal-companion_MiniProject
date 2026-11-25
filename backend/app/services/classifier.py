import re
from typing import List, Dict, Any

class DocumentClassifier:
    CATEGORIES = {
        "Rental / Lease Agreement": [
            "lease", "tenancy", "tenant", "landlord", "lessor", "lessee", "premises", 
            "security deposit", "rent", "monthly rent", "fixtures", "sublet", "vacating"
        ],
        "Employment Contract": [
            "employment", "employer", "employee", "salary", "remuneration", "probation", 
            "designation", "duties", "termination of employment", "non-compete", "notice period", "provident fund"
        ],
        "Non-Disclosure Agreement (NDA)": [
            "confidentiality", "non-disclosure", "disclosing party", "receiving party", 
            "proprietary information", "trade secrets", "confidential information"
        ],
        "Consumer Loan Agreement": [
            "loan", "borrower", "lender", "principal amount", "interest rate", "equated monthly installment", 
            "emi", "default interest", "hypothecation", "collateral", "repayment schedule"
        ],
        "Freelance / Service Agreement": [
            "service agreement", "consultant", "independent contractor", "scope of work", 
            "deliverables", "milestone", "client", "service provider", "intellectual property assignment"
        ]
    }

    @staticmethod
    def classify(text: str, filename: str = "") -> str:
        combined = f"{filename} {text}".lower()
        
        # Check explicit title patterns first
        if any(w in combined for w in ["lease agreement", "rent agreement", "tenancy agreement", "residential lease"]):
            return "Rental / Lease Agreement"
        if any(w in combined for w in ["employment agreement", "employment contract", "appointment letter", "offer of employment"]):
            return "Employment Contract"
        if any(w in combined for w in ["non-disclosure", "confidentiality agreement", "nda"]):
            return "Non-Disclosure Agreement (NDA)"
        if any(w in combined for w in ["loan agreement", "promissory note", "facility agreement"]):
            return "Consumer Loan Agreement"
        if any(w in combined for w in ["service agreement", "consulting agreement", "freelance agreement"]):
            return "Freelance / Service Agreement"

        # Score based on keyword frequencies
        scores = {}
        for category, keywords in DocumentClassifier.CATEGORIES.items():
            count = sum(len(re.findall(r'\b' + re.escape(kw) + r'\b', combined)) for kw in keywords)
            scores[category] = count

        best_category = max(scores, key=scores.get)
        if scores[best_category] > 2:
            return best_category
            
        return "General Legal Contract"
