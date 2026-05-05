<template>
  <span
    class="inline-flex items-center gap-1 px-1.5 py-[2px] rounded text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
    :style="{ backgroundColor: bgColor, color: textColor }"
  >
    <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: textColor }" />
    {{ stageLabel }}
  </span>
</template>

<script setup lang="ts">
const STAGE_COLORS: Record<string, string> = {
  'Unqualified': '#6b7280',
  'Qualified': '#3b82f6',
  'Follow-up': '#f59e0b',
  'Email': '#8b5cf6',
  'Presentation': '#10b981',
  'Emergency': '#ef4444',
  'Emergency Phone': '#ef4444',
  'Further Education': '#06b6d4',
  'Won': '#22c55e',
  'Lost': '#ef4444',
  'Cancelled': '#9ca3af',
}

const props = defineProps<{
  stage: string
}>()

const bgColor = computed(() => (STAGE_COLORS[props.stage] || '#6b7280') + '15')
const textColor = computed(() => STAGE_COLORS[props.stage] || '#6b7280')

const stageLabel = computed(() => {
  const labels: Record<string, string> = {
    'Unqualified': 'Unqual.',
    'Qualified': 'Qual.',
    'Follow-up': 'Follow-up',
    'Email': 'Email',
    'Presentation': 'Proposal',
    'Emergency Phone': 'Notfall-Tel.',
    'Further Education': 'Nego.',
    'Won': 'Won',
    'Lost': 'Lost',
    'Cancelled': 'Cancel',
  }
  return labels[props.stage] || props.stage
})
</script>
