<template>
  <div
    class="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0"
    :style="{ backgroundColor: config.bg }"
  >
    <i :class="config.icon" class="text-[11px]" :style="{ color: config.color }" />
  </div>
</template>

<script setup lang="ts">
import type { ActivityType } from '~/types/crm'

const props = defineProps<{
  type: ActivityType
}>()

const ICON_MAP: Record<ActivityType, { icon: string; color: string; bg: string }> = {
  call: { icon: 'pi pi-phone', color: '#16a34a', bg: '#dcfce7' },
  email_sent: { icon: 'pi pi-send', color: '#2563eb', bg: '#dbeafe' },
  email_received: { icon: 'pi pi-envelope', color: '#7c3aed', bg: '#ede9fe' },
  sms: { icon: 'pi pi-comment', color: '#0891b2', bg: '#cffafe' },
  whatsapp: { icon: 'pi pi-comments', color: '#16a34a', bg: '#dcfce7' },
  meeting: { icon: 'pi pi-calendar', color: '#ea580c', bg: '#ffedd5' },
  note: { icon: 'pi pi-pencil', color: '#64748b', bg: '#f1f5f9' },
  stage_change: { icon: 'pi pi-arrow-right-arrow-left', color: '#8b5cf6', bg: '#f3e8ff' },
  task: { icon: 'pi pi-check-square', color: '#0d9488', bg: '#ccfbf1' },
  document: { icon: 'pi pi-file', color: '#b45309', bg: '#fef3c7' },
  newsletter: { icon: 'pi pi-megaphone', color: '#0369a1', bg: '#e0f2fe' },
}

const config = computed(() => ICON_MAP[props.type] || ICON_MAP.note)
</script>
