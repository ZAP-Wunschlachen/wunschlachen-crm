<template>
  <span
    v-if="priority"
    class="inline-flex items-center gap-1 text-[11px] font-medium"
    :class="textClass"
  >
    <i class="pi pi-flag-fill text-[9px]" />
    {{ label }}
  </span>
  <span v-else class="text-[11px] text-gray-300">–</span>
</template>

<script setup lang="ts">
import type { Priority } from '~/types/crm'

const props = defineProps<{
  priority?: Priority | null
}>()

const label = computed(() => {
  switch (props.priority) {
    case 'high': return 'A'
    case 'medium': return 'B'
    case 'low': return 'C'
    default: return ''
  }
})

const textClass = computed(() => {
  switch (props.priority) {
    case 'high': return 'text-red-500'
    case 'medium': return 'text-amber-500'
    case 'low': return 'text-gray-400'
    default: return ''
  }
})
</script>
