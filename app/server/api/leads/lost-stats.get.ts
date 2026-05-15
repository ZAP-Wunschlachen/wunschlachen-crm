/**
 * GET /api/leads/lost-stats
 *
 * Aggregierte Übersicht der lost_reasons aller Leads mit status='lost'.
 * Server-side mit Directus-Token, damit das CRM-UI eine Verlust-Übersicht
 * anzeigen kann ohne die Lead-Liste komplett laden zu müssen.
 *
 * Query-Params:
 *   - since (optional, ISO-Datum): nur Leads die seit diesem Datum lost sind
 *
 * Response:
 *   { total: 42, by_reason: [{ reason: 'too_expensive', count: 12 }, ...] }
 */

import { defineEventHandler, getQuery, createError } from 'h3'

interface LostLead {
  id: string
  lost_reason: string | null
  date_updated: string | null
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const directusUrl = (config.directusUrl as string) || (config.public.directusUrl as string) || ''
  const token = config.directusServiceToken as string
  if (!directusUrl) throw createError({ statusCode: 500, statusMessage: 'directusUrl not configured' })
  if (!token) throw createError({ statusCode: 500, statusMessage: 'directusServiceToken not configured' })

  const query = getQuery(event)
  const since = (query.since as string) || ''

  // Hinweis: last_status_change_at ist noch nicht im Directus-Schema (Pre-Live-TODO).
  // Bis dahin nutzen wir date_updated als Proxy für "wann wurde der Lead zuletzt verändert".
  // Im echten Filter ist `status='cancelled'` (Directus-Choice) oder 'lost' (CRM-Code).
  const params: Record<string, string> = {
    fields: 'id,lost_reason,date_updated',
    'filter[status][_in]': 'lost,cancelled',
    limit: '-1',
  }
  if (since) params['filter[date_updated][_gte]'] = since

  const resp = await $fetch<{ data: LostLead[] }>(`${directusUrl}/items/Leads`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    params,
  })

  const leads = resp?.data || []
  const counts: Record<string, number> = {}
  let withReason = 0
  let withoutReason = 0
  for (const l of leads) {
    if (l.lost_reason) {
      counts[l.lost_reason] = (counts[l.lost_reason] || 0) + 1
      withReason += 1
    } else {
      withoutReason += 1
    }
  }
  const by_reason = Object.entries(counts)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)

  return {
    total: leads.length,
    with_reason: withReason,
    without_reason: withoutReason,
    by_reason,
  }
})
