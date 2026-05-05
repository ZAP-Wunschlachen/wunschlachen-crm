export default defineNuxtRouteMiddleware(async (to) => {
  if (process.env.NODE_ENV === 'test') return

  const config = useRuntimeConfig()
  const authUrl = config.public.authUrl as string
  const { user, checkAuthStatus } = useAuth()

  if (!user.value) {
    await checkAuthStatus()
  }

  if (!user.value?.id) {
    return navigateTo(authUrl, { external: true })
  }

  const { hasCrmAccess, hasPflegeheimeAccess, hasPatientenAccess, defaultPath } = useUserRole()

  if (to.path === '/') {
    return navigateTo(defaultPath.value)
  }

  if (to.path.startsWith('/pflegeheime') && !hasPflegeheimeAccess.value) {
    return navigateTo(defaultPath.value)
  }

  if (to.path.startsWith('/patienten') && !hasPatientenAccess.value) {
    return navigateTo(defaultPath.value)
  }

  if (to.path.startsWith('/crm') && !hasCrmAccess.value) {
    return navigateTo(defaultPath.value)
  }
})
