import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, FlatList,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../theme'

interface Props {
  label: string
  items: string[]
  suggestions?: string[]
  placeholder: string
  onChange: (items: string[]) => void
}

export function TagInput({ label, items, suggestions, placeholder, onChange }: Props) {
  const [input, setInput] = useState('')
  const [showSug, setShowSug] = useState(false)

  const filtered = (suggestions ?? [])
    .filter(s => s.toLowerCase().includes(input.toLowerCase()) && !items.includes(s))
    .slice(0, 6)

  function add(val: string) {
    const v = val.trim()
    if (v && !items.includes(v)) onChange([...items, v])
    setInput('')
    setShowSug(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {items.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagRow}>
          {items.map(item => (
            <View key={item} style={styles.tag}>
              <Text style={styles.tagText}>{item}</Text>
              <TouchableOpacity onPress={() => onChange(items.filter(i => i !== item))}>
                <Ionicons name="close" size={12} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={input}
          onChangeText={t => { setInput(t); setShowSug(true) }}
          onFocus={() => setShowSug(true)}
          onSubmitEditing={() => add(input)}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => add(input)}>
          <Ionicons name="add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {showSug && filtered.length > 0 && (
        <View style={styles.suggestions}>
          <FlatList
            data={filtered}
            keyExtractor={item => item}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.sugItem}
                onPress={() => add(item)}
              >
                <Text style={styles.sugText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginBottom: theme.spacing.lg },
  label: {
    fontSize: theme.font.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  tagRow: { flexDirection: 'row', marginBottom: theme.spacing.sm },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
  },
  tagText: { fontSize: theme.font.xs, color: theme.colors.primary, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: theme.font.sm,
    color: theme.colors.text,
    backgroundColor: theme.colors.card,
  },
  addBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    width: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestions: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    overflow: 'hidden',
  },
  sugItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  sugText: { fontSize: theme.font.sm, color: theme.colors.text },
})
