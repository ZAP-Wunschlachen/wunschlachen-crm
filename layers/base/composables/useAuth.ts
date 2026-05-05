import type { User } from '../types'

enum AuthState {
  LOGGED_OUT = 'LOGGED_OUT',
  LOGGED_IN = 'LOGGED_IN',
  REFRESHING = 'REFRESHING',
  ERROR = 'ERROR'
}

export const useAuth = () => {
  const config = useRuntimeConfig()
  const AUTH_URL = config.public.authUrl as string
  const DIRECTUS_URL = config.public.directusUrl as string

  const currentState = ref<AuthState>(AuthState.LOGGED_IN)
  const lastTokenRefresh = useState<number>('auth.lastTokenRefresh', () => Date.now())
  const user = useState<User | null>('auth.user', () => null)
  const isAuthenticated = computed(() => !!user.value)

  const checkAuthStatus = async () => {
    try {
      const response = await $fetch(`${DIRECTUS_URL}/secure-auth/me`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      if ((response as any)?.data) {
        user.value = (response as any).data
        return (response as any).data
      }
    } catch (error) {
      console.error('[Auth] Check failed:', error)
      user.value = null
      return null
    }
  }

  const redirectToLogin = () => {
    if (AUTH_URL) return navigateTo(AUTH_URL, { external: true })
  }

  const redirectToLogout = () => {
    if (AUTH_URL) return navigateTo(`${AUTH_URL}/logout`, { external: true })
  }

  const clearUser = () => { user.value = null }

  const needsRefresh = (): boolean => {
    return Date.now() - lastTokenRefresh.value >= 12 * 60 * 1000
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      if (currentState.value === AuthState.REFRESHING) return true
      currentState.value = AuthState.REFRESHING

      const response = await fetch(`${DIRECTUS_URL}/secure-auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        currentState.value = AuthState.LOGGED_IN
        lastTokenRefresh.value = Date.now()
        return true
      }

      if (response.status === 401 || response.status === 403) {
        currentState.value = AuthState.ERROR
        redirectToLogout()
        return false
      }

      currentState.value = AuthState.LOGGED_IN
      return false
    } catch {
      currentState.value = AuthState.LOGGED_IN
      return false
    }
  }

  const getFullName = (u: User | null = user.value) => {
    if (!u) return ''
    return `${u.first_name || ''} ${u.last_name || ''}`.trim()
  }

  return {
    currentUser: computed(() => user.value),
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    currentState: computed(() => currentState.value),
    checkAuthStatus,
    redirectToLogin,
    redirectToLogout,
    clearUser,
    refreshToken,
    needsRefresh,
    getFullName,
  }
}
