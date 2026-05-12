/**
 * useToast — Toast-Notification Composable
 *
 * API-kompatibel zu `primevue/usetoast` (das wir nicht mehr nutzen).
 * Toasts werden via globalem <Toast /> Component (auto-imported) gerendert.
 *
 * Usage:
 *   const toast = useToast()
 *   toast.add({ severity: 'success', summary: 'Gespeichert', detail: '...', life: 3000 })
 */

export interface ToastMessage {
  id: string
  severity: 'success' | 'info' | 'warn' | 'error'
  summary: string
  detail?: string
  life?: number
  closable?: boolean
  group?: string
}

export const useToast = () => {
  const messages = useState<ToastMessage[]>('toast.messages', () => [])

  const add = (msg: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const full: ToastMessage = { id, life: 3000, closable: true, ...msg }
    messages.value.push(full)
    if (full.life && full.life > 0) {
      setTimeout(() => remove(id), full.life)
    }
  }

  const remove = (id: string) => {
    messages.value = messages.value.filter((m) => m.id !== id)
  }

  const removeAllGroups = () => {
    messages.value = []
  }

  const removeGroup = (group: string) => {
    messages.value = messages.value.filter((m) => m.group !== group)
  }

  return { messages, add, remove, removeAllGroups, removeGroup }
}
