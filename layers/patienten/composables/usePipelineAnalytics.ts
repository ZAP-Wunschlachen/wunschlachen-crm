// composables/usePipelineAnalytics.ts — Pipeline value, forecast, revenue, conversion rate

import type { Lead } from '~/types/crm'
import type { DateRange, DateRangePreset, PipelineKPIs } from '~/types/analytics'
import { STATUS_WEIGHTS } from '~/types/analytics'

const getDateRange = (preset: DateRangePreset): DateRange => {
  const now = new Date()
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  let from: Date

  switch (preset) {
    case 'month':
      from = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'quarter': {
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3
      from = new Date(now.getFullYear(), quarterMonth, 1)
      break
    }
    case 'year':
      from = new Date(now.getFullYear(), 0, 1)
      break
  }

  return { from, to, preset }
}

const isInRange = (dateStr: string, range: DateRange): boolean => {
  const date = new Date(dateStr)
  return date >= range.from && date <= range.to
}

export const usePipelineAnalytics = () => {
  const activePreset = ref<DateRangePreset>('month')
  const dateRange = computed(() => getDateRange(activePreset.value))

  /**
   * Pipeline-Wert: sum of oportunity_value for all active leads (not done/cancelled)
   */
  const getPipelineValue = (leads: Lead[]): number => {
    return leads
      .filter(l => !['done', 'cancelled'].includes(l.status))
      .reduce((sum, l) => sum + (l.oportunity_value || 0), 0)
  }

  /**
   * Weighted forecast: each lead's oportunity_value * status weight
   */
  const getForecast = (leads: Lead[]): number => {
    return leads
      .filter(l => STATUS_WEIGHTS[l.status] !== undefined)
      .reduce((sum, l) => {
        const weight = STATUS_WEIGHTS[l.status] || 0
        return sum + (l.oportunity_value || 0) * weight
      }, 0)
  }

  /**
   * Won revenue: sum of revenue for done leads in date range
   */
  const getRevenue = (leads: Lead[], range?: DateRange): number => {
    const r = range || dateRange.value
    return leads
      .filter(l => l.status === 'done' && isInRange(l.date_created, r))
      .reduce((sum, l) => sum + (l.revenue || 0), 0)
  }

  /**
   * Conversion rate: done / (done + cancelled) in date range
   */
  const getConversionRate = (leads: Lead[], range?: DateRange): { rate: number; won: number; total: number } => {
    const r = range || dateRange.value
    const filtered = leads.filter(l =>
      ['done', 'cancelled'].includes(l.status) && isInRange(l.date_created, r)
    )
    const won = filtered.filter(l => l.status === 'done').length
    const total = filtered.length
    return {
      rate: total > 0 ? Math.round((won / total) * 100) : 0,
      won,
      total,
    }
  }

  /**
   * All KPIs in one call
   */
  const getKPIs = (leads: Lead[], range?: DateRange): PipelineKPIs => {
    const r = range || dateRange.value
    const conversion = getConversionRate(leads, r)
    return {
      pipelineValue: getPipelineValue(leads),
      weightedForecast: getForecast(leads),
      wonRevenue: getRevenue(leads, r),
      conversionRate: conversion.rate,
      conversionCount: { won: conversion.won, total: conversion.total },
    }
  }

  return {
    activePreset,
    dateRange,
    getPipelineValue,
    getForecast,
    getRevenue,
    getConversionRate,
    getKPIs,
  }
}
