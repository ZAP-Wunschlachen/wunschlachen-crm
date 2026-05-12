/**
 * usePflegeheimLeads Composable
 *
 * LOCAL MODE: Uses localStorage for all lead data.
 * When ready for production, switch USE_LOCAL to false
 * and data will be fetched from Directus.
 */

const USE_LOCAL = true
const STORAGE_KEY = 'crm_leads'
const CONTACTS_STORAGE_KEY = 'crm_lead_contacts'

export interface LeadFilters {
  search?: string
  stage?: OpportunityStage | null
  priority?: Priority | null
  userId?: string | null
  followUpDue?: boolean
  noActivityDays?: number
}

export interface LeadPagination {
  page: number
  limit: number
  total: number
}

// Fields to fetch when listing leads (with nursing_home join)
const LEAD_LIST_FIELDS = [
  'id',
  'opportunity_stage',
  'priority',
  'follow_up_date',
  'has_cooperation_partner',
  'date_created',
  'date_updated',
  'user_id',
  'nursing_home_id.id',
  'nursing_home_id.name',
  'nursing_home_id.city',
  'nursing_home_id.zip',
  'nursing_home_id.total_capacity',
  'nursing_home_id.fone',
  'nursing_home_id.email',
  'nursing_home_id.coordinates_lat',
  'nursing_home_id.coordinates_lon',
]

// Fields for single lead detail (more complete)
const LEAD_DETAIL_FIELDS = [
  ...LEAD_LIST_FIELDS,
  'nursing_home_id.Street',
  'nursing_home_id.number',
  'nursing_home_id.website',
  'nursing_home_id.distance_from_dental_office',
  'nursing_home_id.notes',
  'nursing_home_id.status',
  'nursing_home_id.cooperation_number',
  'closest_nursing_home',
  'user_created',
  'user_updated',
]

// ─── Shared localStorage state ──────────────────────────────────────
const _allLeads = ref<NursingHomeLead[]>([])
let _loaded = false

const stripNhNotes = (leads: NursingHomeLead[]): NursingHomeLead[] =>
  leads.map(l => {
    if (typeof l.nursing_home_id === 'object' && l.nursing_home_id?.notes) {
      const { notes, ...nh } = l.nursing_home_id
      return { ...l, nursing_home_id: nh }
    }
    return l
  })

const loadFromStorage = () => {
  if (_loaded) return
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      _allLeads.value = stripNhNotes(JSON.parse(stored))
      saveToStorage() // persist cleaned data
    }
  } catch { /* ignore */ }
  _loaded = true
}

const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_allLeads.value))
  } catch { /* ignore */ }
}

/**
 * Import leads from parsed Excel data (called by import page)
 */
export const importLeadsToLocal = (leads: NursingHomeLead[]) => {
  loadFromStorage()
  _allLeads.value = stripNhNotes(leads)
  saveToStorage()
  _loaded = true
}

/**
 * Get all locally stored leads (for export/sync)
 */
export const getLocalLeads = (): NursingHomeLead[] => {
  loadFromStorage()
  return _allLeads.value
}

