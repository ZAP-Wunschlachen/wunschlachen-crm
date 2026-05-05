<template>
  <div class="space-y-2">
    <div v-if="activities.length === 0" class="text-xs text-dental-blue--3 text-center py-4">
      Keine Aktivitaeten vorhanden
    </div>
    <div v-for="activity in activities" :key="activity.id" class="flex items-start gap-3 p-2 rounded-lg hover:bg-soft-concrete--1">
      <div class="w-6 h-6 rounded-full bg-dental-blue--5 flex items-center justify-center flex-shrink-0">
        <i class="pi text-[10px] text-dental-blue-0" :class="getIcon(activity.type)" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs font-medium text-dental-blue-0">{{ activity.subject }}</p>
        <p v-if="activity.content" class="text-[10px] text-dental-blue--3 truncate mt-0.5">{{ activity.content }}</p>
        <p class="text-[9px] text-dental-blue--3 mt-1">{{ activity.user_name }} - {{ formatDate(activity.date_created) }}</p>
      </div>
      <button class="text-dental-blue--3 hover:text-red-500 flex-shrink-0" @click="$emit('removed', activity.id)">
        <i class="pi pi-times text-[9px]" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LeadActivity, LeadActivityType } from '~/types/crm'

defineProps<{ activities: LeadActivity[] }>()
defineEmits(['removed'])

const getIcon = (type: LeadActivityType) => {
  const map: Record<string, string> = {
    call: 'pi-phone',
    email_sent: 'pi-envelope',
    email_received: 'pi-inbox',
    sms: 'pi-comments',
    whatsapp: 'pi-whatsapp',
    meeting: 'pi-calendar',
    note: 'pi-file',
    task: 'pi-check-square',
    voice_ai: 'pi-microphone',
  }
  return map[type] || 'pi-circle'
}

const formatDate = (date: string) => {
  try { return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) }
  catch { return date }
}
</script>
