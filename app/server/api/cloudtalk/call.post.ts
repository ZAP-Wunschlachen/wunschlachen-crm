/**
 * CloudTalk Click-to-Call Proxy (Plan v9 Phase D)
 *
 * Client ruft hier auf; Server hält die CloudTalk-API-Credentials.
 *
 * Setup (nach Vertragsabschluss):
 *   1. CloudTalk → API & Webhooks → "Click-to-call" aktivieren
 *   2. CLOUDTALK_API_KEY_ID + CLOUDTALK_API_KEY_SECRET in .env setzen
 *   3. Webhook in CloudTalk auf https://crm.wunschlachen.app/api/inbound/cloudtalk-event setzen
 *
 * Aktuell: Stub-Endpoint. Liefert mock-Response bis Credentials gesetzt sind.
 */

import { defineEventHandler, readBody, createError } from 'h3'

const CT_API = 'https://my.cloudtalk.io/api'

interface CallBody {
  lead_id: string
  phone: string
  /** Optional: spezifischer CloudTalk-Agent-ID (sonst Default aus Config) */
  agent_id?: number
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKeyId = (config as any).cloudtalkApiKeyId as string | undefined
  const apiKeySecret = (config as any).cloudtalkApiKeySecret as string | undefined
  const defaultAgentId = (config as any).cloudtalkAgentId as string | number | undefined

  const body = await readBody<CallBody>(event)
  if (!body?.phone) {
    throw createError({ statusCode: 400, statusMessage: 'phone is required' })
  }

  // Mock-Mode: wenn Credentials fehlen, simulieren
  if (!apiKeyId || !apiKeySecret) {
    return {
      success: true,
      mode: 'mock',
      call_id: `mock-${Date.now()}`,
      message: 'CloudTalk-Credentials nicht konfiguriert — Mock-Response',
    }
  }

  const agentId = body.agent_id || defaultAgentId
  if (!agentId) {
    throw createError({ statusCode: 500, statusMessage: 'CLOUDTALK_AGENT_ID missing in config and no override provided' })
  }

  try {
    const auth = Buffer.from(`${apiKeyId}:${apiKeySecret}`).toString('base64')
    const res = await $fetch<{ status: number; data?: any }>(`${CT_API}/calls/create.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: {
        agent_id: agentId,
        callee_number: body.phone,
      },
    })

    return {
      success: true,
      mode: 'live',
      call_id: res?.data?.call_id || null,
      message: 'Call initiated',
    }
  } catch (err: any) {
    console.error('[cloudtalk] call init failed:', err)
    throw createError({
      statusCode: err?.response?.status || 502,
      statusMessage: `CloudTalk API: ${err?.data?.message || err?.message || 'unknown'}`,
    })
  }
})
