<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40" @click="close" />

        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 class="text-[14px] font-semibold text-gray-800">E-Mail verfassen</h3>
            <button class="text-gray-400 hover:text-gray-600 transition-colors" @click="close">
              <i class="pi pi-times text-[13px]" />
            </button>
          </div>

          <div class="px-5 py-4 space-y-4">
            <!-- Template selector -->
            <CrmEmailTemplateSelector
              v-model="selectedTemplateId"
              :templates="templates"
              :context="templateContext"
              @update:model-value="applyTemplate"
            />

            <!-- To -->
            <div>
              <label class="block text-[11px] text-gray-500 font-medium mb-1">An</label>
              <input
                v-model="form.to"
                type="email"
                placeholder="email@example.com"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
              />
            </div>

            <!-- Subject -->
            <div>
              <label class="block text-[11px] text-gray-500 font-medium mb-1">Betreff</label>
              <input
                v-model="form.subject"
                type="text"
                placeholder="Betreff eingeben..."
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
              />
            </div>

            <!-- Body -->
            <div>
              <label class="block text-[11px] text-gray-500 font-medium mb-1">Nachricht</label>
              <textarea
                v-model="form.body"
                rows="10"
                lang="de"
                spellcheck="true"
                placeholder="Nachricht schreiben..."
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] resize-y focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40 font-sans"
              />
            </div>

            <!-- Send status -->
            <div v-if="sendError" class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <i class="pi pi-exclamation-triangle text-red-500 text-[13px]" />
              <p class="text-[11px] text-red-700">{{ sendError }}</p>
            </div>
            <div v-if="sendSuccess" class="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <i class="pi pi-check-circle text-green-500 text-[13px]" />
              <p class="text-[11px] text-green-700">{{ sendSuccess }}</p>
            </div>
            <div v-if="USE_LOCAL" class="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <i class="pi pi-info-circle text-blue-500 text-[13px]" />
              <p class="text-[11px] text-blue-700">
                Testmodus: E-Mail wird nicht versendet, sondern als Aktivität gespeichert.
              </p>
            </div>
            <div v-else-if="!emailConfigured" class="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <i class="pi pi-info-circle text-amber-500 text-[13px]" />
              <p class="text-[11px] text-amber-700">
                E-Mail-Versand nicht konfiguriert. E-Mail wird als Entwurf gespeichert.
                <br /><span class="text-[10px]">Setup: EMAIL_PROVIDER, EMAIL_USER, EMAIL_PASSWORD in Directus Env-Vars setzen.</span>
              </p>
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
              v-if="!emailConfigured"
              :disabled="!isValid || saving"
              class="px-4 py-2 text-[12px] font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              @click="saveAsDraft"
            >
              <i v-if="saving" class="pi pi-spin pi-spinner text-[10px] mr-1" />
              Als Entwurf speichern
            </button>
            <button
              :disabled="!isValid || !form.to || saving"
              class="px-4 py-2 text-[12px] font-medium text-white bg-[#172774] hover:bg-[#3d4a8e] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              @click="sendEmail"
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
import type { CrmEmailTemplate, NursingHome, NursingHomeContact } from '~/types/crm'

const props = defineProps<{
  visible: boolean
  leadId: string
  contact?: NursingHomeContact | null
  nursingHome?: NursingHome | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const USE_LOCAL = true

const { templates, fetchTemplates, resolveTemplate } = useEmailTemplates()
const { createActivity } = useActivities()

const selectedTemplateId = ref<string | null>(null)
const saving = ref(false)
const sendError = ref('')
const sendSuccess = ref('')
const emailConfigured = ref(USE_LOCAL ? true : false)

const form = ref({
  to: '',
  subject: '',
  body: '',
})

const templateContext = computed(() => ({
  contact: {
    first_name: props.contact?.first_name || '',
    last_name: props.contact?.last_name || '',
    email: props.contact?.email || '',
    job_title: props.contact?.job_title || '',
  },
  home: {
    name: props.nursingHome?.name || '',
    city: props.nursingHome?.city || '',
  },
}))

const isValid = computed(() => form.value.subject.trim().length > 0)

const applyTemplate = (templateId: string | null) => {
  if (!templateId) return
  const tpl = templates.value.find(t => t.id === templateId)
  if (!tpl) return

  form.value.subject = resolveTemplate(tpl.subject, templateContext.value)
  // Strip HTML for textarea
  const div = document.createElement('div')
  div.innerHTML = resolveTemplate(tpl.body_html, templateContext.value)
  form.value.body = div.textContent || div.innerText || ''
}

const checkEmailConfig = async () => {
  try {
    const config = useRuntimeConfig()
    const baseURL = config.public.directusUrl || 'http://localhost:8080'
    const res = await fetch(`${baseURL}/email-service/accounts`, {
      credentials: 'include',
    })
    if (res.ok) {
      const json = await res.json()
      emailConfigured.value = json.data?.[0]?.configured || false
    }
  } catch {
    emailConfigured.value = false
  }
}

watch(() => props.visible, async (val) => {
  if (val) {
    form.value = { to: props.contact?.email || '', subject: '', body: '' }
    selectedTemplateId.value = null
    sendError.value = ''
    sendSuccess.value = ''
    if (USE_LOCAL) {
      await fetchTemplates()
    } else {
      await Promise.all([fetchTemplates(), checkEmailConfig()])
    }
  }
})

const close = () => emit('update:visible', false)

const sendEmail = async () => {
  if (!isValid.value || !form.value.to) return
  saving.value = true
  sendError.value = ''
  try {
    if (USE_LOCAL) {
      await createActivity({
        nursing_home_lead_id: props.leadId,
        type: 'email_sent',
        subject: form.value.subject.trim(),
        content: form.value.body.trim() || null,
        direction: 'outbound',
        metadata: { to: form.value.to, status: 'sent' },
      })
      sendSuccess.value = `E-Mail an ${form.value.to} als Aktivität gespeichert (Testmodus)`
      saving.value = false
      setTimeout(() => { emit('saved'); close() }, 1200)
      return
    } else {
      const config = useRuntimeConfig()
      const baseURL = config.public.directusUrl || 'http://localhost:8080'
      const res = await fetch(`${baseURL}/email-service/send`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: form.value.to,
          subject: form.value.subject.trim(),
          body_text: form.value.body.trim(),
          body_html: `<pre style="font-family: sans-serif; white-space: pre-wrap;">${form.value.body.trim()}</pre>`,
          lead_id: props.leadId,
        }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: 'Unbekannter Fehler' }))
        throw new Error(json.error || `HTTP ${res.status}`)
      }
    }

    emit('saved')
    close()
  } catch (err: any) {
    sendError.value = err.message || 'Fehler beim Senden'
    console.error('Failed to send email:', err)
  } finally {
    saving.value = false
  }
}

const saveAsDraft = async () => {
  if (!isValid.value) return
  saving.value = true
  try {
    await createActivity({
      nursing_home_lead_id: props.leadId,
      type: 'email_sent',
      subject: form.value.subject.trim(),
      content: form.value.body.trim() || null,
      direction: 'outbound',
      metadata: { to: form.value.to, status: 'draft' },
    })
    emit('saved')
    close()
  } catch (err) {
    console.error('Failed to save email draft:', err)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
