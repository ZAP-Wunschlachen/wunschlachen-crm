<template>
  <div
    class="rounded-lg border p-4 shadow-sm"
    :style="{
      borderColor: urgencyStyle.color,
      backgroundColor: urgencyStyle.bgColor,
    }"
  >
    <!-- Header -->
    <div class="flex items-start gap-3 mb-3">
      <i :class="urgencyStyle.icon" :style="{ color: urgencyStyle.color }" class="text-xl mt-0.5 flex-shrink-0" />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span
            class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            :style="{ backgroundColor: urgencyStyle.color, color: '#fff' }"
          >
            {{ urgencyLabel }}
          </span>
          <span class="text-[11px] text-dental-blue--2">
            Seit {{ recommendation.days_in_status }} Tag{{ recommendation.days_in_status === 1 ? '' : 'en' }} im Status
          </span>
        </div>
        <p class="text-sm font-medium text-dental-blue-0 leading-snug">
          {{ recommendation.reason }}
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="recommendation.actions.length" class="flex flex-wrap gap-2">
      <button
        v-for="(action, idx) in recommendation.actions"
        :key="idx"
        :class="[
          'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors',
          action.primary
            ? 'bg-dental-blue-0 text-white hover:bg-dental-blue-1 font-medium'
            : 'bg-white border border-dental-blue--5 text-dental-blue-0 hover:bg-dental-blue--6',
        ]"
        :title="action.hint"
        @click="$emit('action', action)"
      >
        <i :class="action.icon" class="text-xs" />
        {{ action.label }}
      </button>
    </div>
    <p v-else class="text-xs text-dental-blue--3 italic">
      Keine direkte Aktion empfohlen — beobachten.
    </p>
  </div>
</template>

<script setup lang="ts">
import { useNextBestAction, type NextBestActionResult, type NextBestAction, type ActionUrgency } from '../../composables/useNextBestAction'

const props = defineProps<{
  recommendation: NextBestActionResult
}>()

defineEmits<{
  action: [action: NextBestAction]
}>()

const { getUrgencyStyle } = useNextBestAction()

const urgencyStyle = computed(() => getUrgencyStyle(props.recommendation.urgency))

const URGENCY_LABELS: Record<ActionUrgency, string> = {
  low: 'Routine',
  medium: 'Fällig',
  high: 'Dringend',
  critical: 'Kritisch',
}
const urgencyLabel = computed(() => URGENCY_LABELS[props.recommendation.urgency])
</script>
