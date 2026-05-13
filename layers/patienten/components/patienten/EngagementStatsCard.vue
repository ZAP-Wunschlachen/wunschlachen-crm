<template>
  <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
    <div class="flex items-center gap-2 mb-3">
      <i class="pi pi-chart-bar text-[12px] text-dental-blue-0" />
      <h3 class="text-sm font-semibold text-dental-blue-0">E-Mail-Engagement</h3>
    </div>

    <div v-if="stats.total_emails === 0" class="text-[11px] text-dental-blue--3 italic">
      Noch keine E-Mails versandt.
    </div>

    <div v-else class="space-y-2.5">
      <!-- Total -->
      <div class="flex items-center justify-between text-[12px]">
        <span class="text-dental-blue--2">Versandte E-Mails</span>
        <span class="text-dental-blue-0 font-medium tabular-nums">{{ stats.total_emails }}</span>
      </div>

      <!-- Open-Rate Bar -->
      <div>
        <div class="flex items-baseline justify-between text-[11px] mb-1">
          <span class="text-dental-blue--2">
            <i class="pi pi-eye text-[10px] mr-0.5" />Geöffnet
          </span>
          <span class="font-semibold tabular-nums" :class="rateColorClass(stats.open_rate)">
            {{ stats.opened }} / {{ stats.total_emails }} ({{ stats.open_rate }}%)
          </span>
        </div>
        <div class="h-1.5 rounded-full bg-dental-blue--6 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300"
            :style="{ width: stats.open_rate + '%', backgroundColor: rateBarColor(stats.open_rate) }"
          />
        </div>
      </div>

      <!-- Click-Rate Bar -->
      <div>
        <div class="flex items-baseline justify-between text-[11px] mb-1">
          <span class="text-dental-blue--2">
            <i class="pi pi-link text-[10px] mr-0.5" />Geklickt
          </span>
          <span class="font-semibold tabular-nums" :class="rateColorClass(stats.click_rate)">
            {{ stats.clicked }} / {{ stats.total_emails }} ({{ stats.click_rate }}%)
          </span>
        </div>
        <div class="h-1.5 rounded-full bg-dental-blue--6 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300"
            :style="{ width: stats.click_rate + '%', backgroundColor: rateBarColor(stats.click_rate) }"
          />
        </div>
      </div>

      <!-- Bounce-Warnung -->
      <div v-if="stats.bounced > 0" class="flex items-center justify-between text-[11px] pt-1 border-t border-dental-blue--6">
        <span class="text-red-600">
          <i class="pi pi-exclamation-triangle text-[10px] mr-0.5" />Bounce
        </span>
        <span class="text-red-600 font-semibold tabular-nums">{{ stats.bounced }}</span>
      </div>
    </div>

    <!-- Interpretation -->
    <div v-if="stats.total_emails > 0" class="mt-3 pt-3 border-t border-dental-blue--6">
      <p class="text-[11px] text-dental-blue--3 italic">{{ interpretation }}</p>
    </div>

    <div v-if="lead?.welcome_sequence_position != null" class="mt-3 pt-3 border-t border-dental-blue--5">
      <h3 class="text-[11px] font-semibold text-dental-blue-0 mb-1">Welcome-Sequenz</h3>
      <p class="text-[11px] text-dental-blue--3">
        Mail {{ lead.welcome_sequence_position }} / 6
        <span v-if="welcomeStatus" class="ml-2 italic">({{ welcomeStatus }})</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Lead, LeadActivity } from '~/types/crm'
import { useWelcomeSequence } from '../../composables/useWelcomeSequence'

const props = defineProps<{
  activities: LeadActivity[]
  lead?: Lead
}>()

const { shouldPauseFor } = useWelcomeSequence()
const welcomeStatus = computed(() => {
  if (!props.lead) return null
  const reason = shouldPauseFor(props.lead)
  if (reason === 'unsubscribed') return 'abgemeldet'
  if (reason === 'lost') return 'pausiert (lost)'
  if (reason === 'status_advanced') return 'pausiert (Termin steht)'
  if (reason === 'no_gdpr_consent') return 'fehlende DSGVO-Einwilligung'
  if ((props.lead.welcome_sequence_position ?? 0) >= 6) return 'abgeschlossen'
  return null
})

const { getEngagementStats } = useEmailEvents()

const stats = computed(() => getEngagementStats(props.activities))

const rateColorClass = (rate: number) => {
  if (rate >= 50) return 'text-green-600'
  if (rate >= 25) return 'text-amber-600'
  return 'text-red-600'
}

const rateBarColor = (rate: number) => {
  if (rate >= 50) return '#22c55e'
  if (rate >= 25) return '#f59e0b'
  return '#ef4444'
}

const interpretation = computed(() => {
  const s = stats.value
  if (s.total_emails === 0) return ''
  if (s.bounced > 0 && s.bounced / s.total_emails > 0.3) {
    return '⚠️ Hohe Bounce-Rate — E-Mail-Adresse prüfen.'
  }
  if (s.open_rate >= 50 && s.click_rate >= 20) {
    return '🟢 Hohes Engagement — Patient liest aufmerksam.'
  }
  if (s.open_rate < 20) {
    return '🔴 Niedrige Open-Rate — Betreff-Zeilen prüfen oder Channel wechseln.'
  }
  if (s.open_rate >= 30 && s.click_rate < 10) {
    return '🟡 Liest mit, klickt aber nicht — andere CTA-Strategie probieren.'
  }
  return '🟡 Durchschnittliches Engagement.'
})
</script>
