import React, { useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Share, Alert, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { usePatient } from '../context/PatientContext'
import type { DiagnosisEntry, RiskLevel } from '../types/medical'
import { theme } from '../theme'

function ProbBar({ pct, level }: { pct: number; level: string }) {
  const color = level === 'High' ? theme.colors.primary
    : level === 'Moderate' ? theme.colors.warning
    : theme.colors.textMuted
  return (
    <View style={pb.row}>
      <View style={pb.track}>
        <View style={[pb.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[pb.pct, { color }]}>{pct}%</Text>
    </View>
  )
}
const pb = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  track: { flex: 1, height: 5, borderRadius: 3, backgroundColor: theme.colors.borderLight, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: 3 },
  pct:   { fontSize: 11, fontWeight: '700', width: 32, textAlign: 'right' },
})

function DiagCard({ entry }: { entry: DiagnosisEntry }) {
  const [expanded, setExpanded] = useState(entry.rank <= 3)

  const isEmergency = entry.emergency
  const isMustRule  = entry.must_rule_out && !entry.emergency
  const borderColor = isEmergency ? theme.colors.danger
    : isMustRule ? theme.colors.warning
    : theme.colors.border

  const rankBg    = entry.rank === 1 ? theme.colors.primary
    : entry.rank <= 3 ? theme.colors.primaryDark
    : theme.colors.borderLight
  const rankColor = entry.rank <= 3 ? '#fff' : theme.colors.textSecondary

  const probBg    = entry.probability === 'High'     ? theme.colors.primaryLight
    : entry.probability === 'Moderate' ? theme.colors.warningLight
    : theme.colors.borderLight
  const probColor = entry.probability === 'High'     ? theme.colors.primary
    : entry.probability === 'Moderate' ? theme.colors.warning
    : theme.colors.textSecondary

  return (
    <View style={[dc.card, { borderColor }]}>
      <TouchableOpacity style={dc.header} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
        <View style={[dc.rank, { backgroundColor: rankBg }]}>
          <Text style={[dc.rankTxt, { color: rankColor }]}>{entry.rank}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={dc.name} numberOfLines={2}>{entry.name}</Text>
          <View style={dc.badges}>
            {isEmergency && (
              <View style={[dc.badge, { backgroundColor: '#FEF2F2' }]}>
                <Text style={[dc.badgeTxt, { color: theme.colors.danger }]}>🚨 EMERGENCY</Text>
              </View>
            )}
            {isMustRule && (
              <View style={[dc.badge, { backgroundColor: theme.colors.warningLight }]}>
                <Text style={[dc.badgeTxt, { color: theme.colors.warning }]}>⚠️ Must Rule Out</Text>
              </View>
            )}
            <View style={[dc.badge, { backgroundColor: probBg }]}>
              <Text style={[dc.badgeTxt, { color: probColor }]}>{entry.probability}</Text>
            </View>
            {entry.icd10_code && (
              <Text style={dc.icd}>{entry.icd10_code}</Text>
            )}
          </View>
          {entry.confidence_percent !== undefined && (
            <ProbBar pct={entry.confidence_percent} level={entry.probability} />
          )}
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14} color={theme.colors.textMuted}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={dc.body}>
          {/* Pathophysiology */}
          {!!entry.pathophysiology && (
            <View style={dc.pathoBox}>
              <Text style={dc.pathoLabel}>MECHANISM</Text>
              <Text style={dc.pathoTxt}>{entry.pathophysiology}</Text>
            </View>
          )}

          {entry.supporting_evidence.length > 0 && (
            <View style={dc.evidenceSection}>
              <Text style={dc.evidenceTitle}>✓ Supporting</Text>
              {entry.supporting_evidence.map((e, i) => (
                <Text key={i} style={dc.evidenceTxt}>• {e}</Text>
              ))}
            </View>
          )}

          {entry.against_evidence.length > 0 && (
            <View style={dc.evidenceSection}>
              <Text style={[dc.evidenceTitle, { color: theme.colors.danger }]}>✗ Against</Text>
              {entry.against_evidence.map((e, i) => (
                <Text key={i} style={[dc.evidenceTxt, { color: theme.colors.textSecondary }]}>• {e}</Text>
              ))}
            </View>
          )}

          {/* Key differentiators */}
          {!!entry.key_differentiators?.length && (
            <View style={dc.evidenceSection}>
              <Text style={[dc.evidenceTitle, { color: theme.colors.purple }]}>🔍 Would Confirm</Text>
              {entry.key_differentiators.map((d, i) => (
                <Text key={i} style={[dc.evidenceTxt, { color: theme.colors.purple }]}>• {d}</Text>
              ))}
            </View>
          )}

          {/* Clinical score */}
          {!!entry.clinical_score && (
            <View style={dc.scoreBox}>
              <Text style={dc.scoreLabel}>📊 {entry.clinical_score}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}
const dc = StyleSheet.create({
  card: {
    borderWidth: 1.5, borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card, marginBottom: 10, overflow: 'hidden',
  },
  header:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14 },
  rank: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  rankTxt: { fontSize: 12, fontWeight: '800' },
  name:    { fontSize: theme.font.sm, fontWeight: '700', color: theme.colors.text },
  badges:  { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  badge:   { borderRadius: theme.radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  badgeTxt:{ fontSize: 10, fontWeight: '700' },
  icd:     { fontSize: 10, color: theme.colors.textMuted, fontFamily: 'monospace', paddingHorizontal: 4, paddingVertical: 3 },
  body: {
    borderTopWidth: 1, borderTopColor: theme.colors.borderLight,
    padding: 14, gap: 10,
  },
  pathoBox: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md, padding: 10,
  },
  pathoLabel: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, color: theme.colors.primary, marginBottom: 4 },
  pathoTxt:   { fontSize: theme.font.xs, color: theme.colors.primary, lineHeight: 17, fontStyle: 'italic' },
  evidenceSection: { gap: 4 },
  evidenceTitle:   { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', color: theme.colors.success, marginBottom: 2 },
  evidenceTxt:     { fontSize: theme.font.xs, color: theme.colors.text, lineHeight: 18 },
  scoreBox: {
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.radius.md, padding: 8,
  },
  scoreLabel: { fontSize: theme.font.xs, color: theme.colors.textSecondary, fontWeight: '600' },
})

function CollapsibleSection({
  title, icon, children, defaultOpen = true, accent,
}: {
  title: string; icon: string; children: React.ReactNode
  defaultOpen?: boolean; accent?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <View style={cs.card}>
      <TouchableOpacity style={cs.header} onPress={() => setOpen(!open)} activeOpacity={0.7}>
        <Ionicons name={icon as 'pulse'} size={16} color={accent ?? theme.colors.primary} />
        <Text style={[cs.title, accent ? { color: accent } : {}]}>{title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={theme.colors.textMuted} />
      </TouchableOpacity>
      {open && <View style={cs.body}>{children}</View>}
    </View>
  )
}
const cs = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card, borderRadius: theme.radius.lg,
    borderWidth: 1, borderColor: theme.colors.border,
    marginBottom: theme.spacing.md, overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: theme.spacing.lg,
  },
  title: { flex: 1, fontSize: theme.font.sm, fontWeight: '700', color: theme.colors.text },
  body:  { padding: theme.spacing.lg, borderTopWidth: 1, borderTopColor: theme.colors.borderLight },
})

