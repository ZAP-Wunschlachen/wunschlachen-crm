/**
 * useAppointmentLeadMatch — Hybrid-Match Kalender-Termin ↔ CRM-Lead.
 *
 * Pre-Visit-Realität: Leads haben keine `patient_number` bis Erst-Termin.
 * Daher:
 *  1. Mail-Match (case-insensitive trim) — primärer Pfad für Pre-Visit-Leads
 *  2. patient_number-Match — sekundär, nur greifend wenn Lead bereits eine
 *     Nummer hat (Post-Visit, evtl. nach Backfill)
 *  3. Backfill: bei Mail-Match + leerem lead.patient_number wird die
 *     appointment-seitige Nummer empfohlen — der Caller schreibt sie auf den
 *     Lead, damit Folge-Events robust auch per Nummer matchbar sind.
 */

import type { Lead } from '~/types/crm'

interface AppointmentPatientInfo {
  patient_number?: string | null
  email?: string | null
}

export interface MatchResult {
  lead: Lead | null
  matched_by: 'mail' | 'patient_number' | 'none'
  backfill_patient_number?: string
}

const normalizeMail = (m?: string | null): string => (m || '').trim().toLowerCase()

export const useAppointmentLeadMatch = () => {
  const matchAppointmentToLead = (
    patient: AppointmentPatientInfo | null | undefined,
    leads: Lead[],
  ): MatchResult => {
    if (!patient) return { lead: null, matched_by: 'none' }

    // 1. Primär: Mail
    if (patient.email) {
      const target = normalizeMail(patient.email)
      if (target.length > 0) {
        const found = leads.find((l) => normalizeMail(l.mail) === target)
        if (found) {
          const result: MatchResult = { lead: found, matched_by: 'mail' }
          if (patient.patient_number && !found.patient_number) {
            result.backfill_patient_number = patient.patient_number
          }
          return result
        }
      }
    }

    // 2. Sekundär: patient_number (für Post-Visit-Leads die schon eine Nummer haben)
    if (patient.patient_number) {
      const found = leads.find((l) => l.patient_number === patient.patient_number)
      if (found) return { lead: found, matched_by: 'patient_number' }
    }

    return { lead: null, matched_by: 'none' }
  }

  return { matchAppointmentToLead }
}
