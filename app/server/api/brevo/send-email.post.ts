// Server-only Brevo Proxy — Token bleibt server-side (BREVO_TOKEN env)
// Composables (useBrevo, useBrevoCom) können entweder weiter localStorage-Token
// nutzen ODER auf diese Route umstellen, dann ist der Token zentral verwaltet.

import { defineEventHandler, readBody, createError } from 'h3'

const BREVO_API = 'https://api.brevo.com/v3'

interface BrevoSendEmailBody {
  to: { email: string; name?: string }[]
  subject?: string
  htmlContent?: string
  textContent?: string
  tags?: string[]
  // Optional: Override-Sender (falls nicht config.brevoSenderEmail genutzt werden soll)
  senderEmail?: string
  senderName?: string
  // Plan v9 Phase C: Brevo-Template-ID als Alternative zu htmlContent/subject
  templateId?: number
  // Optional: Brevo-Template-Params (für {{params.var}})
  params?: Record<string, string | number>
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

  if (!body?.to?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required field: to',
    })
  }

  // Entweder Inline-Content (subject+htmlContent) ODER templateId
  if (!body.templateId && (!body.subject || !body.htmlContent)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Either templateId OR (subject + htmlContent) is required',
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

  // Brevo-Body: Template-Mode oder Inline-Content
  const brevoBody: Record<string, any> = {
    sender: { name: senderName, email: senderEmail },
    to: body.to,
    tags: body.tags,
  }
  if (body.templateId) {
    brevoBody.templateId = body.templateId
    if (body.params) brevoBody.params = body.params
  } else {
    brevoBody.subject = body.subject
    brevoBody.htmlContent = body.htmlContent
    if (body.textContent) brevoBody.textContent = body.textContent
  }

  try {
    const response = await $fetch<{ messageId: string }>(`${BREVO_API}/smtp/email`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: brevoBody,
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
