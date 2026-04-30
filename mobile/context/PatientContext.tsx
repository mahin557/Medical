import React, { createContext, useContext, useState } from 'react'
import type { PatientData, DiagnosisResult } from '../types/medical'

function emptyPatient(): PatientData {
  return {
    age: '', sex: 'Male', chief_complaint: '',
    symptoms: [],
    review_of_systems: {
      constitutional: [], heent: [], cardiovascular: [], respiratory: [],
      gastrointestinal: [], genitourinary: [], musculoskeletal: [], skin: [],
      neurological: [], psychiatric: [], endocrine: [], hematologic: [],
      allergic: [], pertinent_negatives: [],
    },
    past_medical_history: [], surgical_history: [], medications: [],
    allergies: [], family_history: [], social_history: '',
    vitals: {
      temperature_f: '', heart_rate: '', respiratory_rate: '',
      bp_systolic: '', bp_diastolic: '', o2_saturation: '',
      weight_kg: '', height_cm: '', gcs: '', pain_scale: '',
    },
    physical_exam: {
      general: '', heent: '', neck: '', cardiovascular: '', respiratory: '',
      abdomen: '', musculoskeletal: '', neurological: '', skin: '',
      lymph_nodes: '', genitourinary: '', psychiatric: '',
    },
    lab_results: '', imaging_results: '', additional_context: '',
  }
}

interface Ctx {
  patient: PatientData
  setPatient: React.Dispatch<React.SetStateAction<PatientData>>
  result: DiagnosisResult | null
  setResult: (r: DiagnosisResult | null) => void
  resetAll: () => void
}

const PatientCtx = createContext<Ctx>(null as unknown as Ctx)

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatient] = useState<PatientData>(emptyPatient)
  const [result, setResult] = useState<DiagnosisResult | null>(null)

  function resetAll() {
    setPatient(emptyPatient())
    setResult(null)
  }

  return (
    <PatientCtx.Provider value={{ patient, setPatient, result, setResult, resetAll }}>
      {children}
    </PatientCtx.Provider>
  )
}

export const usePatient = () => useContext(PatientCtx)
