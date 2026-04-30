from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class Sex(str, Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other / Not specified"


class SymptomAttribute(BaseModel):
    name: str
    onset: Optional[str] = None
    duration: Optional[str] = None
    severity: Optional[int] = Field(None, ge=1, le=10)
    character: Optional[str] = None
    location: Optional[str] = None
    radiation: Optional[str] = None
    timing: Optional[str] = None
    aggravating_factors: Optional[str] = None
    relieving_factors: Optional[str] = None
    associated_symptoms: Optional[str] = None


class Vitals(BaseModel):
    temperature_f: Optional[float] = None
    heart_rate: Optional[int] = None
    respiratory_rate: Optional[int] = None
    bp_systolic: Optional[int] = None
    bp_diastolic: Optional[int] = None
    o2_saturation: Optional[float] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    gcs: Optional[int] = None
    pain_scale: Optional[int] = None


class PhysicalExam(BaseModel):
    general: Optional[str] = None
    heent: Optional[str] = None
    neck: Optional[str] = None
    cardiovascular: Optional[str] = None
    respiratory: Optional[str] = None
    abdomen: Optional[str] = None
    musculoskeletal: Optional[str] = None
    neurological: Optional[str] = None
    skin: Optional[str] = None
    lymph_nodes: Optional[str] = None
    genitourinary: Optional[str] = None
    psychiatric: Optional[str] = None


class ReviewOfSystems(BaseModel):
    constitutional: List[str] = []
    heent: List[str] = []
    cardiovascular: List[str] = []
    respiratory: List[str] = []
    gastrointestinal: List[str] = []
    genitourinary: List[str] = []
    musculoskeletal: List[str] = []
    skin: List[str] = []
    neurological: List[str] = []
    psychiatric: List[str] = []
    endocrine: List[str] = []
    hematologic: List[str] = []
    allergic: List[str] = []
    pertinent_negatives: List[str] = []


class PatientData(BaseModel):
    age: int = Field(ge=0, le=120)
    sex: Sex
    chief_complaint: str
    symptoms: List[SymptomAttribute] = []
    review_of_systems: Optional[ReviewOfSystems] = None
    past_medical_history: List[str] = []
    surgical_history: List[str] = []
    medications: List[str] = []
    allergies: List[str] = []
    family_history: List[str] = []
    social_history: Optional[str] = None
    vitals: Optional[Vitals] = None
    physical_exam: Optional[PhysicalExam] = None
    lab_results: Optional[str] = None
    imaging_results: Optional[str] = None
    additional_context: Optional[str] = None


class DiagnosisRequest(BaseModel):
    patient: PatientData
