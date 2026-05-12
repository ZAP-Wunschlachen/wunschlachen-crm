/**
 * useSmartViews Composable
 *
 * CRUD for nursing_home_lead_smart_views - saved filter/sort configurations.
 * LOCAL MODE: Uses localStorage for persistence.
 */

const SMART_VIEW_FIELDS = [
  'id',
  'name',
  'filters',
  'sort',
  'icon',
  'is_shared',
  'date_created',
  'user_created',
]

const USE_LOCAL = true
const STORAGE_KEY = 'nursing_home_lead_smart_views'

// Shared state
const _allViews = ref<CrmSmartView[]>([])
let _loaded = false

const loadFromStorage = () => {
  if (_loaded) return
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) _allViews.value = JSON.parse(stored)
  } catch { /* ignore */ }
  _loaded = true
}

const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_allViews.value))
  } catch { /* ignore */ }
}

export const useSmartViews = () => {
  const secureData = USE_LOCAL ? null : useSecureData()
  const getItems = secureData?.getItems ?? (async () => [])
  const createItem = secureData?.createItem ?? (async () => null as any)
  const updateItem = secureData?.updateItem ?? (async () => null as any)
  const deleteItem = secureData?.deleteItem ?? (async () => null as any)
  const isLoading = secureData?.isLoading ?? ref(false)
  const error = secureData?.error ?? ref(null)

  if (USE_LOCAL) loadFromStorage()

  const smartViews = computed(() => _allViews.value)

  const fetchSmartViews = async () => {
    if (USE_LOCAL) {
      loadFromStorage()
      return _allViews.value
    }

    const result = await getItems<CrmSmartView>({
      collection: 'nursing_home_lead_smart_views',
      params: {
        fields: SMART_VIEW_FIELDS,
        sort: ['name'],
      },
    })

    _allViews.value = result
    return result
  }

  const createSmartView = async (data: Partial<CrmSmartView>) => {
    if (USE_LOCAL) {
      const newView: CrmSmartView = {
        id: `sv_${Date.now()}`,
        name: data.name || '',
        filters: data.filters || {},
        sort: data.sort || null,
        icon: data.icon || 'pi pi-filter',
        is_shared: data.is_shared || false,
        date_created: new Date().toISOString(),
      }
      _allViews.value.push(newView)
      saveToStorage()
      return newView
    }

    const result = await createItem<Partial<CrmSmartView>>({
      collection: 'nursing_home_lead_smart_views',
      data,
    })

    await fetchSmartViews()
    return result
  }

  const updateSmartView = async (id: string, data: Partial<CrmSmartView>) => {
    if (USE_LOCAL) {
      const idx = _allViews.value.findIndex(v => v.id === id)
      if (idx !== -1) {
        _allViews.value[idx] = { ..._allViews.value[idx], ...data }
        saveToStorage()
      }
      return _allViews.value[idx]
    }

    const result = await updateItem<CrmSmartView>({
      collection: 'nursing_home_lead_smart_views',
      id,
      data,
    })

    const index = _allViews.value.findIndex(v => v.id === id)
    if (index !== -1) {
      _allViews.value[index] = { ..._allViews.value[index], ...data }
    }

    return result
  }

  const removeSmartView = async (id: string) => {
    if (USE_LOCAL) {
      _allViews.value = _allViews.value.filter(v => v.id !== id)
      saveToStorage()
      return
    }

    await deleteItem({ collection: 'nursing_home_lead_smart_views', id })
    _allViews.value = _allViews.value.filter(v => v.id !== id)
  }

  return {
    smartViews,
    isLoading,
    error,
    fetchSmartViews,
    createSmartView,
    updateSmartView,
    removeSmartView,
  }
}
