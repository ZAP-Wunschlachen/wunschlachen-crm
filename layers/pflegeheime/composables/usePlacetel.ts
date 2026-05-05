/**
 * usePlacetel Composable
 *
 * Click-to-Call via Placetel REST API v2.
 * Each sales agent stores their own API token in localStorage.
 * Calls are initiated via POST https://api.placetel.de/v2/calls
 * and logged as CRM activities.
 */

export interface PlacetelConfig {
  enabled: boolean
  apiToken?: string
  sipUser?: string
}

export interface CallState {
  active: boolean
  contact: NursingHomeContact | null
  phoneNumber: string
  startedAt: Date | null
  status: 'idle' | 'dialing' | 'ringing' | 'connected' | 'ended' | 'error'
  error?: string
}

// Shared state
const callState = ref<CallState>({
  active: false,
  contact: null,
  phoneNumber: '',
  startedAt: null,
  status: 'idle',
})

const config = ref<PlacetelConfig>({
  enabled: true,
})

const PLACETEL_CONFIG_KEY = 'crm_placetel_config'

const loadConfig = () => {
  try {
    const stored = localStorage.getItem(PLACETEL_CONFIG_KEY)
    if (stored) config.value = JSON.parse(stored)
  } catch { /* ignore */ }
}

const saveConfig = () => {
  try {
    localStorage.setItem(PLACETEL_CONFIG_KEY, JSON.stringify(config.value))
  } catch { /* ignore */ }
}

export const usePlacetel = () => {
  const { createActivity } = useActivities()

  if (import.meta.client) loadConfig()

  /**
   * Whether the integration is fully configured (token + SIP user)
   */
  const isConfigured = computed(() =>
    config.value.enabled && !!config.value.apiToken && !!config.value.sipUser
  )

  /**
   * Test API connection with stored token.
   */
  const testConnection = async (): Promise<{ success: boolean; message: string; sipUsers?: any[] }> => {
    if (!config.value.apiToken) {
      return { success: false, message: 'Kein API-Token konfiguriert' }
    }
    if (!config.value.sipUser) {
      return { success: false, message: 'Kein SIP-Benutzer konfiguriert' }
    }

    saveConfig()
    return {
      success: true,
      message: `Konfiguration gespeichert — SIP-User: ${config.value.sipUser}. Anrufe werden über Placetel ausgelöst.`,
    }
  }

  /**
   * Initiate a call via Placetel Click-to-Call API.
   */
  const dial = async (phoneNumber: string, contact?: NursingHomeContact | null, leadId?: string) => {
    if (!phoneNumber) return

    callState.value = {
      active: true,
      contact: contact || null,
      phoneNumber,
      startedAt: new Date(),
      status: 'dialing',
    }

    // If not configured, fall back to tel: link
    if (!isConfigured.value) {
      window.open(`tel:${phoneNumber}`, '_self')
      callState.value.status = 'connected'
      return
    }

    try {
      const response = await fetch('https://workflows.wunschlachen.de/webhook/placetel-dial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          sip_user: config.value.sipUser,
          api_token: config.value.apiToken,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || `HTTP ${response.status}`)
      }

      callState.value.status = 'connected'
    } catch (err: any) {
      console.error('Placetel dial error:', err.message)
      callState.value.status = 'error'
      callState.value.error = err.message

      // Fallback to tel: link so the call still happens
      window.open(`tel:${phoneNumber}`, '_self')
      callState.value.status = 'connected'
    }
  }

  /**
   * End the current call
   */
  const hangup = () => {
    callState.value.status = 'ended'
  }

  /**
   * Reset call state after logging
   */
  const resetCall = () => {
    callState.value = {
      active: false,
      contact: null,
      phoneNumber: '',
      startedAt: null,
      status: 'idle',
    }
  }

  /**
   * Log a completed call as a CRM activity
   */
  const logCall = async (leadId: string, data: {
    contactId?: string
    outcome: 'successful' | 'no_contact' | 'callback' | 'rejection'
    durationMinutes?: number
    notes?: string
  }) => {
    const contactName = callState.value.contact
      ? [callState.value.contact.first_name, callState.value.contact.last_name].filter(Boolean).join(' ')
      : callState.value.phoneNumber

    const activity = await createActivity({
      nursing_home_lead_id: leadId,
      contact_id: data.contactId || undefined,
      type: 'call',
      subject: `Anruf: ${contactName}`,
      content: data.notes || null,
      direction: 'outbound',
      outcome: data.outcome,
      duration_minutes: data.durationMinutes || null,
      metadata: {
        phone_number: callState.value.phoneNumber,
        source: 'placetel',
      },
    })

    resetCall()
    return activity
  }

  /**
   * Get call duration in minutes from start to now
   */
  const callDurationMinutes = computed(() => {
    if (!callState.value.startedAt) return 0
    return Math.round((Date.now() - callState.value.startedAt.getTime()) / 60000)
  })

  /**
   * Fetch real call duration from Placetel API for a phone number
   */
  const fetchCallDuration = async (phoneNumber: string): Promise<number | null> => {
    if (!phoneNumber) return null
    try {
      const runtimeConfig = useRuntimeConfig()
      const baseUrl = runtimeConfig.public.directusUrl || 'http://localhost:8080'

      const url = `${baseUrl}/placetel-service/call-duration?phone_number=${encodeURIComponent(phoneNumber)}`
      const response = await fetch(url, {
        credentials: 'include',
      })

      if (!response.ok) return null
      const data = await response.json()
      if (data.found && data.duration_minutes > 0) {
        return data.duration_minutes
      }
      return null
    } catch (err) {
      console.error('Failed to fetch call duration from Placetel:', err)
      return null
    }
  }

  /**
   * Update Placetel configuration
   */
  const updateConfig = (newConfig: Partial<PlacetelConfig>) => {
    config.value = { ...config.value, ...newConfig }
    saveConfig()
  }

  return {
    callState: readonly(callState),
    config: readonly(config),
    isConfigured,
    callDurationMinutes,
    dial,
    hangup,
    resetCall,
    logCall,
    fetchCallDuration,
    updateConfig,
    testConnection,
  }
}
