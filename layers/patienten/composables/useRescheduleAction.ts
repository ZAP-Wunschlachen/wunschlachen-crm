/**
 * useRescheduleAction — Termin-Verschiebung (Plan v9, Iteration 2)
 *
 * Patient sagt Termin proaktiv ab (z.B. Krankheit). Im Unterschied zu No-Show
 * ist der Patient nicht „weg", sondern temporär verhindert:
 *  1. lead.status → Fallback-Status (z.B. consultation_scheduled → contacted)
 *  2. lead.reschedule_count + 1
 *  3. lead.last_reschedule_reason = reason
 *  4. lead.follow_up = followUpDate (Default: +14 Tage)
 *  5. Activity vom Typ 'reschedule' loggen
 *
 * Wichtig: KEIN missed_appointments-Inkrement (das ist für No-Show reserviert).
 * Wiederholtes Verschieben ohne Termin-Buchung → Tag 'flaky-rescheduler'.
 */

import type { Lead, LeadActivity, RescheduleReason } from '~/types/crm'
import { RESCHEDULE_REASON_LABELS } from '~/types/crm'

export const useRescheduleAction = () => {
  const { updateLead } = usePatientLeads()
  const { getRescheduleFallback } = useLeadStatusTransitions()
  const { addActivity } = useLeadActivities()

  const markAsRescheduled = async (
    lead: Lead,
    reason: RescheduleReason,
    options?: { followUpDays?: number; note?: string },
  ): Promise<Lead | null> => {
    const fallback = getRescheduleFallback(lead.status)
    if (!fallback) {
      console.warn(`[reschedule] Status '${lead.status}' erlaubt keine Termin-Verschiebung`)
      return null
    }

    const followUpDays = options?.followUpDays ?? 14
    const now = new Date()
    const followUp = new Date(now)
    followUp.setDate(followUp.getDate() + followUpDays)
    const followUpDateOnly = followUp.toISOString().slice(0, 10) // YYYY-MM-DD für <input type="date">

    const newRescheduleCount = (lead.reschedule_count || 0) + 1
    const fromStatus = lead.status
    const nowIso = now.toISOString()

    const activity: Partial<LeadActivity> = {
      lead_id: lead.id,
      type: 'reschedule',
      subject: `Termin verschoben — ${RESCHEDULE_REASON_LABELS[reason]}`,
      content:
        `Status zurück: ${fromStatus} → ${fallback}. ` +
        `Wiedervorlage am ${followUp.toLocaleDateString('de-DE')}. ` +
        `Verschiebung #${newRescheduleCount}.` +
        (options?.note ? `\nNotiz: ${options.note}` : ''),
      metadata: {
        from_status: fromStatus,
        to_status: fallback,
        reschedule_reason: reason,
        follow_up_at: followUpDateOnly,
      },
      date_created: nowIso,
      user_name: getCurrentUserName(),
    }
    try {
      await addActivity(activity)
    } catch (e) {
      console.error('[reschedule] Activity-Log fehlgeschlagen:', e)
    }

    // Auto-Tag bei Vielverschiebern (≥3 Reschedules)
    const tags = [...(lead.Tags || [])]
    if (newRescheduleCount >= 3 && !tags.includes('flaky-rescheduler')) {
      tags.push('flaky-rescheduler')
    }

    return await updateLead(lead.id, {
      status: fallback,
      reschedule_count: newRescheduleCount,
      last_reschedule_reason: reason,
      last_status_change_at: nowIso,
      follow_up: followUpDateOnly,
      Tags: tags,
    })
  }

  return { markAsRescheduled }
}

const getCurrentUserName = (): string => {
  const user = useState<any>('auth.user').value
  if (!user) return 'System'
  return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'System'
}
