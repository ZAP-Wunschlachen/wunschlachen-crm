/**
 * GET /api/dev-read/:collection/:id
 *
 * Read-only Single-Item-Proxy für Dev-Modus.
 */

import { defineEventHandler, getRouterParam, getQuery, createError } from 'h3'

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
  const id = getRouterParam(event, 'id') || ''
  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    throw createError({ statusCode: 400, statusMessage: `collection not whitelisted: ${collection}` })
  }
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const config = useRuntimeConfig()
  const directusUrl = (config.directusUrl as string) || (config.public.directusUrl as string) || ''
  const token = config.directusServiceToken as string
  if (!directusUrl) throw createError({ statusCode: 500, statusMessage: 'directusUrl not configured' })
  if (!token) throw createError({ statusCode: 500, statusMessage: 'directusServiceToken not configured' })

  const query = getQuery(event)
  const params: Record<string, string> = {}
  for (const [k, v] of Object.entries(query)) {
    if (v != null) params[k] = String(v)
  }

  try {
    const resp = await $fetch<{ data: any }>(`${directusUrl}/items/${collection}/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      params,
    })
    return resp
  } catch (e: any) {
    throw createError({ statusCode: 502, statusMessage: `directus read failed: ${e?.message || e}` })
  }
})
