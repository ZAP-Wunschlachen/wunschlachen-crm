/**
 * POST /api/cron/appointment-sync
 *
 * Auth via `x-appointment-cron-secret` (n8n-Cron) ODER `x-realtime-event` (Browser-WS).
 *
 * Workflow:
 *  1. Auth check
 *  2. Termine fetchen (per ID wenn realtime, sonst alle changed since)
 *  3. Pro Termin: Lead-Match → wenn null skip (Bestandspatient ignorieren)
 *  4. plannedAction → wenn set_status: PATCH Lead + Activity loggen + ggf. Mail
 *  5. Backfill: wenn match-Result eine patient_number empfiehlt, schreiben
 *  6. last_appointment_synced_at aktualisieren
 *  7. JSON zurück: { processed, status_changes, mails_sent, errors }
 */

import { defineEventHandler, getHeader, readBody, createError } from 'h3'
import type { Lead, LeadStatus } from '../../../../layers/patienten/types/crm'
import { APPOINTMENT_MAIL_SLOTS } from '../../../../layers/patienten/data/appointment-mail-slots'

interface AppointmentPatient { patient_number?: string | null; email?: string | null }
interface AppointmentLite {
  id: string
  date_updated?: string
  start_date_time?: string | null
  arrival_date?: string | null
  treatment_finished_date?: string | null
  treatment?: { name?: string; category?: string } | null
  patient?: AppointmentPatient | null
  location?: { name?: string } | null
}

interface SyncResult {
  processed: number
  status_changes: number
  mails_sent: number
  backfills: number
  ignored_no_match: number
  errors: { appointment_id: string; error: string }[]
}

const normalizeMail = (m?: string | null) => (m || '').trim().toLowerCase()

const matchLead = (patient: AppointmentPatient | null | undefined, leads: Lead[]) => {
  if (!patient) return { lead: null as Lead | null, matched_by: 'none' as const, backfill_patient_number: undefined as string | undefined }
  if (patient.email) {
    const target = normalizeMail(patient.email)
    if (target.length > 0) {
      const found = leads.find((l) => normalizeMail(l.mail) === target)
      if (found) {
        return {
          lead: found, matched_by: 'mail' as const,
          backfill_patient_number: (patient.patient_number && !found.patient_number) ? patient.patient_number : undefined,
        }
      }
    }
  }
  if (patient.patient_number) {
    const found = leads.find((l) => l.patient_number === patient.patient_number)
    if (found) return { lead: found, matched_by: 'patient_number' as const, backfill_patient_number: undefined }
  }
  return { lead: null, matched_by: 'none' as const, backfill_patient_number: undefined }
}

const isBeratung = (a: AppointmentLite): boolean => {
  const cat = (a.treatment?.category || '').toLowerCase()
  const name = (a.treatment?.name || '').toLowerCase()
  return cat === 'beratung' || /beratung|consultation/.test(name)
}
const isBehandlung = (a: AppointmentLite): boolean => {
  const cat = (a.treatment?.category || '').toLowerCase()
  const name = (a.treatment?.name || '').toLowerCase()
  return cat === 'behandlung' || /implantation|behandlung|operation/.test(name)
}

interface PlannedAction {
  type: 'set_status' | 'log_only'
  toStatus?: LeadStatus
  sendMail?: 'consultation_confirmation' | 'treatment_confirmation' | null
  activityLabel: string
}

const plannedAction = (eventKind: 'INSERT' | 'UPDATE' | 'DELETE', a: AppointmentLite, lead: Lead): PlannedAction | null => {
  if (eventKind === 'DELETE') {
    return { type: 'log_only', activityLabel: `Termin ${a.id} storniert` }
  }
  if (eventKind === 'INSERT') {
    if (isBeratung(a)) {
      return { type: 'set_status', toStatus: 'consultation_scheduled', sendMail: 'consultation_confirmation', activityLabel: `Beratungstermin gebucht: ${a.start_date_time}` }
    }
    if (isBehandlung(a)) {
      return { type: 'set_status', toStatus: 'treatment_scheduled', sendMail: 'treatment_confirmation', activityLabel: `Behandlungstermin gebucht: ${a.start_date_time}` }
    }
    return null
  }
  if (a.treatment_finished_date) {
    if (lead.status === 'completed') return null
    return { type: 'set_status', toStatus: 'completed', sendMail: null, activityLabel: `Behandlung abgeschlossen: ${a.treatment_finished_date}` }
  }
  if (a.arrival_date) {
    if (lead.status === 'consultation_scheduled') {
      return { type: 'set_status', toStatus: 'consultation_done', sendMail: null, activityLabel: `Patient erschienen (Beratung): ${a.arrival_date}` }
    }
    if (lead.status === 'treatment_scheduled') {
      return { type: 'set_status', toStatus: 'treatment_in_progress', sendMail: null, activityLabel: `Patient erschienen (Behandlung): ${a.arrival_date}` }
    }
    return null
  }
  if (a.start_date_time) {
    return { type: 'log_only', activityLabel: `Termin verschoben auf ${a.start_date_time}` }
  }
  return null
}

const formatDateDE = (iso?: string | null): string => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('de-DE') } catch { return iso }
}
const formatTimeDE = (iso?: string | null): string => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) } catch { return iso }
}

