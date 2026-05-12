<template>
  <div>
    <label class="block text-[11px] text-gray-500 font-medium mb-1">Vorlage</label>
    <select
      :value="modelValue"
      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value || null)"
    >
      <option value="">Keine Vorlage</option>
      <optgroup v-for="group in groupedTemplates" :key="group.label" :label="group.label">
        <option v-for="t in group.templates" :key="t.id" :value="t.id">{{ t.name }}</option>
      </optgroup>
    </select>
    <!-- Preview -->
    <div v-if="selectedTemplate" class="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
      <p class="text-[11px] font-medium text-gray-600 mb-1">Vorschau:</p>
      <p class="text-[11px] text-gray-500"><strong>Betreff:</strong> {{ resolvedSubject }}</p>
      <div class="text-[11px] text-gray-500 mt-1 line-clamp-4" v-html="resolvedBody" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CrmEmailTemplate } from '~/types/crm'
import { EMAIL_TEMPLATE_CATEGORIES } from '~/types/crm'

const props = defineProps<{
  modelValue: string | null
  templates: CrmEmailTemplate[]
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
