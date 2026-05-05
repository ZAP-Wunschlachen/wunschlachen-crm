<template>
  <div class="flex items-center gap-2">
    <span class="w-2 h-2 rounded-full" :class="dotClass" />
    <span class="text-xs font-medium" :class="textClass">{{ result.label }}</span>
  </div>
</template>

<script setup lang="ts">
import type { ResponseTimeResult } from '~/types/analytics'

const props = defineProps<{ result: ResponseTimeResult }>()

const dotClass = computed(() => {
  const map: Record<string, string> = { green: 'bg-green-400', yellow: 'bg-amber-400', red: 'bg-red-400', gray: 'bg-gray-300' }
  return map[props.result.color] || 'bg-gray-300'
})

const textClass = computed(() => {
  const map: Record<string, string> = { green: 'text-green-600', yellow: 'text-amber-600', red: 'text-red-500', gray: 'text-dental-blue--3' }
  return map[props.result.color] || 'text-dental-blue--3'
})
</script>
