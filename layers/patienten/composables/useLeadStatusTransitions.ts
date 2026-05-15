/**
 * useLeadStatusTransitions — State-Machine für Patient-Lead-Status
 *
 * Definiert erlaubte Übergänge zwischen Status laut Plan v9.
 * Verhindert ungültige Wechsel (z.B. von 'new' direkt zu 'completed').
 *
 * No-Show ist KEIN Status, sondern ein Event:
 * - missed_appointments Counter +1
 * - Status springt zurück (siehe noShowFallback)
 *
 * Lost ist von jedem Status aus erreichbar (mit lost_reason).
 *
 * Reactivation: lost → contacting (nach 90 Tagen, mit Tag "reactivated")
 */

import type { LeadStatus, LostReason } from '~/types/crm'

/**
 * Erlaubte Vorwärts-Übergänge pro Status.
 * 'lost' ist von ÜBERALL erreichbar (separat behandelt in canTransition).
 */
const ALLOWED_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  new: ['contacting', 'contacted'],
  contacting: ['contacted'],
  contacted: ['consultation_scheduled'],
  consultation_scheduled: ['consultation_done'],
  consultation_done: ['hkp_sent', 'treatment_scheduled'], // direkter Sprung möglich wenn kein HKP nötig
  hkp_sent: ['hkp_signed'],
  hkp_signed: ['treatment_scheduled'],
  treatment_scheduled: ['treatment_in_progress'],
  treatment_in_progress: ['treatment_scheduled', 'completed'], // Folge-Sessions zurück zu scheduled
  completed: [],
  lost: ['contacting'], // Reactivation
}

/**
 * No-Show-Fallback: bei verpasstem Termin springt Status zurück.
 * Counter missed_appointments wird +1.
 */
const NO_SHOW_FALLBACK: Partial<Record<LeadStatus, LeadStatus>> = {
  consultation_scheduled: 'contacted',
  treatment_scheduled: 'hkp_signed',
  treatment_in_progress: 'hkp_signed',
}

export const useLeadStatusTransitions = () => {
  /**
   * Prüft, ob ein Status-Übergang erlaubt ist.
   * 'lost' ist von überall aus möglich (außer von 'completed').
   * 'completed' ist final.
   */
  const canTransition = (from: LeadStatus, to: LeadStatus): boolean => {
    if (from === to) return false
    if (from === 'completed') return false // Bestandspatient bleibt
    if (to === 'lost') return from !== 'completed'
    return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
  }

  /**
   * Liefert die erlaubten Folge-Status für einen aktuellen Status.
   * Enthält 'lost' wo erlaubt.
   */
  const getNextStatuses = (from: LeadStatus): LeadStatus[] => {
    const direct = [...(ALLOWED_TRANSITIONS[from] || [])]
    if (from !== 'completed' && from !== 'lost') direct.push('lost')
    return direct
  }

  /**
   * Bei No-Show: passender Fallback-Status zurück (oder null wenn kein Fallback definiert).
   */
  const getNoShowFallback = (current: LeadStatus): LeadStatus | null => {
    return NO_SHOW_FALLBACK[current] ?? null
  }

  /**
   * Hilfs-Funktion: ist dieser Status ein „Termin-Status" wo No-Show möglich ist?
   */
  const canHaveNoShow = (status: LeadStatus): boolean => {
    return status in NO_SHOW_FALLBACK
  }

  /**
   * Termin-Verschiebung (Plan v9, Iteration 2):
   * Patient sagt Termin proaktiv ab (z.B. Krankheit). Status springt zurück
   * wie bei No-Show, aber separat als 'reschedule' geloggt — reschedule_count
   * statt missed_appointments. Erlaubt für genau die Termin-Status.
   */
  const canReschedule = (status: LeadStatus): boolean => canHaveNoShow(status)
  const getRescheduleFallback = (current: LeadStatus): LeadStatus | null => getNoShowFallback(current)

  /**
   * Hilfs-Funktion: ist Lead in der Akquise-Phase (für Speed-to-Lead-Logik)?
   */
  const isInAcquisition = (status: LeadStatus): boolean => {
    return status === 'new' || status === 'contacting'
  }

  /**
   * Hilfs-Funktion: ist Lead im aktiven Sales-Funnel (nicht lost/completed)?
   */
  const isActive = (status: LeadStatus): boolean => {
    return status !== 'lost' && status !== 'completed'
  }

  /**
   * Default-Reactivation-Datum: 90 Tage in der Zukunft.
   */
  const defaultReactivationDate = (): string => {
    const d = new Date()
    d.setDate(d.getDate() + 90)
    return d.toISOString()
  }

  /**
   * Lead zurückholen aus 'lost': rekonstruiert den Status vor dem
   * stage_change zu 'lost' aus dem Activity-Log.
   * Returns null wenn kein Audit-Eintrag mit from_status≠'lost' gefunden wird.
   */
  const getRollbackTargetFromActivities = (
    activities: { type: string; metadata?: { from_status?: LeadStatus; to_status?: LeadStatus }; date_created: string }[],
  ): LeadStatus | null => {
    if (!activities?.length) return null
    // Activities nach Datum absteigend sortieren, dann jüngsten stage_change-Eintrag finden,
    // der TO 'lost' geführt hat — der from_status ist unser Rollback-Ziel.
    const sorted = [...activities].sort(
      (a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime(),
    )
    const lostTransition = sorted.find(
      (a) => a.type === 'stage_change' && a.metadata?.to_status === 'lost' && a.metadata?.from_status,
    )
    return (lostTransition?.metadata?.from_status as LeadStatus) ?? null
  }

  return {
    canTransition,
    getNextStatuses,
    getNoShowFallback,
    canHaveNoShow,
    canReschedule,
    getRescheduleFallback,
    isInAcquisition,
    isActive,
    defaultReactivationDate,
    getRollbackTargetFromActivities,
  }
}

/**
 * Migration-Mapping: alter Status → neuer Status.
 * Wird in mock-seed.client.ts angewendet bei v3→v4-Upgrade.
 */
export const LEGACY_STATUS_MAP: Record<string, LeadStatus> = {
  open: 'new',
  contacted: 'contacted',
  contacted_twice: 'contacting', // mit contact_attempts=2
  scheduled: 'consultation_scheduled',
  rescheduling: 'contacted', // Termin neu vereinbaren → zurück zu contacted
  email_sendet: 'contacted', // Email-Versand ist Activity, nicht Status; aktueller Status: contacted
  hkp_sended: 'hkp_sent',
  done: 'completed',
  cancelled: 'lost',
}

/**
 * Reverse-Lookup für Lost-Reason-Migration aus alten Status-Cancellations.
 * (nur historisch — keine 'other' mehr nach LostReason-Migration auf Directus-Werte)
 */
export const LEGACY_CANCEL_REASON: Record<string, LostReason> = {
  cancelled: 'personal_reasons',
}

/**
 * Map a Directus-Lead-Object zum CRM-internen Format:
 * - Status legacy→v9
 * - Tags/Datums-Felder unverändert
 */
export const mapDirectusLeadStatus = <T extends { status?: string | null }>(lead: T): T => {
  if (!lead?.status) return lead
  const mapped = LEGACY_STATUS_MAP[lead.status as string]
  return mapped ? { ...lead, status: mapped } : lead
}
