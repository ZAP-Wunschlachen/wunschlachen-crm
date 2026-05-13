/**
 * useCallbackScheduler — Smart-Callback-Rotation (Plan v9 Modul B MVP).
 *
 * 3-Slot-Rotation + Tag-Variation + Lern-Komponente:
 *  Versuch 1 → +2h, anderer Tagesabschnitt
 *  Versuch 2 → +1 Tag, andere Tageszeit
 *  Versuch 3 → +7 Tage (vorher SMS+Email triggern, das macht der Caller)
 *  Versuch >3 → null
 *
 * Bei gelerntem successful_call_window bevorzugt dieser.
 *
 * Plus: urgencyScore() für die Anruf-Schlange-Sortierung.
 */

import type { Lead } from '~/types/crm'

export type CallSlot = 'morning' | 'midday' | 'evening'

const SLOT_HOURS: Record<CallSlot, { start: number; end: number; preferred: number }> = {
  morning: { start: 8, end: 11, preferred: 9 },
  midday:  { start: 11, end: 15, preferred: 13 },
  evening: { start: 15, end: 20, preferred: 17 },
}

const SLOT_ORDER: CallSlot[] = ['morning', 'midday', 'evening']

const nextSlotInRotation = (current: CallSlot | null): CallSlot => {
  if (!current) return 'morning'
  const idx = SLOT_ORDER.indexOf(current)
  return SLOT_ORDER[(idx + 1) % SLOT_ORDER.length]
}

const setHourInSlot = (date: Date, slot: CallSlot): Date => {
  const d = new Date(date)
  d.setUTCHours(SLOT_HOURS[slot].preferred, 0, 0, 0)
  return d
}

export const useCallbackScheduler = () => {
  const classifySlot = (when: Date): CallSlot | null => {
    const h = when.getUTCHours()
    for (const slot of SLOT_ORDER) {
      const { start, end } = SLOT_HOURS[slot]
      if (h >= start && h < end) return slot
    }
    return null
  }

  const nextRetrySlot = (lead: Lead, now: Date = new Date()): Date | null => {
    const attempts = lead.call_attempt_count ?? 0
    if (attempts >= 4) return null

    const lastTry = lead.last_call_attempt_at ? new Date(lead.last_call_attempt_at) : now
    const learnedSlot = lead.successful_call_window as CallSlot | undefined
    const currentSlot = classifySlot(lastTry)
    const targetSlot: CallSlot = learnedSlot ?? nextSlotInRotation(currentSlot)

    if (attempts === 0 || attempts === 1) {
      // +2h, im Ziel-Slot
      const candidate = setHourInSlot(lastTry, targetSlot)
      if (candidate.getTime() - lastTry.getTime() < 2 * 3600 * 1000) {
        // anderer Slot später am Tag — wenn schon vorbei, +1 Tag in den preferred Slot
        const tomorrow = new Date(lastTry)
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
        return setHourInSlot(tomorrow, targetSlot)
      }
      return candidate
    }
    if (attempts === 2) {
      // +1 Tag, andere Tageszeit (oder gelernter Slot)
      const tomorrow = new Date(lastTry)
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
      return setHourInSlot(tomorrow, targetSlot)
    }
    if (attempts === 3) {
      // +7 Tage (nach Failover-Email/SMS)
      const inWeek = new Date(lastTry)
      inWeek.setUTCDate(inWeek.getUTCDate() + 7)
      return setHourInSlot(inWeek, targetSlot)
    }
    return null
  }

  const shouldFailover = (lead: Lead): boolean => (lead.call_attempt_count ?? 0) >= 3

  /**
   * Urgency-Score 0-100 für Anruf-Schlangen-Sortierung.
   * Berücksichtigt: Status, Alter, Anzahl Versuche, Wartezeit auf nächsten Slot.
   */
  const urgencyScore = (lead: Lead, now: Date = new Date()): number => {
    if (lead.status === 'lost' || lead.status === 'completed') return 0
    if (lead.next_call_slot_at && new Date(lead.next_call_slot_at).getTime() > now.getTime()) return 0

    let score = 50
    // Status-Boost
    if (lead.status === 'new') score += 40
    else if (lead.status === 'contacting') score += 20
    else if (lead.status === 'contacted') score += 10
    // Alter (älter = dringender — Speed-to-Lead-Penalty)
    const ageHours = (now.getTime() - new Date(lead.date_created).getTime()) / 3600000
    if (ageHours < 1) score += 20
    else if (ageHours < 24) score += 10
    else if (ageHours > 72) score -= 10
    // Versuche-Penalty
    const attempts = lead.call_attempt_count ?? 0
    score -= attempts * 15
    return Math.max(0, Math.min(100, score))
  }

  return { classifySlot, nextRetrySlot, shouldFailover, urgencyScore, SLOT_ORDER }
}
