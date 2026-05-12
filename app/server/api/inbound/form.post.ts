/**
 * Form-Submission Public-Endpoint (Phase 9 T6)
 *
 * Web-Forms (z.B. Lead-Formular auf Website) posten hier hin:
 *   POST /api/inbound/form
 *   Body: {
 *     name, email, phone, message,
 *     source, customer_type, tags?
 *   }
 *
 * - Erstellt neues Ticket (Channel "form")
 * - Optional: erstellt parallel einen Lead in patient_leads (B2C) oder Leads (B2B)
 *
 * Public Endpoint — geschützt nur durch:
 * - Origin/Referer-Check (optional via ENV `FORM_ALLOWED_ORIGINS`)
 * - Honeypot-Feld `_hp` (wenn gesetzt → spam, silently ignored)
 * - Optional: simple Rate-Limit via Origin-IP (basic)
 */

import { defineEventHandler, readBody, createError, getRequestHeader } from 'h3'

interface FormPayload {
  name: string
  email?: string
  phone?: string
  message: string
  source?: string
  customer_type?: 'heimkunde' | 'patient' | 'unbekannt'
  tags?: string[]
  _hp?: string // Honeypot
}

export default defineEventHandler(async (event) => {
  // Honeypot: legit users haben kein _hp Feld ausgefüllt
  const body = await readBody<FormPayload>(event)
  if (body?._hp) {
    // Spam — silent accept (200), nicht persistieren
    return { success: true, ticket_id: null, note: 'silently dropped' }
  }

  if (!body?.name || !body?.message) {
    throw createError({ statusCode: 400, statusMessage: 'Erforderlich: name, message' })
  }
  if (!body.email && !body.phone) {
    throw createError({ statusCode: 400, statusMessage: 'Erforderlich: email oder phone' })
  }

  // Origin-Check (wenn konfiguriert)
  const config = useRuntimeConfig()
  const allowedOrigins = (config.formAllowedOrigins as string) || ''
  if (allowedOrigins) {
    const origin = getRequestHeader(event, 'origin') || getRequestHeader(event, 'referer') || ''
    const allowed = allowedOrigins.split(',').map((o) => o.trim()).filter(Boolean)
    if (!allowed.some((a) => origin.startsWith(a))) {
      throw createError({ statusCode: 403, statusMessage: 'Origin nicht erlaubt' })
    }
  }

  const directusUrl = config.public.directusUrl as string
  const authHeader = config.brevoToken ? `Bearer ${config.brevoToken}` : ''

  const customerType = body.customer_type || 'patient' // Default Web-Form = Patient-Lead
  const subject = body.source
    ? `Formular-Anfrage (${body.source}): ${body.name}`
    : `Formular-Anfrage: ${body.name}`

  // 1) Optional: Lead in entsprechender Collection anlegen
  let customerId: string | null = null
  try {
    if (customerType === 'patient') {
      const lead = await $fetch<{ data: { id: string } }>(`${directusUrl}/items/patient_leads`, {
        method: 'POST',
        body: {
          first_name: body.name.split(' ')[0],
          last_name: body.name.split(' ').slice(1).join(' '),
          email: body.email || null,
          phone: body.phone || null,
          status: 'open',
          source: body.source || 'website',
        },
        headers: authHeader
          ? { Authorization: authHeader, 'Content-Type': 'application/json' }
          : { 'Content-Type': 'application/json' },
      })
      customerId = lead.data.id
    }
  } catch (err) {
    console.warn('[form-inbound] Konnte Patient-Lead nicht anlegen:', err)
  }

  // 2) Ticket anlegen
  const ticket = await $fetch<{ data: { id: string } }>(`${directusUrl}/items/tickets`, {
    method: 'POST',
    body: {
      subject,
      status: 'neu',
      priority: 'mittel',
      channel: 'form',
      customer_type: customerType,
      customer_id: customerId,
      related_lead_id: customerId,
      tags: [...(body.tags || []), 'website'],
      sla_breach: false,
    },
    headers: authHeader
      ? { Authorization: authHeader, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' },
  })

  // 3) Erste Nachricht (Formular-Inhalt)
  const formattedBody = [
    `Name: ${body.name}`,
    body.email ? `E-Mail: ${body.email}` : '',
    body.phone ? `Telefon: ${body.phone}` : '',
    body.source ? `Quelle: ${body.source}` : '',
    '',
    body.message,
  ]
    .filter(Boolean)
    .join('\n')

  await $fetch(`${directusUrl}/items/ticket_messages`, {
    method: 'POST',
    body: {
      ticket_id: ticket.data.id,
      direction: 'inbound',
      channel: 'form',
      from_address: body.email || body.phone || '',
      to_address: 'website-form',
      body_text: formattedBody,
      attachments: [],
    },
    headers: authHeader
      ? { Authorization: authHeader, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' },
  })

  return { success: true, ticket_id: ticket.data.id, lead_id: customerId }
})
