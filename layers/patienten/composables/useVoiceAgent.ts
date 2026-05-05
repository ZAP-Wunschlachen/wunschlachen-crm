// composables/useVoiceAgent.ts — Synthflow AI Voice Agent integration

export const useVoiceAgent = () => {
  const config = useRuntimeConfig()
  const { updateItem } = useSecureData()

  const initiateCall = async (contactId: string, phone: string) => {
    // Trigger Synthflow call via webhook (actual implementation via n8n)
    // For now, create activity record
    const { createItem } = useSecureData()
    await createItem({
      collection: 'activities',
      data: {
        type: 'voice_ai',
        direction: 'outbound',
        contact: contactId,
        subject: 'AI Voice Qualification Call',
        metadata: { phone, status: 'initiated' },
      },
    })
  }

  const processCallResult = async (contactId: string, result: {
    score: number
    transcript: string
    outcome: 'qualified' | 'not_qualified' | 'no_contact' | 'callback'
    answers: Record<string, any>
  }) => {
    // Update lead score
    await updateItem({
      collection: 'leads',
      id: contactId,
      data: { lead_score: result.score },
    })

    // Create activity with transcript
    const { createItem } = useSecureData()
    await createItem({
      collection: 'activities',
      data: {
        type: 'voice_ai',
        direction: 'outbound',
        contact: contactId,
        outcome: result.outcome,
        ai_score: result.score,
        ai_transcript: result.transcript,
        metadata: { answers: result.answers },
      },
    })
  }

  const getCallHistory = async (contactId: string) => {
    const { getItems } = useSecureData()
    return getItems({
      collection: 'activities',
      params: {
        filter: { contact: { _eq: contactId }, type: { _eq: 'voice_ai' } },
        sort: ['-date_created'],
      },
    })
  }

  return { initiateCall, processCallResult, getCallHistory }
}
