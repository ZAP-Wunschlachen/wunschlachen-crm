// =============================================================================
// TEMP DEV-MODE: Auth-Refresh deaktiviert solange middleware/auth.ts bypassed
// Wieder aktivieren wenn DEV_MODE_BYPASS_AUTH=false (Phase 5e).
// =============================================================================
const DEV_MODE_BYPASS_AUTH = true

export default defineNuxtPlugin(() => {
  if (DEV_MODE_BYPASS_AUTH) return

  const { needsRefresh, refreshToken } = useAuth()

  setInterval(async () => {
    if (needsRefresh()) {
      await refreshToken()
    }
  }, 60 * 1000)
})
