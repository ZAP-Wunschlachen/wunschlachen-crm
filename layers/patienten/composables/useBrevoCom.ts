// composables/useBrevoCom.ts — Brevo API for email, SMS, WhatsApp, newsletters

import type { BrevoConfig, BrevoEmailParams } from '~/types/email'

const BREVO_API = 'https://api.brevo.com/v3'
const STORAGE_KEY = 'praxis-crm-brevo-config'

const getConfig = (): BrevoConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return { apiKey: '', senderEmail: '', senderName: 'Wunschlachen', senderPhone: '' }
}

const saveConfig = (config: BrevoConfig) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export const useBrevoCom = () => {
  const config = ref<BrevoConfig>(getConfig())

  const isConfigured = computed(() => !!config.value.apiKey && !!config.value.senderEmail)
  const apiKey = computed(() => config.value.apiKey)
  const senderEmail = computed(() => config.value.senderEmail)
  const senderName = computed(() => config.value.senderName || 'Wunschlachen')

  const updateConfig = (updates: Partial<BrevoConfig>) => {
    config.value = { ...config.value, ...updates }
    saveConfig(config.value)
  }

  const testConnection = async (): Promise<{ success: boolean; message: string }> => {
    if (!apiKey.value) return { success: false, message: 'Kein API-Key konfiguriert' }
    try {
      const res = await fetch(`${BREVO_API}/account`, {
        headers: { 'api-key': apiKey.value, 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        if (res.status === 401) return { success: false, message: 'API-Key ungültig' }
        return { success: false, message: `Fehler: ${res.status}` }
      }
      const data = await res.json()
      const credits = data.plan?.[0]?.credits ?? '?'
      return { success: true, message: `Verbunden als ${data.email} — ${credits} Credits` }
    } catch (err: any) {
      return { success: false, message: `Verbindungsfehler: ${err.message}` }
    }
  }

  const sendEmail = async (params: BrevoEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    if (!isConfigured.value) return { success: false, error: 'Brevo nicht konfiguriert' }
    try {
      const res = await fetch(`${BREVO_API}/smtp/email`, {
        method: 'POST',
        headers: { 'api-key': apiKey.value, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: { name: senderName.value, email: senderEmail.value },
          to: params.to,
          subject: params.subject,
          htmlContent: params.htmlContent,
          textContent: params.textContent,
          tags: params.tags,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        return { success: false, error: err?.message || `API Fehler: ${res.status}` }
      }
      const result = await res.json()
      return { success: true, messageId: result.messageId }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  const sendSms = async (to: string, content: string, tag?: string): Promise<{ success: boolean; error?: string }> => {
    if (!apiKey.value) return { success: false, error: 'Brevo nicht konfiguriert' }
    try {
      const res = await fetch(`${BREVO_API}/transactionalSMS/sms`, {
        method: 'POST',
        headers: { 'api-key': apiKey.value, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'transactional',
          unicodeEnabled: true,
          sender: config.value.senderPhone || 'Wunschlachen',
          recipient: to,
          content,
          tag: tag || 'crm',
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        return { success: false, error: err?.message || `API Fehler: ${res.status}` }
      }
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  const sendWhatsApp = async (to: string, text: string): Promise<{ success: boolean; error?: string }> => {
    if (!apiKey.value) return { success: false, error: 'Brevo nicht konfiguriert' }
    try {
      const res = await fetch(`${BREVO_API}/whatsapp/sendMessage`, {
        method: 'POST',
        headers: { 'api-key': apiKey.value, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderNumber: config.value.senderPhone,
          recipientNumber: to,
          text,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        return { success: false, error: err?.message || `API Fehler: ${res.status}` }
      }
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  const sendNewsletter = async (
    recipients: { email: string; name?: string }[],
    subject: string,
    htmlContent: string,
    tag?: string,
  ): Promise<{ sent: number; failed: number; errors: string[] }> => {
    let sent = 0
    let failed = 0
    const errors: string[] = []

    const batchSize = 50
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize)
      const result = await sendEmail({
        to: batch,
        subject,
        htmlContent,
        tags: tag ? ['newsletter', tag] : ['newsletter'],
      })
      if (result.success) {
        sent += batch.length
      } else {
        failed += batch.length
        errors.push(result.error || 'Unbekannter Fehler')
      }
    }

    return { sent, failed, errors }
  }

  return {
    config: readonly(config),
    isConfigured,
    updateConfig,
    testConnection,
    sendEmail,
    sendSms,
    sendWhatsApp,
    sendNewsletter,
  }
}
