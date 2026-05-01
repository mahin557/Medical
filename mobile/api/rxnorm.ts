const RXNORM_BASE = 'https://rxnav.nlm.nih.gov/REST'

function withTimeout(ms: number): AbortSignal {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), ms)
  return controller.signal
}

async function getRxCUI(drugName: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${RXNORM_BASE}/rxcui.json?name=${encodeURIComponent(drugName)}&search=1`,
      { signal: withTimeout(5000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.idGroup?.rxnormId?.[0] ?? null
  } catch {
    return null
  }
}

export interface RxInteraction {
  drugs: string
  severity: string
  description: string
}

export async function checkDrugInteractions(medications: string[]): Promise<RxInteraction[]> {
  if (medications.length < 2) return []

  const cuiResults = await Promise.all(
    medications.slice(0, 10).map(med => getRxCUI(med))
  )
  const cuis = cuiResults.filter((c): c is string => c !== null)

  if (cuis.length < 2) return []

  try {
    const res = await fetch(
      `${RXNORM_BASE}/interaction/list.json?rxcuis=${cuis.join('+')}`,
      { signal: withTimeout(8000) }
    )
    if (!res.ok) return []
    const data = await res.json()

    const interactions: RxInteraction[] = []
    const groups: any[] = data?.fullInteractionTypeGroup ?? []

    for (const group of groups) {
      for (const type of (group.fullInteractionType ?? [])) {
        const drugs = (type.minConcept ?? []).map((c: any) => c.name).join(' + ')
        for (const pair of (type.interactionPair ?? [])) {
          const severity: string = pair.severity ?? 'unknown'
          const description: string = pair.description ?? ''
          if (drugs && description) {
            interactions.push({ drugs, severity, description })
          }
        }
      }
    }

    return interactions.slice(0, 10)
  } catch {
    return []
  }
}

export function formatInteractionsForPrompt(interactions: RxInteraction[]): string {
  if (!interactions.length) return ''
  return interactions
    .map(i => `${i.drugs} [${i.severity.toUpperCase()}]: ${i.description}`)
    .join('\n')
}
