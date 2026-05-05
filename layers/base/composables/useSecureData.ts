export interface QueryOptions {
  fields?: string[]
  filter?: Record<string, any>
  sort?: string[]
  limit?: number
  offset?: number
  page?: number
  search?: string
  meta?: string[]
  aggregate?: Record<string, any>
  deep?: Record<string, any>
  alias?: Record<string, any>
}

export const useSecureData = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.directusUrl || 'http://localhost:8080'
  const { refreshToken, redirectToLogout } = useAuth()

  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const handleError = async (response: Response): Promise<Error> => {
    try {
      const errorData = await response.json()
      return new Error(errorData.errors?.[0]?.message || 'An error occurred')
    } catch {
      return new Error('An error occurred')
    }
  }

  const makeRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
    })

    if (response.status === 401 && !(options as any)._retry) {
      const refreshed = await refreshToken()
      if (refreshed) return makeRequest(url, { ...options, _retry: true } as any)
      redirectToLogout()
      throw new Error('Session expired. Please log in again.')
    }

    if (response.status === 500 && url.includes('/secure-data/items/') && !(options as any)._directFallback) {
      const directUrl = url.replace('/secure-data/items/', '/items/')
      return makeRequest(directUrl, { ...options, _directFallback: true } as any)
    }

    return response
  }

  const buildQueryString = (options: QueryOptions = {}): string => {
    const params = new URLSearchParams()
    if (options.fields) params.set('fields', options.fields.join(','))
    if (options.filter) params.set('filter', JSON.stringify(options.filter))
    if (options.sort) params.set('sort', options.sort.join(','))
    if (options.limit) params.set('limit', String(options.limit))
    if (options.offset) params.set('offset', String(options.offset))
    if (options.page) params.set('page', String(options.page))
    if (options.search) params.set('search', options.search)
    if (options.meta) params.set('meta', options.meta.join(','))
    if (options.aggregate) params.set('aggregate', JSON.stringify(options.aggregate))
    if (options.deep) params.set('deep', JSON.stringify(options.deep))
    if (options.alias) params.set('alias', JSON.stringify(options.alias))
    const qs = params.toString()
    return qs ? `?${qs}` : ''
  }

  const getItems = async <T = any>(params: { collection: string; params?: QueryOptions }): Promise<T[]> => {
    isLoading.value = true
    error.value = null
    try {
      const url = `${baseURL}/secure-data/items/${params.collection}${buildQueryString(params.params)}`
      const response = await makeRequest(url)
      if (!response.ok) throw await handleError(response)
      return (await response.json()).data
    } catch (err) { error.value = err as Error; throw err }
    finally { isLoading.value = false }
  }

  const getItem = async <T = any>(params: { collection: string; id: string; params?: QueryOptions }): Promise<T> => {
    isLoading.value = true
    error.value = null
    try {
      const url = `${baseURL}/secure-data/items/${params.collection}/${params.id}${buildQueryString(params.params || {})}`
      const response = await makeRequest(url)
      if (!response.ok) throw await handleError(response)
      return (await response.json()).data
    } catch (err) { error.value = err as Error; throw err }
    finally { isLoading.value = false }
  }

  const createItem = async <T = any>(params: { collection: string; data: T | T[] }): Promise<T | string[]> => {
    isLoading.value = true
    error.value = null
    try {
      const url = `${baseURL}/secure-data/items/${params.collection}`
      const response = await makeRequest(url, { method: 'POST', body: JSON.stringify(params.data) })
      if (!response.ok) throw await handleError(response)
      return (await response.json()).data
    } catch (err) { error.value = err as Error; throw err }
    finally { isLoading.value = false }
  }

  const updateItem = async <T = any>(params: { collection: string; id: string; data: Partial<T> }): Promise<T> => {
    isLoading.value = true
    error.value = null
    try {
      const url = `${baseURL}/secure-data/items/${params.collection}/${params.id}`
      const response = await makeRequest(url, { method: 'PATCH', body: JSON.stringify(params.data) })
      if (!response.ok) throw await handleError(response)
      return (await response.json()).data
    } catch (err) { error.value = err as Error; throw err }
    finally { isLoading.value = false }
  }

  const updateItems = async (params: { collection: string; keys: string[]; data: Record<string, any> }): Promise<string[]> => {
    isLoading.value = true
    error.value = null
    try {
      const url = `${baseURL}/secure-data/items/${params.collection}`
      const response = await makeRequest(url, { method: 'PATCH', body: JSON.stringify({ keys: params.keys, data: params.data }) })
      if (!response.ok) throw await handleError(response)
      return (await response.json()).data
    } catch (err) { error.value = err as Error; throw err }
    finally { isLoading.value = false }
  }

  const deleteItem = async (params: { collection: string; id: string }): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      const url = `${baseURL}/secure-data/items/${params.collection}/${params.id}`
      const response = await makeRequest(url, { method: 'DELETE' })
      if (!response.ok) throw await handleError(response)
    } catch (err) { error.value = err as Error; throw err }
    finally { isLoading.value = false }
  }

  const deleteItems = async (params: { collection: string; keys: string[] }): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      const url = `${baseURL}/secure-data/items/${params.collection}`
      const response = await makeRequest(url, { method: 'DELETE', body: JSON.stringify({ keys: params.keys }) })
      if (!response.ok) throw await handleError(response)
    } catch (err) { error.value = err as Error; throw err }
    finally { isLoading.value = false }
  }

  return { isLoading, error, getItems, getItem, createItem, updateItem, updateItems, deleteItem, deleteItems }
}
