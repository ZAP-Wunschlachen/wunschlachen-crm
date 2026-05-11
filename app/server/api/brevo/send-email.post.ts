// Server-only Brevo Proxy — Token bleibt server-side (BREVO_TOKEN env)
// Composables (useBrevo, useBrevoCom) können entweder weiter localStorage-Token
// nutzen ODER auf diese Route umstellen, dann ist der Token zentral verwaltet.

import { defineEventHandler, readBody, createError } from 'h3'

const BREVO_API = 'https://api.brevo.com/v3'

interface BrevoSendEmailBody {
  to: { email: string; name?: string }[]
  subject: string
  htmlContent: string
  textContent?: string
  tags?: string[]
  // Optional: Override-Sender (falls nicht config.brevoSenderEmail genutzt werden soll)
  senderEmail?: string
  senderName?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const apiKey = config.brevoToken as string
  const defaultSenderEmail = config.brevoSenderEmail as string
  const defaultSenderName = config.brevoSenderName as string

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'BREVO_TOKEN is not configured on server',
    })
  }

  const body = await readBody<BrevoSendEmailBody>(event)

  if (!body?.to?.length || !body?.subject || !body?.htmlContent) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: to, subject, htmlContent',
    })
  }

  const senderEmail = body.senderEmail || defaultSenderEmail
  const senderName = body.senderName || defaultSenderName

  if (!senderEmail) {
    throw createError({
      statusCode: 500,
      statusMessage: 'BREVO_SENDER_EMAIL is not configured and no override provided',
    })
  }

  try {
    const response = await $fetch<{ messageId: string }>(`${BREVO_API}/smtp/email`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: {
        sender: { name: senderName, email: senderEmail },
        to: body.to,
        subject: body.subject,
        htmlContent: body.htmlContent,
        textContent: body.textContent,
        tags: body.tags,
      },
    })

    return { success: true, messageId: response.messageId }
  } catch (err: any) {
    const status = err?.response?.status || err?.statusCode || 502
    const message = err?.data?.message || err?.message || 'Brevo API error'

    throw createError({
      statusCode: status,
      statusMessage: `Brevo API: ${message}`,
    })
  }
})
