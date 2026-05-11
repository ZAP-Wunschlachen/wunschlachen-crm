// Types für das Pflegeheim-Sales-CRM (B2B)
// NursingHome-Type wird aus ./nursing-home re-exportiert (erweiterte Variante mit date_created/date_updated)

export type { NursingHome, NursingHomeListOptions } from './nursing-home'
import type { NursingHome } from './nursing-home'

export type OpportunityStage =
  | 'Unqualified'
  | 'Qualified'
  | 'Follow-up'
  | 'Email'
  | 'Presentation'
  | 'Emergency Phone'
  | 'Further Education'
  | 'Won'
  | 'Lost'
  | 'Cancelled'

export const PIPELINE_STAGES: OpportunityStage[] = [
  'Unqualified',
  'Qualified',
  'Follow-up',
  'Email',
  'Presentation',
  'Emergency Phone',
  'Further Education',
  'Won',
  'Lost',
  'Cancelled',
]

export const STAGE_COLORS: Record<OpportunityStage, string> = {
  'Unqualified': '#94a3b8',
  'Qualified': '#60a5fa',
  'Follow-up': '#fbbf24',
  'Email': '#a78bfa',
  'Presentation': '#f97316',
  'Emergency Phone': '#fb923c',
  'Further Education': '#818cf8',
  'Won': '#34d399',
  'Lost': '#f87171',
  'Cancelled': '#6b7280',
}

export type Priority = 'high' | 'medium' | 'low'

export interface NursingHomeLead {
  id: string
  nursing_home_id: string | NursingHome
  opportunity_stage: OpportunityStage
  user_id?: string
  priority?: Priority
  follow_up_date?: string
  has_cooperation_partner?: boolean
  closest_nursing_home?: string
  documents?: CrmDocument[] | null
  date_created: string
  date_updated: string
  user_created?: string
  user_updated?: string
}

export interface NursingHomeContact {
  id: string
  nursing_home_id: string | { id: string; name?: string; city?: string }
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  mobile?: string
  job_title?: string
  is_primary?: boolean
}

// Activity types
export type ActivityType =
  | 'call'
  | 'email_sent'
  | 'email_received'
  | 'sms'
  | 'whatsapp'
  | 'meeting'
  | 'note'
  | 'stage_change'
  | 'task'
  | 'document'
  | 'newsletter'

export const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: 'call', label: 'Anruf' },
  { value: 'email_sent', label: 'E-Mail gesendet' },
  { value: 'email_received', label: 'E-Mail erhalten' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'meeting', label: 'Termin' },
  { value: 'note', label: 'Notiz' },
  { value: 'stage_change', label: 'Status-Änderung' },
  { value: 'task', label: 'Aufgabe' },
  { value: 'document', label: 'Dokument' },
  { value: 'newsletter', label: 'Newsletter' },
]

export type ActivityDirection = 'inbound' | 'outbound'
export type ActivityOutcome = 'successful' | 'no_contact' | 'callback' | 'rejection'

export const ACTIVITY_OUTCOMES: { value: ActivityOutcome; label: string }[] = [
  { value: 'successful', label: 'Erfolgreich' },
  { value: 'no_contact', label: 'Kein Kontakt' },
  { value: 'callback', label: 'Rückruf' },
  { value: 'rejection', label: 'Ablehnung' },
]

export interface CrmActivity {
  id: string
  nursing_home_lead_id: string | NursingHomeLead
  nursing_home_id?: string | NursingHome | null
  contact_id?: string | NursingHomeContact | null
  type: ActivityType
  subject: string
  content?: string | null
  direction?: ActivityDirection | null
  outcome?: ActivityOutcome | null
  duration_minutes?: number | null
  metadata?: Record<string, any> | null
  user_created?: string | { first_name?: string; last_name?: string; email?: string }
  date_created?: string
  user_updated?: string
  date_updated?: string
}

// Email templates
export type EmailTemplateCategory = 'outreach' | 'follow_up' | 'onboarding' | 'presentation' | 'general'

export const EMAIL_TEMPLATE_CATEGORIES: { value: EmailTemplateCategory; label: string }[] = [
  { value: 'outreach', label: 'Erstansprache' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'presentation', label: 'Präsentation' },
  { value: 'general', label: 'Allgemein' },
]

