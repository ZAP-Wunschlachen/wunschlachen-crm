<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
      <p class="text-xs text-dental-blue--2 font-medium">Pipeline-Wert</p>
      <p class="text-2xl font-bold text-dental-blue-0 mt-1">{{ formatCurrency(kpis.pipelineValue) }}</p>
    </div>
    <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
      <p class="text-xs text-dental-blue--2 font-medium">Forecast</p>
      <p class="text-2xl font-bold text-dental-blue-0 mt-1">{{ formatCurrency(kpis.weightedForecast) }}</p>
    </div>
    <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
      <p class="text-xs text-dental-blue--2 font-medium">Umsatz</p>
      <p class="text-2xl font-bold text-green-600 mt-1">{{ formatCurrency(kpis.wonRevenue) }}</p>
    </div>
    <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
      <p class="text-xs text-dental-blue--2 font-medium">Conversion</p>
      <p class="text-2xl font-bold text-dental-blue-0 mt-1">{{ kpis.conversionRate }}%</p>
      <p class="text-[10px] text-dental-blue--3">{{ kpis.conversionCount.won }}/{{ kpis.conversionCount.total }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Lead } from '~/types/crm'

const props = defineProps<{ leads: Lead[] }>()

const { getKPIs } = usePipelineAnalytics()
const kpis = computed(() => getKPIs(props.leads))

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(v)
</script>
