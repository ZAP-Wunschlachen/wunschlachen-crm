<template>
  <div class="flex gap-3 overflow-x-auto pb-4">
    <div v-for="(cfg, status) in LEAD_STATUS_CONFIG" :key="status" class="flex-shrink-0 w-64">
      <div class="bg-dental-blue--5 rounded-lg p-2">
        <p class="text-xs font-semibold text-dental-blue-0 mb-2 px-1">{{ cfg.label }} ({{ getLeadsByStatus(status).length }})</p>
        <div class="space-y-2 min-h-[100px]">
          <div
            v-for="lead in getLeadsByStatus(status)"
            :key="lead.id"
            class="bg-white rounded-lg p-2.5 border border-dental-blue--5 cursor-pointer hover:border-dental-blue--4"
            @click="$emit('select', lead)"
          >
            <p class="text-xs font-medium text-dental-blue-0 truncate">{{ lead.first_name }} {{ lead.last_name }}</p>
            <p v-if="lead.oportunity_value" class="text-[10px] text-dental-blue--3 mt-0.5">{{ formatCurrency(lead.oportunity_value) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LEAD_STATUS_CONFIG, type Lead, type LeadStatus } from '~/types/crm'

const props = defineProps<{ leads: Lead[] }>()
defineEmits(['select', 'status-change'])

const getLeadsByStatus = (status: string) => props.leads.filter(l => l.status === status)

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(v)
</script>
