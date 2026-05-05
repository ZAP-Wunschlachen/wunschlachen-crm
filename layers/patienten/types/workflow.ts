// types/workflow.ts — Workflow automation types for Praxis CRM

// ─── Trigger ───────────────────────────────────────────────
export type WorkflowTriggerType = 'stage_change' | 'new_lead' | 'follow_up_due' | 'manual'

export const WORKFLOW_TRIGGER_TYPES: { value: WorkflowTriggerType; label: string }[] = [
  { value: 'stage_change', label: 'Status-Änderung' },
  { value: 'new_lead', label: 'Neuer Lead' },
  { value: 'follow_up_due', label: 'Follow-up fällig' },
  { value: 'manual', label: 'Manuell' },
]

// ─── Step Types ────────────────────────────────────────────
export type WorkflowStepType = 'email' | 'sms' | 'whatsapp' | 'wait' | 'task' | 'condition' | 'newsletter'

export const WORKFLOW_STEP_TYPES: { value: WorkflowStepType; label: string; icon: string }[] = [
  { value: 'email', label: 'E-Mail', icon: 'pi pi-envelope' },
  { value: 'sms', label: 'SMS', icon: 'pi pi-comment' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'pi pi-comments' },
  { value: 'wait', label: 'Warten', icon: 'pi pi-clock' },
  { value: 'task', label: 'Aufgabe', icon: 'pi pi-check-square' },
  { value: 'condition', label: 'Bedingung', icon: 'pi pi-question-circle' },
  { value: 'newsletter', label: 'Newsletter', icon: 'pi pi-megaphone' },
]

// ─── Step Configs ──────────────────────────────────────────
export interface WorkflowStepEmailConfig {
  template_id?: string
  delay_days?: number
}

export interface WorkflowStepSmsConfig {
  message: string
}

export interface WorkflowStepWhatsAppConfig {
  message: string
}

export interface WorkflowStepWaitConfig {
  days: number
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
  subject: string
  message: string
}

export type WorkflowStepConfig =
  | WorkflowStepEmailConfig
  | WorkflowStepSmsConfig
  | WorkflowStepWhatsAppConfig
  | WorkflowStepWaitConfig
  | WorkflowStepTaskConfig
  | WorkflowStepConditionConfig
  | WorkflowStepNewsletterConfig

// ─── Step & Workflow ───────────────────────────────────────
export interface WorkflowStep {
  id: string
  type: WorkflowStepType
  label?: string
  config: WorkflowStepConfig
}

export interface Workflow {
  id: string
  name: string
  description?: string
  trigger_type: WorkflowTriggerType
  trigger_config?: { from_status?: string; to_status?: string }
  steps: WorkflowStep[]
  is_active: boolean
  date_created?: string
  date_updated?: string
}

// ─── Workflow Run ──────────────────────────────────────────
export interface WorkflowRunLogEntry {
  step_index: number
  step_type: WorkflowStepType
  status: 'done' | 'error' | 'skipped'
  message: string
  timestamp: string
}

export interface WorkflowRun {
  id: string
  workflow_id: string
  lead_id: string
  lead_name?: string
  status: 'running' | 'completed' | 'failed' | 'paused'
  current_step?: number
  started_at: string
  completed_at?: string
  log: WorkflowRunLogEntry[]
}
