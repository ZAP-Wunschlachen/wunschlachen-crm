// composables/useDentalServices.ts — Zahnärztliche Leistungen aus Directus mit Mock-Fallback

interface DentalService {
  id: string
  name: string
}

// Mock-Liste als Fallback wenn Directus nicht erreichbar / leer
const MOCK_SERVICES: DentalService[] = [
  { id: 'svc-implantat-einzelzahn', name: 'Einzelzahn-Implantat' },
  { id: 'svc-implantat-mehrere',    name: 'Mehrere Implantate / Brücke' },
  { id: 'svc-implantat-allon4',     name: 'All-on-4® / All-on-6®' },
  { id: 'svc-zahnersatz',           name: 'Zahnersatz / Prothese' },
  { id: 'svc-zahnersatz-festsitzend', name: 'Festsitzender Zahnersatz' },
  { id: 'svc-veneers',              name: 'Veneers / ästhetische Zahnheilkunde' },
  { id: 'svc-kieferchirurgie',      name: 'Kieferchirurgie / Knochenaufbau' },
  { id: 'svc-beratung-allgemein',   name: 'Allgemeine Beratung' },
]

export const useDentalServices = () => {
  const { getItems } = useSecureData()
  const services = ref<DentalService[]>([])
  const isLoading = ref(false)

  const fetchDentalServices = async () => {
    if (services.value.length > 0) return
    isLoading.value = true
    try {
      const data = await getItems<DentalService>({
        collection: 'dental_services',
        params: { fields: ['id', 'name'], sort: ['name'], limit: -1 },
      })
      services.value = data && data.length > 0 ? data : MOCK_SERVICES
    } catch (err) {
      console.warn('[useDentalServices] Directus-Fetch fehlgeschlagen, nutze Mock:', err)
      services.value = MOCK_SERVICES
    } finally {
      isLoading.value = false
    }
  }

  return { services, isLoading, fetchDentalServices }
}
