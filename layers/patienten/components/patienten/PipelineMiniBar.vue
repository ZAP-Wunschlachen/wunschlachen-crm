<template>
  <div class="bg-white rounded-lg border border-dental-blue--5 px-4 py-3">
    <!-- Phase-Header -->
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-xs font-semibold text-dental-blue-0 uppercase tracking-wider">
        Pipeline-Position
      </h3>
      <div v-if="currentStatus === 'lost'" class="text-[11px] text-red-600 font-medium">
        ✗ Verloren
      </div>
      <div v-else-if="currentStatus === 'completed'" class="text-[11px] text-green-600 font-medium">
        ✓ Bestandspatient
      </div>
      <div v-else class="text-[11px] text-dental-blue--3">
        {{ currentPhaseLabel }} · Status {{ currentStatusIndex + 1 }}/{{ funnelLength }}
      </div>
    </div>

    <!-- Funnel-Bar (4 Phasen + Lost) -->
    <div class="grid gap-1" :style="{ gridTemplateColumns: 'repeat(' + funnelLength + ', 1fr)' }">
      <div
        v-for="(s, idx) in funnelStatuses"
        :key="s"
        class="relative flex flex-col items-center"
        :title="LEAD_STATUS_CONFIG[s].label + (idx === currentStatusIndex ? ' (aktuell)' : '')"
      >
        <!-- Step-Dot -->
        <div
          :class="[
            'w-3 h-3 rounded-full transition-all',
            idx < currentStatusIndex
              ? 'bg-dental-blue-0'
              : idx === currentStatusIndex
                ? 'bg-' + statusColorClass + ' ring-4 ring-' + statusColorClass + '/30 animate-pulse'
                : 'bg-dental-blue--5',
          ]"
          :style="{
            backgroundColor: idx <= currentStatusIndex ? LEAD_STATUS_CONFIG[s].color : '#e5e6ee',
            boxShadow: idx === currentStatusIndex ? `0 0 0 4px ${LEAD_STATUS_CONFIG[s].color}30` : 'none',
          }"
        />
        <!-- Verbindungs-Linie zum nächsten -->
        <div
          v-if="idx < funnelLength - 1"
          class="absolute top-1.5 left-1/2 h-px"
          :class="idx < currentStatusIndex ? 'bg-dental-blue-0' : 'bg-dental-blue--5'"
          style="width: calc(100% - 0.5rem); margin-left: 0.5rem"
        />
        <!-- Label unter Dot (small) -->
        <p
          class="text-[9px] mt-1.5 text-center leading-tight"
          :class="idx === currentStatusIndex ? 'text-dental-blue-0 font-semibold' : 'text-dental-blue--3'"
        >
          {{ LEAD_STATUS_CONFIG[s].label }}
        </p>
      </div>
    </div>

    <!-- Counter-Badges -->
    <div v-if="contactAttempts || missedAppointments" class="flex gap-3 mt-3 pt-3 border-t border-dental-blue--5 text-[11px]">
      <div v-if="contactAttempts" class="flex items-center gap-1 text-dental-blue--2">
        <i class="pi pi-phone text-[10px]" />
        <span>{{ contactAttempts }} Anruf-Versuche</span>
      </div>
      <div v-if="missedAppointments" class="flex items-center gap-1 text-red-600">
        <i class="pi pi-times-circle text-[10px]" />
        <span>{{ missedAppointments }}× No-Show</span>
      </div>
      <div v-if="daysInStatus !== null" class="flex items-center gap-1 text-dental-blue--3 ml-auto">
        <i class="pi pi-clock text-[10px]" />
        <span>Seit {{ daysInStatus }} Tagen im Status</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LEAD_STATUS_CONFIG, STATUS_TO_PHASE, PIPELINE_PHASE_CONFIG, type LeadStatus } from '~/types/crm'

const props = defineProps<{
  currentStatus: LeadStatus
  contactAttempts?: number
  missedAppointments?: number
  daysInStatus?: number | null
}>()

// 10 Status im linearen Funnel (lost ist außerhalb)
const funnelStatuses: LeadStatus[] = [
  'new',
  'contacting',
  'contacted',
  'consultation_scheduled',
  'consultation_done',
  'hkp_sent',
  'hkp_signed',
  'treatment_scheduled',
  'treatment_in_progress',
  'completed',
]
const funnelLength = funnelStatuses.length

const currentStatusIndex = computed(() => {
  if (props.currentStatus === 'lost') return -1
  return funnelStatuses.indexOf(props.currentStatus)
})

const statusColorClass = computed(() => {
  return LEAD_STATUS_CONFIG[props.currentStatus]?.color || '#94a3b8'
})

const currentPhaseLabel = computed(() => {
  const phase = STATUS_TO_PHASE[props.currentStatus]
  return phase ? PIPELINE_PHASE_CONFIG[phase].label : ''
})
</script>
