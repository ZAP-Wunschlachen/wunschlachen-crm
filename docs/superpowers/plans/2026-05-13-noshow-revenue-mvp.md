# Modul E + G — No-Show-Auto-Reschedule + Behandlung-Done-Umsatz

**Goal E:** Cron erkennt `appointments.start_date_time < now-2h && arrival_date IS NULL && lead.status==consultation_scheduled`, sendet Auto-Mail mit Buchungs-Link, setzt Lead zurück auf `contacted` (via `useNoShowAction`).

**Goal G:** Bei `treatment_finished_date` setzt Modul C bereits `lead.status=completed`. Wir ergänzen: Banner im Lead-Detail "Bitte Umsatz eintragen" wenn `revenue` leer, plus Cron-Reminder 14 Tage später.

**Spec:** §3 Modul E + Modul G.

## File Structure

**New:**
- `layers/patienten/data/no-show-reschedule-mail.ts` — Mail-Slot-Definition
- `app/server/api/cron/no-show-reschedule.post.ts` — Cron-Endpoint
- `app/server/api/cron/revenue-reminder.post.ts` — Cron-Endpoint (14-Tage-Reminder)
- n8n-Workflows: `[TONY] CRM No-Show-Reschedule alle 30 Min` + `[TONY] CRM Revenue-Reminder täglich 09:00`

**Modified:**
- `layers/patienten/pages/patienten/leads/[id].vue` — Banner bei `status==completed && !revenue`
- `app/nuxt.config.ts` — bereits `appointmentCronSecret` da; reused

## Tasks

### Task E1: No-Show-Reschedule Mail-Slot

`layers/patienten/data/no-show-reschedule-mail.ts`:

```ts
export const NO_SHOW_RESCHEDULE_MAIL = {
  slug: 'no-show-reschedule',
  brevo_template_id: 2010,
  subject_fallback: 'Schade, dass es heute nicht geklappt hat — neuer Termin?',
  html_fallback: '<p>Hallo {{firstName}},</p><p>wir haben Sie heute bei uns vermisst. Falls etwas dazwischengekommen ist — kein Problem. Möchten Sie einen neuen Termin?</p><p><a href="https://wunschlachen.app/buchen">Neuen Termin buchen</a></p><p>Oder rufen Sie uns einfach an. Wir freuen uns auf Sie!</p>',
}
```

### Task E2: No-Show-Cron-Endpoint

`app/server/api/cron/no-show-reschedule.post.ts`:

```ts
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
```

### Task G1: Revenue-Banner im Lead-Detail

In `layers/patienten/pages/patienten/leads/[id].vue` direkt unter dem Header (vor dem NextBestActionCard) einen Banner einfügen:

```vue
<div v-if="lead.status === 'completed' && !lead.revenue" class="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
  <i class="pi pi-exclamation-triangle text-amber-600 text-lg" />
  <div class="flex-1">
    <p class="text-sm font-semibold text-amber-900">Behandlung abgeschlossen — bitte Umsatz eintragen</p>
    <p class="text-[11px] text-amber-700">Für Reporting + Lead-Source-Analyse</p>
  </div>
  <input
    :value="lead.revenue || ''"
    type="number"
    placeholder="0.00 €"
    class="field-input w-32 bg-white"
    @blur="saveField('revenue', Number(($event.target as HTMLInputElement).value) || null)"
  />
</div>
```

### Task G2: Revenue-Reminder-Cron

`app/server/api/cron/revenue-reminder.post.ts`:

```ts
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
```

### Task EG3: n8n-Workflows anlegen (deaktiviert)

Werden vom Subagent via n8n-API erstellt — gleiches Pattern wie die appointment-sync-Workflows. Naming `[TONY] CRM No-Show-Reschedule alle 30 Min` und `[TONY] CRM Revenue-Reminder täglich 09:00`. Beide nutzen das gleiche `APPOINTMENT_CRON_SECRET`.

### Task EG4: Push + Issue-Close
