/**
 * Reactivation-Check-Cron (Plan v9 Phase E)
 *
 * Soll täglich von externem Cron getriggert werden:
 *   curl -X POST https://<host>/api/cron/reactivation-check \
 *        -H "x-cron-secret: <CRON_SECRET>"
 *
 * Findet alle Lost-Leads mit reactivation_due_at <= jetzt und reaktiviert sie:
 *   - status: lost → contacting
 *   - contact_attempts = 0 (Neustart)
 *   - tags += [reactivated, reactivation-attempted]
 *   - Activity-Log
 *
 * Optional kann hier auch direkt eine Reactivation-Mail über Brevo getriggert werden
 * (Phase B Setup vorausgesetzt — aktuell noch nicht aktiv).
 */

import { defineEventHandler, getRequestHeader, createError } from 'h3'

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

  // 1. Alle Lost-Leads holen, deren Reaktivierung fällig ist
  const nowIso = new Date().toISOString()
  const due = await $fetch<{ data: any[] }>(`${directusUrl}/items/Leads`, {
    params: {
      'filter[status][_eq]': 'lost',
      'filter[reactivation_due_at][_lte]': nowIso,
      'filter[Tags][_ncontains]': 'reactivation-attempted',
      fields: 'id,first_name,last_name,lost_reason,Tags',
      limit: 500,
    },
    headers: authHeader ? { Authorization: authHeader } : {},
  }).catch(() => ({ data: [] }))

  const reactivated: string[] = []
  let failed = 0

  for (const lead of due.data || []) {
    try {
      const tags = [...(lead.Tags || [])]
      if (!tags.includes('reactivated')) tags.push('reactivated')
      if (!tags.includes('reactivation-attempted')) tags.push('reactivation-attempted')

      await $fetch(`${directusUrl}/items/Leads/${lead.id}`, {
        method: 'PATCH',
        body: {
          status: 'contacting',
          contact_attempts: 0,
          last_status_change_at: nowIso,
          reactivation_due_at: null,
          Tags: tags,
        },
        headers: authHeader
          ? { Authorization: authHeader, 'Content-Type': 'application/json' }
          : { 'Content-Type': 'application/json' },
      })
      reactivated.push(lead.id)
    } catch (err) {
      console.warn(`[reactivation-cron] failed for lead ${lead.id}:`, err)
      failed++
    }
  }

  return {
    success: true,
    checked: due.data?.length || 0,
    reactivated_count: reactivated.length,
    failed_count: failed,
    reactivated_ids: reactivated,
  }
})
