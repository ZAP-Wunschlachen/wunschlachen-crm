/**
 * POST /api/cron/appointment-reminder
 *
 * Tägliches Cron-Target via n8n. Sendet 24h-Reminder für alle Termine
 * zwischen jetzt+23h und jetzt+25h.
 */

import { defineEventHandler, getHeader, createError } from 'h3'
import type { Lead } from '../../../../layers/patienten/types/crm'
import { APPOINTMENT_MAIL_SLOTS } from '../../../../layers/patienten/data/appointment-mail-slots'

interface ReminderResult {
  processed: number
  mails_sent: number
  ignored_no_match: number
  errors: { appointment_id: string; error: string }[]
}

const normalizeMail = (m?: string | null) => (m || '').trim().toLowerCase()

const formatDateDE = (iso?: string | null): string => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('de-DE') } catch { return iso }
}
const formatTimeDE = (iso?: string | null): string => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) } catch { return iso }
}

export default defineEventHandler(async (event): Promise<ReminderResult> => {
  const config = useRuntimeConfig()
  const expectedSecret = config.appointmentCronSecret as string
  const providedSecret = getHeader(event, 'x-appointment-cron-secret')
  if (!expectedSecret || providedSecret !== expectedSecret) {
    throw createError({ statusCode: 401, statusMessage: 'invalid reminder secret' })
  }

  const directusUrl = config.directusUrl as string
  const directusToken = config.directusServiceToken as string
  if (!directusUrl || !directusToken) {
    throw createError({ statusCode: 500, statusMessage: 'directus config missing' })
  }

  const result: ReminderResult = { processed: 0, mails_sent: 0, ignored_no_match: 0, errors: [] }
  const now = Date.now()
  const fromIso = new Date(now + 23 * 3600 * 1000).toISOString()
  const toIso = new Date(now + 25 * 3600 * 1000).toISOString()

  const apptResp = await $fetch<{ data: any[] }>(`${directusUrl}/items/appointments`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${directusToken}` },
    params: {
      fields: 'id,start_date_time,patient.email,patient.patient_number,location.name',
      'filter[start_date_time][_between]': `${fromIso},${toIso}`,
      'filter[arrival_date][_null]': 'true',
      limit: '-1',
    },
  })
  const appointments = apptResp?.data || []
  if (appointments.length === 0) return result

  const leadsResp = await $fetch<{ data: Lead[] }>(`${directusUrl}/items/Leads`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${directusToken}` },
    params: { fields: 'id,first_name,mail,patient_number', 'filter[status][_nin]': 'completed,lost', limit: '-1' },
  })
  const leads = leadsResp?.data || []

  const slot = APPOINTMENT_MAIL_SLOTS.reminder_24h

  for (const appt of appointments) {
    result.processed += 1
    const patient = appt.patient as any
    let lead: Lead | undefined
    if (patient?.email) {
      const target = normalizeMail(patient.email)
      if (target) lead = leads.find((l) => normalizeMail(l.mail) === target)
    }
    if (!lead && patient?.patient_number) {
      lead = leads.find((l) => l.patient_number === patient.patient_number)
    }
    if (!lead || !lead.mail) { result.ignored_no_match += 1; continue }

    try {
      const params = {
        firstName: lead.first_name || '',
        startDate: formatDateDE(appt.start_date_time),
        startTime: formatTimeDE(appt.start_date_time),
        locationName: appt.location?.name || 'Praxis Wunschlachen',
      }
      const useTemplate = slot.brevo_template_id > 0
      const brevoBody = useTemplate
        ? { to: [{ email: lead.mail }], templateId: slot.brevo_template_id, params, tags: ['appointment', slot.slug] }
        : {
            to: [{ email: lead.mail }],
            subject: slot.subject_fallback.replace(/\{\{(\w+)\}\}/g, (_, k) => (params as any)[k] || ''),
            htmlContent: slot.html_fallback.replace(/\{\{(\w+)\}\}/g, (_, k) => (params as any)[k] || ''),
            tags: ['appointment', slot.slug],
          }
      await $fetch('/api/brevo/send-email', { method: 'POST', body: brevoBody })
      result.mails_sent += 1

      await $fetch(`${directusUrl}/items/activities`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${directusToken}` },
        body: {
          lead_id: lead.id,
          type: 'email_sent',
          subject: `Reminder 24h für Termin ${appt.id}`,
          metadata: { appointment_id: appt.id },
          date_created: new Date().toISOString(),
          user_name: 'cron:appointment-reminder',
        },
      })
    } catch (e: any) {
      result.errors.push({ appointment_id: appt.id, error: e?.message || String(e) })
    }
  }

  return result
})
