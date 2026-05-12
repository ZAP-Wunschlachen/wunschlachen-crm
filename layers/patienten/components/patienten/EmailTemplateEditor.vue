<template>
  <div class="bg-white rounded-lg border border-dental-blue--5 p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-dental-blue-0">
        {{ isEditing ? 'Vorlage bearbeiten' : 'Neue Vorlage' }}
      </h3>
      <button v-if="isEditing" class="text-[11px] text-power-red-0 hover:text-red-700" @click="$emit('cancel')">
        Abbrechen
      </button>
    </div>

    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[11px] text-dental-blue--3 font-medium mb-1">Name</label>
          <input v-model="form.name" type="text" placeholder="Vorlagen-Name" class="field-input" />
        </div>
        <div>
          <label class="block text-[11px] text-dental-blue--3 font-medium mb-1">Kategorie</label>
          <select v-model="form.category" class="field-input bg-white">
            <option v-for="cat in EMAIL_TEMPLATE_CATEGORIES" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-[11px] text-dental-blue--3 font-medium mb-1">Betreff</label>
        <input v-model="form.subject" type="text" placeholder="Betreff mit {{ patient.first_name }} Variablen" class="field-input" />
      </div>

      <div>
        <label class="block text-[11px] text-dental-blue--3 font-medium mb-1">Variablen einfügen</label>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="v in availableVariables"
            :key="v"
            class="px-2 py-1 text-[10px] font-mono bg-dental-blue--5 text-dental-blue--2 rounded hover:bg-dental-blue-0/10 hover:text-dental-blue-0 transition-colors"
            @click="insertVariable(v)"
          >
            {{ v }}
          </button>
        </div>
      </div>

      <div>
        <label class="block text-[11px] text-dental-blue--3 font-medium mb-1">Inhalt (HTML)</label>
        <textarea
          ref="bodyTextarea"
          v-model="form.body_html"
          rows="10"
          lang="de"
          spellcheck="true"
          placeholder="E-Mail-Inhalt..."
          class="field-input resize-y font-mono"
        />
      </div>

      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="form.is_active" type="checkbox" class="rounded border-dental-blue--5 text-dental-blue-0 w-3.5 h-3.5" />
        <span class="text-xs text-dental-blue--2">Aktiv</span>
      </label>

      <div class="flex justify-end gap-2">
        <button
          v-if="isEditing"
          class="px-4 py-2 text-xs font-medium text-dental-blue--2 hover:bg-[#ededed] rounded-lg transition-colors"
          @click="$emit('cancel')"
        >
          Abbrechen
        </button>
        <button
          :disabled="!isValid || saving"
          class="px-4 py-2 text-xs font-medium text-white bg-dental-blue-0 hover:bg-dental-blue-1 rounded-lg transition-colors disabled:opacity-40"
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
import type { EmailTemplate, EmailTemplateCategory } from '~/types/email'
import { EMAIL_TEMPLATE_CATEGORIES } from '~/types/email'

const props = defineProps<{
  template?: EmailTemplate | null
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
  category: 'allgemein' as EmailTemplateCategory,
  is_active: true,
})

const availableVariables = [
  '{{ patient.first_name }}',
  '{{ patient.last_name }}',
  '{{ patient.email }}',
  '{{ location.name }}',
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
    form.value = { name: '', subject: '', body_html: '', category: 'allgemein', is_active: true }
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
      form.value = { name: '', subject: '', body_html: '', category: 'allgemein', is_active: true }
    }
  } catch (err) {
    console.error('Failed to save template:', err)
  } finally {
    saving.value = false
  }
}
</script>
