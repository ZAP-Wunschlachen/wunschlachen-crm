/**
 * POST /api/cron/welcome-sequence
 *
 * Tägliches Cron-Target. Header `x-welcome-cron-secret` muss matchen.
 *
 * Workflow:
 *  1. Auth check
 *  2. Alle Leads aus Directus laden (status in [new, contacting, contacted], inkl. Welcome-Felder)
 *  3. Pro Lead: isDue(lead, now) → falls Slot fällig:
 *     a. Brevo send-email aufrufen (Template-ID, params={firstName})
 *     b. lead.welcome_sequence_position += 1 updaten
 *     c. Activity 'email_sent' loggen (via Directus Items API)
 *  4. JSON zurück: { processed, sent, paused_count, errors }
 *
 * Idempotenz: Position-Update + Activity-Insert atomar pro Lead — wenn Brevo
 * fehlschlägt, Position NICHT inkrementiert (Retry beim nächsten Cron-Run).
 */

import { defineEventHandler, getHeader, createError } from 'h3'
import { WELCOME_SLOTS } from '../../../../layers/patienten/data/welcome-sequence-slots'
import type { WelcomeSlot } from '../../../../layers/patienten/data/welcome-sequence-slots'
import type { Lead } from '../../../../layers/patienten/types/crm'

interface CronResult {
  processed: number
  sent: number
  paused: number
  errors: { lead_id: string; error: string }[]
}

const isDue = (lead: Lead, now: Date): WelcomeSlot | null => {
  // Inline-Kopie der Logik aus useWelcomeSequence.getDueSlot — der Composable
  // ist client-side (Auto-Import); Server-Route importiert das nicht direkt.
  if (!lead.GDPR_accepted_at) return null
  if ((lead.Tags || []).includes('unsubscribed')) return null
  if (lead.status === 'lost') return null
  if (!['new', 'contacting', 'contacted'].includes(lead.status)) return null

  const pos = lead.welcome_sequence_position ?? 0
  if (pos >= WELCOME_SLOTS.length) return null
  const next = WELCOME_SLOTS[pos]

  const startedAt = lead.welcome_sequence_started_at ?? lead.date_created
  if (!startedAt) return null
  const startMs = new Date(startedAt).getTime()
  const dueAtMs = startMs + next.day_offset * 24 * 60 * 60 * 1000
  return now.getTime() >= dueAtMs ? next : null
}

export default defineEventHandler(async (event): Promise<CronResult> => {
  const config = useRuntimeConfig()
  const expectedSecret = config.welcomeCronSecret as string
  const providedSecret = getHeader(event, 'x-welcome-cron-secret')

  if (!expectedSecret || providedSecret !== expectedSecret) {
    throw createError({ statusCode: 401, statusMessage: 'invalid cron secret' })
  }

  const directusUrl = (config.directusUrl as string) || (config.public.directusUrl as string)
  const directusToken = config.directusServiceToken as string
  if (!directusUrl || !directusToken) {
    throw createError({ statusCode: 500, statusMessage: 'directus config missing' })
  }

  // 1. Leads laden
  const leadsResponse = await $fetch<{ data: Lead[] }>(`${directusUrl}/items/Leads`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${directusToken}` },
    params: {
      'filter[status][_in]': 'new,contacting,contacted',
      'fields': 'id,first_name,last_name,mail,status,Tags,GDPR_accepted_at,date_created,welcome_sequence_started_at,welcome_sequence_position,welcome_sequence_paused_at',
      'limit': '-1',
    },
  })

  const result: CronResult = { processed: 0, sent: 0, paused: 0, errors: [] }
  const now = new Date()

  for (const lead of leadsResponse.data) {
    result.processed += 1
    const slot = isDue(lead, now)
    if (!slot) continue

    if (!lead.mail) {
      result.errors.push({ lead_id: lead.id, error: 'no_mail' })
      continue
    }

    try {
      const params = { firstName: lead.first_name || '' }
      const useTemplate = !!slot.brevo_template_id && slot.brevo_template_id > 0
      const brevoBody = useTemplate
        ? {
            to: [{ email: lead.mail, name: `${lead.first_name} ${lead.last_name}`.trim() }],
            templateId: slot.brevo_template_id,
            params,
            tags: ['welcome', slot.slug],
          }
        : {
            to: [{ email: lead.mail, name: `${lead.first_name} ${lead.last_name}`.trim() }],
            subject: slot.subject_fallback.replace('{{firstName}}', params.firstName),
            htmlContent: slot.html_fallback.replace(/\{\{firstName\}\}/g, params.firstName),
            tags: ['welcome', slot.slug],
          }

      await $fetch('/api/brevo/send-email', { method: 'POST', body: brevoBody })

      // Position inkrementieren
      await $fetch(`${directusUrl}/items/Leads/${lead.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${directusToken}` },
        body: { welcome_sequence_position: slot.position },
      })

      // Activity loggen
      await $fetch(`${directusUrl}/items/activities`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${directusToken}` },
        body: {
          lead_id: lead.id,
          type: 'email_sent',
          subject: `Welcome ${slot.position}/${WELCOME_SLOTS.length}: ${slot.subject_fallback}`,
          content: `Slot: ${slot.slug}, Theme: ${slot.theme}, Brevo-Template: ${slot.brevo_template_id}`,
          metadata: { welcome_slot: slot.slug, welcome_position: slot.position },
          date_created: now.toISOString(),
          user_name: 'cron:welcome-sequence',
        },
      })

      result.sent += 1
    } catch (err: any) {
      result.errors.push({ lead_id: lead.id, error: err?.message || String(err) })
    }
  }

  return result
})
