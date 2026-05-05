// composables/useExport.ts — CSV export with German formatting

import type { Lead, LeadActivity } from '~/types/crm'
import { LEAD_STATUS_CONFIG, LEAD_SOURCE_CONFIG, ACTIVITY_TYPE_CONFIG } from '~/types/crm'
import type { PipelineKPIs } from '~/types/analytics'

const BOM = '\uFEFF'
const SEPARATOR = ';'

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
  } catch {
    return ''
  }
}

const formatDateTime = (dateStr: string | undefined): string => {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${day}.${month}.${year} ${hours}:${minutes}`
  } catch {
    return ''
  }
}

const escapeField = (value: any): string => {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(SEPARATOR) || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const buildCSV = (headers: string[], rows: string[][]): string => {
  const headerLine = headers.map(escapeField).join(SEPARATOR)
  const dataLines = rows.map(row => row.map(escapeField).join(SEPARATOR))
  return BOM + [headerLine, ...dataLines].join('\n')
}

const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const useExport = () => {
  const exportLeads = (leads: Lead[], filename = 'leads-export') => {
    const headers = [
      'Vorname',
      'Nachname',
      'E-Mail',
      'Telefon',
      'Status',
      'Quelle',
      'Behandlung',
      'Wert (EUR)',
      'Umsatz (EUR)',
      'Follow-up',
      'Tags',
      'Erstellt',
      'Aktualisiert',
    ]

    const rows = leads.map(lead => [
      lead.first_name,
      lead.last_name,
      lead.mail || '',
      lead.phone || '',
      LEAD_STATUS_CONFIG[lead.status]?.label || lead.status,
      lead.lead_source ? (LEAD_SOURCE_CONFIG[lead.lead_source]?.label || lead.lead_source) : '',
      typeof lead.dental_service === 'object' ? (lead.dental_service?.name || '') : '',
      lead.oportunity_value?.toString() || '',
      lead.revenue?.toString() || '',
      formatDate(lead.follow_up),
      (lead.Tags || []).join(', '),
      formatDateTime(lead.date_created),
      formatDateTime(lead.date_updated),
    ])

    const csv = buildCSV(headers, rows)
    downloadCSV(csv, filename)
  }

  const exportActivities = (activities: LeadActivity[], filename = 'aktivitaeten-export') => {
    const headers = [
      'Datum',
      'Typ',
      'Betreff',
      'Inhalt',
      'Richtung',
      'Ergebnis',
      'Dauer (Min.)',
      'Benutzer',
      'Lead-ID',
    ]

    const rows = activities.map(a => [
      formatDateTime(a.date_created),
      ACTIVITY_TYPE_CONFIG[a.type]?.label || a.type,
      a.subject,
      a.content || '',
      a.direction || '',
      a.outcome || '',
      a.duration_minutes?.toString() || '',
      a.user_name,
      a.lead_id,
    ])

    const csv = buildCSV(headers, rows)
    downloadCSV(csv, filename)
  }

  const exportPipeline = (kpis: PipelineKPIs, periodLabel: string, filename = 'pipeline-export') => {
    const headers = ['Kennzahl', 'Wert', 'Zeitraum']

    const formatCurrency = (v: number) =>
      new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(v)

    const rows = [
      ['Pipeline-Wert', formatCurrency(kpis.pipelineValue), 'Aktuell'],
      ['Gewichteter Forecast', formatCurrency(kpis.weightedForecast), 'Aktuell'],
      ['Gewonnener Umsatz', formatCurrency(kpis.wonRevenue), periodLabel],
      ['Conversion-Rate', `${kpis.conversionRate}%`, periodLabel],
      ['Gewonnene Leads', kpis.conversionCount.won.toString(), periodLabel],
      ['Abgeschlossene Leads', kpis.conversionCount.total.toString(), periodLabel],
    ]

    const csv = buildCSV(headers, rows)
    downloadCSV(csv, filename)
  }

  return { exportLeads, exportActivities, exportPipeline }
}
