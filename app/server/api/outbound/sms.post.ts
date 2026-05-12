/**
 * SMS Outbound via Brevo (Phase 9 T4)
 *
 * Erwartet body: { ticket_id, to_address, body_text }
 * Speichert Outbound-Nachricht im Ticket + sendet via Brevo SMS API.
 */

import { defineEventHandler, readBody, createError } from 'h3'

const BREVO_SMS_API = 'https://api.brevo.com/v3/transactionalSMS/sms'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = config.brevoToken as string
  const sender = (config.brevoSenderName as string) || 'Wunschlachen'

  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'BREVO_TOKEN nicht konfiguriert' })
  }

  const body = await readBody<{
    ticket_id: string
    to_address: string
    body_text: string
    sender_user_id?: string
  }>(event)

  if (!body?.ticket_id || !body?.to_address || !body?.body_text) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Erforderlich: ticket_id, to_address, body_text',
    })
  }

  // Brevo SMS-Versand
  let brevoResponse: any
  try {
    brevoResponse = await $fetch(BREVO_SMS_API, {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      body: {
        sender,
        recipient: body.to_address,
        content: body.body_text,
        type: 'transactional',
      },
    })
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.status || 502,
      statusMessage: `Brevo SMS: ${err?.data?.message || err?.message || 'Unbekannter Fehler'}`,
    })
  }

  // Persist in Directus
  const directusUrl = config.public.directusUrl as string
  const authHeader = `Bearer ${apiKey}` // optional

  const persisted = await $fetch<{ data: any }>(`${directusUrl}/items/ticket_messages`, {
    method: 'POST',
    body: {
      ticket_id: body.ticket_id,
      direction: 'outbound',
      channel: 'sms',
      from_address: sender,
      to_address: body.to_address,
      body_text: body.body_text,
      attachments: [],
      sender_user_id: body.sender_user_id || null,
      external_message_id: brevoResponse?.reference || `brevo-sms-${Date.now()}`,
    },
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
  }).catch(() => null)

  return {
    success: true,
    brevo: brevoResponse,
    message: persisted?.data,
  }
})
