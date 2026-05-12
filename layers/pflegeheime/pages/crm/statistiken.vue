<template>
  <div>
    <!-- Period selector -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-[14px] font-semibold text-gray-800">Berichte</h2>
      <select
        v-model="period"
        class="px-2 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30"
        @change="computeStats"
      >
        <option value="week">Diese Woche</option>
        <option value="month">Dieser Monat</option>
        <option value="quarter">Dieses Quartal</option>
        <option value="all">Gesamt</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <i class="pi pi-spin pi-spinner text-xl text-gray-300" />
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">

      <!-- Leads pro Stage (Bar) -->
      <div class="bg-white rounded-lg border border-gray-200/80 p-4">
        <h3 class="text-[13px] font-semibold text-gray-800 mb-3">Leads pro Stage</h3>
        <div class="h-72">
          <VChart :option="stageBarOption" autoresize />
        </div>
      </div>

      <!-- Won / Lost Ratio (Pie) -->
      <div class="bg-white rounded-lg border border-gray-200/80 p-4">
        <h3 class="text-[13px] font-semibold text-gray-800 mb-3">Won / Lost Ratio</h3>
        <div class="h-72">
          <VChart :option="wonLostPieOption" autoresize />
        </div>
      </div>

      <!-- Follow-up Compliance (Pie) -->
      <div class="bg-white rounded-lg border border-gray-200/80 p-4">
        <h3 class="text-[13px] font-semibold text-gray-800 mb-3">Follow-up Compliance</h3>
        <div class="h-72">
          <VChart :option="followUpPieOption" autoresize />
        </div>
      </div>

      <!-- Priority Distribution (Bar) -->
      <div class="bg-white rounded-lg border border-gray-200/80 p-4">
        <h3 class="text-[13px] font-semibold text-gray-800 mb-3">Prioritätsverteilung</h3>
        <div class="h-72">
          <VChart :option="priorityBarOption" autoresize />
        </div>
      </div>

      <!-- Top Heime by Capacity (Bar) -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-[13px] font-semibold text-gray-800 mb-3">Top 10 Leads nach Bettenzahl</h3>
        <div class="h-72">
          <VChart :option="topHeimeOption" autoresize />
        </div>
      </div>
    </div>

    <!-- Sales Performance -->
    <div class="mt-6">
      <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 class="text-[14px] font-semibold text-gray-800">Sales Performance</h2>
        <div class="flex items-center gap-2 flex-wrap">
          <div class="flex gap-1">
            <button
              v-for="preset in [{ key: 'week', label: 'Woche' }, { key: 'month', label: 'Monat' }, { key: 'quarter', label: 'Quartal' }]"
              :key="preset.key"
              @click="setPerfPreset(preset.key as any)"
              class="px-2 py-1 text-[10px] font-medium rounded border transition-colors border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              {{ preset.label }}
            </button>
          </div>
          <input v-model="perfDateFrom" type="date" class="px-2 py-1 border border-gray-200 rounded text-[11px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30" />
          <span class="text-[11px] text-gray-400">–</span>
          <input v-model="perfDateTo" type="date" class="px-2 py-1 border border-gray-200 rounded text-[11px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30" />
          <select v-model="perfUserId" class="px-2 py-1 border border-gray-200 rounded text-[11px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30">
            <option value="">Alle</option>
            <option v-for="u in perfUsers" :key="u.id" :value="u.id">{{ u.name }}</option>
          </select>
        </div>
      </div>

      <div v-if="loadingPerformance" class="bg-white rounded-lg border border-gray-200/80 p-8 flex justify-center">
        <i class="pi pi-spin pi-spinner text-gray-300" />
      </div>

      <template v-else>
        <!-- KPI Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          <div class="bg-white rounded-lg border border-gray-200/80 p-3">
            <p class="text-[10px] text-gray-400 font-medium uppercase">Anrufe</p>
            <p class="text-[22px] font-bold text-gray-800 mt-0.5">{{ perfCallCount }}</p>
          </div>
          <div class="bg-white rounded-lg border border-gray-200/80 p-3">
            <p class="text-[10px] text-gray-400 font-medium uppercase">E-Mails</p>
            <p class="text-[22px] font-bold text-gray-800 mt-0.5">{{ perfEmailCount }}</p>
          </div>
          <div class="bg-white rounded-lg border border-gray-200/80 p-3">
            <p class="text-[10px] text-gray-400 font-medium uppercase">Termine</p>
            <p class="text-[22px] font-bold text-gray-800 mt-0.5">{{ perfMeetingCount }}</p>
          </div>
          <div class="bg-white rounded-lg border border-gray-200/80 p-3">
            <p class="text-[10px] text-gray-400 font-medium uppercase">Won</p>
            <p class="text-[22px] font-bold text-green-600 mt-0.5">{{ perfWonCount }}</p>
          </div>
          <div class="bg-white rounded-lg border border-gray-200/80 p-3">
            <p class="text-[10px] text-gray-400 font-medium uppercase">Lost</p>
            <p class="text-[22px] font-bold text-red-500 mt-0.5">{{ perfLostCount }}</p>
          </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div class="bg-white rounded-lg border border-gray-200/80 p-4">
            <h3 class="text-[13px] font-semibold text-gray-800 mb-3">Aktivitäten pro Tag</h3>
            <div class="h-64">
              <VChart v-if="perfPerDay.days.length > 0" :option="perfBarOption" autoresize />
              <div v-else class="flex items-center justify-center h-full text-[12px] text-gray-400">Keine Aktivitäten im Zeitraum</div>
            </div>
          </div>
          <div class="bg-white rounded-lg border border-gray-200/80 p-4">
            <h3 class="text-[13px] font-semibold text-gray-800 mb-3">Anruf-Ergebnisse</h3>
            <div class="h-64">
              <VChart v-if="perfCallCount > 0" :option="perfDonutOption" autoresize />
              <div v-else class="flex items-center justify-center h-full text-[12px] text-gray-400">Keine Anrufe im Zeitraum</div>
            </div>
          </div>
        </div>

        <!-- Detail Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="bg-white rounded-lg border border-gray-200/80 p-4">
            <h3 class="text-[12px] font-semibold text-gray-700 mb-2">Pipeline-Bewegung</h3>
            <div class="space-y-1.5">
              <div class="flex justify-between text-[11px]"><span class="text-gray-500">Stage-Änderungen</span><span class="font-medium text-gray-800">{{ perfStageChanges }}</span></div>
              <div class="flex justify-between text-[11px]"><span class="text-gray-500">Neue Leads</span><span class="font-medium text-gray-800">{{ perfNewLeads }}</span></div>
              <div class="flex justify-between text-[11px]"><span class="text-gray-500">Conversion Rate</span><span class="font-medium text-gray-800">{{ perfConversionRate }}%</span></div>
            </div>
          </div>
          <div class="bg-white rounded-lg border border-gray-200/80 p-4">
            <h3 class="text-[12px] font-semibold text-gray-700 mb-2">Gesprächszeit</h3>
            <div class="space-y-1.5">
              <div class="flex justify-between text-[11px]"><span class="text-gray-500">Gesamt</span><span class="font-medium text-gray-800">{{ Math.floor(perfTotalMinutes / 60) }}h {{ perfTotalMinutes % 60 }}min</span></div>
              <div class="flex justify-between text-[11px]"><span class="text-gray-500">Ø pro Anruf</span><span class="font-medium text-gray-800">{{ perfAvgMinutes }} min</span></div>
            </div>
          </div>
          <div class="bg-white rounded-lg border border-gray-200/80 p-4">
            <h3 class="text-[12px] font-semibold text-gray-700 mb-2">Notizen & Sonstiges</h3>
            <div class="space-y-1.5">
              <div class="flex justify-between text-[11px]"><span class="text-gray-500">Notizen</span><span class="font-medium text-gray-800">{{ perfNoteCount }}</span></div>
              <div class="flex justify-between text-[11px]"><span class="text-gray-500">Newsletter</span><span class="font-medium text-gray-800">{{ perfNewsletterCount }}</span></div>
              <div class="flex justify-between text-[11px]"><span class="text-gray-500">Aufgaben</span><span class="font-medium text-gray-800">{{ perfTaskCount }}</span></div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Bestandsheime Übersicht -->
    <div class="mt-6">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-[14px] font-semibold text-gray-800">Bestandsheime</h2>
        <span v-if="!loadingHeime" class="text-[11px] text-gray-400">
          {{ bestandsheime.length }} Heime · {{ totalBewohner }} Bewohner · {{ totalBehandlungenYTD }} Behandlungen YTD
        </span>
      </div>

      <div v-if="loadingHeime" class="bg-white rounded-lg border border-gray-200/80 p-8 flex justify-center">
        <i class="pi pi-spin pi-spinner text-gray-300" />
      </div>

      <div v-else-if="bestandsheime.length === 0" class="bg-white rounded-lg border border-gray-200/80 p-8 text-center">
        <p class="text-[12px] text-gray-400">Keine Bestandsheime gefunden</p>
      </div>

      <div v-else class="bg-white rounded-lg border border-gray-200/80 overflow-hidden">
        <table class="w-full text-[12px]">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50/50">
              <th
                v-for="col in heimColumns"
                :key="col.key"
                :class="[col.align === 'right' ? 'text-right' : 'text-left', 'px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider cursor-pointer select-none hover:text-gray-600 transition-colors']"
                :style="{ color: heimSortKey === col.key ? '#172774' : undefined }"
                @click="toggleHeimSort(col.key)"
              >
                {{ col.label }}
                <i
                  v-if="heimSortKey === col.key"
                  :class="heimSortDesc ? 'pi pi-sort-amount-down' : 'pi pi-sort-amount-up'"
                  class="text-[8px] ml-0.5"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="heim in sortedBestandsheime"
              :key="heim.id"
              class="border-b border-gray-50 hover:bg-gray-50/80 transition-colors"
            >
              <td class="px-4 py-2.5 font-medium text-gray-900">{{ heim.name }}</td>
              <td class="px-4 py-2.5 text-gray-500">{{ heim.city || '–' }}</td>
              <td class="px-4 py-2.5 text-right text-gray-500 tabular-nums">{{ heim.capacity || '–' }}</td>
              <td class="px-4 py-2.5 text-right tabular-nums">
                <span :class="heim.bewohner > 0 ? 'text-gray-900 font-medium' : 'text-gray-400'">
                  {{ heim.bewohner }}
                </span>
              </td>
              <td class="px-4 py-2.5 text-right tabular-nums">
                <span :class="heim.behandlungen > 0 ? 'text-gray-900 font-medium' : 'text-gray-400'">
                  {{ heim.behandlungen.toLocaleString('de-DE') }}
                </span>
              </td>
              <td class="px-4 py-2.5 text-right">
                <div v-if="heim.capacity" class="flex items-center justify-end gap-2">
                  <div class="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="heim.auslastung > 80 ? 'bg-green-500' : heim.auslastung > 50 ? 'bg-amber-400' : 'bg-gray-300'"
                      :style="{ width: Math.min(heim.auslastung, 100) + '%' }"
                    />
                  </div>
                  <span class="text-[10px] text-gray-500 tabular-nums w-8 text-right">{{ heim.auslastung }}%</span>
                </div>
                <span v-else class="text-gray-400">–</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Provision -->
    <div class="mt-6">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-[14px] font-semibold text-gray-800">Provision</h2>
        <div class="flex items-center gap-2">
          <select
            v-model="provisionUserId"
            class="px-2 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30"
            @change="fetchProvision"
          >
            <option value="">Agent wählen...</option>
            <option v-for="u in provisionUsers" :key="u.id" :value="u.id">{{ u.name }}</option>
          </select>
          <select
            v-model="provisionPeriod"
            class="px-2 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30"
            @change="fetchProvision"
          >
            <option value="month">Dieser Monat</option>
            <option value="quarter">Dieses Quartal</option>
            <option value="year">Dieses Jahr</option>
            <option value="all">Gesamt</option>
          </select>
        </div>
      </div>

      <div v-if="!provisionUserId" class="bg-white rounded-lg border border-gray-200/80 p-8 text-center">
        <p class="text-[12px] text-gray-400">Agent auswählen um Provision zu berechnen</p>
      </div>

      <div v-else-if="loadingProvision" class="bg-white rounded-lg border border-gray-200/80 p-8 flex justify-center">
        <i class="pi pi-spin pi-spinner text-gray-300" />
      </div>

      <template v-else>
        <!-- Provision KPIs -->
        <div class="grid grid-cols-3 gap-3 mb-3">
          <div class="bg-white rounded-lg border border-gray-200/80 px-4 py-3">
            <p class="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Neue Heime (100€/Pat.)</p>
            <p class="text-[20px] font-bold text-gray-900 tabular-nums">{{ provisionNewCount }}</p>
            <p class="text-[11px] text-green-600 font-medium tabular-nums">{{ (provisionNewCount * 100).toLocaleString('de-DE') }} €</p>
          </div>
          <div class="bg-white rounded-lg border border-gray-200/80 px-4 py-3">
            <p class="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Bestand (10€/Pat.)</p>
            <p class="text-[20px] font-bold text-gray-900 tabular-nums">{{ provisionExistingCount }}</p>
            <p class="text-[11px] text-green-600 font-medium tabular-nums">{{ (provisionExistingCount * 10).toLocaleString('de-DE') }} €</p>
          </div>
          <div class="bg-white rounded-lg border border-gray-200/80 px-4 py-3">
            <p class="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Gesamt Provision</p>
            <p class="text-[20px] font-bold text-[#172774] tabular-nums">{{ provisionTotal.toLocaleString('de-DE') }} €</p>
          </div>
        </div>

        <!-- Provision per home -->
        <div v-if="provisionRows.length > 0" class="bg-white rounded-lg border border-gray-200/80 overflow-hidden">
          <table class="w-full text-[12px]">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50/50">
                <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pflegeheim</th>
                <th class="text-right px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Neue Patienten</th>
                <th class="text-right px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Typ</th>
                <th class="text-right px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Rate</th>
                <th class="text-right px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Provision</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in provisionRows"
                :key="row.homeId"
                class="border-b border-gray-50 hover:bg-gray-50/80 transition-colors"
              >
                <td class="px-4 py-2.5 font-medium text-gray-900">{{ row.homeName }}</td>
                <td class="px-4 py-2.5 text-right tabular-nums font-medium">{{ row.count }}</td>
                <td class="px-4 py-2.5 text-right">
                  <span
                    :class="row.isNew ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                    class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  >
                    {{ row.isNew ? 'Neues Heim' : 'Bestand' }}
                  </span>
                </td>
                <td class="px-4 py-2.5 text-right tabular-nums text-gray-500">{{ row.rate }} €</td>
                <td class="px-4 py-2.5 text-right tabular-nums font-medium text-[#172774]">{{ row.total.toLocaleString('de-DE') }} €</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="bg-white rounded-lg border border-gray-200/80 p-8 text-center">
          <p class="text-[12px] text-gray-400">Keine Patientenzugänge vom Agent in diesem Zeitraum</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import { parseISO, startOfWeek, startOfMonth, startOfQuarter } from 'date-fns'
