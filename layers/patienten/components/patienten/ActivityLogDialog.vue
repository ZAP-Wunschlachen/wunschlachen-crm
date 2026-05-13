<template>
  <Dialog
    v-model:visible="visible"
    header="Aktivität erfassen"
    :style="{ width: '520px' }"
    modal
    :closable="true"
  >
    <div class="space-y-4 pt-2">
      <!-- Type tabs — nur manuell erfassbare Types (System-Events laufen automatisch) -->
      <div class="flex flex-wrap gap-1 border-b border-dental-blue--5 pb-2">
        <button
          v-for="type in MANUAL_ACTIVITY_TYPES"
          :key="type"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
          :class="selectedType === type
            ? 'font-medium'
            : 'text-dental-blue--2 hover:bg-dental-blue--6'"
          :style="selectedType === type
            ? { backgroundColor: ACTIVITY_TYPE_CONFIG[type].bgColor, color: ACTIVITY_TYPE_CONFIG[type].color }
            : {}"
          @click="selectedType = type"
        >
          <i :class="ACTIVITY_TYPE_CONFIG[type].icon" class="text-[12px]" />
          {{ ACTIVITY_TYPE_CONFIG[type].label }}
        </button>
      </div>

      <!-- Subject -->
      <div v-if="fields.subject">
        <label class="text-xs text-dental-blue--2 font-medium">Betreff *</label>
        <input
          v-model="form.subject"
          type="text"
          class="w-full mt-1 px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0"
          :placeholder="subjectPlaceholder"
        />
      </div>

      <!-- Content -->
      <div v-if="fields.content">
        <label class="text-xs text-dental-blue--2 font-medium">{{ contentLabel }}</label>
        <textarea
          v-model="form.content"
          :rows="selectedType === 'note' ? 5 : 3"
          class="w-full mt-1 px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0 resize-none"
          :placeholder="contentPlaceholder"
        />
      </div>

      <!-- Direction -->
      <div v-if="fields.direction">
        <label class="text-xs text-dental-blue--2 font-medium">Richtung</label>
        <select
          v-model="form.direction"
          class="w-full mt-1 px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0 bg-white"
        >
          <option value="">— Auswählen —</option>
          <option v-for="(label, key) in ACTIVITY_DIRECTION_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>

      <!-- Outcome -->
      <div v-if="fields.outcome">
        <label class="text-xs text-dental-blue--2 font-medium">Ergebnis</label>
        <select
          v-model="form.outcome"
          class="w-full mt-1 px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0 bg-white"
        >
          <option value="">— Auswählen —</option>
          <option v-for="(label, key) in ACTIVITY_OUTCOME_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>

      <!-- Meeting date + time -->
      <div v-if="fields.meeting" class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs text-dental-blue--2 font-medium">Datum</label>
          <input
            v-model="form.meetingDate"
            type="date"
            class="w-full mt-1 px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0"
          />
        </div>
        <div>
          <label class="text-xs text-dental-blue--2 font-medium">Uhrzeit</label>
          <input
            v-model="form.meetingTime"
            type="time"
            class="w-full mt-1 px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0"
          />
        </div>
      </div>

      <!-- Duration -->
      <div v-if="fields.duration">
        <label class="text-xs text-dental-blue--2 font-medium">Dauer (Minuten)</label>
        <input
          v-model.number="form.durationMinutes"
          type="number"
          min="0"
          class="w-full mt-1 px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0"
          placeholder="z.B. 15"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <button
          class="px-3 py-1.5 text-sm font-medium text-dental-blue-0 bg-dental-blue--5 rounded-lg hover:bg-dental-blue--4"
          @click="visible = false"
        >
          Abbrechen
        </button>
        <button
          class="px-5 py-1.5 text-sm font-semibold text-white bg-dental-blue-0 rounded-lg hover:bg-dental-blue-1 disabled:opacity-50"
          :disabled="!form.subject.trim()"
          @click="save"
        >
          Speichern
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">

