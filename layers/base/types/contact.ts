export type ContactType =
  | 'ansprechpartner'
  | 'bewohner'
  | 'patient_lead'
  | 'zahnarzt'
  | 'angehoeriger'

export type LeadSource =
  | 'pflegeheim'
  | 'praxis'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'google'
  | 'bing'
  | 'empfehlung'
  | 'organic'
  | 'other'

export type PipelineStatus =
  | 'open'
  | 'contacted'
  | 'contacted_twice'
  | 'scheduled'
  | 'rescheduling'
  | 'email_sent'
  | 'hkp_sent'
  | 'done'
  | 'cancelled'

export interface Contact {
  id: string
  contact_type: ContactType
  first_name: string
  last_name: string
  email?: string
  phone?: string
  status?: PipelineStatus
  lead_score?: number
  opportunity_value?: number
  revenue?: number
  source_type?: LeadSource
  source_organization?: string
  source_campaign?: string
  referred_by_contact?: string
  dental_service?: string
  follow_up?: string
  lost_reason?: string
  gdpr_accepted?: string
  newsletter_opt_in?: boolean
  missed_appointments?: number
  organization?: string
  role?: string
  tags?: string[]
  message?: string
  date_created?: string
  date_updated?: string
  user_created?: string
}
