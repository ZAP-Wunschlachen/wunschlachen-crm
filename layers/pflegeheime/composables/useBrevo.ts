/**
 * useBrevo Composable
 *
 * Brevo (formerly Sendinblue) integration for sending newsletters.
 * API key and sender info are stored in localStorage (configured in CRM settings).
 * Uses Brevo Transactional Email API v3.
 */

const BREVO_API = 'https://api.brevo.com/v3'
const STORAGE_KEY = 'crm_brevo_config'

interface BrevoConfig {
  apiKey: string
  senderEmail: string
  senderName: string
}

export interface BrevoEmailParams {
  to: { email: string; name?: string }[]
  subject: string
  htmlContent: string
  textContent?: string
  tags?: string[]
}

const getConfig = (): BrevoConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return { apiKey: '', senderEmail: '', senderName: 'Wunschlachen' }
}

const saveConfig = (config: BrevoConfig) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export const useBrevo = () => {
  const config = ref<BrevoConfig>(getConfig())

  const apiKey = computed(() => config.value.apiKey)
  const senderEmail = computed(() => config.value.senderEmail)
  const senderName = computed(() => config.value.senderName || 'Wunschlachen')
  const isConfigured = computed(() => !!config.value.apiKey && !!config.value.senderEmail)

  const updateConfig = (updates: Partial<BrevoConfig>) => {
    config.value = { ...config.value, ...updates }
    saveConfig(config.value)
  }

  /**
   * Test Brevo API connection
   */
  const testConnection = async (): Promise<{ success: boolean; message: string }> => {
    if (!apiKey.value) {
      return { success: false, message: 'Kein Brevo API-Key konfiguriert' }
    }

    try {
      const response = await fetch(`${BREVO_API}/account`, {
        headers: {
          'api-key': apiKey.value,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) return { success: false, message: 'API-Key ungültig' }
        return { success: false, message: `Fehler: ${response.status}` }
      }

      const data = await response.json()
      const credits = data.plan?.[0]?.credits ?? '?'
      return {
        success: true,
        message: `Verbunden als ${data.email} — ${credits} Credits verfügbar`,
      }
    } catch (error: any) {
      return { success: false, message: `Verbindungsfehler: ${error.message}` }
    }
  }

  /**
   * Send a transactional email via Brevo
   */
  const sendEmail = async (params: BrevoEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    if (!isConfigured.value) {
      return { success: false, error: 'Brevo nicht konfiguriert — bitte API-Key in Einstellungen hinterlegen' }
    }

    try {
      const response = await fetch(`${BREVO_API}/smtp/email`, {
        method: 'POST',
        headers: {
          'api-key': apiKey.value,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: senderName.value, email: senderEmail.value },
          to: params.to,
          subject: params.subject,
          htmlContent: params.htmlContent,
          textContent: params.textContent,
          tags: params.tags,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        return { success: false, error: err?.message || `API Fehler: ${response.status}` }
      }

      const result = await response.json()
      return { success: true, messageId: result.messageId }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Send newsletter to multiple recipients
   */
  const sendNewsletter = async (
    recipients: { email: string; name?: string }[],
    subject: string,
    htmlContent: string,
    topicId?: string,
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
        tags: topicId ? ['newsletter', topicId] : ['newsletter'],
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
    isConfigured,
    senderEmail,
    senderName,
    apiKey,
    config,
    updateConfig,
    testConnection,
    sendEmail,
    sendNewsletter,
  }
}
