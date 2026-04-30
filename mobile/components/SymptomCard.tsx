import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, TextInput, Modal,
  ScrollView, StyleSheet, Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { SymptomAttribute } from '../types/medical'
import { theme } from '../theme'

const ONSET_OPTIONS = [
  'Sudden (seconds–minutes)', 'Acute (hours)',
  'Subacute (days–weeks)', 'Chronic (months+)',
]
const TIMING_OPTIONS = [
  'Constant', 'Intermittent', 'Progressive', 'Episodic', 'Cyclical',
]
const CHARACTERS = [
  'Sharp', 'Dull', 'Burning', 'Stabbing', 'Pressure', 'Crushing',
  'Throbbing', 'Aching', 'Cramping', 'Tearing', 'Colicky',
]

interface Props {
  symptom: SymptomAttribute
  onUpdate: (s: SymptomAttribute) => void
  onRemove: () => void
}

function SelectChips({
  options, value, onSelect,
}: { options: string[]; value: string | undefined; onSelect: (v: string) => void }) {
  return (
    <View style={styles.chips}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[styles.chip, value === opt && styles.chipActive]}
          onPress={() => onSelect(opt)}
        >
          <Text style={[styles.chipText, value === opt && styles.chipTextActive]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

export function SymptomCard({ symptom, onUpdate, onRemove }: Props) {
  const [modalVisible, setModalVisible] = useState(false)

  function update<K extends keyof SymptomAttribute>(key: K, val: SymptomAttribute[K]) {
    onUpdate({ ...symptom, [key]: val })
  }

  const sev = symptom.severity ?? 5
  const sevColor = sev >= 8 ? theme.colors.danger : sev >= 5 ? theme.colors.warning : theme.colors.success

  return (
    <>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.sevBadge, { backgroundColor: sevColor + '20' }]}>
            <Text style={[styles.sevText, { color: sevColor }]}>{sev}</Text>
          </View>
          <Text style={styles.name}>{symptom.name}</Text>
          {symptom.duration ? <Text style={styles.meta}>· {symptom.duration}</Text> : null}
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
            <Ionicons name="close" size={16} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Quick summary */}
        {(symptom.character || symptom.location || symptom.onset) ? (
          <View style={styles.summary}>
            {symptom.character && <Text style={styles.summaryText}>{symptom.character}</Text>}
            {symptom.location && <Text style={styles.summaryText}>@ {symptom.location}</Text>}
            {symptom.onset && <Text style={styles.summaryText}>{symptom.onset}</Text>}
          </View>
        ) : (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.tapToAdd}>Tap edit to add OPQRST details →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* OPQRST Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{symptom.name}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseTxt}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Severity */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Severity: {sev}/10</Text>
              <View style={styles.sliderRow}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.sliderDot, n <= sev && { backgroundColor: sevColor }]}
                    onPress={() => update('severity', n)}
                  />
                ))}
              </View>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>Mild</Text>
                <Text style={styles.sliderLabelText}>Moderate</Text>
                <Text style={styles.sliderLabelText}>Severe</Text>
              </View>
            </View>

            {/* Onset */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Onset</Text>
              <SelectChips options={ONSET_OPTIONS} value={symptom.onset} onSelect={v => update('onset', v)} />
            </View>

            {/* Duration */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Duration</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 2 hours, 3 days, 4 weeks"
                placeholderTextColor={theme.colors.textMuted}
                value={symptom.duration ?? ''}
                onChangeText={v => update('duration', v)}
              />
            </View>

            {/* Timing */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Timing Pattern</Text>
              <SelectChips options={TIMING_OPTIONS} value={symptom.timing} onSelect={v => update('timing', v)} />
            </View>

            {/* Character */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Character / Quality</Text>
              <SelectChips options={CHARACTERS} value={symptom.character} onSelect={v => update('character', v)} />
              <TextInput
                style={[styles.textInput, { marginTop: 8 }]}
                placeholder="Or describe in own words..."
                placeholderTextColor={theme.colors.textMuted}
                value={symptom.character ?? ''}
                onChangeText={v => update('character', v)}
              />
            </View>

            {/* Location */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Location</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Left chest, RLQ abdomen, occipital"
                placeholderTextColor={theme.colors.textMuted}
                value={symptom.location ?? ''}
                onChangeText={v => update('location', v)}
              />
            </View>

            {/* Radiation */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Radiation / Spread</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Radiates to left jaw and arm"
                placeholderTextColor={theme.colors.textMuted}
                value={symptom.radiation ?? ''}
                onChangeText={v => update('radiation', v)}
              />
            </View>

            {/* Aggravating */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Aggravating Factors</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. exertion, eating, lying flat"
                placeholderTextColor={theme.colors.textMuted}
                value={symptom.aggravating_factors ?? ''}
                onChangeText={v => update('aggravating_factors', v)}
              />
            </View>

            {/* Relieving */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Relieving Factors</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. rest, nitroglycerin, antacids"
                placeholderTextColor={theme.colors.textMuted}
                value={symptom.relieving_factors ?? ''}
                onChangeText={v => update('relieving_factors', v)}
              />
            </View>

            {/* Associated */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Associated Symptoms</Text>
              <TextInput
                style={[styles.textInput, { height: 70 }]}
                placeholder="e.g. nausea, diaphoresis, dyspnea, fever"
                placeholderTextColor={theme.colors.textMuted}
                value={symptom.associated_symptoms ?? ''}
                onChangeText={v => update('associated_symptoms', v)}
                multiline
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sevBadge: {
    width: 28, height: 28, borderRadius: theme.radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  sevText: { fontSize: theme.font.xs, fontWeight: '800' },
  name: { fontSize: theme.font.base, fontWeight: '700', color: theme.colors.text, flex: 1 },
  meta: { fontSize: theme.font.xs, color: theme.colors.textSecondary },
  editBtn: { padding: 4 },
  removeBtn: { padding: 4 },
  summary: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  summaryText: {
    fontSize: theme.font.xs, color: theme.colors.textSecondary,
    backgroundColor: theme.colors.background, borderRadius: theme.radius.sm,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  tapToAdd: { fontSize: theme.font.xs, color: theme.colors.primary, marginTop: 6 },

  // Modal
  modalContainer: { flex: 1, backgroundColor: theme.colors.background },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  modalTitle: { fontSize: theme.font.lg, fontWeight: '800', color: theme.colors.text },
  modalClose: { padding: 4 },
  modalCloseTxt: { fontSize: theme.font.base, color: theme.colors.primary, fontWeight: '700' },
  modalScroll: { flex: 1, padding: theme.spacing.lg },
  field: { marginBottom: theme.spacing.xl },
  fieldLabel: {
    fontSize: theme.font.xs, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 0.5, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm,
  },
  textInput: {
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: theme.font.sm,
    color: theme.colors.text, backgroundColor: theme.colors.card,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.full,
    paddingHorizontal: 10, paddingVertical: 5, backgroundColor: theme.colors.card,
  },
  chipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  chipText: { fontSize: theme.font.xs, color: theme.colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: theme.colors.primary, fontWeight: '700' },
  sliderRow: { flexDirection: 'row', gap: 4, marginTop: 4 },
  sliderDot: {
    flex: 1, height: 10, borderRadius: 5,
    backgroundColor: theme.colors.borderLight, borderWidth: 1, borderColor: theme.colors.border,
  },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  sliderLabelText: { fontSize: 10, color: theme.colors.textMuted },
})
