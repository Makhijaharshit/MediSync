import os
import io
import pytest
import fitz  # PyMuPDF
from PIL import Image, ImageDraw, ImageFont
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Setup paddlex cache paths for tests
workspace_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
paddlex_cache = os.path.join(workspace_root, ".paddlex")
os.environ["PADDLE_PDX_CACHE_HOME"] = paddlex_cache
os.environ["PADDLE_HOME"] = os.path.join(workspace_root, ".paddle")
os.environ["PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK"] = "True"

from backend.app.core.database import Base, get_db
from backend.app.main import app
from backend.app.models.models import User, MedicalDocument, MedicalEntity, TimelineEvent
from backend.app.services.ocr_service import ocr_service
from backend.app.services.extraction_service import extraction_service
from backend.app.services.validation_service import validation_service
from backend.app.services.timeline_service import timeline_service
from backend.app.db.seed import seed_admin_user

TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    seed_admin_user(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture
def auth_token(client):
    res = client.post("/api/auth/register", json={
        "email": "test.patient@medsync.io",
        "password": "Password123!",
        "full_name": "Test Patient",
        "role": "patient"
    })
    if res.status_code == 201:
        return res.json()["access_token"]
    login_res = client.post("/api/auth/login", json={
        "email": "test.patient@medsync.io",
        "password": "Password123!"
    })
    return login_res.json()["access_token"]

def create_sample_pdf(text: str, filename: str) -> str:
    temp_dir = os.path.join(workspace_root, "scratch_test_files")
    os.makedirs(temp_dir, exist_ok=True)
    pdf_path = os.path.join(temp_dir, filename)
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)  # A4 size
    page.insert_text((50, 80), text, fontsize=14)
    doc.save(pdf_path)
    doc.close()
    return pdf_path

