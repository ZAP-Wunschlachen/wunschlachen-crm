// composables/useLocations.ts — Standorte aus Directus mit Mock-Fallback für Dev

interface Location {
  id: string
  name: string
}

// Mock-Standorte als Fallback wenn Directus nicht erreichbar / leer
const MOCK_LOCATIONS: Location[] = [
  { id: 'loc-berlin',   name: 'Wunschlachen Berlin' },
  { id: 'loc-hamburg',  name: 'Wunschlachen Hamburg' },
  { id: 'loc-muenchen', name: 'Wunschlachen München' },
  { id: 'loc-koeln',    name: 'Wunschlachen Köln' },
]

export const useLocations = () => {
  const { getItems } = useSecureData()
  const locations = ref<Location[]>([])
  const isLoading = ref(false)

  const fetchLocations = async () => {
    if (locations.value.length > 0) return
    isLoading.value = true
    try {
      const data = await getItems<Location>({
        collection: 'locations',
        params: { fields: ['id', 'name'], sort: ['name'], limit: -1 },
      })
      locations.value = data && data.length > 0 ? data : MOCK_LOCATIONS
    } catch (err) {
      console.warn('[useLocations] Directus-Fetch fehlgeschlagen, nutze Mock:', err)
      locations.value = MOCK_LOCATIONS
    } finally {
      isLoading.value = false
    }
  }

  return { locations, isLoading, fetchLocations }
}
