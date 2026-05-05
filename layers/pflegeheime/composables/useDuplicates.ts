/**
 * useDuplicates Composable
 *
 * Scans all leads for potential duplicates using multi-field similarity scoring.
 * Supports merging duplicate leads (activities, contacts, documents transfer).
 */

import { getLocalLeads } from './useLeads'

export interface DuplicateMatch {
  leadA: NursingHomeLead
  leadB: NursingHomeLead
  score: number          // 0-100
  reasons: string[]      // What matched
  nhA: NursingHome | null
  nhB: NursingHome | null
}

export interface DuplicateGroup {
  anchor: NursingHomeLead
  anchorNh: NursingHome | null
  matches: { lead: NursingHomeLead; nh: NursingHome | null; score: number; reasons: string[] }[]
}

// ─── String similarity (Dice coefficient) ──────────────────────────

const bigrams = (str: string): Set<string> => {
  const s = str.toLowerCase().trim()
  const bg = new Set<string>()
  for (let i = 0; i < s.length - 1; i++) bg.add(s.slice(i, i + 2))
  return bg
}

const diceSimilarity = (a: string, b: string): number => {
  if (!a || !b) return 0
  const cleanA = a.toLowerCase().replace(/[^a-zäöüß0-9\s]/g, '').trim()
  const cleanB = b.toLowerCase().replace(/[^a-zäöüß0-9\s]/g, '').trim()
  if (cleanA === cleanB) return 1
  if (cleanA.length < 2 || cleanB.length < 2) return 0

  const bgA = bigrams(cleanA)
  const bgB = bigrams(cleanB)
  let intersect = 0
  for (const bg of bgA) {
    if (bgB.has(bg)) intersect++
  }
  return (2 * intersect) / (bgA.size + bgB.size)
}

// ─── Phone normalization ───────────────────────────────────────────

const normalizePhone = (phone?: string): string => {
  if (!phone) return ''
  return phone.replace(/[\s\-\/\(\)\.+]/g, '').replace(/^0049/, '0').replace(/^49/, '0')
}

// ─── Get NursingHome from lead ─────────────────────────────────────

const getNh = (lead: NursingHomeLead): NursingHome | null => {
  if (typeof lead.nursing_home_id === 'object' && lead.nursing_home_id) {
    return lead.nursing_home_id
  }
  return null
}

// ─── Scoring ────────────────────────────────────────────────────────

const scorePair = (a: NursingHomeLead, b: NursingHomeLead): { score: number; reasons: string[] } => {
  const nhA = getNh(a)
  const nhB = getNh(b)
  if (!nhA || !nhB) return { score: 0, reasons: [] }

  let score = 0
  const reasons: string[] = []

  // 1. Name similarity (max 50 pts)
  const nameSim = diceSimilarity(nhA.name || '', nhB.name || '')
  if (nameSim >= 0.85) {
    score += 50
    reasons.push(`Name: ${Math.round(nameSim * 100)}% ähnlich`)
  } else if (nameSim >= 0.65) {
    score += 30
    reasons.push(`Name: ${Math.round(nameSim * 100)}% ähnlich`)
  } else if (nameSim >= 0.5) {
    score += 15
    reasons.push(`Name: ${Math.round(nameSim * 100)}% ähnlich`)
  }

  // Substring match
  const nameA = (nhA.name || '').toLowerCase()
  const nameB = (nhB.name || '').toLowerCase()
  if (nameA.length >= 6 && nameB.length >= 6) {
    if (nameA.includes(nameB) || nameB.includes(nameA)) {
      score = Math.max(score, 35)
      if (!reasons.some(r => r.startsWith('Name:'))) {
        reasons.push('Name: Teilstring-Match')
      }
    }
  }

  // 2. Location match (max 20 pts)
  if (nhA.zip && nhB.zip && nhA.zip === nhB.zip) {
    score += 15
    reasons.push(`PLZ: ${nhA.zip}`)
  }
  if (nhA.city && nhB.city && nhA.city.toLowerCase() === nhB.city.toLowerCase()) {
    score += 5
    reasons.push(`Ort: ${nhA.city}`)
  }

  // 3. Street match (max 10 pts)
  if (nhA.Street && nhB.Street) {
    const streetSim = diceSimilarity(nhA.Street, nhB.Street)
    if (streetSim >= 0.8) {
      score += 10
      reasons.push('Gleiche Straße')
    }
  }

  // 4. Phone match (max 15 pts)
  const phoneA = normalizePhone(nhA.fone)
  const phoneB = normalizePhone(nhB.fone)
  if (phoneA && phoneB && phoneA.length >= 6 && phoneA === phoneB) {
    score += 15
    reasons.push(`Telefon: ${nhA.fone}`)
  }

  // 5. Email match (max 15 pts)
  if (nhA.email && nhB.email && nhA.email.toLowerCase() === nhB.email.toLowerCase()) {
    score += 15
    reasons.push(`E-Mail: ${nhA.email}`)
  }

  return { score: Math.min(score, 100), reasons }
}

// ─── Main composable ───────────────────────────────────────────────

