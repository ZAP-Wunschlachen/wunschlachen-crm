// composables/useSpeedToLead.ts — Speed-to-lead tracking

export const useSpeedToLead = () => {
  const { getItems } = useSecureData()

  const getAverageResponseTime = async (dateRange?: { from: string; to: string }) => {
    const filter: Record<string, any> = {
      type: { _in: ['call', 'email_sent', 'sms', 'whatsapp', 'voice_ai'] },
      direction: { _eq: 'outbound' },
    }
    if (dateRange) {
      filter.date_created = { _between: [dateRange.from, dateRange.to] }
    }

    const activities = await getItems<any>({
      collection: 'activities',
      params: { filter, fields: ['contact', 'date_created'], sort: ['date_created'], limit: 1000 },
    })

    // Calculate time from lead creation to first outbound activity per contact
    // This is a simplified version - real implementation would join with leads table
    return activities
  }

  return { getAverageResponseTime }
}