def create_sample_image(text: str, filename: str) -> str:
    temp_dir = os.path.join(workspace_root, "scratch_test_files")
    os.makedirs(temp_dir, exist_ok=True)
    img_path = os.path.join(temp_dir, filename)
    img = Image.new("RGB", (800, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Draw simple readable text
    y = 40
    for line in text.split("\n"):
        draw.text((40, y), line, fill=(0, 0, 0))
        y += 35
    img.save(img_path)
    return img_path

def test_ocr_service_differentiation():
    """Verify that PaddleOCR + PyMuPDF produces distinct text for different inputs, proving no mocks."""
    pdf_text_1 = "Hospital Discharge Summary\nDiagnosis: Type 2 Diabetes Mellitus\nRx: Metformin 500mg BID\nAllergies: Penicillin"
    pdf_path_1 = create_sample_pdf(pdf_text_1, "test_doc_1.pdf")

    pdf_text_2 = "Cardiology Clinical Review\nDiagnosis: Essential Hypertension\nRx: Lisinopril 10mg daily\nAllergies: Aspirin"
    pdf_path_2 = create_sample_pdf(pdf_text_2, "test_doc_2.pdf")

    res_1 = ocr_service.process_document(pdf_path_1)
    res_2 = ocr_service.process_document(pdf_path_2)

    assert "ocr_text" in res_1
    assert "ocr_text" in res_2
    assert res_1["ocr_text"] != res_2["ocr_text"]
    assert "Diabetes" in res_1["ocr_text"]
    assert "Hypertension" in res_2["ocr_text"]

def test_file_format_validation(client, auth_token):
    """Verify unsupported formats return HTTP 400."""
    fake_txt = io.BytesIO(b"Unsupported file format text")
    res = client.post(
        "/api/documents/upload",
        headers={"Authorization": f"Bearer {auth_token}"},
        files={"file": ("unsupported.txt", fake_txt, "text/plain")}
    )
    assert res.status_code == 400
    assert "Unsupported file format" in res.json()["detail"]

def test_file_size_validation(client, auth_token):
    """Verify file exceeding 20 MB is rejected with HTTP 400."""
    large_payload = b"0" * (20 * 1024 * 1024 + 1024)  # > 20 MB
    large_file = io.BytesIO(large_payload)
    res = client.post(
        "/api/documents/upload",
        headers={"Authorization": f"Bearer {auth_token}"},
        files={"file": ("large_scan.png", large_file, "image/png")}
    )
    assert res.status_code == 400
    assert "exceeds maximum limit" in res.json()["detail"]

def test_document_upload_and_extraction_pipeline(client, auth_token):
    """Test full upload -> real OCR -> extraction -> unverified entities flow."""
    clinical_note = (
        "Patient Clinical Chart\n"
        "Diagnosis: Type 2 Diabetes Mellitus, Essential Hypertension\n"
        "Rx: Metformin 500mg BID\n"
        "Allergies: Penicillin severe\n"
        "Procedures: Colonoscopy\n"
        "HbA1c: 7.4 %\n"
    )
    pdf_path = create_sample_pdf(clinical_note, "clinical_chart.pdf")

    with open(pdf_path, "rb") as f:
        res = client.post(
            "/api/documents/upload",
            headers={"Authorization": f"Bearer {auth_token}"},
            files={"file": ("clinical_chart.pdf", f, "application/pdf")},
            data={"title": "Blood Test & Clinical Chart"}
        )

    assert res.status_code == 201
    doc_data = res.json()
    assert doc_data["status"] == "unverified"
    assert doc_data["documentId"] == doc_data["id"]
    assert "ocr_text" in doc_data
    assert len(doc_data["ocr_text"]) > 0

    # Verify entities were extracted and saved as unverified
    entities = doc_data["entities"]
    assert len(entities) > 0
    for entity in entities:
        assert entity["verified"] is False
        assert entity["confidence"] > 0
        assert entity["source_page"] >= 1

    entity_types = {e["type"] for e in entities}
    assert "diagnosis" in entity_types
    assert "medication" in entity_types
    assert "allergy" in entity_types

def test_document_verification_and_timeline_generation(client, auth_token):
    """Test human verification -> updates entities to verified -> writes to timeline_events."""
    clinical_note = "Discharge Summary\nDiagnosis: Asthma\nRx: Albuterol 90mcg PRN\nAllergies: Latex"
    pdf_path = create_sample_pdf(clinical_note, "discharge_summary.pdf")

    with open(pdf_path, "rb") as f:
        upload_res = client.post(
            "/api/documents/upload",
            headers={"Authorization": f"Bearer {auth_token}"},
            files={"file": ("discharge_summary.pdf", f, "application/pdf")},
            data={"title": "Discharge Summary"}
        )
    assert upload_res.status_code == 201
    doc = upload_res.json()
    doc_id = doc["id"]

    # Verify with human review
    entities_to_verify = [
        {
            "type": "diagnosis",
            "value": "Asthma",
            "details": "Confirmed by specialist",
            "confidence": 0.98,
            "verified": True,
            "source_page": 1,
            "date_recorded": "2026-09-24"
        },
        {
            "type": "medication",
            "value": "Albuterol",
            "details": "90mcg PRN",
            "confidence": 0.95,
            "verified": True,
            "source_page": 1,
            "date_recorded": "2026-09-24"
        }
    ]

    verify_res = client.post(
        f"/api/documents/{doc_id}/verify",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"entities": entities_to_verify}
    )
    assert verify_res.status_code == 200
    verified_doc = verify_res.json()
    assert verified_doc["status"] == "verified"
    assert len(verified_doc["entities"]) == 2
    assert all(e["verified"] is True for e in verified_doc["entities"])

    # Check timeline endpoint
    timeline_res = client.get(
        "/api/timeline",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert timeline_res.status_code == 200
    timeline_items = timeline_res.json()
    timeline_values = [item["value"] for item in timeline_items]
    assert "Asthma" in timeline_values
    assert "Albuterol" in timeline_values