import { PIPELINE_STAGES, STAGE_COLORS } from '~/types/crm'
import type { NursingHomeLead, OpportunityStage, Priority } from '~/types/crm'

definePageMeta({ layout: 'crm', middleware: 'auth' })

const { leads, fetchLeads, pagination } = usePflegeheimLeads()

const loading = ref(true)
const loadingHeime = ref(true)
const period = ref('all')

// Bestandsheime state
interface BestandsheimRow {
  id: number
  name: string
  city: string
  capacity: number
  bewohner: number
  behandlungen: number
  auslastung: number
}
const bestandsheime = ref<BestandsheimRow[]>([])
const totalBewohner = computed(() => bestandsheime.value.reduce((s, h) => s + h.bewohner, 0))
const totalBehandlungenYTD = computed(() => bestandsheime.value.reduce((s, h) => s + h.behandlungen, 0).toLocaleString('de-DE'))

// Sorting
const heimSortKey = ref<keyof BestandsheimRow>('bewohner')
const heimSortDesc = ref(true)

const heimColumns = [
  { key: 'name' as const, label: 'Pflegeheim', align: 'left' },
  { key: 'city' as const, label: 'Stadt', align: 'left' },
  { key: 'capacity' as const, label: 'Kapazität', align: 'right' },
  { key: 'bewohner' as const, label: 'Bewohner', align: 'right' },
  { key: 'behandlungen' as const, label: 'Behandlungen YTD', align: 'right' },
  { key: 'auslastung' as const, label: 'Auslastung', align: 'right' },
]

