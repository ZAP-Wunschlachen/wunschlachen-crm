/**
 * WhatsApp Outbound via Meta Cloud API (Phase 9 T5)
 *
 * ENV erforderlich:
 *   WHATSAPP_PHONE_ID  — die Phone-Number-ID aus Meta
 *   WHATSAPP_TOKEN     — Meta Cloud API Access Token (langlebig)
 *
 * Erwartet body: { ticket_id, to_address, body_text }
 */

import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const phoneId = config.whatsappPhoneId as string
  const token = config.whatsappToken as string

  if (!phoneId || !token) {
    throw createError({
      statusCode: 500,
      statusMessage: 'WHATSAPP_PHONE_ID oder WHATSAPP_TOKEN nicht konfiguriert',
    })
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

  const cleanRecipient = body.to_address.replace(/\D/g, '')

  // Meta Cloud API
  let metaResponse: any
  try {
    metaResponse = await $fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: {
        messaging_product: 'whatsapp',
        to: cleanRecipient,
        type: 'text',
        text: { body: body.body_text },
      },
    })
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.status || 502,
      statusMessage: `Meta API: ${err?.data?.error?.message || err?.message || 'Unbekannter Fehler'}`,
    })
  }

  // Persist
  const directusUrl = config.public.directusUrl as string
  const authHeader = `Bearer ${config.brevoToken || ''}`

  const persisted = await $fetch<{ data: any }>(`${directusUrl}/items/ticket_messages`, {
    method: 'POST',
    body: {
      ticket_id: body.ticket_id,
      direction: 'outbound',
      channel: 'whatsapp',
      from_address: phoneId,
      to_address: cleanRecipient,
      body_text: body.body_text,
      attachments: [],
      sender_user_id: body.sender_user_id || null,
      external_message_id: metaResponse?.messages?.[0]?.id,
    },
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
  }).catch(() => null)

  return {
    success: true,
    meta: metaResponse,
    message: persisted?.data,
  }
})
