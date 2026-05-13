/**
 * Directus-WebSocket-Subscription für `appointments`-Collection (Plan v9 Modul C).
 *
 * Läuft im Browser. Bei jedem WebSocket-Event ruft das Plugin den Server-Sync-
 * Endpoint auf, der die Event-Verarbeitung deduppt und persistent ausführt.
 * Server-Cron (Task 6/10) ist Safety-Net wenn niemand das CRM offen hat.
 */

export default defineNuxtPlugin({
  name: 'directus-realtime',
  parallel: true,
  setup() {
    if (process.server) return

    const config = useRuntimeConfig()
    const directusUrl = (config.public.directusUrl as string) || ''
    if (!directusUrl) return

    const wsUrl = directusUrl.replace(/^http/, 'ws') + '/websocket'
    let ws: WebSocket | null = null
    let reconnectDelay = 1000
    let stopped = false

    const subscribe = (socket: WebSocket) => {
      socket.send(JSON.stringify({
        type: 'subscribe',
        collection: 'appointments',
        event: '*',
        query: { fields: ['id', 'patient.patient_number', 'patient.email', 'start_date_time', 'arrival_date', 'treatment_finished_date', 'treatment.name', 'treatment.category', 'location.name'] },
      }))
    }

    const onEvent = async (data: any) => {
      if (data?.type !== 'subscription' || !data?.data) return
      try {
        await $fetch('/api/cron/appointment-sync', {
          method: 'POST',
          body: { trigger: 'realtime', appointment_id: data.data?.id },
          headers: { 'x-realtime-event': '1' },
        })
      } catch (e) {
        console.warn('[directus-realtime] sync failed', e)
      }
    }

    const connect = () => {
      if (stopped) return
      try {
        ws = new WebSocket(wsUrl)
      } catch {
        scheduleReconnect()
        return
      }
      ws.onopen = () => {
        reconnectDelay = 1000
        subscribe(ws!)
      }
      ws.onmessage = (msg) => {
        try { onEvent(JSON.parse(msg.data)) } catch { /* ignore */ }
      }
      ws.onclose = () => scheduleReconnect()
      ws.onerror = () => ws?.close()
    }

    const scheduleReconnect = () => {
      if (stopped) return
      setTimeout(connect, reconnectDelay)
      reconnectDelay = Math.min(30000, reconnectDelay * 2)
    }

    connect()

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        stopped = true
        ws?.close()
      })
    }
  },
})
