/**
 * useNoShowAction — No-Show-Event-Handler (Plan v9, A5)
 *
 * Wenn Patient nicht erscheint:
 *  1. lead.missed_appointments + 1
 *  2. lead.status → Fallback-Status (z.B. consultation_scheduled → contacted)
 *  3. Activity vom Typ 'no_show' loggen
 *  4. lead.last_status_change_at aktualisieren
 *
 * Plus Auto-Tagging:
 *  - bei 2× No-Show in 60 Tagen → Tag "ghosting-risk"
 *  - bei 3× No-Show → empfehlen: als lost markieren
 */

import type { Lead, LeadStatus, LeadActivity } from '~/types/crm'

export const useNoShowAction = () => {
  const { updateLead } = usePatientLeads()
  const { getNoShowFallback } = useLeadStatusTransitions()
  const { addActivity } = useLeadActivities()

  /**
   * Markiert einen Lead als No-Show.
   * Optional: missedAppointmentDate (zur Aktivitäts-Beschreibung).
   * Returns: aktualisierter Lead oder null bei Fehler.
   */
  const markAsNoShow = async (
    lead: Lead,
    missedAppointmentDate?: string,
  ): Promise<Lead | null> => {
    const fallback = getNoShowFallback(lead.status)
    if (!fallback) {
      console.warn(`[no-show] Status '${lead.status}' erlaubt kein No-Show`)
      return null
    }

    const newMissedCount = (lead.missed_appointments || 0) + 1
    const fromStatus = lead.status
    const now = new Date().toISOString()

    // 1. Activity loggen
    const activity: Partial<LeadActivity> = {
      lead_id: lead.id,
      type: 'no_show',
      subject: missedAppointmentDate
        ? `Patient nicht erschienen am ${new Date(missedAppointmentDate).toLocaleDateString('de-DE')}`
        : 'Patient nicht erschienen',
      content: `Status zurückgesetzt: ${fromStatus} → ${fallback}. No-Show #${newMissedCount}`,
      metadata: {
        from_status: fromStatus,
        to_status: fallback,
      },
      date_created: now,
      user_name: getCurrentUserName(),
    }
    try {
      await addActivity(activity)
    } catch (e) {
      console.error('[no-show] Activity-Log fehlgeschlagen:', e)
    }

    // 2. Auto-Tag bei wiederholten No-Shows
    const tags = [...(lead.Tags || [])]
    if (newMissedCount >= 2 && !tags.includes('ghosting-risk')) {
      tags.push('ghosting-risk')
    }

    // 3. Lead-Update
    return await updateLead(lead.id, {
      status: fallback,
      missed_appointments: newMissedCount,
      last_status_change_at: now,
      Tags: tags,
    })
  }

  /**
   * Heuristik: ist dieser Patient Hochrisiko für Ghosting?
   */
  const isGhostingRisk = (lead: Lead): boolean => {
    return (lead.missed_appointments || 0) >= 2
  }

  /**
   * Empfehlung: soll wegen No-Show als lost markiert werden?
   */
  const shouldMarkAsLost = (lead: Lead): boolean => {
    return (lead.missed_appointments || 0) >= 3
  }

  return { markAsNoShow, isGhostingRisk, shouldMarkAsLost }
}

const getCurrentUserName = (): string => {
  const user = useState<any>('auth.user').value
  if (!user) return 'System'
  return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'System'
}
