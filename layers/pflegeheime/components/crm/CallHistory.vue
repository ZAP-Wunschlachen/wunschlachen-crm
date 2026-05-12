<template>
  <div>
    <div v-if="callActivities.length === 0" class="text-center py-4">
      <p class="text-[11px] text-gray-400">Keine Anrufe protokolliert</p>
    </div>
    <div v-else class="space-y-1.5">
      <div
        v-for="call in callActivities"
        :key="call.id"
        class="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
      >
        <!-- Direction icon -->
        <div
          class="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0"
          :class="outcomeColor(call.outcome)"
        >
          <i class="pi pi-phone text-[10px]" :style="call.direction === 'inbound' ? '' : 'transform: rotate(135deg)'" />
        </div>

        <!-- Details -->
        <div class="flex-1 min-w-0">
          <p class="text-[12px] font-medium text-gray-800 truncate">{{ call.subject }}</p>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[10px] text-gray-400">{{ formatDate(call.date_created) }}</span>
            <span v-if="call.duration_minutes" class="text-[10px] text-gray-400">
              · {{ call.duration_minutes }} min
            </span>
          </div>
        </div>

        <!-- Outcome badge -->
        <span
          v-if="call.outcome"
          class="text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
          :class="outcomeBadge(call.outcome)"
        >
          {{ outcomeLabel(call.outcome) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import type { CrmActivity, ActivityOutcome } from '~/types/crm'

const props = defineProps<{
  activities: CrmActivity[]
}>()

const callActivities = computed(() =>
  props.activities.filter(a => a.type === 'call')
)

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '–'
  try { return format(parseISO(dateStr), 'dd.MM.yy HH:mm', { locale: de }) } catch { return '–' }
}

const outcomeLabel = (outcome?: ActivityOutcome | null) => {
  switch (outcome) {
    case 'successful': return 'Erreicht'
    case 'no_contact': return 'Nicht erreicht'
    case 'callback': return 'Rückruf'
    case 'rejection': return 'Ablehnung'
    default: return ''
  }
}

const outcomeColor = (outcome?: ActivityOutcome | null) => {
  switch (outcome) {
    case 'successful': return 'bg-green-50 text-green-600'
    case 'no_contact': return 'bg-gray-100 text-gray-500'
    case 'callback': return 'bg-amber-50 text-amber-600'
    case 'rejection': return 'bg-red-50 text-red-500'
    default: return 'bg-gray-100 text-gray-500'
  }
}

const outcomeBadge = (outcome?: ActivityOutcome | null) => {
  switch (outcome) {
    case 'successful': return 'bg-green-50 text-green-700'
    case 'no_contact': return 'bg-gray-100 text-gray-600'
    case 'callback': return 'bg-amber-50 text-amber-700'
    case 'rejection': return 'bg-red-50 text-red-600'
    default: return 'bg-gray-100 text-gray-500'
  }
}
</script>
