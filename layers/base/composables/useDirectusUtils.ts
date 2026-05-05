export const useDirectusUtils = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.directusUrl as string

  const getAssetUrl = (fileId: string): string => `${baseURL}/assets/${fileId}`

  return { getAssetUrl }
}
