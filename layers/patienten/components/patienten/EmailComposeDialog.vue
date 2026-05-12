<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40" @click="close" />

        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-dental-blue--5">
            <h3 class="text-sm font-semibold text-dental-blue-0">Nachricht verfassen</h3>
            <button class="text-dental-blue--3 hover:text-dental-blue-0 transition-colors" @click="close">
              <i class="pi pi-times text-[13px]" />
            </button>
          </div>

          <!-- Channel tabs -->
          <div class="flex border-b border-dental-blue--5">
            <button
              v-for="ch in channels"
              :key="ch.value"
              class="flex-1 px-4 py-2.5 text-xs font-medium transition-colors"
              :class="channel === ch.value
                ? 'text-dental-blue-0 border-b-2 border-dental-blue-0'
                : 'text-dental-blue--3 hover:text-dental-blue--2'"
              @click="channel = ch.value"
            >
              <i :class="ch.icon" class="text-[11px] mr-1" />
              {{ ch.label }}
            </button>
          </div>

          <div class="px-5 py-4 space-y-4">
            <!-- Template selector (email only) -->
            <CrmEmailTemplateSelector
              v-if="channel === 'email'"
              v-model="selectedTemplateId"
              :templates="templates"
              :context="templateContext"
              @update:model-value="applyTemplate"
            />

            <!-- To (email) -->
            <div v-if="channel === 'email'">
              <label class="block text-[11px] text-dental-blue--3 font-medium mb-1">An</label>
              <input v-model="form.to" type="email" placeholder="email@example.com" class="field-input" />
            </div>

            <!-- Phone (SMS/WhatsApp) -->
            <div v-if="channel !== 'email'">
              <label class="block text-[11px] text-dental-blue--3 font-medium mb-1">Telefonnummer</label>
              <input v-model="form.phone" type="tel" placeholder="+49..." class="field-input" />
            </div>

            <!-- Subject (email only) -->
            <div v-if="channel === 'email'">
              <label class="block text-[11px] text-dental-blue--3 font-medium mb-1">Betreff</label>
              <input v-model="form.subject" type="text" placeholder="Betreff eingeben..." class="field-input" />
            </div>

            <!-- Body -->
            <div>
              <label class="block text-[11px] text-dental-blue--3 font-medium mb-1">Nachricht</label>
              <textarea
                v-model="form.body"
                :rows="channel === 'email' ? 10 : 4"
                lang="de"
                spellcheck="true"
                placeholder="Nachricht schreiben..."
                class="field-input resize-y"
              />
              <p v-if="channel === 'sms'" class="text-[10px] text-dental-blue--3 mt-1">
                {{ form.body.length }} / 160 Zeichen
              </p>
            </div>

            <!-- Status messages -->
            <div v-if="sendError" class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <i class="pi pi-exclamation-triangle text-red-500 text-[13px]" />
              <p class="text-[11px] text-red-700">{{ sendError }}</p>
            </div>
            <div v-if="sendSuccess" class="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <i class="pi pi-check-circle text-green-500 text-[13px]" />
              <p class="text-[11px] text-green-700">{{ sendSuccess }}</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-dental-blue--5">
            <button
              class="px-4 py-2 text-xs font-medium text-dental-blue--2 hover:bg-[#ededed] rounded-lg transition-colors"
              @click="close"
            >
              Abbrechen
            </button>
            <button
              :disabled="!isValid || saving"
              class="px-4 py-2 text-xs font-medium text-white bg-dental-blue-0 hover:bg-dental-blue-1 rounded-lg transition-colors disabled:opacity-40"
              @click="send"
            >
              <i v-if="saving" class="pi pi-spin pi-spinner text-[10px] mr-1" />
              <i v-else class="pi pi-send text-[10px] mr-1" />
              Senden
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Lead } from '~/types/crm'

