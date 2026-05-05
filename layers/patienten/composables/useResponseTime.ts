// composables/useResponseTime.ts — Lead response time calculation

import type { Lead, LeadActivity } from '~/types/crm'
import type { ResponseTimeResult } from '~/types/analytics'

export const useResponseTime = () => {
  /**
   * Calculate response time for a single lead
   */
  const getResponseTime = (lead: Lead, activities: LeadActivity[]): ResponseTimeResult => {
    if (activities.length === 0) {
      return { hours: null, label: 'Noch kein Kontakt', color: 'gray' }
    }

    const created = new Date(lead.date_created).getTime()
    const sorted = [...activities].sort(
      (a, b) => new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
    )
    const firstActivity = new Date(sorted[0].date_created).getTime()
    const diffMs = firstActivity - created
    const hours = diffMs / (1000 * 60 * 60)

    let color: ResponseTimeResult['color']
    if (hours < 1) color = 'green'
    else if (hours < 4) color = 'yellow'
    else color = 'red'

    return {
      hours: Math.round(hours * 10) / 10,
      label: formatDuration(diffMs),
      color,
    }
  }

  /**
   * Average response time across leads (last 30 days)
   */
  const getAverageResponseTime = (
    leads: Lead[],
    activitiesByLead: Record<string, LeadActivity[]>,
  ): ResponseTimeResult => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentLeads = leads.filter(l => new Date(l.date_created) >= thirtyDaysAgo)
    const responseTimes: number[] = []

    for (const lead of recentLeads) {
      const acts = activitiesByLead[lead.id] || []
      if (acts.length === 0) continue

      const created = new Date(lead.date_created).getTime()
      const sorted = [...acts].sort(
        (a, b) => new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
      )
      const firstActivity = new Date(sorted[0].date_created).getTime()
      const diffHours = (firstActivity - created) / (1000 * 60 * 60)
      responseTimes.push(diffHours)
    }

    if (responseTimes.length === 0) {
      return { hours: null, label: 'Keine Daten', color: 'gray' }
    }

    const avgHours = responseTimes.reduce((sum, h) => sum + h, 0) / responseTimes.length
    const avgMs = avgHours * 1000 * 60 * 60

    let color: ResponseTimeResult['color']
    if (avgHours < 1) color = 'green'
    else if (avgHours < 4) color = 'yellow'
    else color = 'red'

    return {
      hours: Math.round(avgHours * 10) / 10,
      label: formatDuration(avgMs),
      color,
    }
  }

  return { getResponseTime, getAverageResponseTime }
}

/**
 * Format milliseconds to human-readable German duration
 */
function formatDuration(ms: number): string {
  const hours = ms / (1000 * 60 * 60)
  if (hours < 1) {
    const minutes = Math.round(ms / (1000 * 60))
    return `${minutes} Min.`
  }
  if (hours < 24) {
    return `${Math.round(hours * 10) / 10} Std.`
  }
  const days = Math.round(hours / 24)
  return `${days} Tag${days !== 1 ? 'e' : ''}`
}
