import { useState } from 'react'
import type { PatientData, Sex } from '../types/medical'
import { COMMON_PMH, COMMON_MEDICATIONS } from '../data/symptoms'
import { Plus, X, ChevronRight } from 'lucide-react'

interface Props {
  patient: PatientData
  onChange: (p: PatientData) => void
  onNext: () => void
}

function TagInput({
  label, items, suggestions, placeholder, onChange,
}: {
  label: string
  items: string[]
  suggestions?: string[]
  placeholder: string
  onChange: (items: string[]) => void
}) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filtered = suggestions?.filter(
    s => s.toLowerCase().includes(input.toLowerCase()) && !items.includes(s)
  ).slice(0, 8) ?? []

  function add(val: string) {
    const v = val.trim()
    if (v && !items.includes(v)) onChange([...items, v])
    setInput('')
    setShowSuggestions(false)
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map(item => (
          <span key={item} className="tag">
            {item}
            <button className="tag-remove" onClick={() => onChange(items.filter(i => i !== item))}>
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <div className="flex gap-2">
          <input
            className="input-field"
            placeholder={placeholder}
            value={input}
            onChange={e => { setInput(e.target.value); setShowSuggestions(true) }}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add(input))}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />
          <button
            type="button"
            className="btn-secondary px-3 py-2"
            onClick={() => add(input)}
          >
            <Plus size={14} />
          </button>
        </div>
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute z-20 w-full mt-1 rounded-lg border border-slate-200 bg-white shadow-lg max-h-48 overflow-y-auto">
            {filtered.map(s => (
              <button
                key={s}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors"
                onMouseDown={() => add(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function PatientContextForm({ patient, onChange, onNext }: Props) {
  function set<K extends keyof PatientData>(key: K, val: PatientData[K]) {
    onChange({ ...patient, [key]: val })
  }

  const canProceed = patient.age !== '' && Number(patient.age) > 0 && patient.chief_complaint.trim().length > 3

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Patient Information</h2>
        <p className="text-sm text-slate-500 mt-0.5">Demographics, chief complaint, and clinical history</p>
      </div>

      {/* Demographics */}
      <div className="card p-5 space-y-4">
        <div className="section-title">Demographics</div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="label">Age (years) *</label>
            <input
              type="number"
              className="input-field"
              placeholder="e.g. 55"
              min={0}
              max={120}
              value={patient.age}
              onChange={e => set('age', e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Sex *</label>
            <select
              className="input-field"
              value={patient.sex}
              onChange={e => set('sex', e.target.value as Sex)}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other / Not specified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chief Complaint */}
      <div className="card p-5 space-y-3">
        <div className="section-title">Chief Complaint *</div>
        <textarea
          className="input-field min-h-[70px] resize-none"
          placeholder='e.g. "55 yo male with sudden onset crushing chest pain radiating to left jaw, 9/10 severity, with diaphoresis and nausea for the past 2 hours"'
          value={patient.chief_complaint}
          onChange={e => set('chief_complaint', e.target.value)}
        />
        <p className="text-xs text-slate-400">Use patient's own words when possible. Include duration and severity.</p>
      </div>

      {/* PMH */}
      <div className="card p-5 space-y-4">
        <div className="section-title">Past Medical & Surgical History</div>
        <TagInput
          label="Past Medical History"
          items={patient.past_medical_history}
          suggestions={COMMON_PMH}
          placeholder="Type condition or select from suggestions..."
          onChange={v => set('past_medical_history', v)}
        />
        <TagInput
          label="Surgical History"
          items={patient.surgical_history}
          placeholder="e.g. Appendectomy 2015, CABG 2020..."
          onChange={v => set('surgical_history', v)}
        />
      </div>

      {/* Medications & Allergies */}
      <div className="card p-5 space-y-4">
        <div className="section-title">Medications & Allergies</div>
        <TagInput
          label="Current Medications (include dose if known)"
          items={patient.medications}
          suggestions={COMMON_MEDICATIONS}
          placeholder="e.g. Metformin 1000mg BID, Lisinopril 10mg daily..."
          onChange={v => set('medications', v)}
        />
        <TagInput
          label="Allergies (drug + reaction type)"
          items={patient.allergies}
          placeholder="e.g. Penicillin → anaphylaxis, Sulfa → rash..."
          onChange={v => set('allergies', v)}
        />
      </div>

      {/* Family & Social */}
      <div className="card p-5 space-y-4">
        <div className="section-title">Family & Social History</div>
        <TagInput
          label="Family History"
          items={patient.family_history}
          placeholder="e.g. Father: MI age 50, Mother: breast cancer, Sibling: DM..."
          onChange={v => set('family_history', v)}
        />
        <div>
          <label className="label">Social History</label>
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="Tobacco: 30 pack-year history, quit 2010. Alcohol: 2 drinks/day. Occupation: construction worker. Lives with spouse. IV drug use: denies. Sexual history: monogamous..."
            value={patient.social_history}
            onChange={e => set('social_history', e.target.value)}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end">
        <button
          className="btn-primary"
          disabled={!canProceed}
          onClick={onNext}
        >
          Continue to Symptoms
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
