import { useState } from 'react'
import type { PatientData, DiagnosisResult } from './types/medical'
import { PatientContextForm } from './components/PatientContextForm'
import { SymptomBuilder } from './components/SymptomBuilder'
import { ExamLabs } from './components/ExamLabs'
import { DiagnosisResults } from './components/DiagnosisResults'
import { StepIndicator } from './components/StepIndicator'
import { getDiagnosis } from './api/diagnosis'
import { Activity } from 'lucide-react'

const STEPS = ['Patient & History', 'Symptoms', 'Exam & Labs', 'Diagnosis']

function emptyPatient(): PatientData {
  return {
    age: '',
    sex: 'Male',
    chief_complaint: '',
    symptoms: [],
    review_of_systems: {
      constitutional: [], heent: [], cardiovascular: [], respiratory: [],
      gastrointestinal: [], genitourinary: [], musculoskeletal: [], skin: [],
      neurological: [], psychiatric: [], endocrine: [], hematologic: [],
      allergic: [], pertinent_negatives: [],
    },
    past_medical_history: [],
    surgical_history: [],
    medications: [],
    allergies: [],
    family_history: [],
    social_history: '',
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
    lab_results: '',
    imaging_results: '',
    additional_context: '',
  }
}

export default function App() {
  const [step, setStep] = useState(0)
  const [patient, setPatient] = useState<PatientData>(emptyPatient)
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingMsg, setLoadingMsg] = useState('')

  const LOADING_MESSAGES = [
    'Analyzing symptom patterns…',
    'Applying Bayesian clinical reasoning…',
    'Checking differential diagnoses…',
    'Evaluating red flags…',
    'Reviewing medications and interactions…',
    'Generating SOAP note…',
    'Finalizing evidence-based workup…',
  ]

  async function handleDiagnose() {
    setLoading(true)
    setError(null)
    setResult(null)

    let msgIdx = 0
    setLoadingMsg(LOADING_MESSAGES[0])
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length
      setLoadingMsg(LOADING_MESSAGES[msgIdx])
    }, 1800)

    try {
      const res = await getDiagnosis(patient)
      setResult(res)
      setStep(3)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      clearInterval(interval)
      setLoading(false)
    }
  }

  function handleReset() {
    setPatient(emptyPatient())
    setResult(null)
    setError(null)
    setStep(0)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-900">MedDx</div>
              <div className="text-xs text-slate-500">Clinical Diagnosis Assistant</div>
            </div>
          </div>
          {(result || step > 0) && (
            <button onClick={handleReset} className="btn-secondary text-xs py-1.5 px-3">
              New Case
            </button>
          )}
        </div>
      </header>

      {/* Step Indicator */}
      {step < 3 && (
        <div className="border-b border-slate-100 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3">
            <StepIndicator steps={STEPS} current={step} />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-6 py-24">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-slate-200" />
              <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-800">{loadingMsg}</div>
              <div className="mt-1 text-sm text-slate-500">Local AI model analyzing the clinical presentation (may take 30–90s)</div>
            </div>
          </div>
        ) : step === 3 && result ? (
          <DiagnosisResults result={result} patient={patient} onBack={() => setStep(2)} />
        ) : (
          <>
            {step === 0 && (
              <PatientContextForm
                patient={patient}
                onChange={setPatient}
                onNext={() => setStep(1)}
              />
            )}
            {step === 1 && (
              <SymptomBuilder
                patient={patient}
                onChange={setPatient}
                onBack={() => setStep(0)}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <ExamLabs
                patient={patient}
                onChange={setPatient}
                onBack={() => setStep(1)}
                onDiagnose={handleDiagnose}
              />
            )}
            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <strong>Error:</strong> {error}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-400">
        MedDx aids clinical reasoning. Does not replace physician judgment or established guidelines.
      </footer>
    </div>
  )
}
