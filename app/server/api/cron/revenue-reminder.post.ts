import { defineEventHandler, getHeader, createError } from 'h3'
import type { Lead } from '../../../../layers/patienten/types/crm'

interface Result { processed: number; reminders: number; errors: string[] }

export default defineEventHandler(async (event): Promise<Result> => {
  const config = useRuntimeConfig()
  const secret = getHeader(event, 'x-appointment-cron-secret')
  if (!config.appointmentCronSecret || secret !== config.appointmentCronSecret) {
    throw createError({ statusCode: 401, statusMessage: 'invalid secret' })
  }
  const directusUrl = config.directusUrl as string
  const directusToken = config.directusServiceToken as string
  if (!directusUrl || !directusToken) throw createError({ statusCode: 500, statusMessage: 'directus config missing' })

  const result: Result = { processed: 0, reminders: 0, errors: [] }
  const cutoff = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString()
  const leadsResp = await $fetch<{ data: Lead[] }>(`${directusUrl}/items/Leads`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${directusToken}` },
    params: {
      fields: 'id,first_name,last_name,mail,status,revenue,last_status_change_at',
      'filter[status][_eq]': 'completed',
      'filter[revenue][_null]': 'true',
      'filter[last_status_change_at][_lte]': cutoff,
      limit: '-1',
    },
  })
  const leads = leadsResp?.data || []
  result.processed = leads.length

  for (const lead of leads) {
    try {
      await $fetch(`${directusUrl}/items/activities`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${directusToken}` },
        body: {
          lead_id: lead.id,
          type: 'task',
          subject: 'Reminder: Umsatz fehlt seit 14 Tagen',
          content: `Lead ${lead.first_name} ${lead.last_name} ist seit >14 Tagen abgeschlossen, aber ohne revenue. Bitte eintragen.`,
          date_created: new Date().toISOString(),
          user_name: 'cron:revenue-reminder',
        },
      })
      result.reminders += 1
    } catch (e: any) {
      result.errors.push(`${lead.id}: ${e?.message || e}`)
    }
  }

  return result
})
