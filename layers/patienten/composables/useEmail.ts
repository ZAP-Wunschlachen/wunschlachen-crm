/**
 * useEmail Composable
 *
 * Wrapper for the Directus email-service extension endpoints.
 * All requests use httpOnly cookies for authentication.
 */

interface SendEmailParams {
  to: string
  subject: string
  body_html?: string
  body_text?: string
  lead_id?: string
}

interface InboxMessage {
  uid: number
  message_id: string
  from: { address: string; name?: string }[]
  to: { address: string; name?: string }[]
  subject: string
  date: string
  text?: string
  html?: string
  seen: boolean
}

interface EmailAccount {
  provider: string
  user: string
  configured: boolean
}

export const useEmail = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.directusUrl || 'http://localhost:8080'
  const { refreshToken, redirectToLogout } = useAuth()

  const isConfigured = ref(false)
  const isLoading = ref(false)

  /**
   * Make a request with automatic token refresh on 401
   */
  const request = async (path: string, options: RequestInit = {}): Promise<Response> => {
    const url = `${baseURL}/email-service${path}`

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    // If unauthorized, try to refresh token and retry once
    if (response.status === 401 && !(options as any)._retry) {
      const refreshed = await refreshToken()
      if (refreshed) {
        return request(path, { ...options, _retry: true } as any)
      }
      redirectToLogout()
      throw new Error('Session expired')
    }

    return response
  }

  /**
   * Check if email account is configured
   */
  const checkConfig = async (): Promise<boolean> => {
    try {
      const res = await request('/accounts')
      if (res.ok) {
        const json = await res.json()
        isConfigured.value = json.data?.[0]?.configured || false
      }
    } catch {
      isConfigured.value = false
    }
    return isConfigured.value
  }

  /**
   * Send an email
   */
  const sendEmail = async (params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    isLoading.value = true
    try {
      const res = await request('/send', {
        method: 'POST',
        body: JSON.stringify(params),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: 'Unbekannter Fehler' }))
        return { success: false, error: json.error || `HTTP ${res.status}` }
      }

      const json = await res.json()
      return { success: true, messageId: json.message_id }
    } catch (err: any) {
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch inbox messages
   */
  const fetchInbox = async (limit = 50): Promise<InboxMessage[]> => {
    try {
      const res = await request(`/inbox?limit=${limit}`)
      if (!res.ok) return []
      const json = await res.json()
      return json.data || []
    } catch {
      return []
    }
  }

  /**
   * Sync inbox from remote mail server
   */
  const syncInbox = async (limit = 20): Promise<{ synced: number }> => {
    try {
      const res = await request(`/sync?limit=${limit}`, { method: 'POST' })
      if (!res.ok) return { synced: 0 }
      const json = await res.json()
      return { synced: json.synced || 0 }
    } catch {
      return { synced: 0 }
    }
  }

  return {
    isConfigured: readonly(isConfigured),
    isLoading: readonly(isLoading),
    checkConfig,
    sendEmail,
    fetchInbox,
    syncInbox,
  }
}
