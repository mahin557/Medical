import type { PatientData } from '../types/medical'

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? ''
const MODEL = 'llama-3.3-70b-versatile'

const SYSTEM_PROMPT = `You are an expert clinical decision support system assisting board-certified physicians. Deep expertise across internal medicine, emergency medicine, surgery, pediatrics, neurology, and all specialties.

ALWAYS:
- Flag true emergencies prominently
- Include must-not-miss diagnoses even when less likely
- Apply pertinent positives AND negatives
- Consider medication effects and interactions
- Note atypical presentations (elderly, immunocompromised, female, pediatric)
- Use physician-level medical terminology
- Generate 10-15 differential diagnoses

Return ONLY valid JSON — no markdown, no text outside the JSON object.`

function buildPrompt(patient: PatientData): string {
  const parts: string[] = []

  parts.push(`PATIENT: ${patient.age}yo ${patient.sex}
CC: "${patient.chief_complaint}"`)

  if (patient.symptoms.length > 0) {
    parts.push('\nSYMPTOMS:')
    patient.symptoms.forEach((s, i) => {
      let txt = `${i + 1}. ${s.name.toUpperCase()}`
      if (s.severity)            txt += ` | Severity: ${s.severity}/10`
      if (s.onset)               txt += ` | Onset: ${s.onset}`
      if (s.duration)            txt += ` | Duration: ${s.duration}`
      if (s.character)           txt += ` | Character: ${s.character}`
      if (s.location)            txt += ` | Location: ${s.location}`
      if (s.radiation)           txt += ` | Radiation: ${s.radiation}`
      if (s.timing)              txt += ` | Timing: ${s.timing}`
      if (s.aggravating_factors) txt += ` | Aggravating: ${s.aggravating_factors}`
      if (s.relieving_factors)   txt += ` | Relieving: ${s.relieving_factors}`
      if (s.associated_symptoms) txt += ` | Associated: ${s.associated_symptoms}`
      parts.push(txt)
    })
  }

  const ros = patient.review_of_systems
  const rosPositives: string[] = []
  const rosSystems: [string, string[]][] = [
    ['Constitutional', ros.constitutional], ['CV', ros.cardiovascular],
    ['Resp', ros.respiratory], ['GI', ros.gastrointestinal],
    ['Neuro', ros.neurological], ['MSK', ros.musculoskeletal],
    ['Skin', ros.skin], ['Psych', ros.psychiatric],
    ['Endocrine', ros.endocrine], ['GU', ros.genitourinary],
  ]
  rosSystems.forEach(([sys, syms]) => {
    if (syms.length) rosPositives.push(`${sys}: ${syms.join(', ')}`)
  })
  if (rosPositives.length) parts.push(`\nROS (+):\n${rosPositives.join('\n')}`)
  if (ros.pertinent_negatives.length) {
    parts.push(`PERTINENT NEGATIVES: ${ros.pertinent_negatives.join(', ')}`)
  }

  if (patient.past_medical_history.length) parts.push(`\nPMH: ${patient.past_medical_history.join(', ')}`)
  if (patient.medications.length)          parts.push(`MEDS: ${patient.medications.join(', ')}`)
  if (patient.allergies.length)            parts.push(`ALLERGIES: ${patient.allergies.join(', ')}`)
  if (patient.family_history.length)       parts.push(`FHx: ${patient.family_history.join(', ')}`)
  if (patient.social_history)              parts.push(`SHx: ${patient.social_history}`)

  const v = patient.vitals
  const vitalParts: string[] = []
  if (v.temperature_f && v.temperature_f !== '')    vitalParts.push(`T:${v.temperature_f}°F`)
  if (v.heart_rate && v.heart_rate !== '')          vitalParts.push(`HR:${v.heart_rate}`)
  if (v.respiratory_rate && v.respiratory_rate !== '') vitalParts.push(`RR:${v.respiratory_rate}`)
  if (v.bp_systolic && v.bp_diastolic && v.bp_systolic !== '' && v.bp_diastolic !== '') {
    vitalParts.push(`BP:${v.bp_systolic}/${v.bp_diastolic}`)
  }
  if (v.o2_saturation && v.o2_saturation !== '')    vitalParts.push(`SpO2:${v.o2_saturation}%`)
  if (vitalParts.length) parts.push(`\nVITALS: ${vitalParts.join(' | ')}`)

  const pe = patient.physical_exam
  const examParts: string[] = []
  if (pe.general)        examParts.push(`General: ${pe.general}`)
  if (pe.cardiovascular) examParts.push(`CV: ${pe.cardiovascular}`)
  if (pe.respiratory)    examParts.push(`Resp: ${pe.respiratory}`)
  if (pe.abdomen)        examParts.push(`Abd: ${pe.abdomen}`)
  if (pe.neurological)   examParts.push(`Neuro: ${pe.neurological}`)
  if (pe.skin)           examParts.push(`Skin: ${pe.skin}`)
  if (examParts.length)  parts.push(`\nEXAM:\n${examParts.join('\n')}`)

  if (patient.lab_results)    parts.push(`\nLABS:\n${patient.lab_results}`)
  if (patient.imaging_results) parts.push(`IMAGING:\n${patient.imaging_results}`)

  parts.push(`
Return ONLY this JSON:
{
  "red_flags": ["alarming features"],
  "emergency_level": "EMERGENCY|URGENT|ROUTINE",
  "differential_diagnosis": [
    {
      "rank": 1,
      "name": "Diagnosis",
      "icd10_code": "X00.0",
      "probability": "High|Moderate|Low",
      "confidence_percent": 80,
      "supporting_evidence": ["evidence"],
      "against_evidence": ["against"],
      "must_rule_out": false,
      "emergency": false
    }
  ],
  "most_likely_diagnosis": "Top diagnosis",
  "workup": {
    "immediate": ["urgent if emergency"],
    "labs": ["specific labs"],
    "imaging": ["specific imaging"],
    "other_tests": ["EKG etc"],
    "referrals": ["specialty consults"]
  },
  "treatment_considerations": ["step 1"],
  "soap_note": "S:\\n...\\nO:\\n...\\nA:\\n...\\nP:\\n...",
  "clinical_pearls": ["teaching point"],
  "drug_interactions": ["medication concern"],
  "disclaimer": "This tool aids clinical decision-making and does not replace physician judgment."
}`)

  return parts.join('\n')
}

export async function getDiagnosis(patient: PatientData) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ API key not set. Add EXPO_PUBLIC_GROQ_API_KEY to .env file.')
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: buildPrompt(patient) },
      ],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `Groq API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.choices[0].message.content

  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('AI returned invalid response. Try again.')
  }
}
