import { defineEventHandler, getHeader, createError } from 'h3'
import type { Lead } from '../../../../layers/patienten/types/crm'
import { NO_SHOW_RESCHEDULE_MAIL } from '../../../../layers/patienten/data/no-show-reschedule-mail'

interface Result { processed: number; mails_sent: number; status_reverts: number; errors: { appointment_id: string; error: string }[] }

const normalizeMail = (m?: string | null) => (m || '').trim().toLowerCase()

export default defineEventHandler(async (event): Promise<Result> => {
  const config = useRuntimeConfig()
  const secret = getHeader(event, 'x-appointment-cron-secret')
  if (!config.appointmentCronSecret || secret !== config.appointmentCronSecret) {
    throw createError({ statusCode: 401, statusMessage: 'invalid secret' })
  }
  const directusUrl = config.directusUrl as string
  const directusToken = config.directusServiceToken as string
  if (!directusUrl || !directusToken) throw createError({ statusCode: 500, statusMessage: 'directus config missing' })

  const result: Result = { processed: 0, mails_sent: 0, status_reverts: 0, errors: [] }
  const now = Date.now()
  // Termine die vor 2-26h hätten stattfinden sollen, ohne arrival
  const fromIso = new Date(now - 26 * 3600 * 1000).toISOString()
  const toIso = new Date(now - 2 * 3600 * 1000).toISOString()

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
    params: { fields: 'id,first_name,mail,status,patient_number,missed_appointments,Tags', 'filter[status][_eq]': 'consultation_scheduled', limit: '-1' },
  })
  const leads = leadsResp?.data || []

  for (const appt of appointments) {
    result.processed += 1
    const patient = appt.patient as any
    let lead: Lead | undefined
    if (patient?.email) {
      const t = normalizeMail(patient.email)
      if (t) lead = leads.find((l) => normalizeMail(l.mail) === t)
    }
    if (!lead && patient?.patient_number) {
      lead = leads.find((l) => l.patient_number === patient.patient_number)
    }
    if (!lead || !lead.mail) continue

    // Idempotenz: Tag `no-show-mail-sent-<appt.id>` verhindert Doppel-Versand
    const guardTag = `no-show-mail-${appt.id}`
    if ((lead.Tags || []).includes(guardTag)) continue

    try {
      const slot = NO_SHOW_RESCHEDULE_MAIL
      const params = { firstName: lead.first_name || '' }
      const useTemplate = slot.brevo_template_id > 0
      const brevoBody = useTemplate
        ? { to: [{ email: lead.mail }], templateId: slot.brevo_template_id, params, tags: ['no-show', slot.slug] }
        : {
            to: [{ email: lead.mail }],
            subject: slot.subject_fallback.replace(/\{\{(\w+)\}\}/g, (_, k) => (params as any)[k] || ''),
            htmlContent: slot.html_fallback.replace(/\{\{(\w+)\}\}/g, (_, k) => (params as any)[k] || ''),
            tags: ['no-show', slot.slug],
          }
      await $fetch('/api/brevo/send-email', { method: 'POST', body: brevoBody })
      result.mails_sent += 1

      // Status revert + missed-Counter + Tag
      const newMissed = (lead.missed_appointments || 0) + 1
      const newTags = [...(lead.Tags || []), guardTag]
      await $fetch(`${directusUrl}/items/Leads/${lead.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${directusToken}` },
        body: { status: 'contacted', missed_appointments: newMissed, Tags: newTags, last_status_change_at: new Date().toISOString() },
      })
      result.status_reverts += 1

      await $fetch(`${directusUrl}/items/activities`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${directusToken}` },
        body: {
          lead_id: lead.id,
          type: 'no_show',
          subject: `No-Show + Auto-Reschedule-Mail versandt (Appointment ${appt.id})`,
          content: `Status zurück: consultation_scheduled → contacted. No-Show #${newMissed}.`,
          metadata: { appointment_id: appt.id, auto_reschedule_mail_sent: true },
          date_created: new Date().toISOString(),
          user_name: 'cron:no-show-reschedule',
        },
      })
    } catch (e: any) {
      result.errors.push({ appointment_id: appt.id, error: e?.message || String(e) })
    }
  }

  return result
})
