// composables/useLeadScoring.ts — Lead scoring 0-100 with 6 configurable rules

import type { Lead } from '~/types/crm'
import type { LeadActivity } from '~/types/crm'
import type { ScoringRuleId, ScoringWeights, LeadScoreResult } from '~/types/analytics'
import { DEFAULT_SCORING_WEIGHTS, LEAD_SOURCE_SCORES } from '~/types/analytics'

const STORAGE_KEY = 'praxis-crm-scoring-weights'

const loadWeights = (): ScoringWeights => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored) as ScoringWeights
  } catch { /* ignore */ }
  return { ...DEFAULT_SCORING_WEIGHTS }
}

const saveWeights = (weights: ScoringWeights) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weights))
  } catch { /* ignore */ }
}

export const useLeadScoring = () => {
  const weights = ref<ScoringWeights>(loadWeights())

  const updateWeights = (newWeights: ScoringWeights) => {
    weights.value = { ...newWeights }
    saveWeights(weights.value)
  }

  const resetWeights = () => {
    weights.value = { ...DEFAULT_SCORING_WEIGHTS }
    saveWeights(weights.value)
  }

  /**
   * Normalize weights so they sum to 100
   */
  const normalizedWeights = computed((): ScoringWeights => {
    const total = Object.values(weights.value).reduce((sum, w) => sum + w, 0)
    if (total === 0) return { ...DEFAULT_SCORING_WEIGHTS }
    const result = {} as ScoringWeights
    for (const [key, value] of Object.entries(weights.value)) {
      result[key as ScoringRuleId] = (value / total) * 100
    }
    return result
  })

  /**
   * Score a single rule (returns 0-100)
   */
  const scoreRule = (
    ruleId: ScoringRuleId,
    lead: Lead,
    activities: LeadActivity[],
    maxOpportunityValue: number,
  ): number => {
    switch (ruleId) {
      case 'treatment_value': {
        if (!lead.oportunity_value || maxOpportunityValue <= 0) return 0
        return Math.min(100, Math.round((lead.oportunity_value / maxOpportunityValue) * 100))
      }

      case 'activity_count': {
        const count = activities.length
        if (count >= 5) return 100
        return Math.round((count / 5) * 100)
      }

      case 'lead_source': {
        if (!lead.lead_source) return 0
        return LEAD_SOURCE_SCORES[lead.lead_source] || 0
      }

      case 'response_time': {
        if (activities.length === 0) return 0
        const created = new Date(lead.date_created).getTime()
        // Find earliest activity
        const sorted = [...activities].sort(
          (a, b) => new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
        )
        const firstActivity = new Date(sorted[0].date_created).getTime()
        const diffHours = (firstActivity - created) / (1000 * 60 * 60)
        if (diffHours < 1) return 100
        if (diffHours < 4) return 75
        if (diffHours < 24) return 50
        if (diffHours < 72) return 25
        return 0
      }

      case 'appointment_behavior': {
        const missed = lead.missed_appointments || 0
        // Assume some baseline of total appointments from activities
        const meetingActivities = activities.filter(a => a.type === 'meeting').length
        const totalAppointments = meetingActivities + missed
        if (totalAppointments === 0) return 50 // neutral if no data
        const attended = meetingActivities
        return Math.round((attended / totalAppointments) * 100)
      }

      case 'follow_up_status': {
        if (!lead.follow_up) return 0
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const followUp = new Date(lead.follow_up)
        followUp.setHours(0, 0, 0, 0)
        const diffDays = (today.getTime() - followUp.getTime()) / (1000 * 60 * 60 * 24)
        if (diffDays <= 0) return 100 // Not yet due or due today
        if (diffDays <= 3) return 50
        return 0
      }

      default:
        return 0
    }
  }

  /**
   * Calculate full score for a lead
   */
  const scoreLead = (
    lead: Lead,
    activities: LeadActivity[],
    maxOpportunityValue: number,
  ): LeadScoreResult => {
    const nw = normalizedWeights.value
    const breakdown = {} as LeadScoreResult['breakdown']
    let total = 0

    const ruleIds: ScoringRuleId[] = [
      'treatment_value',
      'activity_count',
      'lead_source',
      'response_time',
      'appointment_behavior',
      'follow_up_status',
    ]

    for (const ruleId of ruleIds) {
      const raw = scoreRule(ruleId, lead, activities, maxOpportunityValue)
      const weighted = Math.round((raw * nw[ruleId]) / 100)
      breakdown[ruleId] = { raw, weighted }
      total += weighted
    }

    return { total: Math.min(100, Math.round(total)), breakdown }
  }

  /**
   * Score all leads at once (computes maxOpportunityValue internally)
   */
  const scoreLeads = (
    leads: Lead[],
    activitiesByLead: Record<string, LeadActivity[]>,
  ): Map<string, LeadScoreResult> => {
    const maxOV = Math.max(...leads.map(l => l.oportunity_value || 0), 1)
    const results = new Map<string, LeadScoreResult>()
    for (const lead of leads) {
      const acts = activitiesByLead[lead.id] || []
      results.set(lead.id, scoreLead(lead, acts, maxOV))
    }
    return results
  }

  return {
    weights,
    normalizedWeights,
    updateWeights,
    resetWeights,
    scoreLead,
    scoreLeads,
  }
}
