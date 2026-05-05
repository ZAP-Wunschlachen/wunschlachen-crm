export type ActivityType =
  | 'note'
  | 'call'
  | 'email'
  | 'email_sent'
  | 'email_received'
  | 'sms'
  | 'whatsapp'
  | 'meeting'
  | 'task'
  | 'newsletter'
  | 'stage_change'
  | 'voice_ai'
  | 'document'

export type ActivityDirection = 'inbound' | 'outbound'

export type ActivityOutcome =
  | 'successful'
  | 'no_contact'
  | 'callback'
  | 'rejection'
  | 'voicemail'
  | 'qualified'
  | 'not_qualified'

export interface Activity {
  id: string
  type: ActivityType
  subject?: string
  content?: string
  direction?: ActivityDirection
  outcome?: ActivityOutcome
  duration?: number
  contact?: string
  organization?: string
  deal?: string
  ai_score?: number
  ai_transcript?: string
  metadata?: Record<string, any>
  date_created?: string
  user_created?: string
}
