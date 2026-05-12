<template>
  <div
    class="flex items-center gap-1"
    :class="compact ? 'p-0' : 'p-2 bg-white rounded-lg border border-dental-blue--5'"
  >
    <button
      v-for="action in visibleActions"
      :key="action.type"
      v-tooltip.top="action.label"
      class="quick-action-btn"
      :class="[
        compact ? 'h-7 w-7' : 'h-8 w-8',
        action.disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-dental-blue--5 hover:text-dental-blue-0',
      ]"
      :disabled="action.disabled"
      @click.stop="onTrigger(action)"
    >
      <i :class="[action.icon, compact ? 'text-[11px]' : 'text-[12px]']" />
    </button>

    <!-- Optional: ergänzende Status-Markierung -->
    <button
      v-if="!compact && lead?.status !== 'lost' && lead?.status !== 'completed'"
      v-tooltip.top="'Als verloren markieren'"
      class="quick-action-btn h-8 w-8 text-power-red-0 hover:bg-power-red--5"
      @click.stop="$emit('action', { type: 'mark_lost', label: 'Als verloren', icon: 'pi pi-times-circle', urgency: 'medium' })"
    >
      <i class="pi pi-times-circle text-[12px]" />
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Lead } from '~/types/crm'

interface QuickAction {
  type: 'call' | 'email' | 'sms' | 'whatsapp' | 'note' | 'book_meeting'
  label: string
  icon: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  /** Lead — wenn vorhanden, aktiviert Channel-spezifisches Disabling */
  lead?: Lead | null
  /** Kompakt-Mode: kleinere Icons, kein border (für Listen-Hover) */
  compact?: boolean
  /** Welche Actions zeigen? Default = alle */
  only?: QuickAction['type'][]
}>(), { compact: false })

const emit = defineEmits<{ (e: 'action', action: QuickAction): void }>()

const ALL_ACTIONS: QuickAction[] = [
  { type: 'call', label: 'Anrufen', icon: 'pi pi-phone' },
  { type: 'email', label: 'E-Mail senden', icon: 'pi pi-envelope' },
  { type: 'sms', label: 'SMS senden', icon: 'pi pi-comment' },
  { type: 'whatsapp', label: 'WhatsApp', icon: 'pi pi-whatsapp' },
  { type: 'note', label: 'Notiz', icon: 'pi pi-file-edit' },
  { type: 'book_meeting', label: 'Termin', icon: 'pi pi-calendar-plus' },
]

const visibleActions = computed<QuickAction[]>(() => {
  const base = props.only?.length
    ? ALL_ACTIONS.filter((a) => props.only!.includes(a.type))
    : ALL_ACTIONS

  return base.map((a) => {
    const disabled = isActionDisabled(a, props.lead)
    return { ...a, disabled }
  })
})

const isActionDisabled = (action: QuickAction, lead: Lead | null | undefined): boolean => {
  if (!lead) return false
  switch (action.type) {
    case 'call':
    case 'sms':
    case 'whatsapp':
      return !lead.phone
    case 'email':
      return !lead.mail
    default:
      return false
  }
}

const onTrigger = (action: QuickAction) => {
  if (action.disabled) return
  emit('action', action)
}
</script>

<style scoped>
.quick-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  background: transparent;
  color: var(--p-text-color, #475569);
  transition: background-color 0.15s, color 0.15s;
}
</style>
