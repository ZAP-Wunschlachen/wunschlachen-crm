// Types for the Praxis CRM — maps to Directus "Leads" collection
//
// Status-Modell v2 (Plan v9, 2026-05-12):
// 11 Status entlang des Dental-Implantat-Funnels + No-Show als Counter, nicht eigener Status.
// State-Machine + erlaubte Übergänge in useLeadStatusTransitions.ts.

export type LeadStatus =
  // Phase 1 — Akquise
  | 'new'                       // Lead frisch eingegangen, noch nicht kontaktiert
  | 'contacting'                // Anruf-Versuche laufen (Counter: contact_attempts)
  | 'contacted'                 // Erstgespräch erfolgt, Interesse-Check
  // Phase 2 — Beratung
  | 'consultation_scheduled'    // Erstuntersuchung (15 Min) terminiert
  | 'consultation_done'         // Erstuntersuchung erfolgt, HKP wird erstellt
  // Phase 3 — Angebot
  | 'hkp_sent'                  // Heil- und Kostenplan versandt, Patient prüft
  | 'hkp_signed'                // Patient hat HKP unterschrieben
  // Phase 4 — Behandlung
  | 'treatment_scheduled'       // Behandlungs-Termin gebucht
  | 'treatment_in_progress'     // Behandlung läuft (1+ Sessions)
  | 'completed'                 // Behandlung abgeschlossen — wird Bestandspatient
  // Verloren
  | 'lost'                      // verloren mit Reason (siehe LostReason)

export const LEAD_STATUSES: LeadStatus[] = [
  'new',
  'contacting',
  'contacted',
  'consultation_scheduled',
  'consultation_done',
  'hkp_sent',
  'hkp_signed',
  'treatment_scheduled',
  'treatment_in_progress',
  'completed',
  'lost',
]

/**
 * Pipeline-Phasen für Kanban/Visualisierung (5 Spalten, "lost" außerhalb).
 * Jeder Status gehört zu genau einer Phase.
 */
export type PipelinePhase = 'akquise' | 'beratung' | 'angebot' | 'behandlung' | 'abgeschlossen'

export const STATUS_TO_PHASE: Record<LeadStatus, PipelinePhase | null> = {
  new: 'akquise',
  contacting: 'akquise',
  contacted: 'akquise',
  consultation_scheduled: 'beratung',
  consultation_done: 'beratung',
  hkp_sent: 'angebot',
  hkp_signed: 'angebot',
  treatment_scheduled: 'behandlung',
  treatment_in_progress: 'behandlung',
  completed: 'abgeschlossen',
  lost: null, // wird in einer separaten Spalte oder als Filter dargestellt
}

export const PIPELINE_PHASE_CONFIG: Record<PipelinePhase, { label: string; color: string }> = {
  akquise:       { label: 'Akquise',      color: '#94a3b8' },
  beratung:      { label: 'Beratung',     color: '#60a5fa' },
  angebot:       { label: 'Angebot',      color: '#fbbf24' },
  behandlung:    { label: 'Behandlung',   color: '#3b82f6' },
  abgeschlossen: { label: 'Abgeschlossen', color: '#22c55e' },
}

