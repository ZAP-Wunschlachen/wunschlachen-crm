<template>
  <div class="p-6 max-w-7xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-dental-blue-0">Marketing</h1>
    </div>

    <!-- Pipeline KPIs -->
    <PatientenPipelineKPIs :leads="allLeads" />

    <!-- Speed to Lead -->
    <div class="mt-6">
      <PatientenSpeedToLeadKpi />
    </div>

    <!-- Lead Source Distribution -->
    <div class="mt-6 bg-white rounded-lg p-4 border border-dental-blue--5">
      <h2 class="text-sm font-semibold text-dental-blue-0 mb-3">Lead-Quellen</h2>
      <div class="space-y-2">
        <div v-for="(count, source) in sourceCounts" :key="source" class="flex items-center justify-between">
          <span class="text-xs text-dental-blue-0">{{ source }}</span>
          <div class="flex items-center gap-2">
            <div class="w-32 h-2 bg-dental-blue--5 rounded-full overflow-hidden">
              <div class="h-full bg-dental-blue-0 rounded-full" :style="{ width: `${(count / maxSourceCount) * 100}%` }" />
            </div>
            <span class="text-xs text-dental-blue--3 w-8 text-right">{{ count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Reactivation -->
    <div class="mt-6">
      <PatientenReactivationList />
    </div>
  </div>
</template>

<script setup lang="ts">
import { LEAD_SOURCE_CONFIG, type Lead } from '~/types/crm'

definePageMeta({ layout: 'crm', middleware: ['auth'] })

const allLeads = ref<Lead[]>([])

const sourceCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const lead of allLeads.value) {
    const source = lead.lead_source
      ? (LEAD_SOURCE_CONFIG[lead.lead_source]?.label || lead.lead_source)
      : 'Unbekannt'
    counts[source] = (counts[source] || 0) + 1
  }
  return counts
})

const maxSourceCount = computed(() => Math.max(...Object.values(sourceCounts.value), 1))

onMounted(async () => {
  const { fetchLeads, pagination } = useLeads()
  pagination.value.limit = 500
  allLeads.value = await fetchLeads({}, ['-date_created'], 1)
})
</script>
