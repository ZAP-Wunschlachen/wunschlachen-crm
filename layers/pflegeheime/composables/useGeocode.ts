/**
 * useGeocode Composable
 *
 * Geocodes addresses to coordinates using Nominatim (OpenStreetMap).
 * Free, no API key needed. Results are cached in localStorage.
 */

const CACHE_KEY = 'crm_geocode_cache'

interface GeoResult {
  lat: number
  lon: number
}

const loadCache = (): Record<string, GeoResult> => {
  try {
    const stored = localStorage.getItem(CACHE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch { return {} }
}

const saveCache = (cache: Record<string, GeoResult>) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch { /* ignore */ }
}

export const useGeocode = () => {
  const cache = loadCache()

  const geocode = async (address: string): Promise<GeoResult | null> => {
    if (!address.trim()) return null

    // Check cache first
    const cacheKey = address.toLowerCase().trim()
    if (cache[cacheKey]) return cache[cacheKey]

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=de`
      const res = await fetch(url)
      if (!res.ok) return null

      const results = await res.json()
      if (results.length === 0) return null

      const result: GeoResult = {
        lat: parseFloat(results[0].lat),
        lon: parseFloat(results[0].lon),
      }

      // Cache the result
      cache[cacheKey] = result
      saveCache(cache)

      return result
    } catch {
      return null
    }
  }

  /**
   * Get coordinates for a nursing home - uses stored coordinates or geocodes address.
   */
  const getCoordinates = async (nh: {
    coordinates_lat?: number
    coordinates_lon?: number
    Street?: string
    number?: string
    zip?: string
    city?: string
    name?: string
  }): Promise<GeoResult | null> => {
    // Use stored coordinates if available
    if (nh.coordinates_lat && nh.coordinates_lon) {
      return { lat: nh.coordinates_lat, lon: nh.coordinates_lon }
    }

    // Build address for geocoding
    const street = [nh.Street, nh.number].filter(Boolean).join(' ')
    const city = [nh.zip, nh.city].filter(Boolean).join(' ')
    const address = [street, city].filter(Boolean).join(', ')

    if (address) {
      const result = await geocode(address)
      if (result) return result
    }

    // Fallback: try with name + city
    if (nh.name && nh.city) {
      return await geocode(`${nh.name}, ${nh.city}`)
    }

    return null
  }

  return { geocode, getCoordinates }
}
