<template>
  <div class="bg-white rounded-lg border border-gray-200/80 p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-[14px] font-semibold text-gray-800">
        {{ isEditing ? 'Vorlage bearbeiten' : 'Neue Vorlage' }}
      </h3>
      <button v-if="isEditing" class="text-[11px] text-red-500 hover:text-red-700 transition-colors" @click="$emit('cancel')">
        Abbrechen
      </button>
    </div>

    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[11px] text-gray-500 font-medium mb-1">Name</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Vorlagen-Name"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
          />
        </div>
        <div>
          <label class="block text-[11px] text-gray-500 font-medium mb-1">Kategorie</label>
          <select
            v-model="form.category"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
          >
            <option v-for="cat in EMAIL_TEMPLATE_CATEGORIES" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-[11px] text-gray-500 font-medium mb-1">Betreff</label>
        <input
          v-model="form.subject"
          type="text"
          placeholder="Betreff mit {{ contact.first_name }} Variablen"
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
        />
      </div>

      <!-- Variables toolbar -->
      <div>
        <label class="block text-[11px] text-gray-500 font-medium mb-1">Variablen einfügen</label>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="v in availableVariables"
            :key="v.key"
            class="px-2 py-1 text-[10px] font-mono bg-gray-100 text-gray-600 rounded hover:bg-[#172774]/10 hover:text-[#172774] transition-colors"
            @click="insertVariable(v.key)"
          >
            {{ v.key }}
          </button>
        </div>
      </div>

      <div>
        <label class="block text-[11px] text-gray-500 font-medium mb-1">Inhalt (HTML)</label>
        <textarea
          ref="bodyTextarea"
          v-model="form.body_html"
          rows="10"
          lang="de"
          spellcheck="true"
          placeholder="E-Mail-Inhalt..."
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] font-mono resize-y focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
        />
      </div>

      <label class="flex items-center gap-2 cursor-pointer">
        <input
          v-model="form.is_active"
          type="checkbox"
          class="rounded border-gray-300 text-[#172774] focus:ring-[#172774]/30 w-3.5 h-3.5"
        />
        <span class="text-[12px] text-gray-600">Aktiv</span>
      </label>

      <div class="flex justify-end gap-2">
        <button
          v-if="isEditing"
          class="px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          @click="$emit('cancel')"
        >
          Abbrechen
        </button>
        <button
          :disabled="!isValid || saving"
          class="px-4 py-2 text-[12px] font-medium text-white bg-[#172774] hover:bg-[#3d4a8e] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          @click="save"
        >
          <i v-if="saving" class="pi pi-spin pi-spinner text-[10px] mr-1" />
          {{ isEditing ? 'Aktualisieren' : 'Erstellen' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CrmEmailTemplate, EmailTemplateCategory } from '~/types/crm'
import { EMAIL_TEMPLATE_CATEGORIES } from '~/types/crm'

const props = defineProps<{
  template?: CrmEmailTemplate | null
}>()

const emit = defineEmits<{
  saved: []
  cancel: []
}>()

const { createTemplate, updateTemplate } = useEmailTemplates()

const bodyTextarea = ref<HTMLTextAreaElement | null>(null)
const saving = ref(false)

const isEditing = computed(() => !!props.template)

const form = ref({
  name: '',
  subject: '',
  body_html: '',
  category: 'general' as EmailTemplateCategory,
  is_active: true,
})

const availableVariables = [
  { key: '{{ contact.first_name }}', label: 'Vorname' },
  { key: '{{ contact.last_name }}', label: 'Nachname' },
  { key: '{{ contact.job_title }}', label: 'Position' },
  { key: '{{ home.name }}', label: 'Heim-Name' },
  { key: '{{ home.city }}', label: 'Stadt' },
]

const isValid = computed(() => form.value.name.trim() && form.value.subject.trim())

const insertVariable = (variable: string) => {
  const textarea = bodyTextarea.value
  if (!textarea) {
    form.value.body_html += variable
    return
  }
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = form.value.body_html
  form.value.body_html = text.substring(0, start) + variable + text.substring(end)
  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + variable.length
    textarea.focus()
  })
}

watch(() => props.template, (tpl) => {
  if (tpl) {
    form.value = {
      name: tpl.name,
      subject: tpl.subject,
      body_html: tpl.body_html,
      category: tpl.category,
      is_active: tpl.is_active,
    }
  } else {
    form.value = { name: '', subject: '', body_html: '', category: 'general', is_active: true }
  }
}, { immediate: true })

const save = async () => {
  if (!isValid.value) return
  saving.value = true
  try {
    if (props.template) {
      await updateTemplate(props.template.id, form.value)
    } else {
      await createTemplate(form.value)
    }
    emit('saved')
    if (!props.template) {
      form.value = { name: '', subject: '', body_html: '', category: 'general', is_active: true }
    }
  } catch (err) {
    console.error('Failed to save template:', err)
  } finally {
    saving.value = false
  }
}
</script>
