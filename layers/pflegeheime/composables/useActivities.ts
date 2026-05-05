/**
 * useActivities Composable
 *
 * LOCAL MODE: Uses localStorage for all activity data.
 * When ready for production, switch USE_LOCAL to false
 * and ensure nursing_home_lead_activities collection exists in Directus.
 */

const USE_LOCAL = false
const STORAGE_KEY = 'nursing_home_lead_activities'

export interface ActivityFilters {
  leadId?: string | null
  type?: ActivityType | null
  search?: string
}

// Shared state across all composable instances
const _allActivities = ref<CrmActivity[]>([])
let _loaded = false

const loadFromStorage = () => {
  if (_loaded) return
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) _allActivities.value = JSON.parse(stored)
  } catch { /* ignore */ }
  _loaded = true
}

const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_allActivities.value))
  } catch { /* ignore */ }
}

/**
 * Import activities from parsed Excel data (called by import page)
 */
export const importActivitiesToLocal = (activities: CrmActivity[]) => {
  loadFromStorage()
  // Merge with existing activities (don't replace, as user may have added manual ones)
  const existingIds = new Set(_allActivities.value.map(a => a.id))
  const newActivities = activities.filter(a => !existingIds.has(a.id))
  _allActivities.value = [...newActivities, ..._allActivities.value]
  saveToStorage()
}

// ─── Directus fields (used when USE_LOCAL = false) ──────────────────

const ACTIVITY_LIST_FIELDS = [
  'id', 'nursing_home_lead_id',
  'type', 'description', 'date', 'date_created',
  'user_created.first_name', 'user_created.last_name', 'user_created.email',
]

const ACTIVITY_LIST_WITH_LEAD_FIELDS = [
  ...ACTIVITY_LIST_FIELDS,
  'nursing_home_lead_id.id',
  'nursing_home_lead_id.nursing_home_id.id',
  'nursing_home_lead_id.nursing_home_id.name',
  'nursing_home_lead_id.nursing_home_id.city',
]

/**
 * Map Directus activity (description) to CRM activity (subject/content)
 */
const mapFromDirectus = (item: any): CrmActivity => {
  let metadata = item.metadata || null
  if (item.type === 'meeting' && item.date && !metadata) {
    const parsed = new Date(item.date)
    const localDate = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
    const localTime = `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`
    metadata = {
      meeting_date: localDate,
      meeting_time: localTime,
      meeting_datetime: `${localDate}T${localTime}`,
    }
  }
  return {
    ...item,
    subject: item.description || item.subject || '',
    content: null,
    direction: null,
    outcome: null,
    duration_minutes: null,
    metadata,
  }
}

/**
 * Map CRM activity (subject/content) to Directus fields (description)
 */
const mapToDirectus = (data: Partial<CrmActivity>): Record<string, any> => {
  const mapped: Record<string, any> = {}
  if (data.nursing_home_lead_id !== undefined) mapped.nursing_home_lead_id = data.nursing_home_lead_id
  if (data.type !== undefined) mapped.type = data.type
  if (data.subject !== undefined) mapped.description = data.subject
  if (data.content && !data.subject) mapped.description = data.content
  if (data.subject && data.content) mapped.description = `${data.subject}\n\n${data.content}`
  if (data.metadata?.meeting_datetime) {
    mapped.date = data.metadata.meeting_datetime
  }
  if ((data as any).date !== undefined) {
    mapped.date = (data as any).date
  }
  return mapped
}

