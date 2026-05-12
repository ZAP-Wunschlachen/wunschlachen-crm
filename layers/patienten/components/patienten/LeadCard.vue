<template>
  <div
    class="bg-white rounded-lg px-3.5 py-3 cursor-pointer hover:bg-[#ededed] transition-colors border border-dental-blue--5"
    @click="$emit('click', lead)"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-dental-blue-0 truncate-safe">
          {{ lead.first_name }} {{ lead.last_name }}
        </p>
        <p v-if="serviceName" class="text-xs text-dental-blue--2 mt-0.5">
          {{ serviceName }}
        </p>
      </div>
      <div class="flex items-center gap-1.5">
        <CrmLeadScoreBadge v-if="score != null" :score="score" />
        <CrmLeadStatusBadge :status="lead.status" />
      </div>
    </div>

    <div class="flex items-center gap-3 mt-2 text-[11px] text-dental-blue--3">
      <span v-if="lead.phone" class="flex items-center gap-1">
        <i class="pi pi-phone text-[10px]" />
        {{ lead.phone }}
      </span>
      <span v-if="lead.lead_source" class="flex items-center gap-1">
        <i :class="sourceConfig?.icon" class="text-[10px]" />
        {{ sourceConfig?.label }}
      </span>
    </div>

    <div v-if="lead.follow_up" class="mt-2">
      <span
        class="text-[10px] px-1.5 py-0.5 rounded-full"
        :class="isOverdue ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'"
      >
        Follow-up: {{ formatDate(lead.follow_up) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LEAD_SOURCE_CONFIG, type Lead } from '~/types/crm'

const props = defineProps<{ lead: Lead; score?: number | null }>()
defineEmits<{ click: [lead: Lead] }>()

const serviceName = computed(() => {
  if (typeof props.lead.dental_service === 'object' && props.lead.dental_service) {
    return props.lead.dental_service.name
  }
  return null
})

const sourceConfig = computed(() => {
  if (props.lead.lead_source) {
    return LEAD_SOURCE_CONFIG[props.lead.lead_source]
  }
  return null
})

const isOverdue = computed(() => {
  if (!props.lead.follow_up) return false
  return props.lead.follow_up <= new Date().toISOString().split('T')[0]
})

const formatDate = (date: string) => {
  try {
    return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })
  } catch { return date }
}
</script>
