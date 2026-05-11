<template>
  <div>
    <!-- Toggle button -->
    <button
      class="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md transition-colors w-full justify-center"
      :class="isOpen
        ? 'bg-[#172774] text-white'
        : 'bg-[#172774]/5 text-[#172774] hover:bg-[#172774]/10 border border-[#172774]/20'"
      @click="toggle"
    >
      <i class="pi pi-sparkles text-[10px]" />
      KI Zusammenfassung
      <i class="pi text-[9px] ml-auto" :class="isOpen ? 'pi-chevron-up' : 'pi-chevron-down'" />
    </button>

    <!-- Summary panel -->
    <Transition name="slide">
      <div v-if="isOpen" class="mt-3 space-y-3">

        <!-- Lead Status Overview -->
        <div class="bg-gray-50 rounded-md p-3">
          <h4 class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Lead-Übersicht</h4>
          <div class="grid grid-cols-3 gap-2">
            <div class="text-center">
              <p class="text-[14px] font-bold text-gray-800">{{ daysSinceCreated }}</p>
              <p class="text-[9px] text-gray-400 mt-0.5">Tage alt</p>
            </div>
            <div class="text-center">
              <p class="text-[14px] font-bold" :style="{ color: stageColor }">{{ stageName }}</p>
              <p class="text-[9px] text-gray-400 mt-0.5">Stage</p>
            </div>
            <div class="text-center">
              <p class="text-[14px] font-bold" :class="priorityClass">{{ priorityLabel }}</p>
              <p class="text-[9px] text-gray-400 mt-0.5">Priorität</p>
            </div>
          </div>
        </div>

        <!-- Activity Summary -->
        <div class="bg-gray-50 rounded-md p-3">
          <h4 class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Aktivitäten</h4>
          <div class="space-y-1">
            <div v-for="stat in activityStats" :key="stat.label" class="flex items-center justify-between">
              <span class="text-[11px] text-gray-500">{{ stat.label }}</span>
              <span class="text-[11px] font-semibold text-gray-700">{{ stat.count }}</span>
            </div>
            <div class="pt-1 mt-1 border-t border-gray-200">
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-gray-500">Letzte Aktivität</span>
                <span class="text-[11px] font-medium text-gray-600">{{ lastActivityDate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Ghosting Risk -->
        <div class="rounded-md p-3" :class="ghostingBg">
          <div class="flex items-center gap-2 mb-1.5">
            <div class="w-2 h-2 rounded-full" :class="ghostingDotClass" />
            <h4 class="text-[10px] font-semibold uppercase tracking-wider" :class="ghostingTextClass">Ghosting-Risiko</h4>
          </div>
          <p class="text-[12px] font-bold" :class="ghostingTextClass">{{ ghostingLabel }}</p>
          <p class="text-[10px] mt-1" :class="ghostingMutedClass">{{ ghostingReason }}</p>
        </div>

        <!-- Recommended Action -->
        <div class="bg-[#172774]/5 rounded-md p-3 border border-[#172774]/10">
          <h4 class="text-[10px] font-semibold text-[#172774] uppercase tracking-wider mb-1.5">Empfohlene Aktion</h4>
          <p class="text-[12px] text-gray-700">{{ recommendedAction }}</p>
        </div>

      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { STAGE_COLORS } from '~/types/crm'
import type { CrmActivity, NursingHome, OpportunityStage, NursingHomeLead } from '~/types/crm'

const props = defineProps<{
  leadId: string
  activities: CrmActivity[]
  nursingHome: NursingHome | null
  lead: NursingHomeLead
}>()

const isOpen = ref(false)
const toggle = () => { isOpen.value = !isOpen.value }

// Lead overview
const daysSinceCreated = computed(() => {
  if (!props.lead?.date_created) return '–'
  const diff = Date.now() - new Date(props.lead.date_created).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
})

const stageName = computed(() => props.lead?.opportunity_stage || '–')
const stageColor = computed(() => STAGE_COLORS[props.lead?.opportunity_stage] || '#6b7280')

const priorityLabel = computed(() => {
  const map: Record<string, string> = { high: 'Hoch', medium: 'Mittel', low: 'Niedrig' }
  return map[props.lead?.priority || ''] || 'Keine'
})
const priorityClass = computed(() => {
  const map: Record<string, string> = { high: 'text-red-600', medium: 'text-yellow-600', low: 'text-green-600' }
  return map[props.lead?.priority || ''] || 'text-gray-400'
})

// Activity stats
const activityStats = computed(() => {
  const acts = props.activities || []
  const counts: Record<string, number> = {}
  acts.forEach(a => { counts[a.type] = (counts[a.type] || 0) + 1 })
  return [
    { label: 'Anrufe', count: counts['call'] || 0 },
    { label: 'E-Mails', count: (counts['email_sent'] || 0) + (counts['email_received'] || 0) },
    { label: 'Termine', count: counts['meeting'] || 0 },
    { label: 'Notizen', count: counts['note'] || 0 },
    { label: 'Gesamt', count: acts.length },
  ]
})

const lastActivityDate = computed(() => {
  const acts = props.activities || []
  if (acts.length === 0) return 'Keine'
  const sorted = [...acts].sort((a, b) =>
    new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime()
  )
  const d = sorted[0]?.date_created
  if (!d) return 'Keine'
  return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })
})

