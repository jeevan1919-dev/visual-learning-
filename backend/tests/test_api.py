import io
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

def test_auth_me_demo():
    response = client.get("/api/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "display_name" in data

def test_dashboard_stats():
    response = client.get("/api/stats/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "total_documents" in data
    assert "average_quiz_score" in data
    assert "provider_info" in data

def test_document_lifecycle_upload_and_list():
    # Create sample valid PDF bytes
    pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Resources <<>>\n>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n212\n%%EOF"

    response = client.post(
        "/api/documents",
        data={"title": "Introduction to AI", "subject": "Computer Science"},
        files={"file": ("intro_ai.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    )
    assert response.status_code == 200
    created = response.json()
    assert created["title"] == "Introduction to AI"
    doc_id = created["id"]

    # Verify document listed in GET /api/documents
    list_res = client.get("/api/documents")
    assert list_res.status_code == 200
    docs = list_res.json()
    assert any(d["id"] == doc_id for d in docs)

    # Check status endpoint
    status_res = client.get(f"/api/documents/{doc_id}/status")
    assert status_res.status_code == 200
    assert "status" in status_res.json()
