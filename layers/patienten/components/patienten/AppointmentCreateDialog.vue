<template>
  <Dialog
    :visible="visible"
    modal
    header="Termin anlegen"
    :style="{ width: '480px' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[11px] text-dental-blue--3 font-medium mb-1">Start</label>
          <input
            v-model="form.start_date_time"
            type="datetime-local"
            class="field-input"
          />
        </div>
        <div>
          <label class="block text-[11px] text-dental-blue--3 font-medium mb-1">Ende</label>
          <input
            v-model="form.end_date_time"
            type="datetime-local"
            class="field-input"
          />
        </div>
      </div>

      <div v-if="!leadId">
        <label class="block text-[11px] text-dental-blue--3 font-medium mb-1">Lead (optional)</label>
        <input
          v-model="form.lead_id"
          type="text"
          placeholder="Lead-ID"
          class="field-input"
        />
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button
          class="px-4 py-2 text-xs font-medium text-dental-blue--2 hover:bg-[#ededed] rounded-lg transition-colors"
          @click="$emit('update:visible', false)"
        >
          Abbrechen
        </button>
        <button
          :disabled="!isValid || saving"
          class="px-4 py-2 text-xs font-medium text-white bg-dental-blue-0 hover:bg-dental-blue-1 rounded-lg transition-colors disabled:opacity-40"
          @click="save"
        >
          <i v-if="saving" class="pi pi-spin pi-spinner text-[10px] mr-1" />
          Erstellen
        </button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog'

const props = defineProps<{
  visible: boolean
  leadId?: string | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const { createAppointment } = useAppointments()
const saving = ref(false)

const form = ref({
  start_date_time: '',
  end_date_time: '',
  lead_id: '',
})

const isValid = computed(() => form.value.start_date_time && form.value.end_date_time)

// Pre-fill lead_id when prop changes
watch(() => props.leadId, (id) => {
  if (id) form.value.lead_id = id
}, { immediate: true })

// Reset form when dialog opens
watch(() => props.visible, (v) => {
  if (v) {
    form.value = {
      start_date_time: '',
      end_date_time: '',
      lead_id: props.leadId || '',
    }
  }
})

const save = async () => {
  if (!isValid.value) return
  saving.value = true
  try {
    await createAppointment({
      start_date_time: form.value.start_date_time,
      end_date_time: form.value.end_date_time,
      lead_id: form.value.lead_id || null,
      attendance_status: 'scheduled',
    })
    emit('saved')
    emit('update:visible', false)
  } catch (err) {
    console.error('Failed to create appointment:', err)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.field-input {
  @apply w-full px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0;
}
</style>