// Ghosting risk
const ghostingData = computed(() => {
  const acts = props.activities || []
  const stage = props.lead?.opportunity_stage

  // Days since last activity
  let daysSinceLast = 999
  if (acts.length > 0) {
    const sorted = [...acts].sort((a, b) =>
      new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime()
    )
    const lastDate = sorted[0]?.date_created
    if (lastDate) {
      daysSinceLast = Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))
    }
  }

  // Count no_contact outcomes
  const noContactCount = acts.filter(a => a.outcome === 'no_contact').length

  // Calculate score
  let score = 0
  if (daysSinceLast > 14) score += 3
  else if (daysSinceLast > 7) score += 2
  else if (daysSinceLast > 3) score += 1

  if (noContactCount >= 3) score += 3
  else if (noContactCount >= 2) score += 2
  else if (noContactCount >= 1) score += 1

  // Early stages with no activity = higher risk
  if (['Unqualified', 'Qualified', 'Follow-up'].includes(stage || '') && acts.length === 0) score += 2

  let level: 'high' | 'medium' | 'low'
  let reason: string
  if (score >= 5) {
    level = 'high'
    reason = `${daysSinceLast} Tage seit letzter Aktivität, ${noContactCount}x kein Kontakt`
  } else if (score >= 3) {
    level = 'medium'
    reason = daysSinceLast > 7
      ? `${daysSinceLast} Tage ohne Kontakt`
      : `${noContactCount} Kontaktversuche ohne Erfolg`
  } else {
    level = 'low'
    reason = 'Regelmäßiger Kontakt'
  }

  return { level, reason, daysSinceLast }
})

const ghostingLabel = computed(() => {
  const map = { high: 'Hoch', medium: 'Mittel', low: 'Niedrig' }
  return map[ghostingData.value.level]
})
const ghostingBg = computed(() => {
  const map = { high: 'bg-red-50', medium: 'bg-yellow-50', low: 'bg-green-50' }
  return map[ghostingData.value.level]
})
const ghostingDotClass = computed(() => {
  const map = { high: 'bg-red-500', medium: 'bg-yellow-500', low: 'bg-green-500' }
  return map[ghostingData.value.level]
})
const ghostingTextClass = computed(() => {
  const map = { high: 'text-red-700', medium: 'text-yellow-700', low: 'text-green-700' }
  return map[ghostingData.value.level]
})
const ghostingMutedClass = computed(() => {
  const map = { high: 'text-red-500', medium: 'text-yellow-600', low: 'text-green-600' }
  return map[ghostingData.value.level]
})
const ghostingReason = computed(() => ghostingData.value.reason)

// Recommended action
const recommendedAction = computed(() => {
  const stage = props.lead?.opportunity_stage
  const acts = props.activities || []
  const daysSinceLast = ghostingData.value.daysSinceLast
  const lastAct = acts.length > 0
    ? [...acts].sort((a, b) => new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime())[0]
    : null

  if (acts.length === 0) return 'Erstansprache per Telefon oder E-Mail starten'
  if (daysSinceLast > 14) return 'Dringend: Follow-up Anruf durchführen — langer Inaktivitätszeitraum'
  if (lastAct?.outcome === 'no_contact') return 'Erneuten Kontaktversuch zu anderer Uhrzeit planen'
  if (lastAct?.outcome === 'callback') return 'Rückruf wie vereinbart durchführen'
  if (stage === 'Email') return 'Telefonisches Follow-up zur gesendeten E-Mail'
  if (stage === 'Presentation') return 'Präsentationstermin bestätigen und Unterlagen vorbereiten'
  if (stage === 'Follow-up') return 'Follow-up Gespräch führen, nächste Schritte klären'
  if (stage === 'Qualified') return 'Erstgespräch planen und Präsentation anbieten'
  if (daysSinceLast > 5) return 'Follow-up planen — seit ' + daysSinceLast + ' Tagen kein Kontakt'
  return 'Kontakt aufrechterhalten und nächsten Schritt planen'
})
</script>

<style scoped>
.slide-enter-active, .slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
}
.slide-enter-to, .slide-leave-from {
  opacity: 1;
  max-height: 600px;
}
</style>
