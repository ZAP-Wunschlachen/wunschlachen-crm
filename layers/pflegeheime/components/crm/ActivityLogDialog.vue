<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40" @click="close" />

        <!-- Dialog -->
        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 class="text-[14px] font-semibold text-gray-800">Aktivität erfassen</h3>
            <button class="text-gray-400 hover:text-gray-600 transition-colors" @click="close">
              <i class="pi pi-times text-[13px]" />
            </button>
          </div>

          <!-- Form -->
          <div class="px-5 py-4 space-y-4">
            <!-- Type -->
            <div>
              <label class="block text-[11px] text-gray-500 font-medium mb-1">Typ</label>
              <div class="grid grid-cols-5 gap-1.5">
                <button
                  v-for="t in selectableTypes"
                  :key="t.value"
                  class="flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-[10px] font-medium transition-all"
                  :class="form.type === t.value
                    ? 'border-[#172774] bg-[#172774]/5 text-[#172774]'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'"
                  @click="form.type = t.value"
                >
                  <CrmActivityIcon :type="t.value" />
                  {{ t.label }}
                </button>
              </div>
            </div>

            <!-- Subject -->
            <div>
              <label class="block text-[11px] text-gray-500 font-medium mb-1">Betreff</label>
              <input
                v-model="form.subject"
                type="text"
                placeholder="z.B. Erstgespräch mit Heimleitung"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
              />
            </div>

            <!-- Content -->
            <div>
              <label class="block text-[11px] text-gray-500 font-medium mb-1">Inhalt / Notizen</label>
              <textarea
                v-model="form.content"
                rows="3"
                placeholder="Details zur Aktivität..."
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] resize-none focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
              />
            </div>

            <!-- Direction + Outcome row -->
            <div v-if="showDirection || showOutcome" class="grid grid-cols-2 gap-3">
              <div v-if="showDirection">
                <label class="block text-[11px] text-gray-500 font-medium mb-1">Richtung</label>
                <select
                  v-model="form.direction"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                >
                  <option :value="null">–</option>
                  <option value="outbound">Ausgehend</option>
                  <option value="inbound">Eingehend</option>
                </select>
              </div>
              <div v-if="showOutcome">
                <label class="block text-[11px] text-gray-500 font-medium mb-1">Ergebnis</label>
                <select
                  v-model="form.outcome"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                >
                  <option :value="null">–</option>
                  <option v-for="o in ACTIVITY_OUTCOMES" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </div>
            </div>

            <!-- Meeting date/time -->
            <div v-if="showDateTime" class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] text-gray-500 font-medium mb-1">Datum</label>
                <input
                  v-model="form.meeting_date"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                />
              </div>
              <div>
                <label class="block text-[11px] text-gray-500 font-medium mb-1">Uhrzeit</label>
                <input
                  v-model="form.meeting_time"
                  type="time"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                />
              </div>
            </div>

            <!-- Duration -->
            <div v-if="showDuration" class="w-1/2">
              <label class="block text-[11px] text-gray-500 font-medium mb-1">Dauer (Minuten)</label>
              <input
                v-model.number="form.duration_minutes"
                type="number"
                min="0"
                placeholder="0"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
              />
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
            <button
              class="px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              @click="close"
            >
              Abbrechen
            </button>
            <button
              :disabled="!isValid || saving"
              class="px-4 py-2 text-[12px] font-medium text-white bg-[#172774] hover:bg-[#3d4a8e] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              @click="save"
            >
              <i v-if="saving" class="pi pi-spin pi-spinner text-[10px] mr-1" />
              Speichern
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { ActivityType, ActivityDirection, ActivityOutcome } from '~/types/crm'
import { ACTIVITY_OUTCOMES } from '~/types/crm'

const props = defineProps<{
  visible: boolean
  leadId: string
  initialType?: ActivityType
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const selectableTypes: { value: ActivityType; label: string }[] = [
  { value: 'call', label: 'Anruf' },
  { value: 'email_sent', label: 'E-Mail' },
  { value: 'meeting', label: 'Termin' },
  { value: 'note', label: 'Notiz' },
  { value: 'task', label: 'Aufgabe' },
]

const form = ref<{
  type: ActivityType
  subject: string
  content: string
  direction: ActivityDirection | null
  outcome: ActivityOutcome | null
  duration_minutes: number | null
  meeting_date: string
  meeting_time: string
}>({
  type: 'note',
  subject: '',
  content: '',
  direction: null,
  outcome: null,
  duration_minutes: null,
  meeting_date: '',
  meeting_time: '',
})

const saving = ref(false)
const { createActivity } = useActivities()

const showDirection = computed(() => ['call', 'email_sent', 'email_received', 'sms', 'whatsapp'].includes(form.value.type))
const showDuration = computed(() => ['call', 'meeting'].includes(form.value.type))
const showDateTime = computed(() => form.value.type === 'meeting')
const showOutcome = computed(() => form.value.type !== 'meeting')
const isValid = computed(() => {
  if (!form.value.subject.trim()) return false
  if (form.value.type === 'meeting' && !form.value.meeting_date) return false
  return true
})

watch(() => props.visible, (val) => {
  if (val) {
    // Default meeting date to today, time to next full hour
    const now = new Date()
    const nextHour = new Date(now)
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)

    form.value = {
      type: props.initialType || 'note',
      subject: '',
      content: '',
      direction: null,
      outcome: null,
      duration_minutes: null,
      meeting_date: now.toISOString().split('T')[0],
      meeting_time: `${String(nextHour.getHours()).padStart(2, '0')}:00`,
    }
  }
})

const close = () => emit('update:visible', false)

const save = async () => {
  if (!isValid.value) return
  saving.value = true
  try {
    // Build metadata for meetings (date/time)
    const metadata: Record<string, any> = {}
    if (form.value.type === 'meeting') {
      metadata.meeting_date = form.value.meeting_date
      metadata.meeting_time = form.value.meeting_time
      metadata.meeting_datetime = `${form.value.meeting_date}T${form.value.meeting_time || '00:00'}`
    }

    await createActivity({
      nursing_home_lead_id: props.leadId,
      type: form.value.type,
      subject: form.value.subject.trim(),
      content: form.value.content.trim() || null,
      direction: showDirection.value ? form.value.direction : null,
      outcome: showOutcome.value ? form.value.outcome : null,
      duration_minutes: showDuration.value ? form.value.duration_minutes : null,
      metadata: Object.keys(metadata).length > 0 ? metadata : null,
    })
    emit('saved')
    close()
  } catch (err) {
    console.error('Failed to save activity:', err)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
