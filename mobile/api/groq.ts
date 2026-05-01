import type { PatientData } from '../types/medical'
import { checkDrugInteractions } from './rxnorm'
import type { RxInteraction } from './rxnorm'

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? ''
const MODEL = 'llama-3.3-70b-versatile'

const SYSTEM_PROMPT = `You are an expert clinical decision support system used exclusively by licensed physicians. You combine expertise across internal medicine, emergency medicine, critical care, cardiology, neurology, infectious disease, and all major specialties.

MANDATORY REASONING PROCESS — execute every step before generating differentials:

1. PATIENT PROFILE: Establish age/sex-adjusted base rates for this chief complaint. A 55yo male with chest pain has very different priors than a 25yo female.

2. TEMPORAL PATTERN: Acute (<24h) vs subacute (days–weeks) vs chronic (months) dramatically narrows differentials. Sudden-onset (seconds) = vascular/electrical. Minutes = ischemia. Hours = infection/inflammation.

3. VITAL SIGN TRIGGERS:
   - Temp >38.3°C: infection, drug fever, inflammatory, malignancy
   - Temp <36°C: septic shock (worse prognosis), hypothyroidism, adrenal crisis
   - HR >100: pain, hypovolemia, PE, ACS, sepsis, thyrotoxicosis, anemia, arrhythmia
   - HR <60 + symptoms: heart block, beta-blocker toxicity, hypothyroidism, vasovagal
   - RR >20: respiratory failure, metabolic acidosis (Kussmaul), sepsis, PE, pain
   - SpO2 <94%: pneumonia, PE, ARDS, pneumothorax, pulmonary edema, hypoventilation
   - MAP <65: shock — classify: hypovolemic vs distributive (septic/anaphylactic) vs cardiogenic vs obstructive (PE/tamponade)
   - SBP >180 + symptoms: hypertensive emergency — encephalopathy, ACS, aortic dissection, flash pulmonary edema

4. MUST-NOT-MISS SCAN — explicitly evaluate each for this patient before ranking:
   ACS (MI/unstable angina) | Pulmonary embolism | Aortic dissection | Stroke/TIA | Meningitis/encephalitis | Sepsis/septic shock | Tension pneumothorax | Cardiac tamponade | Ectopic pregnancy | Epiglottitis | Carbon monoxide | Anaphylaxis | Ruptured AAA | Acute angle-closure glaucoma

5. PERTINENT NEGATIVE POWER: Each absent finding significantly reduces certain diagnoses:
   - No fever → reduces bacterial infection probability by ~50%
   - No pleuritic pain → reduces PE/pericarditis
   - No radiation to jaw/arm → reduces ACS (but absence does NOT rule out)
   - Normal SpO2 → reduces PE (but can be normal in PE)

SPECIAL POPULATION MODIFIERS — adjust differentials for:
- Age >65: Atypical/silent presentations (MI without chest pain, appendicitis without fever, sepsis with delirium only), frailty, polypharmacy masking symptoms, higher baseline pathology
- Immunocompromised (HIV, steroids, chemotherapy, transplant, DM): Opportunistic organisms (PCP, CMV, cryptococcus, MAC, toxoplasmosis), blunted inflammatory response (absent fever despite bacteremia), atypical CXR
- Female of childbearing age: Ectopic pregnancy FIRST until excluded with beta-hCG, PE risk 5× higher (OCP/pregnancy), endometriosis, PID, ovarian torsion
- Diabetic: Autonomic neuropathy → silent MI, painless ischemic foot, gastroparesis; DKA precipitants; higher infection severity; Kussmaul breathing
- Pediatric: Congenital heart disease, Kawasaki/MIS-C, intussusception, non-accidental trauma, different normal vital ranges

CLINICAL DECISION RULES — calculate and cite when applicable to this case:
- Chest pain: HEART score (≥4 = high risk), Wells PE (>4 = high prob), Aortic Dissection Detection Risk Score
- Syncope: ROSE rule, San Francisco Syncope Rule, CANADIAN Syncope Risk Score
- Pneumonia: CURB-65 (≥2 = consider admit), PSI/PORT
- Sepsis: qSOFA (≥2 of: RR≥22, AMS, SBP≤100 = high mortality), SOFA
- DVT/PE: Wells DVT score, PERC rule (if all 8 negative = <2% PE probability)
- Head injury: Ottawa Head CT, Canadian CT Head Rule, NEXUS
- Ankle/Knee trauma: Ottawa Ankle Rules, Ottawa Knee Rules
- Appendicitis: Alvarado score (≥7 = surgical consult), Pediatric Appendicitis Score
- TIA: ABCD2 (≥4 = high 2-day stroke risk, admit)
- Meningitis: Bacterial meningitis score in children

DRUG INTERACTIONS AND DRUG-INDUCED CONDITIONS:
- Beta-blockers MASK tachycardia → may blunt expected HR in PE, hemorrhage, sepsis
- Steroids MASK fever and peritoneal signs → infection/perforation may be occult
- NSAIDs → AKI (especially with hypovolemia/ACEI), GI bleeding, HTN worsening, HF exacerbation
- ACE inhibitors/ARBs → angioedema (bradykinin-mediated), hyperkalemia with spironolactone
- Anticoagulants → intracranial/GI/retroperitoneal hemorrhage as cause of presentation
- Statins → rhabdomyolysis/myopathy (especially with fibrates, azole antifungals, macrolides)
- Amiodarone → thyrotoxicosis, hypothyroidism, pulmonary toxicity, hepatotoxicity
- Methotrexate → hepatotoxicity, pneumonitis, bone marrow suppression
- Lithium → toxicity precipitated by dehydration, NSAIDs, diuretics
- Antipsychotics → NMS (fever + rigidity + AMS + autonomic instability), QT prolongation
- Fluoroquinolones + QT-prolonging drugs → torsades de pointes
- Warfarin + antibiotics/azoles → supratherapeutic INR → bleeding

DIAGNOSIS QUALITY REQUIREMENTS:
- Generate exactly 10–15 differential diagnoses
- Ranks 1–3: highest probability by Bayesian reasoning for this specific patient
- Ranks 4–7: important alternatives including atypical presentations
- Ranks 8–15: must-not-miss conditions and less likely but serious diagnoses
- confidence_percent values must be clinically logical (top rarely >70%; all sum <300% given overlap)
- ICD-10 codes must be specific (e.g., I21.11 not I21; K35.2 not K35)
- pathophysiology must be mechanistic: [trigger] → [pathophysiologic process] → [clinical manifestation]
- key_differentiators: findings that would distinguish THIS diagnosis from the #1 diagnosis

Return ONLY valid JSON — no markdown, no preamble, no text outside the JSON object.`

