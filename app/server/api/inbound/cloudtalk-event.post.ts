/**
 * CloudTalk Call-Event-Webhook (Plan v9 Phase D)
 *
 * CloudTalk postet hier her bei Call-Events:
 *   - call_started
 *   - call_ended (mit duration, recording_url, sentiment falls AI-Modul aktiv)
 *   - call_missed
 *
 * Setup:
 *   - CloudTalk → Settings → Webhooks
 *   - URL: https://crm.wunschlachen.app/api/inbound/cloudtalk-event
 *   - Optional HMAC-Signature via CLOUDTALK_WEBHOOK_SECRET
 *
 * Action: Schreibt eine call-Activity nach Directus (Soft-Fail wenn Schema noch nicht da).
 *
 * Aktuell: Stub. Persistierung wartet auf Directus-Schema-Erweiterung
 * (lead_activities.metadata.cloudtalk_call_id).
 */

import { defineEventHandler, readBody, getRequestHeader, createError } from 'h3'
import { createHmac, timingSafeEqual } from 'node:crypto'

interface CloudTalkEvent {
  type: 'call_started' | 'call_ended' | 'call_missed'
  call_id: number
  agent_id?: number
  contact_number?: string
  internal_number?: string
  duration?: number
  recording_url?: string
  call_started_at?: string
  call_ended_at?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secret = (config as any).cloudtalkWebhookSecret as string | undefined

  const raw = await readBody<string | CloudTalkEvent>(event)
  const payload: CloudTalkEvent = typeof raw === 'string' ? JSON.parse(raw) : raw

  // Optional Signature-Check
  if (secret) {
    const sig = getRequestHeader(event, 'x-cloudtalk-signature') || ''
    const expected = createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex')
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
    }
  }

  if (!payload?.type || !payload?.call_id) {
    return { success: false, reason: 'missing type/call_id' }
  }

  // Lead per phone-Match auflösen
  const directusUrl = (config.public as any).directusUrl as string
  const authToken = (config as any).directusToken as string | undefined
  const authHeader = authToken ? { Authorization: `Bearer ${authToken}` } : {}

  let leadId: string | null = null
  if (payload.contact_number) {
    try {
      const cleaned = payload.contact_number.replace(/[^0-9+]/g, '')
      const found = await $fetch<{ data: any[] }>(`${directusUrl}/items/Leads`, {
        params: {
          'filter[phone][_contains]': cleaned.slice(-9),
          fields: 'id',
          limit: 1,
        },
        headers: authHeader,
      }).catch(() => ({ data: [] }))
      leadId = found.data?.[0]?.id || null
    } catch {
      /* ignore */
    }
  }

  if (!leadId) {
    return { success: false, reason: 'lead not resolvable', call_id: payload.call_id }
  }

  // Activity loggen
  const subject =
    payload.type === 'call_ended'
      ? `Anruf beendet (${payload.duration ?? '?'}s)`
      : payload.type === 'call_missed'
        ? 'Anruf verpasst'
        : 'Anruf gestartet'

  try {
    await $fetch(`${directusUrl}/items/lead_activities`, {
      method: 'POST',
      body: {
        lead_id: leadId,
        type: 'call',
        subject,
        content: payload.recording_url ? `Aufzeichnung: ${payload.recording_url}` : null,
        date_created: payload.call_ended_at || payload.call_started_at || new Date().toISOString(),
        metadata: {
          cloudtalk_call_id: payload.call_id,
          duration_seconds: payload.duration,
          recording_url: payload.recording_url,
          event_type: payload.type,
        },
      },
      headers: { ...authHeader, 'Content-Type': 'application/json' },
    })
    return { success: true, call_id: payload.call_id, lead_id: leadId }
  } catch (err) {
    console.warn('[cloudtalk-event] activity persist failed:', err)
    return { success: false, reason: 'activity persist failed', call_id: payload.call_id }
  }
})