export const usePflegeheimLeads = () => {
  // Only initialize Directus API when not in local mode
  const secureData = USE_LOCAL ? null : useSecureData()
  const getItems = secureData?.getItems ?? (async () => [])
  const getItem = secureData?.getItem ?? (async () => null as any)
  const updateItem = secureData?.updateItem ?? (async () => null as any)
  const createItem = secureData?.createItem ?? (async () => null as any)
  const isLoading = secureData?.isLoading ?? ref(false)
  const error = secureData?.error ?? ref(null)

  const leads = ref<NursingHomeLead[]>([])
  const currentLead = ref<NursingHomeLead | null>(null)
  const pagination = ref<LeadPagination>({ page: 1, limit: 50, total: 0 })

  if (USE_LOCAL && import.meta.client) loadFromStorage()

  // ─── LOCAL implementations ──────────────────────────────────────

  const sortLeads = (data: NursingHomeLead[], sort: string[]) => {
    const desc = sort[0]?.startsWith('-')
    const field = sort[0]?.replace(/^-/, '') || 'date_updated'

    return [...data].sort((a, b) => {
      let va: any, vb: any

      // Handle nested fields like nursing_home_id.name
      if (field.startsWith('nursing_home_id.')) {
        const subField = field.replace('nursing_home_id.', '')
        va = typeof a.nursing_home_id === 'object' ? (a.nursing_home_id as any)?.[subField] : ''
        vb = typeof b.nursing_home_id === 'object' ? (b.nursing_home_id as any)?.[subField] : ''
      } else {
        va = (a as any)[field]
        vb = (b as any)[field]
      }

      // Normalize for comparison
      va = va ?? ''
      vb = vb ?? ''

      if (typeof va === 'number' && typeof vb === 'number') {
        return desc ? vb - va : va - vb
      }

      return desc
        ? String(vb).localeCompare(String(va))
        : String(va).localeCompare(String(vb))
    })
  }

  const filterLeads = (data: NursingHomeLead[], filters: LeadFilters) => {
    let result = data

    if (filters.stage) {
      result = result.filter(l => l.opportunity_stage === filters.stage)
    }
    if (filters.priority) {
      result = result.filter(l => l.priority === filters.priority)
    }
    if (filters.userId) {
      result = result.filter(l => l.user_id === filters.userId)
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(l => {
        if (typeof l.nursing_home_id === 'object' && l.nursing_home_id) {
          const nh = l.nursing_home_id
          return (nh.name?.toLowerCase().includes(q)) ||
                 (nh.city?.toLowerCase().includes(q)) ||
                 (nh.zip?.toLowerCase().includes(q))
        }
        return false
      })
    }
    if (filters.followUpDue) {
      const today = new Date().toISOString().split('T')[0]
      result = result.filter(l =>
        l.follow_up_date &&
        l.follow_up_date.split('T')[0] <= today &&
        !['Won', 'Lost', 'Cancelled'].includes(l.opportunity_stage)
      )
    }
    if (filters.noActivityDays && filters.noActivityDays > 0) {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - filters.noActivityDays)
      const cutoffStr = cutoff.toISOString()
      result = result.filter(l =>
        (!l.date_updated || l.date_updated < cutoffStr) &&
        !['Won', 'Lost', 'Cancelled'].includes(l.opportunity_stage)
      )
    }

    return result
  }

  const fetchLeadsLocal = (
    filters: LeadFilters = {},
    sort: string[] = ['-date_updated'],
    page?: number
  ) => {
    const currentPage = page || pagination.value.page
    const filtered = filterLeads(_allLeads.value, filters)
    const sorted = sortLeads(filtered, sort)

    pagination.value.total = sorted.length
    pagination.value.page = currentPage

    const start = (currentPage - 1) * pagination.value.limit
    leads.value = sorted.slice(start, start + pagination.value.limit)
    return leads.value
  }

  const fetchLeadCountLocal = (filters: LeadFilters = {}) => {
    const filtered = filterLeads(_allLeads.value, filters)
    pagination.value.total = filtered.length
    return filtered.length
  }

  const fetchLeadLocal = (id: string) => {
    const found = _allLeads.value.find(l => l.id === id) || null
    currentLead.value = found
    return found
  }

  const updateLeadLocal = (id: string, data: Partial<NursingHomeLead>) => {
    const idx = _allLeads.value.findIndex(l => l.id === id)
    if (idx !== -1) {
      _allLeads.value[idx] = { ...(_allLeads.value[idx]), ...data, date_updated: new Date().toISOString() }
      saveToStorage()

      // Update in current list
      const listIdx = leads.value.findIndex(l => l.id === id)
      if (listIdx !== -1) {
        leads.value[listIdx] = { ...leads.value[listIdx], ...data }
      }
      if (currentLead.value?.id === id) {
        currentLead.value = { ...currentLead.value, ...data }
      }
    }
    return _allLeads.value.find(l => l.id === id) || null
  }

  const fetchDueFollowUpsLocal = () => {
    const today = new Date().toISOString().split('T')[0]
    return _allLeads.value
      .filter(l =>
        l.follow_up_date &&
        l.follow_up_date.split('T')[0] <= today &&
        !['Won', 'Lost', 'Cancelled'].includes(l.opportunity_stage)
      )
      .sort((a, b) => (a.follow_up_date || '').localeCompare(b.follow_up_date || ''))
      .slice(0, 50)
  }

  // ─── Public API ─────────────────────────────────────────────────

  const fetchLeads = async (
    filters: LeadFilters = {},
    sort: string[] = ['-date_updated'],
    page?: number
  ) => {
    if (USE_LOCAL) return fetchLeadsLocal(filters, sort, page)

    const currentPage = page || pagination.value.page
    const filter: Record<string, any> = {}
    if (filters.stage) filter.opportunity_stage = { _eq: filters.stage }
    if (filters.priority) filter.priority = { _eq: filters.priority }
    if (filters.userId) filter.user_id = { _eq: filters.userId }

    // Build search as _or filter on related nursing_home fields
    if (filters.search) {
      const q = filters.search.trim()
      const searchConditions: Record<string, any>[] = [
        { nursing_home_id: { name: { _icontains: q } } },
        { nursing_home_id: { city: { _icontains: q } } },
        { nursing_home_id: { zip: { _icontains: q } } },
        { nursing_home_id: { fone: { _icontains: q } } },
        { nursing_home_id: { email: { _icontains: q } } },
      ]
      filter._or = searchConditions
    }

    const result = await getItems<NursingHomeLead>({
      collection: 'nursing_home_leads',
      params: {
        fields: LEAD_LIST_FIELDS,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        sort,
        limit: pagination.value.limit,
        page: currentPage,
        meta: ['total_count', 'filter_count'],
      },
    })

    leads.value = result
    pagination.value.page = currentPage
    return result
  }

  const fetchLeadCount = async (filters: LeadFilters = {}) => {
    if (USE_LOCAL) return fetchLeadCountLocal(filters)

    const filter: Record<string, any> = {}
    if (filters.stage) filter.opportunity_stage = { _eq: filters.stage }
    if (filters.priority) filter.priority = { _eq: filters.priority }
    if (filters.userId) filter.user_id = { _eq: filters.userId }

    if (filters.search) {
      const q = filters.search.trim()
      filter._or = [
        { nursing_home_id: { name: { _icontains: q } } },
        { nursing_home_id: { city: { _icontains: q } } },
        { nursing_home_id: { zip: { _icontains: q } } },
        { nursing_home_id: { fone: { _icontains: q } } },
        { nursing_home_id: { email: { _icontains: q } } },
      ]
    }

    const result = await getItems({
      collection: 'nursing_home_leads',
      params: {
        aggregate: { count: ['id'] },
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      },
    })

    const total = result?.[0]?.count?.id || 0
    pagination.value.total = Number(total)
    return Number(total)
  }

  const fetchLead = async (id: string) => {
    if (USE_LOCAL) return fetchLeadLocal(id)

    const result = await getItem<NursingHomeLead>({
      collection: 'nursing_home_leads',
      id,
      params: { fields: LEAD_DETAIL_FIELDS },
    })
    currentLead.value = result
    return result
  }

  const updateLead = async (id: string, data: Partial<NursingHomeLead>) => {
    if (USE_LOCAL) return updateLeadLocal(id, data)

    const result = await updateItem<NursingHomeLead>({
      collection: 'nursing_home_leads',
      id,
      data,
    })
    const index = leads.value.findIndex(l => l.id === id)
    if (index !== -1) leads.value[index] = { ...leads.value[index], ...data }
    if (currentLead.value?.id === id) currentLead.value = { ...currentLead.value, ...data }
    return result
  }

  const createLead = async (data: { name: string; city?: string; zip?: string; street?: string; number?: string; fone?: string; email?: string; website?: string; total_capacity?: number; stage?: OpportunityStage; priority?: Priority }) => {
    if (USE_LOCAL) {
      const nhId = `nh_${Date.now()}`
      const leadId = `lead_${Date.now()}`
      const now = new Date().toISOString()

      const nursingHome: NursingHome = {
        id: nhId,
        name: data.name,
        city: data.city,
        zip: data.zip,
        Street: data.street,
        number: data.number,
        fone: data.fone,
        email: data.email,
        website: data.website,
        total_capacity: data.total_capacity,
      }

      const newLead: NursingHomeLead = {
        id: leadId,
        nursing_home_id: nursingHome,
        opportunity_stage: data.stage || 'Unqualified',
        priority: data.priority,
        date_created: now,
        date_updated: now,
      }

      _allLeads.value.push(newLead)
      saveToStorage()
      return newLead
    }

    // Directus mode: create nursing_home first, then the lead
    const nhData: Record<string, any> = { name: data.name }
    if (data.city) nhData.city = data.city
    if (data.zip) nhData.zip = data.zip
    if (data.street) nhData.Street = data.street
    if (data.number) nhData.number = data.number
    if (data.fone) nhData.fone = data.fone
    if (data.email) nhData.email = data.email
    if (data.website) nhData.website = data.website
    if (data.total_capacity) nhData.total_capacity = data.total_capacity

    const createdNh = await createItem<any>({
      collection: 'nursing_home',
      data: nhData,
    })

    const leadData: Record<string, any> = {
      nursing_home_id: createdNh.id,
      opportunity_stage: data.stage || 'Unqualified',
    }
    if (data.priority) leadData.priority = data.priority

    const createdLead = await createItem<any>({
      collection: 'nursing_home_leads',
      data: leadData,
    })

    // Return with embedded nursing home for immediate display
    return {
      ...createdLead,
      nursing_home_id: createdNh,
    } as NursingHomeLead
  }

  const fetchStageCounts = async () => {
    if (USE_LOCAL) {
      const counts: Record<string, number> = {}
      for (const l of _allLeads.value) {
        const stage = l.opportunity_stage || 'Unqualified'
        counts[stage] = (counts[stage] || 0) + 1
      }
      return Object.entries(counts).map(([stage, count]) => ({
        opportunity_stage: stage,
        count: { id: count },
      }))
    }

    return await getItems({
      collection: 'nursing_home_leads',
      params: {
        aggregate: { count: ['id'] },
        fields: ['opportunity_stage'],
        sort: ['opportunity_stage'],
        alias: { count: 'count' },
      },
    })
  }

  const fetchDueFollowUps = async () => {
    if (USE_LOCAL) return fetchDueFollowUpsLocal()

    const today = new Date().toISOString().split('T')[0]
    return await getItems<NursingHomeLead>({
      collection: 'nursing_home_leads',
      params: {
        fields: LEAD_LIST_FIELDS,
        filter: {
          follow_up_date: { _lte: today },
          opportunity_stage: { _nin: ['Won', 'Lost', 'Cancelled'] },
        },
        sort: ['follow_up_date'],
        limit: 50,
      },
    })
  }

  return {
    leads,
    currentLead,
    pagination,
    isLoading,
    error,
    fetchLeads,
    fetchLeadCount,
    fetchLead,
    updateLead,
    createLead,
    fetchStageCounts,
    fetchDueFollowUps,
  }
}
