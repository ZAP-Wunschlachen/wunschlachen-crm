<template>
  <div
    v-if="loaded"
    class="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 rounded-lg border border-emerald-200/50 overflow-hidden"
  >
    <button
      class="w-full flex items-center justify-between px-4 py-3 hover:bg-white/30 transition-colors"
      @click="isOpen = !isOpen"
    >
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <i class="pi pi-forward text-[11px] text-white" />
        </div>
        <div class="text-left">
          <span class="text-[12px] font-semibold text-gray-800">Nächster Lead</span>
          <span v-if="nextLeadName" class="text-[10px] text-emerald-600 ml-1.5">{{ nextLeadName }}</span>
          <span v-if="activeFilterLabel" class="text-[9px] text-gray-400 ml-1.5">· {{ activeFilterLabel }}</span>
        </div>
      </div>
      <div class="flex items-center gap-1.5">
        <span v-if="scoredLeads.length > 0" class="text-[9px] text-emerald-600 font-medium">{{ scoredLeads.length }} Leads</span>
        <i class="pi text-[10px] text-gray-400" :class="isOpen ? 'pi-chevron-up' : 'pi-chevron-down'" />
      </div>
    </button>

    <div v-if="isOpen" class="px-4 pb-4 space-y-2.5">
      <!-- Filters -->
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="f in filterOptions"
          :key="f.value"
          class="px-2 py-1 rounded-md text-[10px] font-medium border transition-colors"
          :class="activeFilter === f.value
            ? 'border-emerald-400 bg-emerald-100 text-emerald-700'
            : 'border-gray-200 bg-white/60 text-gray-500 hover:border-gray-300 hover:bg-white'"
          @click="setFilter(activeFilter === f.value ? 'smart' : f.value)"
        >
          {{ f.label }}
          <span v-if="f.count > 0" class="ml-0.5 text-[9px] opacity-60">{{ f.count }}</span>
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="!nextLead" class="text-center py-3">
        <p class="text-[11px] text-gray-400">Keine Leads für diesen Filter</p>
        <button
          v-if="visitedIds.length > 0"
          class="mt-2 text-[10px] text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          @click="resetVisited"
        >
          <i class="pi pi-refresh text-[9px] mr-1" />
          Liste zurücksetzen ({{ visitedIds.length }} besucht)
        </button>
      </div>

      <template v-if="nextLead">
        <!-- Suggestion Card -->
        <div class="bg-white/60 rounded-lg p-3">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-[12px] font-semibold text-gray-800">{{ nextLeadName }}</h4>
            <span
              class="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
              :class="priorityClass"
            >
              {{ priorityLabel }}
            </span>
          </div>
          <div class="space-y-1 text-[10px] text-gray-500">
            <p v-if="nextLeadCity"><i class="pi pi-map-marker text-[9px] mr-1" />{{ nextLeadCity }}</p>
            <p v-if="nextLeadPhone"><i class="pi pi-phone text-[9px] mr-1" />{{ nextLeadPhone }}</p>
            <p><i class="pi pi-tag text-[9px] mr-1" />{{ nextLead.opportunity_stage }}</p>
            <p v-if="nextLeadBeds"><i class="pi pi-building text-[9px] mr-1" />{{ nextLeadBeds }} Betten</p>
          </div>
          <p class="text-[10px] text-emerald-700 font-medium mt-2">
            <i class="pi pi-info-circle text-[9px] mr-1" />
            {{ suggestionReason }}
          </p>
        </div>

        <!-- Quick Actions -->
        <div class="flex items-center gap-2">
          <NuxtLink
            :to="`/crm/leads/${nextLead.id}`"
            class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold transition-colors"
          >
            <i class="pi pi-arrow-right text-[10px]" />
            Lead öffnen
          </NuxtLink>
          <button
            class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-[11px] font-medium transition-colors"
            @click="skipLead"
          >
            <i class="pi pi-forward text-[10px]" />
            Überspringen
          </button>
        </div>

        <!-- Queue preview -->
        <div v-if="queuePreview.length > 0" class="border-t border-emerald-100 pt-2">
          <div class="flex items-center justify-between mb-1.5">
            <p class="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Danach:</p>
            <button
              v-if="visitedIds.length > 0"
              class="text-[9px] text-gray-400 hover:text-emerald-600 font-medium transition-colors"
              @click="resetVisited"
            >
              <i class="pi pi-refresh text-[8px] mr-0.5" />
              Neu starten ({{ visitedIds.length }} besucht)
            </button>
          </div>
          <div class="space-y-1">
            <div
              v-for="(item, qi) in queuePreview"
              :key="qi"
              class="flex items-center justify-between text-[10px] text-gray-500"
            >
              <div class="flex items-center gap-1.5">
                <span class="text-gray-300">{{ qi + 2 }}.</span>
                <span>{{ getLeadName(item.lead) }}</span>
              </div>
              <span class="text-[9px] text-gray-400">{{ item.shortReason }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NursingHomeLead, NursingHome, OpportunityStage } from '~/types/crm'
