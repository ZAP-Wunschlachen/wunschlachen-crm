<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-sm font-semibold text-dental-blue-0">Pipeline-Übersicht</h2>
      <CrmTimeRangeFilter v-model="activePreset" />
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
        <p class="text-xs text-dental-blue--2 font-medium">Pipeline-Wert</p>
        <p class="text-2xl font-bold text-dental-blue-0 mt-1">{{ formatCurrency(kpis.pipelineValue) }}</p>
        <p class="text-[10px] text-dental-blue--3 mt-0.5">Offene Leads</p>
      </div>
      <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
        <p class="text-xs text-dental-blue--2 font-medium">Gewichteter Forecast</p>
        <p class="text-2xl font-bold text-dental-blue-0 mt-1">{{ formatCurrency(kpis.weightedForecast) }}</p>
        <p class="text-[10px] text-dental-blue--3 mt-0.5">Nach Status gewichtet</p>
      </div>
      <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
        <p class="text-xs text-dental-blue--2 font-medium">Gewonnener Umsatz</p>
        <p class="text-2xl font-bold text-[#22c55e] mt-1">{{ formatCurrency(kpis.wonRevenue) }}</p>
        <p class="text-[10px] text-dental-blue--3 mt-0.5">{{ presetLabel }}</p>
      </div>
      <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
        <p class="text-xs text-dental-blue--2 font-medium">Conversion-Rate</p>
        <p class="text-2xl font-bold text-dental-blue-0 mt-1">{{ kpis.conversionRate }}%</p>
        <p class="text-[10px] text-dental-blue--3 mt-0.5">{{ kpis.conversionCount.won }} von {{ kpis.conversionCount.total }} abgeschlossen</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Lead } from '~/types/crm'
import type { DateRangePreset } from '~/types/analytics'

const props = defineProps<{ leads: Lead[] }>()

const { activePreset, dateRange, getKPIs } = usePipelineAnalytics()

const kpis = computed(() => getKPIs(props.leads, dateRange.value))

const presetLabel = computed(() => {
  switch (activePreset.value) {
    case 'month': return 'Dieser Monat'
    case 'quarter': return 'Dieses Quartal'
    case 'year': return 'Dieses Jahr'
  }
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
</script>
