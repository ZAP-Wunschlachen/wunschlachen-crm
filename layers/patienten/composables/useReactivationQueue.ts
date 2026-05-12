/**
 * useReactivationQueue — Lost-Lead-Reaktivierungs-Management (Plan v9 Phase E)
 *
 * Logik:
 *   - Lost-Lead bekommt bei lost-Markierung `reactivation_due_at = +90 Tage`
 *   - Diese Composable findet alle Leads die jetzt fällig sind
 *   - Manueller `reactivate(lead)` setzt Status zurück zu 'contacting' + Tag 'reactivated'
 *   - Cron-Endpoint `/api/cron/reactivation-check` läuft täglich + triggert auto-reactivation
 *
 * Reactivation-Strategien je nach lost_reason:
 *   - too_expensive / no_budget → Finanzierungs-Angebot mit Reactivation-Mail
 *   - no_response → "Wir sind hier wenn du bereit bist" + neue Promo
 *   - competitor → "Was hat dich überzeugt?" Feedback-Ask
 *   - distance_too_far → "Wir haben jetzt mobiles Angebot" (falls relevant)
 *   - andere → Standard-Reactivation
 */

import type { Lead, LostReason } from '~/types/crm'

const REACTIVATION_DAYS = 90

interface ReactivationStrategy {
  reason: LostReason
  label: string
  template_id: string
  approach: string
}

const STRATEGIES: Record<LostReason, ReactivationStrategy> = {
  too_expensive: {
    reason: 'too_expensive',
    label: 'Finanzierungs-Angebot',
    template_id: 'reactivation-financing',
    approach: 'Neues Finanzierungsangebot mit niedrigeren Monatsraten',
  },
  no_budget: {
    reason: 'no_budget',
    label: 'Finanzierungs-Optionen',
    template_id: 'reactivation-financing',
    approach: 'Erweiterte Finanzierungsoptionen + Förderprogramme',
  },
  competitor: {
    reason: 'competitor',
    label: 'Erfahrungs-Feedback',
    template_id: 'reactivation-feedback',
    approach: 'Höflich nach Erfahrung beim Mitbewerber fragen',
  },
  no_response: {
    reason: 'no_response',
    label: 'Niedrigschwellige Wieder-Annäherung',
    template_id: 'reactivation-soft',
    approach: '"Wir sind hier wenn du bereit bist" + nützlicher Content',
  },
  distance_too_far: {
    reason: 'distance_too_far',
    label: 'Mobiles Angebot',
    template_id: 'reactivation-mobile',
    approach: 'Hinweis auf mobile/regionale Optionen',
  },
  health_issue: {
    reason: 'health_issue',
    label: 'Sensible Wieder-Annäherung',
    template_id: 'reactivation-health',
    approach: 'Genesungs-Wünsche + offene Tür für später',
  },
  language_barrier: {
    reason: 'language_barrier',
    label: 'Mehrsprachiges Angebot',
    template_id: 'reactivation-language',
    approach: 'Hinweis auf englisch/türkisch sprechende Praxisteams',
  },
  not_interested: {
    reason: 'not_interested',
    label: 'Neue Angebote',
    template_id: 'reactivation-soft',
    approach: 'Niedrigschwelliger Re-Engagement mit aktueller Aktion',
  },
  personal_reasons: {
    reason: 'personal_reasons',
    label: 'Persönliche Wieder-Annäherung',
    template_id: 'reactivation-soft',
    approach: 'Behutsame Wieder-Aufnahme nach persönlicher Situation',
  },
  other: {
    reason: 'other',
    label: 'Standard-Reactivation',
    template_id: 'reactivation-soft',
    approach: 'Allgemeine Wieder-Annäherung mit Special-Offer',
  },
}

