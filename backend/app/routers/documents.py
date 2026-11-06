import os
import uuid
import shutil
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.models.models import User, MedicalDocument, MedicalEntity, TimelineEvent
from backend.app.schemas.schemas import DocumentOut, DocumentVerifyRequest, EntityOut
from backend.app.routers.deps import get_current_user
from backend.app.core.security import decode_access_token
from backend.app.services.ocr_service import ocr_service
from backend.app.services.extraction_service import extraction_service
from backend.app.services.timeline_service import timeline_service
from backend.app.services.audit_service import audit_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Medical Documents"])

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB

def _find_source_page(val: str, pages_data: list) -> int:
    if not val or not pages_data:
        return 1
    val_lower = val.lower().strip()
    for page in pages_data:
        page_text = page.get("text", "").lower()
        if val_lower in page_text:
            return page.get("page_number", 1)
    first_token = val_lower.split()[0] if val_lower.split() else ""
    if len(first_token) > 3:
        for page in pages_data:
            if first_token in page.get("text", "").lower():
                return page.get("page_number", 1)
    return 1

@router.get("", response_model=List[DocumentOut])
def get_documents(
    patient_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(MedicalDocument)
    
    if current_user.role == "patient":
        query = query.filter(MedicalDocument.patient_id == current_user.id)
    elif current_user.role in ["doctor", "admin"]:
        if patient_id:
            query = query.filter(MedicalDocument.patient_id == patient_id)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Paramedic roles can only access Emergency Profiles."
        )

    docs = query.order_by(MedicalDocument.created_at.desc()).all()
    return [DocumentOut.model_validate(d) for d in docs]

