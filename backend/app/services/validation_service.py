import json
from typing import List, Optional, Union, Dict, Any
from pydantic import BaseModel, Field, ValidationError

class DiagnosisItem(BaseModel):
    name: str = Field(..., min_length=1, description="Name of diagnosis or condition")
    date: Optional[str] = Field(default="", description="Date of diagnosis if mentioned")

class MedicationItem(BaseModel):
    name: str = Field(..., min_length=1, description="Medication or drug name")
    dosage: Optional[str] = Field(default="", description="Dosage (e.g. 500mg, 10ml)")
    frequency: Optional[str] = Field(default="", description="Frequency (e.g. daily, BID, TID)")

class AllergyItem(BaseModel):
    name: str = Field(..., min_length=1, description="Allergen name (e.g. Penicillin)")
    severity: Optional[str] = Field(default="", description="Severity (e.g. severe, anaphylaxis, mild rash)")

class ProcedureItem(BaseModel):
    name: str = Field(..., min_length=1, description="Procedure or surgical operation name")
    date: Optional[str] = Field(default="", description="Date of procedure if mentioned")

class LabResultItem(BaseModel):
    test: str = Field(..., min_length=1, description="Laboratory test name (e.g. HbA1c, WBC)")
    value: str = Field(..., min_length=1, description="Numerical or categorical test value")
    unit: Optional[str] = Field(default="", description="Unit of measurement (e.g. %, mg/dL)")
    reference_range: Optional[str] = Field(default="", description="Biological reference interval if mentioned")

class ExtractedMedicalData(BaseModel):
    diagnoses: List[DiagnosisItem] = Field(default_factory=list)
    medications: List[MedicationItem] = Field(default_factory=list)
    allergies: List[AllergyItem] = Field(default_factory=list)
    procedures: List[ProcedureItem] = Field(default_factory=list)
    lab_results: List[LabResultItem] = Field(default_factory=list)

class ValidationService:
    @staticmethod
    def validate_extraction(raw_data: Union[str, Dict[str, Any]]) -> ExtractedMedicalData:
        """
        Validates raw JSON string or dictionary against the ExtractedMedicalData Pydantic schema.
        Raises ValueError or ValidationError if invalid JSON, missing required keys, or incorrect types.
        """
        if isinstance(raw_data, str):
            try:
                parsed = json.loads(raw_data)
            except json.JSONDecodeError as e:
                raise ValueError(f"Invalid JSON string: {e}")
        elif isinstance(raw_data, dict):
            parsed = raw_data
        else:
            raise ValueError(f"Expected dict or JSON string, received {type(raw_data)}")

        # Verify required root keys exist
        required_keys = ["diagnoses", "medications", "allergies", "procedures", "lab_results"]
        missing_keys = [k for k in required_keys if k not in parsed]
        if missing_keys:
            raise ValueError(f"Missing required extraction keys: {missing_keys}")

        # Pydantic validation ensures strict typing
        try:
            return ExtractedMedicalData.model_validate(parsed)
        except ValidationError as e:
            raise ValueError(f"Extraction schema validation failed: {e}")

validation_service = ValidationService()
