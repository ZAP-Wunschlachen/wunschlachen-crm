<template>
  <div class="inline-flex rounded-lg border border-dental-blue--5 overflow-hidden">
    <button
      v-for="option in options"
      :key="option.value"
      class="px-3 py-1.5 text-xs font-medium transition-colors"
      :class="modelValue === option.value
        ? 'bg-dental-blue-0 text-white'
        : 'bg-white text-dental-blue--2 hover:bg-[#ededed]'"
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { DateRangePreset } from '~/types/analytics'

defineProps<{ modelValue: DateRangePreset }>()
defineEmits<{ 'update:modelValue': [value: DateRangePreset] }>()

const options: { value: DateRangePreset; label: string }[] = [
  { value: 'month', label: 'Monat' },
  { value: 'quarter', label: 'Quartal' },
  { value: 'year', label: 'Jahr' },
]
</script>
