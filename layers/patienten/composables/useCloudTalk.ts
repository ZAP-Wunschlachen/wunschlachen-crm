/**
 * useCloudTalk — Click-to-Call + Call-Event-Handling (Plan v9 Phase D)
 *
 * Architektur:
 *   - Client → `/api/cloudtalk/call` (Server-Proxy) → CloudTalk-API
 *   - CloudTalk-Webhook → `/api/inbound/cloudtalk-event` → erstellt Activity
 *
 * Mock-Mode:
 *   USE_MOCK = true → Activity wird sofort lokal angelegt, kein API-Call.
 *   In Production: `tel:` als Fallback wenn API fehlschlägt.
 */

import type { Lead } from '~/types/crm'

const USE_MOCK = true

export interface InitiateCallResult {
  success: boolean
  call_id?: string
  message?: string
}

export const useCloudTalk = () => {
  const toast = useToast()
  const { addActivity } = useLeadActivities()
  const isCalling = ref(false)

  /**
   * Setzt einen Anruf für einen Lead in Gang.
   * - Validiert die Telefonnummer
   * - Triggert CloudTalk-API (oder mockt im Mock-Mode)
   * - Loggt eine call-Activity mit status='initiated'
   */
  const initiateCall = async (lead: Lead, phoneOverride?: string): Promise<InitiateCallResult> => {
    const phone = phoneOverride || lead.phone
    if (!phone) {
      toast.add({ severity: 'warn', summary: 'Kein Anruf möglich', detail: 'Keine Telefonnummer hinterlegt' })
      return { success: false, message: 'no phone' }
    }

    isCalling.value = true
    try {
      if (USE_MOCK) {
        // Mock: Activity sofort anlegen + Toast
        await new Promise((r) => setTimeout(r, 600)) // UX-Delay
        const activityId = `call-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        try {
          addActivity({
            lead_id: lead.id,
            type: 'call',
            subject: `Anruf an ${phone}`,
            content: 'Click-to-Call gestartet (Mock)',
            metadata: { phone, mode: 'cloudtalk-mock' },
            date_created: new Date().toISOString(),
          } as any)
        } catch (e) {
          console.warn('[cloudtalk] activity-log failed:', e)
        }
        toast.add({
          severity: 'success',
          summary: 'Anruf gestartet',
          detail: `${phone} — Click-to-Call (Mock-Mode)`,
        })
        return { success: true, call_id: activityId, message: 'mock-initiated' }
      }

      // Echter API-Call
      const result = await $fetch<InitiateCallResult>('/api/cloudtalk/call', {
        method: 'POST',
        body: { lead_id: lead.id, phone },
      })
      if (result.success) {
        toast.add({ severity: 'success', summary: 'Anruf gestartet', detail: phone })
      } else {
        toast.add({ severity: 'error', summary: 'Anruf fehlgeschlagen', detail: result.message || 'Unbekannter Fehler' })
        // Fallback: tel:-Link
        if (typeof window !== 'undefined') window.location.href = `tel:${phone}`
      }
      return result
    } catch (e: any) {
      console.error('[cloudtalk] initiateCall failed:', e)
      toast.add({ severity: 'error', summary: 'Fehler', detail: 'Anruf konnte nicht gestartet werden — öffne Telefon-App' })
      if (typeof window !== 'undefined') window.location.href = `tel:${phone}`
      return { success: false, message: e?.message || 'unknown error' }
    } finally {
      isCalling.value = false
    }
  }

  return {
    isCalling,
    initiateCall,
  }
}
