<template>
  <div class="flex items-center gap-1.5">
    <button
      v-for="action in actions"
      :key="action.type"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
      @click="$emit('action', action.type)"
    >
      <CrmActivityIcon :type="action.type" />
      {{ action.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ActivityType } from '~/types/crm'

const actions: { type: ActivityType; label: string }[] = [
  { type: 'note', label: 'Notiz' },
  { type: 'call', label: 'Anruf' },
  { type: 'email_sent', label: 'E-Mail' },
  { type: 'meeting', label: 'Termin' },
  { type: 'task', label: 'Aufgabe' },
  { type: 'newsletter', label: 'Newsletter' },
]

defineEmits<{
  action: [type: ActivityType]
}>()
</script>