export const useReactivationQueue = () => {
  const { updateLead } = usePatientLeads()
  const { defaultReactivationDate } = useLeadStatusTransitions()
  const { addActivity } = useLeadActivities()

  /**
   * Berechnet `reactivation_due_at` für einen Lost-Lead (90 Tage in der Zukunft).
   * Wird beim Markieren als lost automatisch gesetzt.
   */
  const computeReactivationDate = (): string => defaultReactivationDate()

  /**
   * Filtert die Liste: welche Leads sind heute reactivation-fällig?
   * Kriterien: status='lost' AND reactivation_due_at <= now AND nicht bereits reactivated
   */
  const findDueReactivations = (leads: Lead[]): Lead[] => {
    const now = Date.now()
    return leads.filter((l) => {
      if (l.status !== 'lost') return false
      if (l.Tags?.includes('reactivation-attempted')) return false // schon versucht
      if (!l.reactivation_due_at) {
        // Fallback: lost vor mehr als 90 Tagen ohne explizites Datum
        const lostAt = l.last_status_change_at || l.date_updated
        if (!lostAt) return false
        const daysSinceLost = (now - new Date(lostAt).getTime()) / (1000 * 60 * 60 * 24)
        return daysSinceLost >= REACTIVATION_DAYS
      }
      return new Date(l.reactivation_due_at).getTime() <= now
    })
  }

  /**
   * Empfiehlt Reactivation-Strategie basierend auf lost_reason.
   */
  const getStrategy = (lead: Lead): ReactivationStrategy => {
    const reason = lead.lost_reason || 'other'
    return STRATEGIES[reason] || STRATEGIES.other
  }

  /**
   * Reaktiviert einen Lost-Lead: Status zurück zu 'contacting', Tag setzen, Activity loggen.
   */
  const reactivate = async (
    lead: Lead,
    options: { logActivity?: boolean } = { logActivity: true },
  ): Promise<Lead | null> => {
    if (lead.status !== 'lost') {
      console.warn('[reactivation] Lead ist nicht lost — Skip')
      return null
    }

    const strategy = getStrategy(lead)
    const now = new Date().toISOString()
    const tags = [...(lead.Tags || [])]
    if (!tags.includes('reactivated')) tags.push('reactivated')
    if (!tags.includes('reactivation-attempted')) tags.push('reactivation-attempted')

    // Status zurück zu contacting
    const updated = await updateLead(lead.id, {
      status: 'contacting',
      contact_attempts: 0, // Counter zurücksetzen für neuen Anlauf
      last_status_change_at: now,
      reactivation_due_at: undefined, // Marker zurücknehmen
      Tags: tags,
    })

    // Activity loggen
    if (options.logActivity && updated) {
      try {
        addActivity({
          lead_id: lead.id,
          type: 'stage_change',
          subject: `Reaktivierung: ${strategy.label}`,
          content: `Lost-Reason: ${lead.lost_reason || '—'} · Strategie: ${strategy.approach}`,
          metadata: { from_status: 'lost' as any, to_status: 'contacting' as any },
          date_created: now,
        } as any)
      } catch (e) {
        console.warn('[reactivation] Activity-Log fehlgeschlagen:', e)
      }
    }

    return updated
  }

  /**
   * Bulk-Reactivation für alle fälligen Leads (Cron-Trigger).
   * Returns: { reactivated_count, failed_count, ids[] }
   */
  const reactivateAllDue = async (leads: Lead[]): Promise<{
    reactivated_count: number
    failed_count: number
    reactivated_ids: string[]
  }> => {
    const due = findDueReactivations(leads)
    const reactivated_ids: string[] = []
    let failed_count = 0

    for (const lead of due) {
      try {
        const r = await reactivate(lead, { logActivity: true })
        if (r) reactivated_ids.push(lead.id)
      } catch {
        failed_count++
      }
    }

    return { reactivated_count: reactivated_ids.length, failed_count, reactivated_ids }
  }

  return {
    REACTIVATION_DAYS,
    STRATEGIES,
    computeReactivationDate,
    findDueReactivations,
    getStrategy,
    reactivate,
    reactivateAllDue,
  }
}
