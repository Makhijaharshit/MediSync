import pytest
import io
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from backend.app.core.database import Base, get_db
from backend.app.main import app
from backend.app.models.models import User, Patient, MedicalDocument, MedicalEntity, EmergencyEvent, AuditLog
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

def test_admin_login(client):
    res = client.post("/api/auth/login", json={"email": "admin@medsync.io", "password": "password123"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_register_patient(client):
    res = client.post("/api/auth/register", json={
        "email": "sarah.jenkins@test.com",
        "password": "password123",
        "full_name": "Sarah Jenkins",
        "role": "patient"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "sarah.jenkins@test.com"
    assert data["user"]["role"] == "patient"

def test_login_invalid_password(client):
    res = client.post("/api/auth/login", json={"email": "sarah.jenkins@test.com", "password": "wrongpassword"})
    assert res.status_code == 401

def test_get_me(client):
    # Login as newly registered patient
    res = client.post("/api/auth/login", json={"email": "sarah.jenkins@test.com", "password": "password123"})
    token = res.json()["access_token"]

    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "sarah.jenkins@test.com"

def test_patient_emergency_profile(client):
    res = client.post("/api/auth/login", json={"email": "sarah.jenkins@test.com", "password": "password123"})
    token = res.json()["access_token"]

    # Initial profile
    prof_res = client.get("/api/emergency/profile", headers={"Authorization": f"Bearer {token}"})
    assert prof_res.status_code == 200
    assert prof_res.json()["blood_group"] == "Unknown"

    # Update profile
    update_res = client.put("/api/emergency/profile", headers={"Authorization": f"Bearer {token}"}, json={
        "blood_group": "O+",
        "phone": "+1 555-0192",
        "allergies": ["Penicillin"],
        "chronic_conditions": ["Type 2 Diabetes"],
        "notes": "Patient carrying emergency EpiPen."
    })
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["blood_group"] == "O+"
    assert "Penicillin" in data["allergies"]

def test_register_and_use_doctor(client):
    reg_res = client.post("/api/auth/register", json={
        "email": "dr.smith@test.com",
        "password": "password123",
        "full_name": "Dr. Smith",
        "role": "doctor"
    })
    assert reg_res.status_code == 201
    doctor_token = reg_res.json()["access_token"]

    # Doctor lists patients
    patients_res = client.get("/api/doctor/patients", headers={"Authorization": f"Bearer {doctor_token}"})
    assert patients_res.status_code == 200
    patients = patients_res.json()
    assert len(patients) >= 1
    sarah = next(p for p in patients if p["email"] == "sarah.jenkins@test.com")
    assert sarah["blood_group"] == "O+"
