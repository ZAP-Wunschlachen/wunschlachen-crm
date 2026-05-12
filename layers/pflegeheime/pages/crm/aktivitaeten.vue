<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-[16px] font-semibold text-gray-900">Aktivitäten</h2>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3 mb-4">
      <!-- Search -->
      <div class="relative flex-1 max-w-xs">
        <i class="pi pi-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]" />
        <input
          v-model="search"
          type="text"
          placeholder="Suchen..."
          class="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
          @input="debouncedFetch"
        />
      </div>
      <!-- Type filter -->
      <select
        v-model="typeFilter"
        class="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
        @change="loadActivities"
      >
        <option :value="null">Alle Typen</option>
        <option v-for="t in ACTIVITY_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-16">
      <i class="pi pi-spin pi-spinner text-xl text-gray-300" />
    </div>

    <!-- Empty -->
    <div v-else-if="activities.length === 0" class="text-center py-16">
      <i class="pi pi-history text-3xl text-gray-200 mb-3" />
      <p class="text-[13px] text-gray-400">Keine Aktivitäten gefunden</p>
    </div>

    <!-- Activities table -->
    <div v-else class="bg-white rounded-lg border border-gray-200/80 overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Typ</th>
            <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Betreff</th>
            <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Lead</th>
            <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ergebnis</th>
            <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Benutzer</th>
            <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Datum</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="activity in activities"
            :key="activity.id"
            class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
            @click="navigateToLead(activity)"
          >
            <td class="px-4 py-2.5">
              <CrmActivityIcon :type="activity.type" />
            </td>
            <td class="px-4 py-2.5">
              <p class="text-[12px] font-medium text-gray-800 truncate max-w-[250px]">{{ activity.subject }}</p>
              <p v-if="activity.content" class="text-[10px] text-gray-400 truncate max-w-[250px] mt-0.5">{{ activity.content }}</p>
            </td>
            <td class="px-4 py-2.5">
              <span class="text-[11px] text-gray-600">{{ leadName(activity) }}</span>
            </td>
            <td class="px-4 py-2.5">
              <span
                v-if="activity.outcome"
                class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                :class="outcomeClass(activity.outcome)"
              >
                {{ outcomeLabel(activity.outcome) }}
              </span>
              <span v-else class="text-[10px] text-gray-300">–</span>
            </td>
            <td class="px-4 py-2.5 text-[11px] text-gray-500">{{ userName(activity) }}</td>
            <td class="px-4 py-2.5 text-[11px] text-gray-400">{{ formatDate(activity.date_created) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import type { CrmActivity, ActivityType, ActivityOutcome } from '~/types/crm'
import { ACTIVITY_TYPES, ACTIVITY_OUTCOMES } from '~/types/crm'

definePageMeta({ layout: 'crm', middleware: 'auth' })

const { activities, isLoading, fetchAllActivities } = useActivities()
const { leads, fetchLeads } = usePflegeheimLeads()
const router = useRouter()

const search = ref('')
const typeFilter = ref<ActivityType | null>(null)

// Build a lookup map of leadId → nursing home name
const leadNameMap = computed(() => {
  const map: Record<string, string> = {}
  for (const l of leads.value) {
    const nh = typeof l.nursing_home_id === 'object' && l.nursing_home_id
    if (nh) map[l.id] = nh.name || '–'
  }
  return map
})

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const debouncedFetch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => loadActivities(), 300)
}

const loadActivities = async () => {
  await fetchAllActivities({
    type: typeFilter.value,
    search: search.value || undefined,
  })
}

const leadName = (activity: CrmActivity) => {
  // Directus mode: nested object
  if (typeof activity.nursing_home_lead_id === 'object' && activity.nursing_home_lead_id) {
    const lead = activity.nursing_home_lead_id as any
    if (typeof lead.nursing_home_id === 'object' && lead.nursing_home_id) {
      return lead.nursing_home_id.name || '–'
    }
  }
  // Local mode: string ID → look up from leads
  const id = typeof activity.nursing_home_lead_id === 'string' ? activity.nursing_home_lead_id : null
  if (id && leadNameMap.value[id]) return leadNameMap.value[id]
  return '–'
}

const leadId = (activity: CrmActivity) => {
  if (typeof activity.nursing_home_lead_id === 'object' && activity.nursing_home_lead_id) {
    return (activity.nursing_home_lead_id as any).id
  }
  return activity.nursing_home_lead_id
}

const userName = (activity: CrmActivity) => {
  if (typeof activity.user_created === 'object' && activity.user_created) {
    return [activity.user_created.first_name, activity.user_created.last_name]
      .filter(Boolean).join(' ') || 'Unbekannt'
  }
  return 'System'
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  try { return format(parseISO(dateStr), 'dd.MM.yy HH:mm', { locale: de }) } catch { return '' }
}

const outcomeLabel = (outcome: ActivityOutcome) =>
  ACTIVITY_OUTCOMES.find(o => o.value === outcome)?.label || outcome

const outcomeClass = (outcome: ActivityOutcome) => {
  const classes: Record<ActivityOutcome, string> = {
    successful: 'bg-green-50 text-green-700',
    no_contact: 'bg-gray-100 text-gray-500',
    callback: 'bg-amber-50 text-amber-700',
    rejection: 'bg-red-50 text-red-600',
  }
  return classes[outcome] || 'bg-gray-100 text-gray-500'
}

const navigateToLead = (activity: CrmActivity) => {
  const id = leadId(activity)
  if (id) router.push(`/crm/leads/${id}`)
}

onMounted(async () => {
  await Promise.all([loadActivities(), fetchLeads()])
})
</script>
