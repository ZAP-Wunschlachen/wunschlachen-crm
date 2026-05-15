// composables/useDentalServices.ts — Zahnärztliche Leistungen aus Directus via /api/lookup-Proxy

interface DentalService {
  id: string
  name: string
}

export const useDentalServices = () => {
  const services = ref<DentalService[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const fetchDentalServices = async () => {
    if (services.value.length > 0) return
    isLoading.value = true
    error.value = null
    try {
      const resp = await $fetch<{ data: DentalService[] }>('/api/lookup/dental_services', {
        params: { fields: 'id,name', sort: 'name' },
      })
      services.value = resp?.data || []
    } catch (err: any) {
      console.warn('[useDentalServices] /api/lookup/dental_services fehlgeschlagen:', err)
      error.value = err
      services.value = []
    } finally {
      isLoading.value = false
    }
  }

  return { services, isLoading, error, fetchDentalServices }
}