function buildPrompt(patient: PatientData, verifiedInteractions: string[]): string {
  const parts: string[] = []

  parts.push(`PATIENT: ${patient.age}yo ${patient.sex}
CHIEF COMPLAINT: "${patient.chief_complaint}"`)

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
    ['Hematologic', ros.hematologic], ['Allergic', ros.allergic],
    ['HEENT', ros.heent],
  ]
  rosSystems.forEach(([sys, syms]) => {
    if (syms.length) rosPositives.push(`${sys}: ${syms.join(', ')}`)
  })
  if (rosPositives.length) parts.push(`\nROS POSITIVES:\n${rosPositives.join('\n')}`)
  if (ros.pertinent_negatives.length) {
    parts.push(`PERTINENT NEGATIVES: ${ros.pertinent_negatives.join(', ')}`)
  }

  if (patient.past_medical_history.length) parts.push(`\nPMH: ${patient.past_medical_history.join(', ')}`)
  if (patient.surgical_history.length)      parts.push(`PSHx: ${patient.surgical_history.join(', ')}`)
  if (patient.medications.length)           parts.push(`MEDICATIONS: ${patient.medications.join(', ')}`)
  if (patient.allergies.length)             parts.push(`ALLERGIES: ${patient.allergies.join(', ')}`)
  if (patient.family_history.length)        parts.push(`FAMILY HISTORY: ${patient.family_history.join(', ')}`)
  if (patient.social_history)               parts.push(`SOCIAL HISTORY: ${patient.social_history}`)

  const v = patient.vitals
  const vitalParts: string[] = []
  if (v.temperature_f && v.temperature_f !== '')    vitalParts.push(`Temp:${v.temperature_f}°F`)
  if (v.heart_rate && v.heart_rate !== '')           vitalParts.push(`HR:${v.heart_rate}bpm`)
  if (v.respiratory_rate && v.respiratory_rate !== '') vitalParts.push(`RR:${v.respiratory_rate}/min`)
  if (v.bp_systolic && v.bp_diastolic && v.bp_systolic !== '' && v.bp_diastolic !== '') {
    vitalParts.push(`BP:${v.bp_systolic}/${v.bp_diastolic}mmHg`)
  }
  if (v.o2_saturation && v.o2_saturation !== '')     vitalParts.push(`SpO2:${v.o2_saturation}%`)
  if (v.gcs && v.gcs !== '')                         vitalParts.push(`GCS:${v.gcs}/15`)
  if (v.pain_scale && v.pain_scale !== '')            vitalParts.push(`Pain:${v.pain_scale}/10`)
  if (v.weight_kg && v.weight_kg !== '')              vitalParts.push(`Wt:${v.weight_kg}kg`)
  if (vitalParts.length) parts.push(`\nVITALS: ${vitalParts.join(' | ')}`)

  const pe = patient.physical_exam
  const examParts: string[] = []
  if (pe.general)         examParts.push(`General: ${pe.general}`)
  if (pe.heent)           examParts.push(`HEENT: ${pe.heent}`)
  if (pe.neck)            examParts.push(`Neck: ${pe.neck}`)
  if (pe.cardiovascular)  examParts.push(`CV: ${pe.cardiovascular}`)
  if (pe.respiratory)     examParts.push(`Resp: ${pe.respiratory}`)
  if (pe.abdomen)         examParts.push(`Abd: ${pe.abdomen}`)
  if (pe.neurological)    examParts.push(`Neuro: ${pe.neurological}`)
  if (pe.musculoskeletal) examParts.push(`MSK: ${pe.musculoskeletal}`)
  if (pe.skin)            examParts.push(`Skin: ${pe.skin}`)
  if (pe.lymph_nodes)     examParts.push(`Lymph: ${pe.lymph_nodes}`)
  if (pe.genitourinary)   examParts.push(`GU: ${pe.genitourinary}`)
  if (pe.psychiatric)     examParts.push(`Psych: ${pe.psychiatric}`)
  if (examParts.length)   parts.push(`\nPHYSICAL EXAM:\n${examParts.join('\n')}`)

  if (patient.lab_results)     parts.push(`\nLABORATORY RESULTS:\n${patient.lab_results}`)
  if (patient.imaging_results) parts.push(`IMAGING RESULTS:\n${patient.imaging_results}`)
  if (patient.additional_context) parts.push(`ADDITIONAL CONTEXT: ${patient.additional_context}`)

  if (verifiedInteractions.length > 0) {
    parts.push(`\nVERIFIED DRUG INTERACTIONS (from RxNorm database — treat as confirmed clinical facts):\n${verifiedInteractions}`)
  }

  parts.push(`
Generate the differential diagnosis. Return ONLY this JSON structure:
{
  "reasoning_chain": "Step 1 - Demographics/base rates: [age/sex priors for this CC]. Step 2 - Temporal pattern: [acute/subacute/chronic implications]. Step 3 - Vital signs analysis: [what abnormal vitals tell us]. Step 4 - Must-not-miss evaluation: [explicitly state ruled in/out for top dangerous diagnoses]. Step 5 - Pertinent positives effect: [how each key finding updates probability]. Step 6 - Pertinent negatives effect: [how each absence updates probability]. Step 7 - Final ranking rationale: [top 3 diagnoses and why they rank here].",
  "red_flags": ["specific alarming feature and why it is dangerous"],
  "emergency_level": "EMERGENCY|URGENT|ROUTINE",
  "risk_stratification": "CRITICAL|HIGH|MODERATE|LOW",
  "disposition": "Immediate ICU admission|ED admission/observation|Urgent inpatient admission|Urgent outpatient (24-48h)|Semi-urgent outpatient (1-2 weeks)|Routine outpatient",
  "differential_diagnosis": [
    {
      "rank": 1,
      "name": "Specific Diagnosis Name",
      "icd10_code": "X00.0",
      "probability": "High|Moderate|Low",
      "confidence_percent": 65,
      "pathophysiology": "Trigger → pathophysiologic process → clinical manifestation",
      "supporting_evidence": ["specific patient finding that supports this diagnosis"],
      "against_evidence": ["specific patient finding that argues against this diagnosis"],
      "key_differentiators": ["finding that would confirm this over the top differential"],
      "clinical_score": "Applicable scoring system with interpretation for this patient (omit if not applicable)",
      "must_rule_out": false,
      "emergency": false
    }
  ],
  "most_likely_diagnosis": "Name of top diagnosis with one-sentence rationale",
  "workup": {
    "immediate": ["urgent intervention if emergency — be specific"],
    "labs": ["specific test: indication and what you expect to find"],
    "imaging": ["specific modality with protocol/view: indication"],
    "other_tests": ["ECG, spirometry, LP, etc with indication"],
    "referrals": ["specialty: specific reason and urgency"]
  },
  "treatment_considerations": ["prioritized by urgency — include drug, dose class, and rationale where applicable"],
  "soap_note": "S:\\nHPI: [detailed narrative]\\nPMH: [list]\\nMeds: [list]\\nAllergies: [list]\\nFHx: [relevant]\\nSHx: [relevant]\\n\\nO:\\nVitals: [with interpretation]\\nExam: [system by system]\\nLabs/Imaging: [pertinent results]\\n\\nA:\\n1. [Most likely dx] — [reasoning]\\n2. [Second dx] — [reasoning]\\n3. [Third dx] — [reasoning]\\n\\nP:\\n[Organized: immediate interventions → workup → treatment → follow-up → patient education]",
  "clinical_pearls": ["specific, actionable teaching point relevant to this case — not generic statements"],
  "drug_interactions": ["clinically significant interaction specific to this patient with management recommendation"],
  "disclaimer": "This tool assists clinical decision-making and does not replace physician judgment, examination, or institutional protocols."
}`)

  return parts.join('\n')
}

