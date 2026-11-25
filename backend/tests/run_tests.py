import httpx

def run_all_tests():
    with httpx.Client(base_url="http://127.0.0.1:8000", timeout=30.0) as client:
        # 1. Health check
        print("1. Testing /health...")
        r = client.get("/health")
        assert r.status_code == 200, f"Health check failed: {r.text}"
        print("   Health check passed:", r.json())

        # 2. Demo login
        print("2. Testing /api/v1/auth/demo-login...")
        r = client.post("/api/v1/auth/demo-login")
        assert r.status_code == 200, f"Demo login failed: {r.text}"
        data = r.json()
        token = data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("   Demo login passed, user:", data["email"])

        # 3. Load synthetic sample document 1 (Rental)
        print("3. Testing /api/v1/documents/load-sample/1...")
        r = client.post("/api/v1/documents/load-sample/1", headers=headers)
        assert r.status_code == 200, f"Load sample failed: {r.text}"
        doc = r.json()
        doc_id = doc["id"]
        print(f"   Loaded sample document ID {doc_id}, Title: {doc['title']}, Category: {doc['category']}")

        # 4. Trigger Analysis
        print(f"4. Testing /api/v1/analysis/{doc_id}/analyze...")
        r = client.post(f"/api/v1/analysis/{doc_id}/analyze", headers=headers)
        assert r.status_code == 200, f"Analysis failed: {r.text}"
        analysis = r.json()
        print(f"   Analysis complete! Risk Level: {analysis['overall_risk_level']}")
        print(f"   Risks found: {len(analysis['risks'])}, Missing Clauses: {len(analysis['missing_clauses'])}, Obligations: {len(analysis['key_obligations'])}")

        # 5. Multilingual RAG Chat
        print(f"5. Testing /api/v1/chat/{doc_id}/message in English and Kannada...")
        r_en = client.post(
            f"/api/v1/chat/{doc_id}/message",
            json={"message": "Can the landlord enter the house without giving notice?", "language": "en"},
            headers=headers
        )
        assert r_en.status_code == 200, f"Chat EN failed: {r_en.text}"
        chat_en = r_en.json()
        print("   Chat EN Citations:", len(chat_en["citations"]))

        r_kn = client.post(
            f"/api/v1/chat/{doc_id}/message",
            json={"message": "ಮನೆಮಾಲೀಕರು ಮುನ್ಸೂಚನೆ ಇಲ್ಲದೆ ಪ್ರವೇಶಿಸಬಹುದೇ?", "language": "kn"},
            headers=headers
        )
        assert r_kn.status_code == 200, f"Chat KN failed: {r_kn.text}"
        print("   Chat KN Response generated successfully.")

        # 6. PDF Report Generation
        print(f"6. Testing /api/v1/reports/{doc_id}/generate...")
        r = client.post(f"/api/v1/reports/{doc_id}/generate", headers=headers)
        assert r.status_code == 200, f"Report generation failed: {r.text}"
        report = r.json()
        print("   PDF Report generated successfully:", report["file_path"])

        print("\nALL BACKEND API TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    run_all_tests()
