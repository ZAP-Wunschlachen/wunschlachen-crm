/**
 * SMS Inbound-Webhook (Phase 9 T4)
 *
 * Provider: Brevo SMS oder Twilio (Payload-Shape unterschiedlich — hier
 * generischer Wrapper, dispatched basierend auf Header oder Field-Names).
 *
 * Konfiguration: SMS-Provider zeigt auf https://<host>/api/inbound/sms
 */

import { defineEventHandler, readBody, createError } from 'h3'

interface NormalizedInbound {
  from: string
  to: string
  body: string
  externalId?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  if (!body) throw createError({ statusCode: 400, statusMessage: 'No payload' })

  const inbound = normalizePayload(body)
  if (!inbound) {
    throw createError({ statusCode: 400, statusMessage: 'Could not parse SMS payload' })
  }

  const config = useRuntimeConfig()
  const directusUrl = config.public.directusUrl as string
  const authHeader = config.brevoToken ? `Bearer ${config.brevoToken}` : ''

  // Existing offenes Ticket vom selben Absender finden (last 30 days)
  let ticketId: string | null = null
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const existing = await $fetch<{ data: any[] }>(`${directusUrl}/items/ticket_messages`, {
    params: {
      'filter[channel][_eq]': 'sms',
      'filter[from_address][_eq]': inbound.from,
      'filter[date_created][_gte]': since,
      fields: 'ticket_id',
      sort: '-date_created',
      limit: 1,
    },
    headers: authHeader ? { Authorization: authHeader } : {},
  }).catch(() => ({ data: [] }))

  if (existing.data?.[0]?.ticket_id) {
    ticketId = existing.data[0].ticket_id
    // Prüfe ob Ticket noch offen
    const t = await $fetch<{ data: any }>(`${directusUrl}/items/tickets/${ticketId}`, {
      headers: authHeader ? { Authorization: authHeader } : {},
    }).catch(() => null)
    if (t?.data?.status === 'geschlossen' || t?.data?.status === 'geloest') {
      ticketId = null // Neues Ticket für geschlossenes Thema
    }
  }

  let newTicket = false
  if (!ticketId) {
    const customerType = await detectCustomerTypeByPhone(directusUrl, authHeader, inbound.from)
    const created = await $fetch<{ data: { id: string } }>(`${directusUrl}/items/tickets`, {
      method: 'POST',
      body: {
        subject: inbound.body.slice(0, 80) || '(SMS-Anfrage)',
        status: 'neu',
        priority: 'mittel',
        channel: 'sms',
        customer_type: customerType.type,
        customer_id: customerType.id,
        tags: [],
        sla_breach: false,
      },
      headers: authHeader
        ? { Authorization: authHeader, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' },
    })
    ticketId = created.data.id
    newTicket = true
  }

  await $fetch(`${directusUrl}/items/ticket_messages`, {
    method: 'POST',
    body: {
      ticket_id: ticketId,
      direction: 'inbound',
      channel: 'sms',
      from_address: inbound.from,
      to_address: inbound.to,
      body_text: inbound.body,
      attachments: [],
      external_message_id: inbound.externalId,
    },
    headers: authHeader
      ? { Authorization: authHeader, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' },
  })

  return { success: true, ticket_id: ticketId, new_ticket: newTicket }
})

function normalizePayload(payload: any): NormalizedInbound | null {
  // Brevo-Webhook-Format
  if (payload.event === 'inbound_sms' && payload.from && payload.to && payload.text) {
    return {
      from: payload.from,
      to: payload.to,
      body: payload.text,
      externalId: payload.id,
    }
  }
  // Twilio-Format (From, To, Body, MessageSid)
  if (payload.From && payload.Body) {
    return {
      from: payload.From,
      to: payload.To || '',
      body: payload.Body,
      externalId: payload.MessageSid,
    }
  }
  // Generic
  if (payload.from && payload.body) {
    return {
      from: payload.from,
      to: payload.to || '',
      body: payload.body,
      externalId: payload.id,
    }
  }
  return null
}

async function detectCustomerTypeByPhone(
  directusUrl: string,
  authHeader: string,
  phone: string,
): Promise<{ type: 'heimkunde' | 'patient' | 'unbekannt'; id: string | null }> {
  const normalized = phone.replace(/[\s\-()]/g, '')
  if (!normalized) return { type: 'unbekannt', id: null }
  try {
    const pat = await $fetch<{ data: any[] }>(`${directusUrl}/items/patient_leads`, {
      params: { 'filter[phone][_contains]': normalized.slice(-10), fields: 'id', limit: 1 },
      headers: authHeader ? { Authorization: authHeader } : {},
    })
    if (pat.data?.[0]?.id) return { type: 'patient', id: pat.data[0].id }
  } catch { /* ignore */ }
  try {
    const heim = await $fetch<{ data: any[] }>(`${directusUrl}/items/Leads`, {
      params: {
        'filter[nursing_home_id][fone][_contains]': normalized.slice(-10),
        fields: 'id',
        limit: 1,
      },
      headers: authHeader ? { Authorization: authHeader } : {},
    })
    if (heim.data?.[0]?.id) return { type: 'heimkunde', id: heim.data[0].id }
  } catch { /* ignore */ }
  return { type: 'unbekannt', id: null }
}