export async function getDiagnosis(patient: PatientData) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ API key not set. Add EXPO_PUBLIC_GROQ_API_KEY to .env file.')
  }

  // Fetch real drug interactions from NIH RxNorm (free, no key required)
  let verifiedInteractions: string[] = []
  let rxInteractions: RxInteraction[] = []
  if (patient.medications.length >= 2) {
    try {
      rxInteractions = await checkDrugInteractions(patient.medications)
      verifiedInteractions = rxInteractions.map(
        i => `${i.drugs} [${i.severity.toUpperCase()}]: ${i.description}`
      )
    } catch {
      // RxNorm is best-effort — don't block diagnosis if it fails
    }
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
        { role: 'user',   content: buildPrompt(patient, verifiedInteractions) },
      ],
      temperature: 0.15,
      max_tokens: 6000,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `Groq API error: ${response.status}`)
  }

  const data = await response.json()
  let text: string = data.choices[0].message.content

  // Strip thinking tokens if model emits them
  text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

  let result: any
  try {
    result = JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) result = JSON.parse(match[0])
    else throw new Error('AI returned invalid response. Please try again.')
  }

  // Attach verified RxNorm interactions as a separate field so UI can badge them
  if (rxInteractions.length > 0) {
    result.verified_drug_interactions = rxInteractions.map(
      i => `${i.drugs} [${i.severity.toUpperCase()}]: ${i.description}`
    )
  }

  return result
}
