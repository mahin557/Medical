import type { PatientData, DiagnosisResult } from '../types/medical'

export async function getDiagnosis(patient: PatientData): Promise<DiagnosisResult> {
  const payload = {
    patient: {
      ...patient,
      age: Number(patient.age),
      vitals: patient.vitals ? {
        temperature_f:    patient.vitals.temperature_f    !== '' ? Number(patient.vitals.temperature_f)    : undefined,
        heart_rate:       patient.vitals.heart_rate       !== '' ? Number(patient.vitals.heart_rate)       : undefined,
        respiratory_rate: patient.vitals.respiratory_rate !== '' ? Number(patient.vitals.respiratory_rate) : undefined,
        bp_systolic:      patient.vitals.bp_systolic      !== '' ? Number(patient.vitals.bp_systolic)      : undefined,
        bp_diastolic:     patient.vitals.bp_diastolic     !== '' ? Number(patient.vitals.bp_diastolic)     : undefined,
        o2_saturation:    patient.vitals.o2_saturation    !== '' ? Number(patient.vitals.o2_saturation)    : undefined,
        weight_kg:        patient.vitals.weight_kg        !== '' ? Number(patient.vitals.weight_kg)        : undefined,
        height_cm:        patient.vitals.height_cm        !== '' ? Number(patient.vitals.height_cm)        : undefined,
        gcs:              patient.vitals.gcs              !== '' ? Number(patient.vitals.gcs)              : undefined,
        pain_scale:       patient.vitals.pain_scale       !== '' ? Number(patient.vitals.pain_scale)       : undefined,
      } : undefined,
      symptoms: patient.symptoms.map(({ id: _id, ...s }) => ({
        ...s,
        severity: s.severity !== undefined ? Number(s.severity) : undefined,
      })),
    },
  }

  const res = await fetch('/api/diagnose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Diagnosis request failed')
  }

  return res.json()
}
