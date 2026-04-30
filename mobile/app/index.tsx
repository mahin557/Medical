import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { usePatient } from '../context/PatientContext'
import { TagInput } from '../components/TagInput'
import { COMMON_PMH, COMMON_MEDICATIONS } from '../data/symptoms'
import type { Sex } from '../types/medical'
import { theme } from '../theme'

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.card}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  )
}

export default function PatientScreen() {
  const { patient, setPatient, resetAll } = usePatient()
  const [expanded, setExpanded] = useState<string[]>(['demographics', 'complaint'])

  function set<K extends keyof typeof patient>(key: K, val: typeof patient[K]) {
    setPatient(p => ({ ...p, [key]: val }))
  }

  function toggle(section: string) {
    setExpanded(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    )
  }

  const canContinue = patient.age !== '' && Number(patient.age) > 0 && patient.chief_complaint.trim().length > 2

  function CollapseCard({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    const open = expanded.includes(id)
    return (
      <View style={s.card}>
        <TouchableOpacity style={s.collapseHeader} onPress={() => toggle(id)}>
          <Text style={s.sectionTitle}>{title}</Text>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        {open && <View style={s.collapseBody}>{children}</View>}
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
        {/* Header */}
        <View style={s.header}>
          <View style={s.logoBox}>
            <Ionicons name="pulse" size={22} color="#fff" />
          </View>
          <View>
            <Text style={s.appName}>MedDx</Text>
            <Text style={s.appSub}>Clinical Diagnosis Assistant</Text>
          </View>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={resetAll} style={s.resetBtn}>
            <Text style={s.resetTxt}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Step indicator */}
        <View style={s.steps}>
          {['Patient', 'Symptoms', 'Exam', 'Diagnosis'].map((step, i) => (
            <React.Fragment key={step}>
              <View style={[s.stepDot, i === 0 && s.stepDotActive]}>
                <Text style={[s.stepNum, i === 0 && s.stepNumActive]}>{i + 1}</Text>
              </View>
              {i < 3 && <View style={[s.stepLine, i < 0 && s.stepLineActive]} />}
            </React.Fragment>
          ))}
        </View>

        {/* Demographics */}
        <SectionCard title="Demographics">
          <View style={s.row2}>
            <Field label="Age (years) *">
              <TextInput
                style={s.input}
                keyboardType="number-pad"
                placeholder="55"
                placeholderTextColor={theme.colors.textMuted}
                value={patient.age?.toString() ?? ''}
                onChangeText={v => set('age', v === '' ? '' : Number(v))}
              />
            </Field>
            <Field label="Sex *">
              <View style={s.sexRow}>
                {(['Male', 'Female', 'Other / Not specified'] as Sex[]).map(sex => (
                  <TouchableOpacity
                    key={sex}
                    style={[s.sexBtn, patient.sex === sex && s.sexBtnActive]}
                    onPress={() => set('sex', sex)}
                  >
                    <Text style={[s.sexTxt, patient.sex === sex && s.sexTxtActive]}>
                      {sex === 'Other / Not specified' ? 'Other' : sex}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>
          </View>
        </SectionCard>

        {/* Chief Complaint */}
        <SectionCard title="Chief Complaint *">
          <TextInput
            style={[s.input, s.textarea]}
            multiline
            numberOfLines={3}
            placeholder={'e.g. "55 yo male with sudden onset crushing chest pain radiating to left jaw, 9/10, with diaphoresis and nausea x 2 hours"'}
            placeholderTextColor={theme.colors.textMuted}
            value={patient.chief_complaint}
            onChangeText={v => set('chief_complaint', v)}
          />
        </SectionCard>

        {/* PMH */}
        <CollapseCard id="pmh" title="Medical & Surgical History">
          <TagInput
            label="Past Medical History"
            items={patient.past_medical_history}
            suggestions={COMMON_PMH}
            placeholder="Type condition or select..."
            onChange={v => set('past_medical_history', v)}
          />
          <TagInput
            label="Surgical History"
            items={patient.surgical_history}
            placeholder="e.g. Appendectomy 2015..."
            onChange={v => set('surgical_history', v)}
          />
        </CollapseCard>

        {/* Meds & Allergies */}
        <CollapseCard id="meds" title="Medications & Allergies">
          <TagInput
            label="Current Medications"
            items={patient.medications}
            suggestions={COMMON_MEDICATIONS}
            placeholder="e.g. Metformin 1000mg BID..."
            onChange={v => set('medications', v)}
          />
          <TagInput
            label="Allergies (drug + reaction)"
            items={patient.allergies}
            placeholder="e.g. Penicillin → anaphylaxis..."
            onChange={v => set('allergies', v)}
          />
        </CollapseCard>

        {/* Social & Family */}
        <CollapseCard id="social" title="Family & Social History">
          <TagInput
            label="Family History"
            items={patient.family_history}
            placeholder="e.g. Father: MI age 50..."
            onChange={v => set('family_history', v)}
          />
          <Field label="Social History">
            <TextInput
              style={[s.input, s.textarea]}
              multiline
              numberOfLines={3}
              placeholder="Tobacco, alcohol, occupation, living situation, drug use..."
              placeholderTextColor={theme.colors.textMuted}
              value={patient.social_history}
              onChangeText={v => set('social_history', v)}
            />
          </Field>
        </CollapseCard>

        {/* Next */}
        <TouchableOpacity
          style={[s.nextBtn, !canContinue && s.nextBtnDisabled]}
          onPress={() => router.push('/symptoms')}
          disabled={!canContinue}
        >
          <Text style={s.nextTxt}>Continue to Symptoms</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: theme.spacing.lg, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: theme.spacing.xl,
  },
  logoBox: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  appName: { fontSize: theme.font.lg, fontWeight: '800', color: theme.colors.text },
  appSub: { fontSize: theme.font.xs, color: theme.colors.textSecondary },
  resetBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md },
  resetTxt: { fontSize: theme.font.xs, color: theme.colors.textSecondary, fontWeight: '600' },
  steps: {
    flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xl,
  },
  stepDot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: theme.colors.borderLight, alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: theme.colors.primary },
  stepNum: { fontSize: 11, fontWeight: '700', color: theme.colors.textSecondary },
  stepNumActive: { color: '#fff' },
  stepLine: { flex: 1, height: 2, backgroundColor: theme.colors.borderLight },
  stepLineActive: { backgroundColor: theme.colors.primary },
  card: {
    backgroundColor: theme.colors.card, borderRadius: theme.radius.lg,
    borderWidth: 1, borderColor: theme.colors.border,
    padding: theme.spacing.lg, marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.font.xs, fontWeight: '800', textTransform: 'uppercase',
    letterSpacing: 0.6, color: theme.colors.textSecondary, marginBottom: theme.spacing.md,
  },
  collapseHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  collapseBody: { marginTop: theme.spacing.md },
  field: { marginBottom: theme.spacing.md },
  label: {
    fontSize: theme.font.xs, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 0.5, color: theme.colors.textSecondary, marginBottom: 6,
  },
  input: {
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: theme.font.sm, color: theme.colors.text, backgroundColor: theme.colors.card,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  row2: { gap: theme.spacing.md },
  sexRow: { flexDirection: 'row', gap: 8 },
  sexBtn: {
    flex: 1, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md,
    paddingVertical: 9, alignItems: 'center',
  },
  sexBtnActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  sexTxt: { fontSize: theme.font.xs, fontWeight: '600', color: theme.colors.textSecondary },
  sexTxtActive: { color: theme.colors.primary },
  nextBtn: {
    backgroundColor: theme.colors.primary, borderRadius: theme.radius.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, marginTop: theme.spacing.md,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextTxt: { color: '#fff', fontSize: theme.font.base, fontWeight: '700' },
})