export const LEAD_STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bgColor: string; description?: string }> = {
  new: {
    label: 'Neu',
    color: '#94a3b8', bgColor: '#f1f5f9',
    description: 'Lead ist frisch eingegangen — Speed-to-Lead: in den nächsten Minuten kontaktieren',
  },
  contacting: {
    label: 'In Erreichung',
    color: '#fbbf24', bgColor: '#fffbeb',
    description: 'Wir versuchen den Patienten zu erreichen (siehe contact_attempts)',
  },
  contacted: {
    label: 'Erreicht',
    color: '#60a5fa', bgColor: '#eff6ff',
    description: 'Patient erreicht, Interesse besteht — Termin vorschlagen',
  },
  consultation_scheduled: {
    label: 'Beratung geplant',
    color: '#a78bfa', bgColor: '#f5f3ff',
    description: 'Erstuntersuchung terminiert — Reminder + Anfahrt',
  },
  consultation_done: {
    label: 'Beratung erfolgt',
    color: '#22d3ee', bgColor: '#ecfeff',
    description: 'Beratung war, HKP wird vorbereitet',
  },
  hkp_sent: {
    label: 'HKP versandt',
    color: '#f97316', bgColor: '#fff7ed',
    description: 'Kostenvoranschlag draußen — kritische Phase, nachfassen!',
  },
  hkp_signed: {
    label: 'HKP unterschrieben',
    color: '#84cc16', bgColor: '#f7fee7',
    description: 'Patient hat zugesagt — jetzt Behandlungstermin vereinbaren',
  },
  treatment_scheduled: {
    label: 'Behandlung geplant',
    color: '#3b82f6', bgColor: '#dbeafe',
    description: 'Behandlungstermin steht — Reminder 24h+2h vorher',
  },
  treatment_in_progress: {
    label: 'In Behandlung',
    color: '#2563eb', bgColor: '#dbeafe',
    description: 'Behandlung läuft (kann mehrere Sessions sein)',
  },
  completed: {
    label: 'Abgeschlossen',
    color: '#22c55e', bgColor: '#f0fdf4',
    description: 'Behandlung fertig — Patient wird Bestandskunde, Bewertung anfragen',
  },
  lost: {
    label: 'Verloren',
    color: '#f87171', bgColor: '#fef2f2',
    description: 'Lead verloren — Reaktivierung nach 90 Tagen prüfen',
  },
}

export type LeadSource = 'tiktok' | 'facebook' | 'instagram' | 'google' | 'bing' | 'referral'

export const LEAD_SOURCE_CONFIG: Record<LeadSource, { label: string; icon: string }> = {
  tiktok:    { label: 'TikTok',     icon: 'pi pi-video' },
  facebook:  { label: 'Facebook',   icon: 'pi pi-facebook' },
  instagram: { label: 'Instagram',  icon: 'pi pi-instagram' },
  google:    { label: 'Google',     icon: 'pi pi-google' },
  bing:      { label: 'Bing',       icon: 'pi pi-search' },
  referral:  { label: 'Empfehlung', icon: 'pi pi-users' },
}

/**
 * Endgültige Lost-Reasons — Patient ist final raus.
 * Für temporäre Verhinderungen (Krankheit, Termin-Konflikt) → RescheduleReason +
 * markAsRescheduled (Status springt zurück statt auf 'lost').
 */
export type LostReason =
  | 'not_interested'
  | 'too_expensive'
  | 'no_budget'
  | 'competitor'
  | 'no_response'
  | 'distance_too_far'
  | 'health_unfit'         // medizinisch nicht (mehr) geeignet — final
  | 'language_barrier'
  | 'personal_reasons'
  | 'other'

export const LOST_REASON_LABELS: Record<LostReason, string> = {
  not_interested:    'Kein Interesse',
  too_expensive:     'Zu teuer',
  no_budget:         'Kein Budget / Finanzierung abgelehnt',
  competitor:        'Anderer Anbieter gewählt',
  no_response:       'Patient antwortet nicht mehr',
  distance_too_far:  'Entfernung zu groß',
  health_unfit:      'Medizinisch nicht geeignet',
  language_barrier:  'Sprachliche Barriere',
  personal_reasons:  'Persönliche Gründe',
  other:             'Sonstiges',
}

/**
 * Reschedule-Reasons (Plan v9, Iteration 2):
 * Patient ist temporär verhindert, Lead bleibt im Funnel. Status springt zurück
 * auf NO_SHOW_FALLBACK + reschedule_count +1 + follow_up wird gesetzt.
 */
export type RescheduleReason =
  | 'illness'
  | 'work_conflict'
  | 'personal'
  | 'short_notice'
  | 'other'

