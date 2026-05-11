// =============================================================================
// TEMP DEV-MODE: Auth komplett überspringen
// Auf `false` setzen wenn echte Auth aktiviert werden soll (Phase 5e).
// =============================================================================
const DEV_MODE_BYPASS_AUTH = true

export default defineNuxtRouteMiddleware(async (to) => {
  if (process.env.NODE_ENV === 'test') return

  const config = useRuntimeConfig()
  const authUrl = config.public.authUrl as string
  const devAuthBypass = DEV_MODE_BYPASS_AUTH || (config.public.devAuthBypass as boolean)
  const { user, checkAuthStatus } = useAuth()

  // Dev-only: Mock-User setzen, Auth komplett überspringen
  if (devAuthBypass) {
    if (!user.value) {
      user.value = {
        id: 'dev-tony',
        email: 'tony.guenther@wunschlachen.de',
        first_name: 'Tony',
        last_name: 'Günther (Dev-Bypass)',
        role: 'administrator',
        nursing_home: null,
      } as any
    }
    // Routing-Decision für `/`
    if (to.path === '/') {
      return navigateTo('/dashboard')
    }
    return // alle anderen Routes durchlassen
  }

  // ===== Production Auth-Flow =====
  if (!user.value) {
    await checkAuthStatus()
  }

  if (!user.value?.id) {
    return navigateTo(authUrl, { external: true })
  }

  const { hasCrmAccess, hasPatientenAccess, defaultPath } = useUserRole()

  if (to.path === '/') {
    return navigateTo(defaultPath.value)
  }

  // Alles unter /crm/* (B2B inkl. heime/*) erfordert CRM-Zugriff
  if (to.path.startsWith('/crm') && !hasCrmAccess.value) {
    return navigateTo(defaultPath.value)
  }

  // Alles unter /patienten/* (B2C) erfordert Patienten-Zugriff
  if (to.path.startsWith('/patienten') && !hasPatientenAccess.value) {
    return navigateTo(defaultPath.value)
  }
})