function RiskBadge({ level }: { level: RiskLevel }) {
  const map: Record<RiskLevel, { bg: string; color: string; label: string }> = {
    CRITICAL: { bg: '#FEF2F2', color: theme.colors.danger,  label: '🔴 CRITICAL' },
    HIGH:     { bg: '#FFF7ED', color: '#EA580C',            label: '🟠 HIGH RISK' },
    MODERATE: { bg: theme.colors.warningLight, color: theme.colors.warning, label: '🟡 MODERATE' },
    LOW:      { bg: '#F0FDF4', color: '#16A34A',            label: '🟢 LOW RISK' },
  }
  const { bg, color, label } = map[level] ?? map.MODERATE
  return (
    <View style={[rb.badge, { backgroundColor: bg }]}>
      <Text style={[rb.txt, { color }]}>{label}</Text>
    </View>
  )
}
const rb = StyleSheet.create({
  badge: { borderRadius: theme.radius.full, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start' },
  txt:   { fontSize: 11, fontWeight: '800' },
})

export default function ResultsScreen() {
  const { result, resetAll } = usePatient()

  useEffect(() => {
    if (!result) router.replace('/')
  }, [result])

  if (!result) return null

  const levelColor = result.emergency_level === 'EMERGENCY' ? theme.colors.danger
    : result.emergency_level === 'URGENT' ? theme.colors.warning
    : theme.colors.success

  const levelIcon = result.emergency_level === 'EMERGENCY' ? '🚨'
    : result.emergency_level === 'URGENT' ? '⚠️' : '✅'

  async function copySOAP() {
    await Clipboard.setStringAsync(result!.soap_note)
    Alert.alert('Copied', 'SOAP note copied to clipboard.')
  }

  async function shareSOAP() {
    await Share.share({ message: result!.soap_note, title: 'SOAP Note — MedDx' })
  }

  function WorkupItem({ items, label }: { items: string[]; label: string }) {
    if (!items?.length) return null
    return (
      <View style={wu.section}>
        <Text style={wu.label}>{label}</Text>
        {items.map((item, i) => <Text key={i} style={wu.item}>• {item}</Text>)}
      </View>
    )
  }

  const hasVerifiedInteractions = result.verified_drug_interactions?.length ?? 0 > 0
  const allDrugInteractions = [
    ...(result.verified_drug_interactions ?? []),
    ...(result.drug_interactions ?? []).filter(d =>
      !(result.verified_drug_interactions ?? []).some(v => v.includes(d.split(':')[0]))
    ),
  ]

  return (
    <ScrollView style={r.scroll} contentContainerStyle={r.content}>
      {/* Emergency banner */}
      <View style={[r.emergencyBanner, { backgroundColor: levelColor }]}>
        <Text style={r.emergencyIcon}>{levelIcon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={r.emergencyLevel}>{result.emergency_level}</Text>
          {result.workup?.immediate?.length > 0 && (
            <Text style={r.emergencyImmediate} numberOfLines={2}>
              {result.workup.immediate.join(' · ')}
            </Text>
          )}
        </View>
      </View>

      {/* Risk + Disposition row */}
      <View style={r.metaRow}>
        {result.risk_stratification && (
          <RiskBadge level={result.risk_stratification} />
        )}
        {result.disposition && (
          <View style={r.dispositionChip}>
            <Ionicons name="location" size={12} color={theme.colors.textSecondary} />
            <Text style={r.dispositionTxt}>{result.disposition}</Text>
          </View>
        )}
      </View>

      <Text style={r.mostLikely}>
        Most likely: <Text style={{ fontWeight: '800' }}>{result.most_likely_diagnosis}</Text>
      </Text>

      {/* Red flags */}
      {result.red_flags?.length > 0 && (
        <View style={r.redFlags}>
          <View style={r.redFlagsHeader}>
            <Ionicons name="warning" size={16} color={theme.colors.danger} />
            <Text style={r.redFlagsTitle}>Red Flags</Text>
          </View>
          {result.red_flags.map((f, i) => (
            <Text key={i} style={r.redFlag}>🔴 {f}</Text>
          ))}
        </View>
      )}

      {/* Drug interactions — verified ones badged */}
      {allDrugInteractions.length > 0 && (
        <View style={r.drugCard}>
          <View style={r.drugHeader}>
            <Ionicons name="medkit" size={16} color={theme.colors.purple} />
            <Text style={r.drugTitle}>Medication Interactions</Text>
            {hasVerifiedInteractions && (
              <View style={r.verifiedBadge}>
                <Text style={r.verifiedTxt}>✓ RxNorm Verified</Text>
              </View>
            )}
          </View>
          {(result.verified_drug_interactions ?? []).map((d, i) => (
            <View key={`v-${i}`} style={r.drugItemRow}>
              <View style={r.verifiedDot} />
              <Text style={[r.drugItem, { flex: 1 }]}>{d}</Text>
            </View>
          ))}
          {(result.drug_interactions ?? []).map((d, i) => (
            <Text key={`ai-${i}`} style={r.drugItem}>• {d}</Text>
          ))}
        </View>
      )}

      {/* Differential */}
      <CollapsibleSection title="Differential Diagnosis" icon="search">
        {result.differential_diagnosis?.map(entry => (
          <DiagCard key={entry.rank} entry={entry} />
        ))}
      </CollapsibleSection>

      {/* Workup */}
      <CollapsibleSection title="Recommended Workup" icon="flask">
        {result.workup?.immediate?.length > 0 && (
          <View style={wu.immediateBox}>
            <Text style={wu.immediateTitle}>IMMEDIATE INTERVENTIONS</Text>
            {result.workup.immediate.map((item, i) => (
              <Text key={i} style={wu.immediateItem}>→ {item}</Text>
            ))}
          </View>
        )}
        <WorkupItem items={result.workup?.labs}        label="🧪 Laboratory" />
        <WorkupItem items={result.workup?.imaging}     label="🔬 Imaging" />
        <WorkupItem items={result.workup?.other_tests} label="📋 Other Tests" />
        <WorkupItem items={result.workup?.referrals}   label="👨‍⚕️ Referrals" />
      </CollapsibleSection>

      {/* Treatment */}
      {result.treatment_considerations?.length > 0 && (
        <CollapsibleSection title="Treatment Considerations" icon="heart">
          {result.treatment_considerations.map((t, i) => (
            <Text key={i} style={r.treatItem}>{i + 1}. {t}</Text>
          ))}
        </CollapsibleSection>
      )}

      {/* Clinical Pearls */}
      {result.clinical_pearls?.length > 0 && (
        <CollapsibleSection title="Clinical Pearls" icon="bulb" defaultOpen={false}>
          {result.clinical_pearls.map((p, i) => (
            <Text key={i} style={r.pearlItem}>💡 {p}</Text>
          ))}
        </CollapsibleSection>
      )}

      {/* SOAP Note */}
      <CollapsibleSection title="SOAP Note" icon="document-text" defaultOpen={false}>
        <View style={r.soapActions}>
          <TouchableOpacity style={r.soapBtn} onPress={copySOAP}>
            <Ionicons name="copy-outline" size={14} color={theme.colors.primary} />
            <Text style={r.soapBtnTxt}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={r.soapBtn} onPress={shareSOAP}>
            <Ionicons name="share-outline" size={14} color={theme.colors.primary} />
            <Text style={r.soapBtnTxt}>Share</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal style={r.soapScroll}>
          <Text style={r.soapText}>{result.soap_note}</Text>
        </ScrollView>
      </CollapsibleSection>

      {/* Clinical Reasoning Chain */}
      {!!result.reasoning_chain && (
        <CollapsibleSection title="Clinical Reasoning" icon="git-branch" defaultOpen={false}>
          <Text style={r.reasoningTxt}>{result.reasoning_chain}</Text>
        </CollapsibleSection>
      )}

      {/* Disclaimer */}
      <Text style={r.disclaimer}>⚕️ {result.disclaimer}</Text>

      {/* New case */}
      <TouchableOpacity style={r.newCaseBtn} onPress={() => { resetAll(); router.replace('/') }}>
        <Ionicons name="add-circle-outline" size={18} color={theme.colors.primary} />
        <Text style={r.newCaseTxt}>New Case</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const wu = StyleSheet.create({
  immediateBox: {
    backgroundColor: '#FEF2F2', borderRadius: theme.radius.md,
    padding: 12, marginBottom: 12,
  },
  immediateTitle: { fontSize: 10, fontWeight: '800', color: theme.colors.danger, marginBottom: 6 },
  immediateItem:  { fontSize: theme.font.sm, color: theme.colors.danger, fontWeight: '600', marginBottom: 2 },
  section: { marginBottom: 12 },
  label:   { fontSize: 11, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 4 },
  item:    { fontSize: theme.font.xs, color: theme.colors.text, lineHeight: 18 },
})

const r = StyleSheet.create({
  scroll:   { flex: 1 },
  content:  { padding: theme.spacing.lg, paddingBottom: 50 },
  emergencyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: theme.radius.xl, padding: theme.spacing.lg, marginBottom: theme.spacing.sm,
  },
  emergencyIcon:      { fontSize: 28 },
  emergencyLevel:     { fontSize: theme.font.xl, fontWeight: '900', color: '#fff' },
  emergencyImmediate: { fontSize: theme.font.xs, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  metaRow: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
    gap: 8, marginBottom: theme.spacing.md,
  },
  dispositionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.full, paddingHorizontal: 10, paddingVertical: 5,
  },
  dispositionTxt: { fontSize: 11, fontWeight: '600', color: theme.colors.textSecondary },
  mostLikely: {
    fontSize: theme.font.base, color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  redFlags: {
    borderWidth: 1.5, borderColor: theme.colors.danger + '60',
    backgroundColor: theme.colors.dangerLight,
    borderRadius: theme.radius.lg, padding: theme.spacing.lg, marginBottom: theme.spacing.md,
  },
  redFlagsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  redFlagsTitle:  { fontSize: theme.font.sm, fontWeight: '800', color: theme.colors.danger },
  redFlag:        { fontSize: theme.font.sm, color: theme.colors.danger, marginBottom: 4 },
  drugCard: {
    borderWidth: 1, borderColor: theme.colors.purple + '40',
    backgroundColor: theme.colors.purpleLight,
    borderRadius: theme.radius.lg, padding: theme.spacing.lg, marginBottom: theme.spacing.md,
  },
  drugHeader:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  drugTitle:    { fontSize: theme.font.sm, fontWeight: '700', color: theme.colors.purple, flex: 1 },
  verifiedBadge:{
    backgroundColor: '#D1FAE5', borderRadius: theme.radius.full,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  verifiedTxt:  { fontSize: 9, fontWeight: '800', color: '#065F46' },
  drugItemRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 4 },
  verifiedDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginTop: 6, flexShrink: 0 },
  drugItem:     { fontSize: theme.font.sm, color: theme.colors.purple, marginBottom: 3 },
  treatItem:    { fontSize: theme.font.sm, color: theme.colors.text, marginBottom: 6, lineHeight: 20 },
  pearlItem:    { fontSize: theme.font.sm, color: theme.colors.text, marginBottom: 8, lineHeight: 20 },
  soapActions:  { flexDirection: 'row', gap: 8, marginBottom: 12 },
  soapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.md, paddingHorizontal: 12, paddingVertical: 7,
  },
  soapBtnTxt: { fontSize: theme.font.xs, fontWeight: '600', color: theme.colors.primary },
  soapScroll: { maxHeight: 300 },
  soapText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11, color: theme.colors.text, lineHeight: 18,
  },
  reasoningTxt: {
    fontSize: theme.font.xs, color: theme.colors.textSecondary,
    lineHeight: 19, fontStyle: 'italic',
  },
  disclaimer: {
    fontSize: theme.font.xs, color: theme.colors.textMuted,
    textAlign: 'center', marginBottom: theme.spacing.lg, lineHeight: 16,
  },
  newCaseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1.5, borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg, paddingVertical: 14,
  },
  newCaseTxt: { fontSize: theme.font.base, fontWeight: '700', color: theme.colors.primary },
})
