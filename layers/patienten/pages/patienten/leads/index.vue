<template>
  <div class="p-6 max-w-7xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-dental-blue-0">Leads</h1>
      <div class="flex items-center gap-2">
        <button
          class="px-4 py-2 text-sm font-medium text-dental-blue-0 border border-dental-blue--5 rounded-lg hover:bg-[#ededed] flex items-center gap-2"
          @click="handleExport"
        >
          <i class="pi pi-download text-xs" />
          Exportieren
        </button>
        <button
          class="px-5 py-2 text-sm font-semibold text-white bg-dental-blue-0 rounded-lg hover:bg-dental-blue-1 flex items-center gap-2"
          @click="showCreate = true"
        >
          <i class="pi pi-plus text-xs" />
          Neuer Lead
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-2 mb-4">
      <!-- Search -->
      <div class="relative">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-dental-blue--3 text-xs" />
        <input
          v-model="search"
          type="text"
          placeholder="Suchen..."
          class="pl-8 pr-3 py-1.5 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0 w-[200px]"
          @input="debouncedLoad"
        />
      </div>

      <!-- Status pills -->
      <button
        v-for="(cfg, key) in statusFilters"
        :key="key"
        class="px-2 py-1 rounded-2xl text-[10px] transition-colors"
        :class="activeStatus === key
          ? 'bg-dental-blue-0 text-white'
          : 'bg-white text-dental-blue-0 hover:bg-[#ededed] border border-dental-blue--5'"
        @click="toggleStatus(key as any)"
      >
        {{ cfg.label }}
      </button>

      <!-- Source filter -->
      <select
        v-model="activeSource"
        class="px-2 py-1.5 text-xs border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0"
        @change="() => { page = 1; loadLeads() }"
      >
        <option :value="null">Alle Quellen</option>
        <option v-for="(cfg, key) in LEAD_SOURCE_CONFIG" :key="key" :value="key">
          {{ cfg.label }}
        </option>
      </select>

      <!-- Sort buttons -->
      <div class="flex gap-1 ml-auto">
        <button
          class="px-2 py-1 rounded-2xl text-[10px] transition-colors"
          :class="sortMode === 'urgency'
            ? 'bg-dental-blue-0 text-white'
            : 'bg-white text-dental-blue-0 hover:bg-[#ededed] border border-dental-blue--5'"
          @click="sortMode = sortMode === 'urgency' ? 'default' : 'urgency'"
          title="Dringende Leads zuerst (NBA-Engine)"
        >
          <i class="pi pi-exclamation-triangle text-[10px] mr-1" />
          Dringend
        </button>
        <button
          class="px-2 py-1 rounded-2xl text-[10px] transition-colors"
          :class="sortMode === 'score'
            ? 'bg-dental-blue-0 text-white'
            : 'bg-white text-dental-blue-0 hover:bg-[#ededed] border border-dental-blue--5'"
          @click="sortMode = sortMode === 'score' ? 'default' : 'score'"
        >
          <i class="pi pi-sort-amount-down text-[10px] mr-1" />
          Score
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg border border-dental-blue--5 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-dental-blue--5">
            <th class="text-left px-2 py-3 text-xs font-medium text-dental-blue--2">!</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-dental-blue--2">Name</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-dental-blue--2">Status</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-dental-blue--2">Nächste Aktion</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-dental-blue--2">Score</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-dental-blue--2">Quelle</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-dental-blue--2">Follow-up</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="lead in displayLeads"
            :key="lead.id"
            class="border-b border-dental-blue--5 last:border-0 hover:bg-[#ededed] cursor-pointer transition-colors"
            @click="navigateTo(`/patienten/leads/${lead.id}`)"
          >
            <td class="px-2 py-3">
              <span
                class="inline-block w-2 h-2 rounded-full"
                :style="{ backgroundColor: getNbaForLead(lead).urgencyColor }"
                :title="getNbaForLead(lead).reason"
              />
            </td>
            <td class="px-4 py-3 font-medium text-dental-blue-0">{{ lead.first_name }} {{ lead.last_name }}</td>
            <td class="px-4 py-3"><PatientenLeadStatusBadge :status="lead.status" /></td>
            <td class="px-4 py-3 text-xs text-dental-blue--2 max-w-[280px] truncate" :title="getNbaForLead(lead).reason">
              {{ getNbaForLead(lead).primaryAction }}
            </td>
            <td class="px-4 py-3">
              <PatientenLeadScoreBadge v-if="getScore(lead.id) != null" :score="getScore(lead.id)!" />
              <span v-else class="text-xs text-dental-blue--3">—</span>
            </td>
            <td class="px-4 py-3 text-dental-blue--2 text-xs">{{ getSourceLabel(lead) }}</td>
            <td class="px-4 py-3 text-xs" :class="isOverdue(lead) ? 'text-red-500 font-medium' : 'text-dental-blue--3'">
              {{ lead.follow_up ? formatDate(lead.follow_up) : '—' }}
            </td>
          </tr>
          <tr v-if="displayLeads.length === 0">
            <td colspan="7" class="px-4 py-8 text-center text-dental-blue--3">Keine Leads gefunden</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-4">
      <button
        v-for="p in totalPages"
        :key="p"
        class="w-8 h-8 rounded-lg text-xs"
        :class="page === p ? 'bg-dental-blue-0 text-white' : 'text-dental-blue--2 hover:bg-[#ededed]'"
        @click="goToPage(p)"
      >
        {{ p }}
      </button>
    </div>

    <PatientenCreateLeadDialog v-model:visible="showCreate" @created="loadLeads" />
  </div>
