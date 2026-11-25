import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.classifier import DocumentClassifier
from app.services.risk_detector import RiskDetector
from app.services.missing_clause_detector import MissingClauseDetector
from app.services.rag import RAGEngine
from app.services.extractor import DocumentExtractor

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "LEXORA"

def test_classifier():
    lease_text = "This Residential Lease Agreement is between Landlord and Tenant for monthly rent of Rs 40,000."
    category = DocumentClassifier.classify(lease_text)
    assert category == "Rental / Lease Agreement"

    emp_text = "This Employment Contract appoints the Employee with salary, designation, and probation duties."
    category2 = DocumentClassifier.classify(emp_text)
    assert category2 == "Employment Contract"

def test_risk_detection():
    chunks = [
        {
            "clause_heading": "Clause 4.1: Unilateral Termination",
            "page_number": 1,
            "content": "The Landlord may terminate immediately without notice and forfeit the entire security deposit."
        }
    ]
    risks = RiskDetector.analyze_chunks(chunks, "Rental / Lease Agreement")
    assert len(risks) >= 1
    # Check that high risk is flagged with evidence
    severities = [r["severity"] for r in risks]
    assert "High" in severities

def test_missing_clauses():
    text = "Simple lease agreement without any mention of repairs or inspections or force majeure."
    missing = MissingClauseDetector.detect_missing_clauses(text, "Rental / Lease Agreement")
    assert len(missing) >= 3
    clause_names = [m["clause_name"] for m in missing]
    assert any("Security Deposit Refund" in name for name in clause_names)

def test_rag_synthesis():
    chunks = [
        {
            "clause_heading": "Lock-in Period",
            "page_number": 1,
            "content": "The tenant agrees to an 11-month lock-in period. If tenant leaves early, the entire deposit of 3 lakhs is forfeited."
        }
    ]
    answer, citations = RAGEngine.synthesize_grounded_answer(chunks, "What is the lock-in period?", language="en")
    assert len(citations) >= 1
    assert "lock-in" in answer.lower() or "deposit" in answer.lower()
    assert citations[0]["page_number"] == 1

def test_auth_and_sample_document_flow():
    # Test demo login
    login_resp = client.post("/api/v1/auth/demo-login")
    assert login_resp.status_code == 200
    token_data = login_resp.json()
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Load synthetic sample document 1 (Rental)
    load_resp = client.post("/api/v1/documents/load-sample/1", headers=headers)
    assert load_resp.status_code == 200
    doc = load_resp.json()
    doc_id = doc["id"]
    assert doc["category"] == "Rental / Lease Agreement"

    # Run Analysis
    analysis_resp = client.post(f"/api/v1/analysis/{doc_id}/analyze", headers=headers)
    assert analysis_resp.status_code == 200
    analysis = analysis_resp.json()
    assert analysis["overall_risk_level"] in ["High", "Elevated", "Moderate", "Low"]
    assert len(analysis["risks"]) > 0
    assert len(analysis["missing_clauses"]) > 0
    assert len(analysis["key_obligations"]) > 0

    # Test Grounded RAG Chat
    chat_resp = client.post(
        f"/api/v1/chat/{doc_id}/message",
        json={"message": "Can the landlord enter without notice?", "language": "en"},
        headers=headers
    )
    assert chat_resp.status_code == 200
    chat_data = chat_resp.json()
    assert chat_data["role"] == "assistant"
    assert len(chat_data["citations"]) > 0

    # Test PDF Report Generation
    report_resp = client.post(f"/api/v1/reports/{doc_id}/generate", headers=headers)
    assert report_resp.status_code == 200
    report_data = report_resp.json()
    assert "download_url" in report_data