export const useDuplicates = () => {
  const duplicateGroups = ref<DuplicateGroup[]>([])
  const scanning = ref(false)
  const scanComplete = ref(false)
  const totalLeads = ref(0)
  const totalDuplicates = ref(0)

  const scanForDuplicates = (threshold = 40) => {
    scanning.value = true
    scanComplete.value = false

    const leads = getLocalLeads()
    totalLeads.value = leads.length

    // Find all pairs above threshold
    const matches: DuplicateMatch[] = []
    for (let i = 0; i < leads.length; i++) {
      for (let j = i + 1; j < leads.length; j++) {
        const { score, reasons } = scorePair(leads[i], leads[j])
        if (score >= threshold) {
          matches.push({
            leadA: leads[i],
            leadB: leads[j],
            score,
            reasons,
            nhA: getNh(leads[i]),
            nhB: getNh(leads[j]),
          })
        }
      }
    }

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score)

    // Group by anchor lead
    const grouped = new Map<string, DuplicateGroup>()
    const assigned = new Set<string>()

    for (const match of matches) {
      const idA = match.leadA.id
      const idB = match.leadB.id

      let group: DuplicateGroup | undefined
      if (assigned.has(idA)) {
        group = [...grouped.values()].find(g =>
          g.anchor.id === idA || g.matches.some(m => m.lead.id === idA)
        )
      }
      if (!group && assigned.has(idB)) {
        group = [...grouped.values()].find(g =>
          g.anchor.id === idB || g.matches.some(m => m.lead.id === idB)
        )
      }

      if (group) {
        const otherLead = group.anchor.id === idA ? match.leadB : match.leadA
        const otherNh = group.anchor.id === idA ? match.nhB : match.nhA
        if (!group.matches.some(m => m.lead.id === otherLead.id) && group.anchor.id !== otherLead.id) {
          group.matches.push({
            lead: otherLead,
            nh: otherNh,
            score: match.score,
            reasons: match.reasons,
          })
        }
        assigned.add(idA)
        assigned.add(idB)
      } else {
        const newGroup: DuplicateGroup = {
          anchor: match.leadA,
          anchorNh: match.nhA,
          matches: [{
            lead: match.leadB,
            nh: match.nhB,
            score: match.score,
            reasons: match.reasons,
          }],
        }
        grouped.set(idA, newGroup)
        assigned.add(idA)
        assigned.add(idB)
      }
    }

    duplicateGroups.value = [...grouped.values()].sort((a, b) =>
      Math.max(...b.matches.map(m => m.score)) - Math.max(...a.matches.map(m => m.score))
    )
    totalDuplicates.value = duplicateGroups.value.reduce((sum, g) => sum + g.matches.length, 0)
    scanning.value = false
    scanComplete.value = true
  }

  /**
   * Merge leadB into leadA
   */
  const mergeLeads = async (keepId: string, removeId: string) => {
    const { fetchLead, updateLead } = useLeads()
    const { activities: acts, fetchActivities, updateActivity } = useActivities()
    const { fetchContacts, editContact } = useContacts()
    const keepLead = await fetchLead(keepId)
    const removeLead = await fetchLead(removeId)
    if (!keepLead || !removeLead) throw new Error('Lead nicht gefunden')

    const keepNh = getNh(keepLead)
    const removeNh = getNh(removeLead)

    // 1. Merge nursing home data (fill missing fields)
    if (keepNh && removeNh) {
      const fieldsToMerge: (keyof NursingHome)[] = [
        'fone', 'email', 'website', 'Street', 'number', 'zip', 'city',
        'total_capacity', 'distance_from_dental_office', 'notes',
        'coordinates_lat', 'coordinates_lon',
      ]
      let merged = false
      for (const field of fieldsToMerge) {
        if (!keepNh[field] && removeNh[field]) {
          (keepNh as any)[field] = removeNh[field]
          merged = true
        }
      }
      if (merged) {
        await updateLead(keepId, { nursing_home_id: keepNh } as any)
      }
    }

    // 2. Transfer activities
    await fetchActivities(removeId)
    for (const act of acts.value) {
      await updateActivity(act.id, { nursing_home_lead_id: keepId })
    }

    // 3. Transfer contacts
    const keepNhId = keepNh?.id
    const removeNhId = removeNh?.id
    if (removeNhId && keepNhId) {
      const removeContacts = await fetchContacts(removeNhId)
      for (const contact of removeContacts) {
        await editContact(contact.id, { nursing_home_id: keepNhId })
      }
    }

    // 4. Delete the duplicate lead
    const allLeads = getLocalLeads()
    const filtered = allLeads.filter(l => l.id !== removeId)
    const { importLeadsToLocal } = await import('./useLeads')
    importLeadsToLocal(filtered)

    // 5. Remove from duplicate groups
    duplicateGroups.value = duplicateGroups.value
      .map(g => ({
        ...g,
        matches: g.matches.filter(m => m.lead.id !== removeId),
      }))
      .filter(g => g.anchor.id !== removeId && g.matches.length > 0)

    totalDuplicates.value = duplicateGroups.value.reduce((sum, g) => sum + g.matches.length, 0)
  }

  /**
   * Dismiss a duplicate pair (mark as not-duplicate)
   */
  const dismissedKey = 'crm_dismissed_duplicates'

  const getDismissed = (): Set<string> => {
    try {
      const stored = localStorage.getItem(dismissedKey)
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch { return new Set() }
  }

  const dismissPair = (idA: string, idB: string) => {
    const key = [idA, idB].sort().join('::')
    const dismissed = getDismissed()
    dismissed.add(key)
    try {
      localStorage.setItem(dismissedKey, JSON.stringify([...dismissed]))
    } catch { /* ignore */ }

    duplicateGroups.value = duplicateGroups.value
      .map(g => ({
        ...g,
        matches: g.matches.filter(m => {
          const pairKey = [g.anchor.id, m.lead.id].sort().join('::')
          return !dismissed.has(pairKey)
        }),
      }))
      .filter(g => g.matches.length > 0)

    totalDuplicates.value = duplicateGroups.value.reduce((sum, g) => sum + g.matches.length, 0)
  }

  return {
    duplicateGroups,
    scanning,
    scanComplete,
    totalLeads,
    totalDuplicates,
    scanForDuplicates,
    mergeLeads,
    dismissPair,
  }
}
