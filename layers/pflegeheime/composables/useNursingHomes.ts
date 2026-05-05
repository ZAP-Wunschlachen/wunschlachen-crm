/**
 * useNursingHomes Composable
 *
 * Handles nursing_home read operations (read-only from CRM perspective).
 * Uses direct Directus API since nursing_home is not supported by secure-data proxy.
 */

const NURSING_HOME_FIELDS = [
  'id',
  'name',
  'Street',
  'number',
  'zip',
  'city',
  'fone',
  'email',
  'website',
  'total_capacity',
  'distance_from_dental_office',
  'coordinates_lat',
  'coordinates_lon',
  'notes',
  'status',
  'cooperation_number',
  'billing_code_trip_fee',
  'quarter_rule',
  'extraction_notice_days',
]

const fetchDirectus = async (path: string) => {
  const config = useRuntimeConfig()
  const baseURL = config.public.directusUrl || 'https://wunschlachen.app'
  const response = await fetch(`${baseURL}${path}`, { credentials: 'include' })
  if (!response.ok) throw new Error(`Directus ${path}: ${response.status}`)
  const json = await response.json()
  return json.data
}

export const useNursingHomes = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch a single nursing home by ID
   */
  const fetchNursingHome = async (id: string): Promise<NursingHome | null> => {
    try {
      const params = new URLSearchParams({
        fields: NURSING_HOME_FIELDS.join(','),
      })
      return await fetchDirectus(`/items/nursing_home/${id}?${params}`)
    } catch (err) {
      console.error('Failed to fetch nursing home:', err)
      return null
    }
  }

  /**
   * Search nursing homes by name/city
   */
  const searchNursingHomes = async (query: string): Promise<NursingHome[]> => {
    try {
      const params = new URLSearchParams({
        fields: 'id,name,city,zip,total_capacity',
        search: query,
        limit: '20',
      })
      return (await fetchDirectus(`/items/nursing_home?${params}`)) || []
    } catch (err) {
      console.error('Failed to search nursing homes:', err)
      return []
    }
  }

  return {
    isLoading,
    error,
    fetchNursingHome,
    searchNursingHomes,
  }
}
