/**
 * useNextBestAction — Status-basierte Sales-Empfehlungs-Engine (Plan v9, Phase A2)
 *
 * Liefert pro Lead die wichtigste anstehende Aktion(en) mit Urgenz-Level.
 * Basis: Status + days_in_status + contact_attempts + missed_appointments.
 *
 * Urgenz-Levels:
 *   - low      → "Alles im Plan, nichts dringend"
 *   - medium   → "Kontaktpunkt fällig"
 *   - high     → "Achtung, Patient riskiert Drop-out"
 *   - critical → "Dringend handeln, Lost-Risiko"
 *
 * Action-Typen:
 *   - call           → Anrufen
 *   - email          → E-Mail senden (template_id)
 *   - sms            → SMS senden (template_id)
 *   - whatsapp       → WhatsApp senden (template_id)
 *   - book_meeting   → Termin-Dialog öffnen
 *   - send_hkp       → HKP-Versand-Dialog
 *   - status_change  → Status manuell ändern (Dropdown)
 *   - mark_no_show   → No-Show-Counter +1, Status-Fallback
 *   - mark_lost      → Status → lost mit Reason
 *   - request_review → Bewertungs-Anfrage (für completed)
 *   - reactivation   → Reactivation-Mail (für lost)
 */

import type { Lead, LeadStatus } from '~/types/crm'

export type ActionUrgency = 'low' | 'medium' | 'high' | 'critical'

export type ActionType =
  | 'call'
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'book_meeting'
  | 'send_hkp'
  | 'status_change'
  | 'mark_no_show'
  | 'mark_lost'
  | 'request_review'
  | 'reactivation'
  | 'send_financing_info'

export interface NextBestAction {
  type: ActionType
  label: string
  icon: string
  template_id?: string         // welches Template vor-laden
  primary?: boolean            // Haupt-CTA?
  hint?: string                // Tooltip
}

export interface NextBestActionResult {
  urgency: ActionUrgency
  reason: string               // Menschlich lesbare Begründung
  days_in_status: number       // Diagnose-Info
  actions: NextBestAction[]    // 1-4 empfohlene Aktionen, sortiert nach Wichtigkeit
}

const URGENCY_COLORS: Record<ActionUrgency, { color: string; bgColor: string; icon: string }> = {
  low:      { color: '#22c55e', bgColor: '#dcfce7', icon: 'pi pi-check-circle' },
  medium:   { color: '#3b82f6', bgColor: '#dbeafe', icon: 'pi pi-info-circle' },
  high:     { color: '#f97316', bgColor: '#ffedd5', icon: 'pi pi-exclamation-triangle' },
  critical: { color: '#dc2626', bgColor: '#fee2e2', icon: 'pi pi-exclamation-circle' },
}

export const getUrgencyStyle = (u: ActionUrgency) => URGENCY_COLORS[u]

export const useNextBestAction = () => {
  /**
   * Hauptfunktion: nimmt Lead, returnt Recommendation.
   */
  const compute = (lead: Lead | null): NextBestActionResult => {
    if (!lead) {
      return { urgency: 'low', reason: 'Kein Lead geladen', days_in_status: 0, actions: [] }
    }

    const days = daysInCurrentStatus(lead)
    const status = lead.status

    switch (status) {
      case 'new':
        return rulesForNew(lead, days)
      case 'contacting':
        return rulesForContacting(lead, days)
      case 'contacted':
        return rulesForContacted(lead, days)
      case 'consultation_scheduled':
        return rulesForConsultationScheduled(lead, days)
      case 'consultation_done':
        return rulesForConsultationDone(lead, days)
      case 'hkp_sent':
        return rulesForHkpSent(lead, days)
      case 'hkp_signed':
        return rulesForHkpSigned(lead, days)
      case 'treatment_scheduled':
        return rulesForTreatmentScheduled(lead, days)
      case 'treatment_in_progress':
        return rulesForTreatmentInProgress(lead, days)
      case 'completed':
        return rulesForCompleted(lead, days)
      case 'lost':
        return rulesForLost(lead, days)
      default:
        return { urgency: 'low', reason: 'Status nicht erkannt', days_in_status: days, actions: [] }
    }
  }

  return { compute, getUrgencyStyle }
}

