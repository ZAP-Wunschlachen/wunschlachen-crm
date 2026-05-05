// composables/useLocations.ts

interface Location {
  id: string
  name: string
}

export const useLocations = () => {
  const { getItems } = useSecureData()
  const locations = ref<Location[]>([])
  const isLoading = ref(false)

  const fetchLocations = async () => {
    if (locations.value.length > 0) return // Already loaded
    isLoading.value = true
    try {
      locations.value = await getItems<Location>({
        collection: 'locations',
        params: { fields: ['id', 'name'], sort: ['name'], limit: -1 },
      })
    } catch (err) {
      console.error('Failed to fetch locations:', err)
    } finally {
      isLoading.value = false
    }
  }

  return { locations, isLoading, fetchLocations }
}
