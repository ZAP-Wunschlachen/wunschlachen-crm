/**
 * GET /api/lookup/:collection
 *
 * Server-side Read-Proxy für Lookup-Daten (Standorte, zahnärztliche Leistungen
 * etc.). Liest mit dem server-side Directus-Token, damit der Browser keinen
 * Static-Token sieht. Whitelist erzwungen — nur explizit erlaubte Collections.
 *
 * Im Dev-Mode mit BYPASS_AUTH liefert `useSecureData` leere Listen. Diese Route
 * umgeht das durch direkten Fetch gegen Directus.
 */

import { defineEventHandler, getRouterParam, getQuery, createError } from 'h3'

const ALLOWED_COLLECTIONS = ['locations', 'dental_services'] as const

export default defineEventHandler(async (event) => {
  const collection = getRouterParam(event, 'collection') || ''
  if (!(ALLOWED_COLLECTIONS as readonly string[]).includes(collection)) {
    throw createError({ statusCode: 400, statusMessage: `collection not whitelisted: ${collection}` })
  }

  const config = useRuntimeConfig()
  const directusUrl = (config.directusUrl as string) || (config.public.directusUrl as string) || ''
  const token = config.directusServiceToken as string

  if (!directusUrl) throw createError({ statusCode: 500, statusMessage: 'directusUrl not configured' })
  if (!token) throw createError({ statusCode: 500, statusMessage: 'directusServiceToken not configured' })

  const query = getQuery(event)
  const fields = (query.fields as string) || 'id,name'
  const sort = (query.sort as string) || 'name'
  const limit = (query.limit as string) || '-1'

  const resp = await $fetch<{ data: any[] }>(`${directusUrl}/items/${collection}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    params: { fields, sort, limit },
  })

  return { data: resp?.data || [] }
})
