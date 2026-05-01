import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { usePatient } from '../context/PatientContext'
import { getDiagnosis } from '../api/groq'
import type { Vitals, PhysicalExam } from '../types/medical'
import { theme } from '../theme'

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Ionicons name={icon as 'pulse'} size={16} color={theme.colors.primary} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  )
}

function VitalField({
  label, value, unit, placeholder, onChange, abnormal,
}: {
  label: string; value: number | ''; unit: string; placeholder: string
  onChange: (v: number | '') => void; abnormal?: boolean
}) {
  return (
    <View style={s.vitalField}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.vitalInput, abnormal && s.vitalAbnormal]}>
        <TextInput
          style={s.vitalText}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={value === '' ? '' : String(value)}
          onChangeText={v => onChange(v === '' ? '' : Number(v))}
        />
        <Text style={s.vitalUnit}>{unit}</Text>
      </View>
    </View>
  )
}

const EXAM_FIELDS: { key: keyof PhysicalExam; label: string; placeholder: string }[] = [
  { key: 'general',        label: 'General',        placeholder: 'A&Ox3, NAD, appears well...' },
  { key: 'cardiovascular', label: 'Cardiovascular',  placeholder: 'RRR, no murmurs, rubs, gallops...' },
  { key: 'respiratory',    label: 'Respiratory',     placeholder: 'CTA bilaterally, no wheezes...' },
  { key: 'abdomen',        label: 'Abdomen',         placeholder: 'Soft, NT/ND, BS normal...' },
  { key: 'neurological',   label: 'Neurological',    placeholder: 'A&Ox3, CN intact, 5/5 motor...' },
  { key: 'skin',           label: 'Skin',            placeholder: 'No rash, warm and dry...' },
  { key: 'heent',          label: 'HEENT',           placeholder: 'PERRL, MMM, no JVD...' },
  { key: 'musculoskeletal',label: 'MSK',             placeholder: 'Full ROM, no joint swelling...' },
]

