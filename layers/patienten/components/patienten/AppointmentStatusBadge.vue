<template>
  <span
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
    :style="{ color: config.color, backgroundColor: config.bgColor }"
  >
    <i :class="config.icon" class="text-[8px]" />
    {{ config.label }}
  </span>
</template>

<script setup lang="ts">
import { ATTENDANCE_STATUS_CONFIG, type AttendanceStatus } from '~/types/appointments'

const props = defineProps<{
  status: AttendanceStatus
}>()

const config = computed(() => ATTENDANCE_STATUS_CONFIG[props.status] || ATTENDANCE_STATUS_CONFIG.scheduled)
</script>