@router.post("/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    patient_id: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_patient_id = current_user.id
    if current_user.role in ["doctor", "admin"] and patient_id:
        target_patient_id = patient_id

    # 1. Validate file format
    original_filename = file.filename or "uploaded_file"
    ext = os.path.splitext(original_filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Supported formats: PDF, PNG, JPG, JPEG"
        )

    # 2. Save uploaded file securely and validate size
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Failed to save file: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save uploaded file."
        )

    file_size = os.path.getsize(file_path)
    if file_size > MAX_FILE_SIZE:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size ({file_size} bytes) exceeds maximum limit of 20 MB."
        )

    doc_title = title or original_filename

    # Step 1: Create Document record in DB with status "processing"
    doc = MedicalDocument(
        patient_id=target_patient_id,
        title=doc_title,
        filename=original_filename,
        file_path=file_path,
        file_type=file.content_type or ("application/pdf" if ext == ".pdf" else "image/png"),
        file_size=file_size,
        status="processing",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Step 2: Real OCR Extraction using PaddleOCR & PyMuPDF (300 DPI)
    try:
        ocr_result = ocr_service.process_document(file_path)
        doc.ocr_text = ocr_result["ocr_text"]
        doc.status = "ocr_complete"
        db.commit()
        db.refresh(doc)
    except Exception as e:
        logger.error(f"OCR processing failed for doc {doc.id}: {e}")
        doc.status = "failed"
        doc.ocr_text = f"OCR Error: {str(e)}"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document OCR processing failed: {str(e)}"
        )

    # Step 3: Clinical AI / LLM Extraction
    try:
        parsed_json = extraction_service.extract_from_ocr(doc.ocr_text)
        if not isinstance(parsed_json, dict):
            if hasattr(parsed_json, "model_dump"):
                parsed_json = parsed_json.model_dump()
            elif hasattr(parsed_json, "dict"):
                parsed_json = parsed_json.dict()
            else:
                parsed_json = dict(parsed_json)
    except Exception as e:
        logger.warning(f"Clinical entity extraction failed for doc {doc.id}, falling back to empty entities: {e}")
        parsed_json = {
            "diagnoses": [],
            "medications": [],
            "allergies": [],
            "procedures": [],
            "lab_results": []
        }

    # Step 4: Persist extracted entities as unverified in PostgreSQL
    pages_data = ocr_result.get("pages", []) if isinstance(ocr_result, dict) else []
    created_entities = []

    # 1. Diagnoses: diagnoses[].name -> value, entity_type = diagnosis
    diagnoses_count = 0
    for item in parsed_json.get("diagnoses", []):
        if isinstance(item, dict):
            val = str(item.get("name") or "").strip()
            details = f"Date: {item.get('date')}" if item.get("date") else "Clinical diagnosis"
            conf = float(item.get("confidence", 0.96))
            dt = item.get("date") or None
        else:
            val = str(item).strip()
            details = "Clinical diagnosis"
            conf = 0.96
            dt = None

        if not val:
            continue

        page_num = _find_source_page(val, pages_data)
        entity = MedicalEntity(
            patient_id=target_patient_id,
            document_id=doc.id,
            type="diagnosis",
            value=val,
            details=details,
            confidence=conf,
            verified=False,
            source_page=page_num,
            date_recorded=dt,
        )
        db.add(entity)
        created_entities.append(entity)
        diagnoses_count += 1

    # 2. Medications: medications[].name -> value, entity_type = medication
    medications_count = 0
    for item in parsed_json.get("medications", []):
        if isinstance(item, dict):
            val = str(item.get("name") or "").strip()
            details_parts = []
            if item.get("dosage"):
                details_parts.append(f"Dosage: {item.get('dosage')}")
            if item.get("frequency"):
                details_parts.append(f"Frequency: {item.get('frequency')}")
            details = ", ".join(details_parts) if details_parts else "Prescription medication"
            conf = float(item.get("confidence", 0.95))
        else:
            val = str(item).strip()
            details = "Prescription medication"
            conf = 0.95

        if not val:
            continue

        page_num = _find_source_page(val, pages_data)
        entity = MedicalEntity(
            patient_id=target_patient_id,
            document_id=doc.id,
            type="medication",
            value=val,
            details=details,
            confidence=conf,
            verified=False,
            source_page=page_num,
            date_recorded=None,
        )
        db.add(entity)
        created_entities.append(entity)
        medications_count += 1

    # 3. Allergies: allergies[].name -> value, entity_type = allergy
    for item in parsed_json.get("allergies", []):
        if isinstance(item, dict):
            val = str(item.get("name") or "").strip()
            details = f"Severity: {item.get('severity')}" if item.get("severity") else "Reported allergy"
            conf = float(item.get("confidence", 0.98))
        else:
            val = str(item).strip()
            details = "Reported allergy"
            conf = 0.98

        if not val:
            continue

        page_num = _find_source_page(val, pages_data)
        entity = MedicalEntity(
            patient_id=target_patient_id,
            document_id=doc.id,
            type="allergy",
            value=val,
            details=details,
            confidence=conf,
            verified=False,
            source_page=page_num,
            date_recorded=None,
        )
        db.add(entity)
        created_entities.append(entity)

    # 4. Procedures: procedures[].name -> value, entity_type = procedure
    for item in parsed_json.get("procedures", []):
        if isinstance(item, dict):
            val = str(item.get("name") or "").strip()
            details = f"Date: {item.get('date')}" if item.get("date") else "Documented procedure"
            conf = float(item.get("confidence", 0.93))
            dt = item.get("date") or None
        else:
            val = str(item).strip()
            details = "Documented procedure"
            conf = 0.93
            dt = None

        if not val:
            continue

        page_num = _find_source_page(val, pages_data)
        entity = MedicalEntity(
            patient_id=target_patient_id,
            document_id=doc.id,
            type="procedure",
            value=val,
            details=details,
            confidence=conf,
            verified=False,
            source_page=page_num,
            date_recorded=dt,
        )
        db.add(entity)
        created_entities.append(entity)

    # 5. Lab Results: lab_results[].test -> value, entity_type = lab_result
    for item in parsed_json.get("lab_results", []):
        if isinstance(item, dict):
            # Mapping rule: lab_results[].test -> value
            val = str(item.get("test") or item.get("name") or "").strip()
            details_parts = []
            if item.get("value"):
                details_parts.append(f"Value: {item.get('value')}")
            if item.get("unit"):
                details_parts.append(f"Unit: {item.get('unit')}")
            if item.get("reference_range"):
                details_parts.append(f"Ref Range: {item.get('reference_range')}")
            details = ", ".join(details_parts) if details_parts else "Laboratory test result"
            conf = float(item.get("confidence", 0.94))
        else:
            val = str(item).strip()
            details = "Laboratory test result"
            conf = 0.94

        if not val:
            continue

        page_num = _find_source_page(val, pages_data)
        entity = MedicalEntity(
            patient_id=target_patient_id,
            document_id=doc.id,
            type="lab_result",
            value=val,
            details=details,
            confidence=conf,
            verified=False,
            source_page=page_num,
            date_recorded=None,
        )
        db.add(entity)
        created_entities.append(entity)

    # Commit transaction to PostgreSQL
    doc.status = "unverified"
    db.commit()
    db.refresh(doc)

    # Logging required by specification:
    # * number of diagnoses inserted
    # * number of medications inserted
    # * total entities committed
    total_committed = len(created_entities)
    logger.info(f"number of diagnoses inserted: {diagnoses_count}")
    logger.info(f"number of medications inserted: {medications_count}")
    logger.info(f"total entities committed: {total_committed}")
    print(f"number of diagnoses inserted: {diagnoses_count}", flush=True)
    print(f"number of medications inserted: {medications_count}", flush=True)
    print(f"total entities committed: {total_committed}", flush=True)

    # Audit log
    audit_service.log_action(
        db,
        action="DOCUMENT_UPLOAD",
        actor_id=current_user.id,
        actor_email=current_user.email,
        details=f"Uploaded document '{doc.title}' with {total_committed} extracted entities",
        ip_address=request.client.host if request.client else None,
    )

    # Return stored database records
    stored_entities = (
        db.query(MedicalEntity)
        .filter(MedicalEntity.document_id == doc.id)
        .order_by(MedicalEntity.created_at.asc())
        .all()
    )
    doc_out = DocumentOut.model_validate(doc)
    doc_out.entities = [EntityOut.model_validate(e) for e in stored_entities]
    return doc_out

