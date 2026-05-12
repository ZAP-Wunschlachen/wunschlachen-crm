/**
 * Brevo Tracking-Event-Webhook (Plan v9 Phase B)
 *
 * Brevo postet pro E-Mail-Lifecycle-Event hier her:
 *   - request    → unsere ausgehende E-Mail wurde eingereicht
 *   - delivered  → erfolgreich zugestellt
 *   - opens      → Empfänger hat geöffnet (Tracking-Pixel)
 *   - click      → Empfänger hat Link geklickt
 *   - bounce     → soft/hard bounce
 *   - spam       → Empfänger hat als Spam markiert
 *   - unsubscribed
 *   - blocked
 *
 * Brevo-Setup:
 *   1. Login → SMTP & API → Webhooks → "Add webhook"
 *   2. URL:    https://<host>/api/inbound/brevo-event
 *   3. Events: opens, click, bounce, spam, unsubscribed (mindestens)
 *   4. Optional: Test mit Curl-Sample (siehe Brevo-Docs)
 *
 * Schreibt nach Directus Collection `email_events`:
 *   { id, lead_id, activity_id, event_type, occurred_at, click_url, message_id }
 *
 * Lead-Auflösung:
 *   1. tags[]: Wir taggen ausgehende E-Mails mit 'lead-<id>' beim Versand
 *   2. message-id: Wir mappen brevo message-id → ticket_messages.external_message_id
 *
 * Aktuell: Stub-Endpoint. Persistierung steht aus bis Directus-Schema bereit.
 */

import { defineEventHandler, readBody } from 'h3'

interface BrevoWebhookEvent {
  event: 'request' | 'delivered' | 'opens' | 'click' | 'bounce' | 'spam' | 'unsubscribed' | 'blocked'
  email: string
  id?: number               // event id
  date: string              // ISO timestamp
  ts?: number               // unix timestamp
  'message-id'?: string     // Brevo Message-ID (für Threading)
  tag?: string              // pipe-separated tags
  tags?: string[]           // alternativ als array
  link?: string             // bei event=click
  reason?: string           // bei event=bounce
  subject?: string
  sending_ip?: string
}

// Brevo-Event → unser internes event_type
const EVENT_TYPE_MAP: Record<BrevoWebhookEvent['event'], string> = {
  request: 'sent',
  delivered: 'delivered',
  opens: 'opened',
  click: 'clicked',
  bounce: 'bounced',
  blocked: 'bounced',
  spam: 'spam',
  unsubscribed: 'unsubscribed',
}

export default defineEventHandler(async (event) => {
  const body = await readBody<BrevoWebhookEvent | BrevoWebhookEvent[]>(event)
  const events = Array.isArray(body) ? body : [body]

  const config = useRuntimeConfig()
  const directusUrl = config.public.directusUrl as string
  const authHeader = config.brevoToken ? `Bearer ${config.brevoToken}` : ''

  const results: { event_id?: number; lead_id?: string; status: 'logged' | 'skipped' | 'error'; reason?: string }[] = []

  for (const ev of events) {
    if (!ev?.event || !ev?.email) {
      results.push({ status: 'skipped', reason: 'missing event/email' })
      continue
    }

    // Lead-ID aus tags ermitteln (Format: "lead-<id>")
    const allTags: string[] = ev.tags || (ev.tag ? ev.tag.split('|') : [])
    const leadTag = allTags.find((t) => t.startsWith('lead-'))
    const leadId = leadTag ? leadTag.replace('lead-', '') : null

    // Fallback: per E-Mail in patient_leads suchen
    let resolvedLeadId = leadId
    if (!resolvedLeadId) {
      try {
        const found = await $fetch<{ data: any[] }>(`${directusUrl}/items/Leads`, {
          params: { 'filter[mail][_eq]': ev.email, fields: 'id', limit: 1 },
          headers: authHeader ? { Authorization: authHeader } : {},
        }).catch(() => ({ data: [] }))
        resolvedLeadId = found.data?.[0]?.id || null
      } catch {
        /* ignore */
      }
    }

    if (!resolvedLeadId) {
      results.push({ event_id: ev.id, status: 'skipped', reason: 'lead not resolvable' })
      continue
    }

    // Persistieren in email_events
    const eventType = EVENT_TYPE_MAP[ev.event] || ev.event
    try {
      await $fetch(`${directusUrl}/items/email_events`, {
        method: 'POST',
        body: {
          lead_id: resolvedLeadId,
          event_type: eventType,
          occurred_at: ev.date || new Date().toISOString(),
          message_id: ev['message-id'] || null,
          click_url: ev.link || null,
          raw_payload: ev,
        },
        headers: authHeader
          ? { Authorization: authHeader, 'Content-Type': 'application/json' }
          : { 'Content-Type': 'application/json' },
      })
      results.push({ event_id: ev.id, lead_id: resolvedLeadId, status: 'logged' })
    } catch (err) {
      // Collection vermutlich noch nicht da — soft fail
      console.warn('[brevo-event] persist failed (Collection vorhanden?):', err)
      results.push({ event_id: ev.id, lead_id: resolvedLeadId, status: 'error', reason: 'persist failed (Collection?)' })
    }
  }

  return { success: true, processed: events.length, results }
})
