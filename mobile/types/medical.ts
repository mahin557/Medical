export type Sex = 'Male' | 'Female' | 'Other / Not specified'

export interface SymptomAttribute {
  id: string
  name: string
  onset?: string
  duration?: string
  severity?: number
  character?: string
  location?: string
  radiation?: string
  timing?: string
  aggravating_factors?: string
  relieving_factors?: string
  associated_symptoms?: string
}

export interface Vitals {
  temperature_f?: number | ''
  heart_rate?: number | ''
  respiratory_rate?: number | ''
  bp_systolic?: number | ''
  bp_diastolic?: number | ''
  o2_saturation?: number | ''
  weight_kg?: number | ''
  height_cm?: number | ''
  gcs?: number | ''
  pain_scale?: number | ''
}

export interface PhysicalExam {
  general?: string
  heent?: string
  neck?: string
  cardiovascular?: string
  respiratory?: string
  abdomen?: string
  musculoskeletal?: string
  neurological?: string
  skin?: string
  lymph_nodes?: string
  genitourinary?: string
  psychiatric?: string
}

export interface ReviewOfSystems {
  constitutional: string[]
  heent: string[]
  cardiovascular: string[]
  respiratory: string[]
  gastrointestinal: string[]
  genitourinary: string[]
  musculoskeletal: string[]
  skin: string[]
  neurological: string[]
  psychiatric: string[]
  endocrine: string[]
  hematologic: string[]
  allergic: string[]
  pertinent_negatives: string[]
}

export interface PatientData {
  age: number | ''
  sex: Sex
  chief_complaint: string
  symptoms: SymptomAttribute[]
  review_of_systems: ReviewOfSystems
  past_medical_history: string[]
  surgical_history: string[]
  medications: string[]
  allergies: string[]
  family_history: string[]
  social_history: string
  vitals: Vitals
  physical_exam: PhysicalExam
  lab_results: string
  imaging_results: string
  additional_context: string
}

// Diagnosis output types
export interface DiagnosisEntry {
  rank: number
  name: string
  icd10_code?: string
  probability: 'High' | 'Moderate' | 'Low'
  confidence_percent?: number
  supporting_evidence: string[]
  against_evidence: string[]
  must_rule_out: boolean
  emergency: boolean
}

export interface Workup {
  immediate: string[]
  labs: string[]
  imaging: string[]
  other_tests: string[]
  referrals: string[]
}

export interface DiagnosisResult {
  red_flags: string[]
  emergency_level: 'EMERGENCY' | 'URGENT' | 'ROUTINE'
  differential_diagnosis: DiagnosisEntry[]
  most_likely_diagnosis: string
  workup: Workup
  treatment_considerations: string[]
  soap_note: string
  clinical_pearls: string[]
  drug_interactions: string[]
  disclaimer: string
}
