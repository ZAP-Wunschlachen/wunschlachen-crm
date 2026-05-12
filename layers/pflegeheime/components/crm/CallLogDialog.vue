<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-[100] flex items-center justify-center"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/30" @click="cancel" />

      <!-- Dialog -->
      <div class="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl border border-gray-200/80 overflow-hidden">
        <!-- Header -->
        <div class="flex items-center gap-3 px-5 pt-5 pb-3">
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-[#172774]/10">
            <i class="pi pi-phone text-[16px] text-[#172774]" />
          </div>
          <div class="flex-1">
            <h3 class="text-[14px] font-semibold text-gray-900">Anruf protokollieren</h3>
            <p class="text-[11px] text-gray-400 mt-0.5">
              {{ contactName }} · {{ phoneNumber }}
            </p>
          </div>
          <button
            @click="cancel"
            class="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-50"
          >
            <i class="pi pi-times text-[12px]" />
          </button>
        </div>

        <!-- Call status indicator -->
        <div v-if="isLiveCall" class="mx-5 mb-3 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span class="text-[11px] font-medium text-green-700">
            Anruf aktiv · {{ formattedDuration }}
          </span>
          <button
            @click="endCall"
            class="ml-auto text-[10px] font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            <i class="pi pi-phone text-[9px] mr-0.5" style="transform: rotate(135deg)" />
            Beenden
          </button>
        </div>

        <!-- Form -->
        <div class="px-5 pb-4 space-y-3">
          <!-- Outcome -->
          <div>
            <label class="block text-[11px] text-gray-400 mb-1 font-medium">Ergebnis</label>
            <div class="grid grid-cols-2 gap-1.5">
              <button
                v-for="opt in outcomeOptions"
                :key="opt.value"
                @click="form.outcome = opt.value"
                class="flex items-center gap-1.5 px-2.5 py-2 text-[11px] font-medium rounded-md border transition-colors"
                :class="form.outcome === opt.value
                  ? 'border-[#172774] bg-[#172774]/5 text-[#172774]'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
              >
                <i :class="opt.icon" class="text-[10px]" />
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Duration -->
          <div>
            <label class="block text-[11px] text-gray-400 mb-1 font-medium">
              Dauer (Minuten)
              <i v-if="fetchingDuration" class="pi pi-spin pi-spinner text-[9px] ml-1 text-[#172774]" title="Lade Dauer von Placetel..." />
            </label>
            <input
              v-model.number="form.durationMinutes"
              type="number"
              min="0"
              class="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
              placeholder="0"
            />
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-[11px] text-gray-400 mb-1 font-medium">Notizen</label>
            <textarea
              v-model="form.notes"
              rows="3"
              class="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40 resize-none"
              placeholder="Gesprächsnotizen..."
              lang="de"
              spellcheck="true"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <button
            @click="cancel"
            class="px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Abbrechen
          </button>
          <button
            @click="save"
            :disabled="!form.outcome || saving"
            class="flex items-center gap-1 px-4 py-1.5 text-[11px] font-medium text-white bg-[#172774] rounded-md hover:bg-[#3d4a8e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i v-if="saving" class="pi pi-spin pi-spinner text-[10px]" />
            <i v-else class="pi pi-check text-[10px]" />
            Speichern
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ActivityOutcome } from '~/types/crm'

const props = defineProps<{
  visible: boolean
  leadId: string
  contactId?: string | null
  contactName?: string
  phoneNumber?: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const { callState, callDurationMinutes, hangup, logCall, resetCall, fetchCallDuration } = usePlacetel()
const fetchingDuration = ref(false)

const saving = ref(false)
const form = ref<{
  outcome: ActivityOutcome | null
  durationMinutes: number | null
  notes: string
}>({
  outcome: null,
  durationMinutes: null,
  notes: '',
})

const outcomeOptions = [
  { value: 'successful' as const, label: 'Erfolgreich', icon: 'pi pi-check-circle' },
  { value: 'no_contact' as const, label: 'Kein Kontakt', icon: 'pi pi-minus-circle' },
  { value: 'callback' as const, label: 'Rückruf', icon: 'pi pi-replay' },
  { value: 'rejection' as const, label: 'Ablehnung', icon: 'pi pi-times-circle' },
]

const isLiveCall = computed(() =>
  callState.value.active && (callState.value.status === 'connected' || callState.value.status === 'ringing')
)

// Live timer that ticks every second
const elapsedSeconds = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null

const startTimer = () => {
  stopTimer()
  elapsedSeconds.value = callState.value.startedAt
    ? Math.floor((Date.now() - callState.value.startedAt.getTime()) / 1000)
    : 0
  timerInterval = setInterval(() => {
    if (callState.value.startedAt) {
      elapsedSeconds.value = Math.floor((Date.now() - callState.value.startedAt.getTime()) / 1000)
    }
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const formattedDuration = computed(() => {
  const secs = elapsedSeconds.value
  const mins = Math.floor(secs / 60)
  const remainSecs = secs % 60
  if (mins < 1) return `${remainSecs}s`
  return `${mins}m ${remainSecs.toString().padStart(2, '0')}s`
})

const elapsedMinutes = computed(() => Math.ceil(elapsedSeconds.value / 60))

// Start/stop timer based on call state
watch(isLiveCall, (live) => {
  if (live) startTimer()
  else stopTimer()
}, { immediate: true })

// Auto-fill duration when call ends — try Placetel first, fallback to local timer
watch(() => callState.value.status, async (status) => {
  if (status === 'ended') {
    // Set local timer value as immediate fallback
    form.value.durationMinutes = elapsedMinutes.value || 1

    // Try to fetch real duration from Placetel
    if (props.phoneNumber) {
      fetchingDuration.value = true
      const realDuration = await fetchCallDuration(props.phoneNumber)
      if (realDuration !== null) {
        form.value.durationMinutes = realDuration
      }
      fetchingDuration.value = false
    }
  }
})

// Reset form when dialog opens
watch(() => props.visible, (v) => {
  if (v) {
    form.value = {
      outcome: null,
      durationMinutes: elapsedMinutes.value || null,
      notes: '',
    }
    if (isLiveCall.value) startTimer()
  } else {
    stopTimer()
  }
})

onUnmounted(() => stopTimer())

const endCall = () => {
  hangup()
}

const save = async () => {
  if (!form.value.outcome) return
  saving.value = true
  // Auto-fill duration from timer if still 0 or null
  const duration = form.value.durationMinutes || elapsedMinutes.value || undefined
  try {
    if (callState.value.active) hangup()
    await logCall(props.leadId, {
      contactId: props.contactId || undefined,
      outcome: form.value.outcome,
      durationMinutes: duration,
      notes: form.value.notes || undefined,
    })
    emit('update:visible', false)
    emit('saved')
  } finally {
    saving.value = false
  }
}

const cancel = () => {
  if (callState.value.active) resetCall()
  emit('update:visible', false)
}
</script>
