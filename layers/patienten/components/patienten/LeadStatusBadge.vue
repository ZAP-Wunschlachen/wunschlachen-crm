<template>
  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium" :class="badgeClass">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { LEAD_STATUS_CONFIG, type LeadStatus } from '~/types/crm'

const props = defineProps<{ status: LeadStatus }>()

const label = computed(() => LEAD_STATUS_CONFIG[props.status]?.label || props.status)
const badgeClass = computed(() => LEAD_STATUS_CONFIG[props.status]?.badgeClass || 'bg-gray-100 text-gray-600')
</script>