export const RESCHEDULE_REASON_LABELS: Record<RescheduleReason, string> = {
  illness:       'Krankheit',
  work_conflict: 'Beruflich verhindert',
  personal:      'Privater Grund',
  short_notice:  'Zu kurzfristig — anderer Termin gewünscht',
  other:         'Sonstiges',
}

/**
 * HKP-Sub-States (Plan v9 Phase E) — feingranulare Zustände innerhalb `hkp_sent`.
 * Optional. Wird im Lead-Detail per Picker gesetzt, beeinflusst Nachfass-Empfehlung.
 */
export type HkpSubState =
  | 'awaiting_patient_review'      // Patient prüft den HKP
  | 'awaiting_insurance_response'  // Kasse prüft Kostenübernahme
  | 'negotiating'                  // Preisverhandlung läuft
  | 'ready_to_sign'                // Patient hat Bereitschaft signalisiert

export const HKP_SUBSTATE_CONFIG: Record<HkpSubState, {
  label: string
  color: string
  bgColor: string
  followup_days: number
  hint: string
}> = {
  awaiting_patient_review: {
    label: 'Patient prüft',
    color: '#fbbf24', bgColor: '#fffbeb',
    followup_days: 7,
    hint: 'Nachfass nach einer Woche, falls keine Rückmeldung',
  },
  awaiting_insurance_response: {
    label: 'Wartet auf Kasse',
    color: '#60a5fa', bgColor: '#eff6ff',
    followup_days: 14,
    hint: 'Kassen brauchen oft 2 Wochen; danach freundlicher Status-Check',
  },
  negotiating: {
    label: 'In Verhandlung',
    color: '#f97316', bgColor: '#ffedd5',
    followup_days: 3,
    hint: 'Kurze Schlagzahl bei Preisverhandlung — Finanzierungs-Angebot bereithalten',
  },
  ready_to_sign: {
    label: 'Bereit zu unterschreiben',
    color: '#22c55e', bgColor: '#dcfce7',
    followup_days: 1,
    hint: 'Letzter Push — Abschluss-Termin direkt anbieten',
  },
}

export interface Lead {
  id: string
  first_name: string
  last_name: string
  mail?: string
  phone?: string
  location?: string | { id: string; name?: string }
  message?: string
  date_time?: string
  dental_service?: string | { id: string; name?: string }
  GDPR_accepted_at?: string

  // Status-Modell v2
  status: LeadStatus
  contact_attempts?: number             // Counter im Status 'contacting': wie oft probiert
  missed_appointments?: number          // Counter: No-Shows insgesamt (Termine + Behandlungen)
  last_status_change_at?: string        // ISO timestamp: wann der aktuelle Status begonnen hat
  is_customer?: boolean                 // true sobald jemals 'completed' erreicht — Bestandspatient-Flag
  lost_reason?: LostReason              // nur gesetzt wenn status='lost'
  reactivation_due_at?: string          // ISO timestamp: wann re-engaged werden soll (lost + 90 T)
  hkp_substate?: HkpSubState            // Plan v9 Phase E: nur gesetzt wenn status='hkp_sent'
  reschedule_count?: number             // Counter: Patient hat Termin proaktiv verschoben (≠ no_show)
  last_reschedule_reason?: RescheduleReason // letzter Grund für Termin-Verschiebung

  // Welcome-Sequenz (Plan v9 Modul A MVP)
  welcome_sequence_started_at?: string  // ISO timestamp: Sign-up / Sequenz-Start
  welcome_sequence_position?: number    // 0 = noch nicht gestartet, 1-6 = letzte versandte Mail
  welcome_sequence_paused_at?: string   // ISO timestamp: pausiert (z.B. consultation_scheduled erreicht)

  query_params?: Record<string, any> | Array<{ name: string; value: string; timestamp: string }>
  newsletter_accepted_time?: string
  Tags?: string[] | null
  oportunity_value?: number
  revenue?: number
  follow_up?: string
  lead_source?: LeadSource

  date_created: string
  date_updated: string
  user_created?: string
  user_updated?: string
}

// ─── Activities ───────────────────────────────────────────────

