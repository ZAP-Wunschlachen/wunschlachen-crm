<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <i class="pi pi-exclamation-triangle text-[14px] text-[#f97316]" />
        <h3 class="text-[13px] font-semibold text-gray-800">Heute zu erledigen</h3>
      </div>
      <NuxtLink to="/patienten/leads" class="text-[11px] font-medium text-[#172774] hover:underline">
        Liste öffnen →
      </NuxtLink>
    </div>

    <div v-if="loading" class="p-4 text-center text-sm text-gray-400">
      <i class="pi pi-spin pi-spinner" />
    </div>
    <div v-else-if="totalLeads === 0" class="p-4 text-center text-[12px] text-gray-400 italic">
      Keine Patient-Leads vorhanden.
    </div>
    <div v-else class="p-4 space-y-3">
      <!-- Kritisch + Dringend (Hauptmetrik) -->
      <NuxtLink
        :to="`/patienten/leads?sort=urgency`"
        class="block bg-red-50 border border-red-200 rounded-lg p-3 hover:bg-red-100 transition-colors"
      >
        <div class="flex items-baseline justify-between">
          <span class="text-2xl font-bold text-red-700 tabular-nums">{{ urgentCount }}</span>
          <span class="text-[10px] text-red-600">Dringend</span>
        </div>
        <p class="text-[11px] text-red-600 mt-0.5">
          {{ criticalCount }} kritisch · {{ highCount }} hoch
        </p>
      </NuxtLink>

      <!-- Breakdown nach Urgency-Level -->
      <div class="grid grid-cols-2 gap-2">
        <div class="bg-blue-50 border border-blue-200 rounded-md px-2.5 py-2 text-center">
          <div class="text-lg font-semibold text-blue-700 tabular-nums">{{ mediumCount }}</div>
          <div class="text-[10px] text-blue-600">Fällig</div>
        </div>
        <div class="bg-green-50 border border-green-200 rounded-md px-2.5 py-2 text-center">
          <div class="text-lg font-semibold text-green-700 tabular-nums">{{ lowCount }}</div>
          <div class="text-[10px] text-green-600">Routine</div>
        </div>
      </div>

      <!-- Top 3 dringende Leads -->
      <div v-if="topUrgent.length" class="mt-3 pt-3 border-t border-gray-100">
        <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Top 3 dringend
        </p>
        <ul class="space-y-1.5">
          <li v-for="item in topUrgent" :key="item.lead.id">
            <NuxtLink
              :to="`/patienten/leads/${item.lead.id}`"
              class="flex items-center justify-between gap-2 px-2 py-1.5 -mx-2 rounded hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span
                  class="inline-block w-2 h-2 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: item.urgencyColor }"
                />
                <span class="text-[12px] font-medium text-gray-800 truncate">
                  {{ item.lead.first_name }} {{ item.lead.last_name }}
                </span>
              </div>
              <span class="text-[10px] text-gray-500 truncate max-w-[140px]" :title="item.reason">
                {{ item.primaryAction }}
              </span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Lead } from '~/types/crm'

const { fetchLeads } = usePatientLeads()
const { compute, getUrgencyStyle } = useNextBestAction()

const leads = ref<Lead[]>([])
const loading = ref(true)

interface UrgencyEntry {
  lead: Lead
  urgency: import('../../composables/useNextBestAction').ActionUrgency
  urgencyColor: string
  primaryAction: string
  reason: string
  rank: number
}

const URGENCY_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

const evaluated = computed<UrgencyEntry[]>(() => {
  return leads.value
    .filter((l) => l.status !== 'lost' && l.status !== 'completed') // nur aktive
    .map((lead) => {
      const result = compute(lead)
      const primary = result.actions.find((a) => a.primary) || result.actions[0]
      return {
        lead,
        urgency: result.urgency,
        urgencyColor: getUrgencyStyle(result.urgency).color,
        primaryAction: primary?.label || '—',
        reason: result.reason,
        rank: URGENCY_RANK[result.urgency] ?? 99,
      }
    })
    .sort((a, b) => a.rank - b.rank)
})

const totalLeads = computed(() => leads.value.length)
const criticalCount = computed(() => evaluated.value.filter((e) => e.urgency === 'critical').length)
const highCount = computed(() => evaluated.value.filter((e) => e.urgency === 'high').length)
const mediumCount = computed(() => evaluated.value.filter((e) => e.urgency === 'medium').length)
const lowCount = computed(() => evaluated.value.filter((e) => e.urgency === 'low').length)
const urgentCount = computed(() => criticalCount.value + highCount.value)

const topUrgent = computed(() =>
  evaluated.value.filter((e) => e.urgency === 'critical' || e.urgency === 'high').slice(0, 3),
)

onMounted(async () => {
  loading.value = true
  try {
    const result = await fetchLeads({}, ['-date_updated'], 1)
    leads.value = result || []
  } finally {
    loading.value = false
  }
})
</script>
