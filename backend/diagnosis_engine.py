import httpx
import json
import re
import os
from models import PatientData

OLLAMA_URL  = os.getenv("OLLAMA_URL",  "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1:8b")

SYSTEM_PROMPT = """You are an expert clinical decision support system assisting board-certified physicians. You have deep expertise across internal medicine, emergency medicine, surgery, pediatrics, neurology, cardiology, and all medical specialties.

Your differential diagnosis generation uses:
- Bayesian reasoning (pre-test probability + symptom likelihood ratios)
- Pattern recognition for classic AND atypical presentations
- Demographic-adjusted disease prevalence (age/sex dramatically changes differentials)
- Evidence-based medicine principles

ALWAYS:
- Flag true emergencies prominently — patient safety is paramount
- Include must-not-miss diagnoses even when less likely
- Apply pertinent positives AND negatives in reasoning
- Consider medication effects, interactions, and iatrogenic causes
- Note atypical presentations (elderly, immunocompromised, diabetic, female, pediatric)
- Use physician-level medical terminology
- Generate 10-15 diagnoses (include rare but dangerous ones)

You MUST return ONLY valid JSON — no markdown, no explanation outside the JSON object."""


def build_prompt(patient: PatientData) -> str:
    parts = []

    bmi = None
    if patient.vitals and patient.vitals.weight_kg and patient.vitals.height_cm:
        bmi = round(patient.vitals.weight_kg / ((patient.vitals.height_cm / 100) ** 2), 1)

    parts.append(f"""PATIENT:
Age: {patient.age} years | Sex: {patient.sex}
Chief Complaint: "{patient.chief_complaint}"
""")

    if patient.symptoms:
        parts.append("HISTORY OF PRESENT ILLNESS:")
        for i, s in enumerate(patient.symptoms, 1):
            text = f"\n{i}. {s.name.upper()}"
            if s.onset:               text += f"\n   Onset: {s.onset}"
            if s.duration:            text += f"\n   Duration: {s.duration}"
            if s.severity:            text += f"\n   Severity: {s.severity}/10"
            if s.character:           text += f"\n   Character: {s.character}"
            if s.location:            text += f"\n   Location: {s.location}"
            if s.radiation:           text += f"\n   Radiation: {s.radiation}"
            if s.timing:              text += f"\n   Timing: {s.timing}"
            if s.aggravating_factors: text += f"\n   Aggravating: {s.aggravating_factors}"
            if s.relieving_factors:   text += f"\n   Relieving: {s.relieving_factors}"
            if s.associated_symptoms: text += f"\n   Associated: {s.associated_symptoms}"
            parts.append(text)

    if patient.review_of_systems:
        ros = patient.review_of_systems
        ros_map = [
            ("Constitutional", ros.constitutional), ("HEENT", ros.heent),
            ("Cardiovascular", ros.cardiovascular), ("Respiratory", ros.respiratory),
            ("GI", ros.gastrointestinal), ("GU", ros.genitourinary),
            ("MSK", ros.musculoskeletal), ("Skin", ros.skin),
            ("Neurological", ros.neurological), ("Psychiatric", ros.psychiatric),
            ("Endocrine", ros.endocrine), ("Hematologic", ros.hematologic),
            ("Allergic/Immunologic", ros.allergic),
        ]
        positives = [f"{sys}: {', '.join(syms)}" for sys, syms in ros_map if syms]
        if positives:
            parts.append("\nREVIEW OF SYSTEMS (+):\n" + "\n".join(f"  + {p}" for p in positives))
        if ros.pertinent_negatives:
            parts.append("PERTINENT NEGATIVES:\n" + "\n".join(f"  - {n}" for n in ros.pertinent_negatives))

    if patient.past_medical_history:
        parts.append("\nPAST MEDICAL HISTORY:\n" + "\n".join(f"  • {h}" for h in patient.past_medical_history))
    if patient.surgical_history:
        parts.append("SURGICAL HISTORY:\n" + "\n".join(f"  • {h}" for h in patient.surgical_history))
    if patient.medications:
        parts.append("MEDICATIONS:\n" + "\n".join(f"  • {m}" for m in patient.medications))
    if patient.allergies:
        parts.append("ALLERGIES:\n" + "\n".join(f"  • {a}" for a in patient.allergies))
    if patient.family_history:
        parts.append("FAMILY HISTORY:\n" + "\n".join(f"  • {h}" for h in patient.family_history))
    if patient.social_history:
        parts.append(f"SOCIAL HISTORY:\n  {patient.social_history}")

    if patient.vitals:
        v = patient.vitals
        vt = "\nVITAL SIGNS:"
        if v.temperature_f:              vt += f"\n  Temp: {v.temperature_f}°F"
        if v.heart_rate:                 vt += f"\n  HR: {v.heart_rate} bpm"
        if v.respiratory_rate:           vt += f"\n  RR: {v.respiratory_rate}/min"
        if v.bp_systolic and v.bp_diastolic: vt += f"\n  BP: {v.bp_systolic}/{v.bp_diastolic} mmHg"
        if v.o2_saturation:              vt += f"\n  SpO2: {v.o2_saturation}%"
        if v.weight_kg:                  vt += f"\n  Weight: {v.weight_kg} kg"
        if bmi:                          vt += f"\n  BMI: {bmi}"
        if v.gcs:                        vt += f"\n  GCS: {v.gcs}/15"
        if v.pain_scale:                 vt += f"\n  Pain: {v.pain_scale}/10"
        parts.append(vt)

    if patient.physical_exam:
        pe = patient.physical_exam
        et = "\nPHYSICAL EXAM:"
        for label, val in [
            ("General", pe.general), ("HEENT", pe.heent), ("Neck", pe.neck),
            ("CV", pe.cardiovascular), ("Resp", pe.respiratory),
            ("Abdomen", pe.abdomen), ("MSK", pe.musculoskeletal),
            ("Neuro", pe.neurological), ("Skin", pe.skin),
            ("Lymph", pe.lymph_nodes), ("GU", pe.genitourinary),
            ("Psych/MSE", pe.psychiatric),
        ]:
            if val:
                et += f"\n  {label}: {val}"
        parts.append(et)

    if patient.lab_results:
        parts.append(f"\nLAB RESULTS:\n{patient.lab_results}")
    if patient.imaging_results:
        parts.append(f"\nIMAGING:\n{patient.imaging_results}")
    if patient.additional_context:
        parts.append(f"\nADDITIONAL CONTEXT:\n{patient.additional_context}")

    parts.append("""
Return ONLY this JSON (no markdown, no extra text):

{
  "red_flags": ["alarming features requiring urgent action"],
  "emergency_level": "EMERGENCY|URGENT|ROUTINE",
  "differential_diagnosis": [
    {
      "rank": 1,
      "name": "Diagnosis name",
      "icd10_code": "X00.0",
      "probability": "High|Moderate|Low",
      "confidence_percent": 80,
      "supporting_evidence": ["feature supporting this dx"],
      "against_evidence": ["feature arguing against"],
      "must_rule_out": false,
      "emergency": false
    }
  ],
  "most_likely_diagnosis": "Top diagnosis",
  "workup": {
    "immediate": ["urgent actions if emergency"],
    "labs": ["specific labs with rationale"],
    "imaging": ["specific imaging with protocol"],
    "other_tests": ["EKG, spirometry, etc"],
    "referrals": ["specialty consults"]
  },
  "treatment_considerations": ["step 1", "step 2"],
  "soap_note": "S:\\n...\\nO:\\n...\\nA:\\n...\\nP:\\n...",
  "clinical_pearls": ["high-yield teaching point"],
  "drug_interactions": ["medication concern"],
  "disclaimer": "This tool aids clinical decision-making and does not replace physician judgment."
}""")

    return "\n".join(parts)


async def generate_diagnosis(patient: PatientData) -> dict:
    prompt = build_prompt(patient)

    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": prompt},
        ],
        "stream": False,
        "format": "json",
        "options": {
            "temperature": 0.1,
            "num_ctx": 8192,
        },
    }

    async with httpx.AsyncClient(timeout=300.0) as client:
        try:
            resp = await client.post(f"{OLLAMA_URL}/api/chat", json=payload)
            resp.raise_for_status()
        except httpx.ConnectError:
            raise RuntimeError(
                f"Cannot connect to Ollama at {OLLAMA_URL}. "
                "Make sure Ollama is running: download from https://ollama.com then run 'ollama serve'"
            )

    text = resp.json()["message"]["content"].strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r'\{[\s\S]*\}', text)
        if match:
            return json.loads(match.group())
        raise ValueError(f"Model returned non-JSON. Raw: {text[:500]}")
