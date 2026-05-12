/**
 * useEmailEvents — Brevo-Tracking-Events pro Lead (Plan v9 Phase B)
 *
 * In Production: Brevo-Webhook `/api/inbound/brevo-event` schreibt in Directus
 * Collection `email_events`. Im Mock-Mode persistieren wir in localStorage,
 * damit Events nach Webhook-Trigger zur Verfügung stehen.
 *
 * Directus-Schema (siehe docs/EMAIL_EVENTS_SCHEMA.md):
 *   { id uuid, lead_id uuid FK, activity_id uuid FK?, event_type string,
 *     occurred_at timestamp, click_url string?, message_id string?,
 *     raw_payload json, date_created timestamp }
 *
 * Brevo-Events-Mapping:
 *   request    → sent
 *   delivered  → delivered
 *   opens      → opened
 *   click      → clicked
 *   bounce     → bounced
 *   spam       → spam
 *   unsubscribed → unsubscribed
 *   blocked    → bounced
 */

import type { LeadActivity } from '~/types/crm'

export type EmailEventType =
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'spam'
  | 'unsubscribed'

export interface EmailEvent {
  id: string
  lead_id: string
  activity_id?: string
  event_type: EmailEventType
  occurred_at: string
  click_url?: string
  message_id?: string
}

const USE_MOCK = true
const STORAGE_KEY = 'patient-crm-email-events'
const SEED_KEY = 'patient-crm-email-events-seeded'

const STATUS_PRIORITY: Record<EmailEventType, number> = {
  sent: 0,
  delivered: 1,
  opened: 2,
  clicked: 3,
  bounced: 4,
  spam: 5,
  unsubscribed: 6,
}

const readEvents = (): EmailEvent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const writeEvents = (events: EmailEvent[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  } catch {
    /* ignore */
  }
}

const seedMockEvents = () => {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(SEED_KEY)) return

  const now = Date.now()
  const day = 86400000
  const seed: EmailEvent[] = [
    // pl-1 — Maria Schmidt (mehrere Touches)
    { id: 'ee-1', lead_id: 'pl-1', activity_id: 'pact-1', event_type: 'opened',    occurred_at: new Date(now - 2 * day).toISOString(), message_id: 'msg-001' },
    { id: 'ee-2', lead_id: 'pl-1', activity_id: 'pact-1', event_type: 'delivered', occurred_at: new Date(now - 2 * day - 3600_000).toISOString(), message_id: 'msg-001' },
    // pl-2 — Thomas Becker (HKP-Klick)
    { id: 'ee-3', lead_id: 'pl-2', activity_id: 'pact-2', event_type: 'clicked',   occurred_at: new Date(now - 1 * day).toISOString(), click_url: 'https://wunschlachen.app/hkp/preview', message_id: 'msg-002' },
    { id: 'ee-4', lead_id: 'pl-2', activity_id: 'pact-2', event_type: 'opened',    occurred_at: new Date(now - 1 * day - 1800_000).toISOString(), message_id: 'msg-002' },
    { id: 'ee-5', lead_id: 'pl-2', activity_id: 'pact-2', event_type: 'delivered', occurred_at: new Date(now - 1 * day - 7200_000).toISOString(), message_id: 'msg-002' },
    // pl-3 — Anna Wolf (nur delivered)
    { id: 'ee-6', lead_id: 'pl-3', activity_id: 'pact-4', event_type: 'delivered', occurred_at: new Date(now - 5 * day).toISOString(), message_id: 'msg-004' },
    // pl-4 — Lisa Wagner (bounce)
    { id: 'ee-7', lead_id: 'pl-4', activity_id: 'pact-6', event_type: 'bounced',   occurred_at: new Date(now - 3 * day).toISOString(), message_id: 'msg-006' },
  ]
  writeEvents(seed)
  localStorage.setItem(SEED_KEY, 'v1')
}

