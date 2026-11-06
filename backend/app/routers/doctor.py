import json
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.models import User, PatientProfile, MedicalDocument, MedicalEntity
from backend.app.schemas.schemas import PatientSummaryOut, DoctorEventCreate, EntityOut
from backend.app.routers.deps import get_current_user, require_roles
from backend.app.services.audit_service import audit_service

router = APIRouter(prefix="/doctor", tags=["Doctor Clinical Portal"])

def parse_json_safely(val, default):
    if not val:
        return default
    try:
        return json.loads(val)
    except Exception:
        return default

@router.get("/patients", response_model=List[PatientSummaryOut])
def list_patients(
    current_user: User = Depends(require_roles(["doctor", "admin"])),
    db: Session = Depends(get_db),
):
    patients = db.query(User).filter(User.role == "patient").all()
    results = []
    for p in patients:
        profile = db.query(PatientProfile).filter(PatientProfile.user_id == p.id).first()
        doc_count = db.query(MedicalDocument).filter(MedicalDocument.patient_id == p.id).count()
        entity_count = db.query(MedicalEntity).filter(MedicalEntity.patient_id == p.id, MedicalEntity.verified == True).count()

        results.append(
            PatientSummaryOut(
                patient_id=p.id,
                full_name=p.full_name,
                email=p.email,
                blood_group=profile.blood_group if profile else "Unknown",
                phone=profile.phone if profile else None,
                dob=profile.dob if profile else None,
                total_documents=doc_count,
                total_records=entity_count,
                allergies=parse_json_safely(profile.allergies, []) if profile else [],
                chronic_conditions=parse_json_safely(profile.chronic_conditions, []) if profile else [],
            )
        )
    return results

@router.get("/patient/{patient_id}")
def get_patient_detail(
    patient_id: str,
    request: Request,
    current_user: User = Depends(require_roles(["doctor", "admin"])),
    db: Session = Depends(get_db),
):
    patient = db.query(User).filter(User.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    profile = db.query(PatientProfile).filter(PatientProfile.user_id == patient_id).first()
    documents = db.query(MedicalDocument).filter(MedicalDocument.patient_id == patient_id).order_by(MedicalDocument.created_at.desc()).all()
    entities = db.query(MedicalEntity).filter(MedicalEntity.patient_id == patient_id).order_by(MedicalEntity.created_at.desc()).all()

    audit_service.log_action(
        db,
        action="DOCTOR_VIEWED_PATIENT",
        actor_id=current_user.id,
        actor_email=current_user.email,
        details=f"Doctor accessed clinical file for {patient.full_name} ({patient.id})",
        ip_address=request.client.host if request.client else None,
    )

    return {
        "patient": {
            "id": patient.id,
            "full_name": patient.full_name,
            "email": patient.email,
            "role": patient.role,
        },
        "profile": {
            "blood_group": profile.blood_group if profile else "Unknown",
            "phone": profile.phone if profile else None,
            "dob": profile.dob if profile else None,
            "emergency_contacts": parse_json_safely(profile.emergency_contacts, []) if profile else [],
            "allergies": parse_json_safely(profile.allergies, []) if profile else [],
            "chronic_conditions": parse_json_safely(profile.chronic_conditions, []) if profile else [],
            "notes": profile.notes if profile else None,
        },
        "documents_count": len(documents),
        "verified_records_count": sum(1 for e in entities if e.verified),
    }

@router.post("/events", response_model=EntityOut, status_code=status.HTTP_201_CREATED)
def add_clinical_event(
    event_in: DoctorEventCreate,
    request: Request,
    current_user: User = Depends(require_roles(["doctor", "admin"])),
    db: Session = Depends(get_db),
):
    patient = db.query(User).filter(User.id == event_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target patient not found")

    current_date = event_in.date_recorded or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    entity = MedicalEntity(
        patient_id=patient.id,
        type=event_in.type,
        value=event_in.value,
        details=f"Clinician Note from Dr. {current_user.full_name}: {event_in.details or ''}".strip(),
        confidence=1.0,
        verified=True,
        date_recorded=current_date,
    )
    db.add(entity)
    db.commit()
    db.refresh(entity)

    audit_service.log_action(
        db,
        action="DOCTOR_ADDED_EVENT",
        actor_id=current_user.id,
        actor_email=current_user.email,
        details=f"Doctor added {entity.type} record to patient {patient.full_name}",
        ip_address=request.client.host if request.client else None,
    )

    return EntityOut.model_validate(entity)
