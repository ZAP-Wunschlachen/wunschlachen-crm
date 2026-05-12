/**
 * useEmailEvents — Brevo-Tracking-Events pro Lead (Plan v9, A3)
 *
 * In Production: Brevo-Webhook `/api/inbound/brevo-event` schreibt in Directus
 * Collection `email_events`. Im Mock-Mode liefern wir vordefinierte Events
 * für die Demo-Leads zurück.
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
  activity_id?: string          // FK auf zugehörige Aktivität (E-Mail-Versand)
  event_type: EmailEventType
  occurred_at: string
  click_url?: string
  message_id?: string
}

const USE_MOCK = true

// Mock-Events: pro Aktivität liefern wir den letzten erreichten Tracking-Status
const mockEventsByActivity: Record<string, EmailEventType> = {
  'pact-1': 'opened',
  'pact-2': 'clicked',
  'pact-4': 'delivered',
  // pact-3, pact-5 etc. → nicht in der Map → status bleibt "sent" (default)
}

export const useEmailEvents = () => {
  /**
   * Liefert den letzten Event-Status für eine Aktivität (E-Mail).
   * Wenn keine Events vorliegen → 'sent' als Default.
   */
  const getEmailStatus = (activityId: string): EmailEventType => {
    if (USE_MOCK) return mockEventsByActivity[activityId] || 'sent'
    // TODO Phase B: aus Directus laden
    return 'sent'
  }

  /**
   * Liefert engagement-stats für einen Lead (alle E-Mails aggregiert).
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

  return { getEmailStatus, getEngagementStats, getStatusBadge }
}
