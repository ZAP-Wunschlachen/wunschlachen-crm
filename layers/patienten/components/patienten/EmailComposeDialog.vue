<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40" @click="close" />
        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
          <div class="px-5 py-4 border-b border-dental-blue--5">
            <h3 class="text-sm font-semibold text-dental-blue-0">E-Mail senden</h3>
          </div>
          <div class="px-5 py-4 space-y-3">
            <div>
              <label class="text-xs text-dental-blue--3">An</label>
              <input :value="lead?.mail || ''" type="email" class="field-input" disabled />
            </div>
            <div>
              <label class="text-xs text-dental-blue--3">Betreff</label>
              <input v-model="subject" type="text" class="field-input" />
            </div>
            <div>
              <label class="text-xs text-dental-blue--3">Nachricht</label>
              <textarea v-model="body" rows="6" class="field-input resize-none" />
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-dental-blue--5">
            <button class="px-4 py-2 text-xs text-dental-blue--2 hover:bg-[#ededed] rounded-lg" @click="close">Abbrechen</button>
            <button class="px-4 py-2 text-xs text-white bg-dental-blue-0 rounded-lg" @click="send">Senden</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Lead } from '~/types/crm'

const props = defineProps<{ visible: boolean; leadId: string; lead?: Lead | null }>()
const emit = defineEmits(['update:visible', 'saved'])

const subject = ref('')
const body = ref('')

const close = () => emit('update:visible', false)

const send = async () => {
  if (!props.lead?.mail) return
  const { sendEmail } = useEmail()
  await sendEmail({ to: props.lead.mail, subject: subject.value, body_text: body.value, lead_id: props.leadId })
  const { addActivity } = useLeadActivities()
  addActivity({ lead_id: props.leadId, type: 'email_sent', subject: subject.value, content: body.value, direction: 'outbound' })
  subject.value = ''
  body.value = ''
  emit('saved')
  close()
}
</script>

<style scoped>
.field-input { @apply w-full px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