export type LeadActivityType = 'note' | 'call' | 'email' | 'email_sent' | 'email_received' | 'sms' | 'whatsapp' | 'meeting' | 'task' | 'newsletter' | 'stage_change' | 'no_show' | 'reschedule' | 'lost_rollback'

export type ActivityDirection = 'inbound' | 'outbound'
export type ActivityOutcome = 'successful' | 'no_contact' | 'callback' | 'rejection'

export interface LeadActivity {
  id: string              // crypto.randomUUID()
  lead_id: string         // FK to Leads.id
  type: LeadActivityType
  subject: string         // Title/summary
  content?: string        // Detailed notes
  direction?: ActivityDirection    // For call/email
  outcome?: ActivityOutcome       // For all types
  duration_minutes?: number       // For call/meeting
  metadata?: {
    meeting_date?: string
    meeting_time?: string
    from_status?: LeadStatus      // bei type='stage_change' | 'reschedule' | 'lost_rollback'
    to_status?: LeadStatus        // bei type='stage_change' | 'reschedule' | 'lost_rollback'
    reschedule_reason?: RescheduleReason // bei type='reschedule'
    follow_up_at?: string         // bei type='reschedule' — vorgemerktes Wiedervorlage-Datum
  }
  date_created: string    // ISO timestamp
  user_name: string       // Auto-populated from useAuth
}

export const ACTIVITY_TYPE_CONFIG: Record<LeadActivityType, { label: string; icon: string; color: string; bgColor: string }> = {
  note:           { label: 'Notiz',          icon: 'pi pi-pencil',       color: '#6b7280', bgColor: '#f3f4f6' },
  call:           { label: 'Anruf',          icon: 'pi pi-phone',        color: '#22c55e', bgColor: '#f0fdf4' },
  email:          { label: 'E-Mail',         icon: 'pi pi-send',         color: '#3b82f6', bgColor: '#eff6ff' },
  email_sent:     { label: 'E-Mail (out)',   icon: 'pi pi-send',         color: '#3b82f6', bgColor: '#eff6ff' },
  email_received: { label: 'E-Mail (in)',    icon: 'pi pi-inbox',        color: '#6366f1', bgColor: '#eef2ff' },
  sms:            { label: 'SMS',            icon: 'pi pi-comment',      color: '#8b5cf6', bgColor: '#f5f3ff' },
  whatsapp:       { label: 'WhatsApp',       icon: 'pi pi-comments',     color: '#22c55e', bgColor: '#f0fdf4' },
  meeting:        { label: 'Termin',         icon: 'pi pi-calendar',     color: '#f97316', bgColor: '#fff7ed' },
  task:           { label: 'Aufgabe',        icon: 'pi pi-check-square', color: '#14b8a6', bgColor: '#f0fdfa' },
  newsletter:     { label: 'Newsletter',     icon: 'pi pi-megaphone',    color: '#ec4899', bgColor: '#fdf2f8' },
  stage_change:   { label: 'Status-Wechsel', icon: 'pi pi-arrows-h',     color: '#94a3b8', bgColor: '#f1f5f9' },
  no_show:        { label: 'Nicht erschienen', icon: 'pi pi-times-circle', color: '#ef4444', bgColor: '#fee2e2' },
  reschedule:     { label: 'Termin verschoben', icon: 'pi pi-clock',     color: '#f59e0b', bgColor: '#fef3c7' },
  lost_rollback:  { label: 'Lead zurückgeholt', icon: 'pi pi-undo',       color: '#22c55e', bgColor: '#f0fdf4' },
}

export const ACTIVITY_DIRECTION_LABELS: Record<ActivityDirection, string> = {
  inbound: 'Eingehend',
  outbound: 'Ausgehend',
}

export const ACTIVITY_OUTCOME_LABELS: Record<ActivityOutcome, string> = {
  successful: 'Erfolgreich',
  no_contact: 'Nicht erreicht',
  callback: 'Rückruf',
  rejection: 'Ablehnung',
}