export const useActivities = () => {
  const secureData = USE_LOCAL ? null : useSecureData()
  const getItems = secureData?.getItems ?? (async () => [])
  const createItem = secureData?.createItem ?? (async () => null as any)
  const updateItem = secureData?.updateItem ?? (async () => null as any)
  const deleteItem = secureData?.deleteItem ?? (async () => null as any)
  const isLoading = secureData?.isLoading ?? ref(false)
  const error = secureData?.error ?? ref(null)

  const activities = ref<CrmActivity[]>([])

  if (USE_LOCAL) loadFromStorage()

  // ─── Helpers ────────────────────────────────────────────────────

  const getLeadId = (a: CrmActivity): string => {
    const ref = a.nursing_home_lead_id
    if (typeof ref === 'object' && ref && 'id' in ref) return ref.id
    return ref as string
  }

  // ─── LOCAL implementations ──────────────────────────────────────

  const fetchActivitiesLocal = (leadId: string, limit = 50) => {
    const result = _allActivities.value
      .filter(a => getLeadId(a) === leadId)
      .sort((a, b) => (b.date_created || '').localeCompare(a.date_created || ''))
      .slice(0, limit)
    activities.value = result
    return result
  }

  const fetchAllActivitiesLocal = (filters: ActivityFilters = {}, sort: string[] = ['-date_created'], limit = 100) => {
    let result = [..._allActivities.value]

    if (filters.leadId) result = result.filter(a => getLeadId(a) === filters.leadId)
    if (filters.type) result = result.filter(a => a.type === filters.type)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(a =>
        a.subject?.toLowerCase().includes(q) || a.content?.toLowerCase().includes(q)
      )
    }

    // Sort
    const desc = sort[0]?.startsWith('-')
    const field = sort[0]?.replace(/^-/, '') || 'date_created'
    result.sort((a, b) => {
      const va = (a as any)[field] || ''
      const vb = (b as any)[field] || ''
      return desc ? vb.localeCompare(va) : va.localeCompare(vb)
    })

    result = result.slice(0, limit)
    activities.value = result
    return result
  }

  const createActivityLocal = (data: Partial<CrmActivity>) => {
    const newActivity: CrmActivity = {
      id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      nursing_home_lead_id: data.nursing_home_lead_id || '',
      type: data.type || 'note',
      subject: data.subject || '',
      content: data.content || null,
      direction: data.direction || null,
      outcome: data.outcome || null,
      duration_minutes: data.duration_minutes || null,
      metadata: data.metadata || null,
      date_created: new Date().toISOString(),
      user_created: { first_name: 'Du', last_name: '' },
    }

    _allActivities.value.unshift(newActivity)
    saveToStorage()
    return newActivity
  }

  const updateActivityLocal = (id: string, data: Partial<CrmActivity>) => {
    const idx = _allActivities.value.findIndex(a => a.id === id)
    if (idx !== -1) {
      _allActivities.value[idx] = { ..._allActivities.value[idx], ...data }
      saveToStorage()
    }

    const localIdx = activities.value.findIndex(a => a.id === id)
    if (localIdx !== -1) {
      activities.value[localIdx] = { ...activities.value[localIdx], ...data }
    }
  }

  const removeActivityLocal = (id: string) => {
    _allActivities.value = _allActivities.value.filter(a => a.id !== id)
    activities.value = activities.value.filter(a => a.id !== id)
    saveToStorage()
  }

  // ─── Public API (same interface regardless of mode) ─────────────

  const fetchActivities = async (leadId: string, limit = 50) => {
    if (USE_LOCAL) return fetchActivitiesLocal(leadId, limit)

    const raw = await getItems<any>({
      collection: 'nursing_home_lead_activities',
      params: {
        fields: ACTIVITY_LIST_FIELDS,
        filter: { nursing_home_lead_id: { _eq: leadId } },
        sort: ['-date_created'],
        limit,
      },
    })
    const result = raw.map(mapFromDirectus)
    activities.value = result
    return result
  }

  const fetchAllActivities = async (
    filters: ActivityFilters = {},
    sort: string[] = ['-date_created'],
    limit = 100
  ) => {
    if (USE_LOCAL) return fetchAllActivitiesLocal(filters, sort, limit)

    const filter: Record<string, any> = {}
    if (filters.leadId) filter.nursing_home_lead_id = { _eq: filters.leadId }
    if (filters.type) filter.type = { _eq: filters.type }

    const raw = await getItems<any>({
      collection: 'nursing_home_lead_activities',
      params: {
        fields: ACTIVITY_LIST_WITH_LEAD_FIELDS,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        search: filters.search || undefined,
        sort,
        limit,
      },
    })
    const result = raw.map(mapFromDirectus)
    activities.value = result
    return result
  }

  const createActivity = async (data: Partial<CrmActivity>) => {
    if (USE_LOCAL) return createActivityLocal(data)

    return await createItem<Record<string, any>>({
      collection: 'nursing_home_lead_activities',
      data: mapToDirectus(data),
    })
  }

  const updateActivity = async (id: string, data: Partial<CrmActivity>) => {
    if (USE_LOCAL) return updateActivityLocal(id, data)

    const result = await updateItem<CrmActivity>({
      collection: 'nursing_home_lead_activities',
      id,
      data: mapToDirectus(data),
    })
    const index = activities.value.findIndex(a => a.id === id)
    if (index !== -1) activities.value[index] = { ...activities.value[index], ...data }
    return result
  }

  const removeActivity = async (id: string) => {
    if (USE_LOCAL) return removeActivityLocal(id)

    await deleteItem({ collection: 'nursing_home_lead_activities', id })
    activities.value = activities.value.filter(a => a.id !== id)
  }

  return {
    activities,
    isLoading,
    error,
    fetchActivities,
    fetchAllActivities,
    createActivity,
    updateActivity,
    removeActivity,
  }
}
