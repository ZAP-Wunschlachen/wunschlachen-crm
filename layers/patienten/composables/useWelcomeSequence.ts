/**
 * useWelcomeSequence — Pure-Logic für die Welcome-Mail-Sequenz.
 *
 * Bietet:
 *  - shouldPauseFor(lead): Grund für Pause oder null
 *  - nextSlotForLead(lead): nächster Slot nach welcome_sequence_position
 *  - getDueSlot(lead, now): nächster Slot, der laut Tag-Offset JETZT fällig ist
 *
 * Keine Side-Effects, kein fetch — wird vom Cron-Endpoint orchestriert.
 */

import type { Lead, LeadStatus } from '~/types/crm'
import { WELCOME_SLOTS, type WelcomeSlot } from '../data/welcome-sequence-slots'

/** Lead-Status, in denen die Welcome-Sequenz noch weiterläuft. */
const ACTIVE_STATUSES: LeadStatus[] = ['new', 'contacting', 'contacted']

export type PauseReason =
  | 'no_gdpr_consent'
  | 'unsubscribed'
  | 'status_advanced'
  | 'lost'
  | 'not_started'

export const useWelcomeSequence = () => {
  const shouldPauseFor = (lead: Lead): PauseReason | null => {
    if (!lead.GDPR_accepted_at) return 'no_gdpr_consent'
    if ((lead.Tags || []).includes('unsubscribed')) return 'unsubscribed'
    if (lead.status === 'lost') return 'lost'
    if (!ACTIVE_STATUSES.includes(lead.status)) return 'status_advanced'
    return null
  }

  const nextSlotForLead = (lead: Lead): WelcomeSlot | null => {
    const pos = lead.welcome_sequence_position ?? 0
    if (pos >= WELCOME_SLOTS.length) return null
    return WELCOME_SLOTS[pos] ?? null
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