import {
  ACTIVITY_TYPE_CONFIG,
  ACTIVITY_DIRECTION_LABELS,
  ACTIVITY_OUTCOME_LABELS,
  ACTIVITY_FIELDS,
  MANUAL_ACTIVITY_TYPES,
  type LeadActivityType,
  type ActivityDirection,
  type ActivityOutcome,
} from '~/types/crm'

const props = defineProps<{
  leadId: string
  initialType?: LeadActivityType
}>()

const visible = defineModel<boolean>('visible', { default: false })
const emit = defineEmits<{ saved: [] }>()

// initialType auf manuell erfassbaren Type clampen
const resolveInitialType = (t?: LeadActivityType): LeadActivityType =>
  t && MANUAL_ACTIVITY_TYPES.includes(t) ? t : 'note'

const selectedType = ref<LeadActivityType>(resolveInitialType(props.initialType))

const fields = computed(() => ACTIVITY_FIELDS[selectedType.value])

const subjectPlaceholder = computed(() => {
  switch (selectedType.value) {
    case 'note':       return 'Kurze Zusammenfassung der Notiz'
    case 'call':       return 'z.B. „Erstkontakt versucht — Mailbox"'
    case 'email':      return 'z.B. „HKP-Erläuterung gesendet"'
    case 'sms':        return 'z.B. „Termin-Erinnerung"'
    case 'whatsapp':   return 'z.B. „Nachfrage Behandlung"'
    case 'meeting':    return 'z.B. „Beratungstermin"'
    case 'task':       return 'z.B. „Patient bis Freitag zurückrufen"'
    case 'newsletter': return 'z.B. „Sommer-Aktion versandt"'
    default:           return 'Kurze Zusammenfassung'
  }
})

const contentLabel = computed(() => selectedType.value === 'note' ? 'Notiz' : 'Details')
const contentPlaceholder = computed(() => {
  switch (selectedType.value) {
    case 'note':       return 'Beobachtung, Hinweis, interne Info …'
    case 'call':       return 'Was wurde besprochen, nächste Schritte …'
    case 'email':      return 'Stichworte zum Inhalt, ggf. Link zum Thread'
    case 'sms':
    case 'whatsapp':   return 'Original-Text oder Stichworte'
    case 'meeting':    return 'Agenda, Ergebnisse, To-Dos'
    case 'task':       return 'Was muss erledigt werden, bis wann'
    case 'newsletter': return 'Welche Mail, welche Liste …'
    default:           return ''
  }
})

watch(() => props.initialType, (val) => {
  if (val) selectedType.value = resolveInitialType(val)
})

const form = reactive({
  subject: '',
  content: '',
  direction: '' as ActivityDirection | '',
  outcome: '' as ActivityOutcome | '',
  meetingDate: '',
  meetingTime: '',
  durationMinutes: undefined as number | undefined,
})

const resetForm = () => {
  Object.assign(form, {
    subject: '',
    content: '',
    direction: '',
    outcome: '',
    meetingDate: '',
    meetingTime: '',
    durationMinutes: undefined,
  })
}

const save = () => {
  if (!form.subject.trim()) return

  const { addActivity } = useLeadActivities()
  const f = fields.value

  addActivity({
    lead_id: props.leadId,
    type: selectedType.value,
    subject: form.subject.trim(),
    content: f.content && form.content ? form.content : undefined,
    direction: f.direction && form.direction ? (form.direction as ActivityDirection) : undefined,
    outcome: f.outcome && form.outcome ? (form.outcome as ActivityOutcome) : undefined,
    duration_minutes: f.duration && form.durationMinutes ? form.durationMinutes : undefined,
    metadata: f.meeting && (form.meetingDate || form.meetingTime)
      ? { meeting_date: form.meetingDate || undefined, meeting_time: form.meetingTime || undefined }
      : undefined,
  })

  resetForm()
  visible.value = false
  emit('saved')
}

watch(visible, (val) => {
  if (!val) resetForm()
})
</script>
