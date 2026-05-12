/**
 * WhatsApp Inbound-Webhook (Phase 9 T5) — Meta Cloud API kompatibel
 *
 * Meta-Setup:
 *   1. Business Manager → WhatsApp → API Setup
 *   2. Webhook-URL: https://<host>/api/inbound/whatsapp
 *   3. Verify-Token: in ENV `WHATSAPP_VERIFY_TOKEN`
 *   4. Felder abonnieren: messages
 *
 * GET-Request: Webhook-Verifizierung
 * POST-Request: eingehende Nachrichten
 */

import { defineEventHandler, readBody, getQuery, createError, getMethod } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const verifyToken = (config.whatsappVerifyToken as string) || ''
  const directusUrl = config.public.directusUrl as string
  const authHeader = config.brevoToken ? `Bearer ${config.brevoToken}` : ''

  // GET: Meta Webhook-Verification
  if (getMethod(event) === 'GET') {
    const q = getQuery(event)
    if (q['hub.verify_token'] === verifyToken && q['hub.challenge']) {
      return q['hub.challenge']
    }
    throw createError({ statusCode: 403, statusMessage: 'Invalid verify token' })
  }

  const body = await readBody<any>(event)
  // Meta-Payload-Format
  const entries = body?.entry || []
  const results: any[] = []

  for (const entry of entries) {
    for (const change of entry.changes || []) {
      const value = change.value || {}
      const messages = value.messages || []
      for (const msg of messages) {
        const from = msg.from
        const text = msg.text?.body || msg.button?.text || msg.interactive?.button_reply?.title || '(non-text)'
        const messageId = msg.id

        let ticketId: string | null = null

        // Existing WhatsApp-Thread suchen (gleicher Absender, last 30 days, nicht geschlossen)
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        const existing = await $fetch<{ data: any[] }>(`${directusUrl}/items/ticket_messages`, {
          params: {
            'filter[channel][_eq]': 'whatsapp',
            'filter[from_address][_eq]': from,
            'filter[date_created][_gte]': since,
            fields: 'ticket_id',
            sort: '-date_created',
            limit: 1,
          },
          headers: authHeader ? { Authorization: authHeader } : {},
        }).catch(() => ({ data: [] }))

        if (existing.data?.[0]?.ticket_id) {
          ticketId = existing.data[0].ticket_id
          const t = await $fetch<{ data: any }>(`${directusUrl}/items/tickets/${ticketId}`, {
            headers: authHeader ? { Authorization: authHeader } : {},
          }).catch(() => null)
          if (t?.data?.status === 'geschlossen' || t?.data?.status === 'geloest') ticketId = null
        }

        let newTicket = false
        if (!ticketId) {
          const customer = await detectCustomerByPhone(directusUrl, authHeader, from)
          const created = await $fetch<{ data: { id: string } }>(`${directusUrl}/items/tickets`, {
            method: 'POST',
            body: {
              subject: text.slice(0, 80) || '(WhatsApp-Anfrage)',
              status: 'neu',
              priority: 'mittel',
              channel: 'whatsapp',
              customer_type: customer.type,
              customer_id: customer.id,
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
            channel: 'whatsapp',
            from_address: from,
            to_address: value.metadata?.display_phone_number || '',
            body_text: text,
            attachments: [],
            external_message_id: messageId,
          },
          headers: authHeader
            ? { Authorization: authHeader, 'Content-Type': 'application/json' }
            : { 'Content-Type': 'application/json' },
        })

        results.push({ ticket_id: ticketId, new_ticket: newTicket, message_id: messageId })
      }
    }
  }

  return { success: true, results }
})

async function detectCustomerByPhone(
  directusUrl: string,
  authHeader: string,
  phone: string,
): Promise<{ type: 'heimkunde' | 'patient' | 'unbekannt'; id: string | null }> {
  if (!phone) return { type: 'unbekannt', id: null }
  const last10 = phone.replace(/\D/g, '').slice(-10)
  try {
    const pat = await $fetch<{ data: any[] }>(`${directusUrl}/items/patient_leads`, {
      params: { 'filter[phone][_contains]': last10, fields: 'id', limit: 1 },
      headers: authHeader ? { Authorization: authHeader } : {},
    })
    if (pat.data?.[0]?.id) return { type: 'patient', id: pat.data[0].id }
  } catch { /* ignore */ }
  return { type: 'unbekannt', id: null }
}