export default function ExamScreen() {
  const { patient, setPatient, setResult } = usePatient()
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')

  const MSGS = [
    'Checking drug interactions (RxNorm)…',
    'Analyzing symptoms…',
    'Applying Bayesian clinical reasoning…',
    'Building differential diagnosis…',
    'Evaluating must-not-miss conditions…',
    'Calculating clinical scores…',
    'Generating SOAP note…',
    'Almost done…',
  ]

  function setVital<K extends keyof Vitals>(key: K, val: Vitals[K]) {
    setPatient(p => ({ ...p, vitals: { ...p.vitals, [key]: val } }))
  }

  function setExam(key: keyof PhysicalExam, val: string) {
    setPatient(p => ({ ...p, physical_exam: { ...p.physical_exam, [key]: val } }))
  }

  const v = patient.vitals
  const abnormal = {
    temp: v.temperature_f !== '' && (Number(v.temperature_f) > 100.4 || Number(v.temperature_f) < 96),
    hr:   v.heart_rate !== '' && (Number(v.heart_rate) > 100 || Number(v.heart_rate) < 60),
    rr:   v.respiratory_rate !== '' && (Number(v.respiratory_rate) > 20 || Number(v.respiratory_rate) < 12),
    o2:   v.o2_saturation !== '' && Number(v.o2_saturation) < 95,
  }

  async function handleDiagnose() {
    setLoading(true)
    let idx = 0
    setLoadingMsg(MSGS[0])
    const interval = setInterval(() => {
      idx = (idx + 1) % MSGS.length
      setLoadingMsg(MSGS[idx])
    }, 2000)

    try {
      const result = await getDiagnosis(patient)
      setResult(result)
      router.push('/results')
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Unknown error. Check your API key and internet.')
    } finally {
      clearInterval(interval)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <View style={s.loadingSpinner}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
        <Text style={s.loadingTitle}>{loadingMsg}</Text>
        <Text style={s.loadingSubtitle}>AI model analyzing clinical presentation</Text>
        <Text style={s.loadingHint}>This may take 15–45 seconds</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Vitals */}
        <SectionCard title="Vital Signs" icon="pulse">
          <View style={s.vitalsGrid}>
            <VitalField label="Temp (°F)" value={v.temperature_f ?? ''} unit="°F" placeholder="98.6" onChange={val => setVital('temperature_f', val)} abnormal={abnormal.temp} />
            <VitalField label="Heart Rate" value={v.heart_rate ?? ''} unit="bpm" placeholder="72" onChange={val => setVital('heart_rate', val)} abnormal={abnormal.hr} />
            <VitalField label="Resp Rate" value={v.respiratory_rate ?? ''} unit="/min" placeholder="16" onChange={val => setVital('respiratory_rate', val)} abnormal={abnormal.rr} />
            <VitalField label="SpO₂" value={v.o2_saturation ?? ''} unit="%" placeholder="98" onChange={val => setVital('o2_saturation', val)} abnormal={abnormal.o2} />
            <VitalField label="Pain" value={v.pain_scale ?? ''} unit="/10" placeholder="0" onChange={val => setVital('pain_scale', val)} />
          </View>

          {/* BP row */}
          <View style={s.bpRow}>
            <Text style={s.label}>Blood Pressure</Text>
            <View style={s.bpInputs}>
              <TextInput
                style={s.bpInput}
                keyboardType="number-pad"
                placeholder="120"
                placeholderTextColor={theme.colors.textMuted}
                value={v.bp_systolic === '' ? '' : String(v.bp_systolic ?? '')}
                onChangeText={val => setVital('bp_systolic', val === '' ? '' : Number(val))}
              />
              <Text style={s.bpSlash}>/</Text>
              <TextInput
                style={s.bpInput}
                keyboardType="number-pad"
                placeholder="80"
                placeholderTextColor={theme.colors.textMuted}
                value={v.bp_diastolic === '' ? '' : String(v.bp_diastolic ?? '')}
                onChangeText={val => setVital('bp_diastolic', val === '' ? '' : Number(val))}
              />
              <Text style={s.bpUnit}>mmHg</Text>
            </View>
          </View>

          <View style={s.row2}>
            <VitalField label="Weight (kg)" value={v.weight_kg ?? ''} unit="kg" placeholder="70" onChange={val => setVital('weight_kg', val)} />
            <VitalField label="GCS" value={v.gcs ?? ''} unit="/15" placeholder="15" onChange={val => setVital('gcs', val)} />
          </View>

          {Object.values(abnormal).some(Boolean) && (
            <View style={s.abnormalBanner}>
              <Ionicons name="warning" size={14} color={theme.colors.warning} />
              <Text style={s.abnormalTxt}>Abnormal vitals detected — flagged in analysis</Text>
            </View>
          )}
        </SectionCard>

        {/* Physical Exam */}
        <SectionCard title="Physical Examination" icon="stethoscope">
          {EXAM_FIELDS.map(({ key, label, placeholder }) => (
            <View key={key} style={s.examField}>
              <Text style={s.label}>{label}</Text>
              <TextInput
                style={[s.input, { height: 60 }]}
                multiline
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textMuted}
                value={patient.physical_exam?.[key] ?? ''}
                onChangeText={v => setExam(key, v)}
                textAlignVertical="top"
              />
            </View>
          ))}
        </SectionCard>

        {/* Labs & Imaging */}
        <SectionCard title="Labs & Imaging" icon="flask">
          <View style={s.examField}>
            <Text style={s.label}>Laboratory Results</Text>
            <TextInput
              style={[s.input, s.monoInput, { height: 100 }]}
              multiline
              placeholder={'WBC 14.2 (H), Hgb 13.1\nTroponin: 2.4 (H)\nBMP: Na 138, K 4.1, Cr 1.0'}
              placeholderTextColor={theme.colors.textMuted}
              value={patient.lab_results}
              onChangeText={v => setPatient(p => ({ ...p, lab_results: v }))}
              textAlignVertical="top"
            />
          </View>
          <View style={s.examField}>
            <Text style={s.label}>Imaging Results</Text>
            <TextInput
              style={[s.input, { height: 80 }]}
              multiline
              placeholder={'CXR: No acute process\nECG: ST elevation leads II, III, aVF'}
              placeholderTextColor={theme.colors.textMuted}
              value={patient.imaging_results}
              onChangeText={v => setPatient(p => ({ ...p, imaging_results: v }))}
              textAlignVertical="top"
            />
          </View>
          <View style={s.examField}>
            <Text style={s.label}>Additional Context</Text>
            <TextInput
              style={[s.input, { height: 60 }]}
              multiline
              placeholder="Travel, exposures, immunocompromised, pregnancy..."
              placeholderTextColor={theme.colors.textMuted}
              value={patient.additional_context}
              onChangeText={v => setPatient(p => ({ ...p, additional_context: v }))}
              textAlignVertical="top"
            />
          </View>
        </SectionCard>

        {/* Navigation */}
        <View style={s.navRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={18} color={theme.colors.text} />
            <Text style={s.backTxt}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.diagnoseBtn} onPress={handleDiagnose}>
            <Text style={s.diagnoseTxt}>🧠 Diagnose</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: theme.spacing.lg, paddingBottom: 40 },
  card: {
    backgroundColor: theme.colors.card, borderRadius: theme.radius.lg,
    borderWidth: 1, borderColor: theme.colors.border,
    padding: theme.spacing.lg, marginBottom: theme.spacing.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: theme.spacing.md },
  sectionTitle: {
    fontSize: theme.font.xs, fontWeight: '800', textTransform: 'uppercase',
    letterSpacing: 0.6, color: theme.colors.textSecondary,
  },
  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: theme.spacing.md },
  vitalField: { width: '47%' },
  label: {
    fontSize: theme.font.xs, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 0.5, color: theme.colors.textSecondary, marginBottom: 4,
  },
  vitalInput: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md,
    paddingHorizontal: 10, paddingVertical: 8, backgroundColor: theme.colors.card,
  },
  vitalAbnormal: { borderColor: theme.colors.warning, backgroundColor: '#FFFBEB' },
  vitalText: { flex: 1, fontSize: theme.font.sm, color: theme.colors.text },
  vitalUnit: { fontSize: 10, color: theme.colors.textMuted },
  bpRow: { marginBottom: theme.spacing.md },
  bpInputs: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bpInput: {
    flex: 1, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md,
    paddingHorizontal: 10, paddingVertical: 8, fontSize: theme.font.sm,
    color: theme.colors.text, textAlign: 'center',
  },
  bpSlash: { fontSize: theme.font.lg, color: theme.colors.textSecondary },
  bpUnit: { fontSize: 11, color: theme.colors.textMuted, width: 40 },
  row2: { flexDirection: 'row', gap: 8 },
  abnormalBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: theme.colors.warningLight, borderRadius: theme.radius.md,
    padding: theme.spacing.sm, marginTop: theme.spacing.sm,
  },
  abnormalTxt: { fontSize: theme.font.xs, color: theme.colors.warning, fontWeight: '600' },
  examField: { marginBottom: theme.spacing.md },
  input: {
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md,
    paddingHorizontal: 12, paddingVertical: 8, fontSize: theme.font.sm,
    color: theme.colors.text, backgroundColor: theme.colors.card,
  },
  monoInput: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12 },
  navRow: { flexDirection: 'row', gap: 12, marginTop: theme.spacing.sm },
  backBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.lg, paddingVertical: 14,
  },
  backTxt: { fontSize: theme.font.base, fontWeight: '600', color: theme.colors.text },
  diagnoseBtn: {
    flex: 2, backgroundColor: '#16A34A', borderRadius: theme.radius.lg,
    alignItems: 'center', justifyContent: 'center', paddingVertical: 16,
  },
  diagnoseTxt: { color: '#fff', fontSize: theme.font.md, fontWeight: '800' },
  loadingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40,
  },
  loadingSpinner: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  loadingTitle: {
    fontSize: theme.font.lg, fontWeight: '700', color: theme.colors.text,
    textAlign: 'center', marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: theme.font.sm, color: theme.colors.textSecondary, textAlign: 'center',
  },
  loadingHint: {
    fontSize: theme.font.xs, color: theme.colors.textMuted,
    textAlign: 'center', marginTop: 8,
  },
})