export default defineEventHandler(async (event): Promise<SyncResult> => {
  const config = useRuntimeConfig()
  const realtimeFlag = getHeader(event, 'x-realtime-event') === '1'
  const expectedSecret = config.appointmentCronSecret as string
  const providedSecret = getHeader(event, 'x-appointment-cron-secret')

  if (!realtimeFlag && (!expectedSecret || providedSecret !== expectedSecret)) {
    throw createError({ statusCode: 401, statusMessage: 'invalid sync secret' })
  }

  const directusUrl = config.directusUrl as string
  const directusToken = config.directusServiceToken as string
  if (!directusUrl || !directusToken) {
    throw createError({ statusCode: 500, statusMessage: 'directus config missing' })
  }

  const result: SyncResult = { processed: 0, status_changes: 0, mails_sent: 0, backfills: 0, ignored_no_match: 0, errors: [] }
  const body = realtimeFlag ? await readBody(event).catch(() => ({})) : {}
  const fields = 'id,date_updated,start_date_time,arrival_date,treatment_finished_date,treatment.name,treatment.category,patient.patient_number,patient.email,location.name'

  // Termine laden
  let appointments: AppointmentLite[] = []
  try {
    if (realtimeFlag && body?.appointment_id) {
      const resp = await $fetch<{ data: AppointmentLite }>(`${directusUrl}/items/appointments/${body.appointment_id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${directusToken}` },
        params: { fields },
      })
      if (resp?.data) appointments = [resp.data]
    } else {
      // Catch-up: alle changed in den letzten 10 Min
      const sinceMs = Date.now() - 10 * 60 * 1000
      const sinceIso = new Date(sinceMs).toISOString()
      const resp = await $fetch<{ data: AppointmentLite[] }>(`${directusUrl}/items/appointments`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${directusToken}` },
        params: { fields, 'filter[date_updated][_gte]': sinceIso, limit: '-1' },
      })
      appointments = resp?.data || []
    }
  } catch (e: any) {
    throw createError({ statusCode: 502, statusMessage: `directus fetch failed: ${e?.message || e}` })
  }

  if (appointments.length === 0) return result

  // Leads laden (alle aktiven für Match)
  let leads: Lead[] = []
  try {
    const resp = await $fetch<{ data: Lead[] }>(`${directusUrl}/items/Leads`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${directusToken}` },
      params: { fields: 'id,first_name,last_name,mail,status,patient_number,linked_appointment_id', 'filter[status][_nin]': 'completed,lost', limit: '-1' },
    })
    leads = resp?.data || []
  } catch (e: any) {
    throw createError({ statusCode: 502, statusMessage: `leads fetch failed: ${e?.message || e}` })
  }

  // Pro Termin verarbeiten
  for (const appt of appointments) {
    result.processed += 1
    const matchRes = matchLead(appt.patient, leads)
    if (!matchRes.lead) { result.ignored_no_match += 1; continue }

    const eventKind: 'INSERT' | 'UPDATE' = appt.start_date_time && !appt.arrival_date && !appt.treatment_finished_date && !matchRes.lead.linked_appointment_id ? 'INSERT' : 'UPDATE'
    const action = plannedAction(eventKind, appt, matchRes.lead)
    if (!action) continue

    const now = new Date().toISOString()
    try {
      // 1. Lead-Update (Status + Backfill + Verknüpfung + Sync-Timestamp)
      const leadPatch: Record<string, any> = { last_appointment_synced_at: now, linked_appointment_id: appt.id }
      if (action.type === 'set_status' && action.toStatus) leadPatch.status = action.toStatus
      if (matchRes.backfill_patient_number) { leadPatch.patient_number = matchRes.backfill_patient_number; result.backfills += 1 }
      await $fetch(`${directusUrl}/items/Leads/${matchRes.lead.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${directusToken}` },
        body: leadPatch,
      })

      // 2. Activity-Log
      await $fetch(`${directusUrl}/items/activities`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${directusToken}` },
        body: {
          lead_id: matchRes.lead.id,
          type: action.type === 'set_status' ? 'stage_change' : 'meeting',
          subject: action.activityLabel,
          content: `Appointment ${appt.id}, matched_by: ${matchRes.matched_by}${matchRes.backfill_patient_number ? `, backfilled patient_number: ${matchRes.backfill_patient_number}` : ''}`,
          metadata: { appointment_id: appt.id, from_status: matchRes.lead.status, to_status: action.toStatus || null },
          date_created: now,
          user_name: 'cron:appointment-sync',
        },
      })

      if (action.type === 'set_status') result.status_changes += 1

      // 3. Mail-Trigger
      if (action.sendMail) {
        const slot = APPOINTMENT_MAIL_SLOTS[action.sendMail]
        if (matchRes.lead.mail && slot) {
          const params = {
            firstName: matchRes.lead.first_name || '',
            startDate: formatDateDE(appt.start_date_time),
            startTime: formatTimeDE(appt.start_date_time),
            locationName: appt.location?.name || 'Praxis Wunschlachen',
          }
          const useTemplate = slot.brevo_template_id > 0
          const brevoBody = useTemplate
            ? { to: [{ email: matchRes.lead.mail }], templateId: slot.brevo_template_id, params, tags: ['appointment', slot.slug] }
            : {
                to: [{ email: matchRes.lead.mail }],
                subject: slot.subject_fallback.replace(/\{\{(\w+)\}\}/g, (_, k) => (params as any)[k] || ''),
                htmlContent: slot.html_fallback.replace(/\{\{(\w+)\}\}/g, (_, k) => (params as any)[k] || ''),
                tags: ['appointment', slot.slug],
              }
          try {
            await $fetch('/api/brevo/send-email', { method: 'POST', body: brevoBody })
            result.mails_sent += 1
          } catch (e: any) {
            result.errors.push({ appointment_id: appt.id, error: `brevo: ${e?.message || e}` })
          }
        }
      }
    } catch (e: any) {
      result.errors.push({ appointment_id: appt.id, error: e?.message || String(e) })
    }
  }

  return result
})
