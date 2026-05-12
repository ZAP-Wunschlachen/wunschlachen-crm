/**
 * SLA-Check Endpoint (Phase 9 T7)
 *
 * Soll von einem externen Cron (z.B. EasyCron, DO-App-Scheduler, GitHub-Actions)
 * alle 5-15 Min angetriggert werden:
 *   curl -X POST https://<host>/api/tickets/sla-check \
 *        -H "x-cron-secret: <CRON_SECRET>"
 *
 * SLA-Regeln (siehe docs/TICKETS_SCHEMA.md):
 *   dringend  → 1h  First-Response, 4h Resolution
 *   hoch      → 4h  / 1 Werktag
 *   mittel    → 24h / 3 Werktage
 *   niedrig   → 48h / 7 Werktage
 */

import { defineEventHandler, getRequestHeader, createError } from 'h3'

const HOURS = (h: number) => h * 60 * 60 * 1000
const FIRST_RESPONSE_FRIST: Record<string, number> = {
  dringend: HOURS(1),
  hoch: HOURS(4),
  mittel: HOURS(24),
  niedrig: HOURS(48),
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const cronSecret = (config.cronSecret as string) || ''
  if (cronSecret) {
    const supplied = getRequestHeader(event, 'x-cron-secret')
    if (supplied !== cronSecret) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid cron secret' })
    }
  }

  const directusUrl = config.public.directusUrl as string
  const authHeader = config.brevoToken ? `Bearer ${config.brevoToken}` : ''

  // Hol alle Tickets die noch nicht gelöst/geschlossen sind und noch nicht als sla_breach markiert
  const open = await $fetch<{ data: any[] }>(`${directusUrl}/items/tickets`, {
    params: {
      'filter[status][_in]': 'neu,offen,wartend_kunde,in_bearbeitung',
      'filter[sla_breach][_eq]': false,
      fields: 'id,priority,date_created,first_response_at,status',
      limit: 1000,
    },
    headers: authHeader ? { Authorization: authHeader } : {},
  }).catch(() => ({ data: [] }))

  const now = Date.now()
  const breached: string[] = []

  for (const t of open.data || []) {
    const frist = FIRST_RESPONSE_FRIST[t.priority] || FIRST_RESPONSE_FRIST.mittel
    const createdAt = new Date(t.date_created).getTime()

    // Wenn First-Response noch nicht erfolgt UND Frist überschritten
    if (!t.first_response_at && now - createdAt > frist) {
      breached.push(t.id)
    }
  }

  // Batch-Update
  if (breached.length) {
    await $fetch(`${directusUrl}/items/tickets`, {
      method: 'PATCH',
      body: { keys: breached, data: { sla_breach: true } },
      headers: authHeader
        ? { Authorization: authHeader, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' },
    }).catch((err) => console.warn('[sla-check] batch update fehlgeschlagen:', err))
  }

  return { success: true, checked: open.data?.length || 0, breached_count: breached.length, breached_ids: breached }
})
