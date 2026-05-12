<template>
  <div class="bg-white rounded-lg border border-dental-blue--5 p-4">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-semibold text-dental-blue-0">Reaktivierung fällig</h3>
        <span
          v-if="inactiveCount > 0"
          class="text-[10px] font-medium min-w-[20px] px-1.5 py-0.5 rounded-full bg-power-red-0/10 text-power-red-0 text-center"
        >
          {{ inactiveCount }}
        </span>
      </div>
      <span class="text-[10px] text-dental-blue--3">
        Schwelle: {{ config.thresholdDays }} Tage
      </span>
    </div>

    <div v-if="isLoading" class="py-6 text-center text-sm text-dental-blue--3">
      <i class="pi pi-spin pi-spinner mr-1" /> Laden...
    </div>

    <div v-else-if="inactiveLeads.length === 0" class="py-6 text-center text-sm text-dental-blue--3">
      Keine Reaktivierungen fällig
    </div>

    <div v-else class="space-y-2 max-h-[300px] overflow-y-auto">
      <div
        v-for="item in inactiveLeads.slice(0, 10)"
        :key="item.lead.id"
        class="flex items-center justify-between p-2 rounded-lg hover:bg-[#ededed] cursor-pointer transition-colors"
        @click="navigateTo(`/crm/leads/${item.lead.id}`)"
      >
        <div class="min-w-0">
          <p class="text-sm font-medium text-dental-blue-0 truncate">
            {{ item.lead.first_name }} {{ item.lead.last_name }}
          </p>
          <p class="text-[10px] text-dental-blue--3">
            Letzter Kontakt:
            {{ item.lastActivityDate ? formatDate(item.lastActivityDate) : 'Kein Kontakt' }}
            · {{ item.daysSinceActivity }} Tage
          </p>
        </div>
        <button
          class="flex-shrink-0 text-[10px] px-2 py-1 rounded-lg bg-dental-blue-0/10 text-dental-blue-0 hover:bg-dental-blue-0/20 transition-colors"
          @click.stop="startReactivation(item.lead)"
        >
          <i class="pi pi-replay text-[10px] mr-1" />
          Reaktivieren
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Lead } from '~/types/crm'

const { config, inactiveLeads, inactiveCount, isLoading, fetchInactiveLeads } = useReactivation()

const formatDate = (date: string) => {
  try {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    })
  } catch {
    return date
  }
}

const startReactivation = (lead: Lead) => {
  // Navigate to workflows page with reactivation context
  // The workflow system from Sub-Projekt B will pick up the lead
  navigateTo({
    path: '/crm/workflows',
    query: { action: 'reactivate', leadId: lead.id },
  })
}

onMounted(() => fetchInactiveLeads())
</script>
