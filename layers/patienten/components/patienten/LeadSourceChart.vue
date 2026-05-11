<template>
  <div class="bg-white rounded-lg border border-dental-blue--5 p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-dental-blue-0">Leads nach Quelle</h3>
      <select
        v-model="timeRange"
        class="text-xs border border-dental-blue--5 rounded-lg px-2 py-1 outline-none text-dental-blue--2"
        @change="loadData"
      >
        <option value="7">Letzte 7 Tage</option>
        <option value="30">Letzte 30 Tage</option>
        <option value="90">Letzte 90 Tage</option>
        <option value="365">Letztes Jahr</option>
        <option value="0">Gesamt</option>
      </select>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center h-[200px] text-dental-blue--3 text-sm">
      <i class="pi pi-spin pi-spinner mr-2" /> Laden...
    </div>

    <div v-else-if="chartData.length === 0" class="flex items-center justify-center h-[200px] text-dental-blue--3 text-sm">
      Keine Daten im Zeitraum
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Bar chart -->
      <v-chart :option="barOption" autoresize class="h-[220px]" />
      <!-- Pie chart -->
      <v-chart :option="pieOption" autoresize class="h-[220px]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { LEAD_SOURCE_CONFIG, type Lead, type LeadSource } from '~/types/crm'

use([BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const timeRange = ref('30')
const isLoading = ref(false)
const chartData = ref<Array<{ source: string; label: string; count: number }>>([])

const SOURCE_COLORS: Record<string, string> = {
  tiktok: '#000000',
  facebook: '#1877F2',
  instagram: '#E4405F',
  google: '#4285F4',
  bing: '#008373',
  referral: '#f97316',
}

const loadData = async () => {
  isLoading.value = true
  try {
    const { fetchLeads } = usePatientLeads()
    const allLeads = await fetchLeads({}, ['-date_created'], 1)

    // Client-side time filter
    const cutoff = timeRange.value !== '0'
      ? new Date(Date.now() - Number(timeRange.value) * 86400000).toISOString()
      : null

    const filtered = cutoff
      ? allLeads.filter((l: Lead) => l.date_created >= cutoff)
      : allLeads

    // Group by source
    const counts: Record<string, number> = {}
    for (const lead of filtered) {
      const src = lead.lead_source || 'unknown'
      counts[src] = (counts[src] || 0) + 1
    }

    chartData.value = Object.entries(counts).map(([source, count]) => ({
      source,
      label: LEAD_SOURCE_CONFIG[source as LeadSource]?.label || source,
      count,
    }))
  } catch {
    chartData.value = []
  } finally {
    isLoading.value = false
  }
}

const barOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 10, right: 10, top: 10, bottom: 30, containLabel: true },
  xAxis: {
    type: 'category',
    data: chartData.value.map(d => d.label),
    axisLabel: { fontSize: 10, color: '#64748b' },
  },
  yAxis: {
    type: 'value',
    axisLabel: { fontSize: 10, color: '#64748b' },
    splitLine: { lineStyle: { color: '#f1f5f9' } },
  },
  series: [{
    type: 'bar',
    data: chartData.value.map(d => ({
      value: d.count,
      itemStyle: { color: SOURCE_COLORS[d.source] || '#94a3b8', borderRadius: [4, 4, 0, 0] },
    })),
    barMaxWidth: 40,
  }],
}))

const pieOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['50%', '50%'],
    data: chartData.value.map(d => ({
      name: d.label,
      value: d.count,
      itemStyle: { color: SOURCE_COLORS[d.source] || '#94a3b8' },
    })),
    label: { fontSize: 10, color: '#334155' },
    emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' } },
  }],
}))

onMounted(loadData)
</script>