const toggleHeimSort = (key: keyof BestandsheimRow) => {
  if (heimSortKey.value === key) {
    heimSortDesc.value = !heimSortDesc.value
  } else {
    heimSortKey.value = key
    heimSortDesc.value = key !== 'name' && key !== 'city'
  }
}

const sortedBestandsheime = computed(() => {
  const key = heimSortKey.value
  const desc = heimSortDesc.value
  return [...bestandsheime.value].sort((a, b) => {
    const va = a[key] ?? ''
    const vb = b[key] ?? ''
    if (typeof va === 'number' && typeof vb === 'number') {
      return desc ? vb - va : va - vb
    }
    return desc ? String(vb).localeCompare(String(va)) : String(va).localeCompare(String(vb))
  })
})

// Computed stats from leads
const stageCounts = ref<Record<string, number>>({})
const wonCount = ref(0)
const lostCount = ref(0)
const withFollowUp = ref(0)
const withoutFollowUp = ref(0)
const priorityCounts = ref<Record<string, number>>({})
const topHeime = ref<{ name: string; capacity: number }[]>([])

const getFilteredLeads = () => {
  const now = new Date()
  let startDate: Date | null = null

  switch (period.value) {
    case 'week':
      startDate = startOfWeek(now, { weekStartsOn: 1 })
      break
    case 'month':
      startDate = startOfMonth(now)
      break
    case 'quarter':
      startDate = startOfQuarter(now)
      break
    default:
      startDate = null
  }

  if (!startDate) return leads.value

  return leads.value.filter(l => {
    if (!l.date_created) return false
    try {
      return parseISO(l.date_created) >= startDate!
    } catch {
      return false
    }
  })
}

