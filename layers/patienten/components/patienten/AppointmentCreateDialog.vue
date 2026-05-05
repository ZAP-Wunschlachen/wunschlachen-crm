<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40" @click="close" />
        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-sm">
          <div class="px-5 py-4 border-b border-dental-blue--5">
            <h3 class="text-sm font-semibold text-dental-blue-0">Termin anlegen</h3>
          </div>
          <div class="px-5 py-4 space-y-3">
            <div>
              <label class="text-xs text-dental-blue--3">Datum/Zeit</label>
              <input v-model="form.start_date_time" type="datetime-local" class="field-input" />
            </div>
            <div>
              <label class="text-xs text-dental-blue--3">Lead ID</label>
              <input v-model="form.lead_id" type="text" class="field-input" :placeholder="leadId || ''" />
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-dental-blue--5">
            <button class="px-4 py-2 text-xs text-dental-blue--2 hover:bg-[#ededed] rounded-lg" @click="close">Abbrechen</button>
            <button class="px-4 py-2 text-xs text-white bg-dental-blue-0 rounded-lg disabled:opacity-40" :disabled="!form.start_date_time" @click="submit">Erstellen</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ visible: boolean; leadId?: string }>()
const emit = defineEmits(['update:visible', 'saved'])

const form = ref({ start_date_time: '', lead_id: props.leadId || '' })

const close = () => emit('update:visible', false)

const submit = async () => {
  const { createAppointment } = useAppointments()
  await createAppointment({ start_date_time: form.value.start_date_time, lead_id: form.value.lead_id || props.leadId })
  emit('saved')
  close()
}
</script>

<style scoped>
.field-input { @apply w-full px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
