<template>
  <div v-if="dueLeads.length > 0" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <i class="pi pi-refresh text-[14px] text-[#22c55e]" />
        <h3 class="text-[13px] font-semibold text-gray-800">Reaktivierungs-Warteschlange</h3>
      </div>
      <button
        v-if="dueLeads.length > 1"
        class="text-[10px] font-medium px-2 py-1 bg-[#22c55e] text-white rounded hover:bg-[#16a34a] transition-colors"
        :disabled="bulkRunning"
        @click="onBulkReactivate"
      >
        <i v-if="bulkRunning" class="pi pi-spin pi-spinner text-[9px] mr-1" />
        Alle {{ dueLeads.length }} reaktivieren
      </button>
    </div>

    <div class="p-4 space-y-2">
      <div
        v-for="entry in topDueLeads"
        :key="entry.lead.id"
        class="flex items-center justify-between gap-2 px-2 py-2 -mx-2 rounded hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center gap-2 min-w-0">
          <i class="pi pi-user text-[11px] text-gray-400 flex-shrink-0" />
          <div class="min-w-0">
            <NuxtLink
              :to="`/patienten/leads/${entry.lead.id}`"
              class="text-[12px] font-medium text-gray-800 hover:text-[#172774] truncate block"
            >
              {{ entry.lead.first_name }} {{ entry.lead.last_name }}
            </NuxtLink>
            <p class="text-[10px] text-gray-500">
              Lost {{ daysAgo(entry.lead) }} T · {{ getReasonLabel(entry.lead.lost_reason) }}
              → {{ entry.strategy.label }}
            </p>
          </div>
        </div>
        <button
          class="text-[11px] font-medium px-2 py-1 text-[#172774] border border-[#172774] rounded hover:bg-[#172774] hover:text-white transition-colors flex-shrink-0"
          :disabled="entry.running"
          @click="onReactivate(entry)"
        >
          <i v-if="entry.running" class="pi pi-spin pi-spinner text-[10px] mr-1" />
          Reaktivieren
        </button>
      </div>

      <p v-if="dueLeads.length > topDueLeads.length" class="text-[10px] text-gray-400 text-center pt-1">
        + {{ dueLeads.length - topDueLeads.length }} weitere
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LOST_REASON_LABELS, type Lead, type LostReason } from '~/types/crm'

const { fetchLeads } = usePatientLeads()
const { findDueReactivations, getStrategy, reactivate, reactivateAllDue } = useReactivationQueue()
const toast = useToast()

const leads = ref<Lead[]>([])
const bulkRunning = ref(false)
const runningIds = ref<Set<string>>(new Set())

const loadLeads = async () => {
  const result = await fetchLeads({}, ['-date_updated'], 1)
  leads.value = result || []
}
onMounted(loadLeads)

interface DueEntry {
  lead: Lead
  strategy: ReturnType<typeof getStrategy>
  running: boolean
}

const dueLeads = computed<DueEntry[]>(() => {
  return findDueReactivations(leads.value).map((lead) => ({
    lead,
    strategy: getStrategy(lead),
    running: runningIds.value.has(lead.id),
  }))
})

const topDueLeads = computed(() => dueLeads.value.slice(0, 5))

const daysAgo = (lead: Lead): number => {
  const ref = lead.last_status_change_at || lead.date_updated
  if (!ref) return 0
  return Math.floor((Date.now() - new Date(ref).getTime()) / (1000 * 60 * 60 * 24))
}

const getReasonLabel = (reason?: LostReason | string): string => {
  if (!reason) return 'unbekannt'
  return LOST_REASON_LABELS[reason as LostReason] || reason
}

const onReactivate = async (entry: DueEntry) => {
  runningIds.value.add(entry.lead.id)
  try {
    const result = await reactivate(entry.lead)
    if (result) {
      toast.add({
        severity: 'success',
        summary: 'Lead reaktiviert',
        detail: `${entry.lead.first_name} ${entry.lead.last_name} → contacting`,
      })
      await loadLeads()
    }
  } finally {
    runningIds.value.delete(entry.lead.id)
  }
}

const onBulkReactivate = async () => {
  if (!confirm(`${dueLeads.value.length} Lost-Leads jetzt alle reaktivieren?`)) return
  bulkRunning.value = true
  try {
    const result = await reactivateAllDue(leads.value)
    toast.add({
      severity: 'success',
      summary: `${result.reactivated_count} Leads reaktiviert`,
      detail: result.failed_count > 0 ? `${result.failed_count} Fehler` : 'Alle erfolgreich',
    })
    await loadLeads()
  } finally {
    bulkRunning.value = false
  }
}
</script>