const getPriorityFromLead = (lead: NursingHomeLead): string => {
  // Use explicit priority if set
  if (lead.priority) return lead.priority
  // Derive from bed count
  if (typeof lead.nursing_home_id === 'object' && lead.nursing_home_id) {
    const beds = lead.nursing_home_id.total_capacity
    if (beds && beds > 100) return 'high'
    if (beds && beds > 50) return 'medium'
    if (beds && beds > 0) return 'low'
  }
  return 'none'
}

const computeStats = () => {
  const filtered = getFilteredLeads()

  // Stage counts
  const sc: Record<string, number> = {}
  for (const l of filtered) {
    const stage = l.opportunity_stage || 'Unqualified'
    sc[stage] = (sc[stage] || 0) + 1
  }
  stageCounts.value = sc
  wonCount.value = sc['Won'] || 0
  lostCount.value = sc['Lost'] || 0

  // Follow-up compliance (active leads only)
  const activeLeads = filtered.filter(l =>
    !['Won', 'Lost', 'Cancelled'].includes(l.opportunity_stage)
  )
  withFollowUp.value = activeLeads.filter(l => l.follow_up_date).length
  withoutFollowUp.value = activeLeads.filter(l => !l.follow_up_date).length

  // Priority counts — derive from bed count if not explicitly set
  const pc: Record<string, number> = {}
  for (const l of filtered) {
    const p = getPriorityFromLead(l)
    pc[p] = (pc[p] || 0) + 1
  }
  priorityCounts.value = pc

  // Top heime by capacity
  topHeime.value = filtered
    .filter(l => {
      if (typeof l.nursing_home_id !== 'object' || !l.nursing_home_id) return false
      return l.nursing_home_id.total_capacity && !['Lost', 'Cancelled'].includes(l.opportunity_stage)
    })
    .map(l => {
      const nh = l.nursing_home_id as { name?: string; total_capacity?: number }
      return { name: nh.name || '–', capacity: nh.total_capacity || 0 }
    })
    .sort((a, b) => b.capacity - a.capacity)
    .slice(0, 10)
}

// Chart options
const chartTextStyle = { fontFamily: 'system-ui, sans-serif', color: '#6b7280' }

const stageBarOption = computed(() => ({
  textStyle: chartTextStyle,
  tooltip: { trigger: 'axis' },
  grid: { left: 120, right: 20, top: 10, bottom: 30 },
  xAxis: { type: 'value', splitLine: { lineStyle: { color: '#f3f4f6' } } },
  yAxis: {
    type: 'category',
    data: [...PIPELINE_STAGES].reverse(),
    axisLabel: { fontSize: 11 },
  },
  series: [{
    type: 'bar',
    data: [...PIPELINE_STAGES].reverse().map(s => ({
      value: stageCounts.value[s] || 0,
      itemStyle: { color: STAGE_COLORS[s], borderRadius: [0, 4, 4, 0] },
    })),
    barWidth: 18,
  }],
}))

