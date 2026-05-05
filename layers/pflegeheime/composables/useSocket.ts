/**
 * useSocket Composable
 *
 * WebSocket real-time connection to Directus for live data updates.
 */

type MessageHandler = (data: any) => void

interface Collection {
  collection: string
  fields: string[]
  params: any
}

const resetParams: any = ref(null)

export const useSocket = (
  onMessageReceived: MessageHandler,
  collections: Collection[] = []
) => {
  const connection = ref<WebSocket | null>(null)
  const isReconnecting = ref(false)
  const reconnectAttempts = ref(0)

  const { currentUser } = useAuth()
  const config = useRuntimeConfig()

  /**
   * Get temporary WebSocket token via secure-auth endpoint
   */
  const getWebSocketToken = async (): Promise<string | null> => {
    if (import.meta.server) return null

    if (!currentUser.value) {
      console.log('User not authenticated yet, skipping WebSocket token request')
      return null
    }

    try {
      const response = await fetch(`${config.public.directusUrl}/secure-auth/ws-token`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        console.error('Failed to get WebSocket token:', response.status)
        return null
      }

      const data = await response.json()
      return data.token || null
    } catch (error) {
      console.error('Error getting WebSocket token:', error)
      return null
    }
  }

  const cleanupSocket = () => {
    if (connection.value) {
      connection.value.removeEventListener('open', handleOpen)
      connection.value.removeEventListener('close', handleClose)
      connection.value.removeEventListener('message', handleMessage)
      connection.value.removeEventListener('error', handleError)
      connection.value.close()
      connection.value = null
    }
  }

  const setupSocket = async () => {
    if (import.meta.server) return

    cleanupSocket()

    if (!config.public.socketUrl) {
      return console.error('Socket URL is not set')
    }

    const token = await getWebSocketToken()

    connection.value = new WebSocket(config.public.socketUrl as string)

    connection.value.addEventListener('open', () => handleOpen(token))
    connection.value.addEventListener('close', handleClose)
    connection.value.addEventListener('message', handleMessage)
    connection.value.addEventListener('error', handleError)
  }

  const handleError = (error: Event) => {
    console.error('WebSocket error:', error)
  }

  const handleOpen = (token: string | null) => {
    reconnectAttempts.value = 0

    if (token) {
      connection.value?.send(
        JSON.stringify({ type: 'auth', access_token: token })
      )
    } else {
      console.log('Socket opened without token - relying on cookie auth')
    }

    console.log('Socket opened')
    isReconnecting.value = false
  }

  const subscribe = (collections: Collection[]) => {
    if (!connection.value) {
      return console.error('Connection is not open')
    }
    collections.forEach((item) => {
      const { filters, deep } = (resetParams.value?.[item.collection]) || item.params

      connection.value?.send(
        JSON.stringify({
          type: 'subscribe',
          collection: item.collection,
          query: {
            filter: filters,
            ...(deep && { deep }),
            fields: item.fields,
          },
        })
      )
    })
  }

  const handleClose = () => {
    console.log('Socket closed', new Date())

    if (!isReconnecting.value) {
      isReconnecting.value = true
      const delay = Math.min(1000 * 2 ** reconnectAttempts.value, 30000)
      setTimeout(() => {
        reconnectAttempts.value += 1
        setupSocket()
      }, delay)
    }
  }

  const handleMessage = (message: MessageEvent) => {
    let data
    try {
      data = JSON.parse(message.data)
    } catch (error) {
      console.error('Failed to parse message data:', error)
      return
    }

    if (data.type === 'ping') {
      connection.value?.send(JSON.stringify({ type: 'pong' }))
      return
    }

    if (data.type === 'auth') {
      if (data.status === 'ok') {
        console.log('Subscribed to', collections)
        subscribe(collections)
      } else {
        if (!currentUser.value) {
          console.error('Authentication failed Please Login Again:', data)
          const { redirectToLogin } = useAuth()
          return redirectToLogin()
        }
        console.error('Authentication failed:', data)
      }
    }

    onMessageReceived?.(data)
  }

  const sendText = (text: string) => {
    if (!connection.value) {
      return console.error('Connection is not open')
    }
    connection.value.send(
      JSON.stringify({
        type: 'items',
        collection: 'texts',
        action: 'create',
        data: { content: text },
      })
    )
  }

  const resetSocket = async (params: any) => {
    resetParams.value = params
    await setupSocket()
  }

  onMounted(() => {
    if (!connection.value && currentUser.value) {
      setupSocket()
    }
  })

  watch(currentUser, (newUser) => {
    if (newUser && !connection.value) {
      setupSocket()
    } else if (!newUser && connection.value) {
      cleanupSocket()
    }
  })

  onUnmounted(() => {
    cleanupSocket()
  })

  return { connection, sendText, resetSocket, cleanupSocket }
}
