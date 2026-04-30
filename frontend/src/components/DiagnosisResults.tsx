import { useState } from 'react'
import type { DiagnosisResult, DiagnosisEntry, PatientData } from '../types/medical'
import {
  AlertTriangle, ChevronDown, ChevronUp, Copy, Check,
  ChevronLeft, FlaskConical, Clipboard, Lightbulb, Pill,
} from 'lucide-react'

interface Props {
  result: DiagnosisResult
  patient: PatientData
  onBack: () => void
}

function ProbabilityBar({ pct, level }: { pct: number; level: string }) {
  const color = level === 'High' ? 'bg-blue-600' : level === 'Moderate' ? 'bg-amber-500' : 'bg-slate-400'
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-500 whitespace-nowrap w-8">{pct}%</span>
    </div>
  )
}

function DiagnosisCard({ entry, rank }: { entry: DiagnosisEntry; rank: number }) {
  const [expanded, setExpanded] = useState(rank <= 3)

  const borderColor = entry.emergency
    ? 'border-red-200 bg-red-50/30'
    : entry.must_rule_out
    ? 'border-amber-200 bg-amber-50/30'
    : 'border-slate-200 bg-white'

  const rankColor = rank === 1
    ? 'bg-blue-600 text-white'
    : rank === 2
    ? 'bg-blue-500 text-white'
    : rank === 3
    ? 'bg-blue-400 text-white'
    : 'bg-slate-200 text-slate-600'

  const probColor = entry.probability === 'High'
    ? 'text-blue-700 bg-blue-50'
    : entry.probability === 'Moderate'
    ? 'text-amber-700 bg-amber-50'
    : 'text-slate-600 bg-slate-100'

  return (
    <div className={`rounded-xl border ${borderColor} overflow-hidden`}>
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${rankColor}`}>
          {rank}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-900 text-sm">{entry.name}</span>
            {entry.emergency && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                🚨 EMERGENCY
              </span>
            )}
            {entry.must_rule_out && !entry.emergency && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                ⚠️ Must Rule Out
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${probColor}`}>
              {entry.probability}
            </span>
            {entry.icd10_code && (
              <span className="text-xs text-slate-400 font-mono">{entry.icd10_code}</span>
            )}
          </div>
          {entry.confidence_percent !== undefined && (
            <ProbabilityBar pct={entry.confidence_percent} level={entry.probability} />
          )}
        </div>

        <div className="text-slate-400">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 grid gap-3 sm:grid-cols-2 text-sm">
          {entry.supporting_evidence.length > 0 && (
            <div>
              <div className="text-xs font-bold text-emerald-700 mb-1.5">✓ Supporting Evidence</div>
              <ul className="space-y-1">
                {entry.supporting_evidence.map((e, i) => (
                  <li key={i} className="flex gap-1.5 text-xs text-slate-700">
                    <span className="text-emerald-500 flex-shrink-0">•</span>{e}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {entry.against_evidence.length > 0 && (
            <div>
              <div className="text-xs font-bold text-red-600 mb-1.5">✗ Against</div>
              <ul className="space-y-1">
                {entry.against_evidence.map((e, i) => (
                  <li key={i} className="flex gap-1.5 text-xs text-slate-600">
                    <span className="text-red-400 flex-shrink-0">•</span>{e}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button onClick={copy} className="btn-secondary text-xs py-1.5 px-3">
      {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> {label}</>}
    </button>
  )
}

function Section({ title, icon, children, defaultOpen = true }: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-bold text-slate-800">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && <div className="border-t border-slate-100 px-5 py-4">{children}</div>}
    </div>
  )
}

export function DiagnosisResults({ result, patient: _patient, onBack }: Props) {
  const emergencyColors = {
    EMERGENCY: 'bg-red-600 text-white',
    URGENT: 'bg-amber-500 text-white',
    ROUTINE: 'bg-emerald-600 text-white',
  }

  const emergencyIcons = {
    EMERGENCY: '🚨',
    URGENT: '⚠️',
    ROUTINE: '✅',
  }

  const soapText = result.soap_note

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Differential Diagnosis</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Most likely: <strong className="text-slate-800">{result.most_likely_diagnosis}</strong>
          </p>
        </div>
        <button className="btn-secondary text-xs py-1.5 px-3" onClick={onBack}>
          <ChevronLeft size={12} /> Edit Case
        </button>
      </div>

      {/* Emergency Banner */}
      <div className={`rounded-xl px-5 py-4 ${emergencyColors[result.emergency_level]}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emergencyIcons[result.emergency_level]}</span>
          <div>
            <div className="font-black text-lg tracking-wide">{result.emergency_level}</div>
            {result.emergency_level !== 'ROUTINE' && result.workup.immediate.length > 0 && (
              <div className="text-sm opacity-90 mt-0.5">
                Immediate: {result.workup.immediate.join(' · ')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Red Flags */}
      {result.red_flags.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-red-600" />
            <span className="font-bold text-red-800">Red Flags</span>
          </div>
          <ul className="space-y-1.5">
            {result.red_flags.map((flag, i) => (
              <li key={i} className="flex gap-2 text-sm text-red-700">
                <span className="flex-shrink-0">🔴</span>{flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Drug Interactions */}
      {result.drug_interactions.length > 0 && (
        <div className="rounded-xl border border-purple-200 bg-purple-50 px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Pill size={16} className="text-purple-600" />
            <span className="font-bold text-purple-800">Medication Considerations</span>
          </div>
          <ul className="space-y-1">
            {result.drug_interactions.map((d, i) => (
              <li key={i} className="text-sm text-purple-700">• {d}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Differential Diagnosis */}
      <Section title="Differential Diagnosis" icon={<span className="text-blue-600">🩺</span>}>
        <div className="space-y-3">
          {result.differential_diagnosis.map((entry) => (
            <DiagnosisCard key={entry.rank} entry={entry} rank={entry.rank} />
          ))}
        </div>
      </Section>

      {/* Workup */}
      <Section title="Recommended Workup" icon={<FlaskConical size={16} className="text-blue-600" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          {result.workup.immediate.length > 0 && (
            <div className="sm:col-span-2 rounded-lg bg-red-50 border border-red-200 p-3">
              <div className="text-xs font-bold text-red-700 mb-2">IMMEDIATE INTERVENTIONS</div>
              <ul className="space-y-1">
                {result.workup.immediate.map((item, i) => (
                  <li key={i} className="text-sm text-red-700 font-medium">→ {item}</li>
                ))}
              </ul>
            </div>
          )}
          {result.workup.labs.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-600 mb-2">🧪 Laboratory</div>
              <ul className="space-y-1">
                {result.workup.labs.map((item, i) => (
                  <li key={i} className="text-xs text-slate-700">• {item}</li>
                ))}
              </ul>
            </div>
          )}
          {result.workup.imaging.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-600 mb-2">🔬 Imaging</div>
              <ul className="space-y-1">
                {result.workup.imaging.map((item, i) => (
                  <li key={i} className="text-xs text-slate-700">• {item}</li>
                ))}
              </ul>
            </div>
          )}
          {result.workup.other_tests.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-600 mb-2">📋 Other Tests</div>
              <ul className="space-y-1">
                {result.workup.other_tests.map((item, i) => (
                  <li key={i} className="text-xs text-slate-700">• {item}</li>
                ))}
              </ul>
            </div>
          )}
          {result.workup.referrals.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-600 mb-2">👨‍⚕️ Referrals / Consults</div>
              <ul className="space-y-1">
                {result.workup.referrals.map((item, i) => (
                  <li key={i} className="text-xs text-slate-700">• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      {/* Treatment */}
      {result.treatment_considerations.length > 0 && (
        <Section title="Initial Treatment Considerations" icon={<Pill size={16} className="text-blue-600" />}>
          <ul className="space-y-2">
            {result.treatment_considerations.map((t, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="text-blue-500 flex-shrink-0 font-bold">{i + 1}.</span>{t}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Clinical Pearls */}
      {result.clinical_pearls.length > 0 && (
        <Section title="Clinical Pearls" icon={<Lightbulb size={16} className="text-amber-500" />} defaultOpen={false}>
          <ul className="space-y-2">
            {result.clinical_pearls.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="text-amber-400 flex-shrink-0">💡</span>{p}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* SOAP Note */}
      <Section
        title="SOAP Note"
        icon={<Clipboard size={16} className="text-blue-600" />}
        defaultOpen={false}
      >
        <div className="flex justify-end mb-3">
          <CopyButton text={soapText} label="Copy SOAP Note" />
        </div>
        <pre className="whitespace-pre-wrap text-xs text-slate-700 font-mono leading-relaxed bg-slate-50 rounded-lg p-4 border border-slate-100 max-h-96 overflow-y-auto">
          {soapText}
        </pre>
      </Section>

      {/* Disclaimer */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 text-center">
        ⚕️ {result.disclaimer}
      </div>
    </div>
  )
}