const wonLostPieOption = computed(() => {
  const total = wonCount.value + lostCount.value
  return {
    textStyle: chartTextStyle,
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, textStyle: { fontSize: 12 } },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      label: {
        show: true,
        position: 'center',
        formatter: total > 0 ? `${Math.round((wonCount.value / total) * 100)}%\nWin Rate` : '–',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#172774',
        lineHeight: 22,
      },
      data: [
        { value: wonCount.value, name: 'Won', itemStyle: { color: '#34d399' } },
        { value: lostCount.value, name: 'Lost', itemStyle: { color: '#f87171' } },
      ],
    }],
  }
})

const followUpPieOption = computed(() => {
  const total = withFollowUp.value + withoutFollowUp.value
  return {
    textStyle: chartTextStyle,
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, textStyle: { fontSize: 12 } },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      label: {
        show: true,
        position: 'center',
        formatter: total > 0 ? `${Math.round((withFollowUp.value / total) * 100)}%` : '–',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#172774',
      },
      data: [
        { value: withFollowUp.value, name: 'Mit Follow-up', itemStyle: { color: '#34d399' } },
        { value: withoutFollowUp.value, name: 'Ohne Follow-up', itemStyle: { color: '#fbbf24' } },
      ],
    }],
  }
})

const priorityBarOption = computed(() => ({
  textStyle: chartTextStyle,
  tooltip: { trigger: 'axis' },
  grid: { left: 80, right: 20, top: 10, bottom: 30 },
  xAxis: { type: 'value', splitLine: { lineStyle: { color: '#f3f4f6' } } },
  yAxis: {
    type: 'category',
    data: ['Keine', 'C (0–50)', 'B (50–100)', 'A (100+)'],
    axisLabel: { fontSize: 12 },
  },
  series: [{
    type: 'bar',
    data: [
      { value: priorityCounts.value['none'] || 0, itemStyle: { color: '#d1d5db', borderRadius: [0, 4, 4, 0] } },
      { value: priorityCounts.value['low'] || 0, itemStyle: { color: '#34d399', borderRadius: [0, 4, 4, 0] } },
      { value: priorityCounts.value['medium'] || 0, itemStyle: { color: '#fbbf24', borderRadius: [0, 4, 4, 0] } },
      { value: priorityCounts.value['high'] || 0, itemStyle: { color: '#f87171', borderRadius: [0, 4, 4, 0] } },
    ],
    barWidth: 20,
  }],
}))

const topHeimeOption = computed(() => ({
  textStyle: chartTextStyle,
  tooltip: { trigger: 'axis' },
  grid: { left: 180, right: 30, top: 10, bottom: 30 },
  xAxis: {
    type: 'value',
    name: 'Betten',
    nameLocation: 'end',
    nameTextStyle: { fontSize: 11 },
    splitLine: { lineStyle: { color: '#f3f4f6' } },
  },
  yAxis: {
    type: 'category',
    data: [...topHeime.value].reverse().map(h => h.name),
    axisLabel: { fontSize: 11, width: 160, overflow: 'truncate' },
  },
  series: [{
    type: 'bar',
    data: [...topHeime.value].reverse().map(h => ({
      value: h.capacity,
      itemStyle: { color: '#172774', borderRadius: [0, 4, 4, 0] },
    })),
    barWidth: 16,
  }],
}))

// ─── Sales Performance state ────────────────────────────────────
const loadingPerformance = ref(true)
const allActivities = ref<any[]>([])
const perfDateFrom = ref(formatDateInput(startOfWeek(new Date(), { weekStartsOn: 1 })))
const perfDateTo = ref(formatDateInput(new Date()))
const perfUserId = ref('')

function formatDateInput(d: Date) {
  return d.toISOString().split('T')[0]
}

const setPerfPreset = (preset: 'week' | 'month' | 'quarter') => {
  const now = new Date()
  switch (preset) {
    case 'week': perfDateFrom.value = formatDateInput(startOfWeek(now, { weekStartsOn: 1 })); break
    case 'month': perfDateFrom.value = formatDateInput(startOfMonth(now)); break
    case 'quarter': perfDateFrom.value = formatDateInput(startOfQuarter(now)); break
  }
  perfDateTo.value = formatDateInput(now)
}

const fetchPerformanceData = async () => {
  loadingPerformance.value = true
  try {
    // Use useSecureData which handles auth refresh + proxy fallback
    const secureData = useSecureData()
    const activities = await secureData.getItems<any>({
      collection: 'nursing_home_lead_activities',
      params: {
        // Only request fields that exist in Directus schema
        // (direction, outcome, duration_minutes, metadata do NOT exist and crash the proxy)
        fields: ['id', 'type', 'description', 'date', 'date_created',
                 'user_created.id', 'user_created.first_name', 'user_created.last_name'],
        sort: ['-date_created'],
        limit: -1,
      },
    })
    console.log('[SalesPerf] Fetched activities:', activities.length, 'sample:', activities.slice(0, 3))
    allActivities.value = activities
  } catch (e) {
    console.error('[SalesPerf] Failed to fetch activities:', e)
  } finally {
    loadingPerformance.value = false
  }
}