const props = defineProps<{
  visible: boolean
  leadId: string
  lead?: Lead | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const { templates, fetchTemplates, resolveTemplate } = useEmailTemplates()
const { sendEmail: sendViaDirectus, checkConfig } = useEmail()
const { addActivity } = useLeadActivities()

type Channel = 'email' | 'sms' | 'whatsapp'
const channels: { value: Channel; label: string; icon: string }[] = [
  { value: 'email', label: 'E-Mail', icon: 'pi pi-envelope' },
  { value: 'sms', label: 'SMS', icon: 'pi pi-comment' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'pi pi-comments' },
]

const channel = ref<Channel>('email')
const selectedTemplateId = ref<string | null>(null)
const saving = ref(false)
const sendError = ref('')
const sendSuccess = ref('')
const emailConfigured = ref(false)

const form = ref({
  to: '',
  phone: '',
  subject: '',
  body: '',
})

const templateContext = computed(() => ({
  patient: {
    first_name: props.lead?.first_name || '',
    last_name: props.lead?.last_name || '',
    email: props.lead?.mail || '',
  },
  location: {
    name: typeof props.lead?.location === 'object' ? props.lead.location.name || '' : '',
  },
}))

const isValid = computed(() => {
  if (channel.value === 'email') return form.value.subject.trim().length > 0 && form.value.to.trim().length > 0
  return form.value.phone.trim().length > 0 && form.value.body.trim().length > 0
})

const applyTemplate = (templateId: string | null) => {
  if (!templateId) return
  const tpl = templates.value.find(t => t.id === templateId)
  if (!tpl) return

  form.value.subject = resolveTemplate(tpl.subject, templateContext.value)
  const div = document.createElement('div')
  div.innerHTML = resolveTemplate(tpl.body_html, templateContext.value)
  form.value.body = div.textContent || div.innerText || ''
}

const close = () => emit('update:visible', false)

watch(() => props.visible, async (val) => {
  if (val) {
    form.value = {
      to: props.lead?.mail || '',
      phone: props.lead?.phone || '',
      subject: '',
      body: '',
    }
    channel.value = 'email'
    selectedTemplateId.value = null
    sendError.value = ''
    sendSuccess.value = ''
    await Promise.all([fetchTemplates(), checkConfig().then(v => { emailConfigured.value = v })])
  }
})

const send = async () => {
  if (!isValid.value) return
  saving.value = true
  sendError.value = ''
  try {
    if (channel.value === 'email') {
      if (emailConfigured.value) {
        const result = await sendViaDirectus({
          to: form.value.to,
          subject: form.value.subject.trim(),
          body_text: form.value.body.trim(),
          body_html: `<pre style="font-family: sans-serif; white-space: pre-wrap;">${form.value.body.trim()}</pre>`,
          lead_id: props.leadId,
        })
        if (!result.success) throw new Error(result.error)
      }
      // Always log activity
      addActivity({
        lead_id: props.leadId,
        type: 'email_sent',
        subject: form.value.subject.trim(),
        content: form.value.body.trim() || undefined,
        direction: 'outbound',
        metadata: { to: form.value.to, status: emailConfigured.value ? 'sent' : 'draft' },
      })
    } else if (channel.value === 'sms') {
      const { sendSms } = useBrevoCom()
      const result = await sendSms(form.value.phone, form.value.body.trim())
      if (!result.success) throw new Error(result.error)
      addActivity({
        lead_id: props.leadId,
        type: 'sms',
        subject: `SMS an ${form.value.phone}`,
        content: form.value.body.trim(),
        direction: 'outbound',
      })
    } else if (channel.value === 'whatsapp') {
      const { sendWhatsApp } = useBrevoCom()
      const result = await sendWhatsApp(form.value.phone, form.value.body.trim())
      if (!result.success) throw new Error(result.error)
      addActivity({
        lead_id: props.leadId,
        type: 'whatsapp',
        subject: `WhatsApp an ${form.value.phone}`,
        content: form.value.body.trim(),
        direction: 'outbound',
      })
    }

    sendSuccess.value = channel.value === 'email'
      ? `E-Mail an ${form.value.to} gesendet`
      : `${channel.value.toUpperCase()} an ${form.value.phone} gesendet`
    setTimeout(() => { emit('saved'); close() }, 1000)
  } catch (err: any) {
    sendError.value = err.message || 'Fehler beim Senden'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.field-input {
  @apply w-full px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
