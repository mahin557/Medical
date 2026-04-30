import React, { useState, useId } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { usePatient } from '../context/PatientContext'
import { SymptomCard } from '../components/SymptomCard'
import { SYMPTOM_SYSTEMS, ALL_SYMPTOMS, ROS_PERTINENT_NEGATIVES } from '../data/symptoms'
import type { SymptomAttribute } from '../types/medical'
import { theme } from '../theme'

export default function SymptomsScreen() {
  const { patient, setPatient } = usePatient()
  const uid = useId()
  const [search, setSearch] = useState('')
  const [activeSystem, setActiveSystem] = useState<string | null>(null)
  const [customInput, setCustomInput] = useState('')

  const searchResults = search.length > 1
    ? ALL_SYMPTOMS.filter(s => s.toLowerCase().includes(search.toLowerCase())).slice(0, 10)
    : []

  const displaySymptoms = search.length > 1
    ? searchResults
    : activeSystem
    ? (SYMPTOM_SYSTEMS.find(s => s.key === activeSystem)?.symptoms ?? [])
    : []

  function addSymptom(name: string) {
    if (patient.symptoms.some(s => s.name === name)) return
    const sym: SymptomAttribute = { id: `${uid}-${Date.now()}`, name, severity: 5 }
    setPatient(p => ({ ...p, symptoms: [...p.symptoms, sym] }))
    setSearch('')
  }

  function addCustom() {
    const v = customInput.trim()
    if (v) { addSymptom(v); setCustomInput('') }
  }

  function updateSymptom(id: string, updated: SymptomAttribute) {
    setPatient(p => ({ ...p, symptoms: p.symptoms.map(s => s.id === id ? updated : s) }))
  }

  function removeSymptom(id: string) {
    setPatient(p => ({ ...p, symptoms: p.symptoms.filter(s => s.id !== id) }))
  }

  function toggleNegative(neg: string) {
    setPatient(p => {
      const negs = p.review_of_systems.pertinent_negatives
      const updated = negs.includes(neg) ? negs.filter(n => n !== neg) : [...negs, neg]
      return { ...p, review_of_systems: { ...p.review_of_systems, pertinent_negatives: updated } }
    })
  }

  const negatives = patient.review_of_systems.pertinent_negatives

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
        {/* Search */}
        <View style={s.searchBox}>
          <Ionicons name="search" size={16} color={theme.colors.textMuted} style={s.searchIcon} />
          <TextInput
            style={s.searchInput}
            placeholder="Search symptoms... (chest pain, dyspnea...)"
            placeholderTextColor={theme.colors.textMuted}
            value={search}
            onChangeText={v => { setSearch(v); setActiveSystem(null) }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* System chips */}
        {search.length === 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.systemRow}>
            {SYMPTOM_SYSTEMS.map(sys => (
              <TouchableOpacity
                key={sys.key}
                style={[s.sysChip, activeSystem === sys.key && s.sysChipActive]}
                onPress={() => setActiveSystem(activeSystem === sys.key ? null : sys.key)}
              >
                <Text style={s.sysEmoji}>{sys.emoji}</Text>
                <Text style={[s.sysLabel, activeSystem === sys.key && s.sysLabelActive]}>
                  {sys.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Symptom list to pick from */}
        {displaySymptoms.length > 0 && (
          <View style={s.card}>
            <Text style={s.sectionTitle}>
              {search.length > 1 ? `Results for "${search}"` : SYMPTOM_SYSTEMS.find(s => s.key === activeSystem)?.label}
            </Text>
            <View style={s.symGrid}>
              {displaySymptoms.map(sym => {
                const added = patient.symptoms.some(s => s.name === sym)
                return (
                  <TouchableOpacity
                    key={sym}
                    style={[s.symChip, added && s.symChipAdded]}
                    onPress={() => addSymptom(sym)}
                    disabled={added}
                  >
                    <Text style={[s.symChipTxt, added && s.symChipTxtAdded]}>
                      {added ? '✓ ' : '+ '}{sym}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )}

        {/* Custom */}
        <View style={s.customRow}>
          <TextInput
            style={s.customInput}
            placeholder="Custom symptom..."
            placeholderTextColor={theme.colors.textMuted}
            value={customInput}
            onChangeText={setCustomInput}
            onSubmitEditing={addCustom}
            returnKeyType="done"
          />
          <TouchableOpacity style={s.customBtn} onPress={addCustom}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={s.customBtnTxt}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Added symptoms */}
        {patient.symptoms.length > 0 ? (
          <View>
            <Text style={s.sectionLabel}>
              {patient.symptoms.length} Symptom{patient.symptoms.length !== 1 ? 's' : ''} Added
            </Text>
            {patient.symptoms.map(sym => (
              <SymptomCard
                key={sym.id}
                symptom={sym}
                onUpdate={updated => updateSymptom(sym.id, updated)}
                onRemove={() => removeSymptom(sym.id)}
              />
            ))}
          </View>
        ) : (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🩺</Text>
            <Text style={s.emptyTxt}>No symptoms added. Search above or browse by system.</Text>
          </View>
        )}

        {/* Pertinent Negatives */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Pertinent Negatives (ROS)</Text>
          <Text style={s.hint}>Check negative findings — helps exclude diagnoses</Text>
          <View style={s.negGrid}>
            {ROS_PERTINENT_NEGATIVES.map(neg => (
              <TouchableOpacity
                key={neg}
                style={[s.negChip, negatives.includes(neg) && s.negChipActive]}
                onPress={() => toggleNegative(neg)}
              >
                <Text style={[s.negChipTxt, negatives.includes(neg) && s.negChipTxtActive]}>
                  {negatives.includes(neg) ? '✓ ' : ''}{neg}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Navigation */}
        <View style={s.navRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={18} color={theme.colors.text} />
            <Text style={s.backTxt}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.nextBtn} onPress={() => router.push('/exam')}>
            <Text style={s.nextTxt}>Exam & Labs</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: theme.spacing.lg, paddingBottom: 40 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.lg, paddingHorizontal: 12, paddingVertical: 10,
    gap: 8, marginBottom: theme.spacing.md,
  },
  searchIcon: {},
  searchInput: { flex: 1, fontSize: theme.font.sm, color: theme.colors.text },
  systemRow: { marginBottom: theme.spacing.md },
  sysChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.full,
    paddingHorizontal: 12, paddingVertical: 6, marginRight: 8,
    backgroundColor: theme.colors.card,
  },
  sysChipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  sysEmoji: { fontSize: 14 },
  sysLabel: { fontSize: theme.font.xs, fontWeight: '600', color: theme.colors.textSecondary },
  sysLabelActive: { color: theme.colors.primary },
  card: {
    backgroundColor: theme.colors.card, borderRadius: theme.radius.lg,
    borderWidth: 1, borderColor: theme.colors.border,
    padding: theme.spacing.lg, marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.font.xs, fontWeight: '800', textTransform: 'uppercase',
    letterSpacing: 0.6, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm,
  },
  symGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  symChip: {
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.full,
    paddingHorizontal: 10, paddingVertical: 5, backgroundColor: theme.colors.card,
  },
  symChipAdded: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  symChipTxt: { fontSize: theme.font.xs, color: theme.colors.textSecondary, fontWeight: '500' },
  symChipTxtAdded: { color: theme.colors.primary, fontWeight: '700' },
  customRow: {
    flexDirection: 'row', gap: 8, marginBottom: theme.spacing.md,
  },
  customInput: {
    flex: 1, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: theme.font.sm,
    color: theme.colors.text, backgroundColor: theme.colors.card,
  },
  customBtn: {
    backgroundColor: theme.colors.primary, borderRadius: theme.radius.md,
    flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14,
  },
  customBtnTxt: { color: '#fff', fontWeight: '700', fontSize: theme.font.sm },
  sectionLabel: {
    fontSize: theme.font.sm, fontWeight: '700', color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  empty: {
    alignItems: 'center', padding: theme.spacing.xxl,
    borderWidth: 2, borderStyle: 'dashed', borderColor: theme.colors.border,
    borderRadius: theme.radius.lg, marginBottom: theme.spacing.md,
  },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyTxt: { fontSize: theme.font.sm, color: theme.colors.textSecondary, textAlign: 'center' },
  hint: { fontSize: theme.font.xs, color: theme.colors.textMuted, marginBottom: theme.spacing.sm },
  negGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  negChip: {
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.full,
    paddingHorizontal: 10, paddingVertical: 5, backgroundColor: theme.colors.card,
  },
  negChipActive: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  negChipTxt: { fontSize: theme.font.xs, color: theme.colors.textSecondary, fontWeight: '500' },
  negChipTxtActive: { color: '#16A34A', fontWeight: '700' },
  navRow: { flexDirection: 'row', gap: 12, marginTop: theme.spacing.md },
  backBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.lg,
    paddingVertical: 14,
  },
  backTxt: { fontSize: theme.font.base, fontWeight: '600', color: theme.colors.text },
  nextBtn: {
    flex: 2, backgroundColor: theme.colors.primary, borderRadius: theme.radius.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14,
  },
  nextTxt: { color: '#fff', fontSize: theme.font.base, fontWeight: '700' },
})