// Unique users from activities
const perfUsers = computed(() => {
  const map = new Map<string, string>()
  for (const a of allActivities.value) {
    if (typeof a.user_created === 'object' && a.user_created?.id) {
      const u = a.user_created
      map.set(u.id, [u.first_name, u.last_name].filter(Boolean).join(' ') || u.id)
    }
  }
  return Array.from(map, ([id, name]) => ({ id, name }))
})

// Filtered activities by date range + user
const filteredActivities = computed(() => {
  const from = perfDateFrom.value
  const to = perfDateTo.value
  return allActivities.value.filter(a => {
    if (!a.date_created) return false
    const d = a.date_created.split('T')[0]
    if (from && d < from) return false
    if (to && d > to) return false
    if (perfUserId.value) {
      const uid = typeof a.user_created === 'object' ? a.user_created?.id : a.user_created
      if (uid !== perfUserId.value) return false
    }
    return true
  })
})

// KPI counts
const perfCalls = computed(() => filteredActivities.value.filter((a: any) => a.type === 'call'))
const perfCallCount = computed(() => perfCalls.value.length)
const perfEmailCount = computed(() => filteredActivities.value.filter((a: any) => a.type === 'email_sent').length)
const perfMeetingCount = computed(() => filteredActivities.value.filter((a: any) => a.type === 'meeting').length)
// Won/Lost from leads (by date_updated in selected range)
const perfWonCount = computed(() => {
  const from = perfDateFrom.value
  const to = perfDateTo.value
  return leads.value.filter(l => {
    if (l.opportunity_stage !== 'Won') return false
    const d = l.date_updated?.split('T')[0]
    if (!d) return false
    if (from && d < from) return false
    if (to && d > to) return false
    return true
  }).length
})
const perfLostCount = computed(() => {
  const from = perfDateFrom.value
  const to = perfDateTo.value
  return leads.value.filter(l => {
    if (l.opportunity_stage !== 'Lost') return false
    const d = l.date_updated?.split('T')[0]
    if (!d) return false
    if (from && d < from) return false
    if (to && d > to) return false
    return true
  }).length
})

// Call outcomes
const perfCallOutcomes = computed(() => {
  const outcomes = { successful: 0, no_contact: 0, callback: 0, rejection: 0 }
  for (const a of perfCalls.value) {
    if (a.outcome && a.outcome in outcomes) outcomes[a.outcome as keyof typeof outcomes]++
  }
  return outcomes
})

// Call duration
const perfTotalMinutes = computed(() => perfCalls.value.reduce((s: number, a: any) => s + (a.duration_minutes || 0), 0))
const perfAvgMinutes = computed(() => perfCallCount.value > 0 ? Math.round(perfTotalMinutes.value / perfCallCount.value * 10) / 10 : 0)

// Pipeline metrics (from leads, not activities)
const perfStageChanges = computed(() => filteredActivities.value.filter((a: any) => a.type === 'stage_change').length)
const perfNewLeads = computed(() => {
  const from = perfDateFrom.value
  const to = perfDateTo.value
  return leads.value.filter(l => {
    const d = l.date_created?.split('T')[0]
    if (!d) return false
    if (from && d < from) return false
    if (to && d > to) return false
    return true
  }).length
})
const perfConversionRate = computed(() => {
  const total = perfWonCount.value + perfLostCount.value
  return total > 0 ? Math.round((perfWonCount.value / total) * 100) : 0
})
const perfNoteCount = computed(() => filteredActivities.value.filter((a: any) => a.type === 'note').length)
const perfNewsletterCount = computed(() => filteredActivities.value.filter((a: any) => a.type === 'newsletter').length)
const perfTaskCount = computed(() => filteredActivities.value.filter((a: any) => a.type === 'task').length)

// Activities per day for stacked bar chart
const perfPerDay = computed(() => {
  const map: Record<string, Record<string, number>> = {}
  for (const a of filteredActivities.value) {
    const day = a.date_created?.split('T')[0]
    if (!day) continue
    if (!map[day]) map[day] = { call: 0, email_sent: 0, meeting: 0, note: 0 }
    if (a.type in map[day]) map[day][a.type]++
  }
  const days = Object.keys(map).sort()
  return { days, data: map }
})

// Chart: Activities per day (stacked bar)
const perfBarOption = computed(() => {
  const { days, data } = perfPerDay.value
  const labels = days.map(d => { const p = d.split('-'); return `${p[2]}.${p[1]}.` })
  return {
    textStyle: chartTextStyle,
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 40, right: 20, top: 10, bottom: 40 },
    xAxis: { type: 'category', data: labels, axisLabel: { fontSize: 10, rotate: days.length > 14 ? 45 : 0 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f3f4f6' } } },
    series: [
      { name: 'Anrufe', type: 'bar', stack: 'total', data: days.map(d => data[d]?.call || 0), itemStyle: { color: '#34d399' }, barWidth: 16 },
      { name: 'E-Mails', type: 'bar', stack: 'total', data: days.map(d => data[d]?.email_sent || 0), itemStyle: { color: '#60a5fa' } },
      { name: 'Termine', type: 'bar', stack: 'total', data: days.map(d => data[d]?.meeting || 0), itemStyle: { color: '#fb923c' } },
      { name: 'Notizen', type: 'bar', stack: 'total', data: days.map(d => data[d]?.note || 0), itemStyle: { color: '#d1d5db' } },
    ],
  }
})

// Chart: Call outcomes (donut)
const perfDonutOption = computed(() => {
  const o = perfCallOutcomes.value
  const total = perfCallCount.value
  return {
    textStyle: chartTextStyle,
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      label: {
        show: true, position: 'center',
        formatter: total > 0 ? `${total}\nAnrufe` : '0\nAnrufe',
        fontSize: 16, fontWeight: 'bold', color: '#172774', lineHeight: 22,
      },
      data: [
        { value: o.successful, name: 'Erfolgreich', itemStyle: { color: '#34d399' } },
        { value: o.no_contact, name: 'Kein Kontakt', itemStyle: { color: '#d1d5db' } },
        { value: o.callback, name: 'Rückruf', itemStyle: { color: '#fbbf24' } },
        { value: o.rejection, name: 'Ablehnung', itemStyle: { color: '#f87171' } },
      ].filter(d => d.value > 0),
    }],
  }
})

