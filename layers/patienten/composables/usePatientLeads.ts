// CRUD operations for the Directus "Leads" collection

import type { Lead, LeadStatus, LeadSource } from '~/types/crm'

const COLLECTION = 'Leads' // Capital L — matches Directus collection name

// Mock-Mode: nutzt localStorage 'patient-crm-mock-leads' (seeded via mock-seed.client.ts)
// Auf `false` setzen sobald Directus-Backend verfügbar ist.
const USE_MOCK_DATA = true
const MOCK_STORAGE_KEY = 'patient-crm-mock-leads'

const readMockLeads = (): Lead[] => {
  if (typeof localStorage === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}
const writeMockLeads = (data: Lead[]) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data))
  }
}

export interface LeadFilters {
  search?: string
  status?: LeadStatus | null
  lead_source?: LeadSource | null
  dental_service?: string | null
  followUpDue?: boolean
  hasTag?: string | null
}

export interface LeadPagination {
  page: number
  limit: number
  total: number
}

const LEAD_LIST_FIELDS = [
  'id',
  'first_name',
  'last_name',
  'mail',
  'phone',
  'status',
  'lead_source',
  'follow_up',
  'oportunity_value',
  'missed_appointments',
  'Tags',
  'dental_service.id',
  'dental_service.name',
  'location.id',
  'location.name',
  'date_created',
  'date_updated',
]

const LEAD_DETAIL_FIELDS = [
  ...LEAD_LIST_FIELDS,
  'message',
  'date_time',
  'GDPR_accepted_at',
  'query_params',
  'newsletter_accepted_time',
  'revenue',
  'lost_reason',
  'user_created',
  'user_updated',
]

