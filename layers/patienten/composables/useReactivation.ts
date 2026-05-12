// composables/useReactivation.ts — Patient reactivation logic

import type { Lead } from '~/types/crm'
import type { LeadActivity } from '~/types/crm'

const CONFIG_KEY = 'praxis-crm-reactivation-config'

interface ReactivationConfig {
  thresholdDays: number
}

const DEFAULT_CONFIG: ReactivationConfig = {
  thresholdDays: 30,
}

const readConfig = (): ReactivationConfig => {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG
  } catch {
    return DEFAULT_CONFIG
  }
}

const writeConfig = (config: ReactivationConfig) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

export interface InactiveLead {
  lead: Lead
  lastActivityDate: string | null
  daysSinceActivity: number
}

export const useReactivation = () => {
  const config = ref<ReactivationConfig>(DEFAULT_CONFIG)
  const inactiveLeads = ref<InactiveLead[]>([])
  const isLoading = ref(false)

  const loadConfig = () => {
    config.value = readConfig()
  }

  const saveConfig = (newConfig: Partial<ReactivationConfig>) => {
    config.value = { ...config.value, ...newConfig }
    writeConfig(config.value)
  }

  const fetchInactiveLeads = async (thresholdDays?: number) => {
    isLoading.value = true
    const threshold = thresholdDays ?? config.value.thresholdDays

    try {
      const { fetchLeads } = usePatientLeads()
      const { getAllActivities } = useLeadActivities()

      // Fetch all non-completed leads
      const allLeads = await fetchLeads(
        {},
        ['-date_updated'],
        1,
      )

      const activeLeads = allLeads.filter(
        (l: Lead) => !['completed', 'lost'].includes(l.status),
      )

      // Get all activities and build a map of lead_id -> latest activity date
      const activities = getAllActivities()
      const latestActivityMap: Record<string, string> = {}
      for (const activity of activities) {
        if (
          !latestActivityMap[activity.lead_id] ||
          activity.date_created > latestActivityMap[activity.lead_id]
        ) {
          latestActivityMap[activity.lead_id] = activity.date_created
        }
      }

      const now = Date.now()
      const thresholdMs = threshold * 86400000

      const results: InactiveLead[] = []
      for (const lead of activeLeads) {
        const lastDate = latestActivityMap[lead.id] || null
        const referenceDate = lastDate || lead.date_created
        const daysSince = Math.floor((now - new Date(referenceDate).getTime()) / 86400000)

        if (daysSince >= threshold) {
          results.push({
            lead,
            lastActivityDate: lastDate,
            daysSinceActivity: daysSince,
          })
        }
      }

      // Sort by most inactive first
      results.sort((a, b) => b.daysSinceActivity - a.daysSinceActivity)
      inactiveLeads.value = results
      return results
    } catch {
      inactiveLeads.value = []
      return []
    } finally {
      isLoading.value = false
    }
  }

  const inactiveCount = computed(() => inactiveLeads.value.length)

  // Initialize config from storage
  loadConfig()

  return {
    config,
    inactiveLeads,
    inactiveCount,
    isLoading,
    loadConfig,
    saveConfig,
    fetchInactiveLeads,
  }
}