import { differenceInDays, parseISO } from 'date-fns'

const props = defineProps<{
  currentLeadId: string
}>()

const { visitedIds, activeFilter, markVisited, resetQueue, setFilter } = useNextLeadQueue()
const { leads: allLeadsRef, fetchLeads, pagination } = usePflegeheimLeads()
const isOpen = ref(false)
const skippedIds = ref<string[]>([])
const loaded = ref(false)

// Mark current lead as visited on every navigation
watch(() => props.currentLeadId, (id) => {
  if (id) markVisited(id)
}, { immediate: true })

onMounted(async () => {
  const prevLimit = pagination.value.limit
  pagination.value.limit = 500
  await fetchLeads()
  pagination.value.limit = prevLimit
  loaded.value = true
})

interface ScoredLead {
  lead: NursingHomeLead
  score: number
  reason: string
  shortReason: string
}

const getNh = (lead: NursingHomeLead): NursingHome | null => {
  return typeof lead.nursing_home_id === 'object' ? lead.nursing_home_id : null
}

const getLeadName = (lead: NursingHomeLead): string => {
  const nh = getNh(lead)
  return nh?.name || '–'
}

// Base active leads (exclude Won, Lost, Cancelled and current/skipped/visited)
const activeLeads = computed(() => {
  if (!loaded.value) return []
  const excludedStages = ['Won', 'Lost', 'Cancelled']
  return allLeadsRef.value.filter(l =>
    l.id !== props.currentLeadId &&
    !skippedIds.value.includes(l.id) &&
    !visitedIds.value.includes(l.id) &&
    !excludedStages.includes(l.opportunity_stage)
  )
})

// Count helpers for filter badges
const now = computed(() => new Date())
const today = computed(() => now.value.toISOString().split('T')[0])

const followUpLeads = computed(() => activeLeads.value.filter(l => {
  if (!l.follow_up_date) return false
  return l.follow_up_date.split('T')[0] <= today.value
}))

const countByStage = (stage: OpportunityStage) => activeLeads.value.filter(l => l.opportunity_stage === stage).length
const countPrioA = computed(() => activeLeads.value.filter(l => l.priority === 'high').length)
const countBeds100 = computed(() => activeLeads.value.filter(l => {
  const nh = getNh(l)
  return nh?.total_capacity && nh.total_capacity >= 100
}).length)

const filterOptions = computed(() => [
  { value: 'smart' as FilterMode, label: 'Smart', count: activeLeads.value.length },
  { value: 'follow_up' as FilterMode, label: 'Follow-up fällig', count: followUpLeads.value.length },
  { value: 'stage_qualified' as FilterMode, label: 'Qualified', count: countByStage('Qualified') },
  { value: 'stage_follow_up' as FilterMode, label: 'Follow-up', count: countByStage('Follow-up') },
  { value: 'stage_presentation' as FilterMode, label: 'Presentation', count: countByStage('Presentation') },
  { value: 'stage_email' as FilterMode, label: 'Email', count: countByStage('Email') },
  { value: 'stage_emergency' as FilterMode, label: 'Notfall-Tel.', count: countByStage('Emergency Phone') },
  { value: 'prio_a' as FilterMode, label: 'A-Leads', count: countPrioA.value },
  { value: 'beds_100' as FilterMode, label: '100+ Betten', count: countBeds100.value },
])

const activeFilterLabel = computed(() => {
  if (activeFilter.value === 'smart') return ''
  return filterOptions.value.find(f => f.value === activeFilter.value)?.label || ''
})

// Apply filter before scoring
const filteredLeads = computed(() => {
  const leads = activeLeads.value
  switch (activeFilter.value) {
    case 'follow_up':
      return followUpLeads.value
    case 'stage_qualified':
      return leads.filter(l => l.opportunity_stage === 'Qualified')
    case 'stage_follow_up':
      return leads.filter(l => l.opportunity_stage === 'Follow-up')
    case 'stage_presentation':
      return leads.filter(l => l.opportunity_stage === 'Presentation')
    case 'stage_email':
      return leads.filter(l => l.opportunity_stage === 'Email')
    case 'stage_emergency':
      return leads.filter(l => l.opportunity_stage === 'Emergency Phone')
    case 'prio_a':
      return leads.filter(l => l.priority === 'high')
    case 'beds_100':
      return leads.filter(l => {
        const nh = getNh(l)
        return nh?.total_capacity && nh.total_capacity >= 100
      })
    default:
      return leads
  }
})

