/**
 * GET /api/dev-read/:collection
 *
 * Read-only Server-Proxy für Dev-Modus. Liest mit dem server-side Static-Token
 * gegen die echte Directus-Instanz, damit das CRM im Dev (DEV_MODE_BYPASS_AUTH)
 * echte Live-Daten anzeigt OHNE dass der User sich einloggen muss.
 *
 * Whitelist erzwungen — Writes sind absichtlich NICHT möglich, sonst könnte
 * der Dev-Modus Production-Daten verändern.
 *
 * Im Production-Modus (DEV_MODE_BYPASS_AUTH=false) wird diese Route nicht
 * benutzt — dort laufen alle Calls cookie-authentifiziert direkt gegen
 * Directus.
 */

import { defineEventHandler, getRouterParam, getQuery, createError } from 'h3'

// Whitelist: welche Collections darf der Dev-Read-Proxy abfragen?
// Alles was im CRM-UI lesend gebraucht wird.
const ALLOWED_COLLECTIONS = [
  'Leads',
  'appointments',
  'activities',
  'locations',
  'dental_services',
  'patients',
  'treatments',
  'treatment_templates',
  'calendars',
  'calendar_columns',
  'email_events',
]

export default defineEventHandler(async (event) => {
  const collection = getRouterParam(event, 'collection') || ''
  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    throw createError({ statusCode: 400, statusMessage: `collection not whitelisted: ${collection}` })
  }

  const config = useRuntimeConfig()
  const directusUrl = (config.directusUrl as string) || (config.public.directusUrl as string) || ''
  const token = config.directusServiceToken as string
  if (!directusUrl) throw createError({ statusCode: 500, statusMessage: 'directusUrl not configured' })
  if (!token) throw createError({ statusCode: 500, statusMessage: 'directusServiceToken not configured' })

  // Alle Query-Params durchreichen — Directus akzeptiert sie 1:1
  const query = getQuery(event)
  const params: Record<string, string> = {}
  for (const [k, v] of Object.entries(query)) {
    if (v != null) params[k] = String(v)
  }

  try {
    const resp = await $fetch<{ data: any[] }>(`${directusUrl}/items/${collection}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      params,
    })
    return resp
  } catch (e: any) {
    throw createError({ statusCode: 502, statusMessage: `directus read failed: ${e?.message || e}` })
  }
})
