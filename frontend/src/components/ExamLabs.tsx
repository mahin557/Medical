import type { PatientData, Vitals, PhysicalExam } from '../types/medical'
import { ChevronLeft, Stethoscope, FlaskConical } from 'lucide-react'

interface Props {
  patient: PatientData
  onChange: (p: PatientData) => void
  onBack: () => void
  onDiagnose: () => void
}

function VitalInput({
  label, value, unit, placeholder, onChange, highlight,
}: {
  label: string
  value: number | ''
  unit: string
  placeholder: string
  onChange: (v: number | '') => void
  highlight?: boolean
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type="number"
          className={`input-field pr-10 ${highlight ? 'border-amber-300 bg-amber-50/50' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          step="0.1"
        />
        <div className="absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
          {unit}
        </div>
      </div>
    </div>
  )
}

export function ExamLabs({ patient, onChange, onBack, onDiagnose }: Props) {
  function setVital<K extends keyof Vitals>(key: K, val: Vitals[K]) {
    onChange({ ...patient, vitals: { ...patient.vitals, [key]: val } })
  }

  function setExam<K extends keyof PhysicalExam>(key: K, val: string) {
    onChange({ ...patient, physical_exam: { ...patient.physical_exam, [key]: val } })
  }

  const v = patient.vitals
  const pe = patient.physical_exam

  const abnormalVitals = {
    temp: v.temperature_f && (Number(v.temperature_f) > 100.4 || Number(v.temperature_f) < 96),
    hr: v.heart_rate && (Number(v.heart_rate) > 100 || Number(v.heart_rate) < 60),
    rr: v.respiratory_rate && (Number(v.respiratory_rate) > 20 || Number(v.respiratory_rate) < 12),
    bp: v.bp_systolic && (Number(v.bp_systolic) > 139 || Number(v.bp_systolic) < 90),
    o2: v.o2_saturation && Number(v.o2_saturation) < 95,
  }

  const EXAM_SYSTEMS: { key: keyof PhysicalExam; label: string; placeholder: string }[] = [
    { key: 'general', label: 'General Appearance', placeholder: 'A&Ox3, in mild distress, diaphoretic. Well-appearing, NAD...' },
    { key: 'heent', label: 'HEENT', placeholder: 'Normocephalic, atraumatic. PERRL. Mucous membranes moist. No JVD...' },
    { key: 'neck', label: 'Neck', placeholder: 'Supple. No lymphadenopathy. No thyromegaly. No meningismus...' },
    { key: 'cardiovascular', label: 'Cardiovascular', placeholder: 'RRR, S1/S2 normal. No murmurs, rubs, or gallops. 2+ peripheral pulses...' },
    { key: 'respiratory', label: 'Respiratory', placeholder: 'CTA bilaterally. No wheezes, rales, or rhonchi. Good air entry...' },
    { key: 'abdomen', label: 'Abdomen', placeholder: 'Soft, NT/ND. No guarding or rebound. BS normoactive. No organomegaly...' },
    { key: 'musculoskeletal', label: 'Musculoskeletal', placeholder: 'Full ROM. No joint swelling or tenderness. Normal gait...' },
    { key: 'neurological', label: 'Neurological', placeholder: 'Alert, oriented. CN II-XII intact. Motor 5/5 all extremities. Reflexes 2+. No Babinski...' },
    { key: 'skin', label: 'Skin', placeholder: 'No rash, petechiae, or lesions. No jaundice. Warm and dry...' },
    { key: 'lymph_nodes', label: 'Lymph Nodes', placeholder: 'No cervical, axillary, or inguinal lymphadenopathy...' },
    { key: 'genitourinary', label: 'Genitourinary', placeholder: 'CVA tenderness: none. Suprapubic tenderness: none...' },
    { key: 'psychiatric', label: 'Psychiatric / MSE', placeholder: 'Alert, oriented, appropriate affect. No SI/HI. Normal thought content...' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Examination & Labs</h2>
        <p className="text-sm text-slate-500 mt-0.5">Vital signs, physical exam, laboratory and imaging results</p>
      </div>

      {/* Vitals */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Stethoscope size={16} className="text-blue-600" />
          <div className="section-title">Vital Signs</div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <VitalInput
            label="Temperature" value={v.temperature_f ?? ''} unit="°F"
            placeholder="98.6" onChange={val => setVital('temperature_f', val)}
            highlight={!!abnormalVitals.temp}
          />
          <VitalInput
            label="Heart Rate" value={v.heart_rate ?? ''} unit="bpm"
            placeholder="72" onChange={val => setVital('heart_rate', val)}
            highlight={!!abnormalVitals.hr}
          />
          <VitalInput
            label="Resp Rate" value={v.respiratory_rate ?? ''} unit="/min"
            placeholder="16" onChange={val => setVital('respiratory_rate', val)}
            highlight={!!abnormalVitals.rr}
          />
          <VitalInput
            label="SpO₂" value={v.o2_saturation ?? ''} unit="%"
            placeholder="98" onChange={val => setVital('o2_saturation', val)}
            highlight={!!abnormalVitals.o2}
          />
          <VitalInput
            label="Pain Scale" value={v.pain_scale ?? ''} unit="/10"
            placeholder="0-10" onChange={val => setVital('pain_scale', val)}
          />
          <div className="col-span-2 sm:col-span-1">
            <label className="label">Blood Pressure</label>
            <div className={`flex items-center gap-1 rounded-lg border px-3 py-2 ${abnormalVitals.bp ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200 bg-white'}`}>
              <input
                type="number"
                className="w-full bg-transparent text-sm outline-none"
                placeholder="120"
                value={v.bp_systolic ?? ''}
                onChange={e => setVital('bp_systolic', e.target.value === '' ? '' : Number(e.target.value))}
              />
              <span className="text-slate-400">/</span>
              <input
                type="number"
                className="w-full bg-transparent text-sm outline-none"
                placeholder="80"
                value={v.bp_diastolic ?? ''}
                onChange={e => setVital('bp_diastolic', e.target.value === '' ? '' : Number(e.target.value))}
              />
              <span className="text-xs text-slate-400 whitespace-nowrap">mmHg</span>
            </div>
          </div>
          <VitalInput
            label="Weight" value={v.weight_kg ?? ''} unit="kg"
            placeholder="70" onChange={val => setVital('weight_kg', val)}
          />
          <VitalInput
            label="Height" value={v.height_cm ?? ''} unit="cm"
            placeholder="170" onChange={val => setVital('height_cm', val)}
          />
          <VitalInput
            label="GCS" value={v.gcs ?? ''} unit="/15"
            placeholder="15" onChange={val => setVital('gcs', val)}
          />
        </div>

        {/* Abnormal vitals warning */}
        {Object.values(abnormalVitals).some(Boolean) && (
          <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 font-medium">
            ⚠️ Abnormal vitals detected — will be highlighted in differential analysis
          </div>
        )}
      </div>

      {/* Physical Exam */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Stethoscope size={16} className="text-blue-600" />
          <div className="section-title">Physical Examination</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {EXAM_SYSTEMS.map(({ key, label, placeholder }) => (
            <div key={key} className={key === 'general' ? 'sm:col-span-2' : ''}>
              <label className="label">{label}</label>
              <textarea
                className="input-field resize-none text-xs leading-relaxed"
                rows={2}
                placeholder={placeholder}
                value={pe?.[key] ?? ''}
                onChange={e => setExam(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Labs & Imaging */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical size={16} className="text-blue-600" />
          <div className="section-title">Lab Results & Imaging</div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Laboratory Results</label>
            <textarea
              className="input-field resize-none text-xs leading-relaxed font-mono"
              rows={6}
              placeholder={'CBC: WBC 14.2 (H), Hgb 13.1, Plt 210\nBMP: Na 138, K 4.1, Cr 1.0, Glu 95\nTroponin I: 2.4 (H)\nBNP: 180 (H)\nLFTs: AST 32, ALT 28, Alk Phos 90\nPT/INR: 1.1'}
              value={patient.lab_results}
              onChange={e => onChange({ ...patient, lab_results: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Imaging Results</label>
            <textarea
              className="input-field resize-none text-xs leading-relaxed"
              rows={6}
              placeholder={'CXR: No acute cardiopulmonary process. CTR 0.55.\n\nECG: ST elevation in leads II, III, aVF with reciprocal changes in I, aVL.\n\nCT Chest w/o: No PE. No pneumothorax. Mild cardiomegaly.'}
              value={patient.imaging_results}
              onChange={e => onChange({ ...patient, imaging_results: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Additional Clinical Context</label>
            <textarea
              className="input-field resize-none text-xs"
              rows={2}
              placeholder="Any additional history, recent sick contacts, travel, occupational exposures, immunocompromised state, pregnancy status..."
              value={patient.additional_context}
              onChange={e => onChange({ ...patient, additional_context: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button className="btn-secondary" onClick={onBack}>
          <ChevronLeft size={16} /> Back
        </button>
        <button
          className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-base px-6 py-3"
          onClick={onDiagnose}
        >
          🧠 Generate Diagnosis
        </button>
      </div>
    </div>
  )
}
