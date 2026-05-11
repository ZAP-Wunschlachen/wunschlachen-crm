<template>
  <span v-if="date" class="inline-flex items-center gap-1 text-[12px] font-medium" :class="indicatorClass">
    <i v-if="isOverdue" class="pi pi-exclamation-circle text-[10px]" />
    {{ formattedDate }}
  </span>
  <span v-else class="text-[11px] text-gray-300">kein Datum</span>
</template>

<script setup lang="ts">
import { format, isToday, isPast, isTomorrow, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

const props = defineProps<{
  date?: string | null
}>()

const parsedDate = computed(() => props.date ? parseISO(props.date) : null)

const isOverdue = computed(() =>
  parsedDate.value && isPast(parsedDate.value) && !isToday(parsedDate.value)
)

const formattedDate = computed(() => {
  if (!parsedDate.value) return ''
  if (isToday(parsedDate.value)) return 'Heute'
  if (isTomorrow(parsedDate.value)) return 'Morgen'
  return format(parsedDate.value, 'dd. MMM', { locale: de })
})

const indicatorClass = computed(() => {
  if (!parsedDate.value) return ''
  if (isOverdue.value) return 'text-red-500'
  if (isToday(parsedDate.value)) return 'text-amber-600'
  return 'text-gray-500'
})
</script>
