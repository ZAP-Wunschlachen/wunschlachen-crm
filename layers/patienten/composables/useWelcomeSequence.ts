/**
 * useWelcomeSequence — Pure-Logic für die Welcome-Mail-Sequenz.
 *
 * Bietet:
 *  - shouldPauseFor(lead): Grund für Pause oder null
 *  - nextSlotForLead(lead): nächster Slot nach welcome_sequence_position
 *  - getDueSlot(lead, now): nächster Slot, der laut Tag-Offset JETZT fällig ist
 *
 * Keine Side-Effects, kein fetch — wird vom Cron-Endpoint orchestriert.
 *
 * localStorage-Override (Browser-only):
 *  - Key: 'welcome-sequence-slots-override'
 *  - Wenn gesetzt: Array<WelcomeSlot> ersetzt WELCOME_SLOTS für UI-Anzeige.
 *  - Pure-Logic-Funktionen verwenden getEffectiveSlots() für Lookups.
 *  - SSR-safe: Override greift nur wenn typeof localStorage !== 'undefined'.
 */

import type { Lead, LeadStatus } from '~/types/crm'
import { WELCOME_SLOTS, type WelcomeSlot } from '../data/welcome-sequence-slots'

export const WELCOME_SEQUENCE_STORAGE_KEY = 'welcome-sequence-slots-override'

/** Lead-Status, in denen die Welcome-Sequenz noch weiterläuft. */
const ACTIVE_STATUSES: LeadStatus[] = ['new', 'contacting', 'contacted']

export type PauseReason =
  | 'no_gdpr_consent'
  | 'unsubscribed'
  | 'status_advanced'
  | 'lost'
  | 'not_started'

/**
 * Gibt den effektiven Slot-Array zurück.
 * Im Browser: localStorage-Override hat Vorrang (falls vorhanden und parsebar).
 * Server-side: immer WELCOME_SLOTS (kein localStorage).
 */
export const getEffectiveSlots = (): WelcomeSlot[] => {
  if (typeof localStorage === 'undefined') return WELCOME_SLOTS
  try {
    const stored = localStorage.getItem(WELCOME_SEQUENCE_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as WelcomeSlot[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* ignore */ }
  return WELCOME_SLOTS
}

export const useWelcomeSequence = () => {
  const shouldPauseFor = (lead: Lead): PauseReason | null => {
    if (!lead.GDPR_accepted_at) return 'no_gdpr_consent'
    if ((lead.Tags || []).includes('unsubscribed')) return 'unsubscribed'
    if (lead.status === 'lost') return 'lost'
    if (!ACTIVE_STATUSES.includes(lead.status)) return 'status_advanced'
    return null
  }

  const nextSlotForLead = (lead: Lead): WelcomeSlot | null => {
    const slots = getEffectiveSlots()
    const pos = lead.welcome_sequence_position ?? 0
    if (pos >= slots.length) return null
    return slots[pos] ?? null
  }

  const getDueSlot = (lead: Lead, now: Date = new Date()): WelcomeSlot | null => {
    if (shouldPauseFor(lead)) return null
    const next = nextSlotForLead(lead)
    if (!next) return null

    const startedAt = lead.welcome_sequence_started_at ?? lead.date_created
    if (!startedAt) return null

    const startMs = new Date(startedAt).getTime()
    const dueAtMs = startMs + next.day_offset * 24 * 60 * 60 * 1000
    return now.getTime() >= dueAtMs ? next : null
  }

  return { shouldPauseFor, nextSlotForLead, getDueSlot, WELCOME_SLOTS }
}