export const useEmailEvents = () => {
  if (typeof window !== 'undefined') seedMockEvents()

  /**
   * Alle Events für eine Aktivität (geordnet vom letzten Event rückwärts).
   */
  const getEventsForActivity = (activityId: string): EmailEvent[] => {
    if (!USE_MOCK) return [] // TODO Phase B: Directus-Fetch
    return readEvents()
      .filter((e) => e.activity_id === activityId)
      .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
  }

  /**
   * Alle Events für einen Lead (alle E-Mails).
   */
  const getEventsForLead = (leadId: string): EmailEvent[] => {
    if (!USE_MOCK) return []
    return readEvents()
      .filter((e) => e.lead_id === leadId)
      .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
  }

  /**
   * Letzter (= highest-priority) Status für eine Aktivität.
   * Beispiel: wenn opened+clicked existieren → clicked.
   */
  const getEmailStatus = (activityId: string): EmailEventType => {
    const events = getEventsForActivity(activityId)
    if (events.length === 0) return 'sent'
    return events.reduce<EmailEventType>(
      (max, ev) =>
        STATUS_PRIORITY[ev.event_type] > STATUS_PRIORITY[max] ? ev.event_type : max,
      'sent',
    )
  }

  /**
   * Engagement-Stats für einen Lead.
   * Berechnet aus echten Events (Mock oder Directus).
   */
  const getEngagementStats = (activities: LeadActivity[]): {
    total_emails: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    open_rate: number
    click_rate: number
  } => {
    const emails = activities.filter(
      (a) => a.type === 'email' || a.type === 'email_sent',
    )

    const stats = {
      total_emails: emails.length,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
    }

    for (const e of emails) {
      const status = getEmailStatus(e.id)
      if (status === 'delivered' || status === 'opened' || status === 'clicked') stats.delivered++
      if (status === 'opened' || status === 'clicked') stats.opened++
      if (status === 'clicked') stats.clicked++
      if (status === 'bounced') stats.bounced++
    }

    return {
      ...stats,
      open_rate: stats.total_emails > 0 ? Math.round((stats.opened / stats.total_emails) * 100) : 0,
      click_rate: stats.total_emails > 0 ? Math.round((stats.clicked / stats.total_emails) * 100) : 0,
    }
  }

  /**
   * Neuen Event persistieren (vom Brevo-Webhook aufgerufen).
   * Im Mock-Mode → localStorage; in Prod → Directus.
   */
  const recordEvent = (event: Omit<EmailEvent, 'id'>): EmailEvent | null => {
    if (!USE_MOCK) return null
    const all = readEvents()
    const next: EmailEvent = {
      ...event,
      id: `ee-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    }
    all.push(next)
    writeEvents(all)
    return next
  }

  /**
   * UI-Helper: visuelle Repräsentation des Status.
   */
  const getStatusBadge = (status: EmailEventType) => {
    switch (status) {
      case 'sent':
        return { label: 'Versandt', icon: 'pi pi-send', color: '#6b7280', bgColor: '#f3f4f6' }
      case 'delivered':
        return { label: 'Zugestellt', icon: 'pi pi-check', color: '#3b82f6', bgColor: '#dbeafe' }
      case 'opened':
        return { label: 'Geöffnet', icon: 'pi pi-eye', color: '#22c55e', bgColor: '#dcfce7' }
      case 'clicked':
        return { label: 'Geklickt', icon: 'pi pi-link', color: '#84cc16', bgColor: '#ecfccb' }
      case 'bounced':
        return { label: 'Bounce', icon: 'pi pi-times-circle', color: '#ef4444', bgColor: '#fee2e2' }
      case 'spam':
        return { label: 'Spam', icon: 'pi pi-flag', color: '#f97316', bgColor: '#ffedd5' }
      case 'unsubscribed':
        return { label: 'Abgemeldet', icon: 'pi pi-ban', color: '#a3a3a3', bgColor: '#f5f5f5' }
    }
  }

  return {
    getEmailStatus,
    getEventsForActivity,
    getEventsForLead,
    getEngagementStats,
    getStatusBadge,
    recordEvent,
  }
}
