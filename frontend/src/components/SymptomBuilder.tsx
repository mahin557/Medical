import { useState, useId } from 'react'
import type { PatientData, SymptomAttribute } from '../types/medical'
import {
  SYMPTOM_SYSTEMS, ALL_SYMPTOMS,
  SYMPTOM_CHARACTERS, COMMON_LOCATIONS, ROS_PERTINENT_NEGATIVES,
} from '../data/symptoms'
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus, X, Search } from 'lucide-react'

interface Props {
  patient: PatientData
  onChange: (p: PatientData) => void
  onBack: () => void
  onNext: () => void
}

const ONSET_OPTIONS = [
  'Sudden (seconds to minutes)',
  'Acute (hours)',
  'Subacute (days to weeks)',
  'Chronic (months+)',
]

const TIMING_OPTIONS = [
  'Constant', 'Intermittent', 'Progressive / worsening',
  'Episodic', 'Cyclical', 'Improving',
]

function SymptomCard({
  symptom, onUpdate, onRemove,
}: {
  symptom: SymptomAttribute
  onUpdate: (s: SymptomAttribute) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(true)

  function update<K extends keyof SymptomAttribute>(key: K, val: SymptomAttribute[K]) {
    onUpdate({ ...symptom, [key]: val })
  }

  const charSuggestions = Object.values(SYMPTOM_CHARACTERS).flat()

  return (
    <div className="card overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            {symptom.severity ?? '–'}
          </div>
          <span className="font-semibold text-slate-800">{symptom.name}</span>
          {symptom.duration && (
            <span className="text-xs text-slate-500 hidden sm:inline">· {symptom.duration}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); onRemove() }}
            className="rounded-full p-1 hover:bg-red-100 hover:text-red-600 text-slate-400 transition-colors"
          >
            <X size={14} />
          </button>
          {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 p-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {/* Severity */}
          <div className="col-span-2 sm:col-span-3">
            <label className="label">Severity (1–10)</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1} max={10}
                className="w-full accent-blue-600"
                value={symptom.severity ?? 5}
                onChange={e => update('severity', Number(e.target.value))}
              />
              <span className={`w-8 text-center text-sm font-bold rounded px-1 ${
                (symptom.severity ?? 5) >= 8 ? 'text-red-600 bg-red-50' :
                (symptom.severity ?? 5) >= 5 ? 'text-amber-600 bg-amber-50' :
                'text-green-600 bg-green-50'
              }`}>
                {symptom.severity ?? 5}
              </span>
            </div>
          </div>

          {/* Onset */}
          <div>
            <label className="label">Onset</label>
            <select
              className="input-field"
              value={symptom.onset ?? ''}
              onChange={e => update('onset', e.target.value)}
            >
              <option value="">Select...</option>
              {ONSET_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="label">Duration</label>
            <input
              className="input-field"
              placeholder="e.g. 2 hours, 3 days, 4 weeks"
              value={symptom.duration ?? ''}
              onChange={e => update('duration', e.target.value)}
            />
          </div>

          {/* Timing */}
          <div>
            <label className="label">Timing Pattern</label>
            <select
              className="input-field"
              value={symptom.timing ?? ''}
              onChange={e => update('timing', e.target.value)}
            >
              <option value="">Select...</option>
              {TIMING_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Character */}
          <div>
            <label className="label">Character / Quality</label>
            <input
              className="input-field"
              list="char-list"
              placeholder="e.g. sharp, pressure, burning"
              value={symptom.character ?? ''}
              onChange={e => update('character', e.target.value)}
            />
            <datalist id="char-list">
              {charSuggestions.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>

          {/* Location */}
          <div>
            <label className="label">Location</label>
            <input
              className="input-field"
              list="loc-list"
              placeholder="e.g. Left chest, RLQ"
              value={symptom.location ?? ''}
              onChange={e => update('location', e.target.value)}
            />
            <datalist id="loc-list">
              {COMMON_LOCATIONS.map(l => <option key={l} value={l} />)}
            </datalist>
          </div>

          {/* Radiation */}
          <div>
            <label className="label">Radiation / Spread</label>
            <input
              className="input-field"
              placeholder="e.g. Radiates to left jaw and arm"
              value={symptom.radiation ?? ''}
              onChange={e => update('radiation', e.target.value)}
            />
          </div>

          {/* Aggravating */}
          <div className="col-span-2">
            <label className="label">Aggravating Factors</label>
            <input
              className="input-field"
              placeholder="e.g. exertion, eating, lying flat, movement"
              value={symptom.aggravating_factors ?? ''}
              onChange={e => update('aggravating_factors', e.target.value)}
            />
          </div>

          {/* Relieving */}
          <div className="col-span-2">
            <label className="label">Relieving Factors</label>
            <input
              className="input-field"
              placeholder="e.g. rest, nitroglycerin, antacids, position change"
              value={symptom.relieving_factors ?? ''}
              onChange={e => update('relieving_factors', e.target.value)}
            />
          </div>

          {/* Associated */}
          <div className="col-span-2 sm:col-span-3">
            <label className="label">Associated Symptoms</label>
            <input
              className="input-field"
              placeholder="e.g. nausea, diaphoresis, dyspnea, fever"
              value={symptom.associated_symptoms ?? ''}
              onChange={e => update('associated_symptoms', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function SymptomBuilder({ patient, onChange, onBack, onNext }: Props) {
  const uid = useId()
  const [search, setSearch] = useState('')
  const [activeSystem, setActiveSystem] = useState<string | null>(null)
  const [rosNeg, setRosNeg] = useState<string[]>(patient.review_of_systems.pertinent_negatives)
  const [customInput, setCustomInput] = useState('')

  const searchResults = search.length > 1
    ? ALL_SYMPTOMS.filter(s => s.toLowerCase().includes(search.toLowerCase())).slice(0, 12)
    : []

  function addSymptom(name: string) {
    if (patient.symptoms.some(s => s.name === name)) return
    const sym: SymptomAttribute = { id: `${uid}-${Date.now()}`, name, severity: 5 }
    onChange({ ...patient, symptoms: [...patient.symptoms, sym] })
    setSearch('')
  }

  function addCustom() {
    const v = customInput.trim()
    if (v) { addSymptom(v); setCustomInput('') }
  }

  function updateSymptom(id: string, updated: SymptomAttribute) {
    onChange({ ...patient, symptoms: patient.symptoms.map(s => s.id === id ? updated : s) })
  }

  function removeSymptom(id: string) {
    onChange({ ...patient, symptoms: patient.symptoms.filter(s => s.id !== id) })
  }

  function toggleNegative(neg: string) {
    const updated = rosNeg.includes(neg) ? rosNeg.filter(n => n !== neg) : [...rosNeg, neg]
    setRosNeg(updated)
    onChange({
      ...patient,
      review_of_systems: { ...patient.review_of_systems, pertinent_negatives: updated },
    })
  }

  const displayedSymptoms = activeSystem
    ? SYMPTOM_SYSTEMS.find(s => s.key === activeSystem)?.symptoms ?? []
    : searchResults

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Symptom Builder</h2>
        <p className="text-sm text-slate-500 mt-0.5">Add all symptoms with full OPQRST details. The more detail, the better the differential.</p>
      </div>

      {/* Symptom Adder */}
      <div className="card p-5 space-y-4">
        <div className="section-title">Add Symptoms</div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={14} className="text-slate-400" />
          </div>
          <input
            className="input-field pl-9"
            placeholder="Search symptoms... (e.g. chest pain, dyspnea, headache)"
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveSystem(null) }}
          />
        </div>

        {/* Search Results */}
        {search.length > 1 && searchResults.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {searchResults.map(sym => (
              <button
                key={sym}
                onClick={() => addSymptom(sym)}
                disabled={patient.symptoms.some(s => s.name === sym)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  patient.symptoms.some(s => s.name === sym)
                    ? 'border-blue-200 bg-blue-50 text-blue-400 cursor-not-allowed'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {patient.symptoms.some(s => s.name === sym) ? `✓ ${sym}` : `+ ${sym}`}
              </button>
            ))}
          </div>
        )}

        {/* Browse by System */}
        {!search && (
          <>
            <div className="text-xs text-slate-500">Or browse by system:</div>
            <div className="flex flex-wrap gap-1.5">
              {SYMPTOM_SYSTEMS.map(sys => (
                <button
                  key={sys.key}
                  onClick={() => setActiveSystem(activeSystem === sys.key ? null : sys.key)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                    activeSystem === sys.key
                      ? 'border-blue-500 bg-blue-600 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {sys.emoji} {sys.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* System Symptoms */}
        {activeSystem && displayedSymptoms.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {displayedSymptoms.map(sym => (
              <button
                key={sym}
                onClick={() => addSymptom(sym)}
                disabled={patient.symptoms.some(s => s.name === sym)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  patient.symptoms.some(s => s.name === sym)
                    ? 'border-blue-200 bg-blue-50 text-blue-400 cursor-not-allowed'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {patient.symptoms.some(s => s.name === sym) ? `✓ ${sym}` : `+ ${sym}`}
              </button>
            ))}
          </div>
        )}

        {/* Custom */}
        <div className="flex gap-2">
          <input
            className="input-field text-sm"
            placeholder="Custom symptom (not in list)..."
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          />
          <button className="btn-secondary px-3 py-2 text-xs whitespace-nowrap" onClick={addCustom}>
            <Plus size={14} /> Add Custom
          </button>
        </div>
      </div>

      {/* Symptom Cards */}
      {patient.symptoms.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="section-title">{patient.symptoms.length} Symptom{patient.symptoms.length !== 1 ? 's' : ''} Added</div>
          </div>
          {patient.symptoms.map(sym => (
            <SymptomCard
              key={sym.id}
              symptom={sym}
              onUpdate={updated => updateSymptom(sym.id, updated)}
              onRemove={() => removeSymptom(sym.id)}
            />
          ))}
        </div>
      )}

      {patient.symptoms.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-400">
          <div className="text-2xl mb-2">🩺</div>
          <div className="text-sm">No symptoms added yet. Search above or browse by system.</div>
        </div>
      )}

      {/* Pertinent Negatives */}
      <div className="card p-5">
        <div className="section-title mb-3">Pertinent Negatives (ROS)</div>
        <p className="text-xs text-slate-500 mb-3">Check all negative findings relevant to this presentation. These help exclude diagnoses.</p>
        <div className="flex flex-wrap gap-1.5">
          {ROS_PERTINENT_NEGATIVES.map(neg => (
            <button
              key={neg}
              onClick={() => toggleNegative(neg)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                rosNeg.includes(neg)
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {rosNeg.includes(neg) ? '✓ ' : ''}{neg}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button className="btn-secondary" onClick={onBack}>
          <ChevronLeft size={16} /> Back
        </button>
        <button className="btn-primary" onClick={onNext}>
          Continue to Exam & Labs <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
