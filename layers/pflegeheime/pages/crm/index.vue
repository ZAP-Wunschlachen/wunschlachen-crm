<template>
  <div>
    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      <div
        v-for="kpi in kpis"
        :key="kpi.label"
        class="bg-white rounded-lg border border-gray-200/80 px-4 py-3.5"
      >
        <p class="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">{{ kpi.label }}</p>
        <div class="flex items-end justify-between">
          <p class="text-[22px] font-bold text-gray-900 tabular-nums leading-none">
            <span v-if="loading" class="inline-block w-8 h-6 bg-gray-100 rounded animate-pulse" />
            <span v-else>{{ kpi.value }}</span>
          </p>
          <i :class="kpi.icon" class="text-[16px] mb-0.5" :style="{ color: kpi.iconColor }" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">

      <!-- Pipeline Funnel -->
      <div class="lg:col-span-3 bg-white rounded-lg border border-gray-200/80 p-4">
        <h2 class="text-[13px] font-semibold text-gray-800 mb-3">Pipeline</h2>
        <div v-if="loading" class="flex justify-center py-10">
          <i class="pi pi-spin pi-spinner text-gray-300" />
        </div>
        <div v-else class="space-y-1.5">
          <div
            v-for="stage in funnelData"
            :key="stage.name"
            class="flex items-center gap-2 group cursor-default"
          >
            <span class="text-[11px] text-gray-500 w-20 text-right flex-shrink-0 truncate font-medium">
              {{ stage.name }}
            </span>
            <div class="flex-1 bg-gray-100 rounded h-5 overflow-hidden">
              <div
                class="h-full rounded flex items-center px-1.5 transition-all duration-700 ease-out"
                :style="{
                  width: stage.percent + '%',
                  backgroundColor: stage.color,
                  minWidth: stage.count > 0 ? '22px' : '0'
                }"
              >
                <span v-if="stage.count > 0" class="text-[10px] font-bold text-white">
                  {{ stage.count }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="lg:col-span-2 space-y-4">
        <!-- No follow-up warning -->
        <div class="bg-white rounded-lg border border-gray-200/80 p-4">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-[13px] font-semibold text-gray-800">Ohne Follow-up</h2>
            <span
              v-if="noFollowUpLeads.length > 0"
              class="text-[10px] px-1.5 py-[1px] rounded bg-amber-100 text-amber-600 font-bold tabular-nums"
            >
              {{ noFollowUpLeads.length }}
            </span>
          </div>
          <p v-if="noFollowUpLeads.length === 0" class="text-[12px] text-gray-400">
            Alles hat ein Follow-up Datum
          </p>
          <div v-else class="space-y-0.5">
            <NuxtLink
              v-for="lead in noFollowUpLeads.slice(0, 5)"
              :key="lead.id"
              :to="`/crm/leads/${lead.id}`"
              class="flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 transition-colors -mx-1"
            >
              <span class="text-[12px] text-gray-700 truncate">{{ getNursingHomeName(lead) }}</span>
              <CrmLeadStatusBadge :stage="lead.opportunity_stage" />
            </NuxtLink>
            <NuxtLink
              v-if="noFollowUpLeads.length > 5"
              to="/crm/leads"
              class="block text-[11px] text-center text-[#172774] hover:underline pt-1"
            >
              {{ noFollowUpLeads.length - 5 }} weitere →
            </NuxtLink>
          </div>
        </div>

        <!-- Recently updated -->
        <div class="bg-white rounded-lg border border-gray-200/80 p-4">
          <h2 class="text-[13px] font-semibold text-gray-800 mb-2">Letzte Aktivität</h2>
          <div v-if="recentLeads.length === 0" class="text-[12px] text-gray-400">Keine</div>
          <div v-else class="space-y-0.5">
            <NuxtLink
              v-for="lead in recentLeads"
              :key="lead.id"
              :to="`/crm/leads/${lead.id}`"
              class="flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 transition-colors -mx-1"
            >
              <div class="flex items-center gap-2 min-w-0">
                <CrmLeadStatusBadge :stage="lead.opportunity_stage" />
                <span class="text-[12px] text-gray-700 truncate">{{ getNursingHomeName(lead) }}</span>
              </div>
              <span class="text-[10px] text-gray-400 flex-shrink-0 ml-2 tabular-nums">
                {{ formatTimeAgo(lead.date_updated) }}
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Follow-ups table -->
    <div class="mt-4 bg-white rounded-lg border border-gray-200/80 p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-[13px] font-semibold text-gray-800">
          Fällige Follow-ups
          <span v-if="dueFollowUps.length > 0" class="text-red-500 ml-0.5 tabular-nums">({{ dueFollowUps.length }})</span>
        </h2>
        <NuxtLink to="/crm/leads" class="text-[11px] text-[#172774] hover:underline font-medium">
          Alle Leads →
        </NuxtLink>
      </div>

      <div v-if="loading" class="flex justify-center py-6">
        <i class="pi pi-spin pi-spinner text-gray-300" />
      </div>
      <div v-else-if="dueFollowUps.length === 0" class="text-[12px] text-gray-400 text-center py-6">
        Keine fälligen Follow-ups
      </div>
      <table v-else class="w-full text-[12px]">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="text-left px-2 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pflegeheim</th>
            <th class="text-left px-2 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Stage</th>
            <th class="text-left px-2 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Priorität</th>
            <th class="text-left px-2 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Follow-up</th>
            <th class="text-left px-2 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Betten</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="lead in dueFollowUps"
            :key="lead.id"
            class="border-b border-gray-50 hover:bg-gray-50/80 cursor-pointer transition-colors"
            @click="navigateTo(`/crm/leads/${lead.id}`)"
          >
            <td class="px-2 py-2">
              <span class="font-medium text-gray-900">{{ getNursingHomeName(lead) }}</span>
              <span class="text-gray-400 ml-1.5">{{ getNursingHomeCity(lead) }}</span>
            </td>
            <td class="px-2 py-2"><CrmLeadStatusBadge :stage="lead.opportunity_stage" /></td>
            <td class="px-2 py-2"><CrmPriorityBadge :priority="lead.priority" /></td>
            <td class="px-2 py-2"><CrmFollowUpIndicator :date="lead.follow_up_date" /></td>
            <td class="px-2 py-2 text-gray-500 tabular-nums">{{ getNursingHomeCapacity(lead) || '–' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { differenceInMinutes, differenceInHours, differenceInDays, parseISO, startOfWeek } from 'date-fns'
import { PIPELINE_STAGES, STAGE_COLORS } from '~/types/crm'
import type { NursingHomeLead } from '~/types/crm'

definePageMeta({ layout: 'crm', middleware: 'auth' })

const { leads: allLeads, fetchLeads, pagination } = usePflegeheimLeads()

const loading = ref(true)
const dueFollowUps = ref<NursingHomeLead[]>([])
const noFollowUpLeads = ref<NursingHomeLead[]>([])
const recentLeads = ref<NursingHomeLead[]>([])
const funnelData = ref<{ name: string; count: number; percent: number; color: string }[]>([])

const kpis = ref([
  { label: 'Leads', value: 0, icon: 'pi pi-building', iconColor: '#3d4a8e' },
  { label: 'Won / Woche', value: 0, icon: 'pi pi-check-circle', iconColor: '#22c55e' },
  { label: 'Lost / Woche', value: 0, icon: 'pi pi-times-circle', iconColor: '#ef4444' },
  { label: 'Fällig', value: 0, icon: 'pi pi-clock', iconColor: '#f59e0b' },
])

const getNursingHomeName = (lead: NursingHomeLead) => {
  if (typeof lead.nursing_home_id === 'object' && lead.nursing_home_id) return lead.nursing_home_id.name || '–'
  return '–'
}
const getNursingHomeCity = (lead: NursingHomeLead) => {
  if (typeof lead.nursing_home_id === 'object' && lead.nursing_home_id) return lead.nursing_home_id.city || ''
  return ''
}
const getNursingHomeCapacity = (lead: NursingHomeLead) => {
  if (typeof lead.nursing_home_id === 'object' && lead.nursing_home_id) return lead.nursing_home_id.total_capacity
  return null
}
const formatTimeAgo = (dateStr?: string) => {
  if (!dateStr) return ''
  try {
    const date = parseISO(dateStr)
    const mins = differenceInMinutes(new Date(), date)
    if (mins < 60) return `${mins}m`
    const hours = differenceInHours(new Date(), date)
    if (hours < 24) return `${hours}h`
    return `${differenceInDays(new Date(), date)}d`
  } catch { return '' }
}

onMounted(async () => {
  loading.value = true
  try {
    // Fetch all leads
    const prevLimit = pagination.value.limit
    pagination.value.limit = 1000
    await fetchLeads()
    pagination.value.limit = prevLimit

    const leads = allLeads.value
    const today = new Date().toISOString().split('T')[0]
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })

    // KPIs
    kpis.value[0].value = leads.length

    kpis.value[1].value = leads.filter(l =>
      l.opportunity_stage === 'Won' && l.date_updated && parseISO(l.date_updated) >= weekStart
    ).length

    kpis.value[2].value = leads.filter(l =>
      l.opportunity_stage === 'Lost' && l.date_updated && parseISO(l.date_updated) >= weekStart
    ).length

    // Due follow-ups
    const activeLeads = leads.filter(l => !['Won', 'Lost', 'Cancelled'].includes(l.opportunity_stage))

    dueFollowUps.value = activeLeads
      .filter(l => l.follow_up_date && l.follow_up_date.split('T')[0] <= today)
      .sort((a, b) => (a.follow_up_date || '').localeCompare(b.follow_up_date || ''))

    kpis.value[3].value = dueFollowUps.value.length

    // No follow-up
    noFollowUpLeads.value = activeLeads
      .filter(l => !l.follow_up_date)
      .sort((a, b) => (b.date_updated || '').localeCompare(a.date_updated || ''))

    // Recent leads
    recentLeads.value = [...leads]
      .sort((a, b) => (b.date_updated || '').localeCompare(a.date_updated || ''))
      .slice(0, 5)

    // Pipeline funnel
    const stageCounts: Record<string, number> = {}
    for (const l of leads) {
      const s = l.opportunity_stage || 'Unqualified'
      stageCounts[s] = (stageCounts[s] || 0) + 1
    }

    const activePipelineStages = PIPELINE_STAGES.filter(s => !['Won', 'Lost', 'Cancelled'].includes(s))
    const maxCount = Math.max(...activePipelineStages.map(s => stageCounts[s] || 0), 1)

    funnelData.value = activePipelineStages.map(stage => ({
      name: stage,
      count: stageCounts[stage] || 0,
      percent: Math.round(((stageCounts[stage] || 0) / maxCount) * 100),
      color: STAGE_COLORS[stage],
    }))
  } finally {
    loading.value = false
  }
})
</script>
