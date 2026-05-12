<template>
  <div>
    <label class="block text-[11px] text-dental-blue--3 font-medium mb-1">Vorlage</label>
    <select
      :value="modelValue"
      class="field-input bg-white"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value || null)"
    >
      <option value="">Keine Vorlage</option>
      <optgroup v-for="group in groupedTemplates" :key="group.label" :label="group.label">
        <option v-for="t in group.templates" :key="t.id" :value="t.id">{{ t.name }}</option>
      </optgroup>
    </select>
    <div v-if="selectedTemplate" class="mt-2 p-3 bg-soft-concrete--1 rounded-lg border border-dental-blue--5">
      <p class="text-[11px] font-medium text-dental-blue--2 mb-1">Vorschau:</p>
      <p class="text-[11px] text-dental-blue--3"><strong>Betreff:</strong> {{ resolvedSubject }}</p>
      <div class="text-[11px] text-dental-blue--3 mt-1 line-clamp-4" v-html="resolvedBody" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EmailTemplate } from '~/types/email'
import { EMAIL_TEMPLATE_CATEGORIES } from '~/types/email'

const props = defineProps<{
  modelValue: string | null
  templates: EmailTemplate[]
  context?: Record<string, Record<string, any>>
}>()

defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const { resolveTemplate } = useEmailTemplates()

const selectedTemplate = computed(() =>
  props.templates.find(t => t.id === props.modelValue)
)

const resolvedSubject = computed(() => {
  if (!selectedTemplate.value || !props.context) return selectedTemplate.value?.subject || ''
  return resolveTemplate(selectedTemplate.value.subject, props.context)
})

const resolvedBody = computed(() => {
  if (!selectedTemplate.value || !props.context) return selectedTemplate.value?.body_html || ''
  return resolveTemplate(selectedTemplate.value.body_html, props.context)
})

const groupedTemplates = computed(() => {
  return EMAIL_TEMPLATE_CATEGORIES
    .map(cat => ({
      label: cat.label,
      templates: props.templates.filter(t => t.category === cat.value && t.is_active),
    }))
    .filter(g => g.templates.length > 0)
})
</script>
