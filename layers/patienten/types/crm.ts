// Types for the Praxis CRM — maps to Directus "Leads" collection

export type LeadStatus =
  | 'open'
  | 'contacted'
  | 'contacted_twice'
  | 'scheduled'
  | 'rescheduling'
  | 'email_sendet'
  | 'hkp_sended'
  | 'done'
  | 'cancelled'

export const LEAD_STATUSES: LeadStatus[] = [
  'open',
  'contacted',
  'contacted_twice',
  'scheduled',
  'rescheduling',
  'email_sendet',
  'hkp_sended',
  'done',
  'cancelled',
]

export const LEAD_STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bgColor: string }> = {
  open:             { label: 'Offen',              color: '#94a3b8', bgColor: '#f1f5f9' },
  contacted:        { label: 'Kontaktiert',        color: '#60a5fa', bgColor: '#eff6ff' },
  contacted_twice:  { label: '2x Kontaktiert',     color: '#3b82f6', bgColor: '#dbeafe' },
  scheduled:        { label: 'Termin ausgemacht',   color: '#34d399', bgColor: '#ecfdf5' },
  rescheduling:     { label: 'Rescheduling',        color: '#fbbf24', bgColor: '#fffbeb' },
  email_sendet:     { label: 'Email versendet',     color: '#a78bfa', bgColor: '#f5f3ff' },
  hkp_sended:       { label: 'HKP verschickt',     color: '#f97316', bgColor: '#fff7ed' },
  done:             { label: 'Won',                 color: '#22c55e', bgColor: '#f0fdf4' },
  cancelled:        { label: 'Lost',                color: '#f87171', bgColor: '#fef2f2' },
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

export type LostReason =
  | 'too_expensive'
  | 'no_budget'
  | 'missing_trust'
  | 'distance_too_far'
  | 'personal_reasons'
  | 'other_dentist'
  | 'no-contact-information'
  | 'language-barrier'

export const LOST_REASON_LABELS: Record<LostReason, string> = {
  too_expensive: 'Zu teuer',
  no_budget: 'Kein Kapital',
  missing_trust: 'Fehlendes Vertrauen',
  distance_too_far: 'Distanz zu weit',
  personal_reasons: 'Persönliche Gründe',
  other_dentist: 'Anderer Zahnarzt',
  'no-contact-information': 'Keine Kontaktmöglichkeit',
  'language-barrier': 'Sprachliche Barriere',
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
  status: LeadStatus
  query_params?: Record<string, any> | Array<{ name: string; value: string; timestamp: string }>
  newsletter_accepted_time?: string
  Tags?: string[] | null
  oportunity_value?: number
  revenue?: number
  follow_up?: string
  lead_source?: LeadSource
  missed_appointments?: number
  lost_reason?: LostReason
  date_created: string
  date_updated: string
  user_created?: string
  user_updated?: string
}

// ─── Activities ───────────────────────────────────────────────

export type LeadActivityType = 'note' | 'call' | 'email' | 'email_sent' | 'email_received' | 'sms' | 'whatsapp' | 'meeting' | 'task' | 'newsletter' | 'stage_change'

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
  stage_change:   { label: 'Status',         icon: 'pi pi-arrows-h',    color: '#94a3b8', bgColor: '#f1f5f9' },
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