// Provision state
const provisionUserId = ref('')
const provisionPeriod = ref('month')
const loadingProvision = ref(false)
const provisionUsers = ref<{ id: string; name: string }[]>([])
interface ProvisionRow {
  homeId: number
  homeName: string
  count: number
  isNew: boolean
  rate: number
  total: number
}
const provisionRows = ref<ProvisionRow[]>([])
const provisionNewCount = computed(() => provisionRows.value.filter(r => r.isNew).reduce((s, r) => s + r.count, 0))
const provisionExistingCount = computed(() => provisionRows.value.filter(r => !r.isNew).reduce((s, r) => s + r.count, 0))
const provisionTotal = computed(() => provisionRows.value.reduce((s, r) => s + r.total, 0))

const fetchDirectus = async (path: string) => {
  const config = useRuntimeConfig()
  const baseURL = config.public.directusUrl || 'https://wunschlachen.app'
  const securePath = path.startsWith('/items/') ? path.replace('/items/', '/secure-data/items/') : path
  let response = await fetch(`${baseURL}${securePath}`, { credentials: 'include' })
  // Fallback: if secure-data proxy returns 500, try direct Directus API
  if (response.status === 500 && securePath.includes('/secure-data/items/')) {
    response = await fetch(`${baseURL}${path}`, { credentials: 'include' })
  }
  if (!response.ok) throw new Error(`Directus ${path}: ${response.status}`)
  const json = await response.json()
  return json.data || []
}

const fetchBestandsheime = async () => {
  loadingHeime.value = true
  try {
    const ytdStart = `${new Date().getFullYear()}-01-01`

    // 1. Fetch published nursing homes
    const homesParams = new URLSearchParams({
      'fields': 'id,name,city,total_capacity',
      'filter[status][_eq]': 'published',
      'sort': 'name',
      'limit': '-1',
    })
    const homes = await fetchDirectus(`/items/nursing_home?${homesParams}`) as { id: number; name: string; city: string; total_capacity: number }[]

    if (homes.length === 0) { bestandsheime.value = []; return }

    const homeIdSet = new Set(homes.map(h => h.id))

    // 2. Fetch patient→nursing_home mapping (only active patients)
    // Note: _in and nested relational filters crash/are ignored by secure-data proxy,
    // so fetch with patient.status as field and filter client-side
    const junctionParams = new URLSearchParams({
      'fields': 'nursing_home,patient.id,patient.status',
      'filter[patient][_nnull]': 'true',
      'limit': '-1',
    })
    const allJunctions = await fetchDirectus(`/items/nursinghome2patient?${junctionParams}`) as { nursing_home: number; patient: { id: string; status: string } | null }[]
    // Filter client-side: published homes + active patients (proxy ignores nested relational filters)
    const junctions = allJunctions.filter(j =>
      j.nursing_home && j.patient && homeIdSet.has(j.nursing_home) && j.patient.status === 'active'
    )

    // Build patient→home map and count patients per home
    const patientToHome = new Map<string, number>()
    const bewohnerPerHome = new Map<number, number>()
    for (const j of junctions) {
      patientToHome.set(j.patient!.id, j.nursing_home)
      bewohnerPerHome.set(j.nursing_home, (bewohnerPerHome.get(j.nursing_home) || 0) + 1)
    }

    // 3. Fetch YTD treatments for mapped patients in batches
    const patientIds = [...patientToHome.keys()]
    const behandlungenPerHome = new Map<number, number>()

    if (patientIds.length > 0) {
      // Note: _in filter crashes secure-data proxy, so fetch all YTD treatments and filter client-side
      const patientIdSet = new Set(patientIds)
      const treatParams = new URLSearchParams({
        'fields': 'patient',
        'filter[treatment_date][_gte]': ytdStart,
        'limit': '-1',
      })
      const treatments = await fetchDirectus(`/items/treatments?${treatParams}`) as { patient: string }[]

      for (const t of treatments) {
        if (t.patient && patientIdSet.has(t.patient)) {
          const homeId = patientToHome.get(t.patient)
          if (homeId) {
            behandlungenPerHome.set(homeId, (behandlungenPerHome.get(homeId) || 0) + 1)
          }
        }
      }
    }

    // 4. Combine into table rows
    bestandsheime.value = homes.map(h => {
      const bewohner = bewohnerPerHome.get(h.id) || 0
      const capacity = h.total_capacity || 0
      return {
        id: h.id,
        name: h.name || '–',
        city: h.city || '',
        capacity,
        bewohner,
        behandlungen: behandlungenPerHome.get(h.id) || 0,
        auslastung: capacity > 0 ? Math.round((bewohner / capacity) * 100) : 0,
      }
    }).sort((a, b) => b.bewohner - a.bewohner)
  } catch (err) {
    console.error('Failed to load Bestandsheime:', err)
  } finally {
    loadingHeime.value = false
  }
}

