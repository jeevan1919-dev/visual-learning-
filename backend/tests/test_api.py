import io
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import init_db

# Initialize database tables for testing
init_db()

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "ai_provider" in data

def test_unauthenticated_request_rejected():
    # Calling protected endpoint without token must return 401 Unauthorized
    response = client.get("/api/documents")
    assert response.status_code == 401
    assert "Authentication required" in response.json()["detail"]

    response_me = client.get("/api/auth/me")
    assert response_me.status_code == 401

def test_auth_signup_and_login_flow():
    unique_email = f"student_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    # 1. Sign up
    signup_res = client.post(
        "/api/auth/signup",
        json={
            "email": unique_email,
            "password": password,
            "display_name": "Test Student"
        }
    )
    assert signup_res.status_code == 200
    signup_data = signup_res.json()
    assert "access_token" in signup_data
    assert signup_data["user"]["email"] == unique_email
    assert signup_data["user"]["display_name"] == "Test Student"

    # 2. Duplicate signup should be rejected with 400
    dup_res = client.post(
        "/api/auth/signup",
        json={"email": unique_email, "password": password}
    )
    assert dup_res.status_code == 400

    # 3. Login with wrong password should return 401
    wrong_login = client.post(
        "/api/auth/login",
        json={"email": unique_email, "password": "WrongPassword999!"}
    )
    assert wrong_login.status_code == 401

    # 4. Login with correct password
    login_res = client.post(
        "/api/auth/login",
        json={"email": unique_email, "password": password}
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token

    # 5. Access /api/auth/me using Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == unique_email

    # 6. Access /api/stats/dashboard using Bearer token
    stats_res = client.get("/api/stats/dashboard", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "total_documents" in stats
    assert "average_quiz_score" in stats
    assert "provider_info" in stats

    # 7. Upload and list documents for this authenticated user
    pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Resources <<>>\n>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n212\n%%EOF"

    upload_res = client.post(
        "/api/documents",
        headers=headers,
        data={"title": "Introduction to AI", "subject": "Computer Science"},
        files={"file": ("intro_ai.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    )
    assert upload_res.status_code == 200
    doc_id = upload_res.json()["id"]

    # List documents
    docs_res = client.get("/api/documents", headers=headers)
    assert docs_res.status_code == 200
    docs = docs_res.json()
    assert any(d["id"] == doc_id for d in docs)

    # Document status
    status_res = client.get(f"/api/documents/{doc_id}/status", headers=headers)
    assert status_res.status_code == 200
    assert "status" in status_res.json()