const scoredLeads = computed<ScoredLead[]>(() => {
  if (!loaded.value) return []
  const leads = filteredLeads.value

  const scored: ScoredLead[] = leads.map(lead => {
    let score = 0
    let reason = ''
    let shortReason = ''
    const nh = getNh(lead)

    // 1. Overdue follow-up (highest priority)
    if (lead.follow_up_date) {
      const fuDate = lead.follow_up_date.split('T')[0]
      if (fuDate <= today.value) {
        const daysOverdue = differenceInDays(now.value, parseISO(fuDate))
        score += 50 + Math.min(daysOverdue, 30)
        reason = `Follow-up ${daysOverdue} Tag${daysOverdue !== 1 ? 'e' : ''} überfällig`
        shortReason = `FU +${daysOverdue}d`
      }
    }

    // 2. Priority (A > B > C)
    if (lead.priority === 'high') { score += 25; if (!reason) { reason = 'A-Lead (100+ Betten)'; shortReason = 'A-Lead' } }
    else if (lead.priority === 'medium') { score += 15; if (!reason) { reason = 'B-Lead (50–100 Betten)'; shortReason = 'B-Lead' } }
    else if (lead.priority === 'low') { score += 5 }

    // 3. Good stages
    if (lead.opportunity_stage === 'Qualified') { score += 20; if (!reason) { reason = 'Qualifizierter Lead — bereit für nächsten Schritt'; shortReason = 'Qualified' } }
    else if (lead.opportunity_stage === 'Follow-up') { score += 15; if (!reason) { reason = 'Follow-up Stage'; shortReason = 'Follow-up' } }
    else if (lead.opportunity_stage === 'Presentation') { score += 18; if (!reason) { reason = 'Präsentation anstehend'; shortReason = 'Presentation' } }
    else if (lead.opportunity_stage === 'Email') { score += 12; if (!reason) { reason = 'E-Mail gesendet — nachfassen'; shortReason = 'Nach E-Mail' } }
    else if (lead.opportunity_stage === 'Emergency Phone') { score += 16; if (!reason) { reason = 'Notfall-Telefon — dringend anrufen'; shortReason = 'Notfall-Tel.' } }

    // 4. No recent activity (needs attention)
    const daysSinceUpdate = lead.date_updated
      ? differenceInDays(now.value, parseISO(lead.date_updated))
      : 999

    if (daysSinceUpdate > 14 && daysSinceUpdate <= 30) {
      score += 10
      if (!reason) { reason = `${daysSinceUpdate} Tage ohne Aktivität`; shortReason = `${daysSinceUpdate}d inaktiv` }
    } else if (daysSinceUpdate > 30) {
      score += 8
      if (!reason) { reason = `${daysSinceUpdate} Tage ohne Kontakt — Re-Aktivierung`; shortReason = 'Re-Aktivierung' }
    }

    // 5. Has cooperation partner but in active stage (upsell potential)
    if (lead.has_cooperation_partner && ['Qualified', 'Follow-up'].includes(lead.opportunity_stage)) {
      score += 5
    }

    // 6. Bed count bonus
    if (nh?.total_capacity && nh.total_capacity > 100) score += 5

    // 7. Best call time bonus (if it's a good time right now)
    const hour = now.value.getHours()
    const day = now.value.getDay()
    if (day >= 2 && day <= 4 && hour >= 9 && hour < 12) score += 3

    if (!reason) { reason = 'Aktiver Lead'; shortReason = 'Aktiv' }

    return { lead, score, reason, shortReason }
  })

  // For follow_up filter, sort by days overdue (most overdue first)
  if (activeFilter.value === 'follow_up') {
    return scored.sort((a, b) => {
      const aOverdue = a.lead.follow_up_date ? differenceInDays(now.value, parseISO(a.lead.follow_up_date)) : 0
      const bOverdue = b.lead.follow_up_date ? differenceInDays(now.value, parseISO(b.lead.follow_up_date)) : 0
      return bOverdue - aOverdue
    })
  }

  return scored.sort((a, b) => b.score - a.score)
})

const nextLead = computed(() => scoredLeads.value[0]?.lead || null)
const suggestionReason = computed(() => scoredLeads.value[0]?.reason || '')

const nextLeadName = computed(() => nextLead.value ? getLeadName(nextLead.value) : '')
const nextLeadCity = computed(() => {
  if (!nextLead.value) return ''
  const nh = getNh(nextLead.value)
  return [nh?.zip, nh?.city].filter(Boolean).join(' ')
})
const nextLeadPhone = computed(() => {
  if (!nextLead.value) return ''
  return getNh(nextLead.value)?.fone || ''
})
const nextLeadBeds = computed(() => {
  if (!nextLead.value) return 0
  return getNh(nextLead.value)?.total_capacity || 0
})

const priorityLabel = computed(() => {
  switch (nextLead.value?.priority) {
    case 'high': return 'A'
    case 'medium': return 'B'
    case 'low': return 'C'
    default: return '–'
  }
})

const priorityClass = computed(() => {
  switch (nextLead.value?.priority) {
    case 'high': return 'bg-red-100 text-red-600'
    case 'medium': return 'bg-amber-100 text-amber-600'
    case 'low': return 'bg-gray-100 text-gray-500'
    default: return 'bg-gray-100 text-gray-400'
  }
})

const queuePreview = computed(() => scoredLeads.value.slice(1, 4))

const skipLead = () => {
  if (nextLead.value) {
    skippedIds.value = [...skippedIds.value, nextLead.value.id]
  }
}

const resetVisited = () => {
  resetQueue()
  skippedIds.value = []
}
</script>
