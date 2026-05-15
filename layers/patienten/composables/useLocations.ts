// composables/useLocations.ts — Standorte aus Directus via /api/lookup-Proxy

interface Location {
  id: string
  name: string
}

export const useLocations = () => {
  const locations = ref<Location[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const fetchLocations = async () => {
    if (locations.value.length > 0) return
    isLoading.value = true
    error.value = null
    try {
      const resp = await $fetch<{ data: Location[] }>('/api/lookup/locations', {
        params: { fields: 'id,name', sort: 'name' },
      })
      locations.value = resp?.data || []
    } catch (err: any) {
      console.warn('[useLocations] /api/lookup/locations fehlgeschlagen:', err)
      error.value = err
      locations.value = []
    } finally {
      isLoading.value = false
    }
  }

  return { locations, isLoading, error, fetchLocations }
}
