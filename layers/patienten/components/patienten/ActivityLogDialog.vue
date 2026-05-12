<template>
  <Dialog
    v-model:visible="visible"
    header="Aktivität erfassen"
    :style="{ width: '520px' }"
    modal
    :closable="true"
  >
    <div class="space-y-4 pt-2">
      <!-- Type tabs -->
      <div class="flex gap-1 border-b border-dental-blue--5 pb-2">
        <button
          v-for="(config, type) in ACTIVITY_TYPE_CONFIG"
          :key="type"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
          :class="selectedType === type
            ? 'font-medium'
            : 'text-dental-blue--2 hover:bg-dental-blue--6'"
          :style="selectedType === type
            ? { backgroundColor: config.bgColor, color: config.color }
            : {}"
          @click="selectedType = type"
        >
          <i :class="config.icon" class="text-[12px]" />
          {{ config.label }}
        </button>
      </div>

      <!-- Subject -->
      <div>
        <label class="text-xs text-dental-blue--2 font-medium">Betreff *</label>
        <input
          v-model="form.subject"
          type="text"
          class="w-full mt-1 px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0"
          placeholder="Kurze Zusammenfassung..."
        />
      </div>

      <!-- Content -->
      <div>
        <label class="text-xs text-dental-blue--2 font-medium">Notizen</label>
        <textarea
          v-model="form.content"
          rows="3"
          class="w-full mt-1 px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0 resize-none"
          placeholder="Details..."
        />
      </div>

      <!-- Direction (call/email only) -->
      <div v-if="selectedType === 'call' || selectedType === 'email'">
        <label class="text-xs text-dental-blue--2 font-medium">Richtung</label>
        <select
          v-model="form.direction"
          class="w-full mt-1 px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0 bg-white"
        >
          <option value="">— Auswählen —</option>
          <option v-for="(label, key) in ACTIVITY_DIRECTION_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>

      <!-- Outcome (all types) -->
      <div>
        <label class="text-xs text-dental-blue--2 font-medium">Ergebnis</label>
        <select
          v-model="form.outcome"
          class="w-full mt-1 px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0 bg-white"
        >
          <option value="">— Auswählen —</option>
          <option v-for="(label, key) in ACTIVITY_OUTCOME_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>

      <!-- Meeting date + time (meeting only) -->
      <div v-if="selectedType === 'meeting'" class="grid grid-cols-2 gap-3">
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

      <!-- Duration (call/meeting only) -->
      <div v-if="selectedType === 'call' || selectedType === 'meeting'">
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

const selectedType = ref<LeadActivityType>(props.initialType || 'note')

watch(() => props.initialType, (val) => {
  if (val) selectedType.value = val
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

  addActivity({
    lead_id: props.leadId,
    type: selectedType.value,
    subject: form.subject.trim(),
    content: form.content || undefined,
    direction: (form.direction || undefined) as ActivityDirection | undefined,
    outcome: (form.outcome || undefined) as ActivityOutcome | undefined,
    duration_minutes: form.durationMinutes || undefined,
    metadata: selectedType.value === 'meeting' && (form.meetingDate || form.meetingTime)
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
