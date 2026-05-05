/**
 * Persistent state for the Next Lead Suggestion queue.
 * Module-level refs survive client-side navigation in Nuxt.
 */

type FilterMode = 'smart' | 'follow_up' | 'stage_qualified' | 'stage_follow_up' | 'stage_presentation' | 'stage_email' | 'stage_emergency' | 'prio_a' | 'beds_100'

const STORAGE_KEY_FILTER = 'crm_next_lead_filter'
const STORAGE_KEY_VISITED = 'crm_next_lead_visited'

// Module-level state - persists across component mounts/navigation
const _visitedIds = ref<string[]>([])
const _activeFilter = ref<FilterMode>('smart')
let _initialized = false

const init = () => {
  if (_initialized || !import.meta.client) return
  try {
    const storedVisited = localStorage.getItem(STORAGE_KEY_VISITED)
    if (storedVisited) _visitedIds.value = JSON.parse(storedVisited)
  } catch { /* ignore */ }
  _activeFilter.value = (localStorage.getItem(STORAGE_KEY_FILTER) as FilterMode) || 'smart'
  _initialized = true
}

export const useNextLeadQueue = () => {
  init()

  const markVisited = (id: string) => {
    if (!_visitedIds.value.includes(id)) {
      _visitedIds.value.push(id)
      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY_VISITED, JSON.stringify(_visitedIds.value))
      }
    }
  }

  const resetQueue = () => {
    _visitedIds.value = []
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY_VISITED)
    }
  }

  const setFilter = (filter: FilterMode) => {
    _activeFilter.value = filter
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY_FILTER, filter)
    }
  }

  return {
    visitedIds: _visitedIds,
    activeFilter: _activeFilter,
    markVisited,
    resetQueue,
    setFilter,
  }
}