@router.get("/{document_id}", response_model=DocumentOut)
def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(MedicalDocument).filter(MedicalDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    if current_user.role == "patient" and doc.patient_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # The API response for GET /documents/{id} must return database records, not in-memory state
    stored_entities = (
        db.query(MedicalEntity)
        .filter(MedicalEntity.document_id == document_id)
        .order_by(MedicalEntity.created_at.asc())
        .all()
    )
    doc_out = DocumentOut.model_validate(doc)
    doc_out.entities = [EntityOut.model_validate(e) for e in stored_entities]
    return doc_out

@router.get("/{document_id}/file")
def get_document_file(
    document_id: str,
    request: Request,
    token: Optional[str] = None,
    db: Session = Depends(get_db),
):
    auth_token = token
    auth_header = request.headers.get("Authorization")
    if not auth_token and auth_header and auth_header.startswith("Bearer "):
        auth_token = auth_header.replace("Bearer ", "").strip()
    if not auth_token:
        auth_token = request.cookies.get("medsync_token")

    user_id = None
    if auth_token:
        payload = decode_access_token(auth_token)
        if payload:
            user_id = payload.get("sub")

    doc = db.query(MedicalDocument).filter(MedicalDocument.id == document_id).first()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    if user_id:
        current_user = db.query(User).filter(User.id == user_id).first()
        if current_user and current_user.role == "patient" and doc.patient_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return FileResponse(doc.file_path, media_type=doc.file_type, filename=doc.filename)

@router.post("/{document_id}/verify", response_model=DocumentOut)
def verify_document(
    document_id: str,
    verify_in: DocumentVerifyRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(MedicalDocument).filter(MedicalDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    if current_user.role == "patient" and doc.patient_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Replace existing entities with human verified ones
    db.query(MedicalEntity).filter(MedicalEntity.document_id == doc.id).delete()

    created_verified_entities = []
    for item in verify_in.entities:
        entity = MedicalEntity(
            patient_id=doc.patient_id,
            document_id=doc.id,
            type=item.type,
            value=item.value,
            details=item.details,
            confidence=item.confidence or 1.0,
            verified=item.verified,
            source_page=item.source_page or 1,
            date_recorded=item.date_recorded or doc.created_at.strftime("%Y-%m-%d"),
        )
        db.add(entity)
        created_verified_entities.append(entity)

    # Save changes so entities get IDs
    db.commit()

    # Generate timeline events only for verified entities
    timeline_service.generate_timeline_events(
        db,
        patient_id=doc.patient_id,
        document_id=doc.id,
        verified_entities=created_verified_entities
    )

    doc.status = "verified"
    db.commit()
    db.refresh(doc)

    # Audit log
    audit_service.log_action(
        db,
        action="DOCUMENT_VERIFIED",
        actor_id=current_user.id,
        actor_email=current_user.email,
        details=f"Verified {len(created_verified_entities)} entities for document '{doc.title}'",
        ip_address=request.client.host if request.client else None,
    )

    return DocumentOut.model_validate(doc)
    
@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(MedicalDocument).filter(MedicalDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    if current_user.role == "patient" and doc.patient_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    elif current_user.role == "paramedic":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Paramedic roles cannot delete documents")

    # 1. Delete associated timeline events generated from this document
    db.query(TimelineEvent).filter(TimelineEvent.source_id == doc.id).delete()

    # 2. Delete associated medical entities
    db.query(MedicalEntity).filter(MedicalEntity.document_id == doc.id).delete()

    # 3. Remove physical file from disk if it exists
    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception as e:
            logger.warning(f"Could not remove file on disk {doc.file_path}: {e}")

    # 4. Audit log
    audit_service.log_action(
        db,
        action="DOCUMENT_DELETED",
        actor_id=current_user.id,
        actor_email=current_user.email,
        details=f"Deleted document '{doc.title}' (ID: {doc.id})",
        ip_address=request.client.host if request.client else None,
    )

    # 5. Delete document record from database
    doc_title = doc.title
    db.delete(doc)
    db.commit()

    return {"success": True, "message": f"Document '{doc_title}' deleted successfully"}