// ────────────────────────────────────────────────────────────────────────────────
// Hilfs-Funktionen
// ────────────────────────────────────────────────────────────────────────────────

const daysInCurrentStatus = (lead: Lead): number => {
  const ref = lead.last_status_change_at || lead.date_updated || lead.date_created
  if (!ref) return 0
  const diffMs = Date.now() - new Date(ref).getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

const hoursInCurrentStatus = (lead: Lead): number => {
  const ref = lead.last_status_change_at || lead.date_updated || lead.date_created
  if (!ref) return 0
  const diffMs = Date.now() - new Date(ref).getTime()
  return Math.floor(diffMs / (1000 * 60 * 60))
}

// ────────────────────────────────────────────────────────────────────────────────
// Status-spezifische Regeln
// ────────────────────────────────────────────────────────────────────────────────

const rulesForNew = (lead: Lead, days: number): NextBestActionResult => {
  const hours = hoursInCurrentStatus(lead)
  if (hours < 1) {
    return {
      urgency: 'high',
      reason: 'Speed-to-Lead: Patient gerade angefragt — jetzt anrufen für maximale Conversion!',
      days_in_status: days,
      actions: [
        { type: 'call', label: 'Sofort anrufen', icon: 'pi pi-phone', primary: true, hint: 'Speed-to-Lead < 5 Min hat 21x höhere Conversion' },
        { type: 'whatsapp', label: 'WhatsApp Welcome', icon: 'pi pi-comments', template_id: 'whatsapp-welcome' },
      ],
    }
  }
  if (hours < 24) {
    return {
      urgency: 'high',
      reason: `Lead ist seit ${hours}h ohne Kontakt — Speed-to-Lead-Fenster schließt sich`,
      days_in_status: days,
      actions: [
        { type: 'call', label: 'Anrufen', icon: 'pi pi-phone', primary: true },
        { type: 'email', label: 'Welcome-Mail', icon: 'pi pi-envelope', template_id: 'pt-1' },
        { type: 'whatsapp', label: 'WhatsApp', icon: 'pi pi-comments', template_id: 'whatsapp-welcome' },
      ],
    }
  }
  return {
    urgency: 'critical',
    reason: `Lead seit ${days} Tagen ohne Reaktion — Conversion-Wahrscheinlichkeit drastisch gesunken`,
    days_in_status: days,
    actions: [
      { type: 'call', label: 'Anrufen (überfällig!)', icon: 'pi pi-phone', primary: true },
      { type: 'email', label: 'Last-Chance-Mail', icon: 'pi pi-envelope', template_id: 'pt-1' },
      { type: 'mark_lost', label: 'Als verloren markieren', icon: 'pi pi-times' },
    ],
  }
}

const rulesForContacting = (lead: Lead, days: number): NextBestActionResult => {
  const attempts = lead.contact_attempts || 0
  if (attempts < 2) {
    return {
      urgency: 'medium',
      reason: `Versuch ${attempts + 1}/5 — Patient noch nicht erreicht`,
      days_in_status: days,
      actions: [
        { type: 'call', label: 'Erneut anrufen', icon: 'pi pi-phone', primary: true },
        { type: 'sms', label: 'SMS "Rufen Sie zurück?"', icon: 'pi pi-comment', template_id: 'callback-request' },
      ],
    }
  }
  if (attempts < 5) {
    return {
      urgency: 'high',
      reason: `${attempts} Anrufe vergebens — Channel wechseln`,
      days_in_status: days,
      actions: [
        { type: 'whatsapp', label: 'WhatsApp probieren', icon: 'pi pi-comments', primary: true, template_id: 'whatsapp-followup' },
        { type: 'email', label: 'E-Mail mit Termin-Link', icon: 'pi pi-envelope', template_id: 'pt-2' },
        { type: 'call', label: 'Letzter Anruf', icon: 'pi pi-phone' },
      ],
    }
  }
  return {
    urgency: 'critical',
    reason: `${attempts} Versuche, ${days} Tage — Lost-Kandidat`,
    days_in_status: days,
    actions: [
      { type: 'email', label: 'Final-Mail "Wir sind hier wenn du bereit bist"', icon: 'pi pi-envelope', primary: true, template_id: 'pt-2' },
      { type: 'mark_lost', label: 'Als verloren markieren (no_response)', icon: 'pi pi-times' },
    ],
  }
}

const rulesForContacted = (lead: Lead, days: number): NextBestActionResult => {
  if (days < 2) {
    return {
      urgency: 'medium',
      reason: 'Patient erreicht — Beratungstermin vorschlagen',
      days_in_status: days,
      actions: [
        { type: 'book_meeting', label: 'Beratungstermin buchen', icon: 'pi pi-calendar-plus', primary: true },
        { type: 'email', label: 'Info-Material senden', icon: 'pi pi-envelope', template_id: 'pt-1' },
      ],
    }
  }
  if (days < 7) {
    return {
      urgency: 'high',
      reason: `${days} Tage nach Erstkontakt — noch kein Termin gebucht, Interesse verliert sich`,
      days_in_status: days,
      actions: [
        { type: 'call', label: 'Nachfass-Anruf', icon: 'pi pi-phone', primary: true },
        { type: 'book_meeting', label: 'Termin anbieten', icon: 'pi pi-calendar-plus' },
        { type: 'whatsapp', label: 'WhatsApp Reminder', icon: 'pi pi-comments', template_id: 'whatsapp-reminder' },
      ],
    }
  }
  return {
    urgency: 'critical',
    reason: `${days} Tage erloschener Kontakt — Reaktivierung oder lost`,
    days_in_status: days,
    actions: [
      { type: 'call', label: 'Reaktivierungs-Anruf', icon: 'pi pi-phone', primary: true },
      { type: 'mark_lost', label: 'Als verloren markieren', icon: 'pi pi-times' },
    ],
  }
}

const rulesForConsultationScheduled = (lead: Lead, days: number): NextBestActionResult => {
  const apptInFuture = isAppointmentInFuture(lead)
  if (apptInFuture) {
    return {
      urgency: 'low',
      reason: 'Beratungstermin steht — Reminder 24h vorher senden',
      days_in_status: days,
      actions: [
        { type: 'sms', label: '24h-Reminder', icon: 'pi pi-comment', template_id: 'appt-reminder-24h' },
        { type: 'email', label: 'Anfahrt + Vorbereitung', icon: 'pi pi-envelope', template_id: 'pt-5' },
      ],
    }
  }
  return {
    urgency: 'high',
    reason: 'Beratungstermin liegt in der Vergangenheit — Patient erschienen oder No-Show?',
    days_in_status: days,
    actions: [
      { type: 'call', label: 'Nachfassen', icon: 'pi pi-phone', primary: true },
      { type: 'status_change', label: '→ Beratung erfolgt', icon: 'pi pi-arrow-right' },
      { type: 'mark_no_show', label: 'No-Show markieren', icon: 'pi pi-times-circle' },
    ],
  }
}

const rulesForConsultationDone = (lead: Lead, days: number): NextBestActionResult => {
  if (days < 1) {
    return {
      urgency: 'medium',
      reason: 'Beratung erfolgt — HKP zeitnah erstellen und versenden',
      days_in_status: days,
      actions: [
        { type: 'send_hkp', label: 'HKP versenden', icon: 'pi pi-file-pdf', primary: true },
        { type: 'email', label: 'Zwischen-Mail "HKP folgt"', icon: 'pi pi-envelope' },
      ],
    }
  }
  return {
    urgency: 'high',
    reason: `Beratung war vor ${days} Tagen — HKP überfällig, Patient kann Interesse verlieren`,
    days_in_status: days,
    actions: [
      { type: 'send_hkp', label: 'HKP JETZT versenden', icon: 'pi pi-file-pdf', primary: true },
      { type: 'email', label: 'Entschuldigungs-Mail mit HKP', icon: 'pi pi-envelope' },
    ],
  }
}

const rulesForHkpSent = (lead: Lead, days: number): NextBestActionResult => {
  // Plan v9 Phase E: hkp_substate-spezifische Empfehlungen
  const sub = lead.hkp_substate
  if (sub === 'ready_to_sign') {
    return {
      urgency: days >= 1 ? 'high' : 'medium',
      reason: 'Patient ist unterschriftsbereit — Termin direkt verbindlich machen',
      days_in_status: days,
      actions: [
        { type: 'call', label: 'Bestätigungs-Anruf + Termin fixieren', icon: 'pi pi-phone', primary: true },
        { type: 'book_meeting', label: 'Unterschriftstermin buchen', icon: 'pi pi-calendar-plus' },
      ],
    }
  }
  if (sub === 'negotiating') {
    return {
      urgency: days >= 3 ? 'high' : 'medium',
      reason: 'Preisverhandlung läuft — Finanzierung aktiv anbieten',
      days_in_status: days,
      actions: [
        { type: 'send_financing_info', label: 'Finanzierungs-Optionen senden', icon: 'pi pi-euro', primary: true },
        { type: 'call', label: 'Verhandlungs-Call', icon: 'pi pi-phone' },
        { type: 'mark_lost', label: 'Verloren (Preis)', icon: 'pi pi-times' },
      ],
    }
  }
  if (sub === 'awaiting_insurance_response') {
    if (days < 14) {
      return {
        urgency: 'low',
        reason: 'Wartet auf Kasse — Geduld, Erstkontakt zur Kasse erst nach 14 Tagen',
        days_in_status: days,
        actions: [
          { type: 'whatsapp', label: 'Höflicher Status-Check beim Patient', icon: 'pi pi-comments' },
        ],
      }
    }
    return {
      urgency: 'high',
      reason: `Kasse antwortet seit ${days} Tagen nicht — Patient aktivieren`,
      days_in_status: days,
      actions: [
        { type: 'call', label: 'Patient anrufen — Stand bei Kasse', icon: 'pi pi-phone', primary: true },
        { type: 'email', label: 'Erinnerungs-Mail mit Kassen-Brief-Vorlage', icon: 'pi pi-envelope', template_id: 'hkp-followup-second' },
      ],
    }
  }
  if (sub === 'awaiting_patient_review') {
    if (days < 7) {
      return {
        urgency: 'medium',
        reason: 'Patient prüft den HKP — geduldig sein, nach 7 Tagen nachfassen',
        days_in_status: days,
        actions: [
          { type: 'whatsapp', label: 'Freundliche Erinnerung', icon: 'pi pi-comments' },
        ],
      }
    }
    return {
      urgency: 'high',
      reason: `Patient prüft seit ${days} Tagen — jetzt Klärungs-Call`,
      days_in_status: days,
      actions: [
        { type: 'call', label: 'Klärungs-Anruf', icon: 'pi pi-phone', primary: true },
        { type: 'email', label: 'HKP-Klärungs-Mail', icon: 'pi pi-envelope', template_id: 'hkp-followup' },
      ],
    }
  }

  // Default ohne Sub-State (Legacy-Verhalten)
  if (days < 3) {
    return {
      urgency: 'medium',
      reason: 'HKP versandt — Patient prüft, Brevo-Open-Status beobachten',
      days_in_status: days,
      actions: [
        { type: 'status_change', label: 'Sub-Status setzen (genauer planen)', icon: 'pi pi-tag', primary: true },
        { type: 'whatsapp', label: 'Kurz nachfragen ob angekommen', icon: 'pi pi-comments', template_id: 'whatsapp-hkp-check' },
      ],
    }
  }
  if (days < 7) {
    return {
      urgency: 'high',
      reason: `HKP seit ${days} Tagen — Nachfass-Anruf jetzt! Patient unentschieden`,
      days_in_status: days,
      actions: [
        { type: 'call', label: 'Nachfass-Anruf', icon: 'pi pi-phone', primary: true, hint: 'Tonys-Beispiel: kritische Phase' },
        { type: 'email', label: 'HKP-Erinnerung mit Klärungsangebot', icon: 'pi pi-envelope', template_id: 'hkp-followup' },
        { type: 'send_financing_info', label: 'Finanzierungsoptionen senden', icon: 'pi pi-euro' },
      ],
    }
  }
  return {
    urgency: 'critical',
    reason: `HKP seit ${days} Tagen unbeantwortet — Lost-Risiko hoch`,
    days_in_status: days,
    actions: [
      { type: 'call', label: 'Anrufen (dringend)', icon: 'pi pi-phone', primary: true },
      { type: 'send_financing_info', label: 'Finanzierungsangebot', icon: 'pi pi-euro' },
      { type: 'mark_lost', label: 'Als verloren markieren (price/no_response)', icon: 'pi pi-times' },
    ],
  }
}

const rulesForHkpSigned = (lead: Lead, days: number): NextBestActionResult => {
  return {
    urgency: 'medium',
    reason: 'HKP unterschrieben — jetzt Behandlungstermin koordinieren',
    days_in_status: days,
    actions: [
      { type: 'book_meeting', label: 'Behandlungstermin buchen', icon: 'pi pi-calendar-plus', primary: true },
      { type: 'email', label: 'Behandlungsablauf + Anfahrt', icon: 'pi pi-envelope', template_id: 'pt-5' },
    ],
  }
}

const rulesForTreatmentScheduled = (lead: Lead, days: number): NextBestActionResult => {
  const apptInFuture = isAppointmentInFuture(lead)
  if (apptInFuture) {
    return {
      urgency: 'low',
      reason: 'Behandlungstermin steht — 24h+2h Reminder vorbereitet',
      days_in_status: days,
      actions: [
        { type: 'sms', label: '24h-Reminder', icon: 'pi pi-comment', template_id: 'appt-reminder-24h' },
        { type: 'whatsapp', label: 'Anfahrt + was mitbringen', icon: 'pi pi-comments' },
      ],
    }
  }
  return {
    urgency: 'high',
    reason: 'Behandlungstermin liegt in der Vergangenheit — Patient erschienen?',
    days_in_status: days,
    actions: [
      { type: 'status_change', label: '→ In Behandlung', icon: 'pi pi-arrow-right', primary: true },
      { type: 'mark_no_show', label: 'No-Show markieren', icon: 'pi pi-times-circle' },
      { type: 'call', label: 'Nachfassen', icon: 'pi pi-phone' },
    ],
  }
}

const rulesForTreatmentInProgress = (lead: Lead, days: number): NextBestActionResult => {
  return {
    urgency: 'low',
    reason: 'Behandlung läuft — nächste Session oder Abschluss?',
    days_in_status: days,
    actions: [
      { type: 'book_meeting', label: 'Folge-Session buchen', icon: 'pi pi-calendar-plus', primary: true },
      { type: 'status_change', label: '→ Abgeschlossen', icon: 'pi pi-check' },
    ],
  }
}

const rulesForCompleted = (lead: Lead, days: number): NextBestActionResult => {
  if (days < 3) {
    return {
      urgency: 'medium',
      reason: 'Behandlung gerade abgeschlossen — Bewertungs-Anfrage 5-7 Tage später senden',
      days_in_status: days,
      actions: [
        { type: 'whatsapp', label: 'Danke + Heilungs-Tipps', icon: 'pi pi-comments' },
      ],
    }
  }
  if (days < 14) {
    return {
      urgency: 'medium',
      reason: 'Idealer Zeitpunkt für Bewertungs-Anfrage',
      days_in_status: days,
      actions: [
        { type: 'request_review', label: 'Google-Review anfragen', icon: 'pi pi-star', primary: true, template_id: 'pt-3' },
        { type: 'email', label: 'Nachsorge-Newsletter', icon: 'pi pi-envelope' },
      ],
    }
  }
  return {
    urgency: 'low',
    reason: 'Bestandspatient — Cross-Sell / Newsletter-Liste',
    days_in_status: days,
    actions: [
      { type: 'email', label: 'Newsletter-Liste aktivieren', icon: 'pi pi-megaphone' },
    ],
  }
}

const rulesForLost = (lead: Lead, days: number): NextBestActionResult => {
  if (days < 90) {
    return {
      urgency: 'low',
      reason: `Reaktivierung möglich ab Tag 90 (${90 - days} Tage verbleibend)`,
      days_in_status: days,
      actions: [],
    }
  }
  return {
    urgency: 'medium',
    reason: `${days} Tage verloren — Reaktivierung versuchen`,
    days_in_status: days,
    actions: [
      { type: 'reactivation', label: 'Reactivation-Mail senden', icon: 'pi pi-refresh', primary: true, template_id: 'pt-2' },
      { type: 'call', label: 'Persönlicher Anruf', icon: 'pi pi-phone' },
    ],
  }
}

// Helper: prüft ob lead.date_time in der Zukunft liegt (lead.date_time ist nächster Termin)
const isAppointmentInFuture = (lead: Lead): boolean => {
  if (!lead.date_time) return true // unbekannt → optimistisch
  return new Date(lead.date_time).getTime() > Date.now()
}