export interface CrmEmailTemplate {
  id: string
  name: string
  subject: string
  body_html: string
  category: EmailTemplateCategory
  variables?: string[] | null
  is_active: boolean
  date_created?: string
  date_updated?: string
  user_created?: string
}

// Documents
export type DocumentCategory = 'contract' | 'presentation' | 'onboarding' | 'correspondence' | 'other'

export const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: 'contract', label: 'Vertrag' },
  { value: 'presentation', label: 'Präsentation' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'correspondence', label: 'Korrespondenz' },
  { value: 'other', label: 'Sonstiges' },
]

export interface CrmDocument {
  id: string
  nursing_home_lead_id: string
  file_id: string | { id: string; filename_download?: string; type?: string; filesize?: number }
  category: DocumentCategory
  name: string
  notes?: string | null
  date_created?: string
  user_created?: string | { first_name?: string; last_name?: string }
}

// Smart Views
export interface CrmSmartView {
  id: string
  name: string
  filters: Record<string, any>
  sort?: Record<string, any> | null
  icon?: string | null
  is_shared: boolean
  date_created?: string
  user_created?: string
}

// Workflow types
export type WorkflowTriggerType = 'stage_change' | 'new_lead' | 'follow_up_due' | 'manual'

export const WORKFLOW_TRIGGER_TYPES: { value: WorkflowTriggerType; label: string }[] = [
  { value: 'stage_change', label: 'Status-Änderung' },
  { value: 'new_lead', label: 'Neuer Lead' },
  { value: 'follow_up_due', label: 'Follow-up fällig' },
  { value: 'manual', label: 'Manuell' },
]

export type WorkflowStepType = 'email' | 'wait' | 'sms' | 'task' | 'condition' | 'newsletter'

export const WORKFLOW_STEP_TYPES: { value: WorkflowStepType; label: string; icon: string }[] = [
  { value: 'email', label: 'E-Mail', icon: 'pi pi-envelope' },
  { value: 'newsletter', label: 'Newsletter', icon: 'pi pi-megaphone' },
  { value: 'wait', label: 'Warten', icon: 'pi pi-clock' },
  { value: 'sms', label: 'SMS / WhatsApp', icon: 'pi pi-comments' },
  { value: 'task', label: 'Aufgabe', icon: 'pi pi-check-square' },
  { value: 'condition', label: 'Bedingung', icon: 'pi pi-sitemap' },
]

export interface WorkflowStepEmailConfig {
  template_id?: string
  delay_days?: number
}

export interface WorkflowStepWaitConfig {
  days: number
}

export interface WorkflowStepSmsConfig {
  message: string
}

export interface WorkflowStepTaskConfig {
  description: string
}

export interface WorkflowStepConditionConfig {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value: string
}

export interface WorkflowStepNewsletterConfig {
  topic_id?: string
  frequency?: 'einmalig' | 'monatlich' | 'quartalsweise'
}

export type WorkflowStepConfig =
  | WorkflowStepEmailConfig
  | WorkflowStepWaitConfig
  | WorkflowStepSmsConfig
  | WorkflowStepTaskConfig
  | WorkflowStepConditionConfig
  | WorkflowStepNewsletterConfig

export interface WorkflowStep {
  id: string
  type: WorkflowStepType
  label?: string
  config: WorkflowStepConfig
}

export interface CrmWorkflow {
  id: string
  name: string
  description?: string | null
  trigger_type: WorkflowTriggerType
  steps: WorkflowStep[]
  is_active: boolean
  date_created?: string
  date_updated?: string
  user_created?: string
  user_updated?: string
}

export type WorkflowRunStatus = 'running' | 'completed' | 'failed' | 'paused'

export interface CrmWorkflowRun {
  id: string
  workflow_id: string | CrmWorkflow
  nursing_home_lead_id: string | NursingHomeLead
  status: WorkflowRunStatus
  current_step?: number | null
  started_at: string
  completed_at?: string | null
  log?: Record<string, any>[] | null
}

// User roles
export type UserRole = 'sales' | 'customer' | 'admin'

export interface AppUser {
  id: string
  email: string
  first_name?: string
  last_name?: string
  role: string
  nursing_home?: string
}
