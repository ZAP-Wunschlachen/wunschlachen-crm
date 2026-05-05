// types/analytics.ts — Analytics, scoring, and export types

import type { LeadStatus, LeadSource } from './crm'

// ─── Date Range ──────────────────────────────────────────────

export type DateRangePreset = 'month' | 'quarter' | 'year'

export interface DateRange {
  from: Date
  to: Date
  preset: DateRangePreset
}

// ─── Pipeline Analytics ──────────────────────────────────────

export const STATUS_WEIGHTS: Partial<Record<LeadStatus, number>> = {
  open: 0.10,
  contacted: 0.20,
  contacted_twice: 0.30,
  scheduled: 0.50,
  rescheduling: 0.40,
  email_sendet: 0.60,
  hkp_sended: 0.80,
}

export interface PipelineKPIs {
  pipelineValue: number
  weightedForecast: number
  wonRevenue: number
  conversionRate: number
  conversionCount: { won: number; total: number }
}

// ─── Lead Scoring ────────────────────────────────────────────

export type ScoringRuleId =
  | 'treatment_value'
  | 'activity_count'
  | 'lead_source'
  | 'response_time'
  | 'appointment_behavior'
  | 'follow_up_status'

export interface ScoringRule {
  id: ScoringRuleId
  label: string
  description: string
  defaultWeight: number
}

export const SCORING_RULES: ScoringRule[] = [
  {
    id: 'treatment_value',
    label: 'Behandlungswert',
    description: 'Skaliert auf Basis von oportunity_value (max = höchster Wert aller Leads)',
    defaultWeight: 25,
  },
  {
    id: 'activity_count',
    label: 'Aktivitäten-Anzahl',
    description: 'Basierend auf Anzahl Activities (5+ = 100)',
    defaultWeight: 20,
  },
  {
    id: 'lead_source',
    label: 'Lead-Quelle',
    description: 'Referral: 100, Google: 80, Bing: 70, Facebook: 60, Instagram: 50, TikTok: 40',
    defaultWeight: 15,
  },
  {
    id: 'response_time',
    label: 'Reaktionszeit',
    description: '<1h: 100, <4h: 75, <24h: 50, <72h: 25, >72h: 0',
    defaultWeight: 15,
  },
  {
    id: 'appointment_behavior',
    label: 'Termin-Verhalten',
    description: 'Attended-Rate basierend auf missed_appointments',
    defaultWeight: 15,
  },
  {
    id: 'follow_up_status',
    label: 'Follow-up-Status',
    description: 'Aktuell: 100, <3 Tage überfällig: 50, >3 Tage überfällig: 0',
    defaultWeight: 10,
  },
]

export type ScoringWeights = Record<ScoringRuleId, number>

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  treatment_value: 25,
  activity_count: 20,
  lead_source: 15,
  response_time: 15,
  appointment_behavior: 15,
  follow_up_status: 10,
}

export const LEAD_SOURCE_SCORES: Record<LeadSource, number> = {
  referral: 100,
  google: 80,
  bing: 70,
  facebook: 60,
  instagram: 50,
  tiktok: 40,
}

export interface LeadScoreResult {
  total: number
  breakdown: Record<ScoringRuleId, { raw: number; weighted: number }>
}

// ─── Response Time ───────────────────────────────────────────

export interface ResponseTimeResult {
  hours: number | null // null = no activity yet
  label: string
  color: 'green' | 'yellow' | 'red' | 'gray'
}

// ─── Export ──────────────────────────────────────────────────

export interface ExportColumn {
  key: string
  header: string
  format?: (value: any) => string
}
