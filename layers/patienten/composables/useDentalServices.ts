// composables/useDentalServices.ts

interface DentalService {
  id: string
  name: string
}

export const useDentalServices = () => {
  const { getItems } = useSecureData()
  const services = ref<DentalService[]>([])
  const isLoading = ref(false)

  const fetchDentalServices = async () => {
    if (services.value.length > 0) return // Already loaded
    isLoading.value = true
    try {
      services.value = await getItems<DentalService>({
        collection: 'dental_services',
        params: { fields: ['id', 'name'], sort: ['name'], limit: -1 },
      })
    } catch (err) {
      console.error('Failed to fetch dental services:', err)
    } finally {
      isLoading.value = false
    }
  }

  return { services, isLoading, fetchDentalServices }
}
