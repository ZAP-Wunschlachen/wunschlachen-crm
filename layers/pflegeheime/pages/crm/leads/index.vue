<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <h2 class="text-[14px] font-semibold text-gray-800">Leads</h2>
        <span v-if="totalCount > 0" class="text-[11px] text-gray-400 tabular-nums">{{ totalCount }}</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="hasActiveFilters"
          @click="saveViewDialogVisible = true"
          class="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-[#172774] bg-white border border-[#172774]/30 rounded-md hover:bg-[#172774]/5 transition-colors"
        >
          <i class="pi pi-bookmark text-[10px]" />
          Ansicht speichern
        </button>
        <button
          @click="exportCsv"
          class="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-gray-500 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <i class="pi pi-download text-[10px]" />
          Export
        </button>
        <button
          @click="createLeadDialogVisible = true"
          class="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-white bg-[#172774] rounded-md hover:bg-[#3d4a8e] transition-colors"
        >
          <i class="pi pi-plus text-[10px]" />
          Lead erstellen
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-2 mb-3">
      <div class="relative flex-1 min-w-[180px] max-w-xs">
        <i class="pi pi-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Name, Stadt, PLZ..."
          class="w-full pl-7 pr-3 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40 transition-all"
          @input="debouncedSearch"
        />
      </div>
      <select
        v-model="stageFilter"
        class="px-2 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30"
        @change="loadLeads(1)"
      >
        <option :value="null">Alle Stages</option>
        <option v-for="stage in PIPELINE_STAGES" :key="stage" :value="stage">{{ stage }}</option>
      </select>
      <select
        v-model="priorityFilter"
        class="px-2 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30"
        @change="loadLeads(1)"
      >
        <option :value="null">Alle Prioritäten</option>
        <option value="high">A (100+ Betten)</option>
        <option value="medium">B (50–100 Betten)</option>
        <option value="low">C (0–50 Betten)</option>
      </select>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg border border-gray-200/80 overflow-hidden">
      <table class="w-full text-[12px]">
        <thead>
          <tr class="border-b border-gray-100 bg-gray-50/60">
            <th
              v-for="col in columns"
              :key="col.key"
              class="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none transition-colors"
              @click="col.sortable && toggleSort(col.sortKey)"
            >
              <div class="flex items-center gap-0.5">
                {{ col.label }}
                <i v-if="col.sortable" :class="sortIcon(col.sortKey)" class="text-[8px]" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody v-if="loading">
          <tr><td :colspan="columns.length" class="text-center py-10 text-gray-300"><i class="pi pi-spin pi-spinner" /></td></tr>
        </tbody>
        <tbody v-else-if="leads.length === 0">
          <tr><td :colspan="columns.length" class="text-center py-10 text-gray-400">Keine Leads gefunden</td></tr>
        </tbody>
        <tbody v-else>
          <tr
            v-for="lead in leads"
            :key="lead.id"
            class="border-b border-gray-50 hover:bg-[#172774]/[0.02] cursor-pointer transition-colors"
            @click="navigateTo(`/crm/leads/${lead.id}`)"
          >
            <td class="px-3 py-2">
              <span class="font-medium text-gray-900">{{ getNursingHomeName(lead) }}</span>
              <span class="text-[11px] text-gray-400 ml-1.5">{{ getNursingHomeLocation(lead) }}</span>
            </td>
            <td class="px-3 py-2"><CrmLeadStatusBadge :stage="lead.opportunity_stage" /></td>
            <td class="px-3 py-2"><CrmPriorityBadge :priority="lead.priority" /></td>
            <td class="px-3 py-2 text-gray-500 tabular-nums">{{ getNursingHomeCapacity(lead) || '–' }}</td>
            <td class="px-3 py-2"><CrmFollowUpIndicator :date="lead.follow_up_date" /></td>
            <td class="px-3 py-2 text-[11px] text-gray-400 tabular-nums">{{ formatDate(lead.date_updated) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-3 py-2 border-t border-gray-100 bg-gray-50/40">
        <div class="flex items-center gap-2">
          <p class="text-[11px] text-gray-400 tabular-nums">{{ currentPage }} / {{ totalPages }}</p>
          <select
            :value="pagination.limit"
            class="px-1.5 py-0.5 text-[11px] text-gray-500 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#172774]/30"
            @change="changePageSize(Number(($event.target as HTMLSelectElement).value))"
          >
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
            <option :value="250">250</option>
          </select>
          <span class="text-[11px] text-gray-400">pro Seite</span>
        </div>
        <div class="flex gap-1">
          <button
            :disabled="currentPage <= 1"
            class="px-2 py-0.5 text-[11px] rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            @click="loadLeads(currentPage - 1)"
          >←</button>
          <button
            :disabled="currentPage >= totalPages"
            class="px-2 py-0.5 text-[11px] rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            @click="loadLeads(currentPage + 1)"
          >→</button>
        </div>
      </div>
    </div>

    <!-- Active Smart View banner -->
    <div v-if="activeSmartView" class="mt-3 flex items-center gap-2 px-3 py-2 bg-[#172774]/5 border border-[#172774]/20 rounded-lg">
      <i :class="activeSmartView.icon || 'pi pi-filter'" class="text-[12px] text-[#172774]" />
      <span class="text-[12px] text-[#172774] font-medium">{{ activeSmartView.name }}</span>
      <button
        class="ml-auto text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
        @click="clearSmartView"
      >
        <i class="pi pi-times text-[10px]" />
        Filter zurücksetzen
      </button>
    </div>

    <!-- Save View Dialog -->
    <CrmSaveViewDialog
      v-model:visible="saveViewDialogVisible"
      :filters="currentFilters"
      @saved="handleViewSaved"
    />

    <CrmCreateLeadDialog
      v-model:visible="createLeadDialogVisible"
      @saved="handleLeadCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { PIPELINE_STAGES } from '~/types/crm'
import type { NursingHomeLead, OpportunityStage, Priority } from '~/types/crm'

definePageMeta({ layout: 'crm', middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { leads, pagination, fetchLeads, fetchLeadCount, isLoading } = usePflegeheimLeads()
const { smartViews, fetchSmartViews } = useSmartViews()

const searchQuery = ref('')
const stageFilter = ref<OpportunityStage | null>(null)
const priorityFilter = ref<Priority | null>(null)
const followUpDue = ref(false)
const noActivityDays = ref(0)
const sortField = ref('date_updated')
const sortOrder = ref<'asc' | 'desc'>('desc')
const loading = ref(false)
const saveViewDialogVisible = ref(false)
const createLeadDialogVisible = ref(false)

const hasActiveFilters = computed(() =>
  !!searchQuery.value || !!stageFilter.value || !!priorityFilter.value || followUpDue.value || noActivityDays.value > 0
)

const currentFilters = computed(() => ({
  search: searchQuery.value || undefined,
  stage: stageFilter.value || undefined,
  priority: priorityFilter.value || undefined,
}))

// Default smart views (matching SmartViewSidebar defaults)
const defaultSmartViews = [
  { id: '_hot', name: 'Heiße Leads', filters: { priority: 'high' }, icon: 'pi pi-bolt' },
  { id: '_followup', name: 'Follow-up fällig', filters: { follow_up_due: true }, icon: 'pi pi-clock' },
  { id: '_inactive', name: 'Ohne Aktivität', filters: { no_activity_days: 14 }, icon: 'pi pi-exclamation-triangle' },
]

const activeSmartView = computed(() => {
  const viewId = route.query.view as string
  if (!viewId) return null
  // Check default views first
  const defaultView = defaultSmartViews.find(v => v.id === viewId)
  if (defaultView) return defaultView
  return smartViews.value.find(v => v.id === viewId) || null
})

const clearSmartView = () => {
  searchQuery.value = ''
  stageFilter.value = null
  priorityFilter.value = null
  followUpDue.value = false
  noActivityDays.value = 0
  router.replace({ query: {} })
  loadLeads(1)
}

const applySmartView = (view: any) => {
  // Reset all filters first
  searchQuery.value = ''
  stageFilter.value = null
  priorityFilter.value = null
  followUpDue.value = false
  noActivityDays.value = 0

  if (view.filters?.search) searchQuery.value = view.filters.search
  if (view.filters?.stage) stageFilter.value = view.filters.stage
  if (view.filters?.priority) priorityFilter.value = view.filters.priority as Priority
  if (view.filters?.follow_up_due) followUpDue.value = true
  if (view.filters?.no_activity_days) noActivityDays.value = view.filters.no_activity_days
  loadLeads(1)
}

const handleViewSaved = () => {
  fetchSmartViews()
}

const handleLeadCreated = (leadId: string) => {
  navigateTo(`/crm/leads/${leadId}`)
}

const columns = [
  { key: 'name', label: 'Pflegeheim', sortable: true, sortKey: 'nursing_home_id.name' },
  { key: 'stage', label: 'Stage', sortable: true, sortKey: 'opportunity_stage' },
  { key: 'priority', label: 'Prio', sortable: true, sortKey: 'priority' },
  { key: 'capacity', label: 'Betten', sortable: true, sortKey: 'nursing_home_id.total_capacity' },
  { key: 'followup', label: 'Follow-up', sortable: true, sortKey: 'follow_up_date' },
  { key: 'updated', label: 'Update', sortable: true, sortKey: 'date_updated' },
]

const currentPage = computed(() => pagination.value.page)
const totalCount = ref(0)
const totalPages = computed(() => Math.ceil(totalCount.value / pagination.value.limit))

const getNursingHomeName = (lead: NursingHomeLead) => {
  if (typeof lead.nursing_home_id === 'object' && lead.nursing_home_id) return lead.nursing_home_id.name || '–'
  return '–'
}
const getNursingHomeLocation = (lead: NursingHomeLead) => {
  if (typeof lead.nursing_home_id === 'object' && lead.nursing_home_id) {
    return [lead.nursing_home_id.zip, lead.nursing_home_id.city].filter(Boolean).join(' ')
  }
  return ''
}
const getNursingHomeCapacity = (lead: NursingHomeLead) => {
  if (typeof lead.nursing_home_id === 'object' && lead.nursing_home_id) return lead.nursing_home_id.total_capacity
  return null
}
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '–'
  try { return format(parseISO(dateStr), 'dd.MM.yy', { locale: de }) } catch { return '–' }
}

const toggleSort = (field: string) => {
  if (sortField.value === field) { sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc' }
  else { sortField.value = field; sortOrder.value = 'asc' }
  loadLeads(1)
}
const sortIcon = (field: string) => {
  if (sortField.value !== field) return 'pi pi-sort-alt'
  return sortOrder.value === 'asc' ? 'pi pi-sort-amount-up' : 'pi pi-sort-amount-down'
}

const changePageSize = (size: number) => {
  pagination.value.limit = size
  loadLeads(1)
}

const buildFilters = () => ({
  search: searchQuery.value || undefined,
  stage: stageFilter.value,
  priority: priorityFilter.value,
  followUpDue: followUpDue.value || undefined,
  noActivityDays: noActivityDays.value || undefined,
})

const loadLeads = async (page: number = 1) => {
  loading.value = true
  try {
    const sortPrefix = sortOrder.value === 'desc' ? '-' : ''
    const filters = buildFilters()
    await Promise.all([
      fetchLeads(filters, [`${sortPrefix}${sortField.value}`], page),
      fetchLeadCount(filters).then(c => { totalCount.value = c }),
    ])
  } finally { loading.value = false }
}

let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => loadLeads(1), 300) }

const exportCsv = () => {
  if (leads.value.length === 0) return
  const headers = ['Pflegeheim', 'Stadt', 'PLZ', 'Stage', 'Priorität', 'Follow-up', 'Betten', 'Aktualisiert']
  const rows = leads.value.map(lead => [
    getNursingHomeName(lead),
    typeof lead.nursing_home_id === 'object' ? lead.nursing_home_id?.city || '' : '',
    typeof lead.nursing_home_id === 'object' ? lead.nursing_home_id?.zip || '' : '',
    lead.opportunity_stage, lead.priority || '', lead.follow_up_date || '',
    getNursingHomeCapacity(lead) || '', lead.date_updated || '',
  ])
  const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `leads_${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click()
  URL.revokeObjectURL(url)
}

// Watch for smart view changes (query param)
watch(() => route.query.view, (viewId) => {
  if (!viewId) {
    // No view selected — clear filters
    searchQuery.value = ''
    stageFilter.value = null
    priorityFilter.value = null
    followUpDue.value = false
    noActivityDays.value = 0
    loadLeads(1)
    return
  }
  const view = defaultSmartViews.find(v => v.id === viewId)
    || smartViews.value.find(v => v.id === viewId)
  if (view) applySmartView(view)
})

onMounted(async () => {
  try { await fetchSmartViews() } catch {}
  // Apply smart view if specified in URL
  if (route.query.view) {
    const view = defaultSmartViews.find(v => v.id === route.query.view)
      || smartViews.value.find(v => v.id === route.query.view)
    if (view) {
      applySmartView(view)
      return
    }
  }
  loadLeads()
})
</script>