</template>

<script setup lang="ts">
import { LEAD_STATUS_CONFIG, LEAD_SOURCE_CONFIG, type Lead, type LeadStatus, type LeadSource } from '~/types/crm'

definePageMeta({ layout: 'crm', middleware: ['auth'] })

const leads = ref<Lead[]>([])
const page = ref(1)
const total = ref(0)
const search = ref('')
const activeStatus = ref<LeadStatus | null>(null)
const activeSource = ref<LeadSource | null>(null)
const showCreate = ref(false)
type SortMode = 'default' | 'urgency' | 'score'
const sortMode = ref<SortMode>('default')

const limit = 25
const totalPages = computed(() => Math.ceil(total.value / limit))

const { scoreLeads } = useLeadScoring()
const { getAllActivities } = useLeadActivities()
const { exportLeads } = useExport()

const activitiesByLead = computed(() => {
  const map: Record<string, any[]> = {}
  for (const a of getAllActivities()) {
    if (!map[a.lead_id]) map[a.lead_id] = []
    map[a.lead_id].push(a)
  }
  return map
})

const scores = computed(() => scoreLeads(leads.value, activitiesByLead.value))

const getScore = (leadId: string): number | null => {
  return scores.value.get(leadId)?.total ?? null
}

// NBA pro Lead (memoisiert)
const { compute: computeNBA, getUrgencyStyle } = useNextBestAction()

interface LeadNbaInfo {
  urgency: import('../../../composables/useNextBestAction').ActionUrgency
  urgencyColor: string
  primaryAction: string
  reason: string
  urgencyRank: number
}

const URGENCY_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

const nbaCache = computed<Record<string, LeadNbaInfo>>(() => {
  const cache: Record<string, LeadNbaInfo> = {}
  for (const lead of leads.value) {
    const result = computeNBA(lead)
    const primary = result.actions.find((a) => a.primary) || result.actions[0]
    cache[lead.id] = {
      urgency: result.urgency,
      urgencyColor: getUrgencyStyle(result.urgency).color,
      primaryAction: primary?.label || 'Beobachten',
      reason: result.reason,
      urgencyRank: URGENCY_RANK[result.urgency] ?? 99,
    }
  }
  return cache
})

const getNbaForLead = (lead: any): LeadNbaInfo =>
  nbaCache.value[lead.id] || {
    urgency: 'low',
    urgencyColor: '#94a3b8',
    primaryAction: '—',
    reason: '',
    urgencyRank: 99,
  }

const displayLeads = computed(() => {
  if (sortMode.value === 'score') {
    return [...leads.value].sort((a, b) => (getScore(b.id) ?? 0) - (getScore(a.id) ?? 0))
  }
  if (sortMode.value === 'urgency') {
    return [...leads.value].sort(
      (a, b) => getNbaForLead(a).urgencyRank - getNbaForLead(b).urgencyRank,
    )
  }
  return leads.value
})

const statusFilters = {
  new: { label: 'Neu' },
  contacting: { label: 'In Erreichung' },
  contacted: { label: 'Erreicht' },
  consultation_scheduled: { label: 'Beratung geplant' },
  hkp_sent: { label: 'HKP versandt' },
  hkp_signed: { label: 'HKP unterschrieben' },
  treatment_scheduled: { label: 'Behandlung geplant' },
  treatment_in_progress: { label: 'In Behandlung' },
  completed: { label: 'Abgeschlossen' },
  lost: { label: 'Verloren' },
}

const toggleStatus = (status: LeadStatus) => {
  activeStatus.value = activeStatus.value === status ? null : status
  page.value = 1
  loadLeads()
}

// (sortMode wird inline gesetzt — kein Toggle nötig)

let debounceTimer: ReturnType<typeof setTimeout>
const debouncedLoad = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; loadLeads() }, 300)
}

const loadLeads = async () => {
  const { fetchLeads, fetchLeadCount, pagination } = usePatientLeads()
  pagination.value.limit = limit

  const filters = {
    search: search.value || undefined,
    status: activeStatus.value,
    lead_source: activeSource.value,
  }

  const [result] = await Promise.all([
    fetchLeads(filters, ['-date_updated'], page.value),
    fetchLeadCount(filters),
  ])

  leads.value = result
  total.value = pagination.value.total
}

const handleExport = () => {
  exportLeads(displayLeads.value, `leads-${new Date().toISOString().split('T')[0]}`)
}

const goToPage = (p: number) => { page.value = p; loadLeads() }

const getServiceName = (lead: Lead) => {
  if (typeof lead.dental_service === 'object' && lead.dental_service) return lead.dental_service.name
  return '—'
}

const getSourceLabel = (lead: Lead) => {
  if (lead.lead_source) return LEAD_SOURCE_CONFIG[lead.lead_source]?.label || lead.lead_source
  return '—'
}

const isOverdue = (lead: Lead) => {
  if (!lead.follow_up) return false
  return lead.follow_up <= new Date().toISOString().split('T')[0]
}

const formatDate = (date: string) => {
  try { return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }) }
  catch { return date }
}

onMounted(loadLeads)
</script>
