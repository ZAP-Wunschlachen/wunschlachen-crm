// composables/useLeadActivities.ts

import type { LeadActivity, LeadActivityType, ActivityDirection, ActivityOutcome } from '~/types/crm'

const STORAGE_KEY = 'patient-crm-activities'

type NewActivity = {
  lead_id: string
  type: LeadActivityType
  subject: string
  content?: string
  direction?: ActivityDirection
  outcome?: ActivityOutcome
  duration_minutes?: number
  metadata?: Record<string, any>
}

const readAll = (): LeadActivity[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const writeAll = (activities: LeadActivity[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities))
}

export const useLeadActivities = () => {
  const { getFullName } = useAuth()

  const getActivities = (leadId: string): LeadActivity[] => {
    return readAll()
      .filter(a => a.lead_id === leadId)
      .sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())
  }

  const addActivity = (data: NewActivity): LeadActivity => {
    const activity: LeadActivity = {
      ...data,
      id: crypto.randomUUID(),
      date_created: new Date().toISOString(),
      user_name: getFullName() || 'Unbekannt',
    }
    const all = readAll()
    all.push(activity)
    writeAll(all)
    return activity
  }

  const removeActivity = (id: string): void => {
    const all = readAll().filter(a => a.id !== id)
    writeAll(all)
  }

  const getAllActivities = (): LeadActivity[] => {
    return readAll().sort((a, b) =>
      new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
    )
  }

  return { getActivities, addActivity, removeActivity, getAllActivities }
}
