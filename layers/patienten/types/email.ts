// types/email.ts — Email template and Brevo config types

export type EmailTemplateCategory =
  | 'erstansprache'
  | 'follow_up'
  | 'termin_erinnerung'
  | 'nachsorge'
  | 'reactivation'
  | 'hkp'
  | 'review_request'
  | 'allgemein'

export const EMAIL_TEMPLATE_CATEGORIES: { value: EmailTemplateCategory; label: string }[] = [
  { value: 'erstansprache', label: 'Erstansprache' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'termin_erinnerung', label: 'Termin-Erinnerung' },
  { value: 'hkp', label: 'HKP / Heil- und Kostenplan' },
  { value: 'reactivation', label: 'Reaktivierung' },
  { value: 'review_request', label: 'Bewertungs-Anfrage' },
  { value: 'nachsorge', label: 'Nachsorge' },
  { value: 'allgemein', label: 'Allgemein' },
]

export interface EmailTemplate {
  id: string
  /** Stabiler Lookup-Key (z.B. `reactivation-financing`). Optional für Legacy-Templates. */
  key?: string
  name: string
  subject: string
  body_html: string
  category: EmailTemplateCategory
  variables?: string[] | null
  /** Brevo-Template-ID, falls vorausgewählt in Brevo-UI gepflegt. */
  brevo_template_id?: number | null
  /** Empfohlene Status-Wechsel — UI kann Filter darauf anwenden. */
  for_status?: string[] | null
  is_active: boolean
  date_created?: string
  date_updated?: string
}

export interface BrevoConfig {
  apiKey: string
  senderEmail: string
  senderName: string
  senderPhone?: string
}

export interface BrevoEmailParams {
  to: { email: string; name?: string }[]
  subject: string
  htmlContent: string
  textContent?: string
  tags?: string[]
}
