<template>
  <div class="bg-white rounded-lg p-3 border border-dental-blue--5 hover:border-dental-blue--4 cursor-pointer transition-colors" @click="$emit('click')">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-dental-blue-0">{{ lead.first_name }} {{ lead.last_name }}</p>
        <p class="text-xs text-dental-blue--3">{{ getServiceName() }}</p>
      </div>
      <PatientenLeadStatusBadge :status="lead.status" />
    </div>
    <div class="flex items-center gap-3 mt-2">
      <span v-if="lead.phone" class="text-[10px] text-dental-blue--3">{{ lead.phone }}</span>
      <span v-if="lead.follow_up" class="text-[10px]" :class="isOverdue ? 'text-red-500' : 'text-dental-blue--3'">
        Follow-up: {{ formatDate(lead.follow_up) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Lead } from '~/types/crm'

const props = defineProps<{ lead: Lead }>()
defineEmits(['click'])

const getServiceName = () => {
  if (typeof props.lead.dental_service === 'object' && props.lead.dental_service) return props.lead.dental_service.name
  return ''
}

const isOverdue = computed(() => {
  if (!props.lead.follow_up) return false
  return props.lead.follow_up <= new Date().toISOString().split('T')[0]
})

const formatDate = (date: string) => {
  try { return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) }
  catch { return date }
}
</script>
