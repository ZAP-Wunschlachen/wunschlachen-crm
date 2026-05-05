<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40" @click="close" />
        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-sm">
          <div class="px-5 py-4 border-b border-dental-blue--5">
            <h3 class="text-sm font-semibold text-dental-blue-0">Aktivitaet loggen</h3>
          </div>
          <div class="px-5 py-4 space-y-3">
            <div>
              <label class="text-xs text-dental-blue--3">Typ</label>
              <select v-model="form.type" class="field-input text-xs">
                <option value="call">Anruf</option>
                <option value="note">Notiz</option>
                <option value="meeting">Meeting</option>
                <option value="task">Aufgabe</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-dental-blue--3">Betreff</label>
              <input v-model="form.subject" type="text" class="field-input" />
            </div>
            <div>
              <label class="text-xs text-dental-blue--3">Details</label>
              <textarea v-model="form.content" rows="3" class="field-input resize-none" />
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-dental-blue--5">
            <button class="px-4 py-2 text-xs text-dental-blue--2 hover:bg-[#ededed] rounded-lg" @click="close">Abbrechen</button>
            <button class="px-4 py-2 text-xs text-white bg-dental-blue-0 rounded-lg" @click="save">Speichern</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { LeadActivityType } from '~/types/crm'

const props = defineProps<{ visible: boolean; leadId: string; initialType?: LeadActivityType }>()
const emit = defineEmits(['update:visible', 'saved'])

const form = ref({ type: props.initialType || 'note', subject: '', content: '' })

const close = () => emit('update:visible', false)

const save = () => {
  const { addActivity } = useLeadActivities()
  addActivity({ lead_id: props.leadId, type: form.value.type as LeadActivityType, subject: form.value.subject, content: form.value.content })
  form.value = { type: 'note', subject: '', content: '' }
  emit('saved')
  close()
}
</script>

<style scoped>
.field-input { @apply w-full px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
