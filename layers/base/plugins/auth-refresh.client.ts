export default defineNuxtPlugin(() => {
  const { needsRefresh, refreshToken } = useAuth()

  setInterval(async () => {
    if (needsRefresh()) {
      await refreshToken()
    }
  }, 60 * 1000)
})
