// composables/useGoogleReviews.ts — Google Business Profile reviews

const CONFIG_KEY = 'praxis-crm-google-config'
const CACHE_KEY = 'praxis-crm-google-reviews'
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in ms

export interface GoogleConfig {
  apiKey: string
  placeId: string
}

export interface GoogleReview {
  reviewId: string
  reviewer: {
    displayName: string
    profilePhotoUrl?: string
  }
  starRating: number // 1-5
  comment: string
  createTime: string
  updateTime: string
  reviewReply?: {
    comment: string
    updateTime: string
  } | null
}

interface CachedReviews {
  reviews: GoogleReview[]
  timestamp: number
}

const DEFAULT_CONFIG: GoogleConfig = {
  apiKey: '',
  placeId: '',
}

const readConfig = (): GoogleConfig => {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG
  } catch {
    return DEFAULT_CONFIG
  }
}

const writeConfig = (config: GoogleConfig) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

const readCache = (): CachedReviews | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cached: CachedReviews = JSON.parse(raw)
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return cached
  } catch {
    return null
  }
}

const writeCache = (reviews: GoogleReview[]) => {
  const data: CachedReviews = { reviews, timestamp: Date.now() }
  localStorage.setItem(CACHE_KEY, JSON.stringify(data))
}

export const useGoogleReviews = () => {
  const config = ref<GoogleConfig>(readConfig())
  const reviews = ref<GoogleReview[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isConfigured = computed(() => !!config.value.apiKey && !!config.value.placeId)

  const saveConfig = (newConfig: Partial<GoogleConfig>) => {
    config.value = { ...config.value, ...newConfig }
    writeConfig(config.value)
    // Clear cache when config changes
    localStorage.removeItem(CACHE_KEY)
  }

  const loadConfig = () => {
    config.value = readConfig()
  }

  /**
   * Fetch reviews from Google Business Profile API.
   */
  const fetchReviews = async (forceRefresh = false): Promise<GoogleReview[]> => {
    if (!isConfigured.value) {
      error.value = 'Google API nicht konfiguriert. Bitte API-Key und Place ID in den Einstellungen hinterlegen.'
      return []
    }

    // Check cache first
    if (!forceRefresh) {
      const cached = readCache()
      if (cached) {
        reviews.value = cached.reviews
        return cached.reviews
      }
    }

    isLoading.value = true
    error.value = null

    try {
      const url = `https://places.googleapis.com/v1/places/${config.value.placeId}`
      const response = await $fetch<any>(url, {
        headers: {
          'X-Goog-Api-Key': config.value.apiKey,
          'X-Goog-FieldMask': 'reviews,rating,userRatingCount',
        },
      })

      const fetchedReviews: GoogleReview[] = (response.reviews || []).map(
        (r: any, index: number) => ({
          reviewId: r.name || `review-${index}`,
          reviewer: {
            displayName: r.authorAttribution?.displayName || 'Anonym',
            profilePhotoUrl: r.authorAttribution?.photoUri || undefined,
          },
          starRating: r.rating || 0,
          comment: r.text?.text || '',
          createTime: r.publishTime || new Date().toISOString(),
          updateTime: r.publishTime || new Date().toISOString(),
          reviewReply: r.reviewReply
            ? { comment: r.reviewReply.text || '', updateTime: r.reviewReply.publishTime || '' }
            : null,
        }),
      )

      // Sort newest first
      fetchedReviews.sort(
        (a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime(),
      )

      reviews.value = fetchedReviews
      writeCache(fetchedReviews)
      return fetchedReviews
    } catch (err: any) {
      error.value = err?.data?.error?.message || err?.message || 'Fehler beim Laden der Bewertungen'
      return []
    } finally {
      isLoading.value = false
    }
  }

  const getAverageRating = computed(() => {
    if (reviews.value.length === 0) return 0
    const sum = reviews.value.reduce((acc, r) => acc + r.starRating, 0)
    return Math.round((sum / reviews.value.length) * 10) / 10
  })

  const getReviewCount = computed(() => reviews.value.length)

  const getLatestReviews = (count = 5) => {
    return reviews.value.slice(0, count)
  }

  const getUnansweredCount = computed(
    () => reviews.value.filter(r => !r.reviewReply).length,
  )

  return {
    config,
    reviews,
    isLoading,
    error,
    isConfigured,
    saveConfig,
    loadConfig,
    fetchReviews,
    getAverageRating,
    getReviewCount,
    getLatestReviews,
    getUnansweredCount,
  }
}