export const usePatientLeads = () => {
  const { getItems, getItem, updateItem, updateItems, createItem } = useSecureData()

  const leads = ref<Lead[]>([])
  const currentLead = ref<Lead | null>(null)
  const pagination = ref<LeadPagination>({ page: 1, limit: 50, total: 0 })
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const buildFilter = (filters: LeadFilters): Record<string, any> | undefined => {
    const filter: Record<string, any> = {}

    if (filters.status) filter.status = { _eq: filters.status }
    if (filters.lead_source) filter.lead_source = { _eq: filters.lead_source }
    if (filters.dental_service) filter.dental_service = { _eq: filters.dental_service }

    if (filters.followUpDue) {
      const today = new Date().toISOString().split('T')[0]
      filter.follow_up = { _lte: today }
      filter.status = { _nin: ['completed', 'lost'] }
    }

    return Object.keys(filter).length > 0 ? filter : undefined
  }

  const fetchLeads = async (
    filters: LeadFilters = {},
    sort: string[] = ['-date_updated'],
    page?: number,
  ) => {
    isLoading.value = true
    error.value = null
    const currentPage = page || pagination.value.page

    if (USE_MOCK_DATA) {
      let mock = readMockLeads()
      // Client-side Filter (vereinfacht)
      if (filters.status) mock = mock.filter((l) => l.status === filters.status)
      if (filters.lead_source) mock = mock.filter((l) => l.lead_source === filters.lead_source)
      if (filters.search) {
        const q = filters.search.toLowerCase()
        mock = mock.filter(
          (l) =>
            l.first_name?.toLowerCase().includes(q) ||
            l.last_name?.toLowerCase().includes(q) ||
            l.mail?.toLowerCase().includes(q),
        )
      }
      leads.value = mock
      pagination.value = { page: 1, limit: mock.length, total: mock.length }
      isLoading.value = false
      return mock
    }

    try {
      const result = await getItems<Lead>({
        collection: COLLECTION,
        params: {
          fields: LEAD_LIST_FIELDS,
          filter: buildFilter(filters),
          search: filters.search || undefined,
          sort,
          limit: pagination.value.limit,
          page: currentPage,
          meta: ['total_count', 'filter_count'],
        },
      })
      leads.value = result
      pagination.value.page = currentPage
      return result
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchLead = async (id: string) => {
    isLoading.value = true
    error.value = null

    if (USE_MOCK_DATA) {
      const mock = readMockLeads().find((l) => l.id === id) || null
      currentLead.value = mock
      isLoading.value = false
      return mock
    }

    try {
      const result = await getItem<Lead>({
        collection: COLLECTION,
        id,
        params: { fields: LEAD_DETAIL_FIELDS },
      })
      currentLead.value = result
      return result
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateLead = async (id: string, data: Partial<Lead>) => {
    try {
      const result = await updateItem<Lead>({
        collection: COLLECTION,
        id,
        data,
      })
      // Update in local list
      const idx = leads.value.findIndex(l => l.id === id)
      if (idx !== -1) leads.value[idx] = { ...leads.value[idx], ...data }
      if (currentLead.value?.id === id) currentLead.value = { ...currentLead.value, ...data }
      return result
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  const updateLeadsBulk = async (ids: string[], data: Partial<Lead>) => {
    try {
      return await updateItems({
        collection: COLLECTION,
        keys: ids,
        data,
      })
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  const createLead = async (data: Partial<Lead>) => {
    const now = new Date().toISOString()
    // Welcome-Sequenz beim Anlegen automatisch starten — die Cron-Logik in
    // useWelcomeSequence prüft Pause-Bedingungen, sodass auch hier nichts
    // vorsichtig geprüft werden muss.
    const enriched: Partial<Lead> = {
      ...data,
      welcome_sequence_started_at: data.welcome_sequence_started_at ?? now,
      welcome_sequence_position: data.welcome_sequence_position ?? 0,
    }
    try {
      return await createItem<Lead>({
        collection: COLLECTION,
        data: enriched,
      })
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  const fetchStageCounts = async () => {
    if (USE_MOCK_DATA) {
      const mock = readMockLeads()
      const counts: Record<string, number> = {}
      for (const item of mock) {
        counts[item.status] = (counts[item.status] || 0) + 1
      }
      return Object.entries(counts).map(([status, count]) => ({
        status: status as LeadStatus,
        count: { id: count },
      }))
    }
    try {
      const result = await getItems<{ status: LeadStatus }>({
        collection: COLLECTION,
        params: {
          fields: ['status'],
          limit: -1,
        },
      })
      const counts: Record<string, number> = {}
      for (const item of result) {
        counts[item.status] = (counts[item.status] || 0) + 1
      }
      return Object.entries(counts).map(([status, count]) => ({
        status: status as LeadStatus,
        count: { id: count },
      }))
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  const fetchDueFollowUps = async () => {
    if (USE_MOCK_DATA) {
      const today = new Date().toISOString().split('T')[0]
      return readMockLeads().filter(
        (l: any) =>
          l.follow_up &&
          l.follow_up.slice(0, 10) <= today &&
          !['completed', 'lost'].includes(l.status),
      )
    }
    const today = new Date().toISOString().split('T')[0]
    try {
      return await getItems<Lead>({
        collection: COLLECTION,
        params: {
          fields: LEAD_LIST_FIELDS,
          filter: {
            follow_up: { _lte: today },
            status: { _nin: ['completed', 'lost'] },
          },
          sort: ['follow_up'],
          limit: 50,
        },
      })
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  const fetchLeadCount = async (filters: LeadFilters = {}) => {
    if (USE_MOCK_DATA) {
      let mock = readMockLeads()
      if (filters.status) mock = mock.filter((l) => l.status === filters.status)
      if (filters.lead_source) mock = mock.filter((l) => l.lead_source === filters.lead_source)
      if (filters.search) {
        const q = filters.search.toLowerCase()
        mock = mock.filter(
          (l) =>
            l.first_name?.toLowerCase().includes(q) ||
            l.last_name?.toLowerCase().includes(q) ||
            l.mail?.toLowerCase().includes(q),
        )
      }
      pagination.value.total = mock.length
      return mock.length
    }

    try {
      const result = await getItems({
        collection: COLLECTION,
        params: {
          aggregate: { count: ['id'] },
          filter: buildFilter(filters),
          search: filters.search || undefined,
        },
      })
      const total = (result as any)?.[0]?.count?.id || 0
      pagination.value.total = Number(total)
      return Number(total)
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  return {
    leads,
    currentLead,
    pagination,
    isLoading,
    error,
    fetchLeads,
    fetchLead,
    updateLead,
    updateLeadsBulk,
    createLead,
    fetchStageCounts,
    fetchDueFollowUps,
    fetchLeadCount,
  }
}
