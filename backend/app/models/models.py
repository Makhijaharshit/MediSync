import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Float, Boolean, Integer
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="patient")  # patient, doctor, paramedic, admin
    created_at = Column(DateTime(timezone=True), default=utc_now)

    patient_profile = relationship("Patient", back_populates="user", uselist=False, cascade="all, delete-orphan")
    documents = relationship("MedicalDocument", back_populates="patient", cascade="all, delete-orphan")
    entities = relationship("MedicalEntity", back_populates="patient", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="patient", cascade="all, delete-orphan")
    emergency_events = relationship("EmergencyEvent", back_populates="patient", cascade="all, delete-orphan")
    emergency_profile = relationship("EmergencyProfile", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    emergency_contacts = relationship("EmergencyContact", back_populates="patient", cascade="all, delete-orphan")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    blood_group = Column(String(10), default="Unknown")
    dob = Column(String(50), nullable=True)
    phone = Column(String(50), nullable=True)
    emergency_contacts = Column(Text, default="[]")  # JSON string of contacts
    allergies = Column(Text, default="[]")           # JSON string of allergies
    chronic_conditions = Column(Text, default="[]")  # JSON string of conditions
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="patient_profile")

# Backward compatibility alias
PatientProfile = Patient


class MedicalDocument(Base):
    __tablename__ = "medical_documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(100), default="application/pdf")
    file_size = Column(Integer, default=0)
    ocr_text = Column(Text, default="")
    status = Column(String(50), default="pending")  # pending, processing, unverified, verified
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    patient = relationship("User", back_populates="documents")
    entities = relationship("MedicalEntity", back_populates="document", cascade="all, delete-orphan")


class MedicalEntity(Base):
    __tablename__ = "medical_entities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(String(36), ForeignKey("medical_documents.id", ondelete="CASCADE"), nullable=True)
    type = Column(String(50), nullable=False)  # diagnosis, medication, allergy, procedure, doctor_note
    value = Column(String(500), nullable=False)
    details = Column(Text, nullable=True)
    confidence = Column(Float, default=1.0)
    verified = Column(Boolean, default=False)
    source_page = Column(Integer, default=1)
    date_recorded = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    @property
    def entity_type(self) -> str:
        return self.type

    @entity_type.setter
    def entity_type(self, val: str):
        self.type = val

    patient = relationship("User", back_populates="entities")
    document = relationship("MedicalDocument", back_populates="entities")


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    event_date = Column(String(50), nullable=True)
    source_id = Column(String(36), nullable=True)
    verified = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    patient = relationship("User", back_populates="timeline_events")


class EmergencyProfile(Base):
    __tablename__ = "emergency_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    blood_group = Column(String(10), default="Unknown")
    allergies = Column(Text, default="[]")
    chronic_conditions = Column(Text, default="[]")
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    patient = relationship("User", back_populates="emergency_profile")


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    relation = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    patient = relationship("User", back_populates="emergency_contacts")


class EmergencyEvent(Base):
    __tablename__ = "emergency_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="active")  # active, resolved, cancelled
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    triggered_at = Column(DateTime(timezone=True), default=utc_now)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    patient = relationship("User", back_populates="emergency_events")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    actor_id = Column(String(36), nullable=True)
    actor_email = Column(String(255), default="system")
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(100), nullable=True)
    timestamp = Column(DateTime(timezone=True), default=utc_now)
