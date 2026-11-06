from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict, computed_field

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "patient"  # patient, doctor, paramedic, admin

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    role: str
    created_at: Optional[datetime] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# Emergency Profile Schemas
class EmergencyContact(BaseModel):
    name: str
    phone: str
    relation: str

class EmergencyProfileUpdate(BaseModel):
    blood_group: Optional[str] = None
    dob: Optional[str] = None
    phone: Optional[str] = None
    emergency_contacts: Optional[List[dict]] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    notes: Optional[str] = None

class EmergencyProfileOut(BaseModel):
    user_id: str
    full_name: str
    email: str
    blood_group: str
    dob: Optional[str] = None
    phone: Optional[str] = None
    emergency_contacts: List[dict] = []
    allergies: List[str] = []
    chronic_conditions: List[str] = []
    notes: Optional[str] = None
    updated_at: Optional[datetime] = None

class SOSCreate(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    notes: Optional[str] = None

class EmergencyEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    patient_id: str
    patient_name: Optional[str] = None
    patient_blood_group: Optional[str] = None
    patient_phone: Optional[str] = None
    status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    notes: Optional[str] = None
    triggered_at: datetime
    resolved_at: Optional[datetime] = None

# Medical Document & Entity Schemas
class EntityBase(BaseModel):
    type: str  # diagnosis, medication, allergy, procedure, lab_result, doctor_note
    value: str
    details: Optional[str] = None
    confidence: float = 1.0
    verified: bool = False
    source_page: Optional[int] = 1
    date_recorded: Optional[str] = None

    @computed_field
    @property
    def entity_type(self) -> str:
        return self.type

class EntityCreate(EntityBase):
    pass

class EntityUpdate(BaseModel):
    id: Optional[str] = None
    type: str
    value: str
    details: Optional[str] = None
    confidence: Optional[float] = 1.0
    verified: bool = True
    source_page: Optional[int] = 1
    date_recorded: Optional[str] = None

class EntityOut(EntityBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    patient_id: str
    document_id: Optional[str] = None
    created_at: Optional[datetime] = None

class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    patient_id: str
    title: str
    filename: str
    file_type: str
    file_size: int
    status: str
    ocr_text: Optional[str] = None
    entities: List[EntityOut] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @computed_field
    @property
    def documentId(self) -> str:
        return self.id

class DocumentVerifyRequest(BaseModel):
    entities: List[EntityUpdate]

# Timeline Schemas
class TimelineItemOut(BaseModel):
    id: str
    type: str  # diagnosis, medication, allergy, procedure, doctor_note
    value: str
    details: Optional[str] = None
    confidence: float
    verified: bool
    date_recorded: Optional[str] = None
    created_at: Optional[datetime] = None
    source_document_id: Optional[str] = None
    source_document_title: Optional[str] = None

# Doctor Schemas
class PatientSummaryOut(BaseModel):
    patient_id: str
    full_name: str
    email: str
    blood_group: str
    phone: Optional[str] = None
    dob: Optional[str] = None
    total_documents: int
    total_records: int
    allergies: List[str] = []
    chronic_conditions: List[str] = []

class DoctorEventCreate(BaseModel):
    patient_id: str
    type: str = "doctor_note"  # doctor_note, diagnosis, medication, procedure
    value: str
    details: Optional[str] = None
    date_recorded: Optional[str] = None

# Audit Schemas
class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    actor_id: Optional[str] = None
    actor_email: str
    action: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime
