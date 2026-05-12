/**
 * Brevo Inbound-E-Mail-Webhook (Phase 9 T3)
 *
 * Konfiguration in Brevo:
 *   Settings → Senders & IPs → Inbound Parsing → URL: https://<host>/api/inbound/email
 *
 * Payload-Format (vereinfacht, siehe Brevo-Docs):
 *   { items: [{ From, To, Subject, Date, MessageId, InReplyTo, References,
 *               Headers, RawHtmlBody, RawTextBody, Attachments }] }
 *
 * Threading: existiert ein Ticket mit demselben In-Reply-To/References-Header oder
 * mit Subject "AW:/RE: <subject>" → ticket_message anhängen. Sonst neues Ticket.
 */

import { defineEventHandler, readBody, createError } from 'h3'

interface BrevoInboundItem {
  Uuid?: string
  From: { Address: string; Name?: string }[]
  To: { Address: string }[]
  Subject: string
  Date?: string
  MessageId?: string
  InReplyTo?: string
  References?: string[]
  RawHtmlBody?: string
  RawTextBody?: string
  Attachments?: { Name: string; ContentType: string; ContentLength: number; DownloadToken: string }[]
}

interface BrevoInboundPayload {
  items: BrevoInboundItem[]
}

export default defineEventHandler(async (event) => {
  const body = await readBody<BrevoInboundPayload>(event)
  if (!body?.items?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No items in payload' })
  }

  const config = useRuntimeConfig()
  const directusUrl = config.public.directusUrl as string
  const authHeader = `Bearer ${config.brevoToken || ''}` // optional: server-token wenn Directus geschützt

  const results: { ticket_id: string; message_id: string; new_ticket: boolean }[] = []

  for (const item of body.items) {
    const fromAddr = item.From?.[0]?.Address || ''
    const fromName = item.From?.[0]?.Name || ''
    const toAddr = item.To?.[0]?.Address || ''
    const subject = item.Subject || '(kein Betreff)'
    const messageId = item.MessageId || `inbound-${Date.now()}`
    const cleanSubject = subject.replace(/^(AW|RE|FW|FWD):\s*/gi, '').trim()

    // 1) Existing Ticket finden (per InReplyTo)
    let ticketId: string | null = null
    if (item.InReplyTo) {
      const existing = await $fetch<{ data: any[] }>(`${directusUrl}/items/ticket_messages`, {
        params: {
          'filter[external_message_id][_eq]': item.InReplyTo,
          fields: 'ticket_id',
          limit: 1,
        },
        headers: authHeader ? { Authorization: authHeader } : {},
      }).catch(() => ({ data: [] }))
      if (existing.data?.[0]?.ticket_id) {
        ticketId = existing.data[0].ticket_id
      }
    }

    // Fallback: Subject-Match (last 30 days)
    if (!ticketId) {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const candidates = await $fetch<{ data: any[] }>(`${directusUrl}/items/tickets`, {
        params: {
          'filter[subject][_eq]': cleanSubject,
          'filter[date_created][_gte]': since,
          'filter[status][_neq]': 'geschlossen',
          fields: 'id',
          limit: 1,
        },
        headers: authHeader ? { Authorization: authHeader } : {},
      }).catch(() => ({ data: [] }))
      if (candidates.data?.[0]?.id) {
        ticketId = candidates.data[0].id
      }
    }

    let newTicket = false
    if (!ticketId) {
      // 2) Neues Ticket anlegen
      const customerType = await detectCustomerType(directusUrl, authHeader, fromAddr)
      const created = await $fetch<{ data: { id: string } }>(`${directusUrl}/items/tickets`, {
        method: 'POST',
        body: {
          subject: cleanSubject,
          status: 'neu',
          priority: 'mittel',
          channel: 'email',
          customer_type: customerType.type,
          customer_id: customerType.id,
          tags: [],
          sla_breach: false,
        },
        headers: authHeader ? { Authorization: authHeader, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
      })
      ticketId = created.data.id
      newTicket = true
    }

    // 3) Nachricht anlegen
    const msg = await $fetch<{ data: { id: string } }>(`${directusUrl}/items/ticket_messages`, {
      method: 'POST',
      body: {
        ticket_id: ticketId,
        direction: 'inbound',
        channel: 'email',
        from_address: fromAddr,
        to_address: toAddr,
        subject: item.Subject,
        body_html: item.RawHtmlBody || null,
        body_text: item.RawTextBody || (item.RawHtmlBody ? stripHtml(item.RawHtmlBody) : ''),
        attachments: [],
        external_message_id: messageId,
      },
      headers: authHeader ? { Authorization: authHeader, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
    })

    // 4) Ticket-Last-Updated tracken
    await $fetch(`${directusUrl}/items/tickets/${ticketId}`, {
      method: 'PATCH',
      body: { date_updated: new Date().toISOString() },
      headers: authHeader ? { Authorization: authHeader, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
    }).catch(() => null)

    results.push({ ticket_id: ticketId, message_id: msg.data.id, new_ticket: newTicket })
  }

  return { success: true, results }
})

// Customer-Type detect: existiert eine E-Mail in Leads (B2B) oder patient_leads (B2C)?
async function detectCustomerType(
  directusUrl: string,
  authHeader: string,
  fromAddr: string,
): Promise<{ type: 'heimkunde' | 'patient' | 'unbekannt'; id: string | null }> {
  if (!fromAddr) return { type: 'unbekannt', id: null }
  try {
    const heim = await $fetch<{ data: any[] }>(`${directusUrl}/items/Leads`, {
      params: {
        'filter[nursing_home_id][email][_eq]': fromAddr,
        fields: 'id',
        limit: 1,
      },
      headers: authHeader ? { Authorization: authHeader } : {},
    })
    if (heim.data?.[0]?.id) return { type: 'heimkunde', id: heim.data[0].id }
  } catch { /* ignore */ }
  try {
    const pat = await $fetch<{ data: any[] }>(`${directusUrl}/items/patient_leads`, {
      params: {
        'filter[email][_eq]': fromAddr,
        fields: 'id',
        limit: 1,
      },
      headers: authHeader ? { Authorization: authHeader } : {},
    })
    if (pat.data?.[0]?.id) return { type: 'patient', id: pat.data[0].id }
  } catch { /* ignore */ }
  return { type: 'unbekannt', id: null }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