const fetchProvisionUsers = async () => {
  try {
    // Get distinct user_created from nursinghome2patient
    const records = await fetchDirectus('/items/nursinghome2patient?fields=user_created.id,user_created.first_name,user_created.last_name&filter[user_created][_nnull]=true&limit=-1')
    const seen = new Set<string>()
    const users: { id: string; name: string }[] = []
    for (const r of records) {
      if (r.user_created?.id && !seen.has(r.user_created.id)) {
        seen.add(r.user_created.id)
        users.push({
          id: r.user_created.id,
          name: [r.user_created.first_name, r.user_created.last_name].filter(Boolean).join(' ') || r.user_created.id,
        })
      }
    }
    provisionUsers.value = users.sort((a, b) => a.name.localeCompare(b.name))
  } catch (err) {
    console.error('Failed to load provision users:', err)
  }
}

const fetchProvision = async () => {
  if (!provisionUserId.value) return
  loadingProvision.value = true
  try {
    // Determine period start
    const now = new Date()
    let periodStart: string
    switch (provisionPeriod.value) {
      case 'month':
        periodStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
        break
      case 'quarter': {
        const qMonth = Math.floor(now.getMonth() / 3) * 3 + 1
        periodStart = `${now.getFullYear()}-${String(qMonth).padStart(2, '0')}-01`
        break
      }
      case 'year':
        periodStart = `${now.getFullYear()}-01-01`
        break
      default:
        periodStart = '2020-01-01'
    }

    // Fetch patient assignments by this user in period
    const params = new URLSearchParams({
      'fields': 'nursing_home,patient,date_created',
      'filter[user_created][_eq]': provisionUserId.value,
      'filter[date_created][_gte]': periodStart,
      'filter[patient][_nnull]': 'true',
      'filter[nursing_home][_nnull]': 'true',
      'limit': '-1',
    })
    const assignments = await fetchDirectus(`/items/nursinghome2patient?${params}`) as { nursing_home: number; patient: string; date_created: string }[]

    if (assignments.length === 0) { provisionRows.value = []; return }

    // Count per home
    const perHome = new Map<number, number>()
    for (const a of assignments) {
      perHome.set(a.nursing_home, (perHome.get(a.nursing_home) || 0) + 1)
    }

    // Fetch Won leads to determine new vs existing homes
    // A home is "new" if its lead was Won within the last quarter
    const wonParams = new URLSearchParams({
      'fields': 'nursing_home_id,date_updated',
      'filter[opportunity_stage][_eq]': 'Won',
      'limit': '-1',
    })
    const wonLeads = await fetchDirectus(`/items/nursing_home_leads?${wonParams}`) as { nursing_home_id: number; date_updated: string }[]

    const wonDates = new Map<number, string>()
    for (const w of wonLeads) {
      if (w.nursing_home_id) wonDates.set(w.nursing_home_id, w.date_updated)
    }

    // Get home names from bestandsheime or fetch fresh
    const homeNames = new Map<number, string>()
    for (const h of bestandsheime.value) {
      homeNames.set(h.id, h.name)
    }
    // Fetch any missing home names (avoid _in filter — crashes secure-data proxy)
    const missingIds = new Set([...perHome.keys()].filter(id => !homeNames.has(id)))
    if (missingIds.size > 0) {
      const nhParams = new URLSearchParams({
        'fields': 'id,name',
        'limit': '-1',
      })
      const homes = await fetchDirectus(`/items/nursing_home?${nhParams}`) as { id: number; name: string }[]
      for (const h of homes) {
        if (missingIds.has(h.id)) homeNames.set(h.id, h.name)
      }
    }

    // Build rows
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const cutoff = threeMonthsAgo.toISOString()

    const rows: ProvisionRow[] = []
    for (const [homeId, count] of perHome) {
      const wonDate = wonDates.get(homeId)
      // "New" = Won within last 3 months (first quarter)
      const isNew = wonDate ? wonDate >= cutoff : false
      const rate = isNew ? 100 : 10
      rows.push({
        homeId,
        homeName: homeNames.get(homeId) || `Heim #${homeId}`,
        count,
        isNew,
        rate,
        total: count * rate,
      })
    }

    provisionRows.value = rows.sort((a, b) => b.total - a.total)
  } catch (err) {
    console.error('Failed to load provision:', err)
  } finally {
    loadingProvision.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    // Fetch all leads (raise limit to get everything)
    const prevLimit = pagination.value.limit
    pagination.value.limit = 1000
    await fetchLeads()
    pagination.value.limit = prevLimit
    computeStats()
  } finally {
    loading.value = false
  }

  // Fetch Sales Performance data
  fetchPerformanceData()

  // Fetch Bestandsheime data independently
  fetchBestandsheime()

  // Fetch provision agent users
  fetchProvisionUsers()
})
</script>
