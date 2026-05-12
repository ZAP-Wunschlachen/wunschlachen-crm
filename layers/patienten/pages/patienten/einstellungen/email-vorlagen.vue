<template>
  <div class="p-6 max-w-4xl">
    <div class="flex items-center gap-2 mb-6">
      <button class="text-dental-blue--3 hover:text-dental-blue-0" @click="navigateTo('/patienten/einstellungen')">
        <i class="pi pi-arrow-left text-xs" />
      </button>
      <h1 class="text-2xl font-bold text-dental-blue-0">E-Mail Vorlagen</h1>
    </div>

    <div class="flex items-center justify-between mb-4">
      <select
        v-model="categoryFilter"
        class="field-input bg-white w-auto"
        @change="loadTemplates"
      >
        <option :value="null">Alle Kategorien</option>
        <option v-for="cat in EMAIL_TEMPLATE_CATEGORIES" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
      </select>
      <button
        class="px-3 py-1.5 text-xs font-medium text-white bg-dental-blue-0 hover:bg-dental-blue-1 rounded-lg transition-colors"
        @click="showEditor = true; editingTemplate = null"
      >
        <i class="pi pi-plus text-[10px] mr-1" />
        Neue Vorlage
      </button>
    </div>

    <div v-if="showEditor" class="mb-4">
      <PatientenEmailTemplateEditor
        :template="editingTemplate"
        @saved="onEditorSaved"
        @cancel="showEditor = false; editingTemplate = null"
      />
    </div>

    <div v-if="templates.length === 0" class="text-center py-16">
      <i class="pi pi-envelope text-3xl text-dental-blue--5 mb-3" />
      <p class="text-sm text-dental-blue--3">Keine Vorlagen in dieser Kategorie</p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="tpl in templates"
        :key="tpl.id"
        class="bg-white rounded-lg border border-dental-blue--5 p-4 hover:border-dental-blue--4 transition-colors cursor-pointer"
        @click="togglePreview(tpl.id)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-dental-blue-0">{{ tpl.name }}</p>
              <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-dental-blue--5 text-dental-blue--2 font-medium">
                {{ categoryLabel(tpl.category) }}
              </span>
              <span v-if="tpl.id.startsWith('custom_')" class="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-500 font-medium">
                Eigene
              </span>
            </div>
            <p class="text-[11px] text-dental-blue--3 mt-1 truncate">
              <strong>Betreff:</strong> {{ tpl.subject }}
            </p>
          </div>
          <div class="flex items-center gap-1">
            <button class="p-1.5 text-dental-blue--3 hover:text-dental-blue-0" title="Bearbeiten" @click.stop="startEdit(tpl)">
              <i class="pi pi-pencil text-[11px]" />
            </button>
            <button class="p-1.5 text-dental-blue--3 hover:text-power-red-0" title="Löschen" @click.stop="handleDelete(tpl)">
              <i class="pi pi-trash text-[11px]" />
            </button>
            <i class="pi text-[11px] text-dental-blue--3 ml-1" :class="expandedId === tpl.id ? 'pi-chevron-up' : 'pi-chevron-down'" />
          </div>
        </div>
        <div v-if="expandedId === tpl.id" class="mt-3 p-3 bg-soft-concrete--1 rounded-lg border border-dental-blue--5">
          <p class="text-[10px] font-medium text-dental-blue--3 mb-2 uppercase tracking-wider">Vorschau</p>
          <div class="text-xs text-dental-blue--2 prose prose-sm max-w-none" v-html="tpl.body_html" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EmailTemplate, EmailTemplateCategory } from '~/types/email'
import { EMAIL_TEMPLATE_CATEGORIES } from '~/types/email'

definePageMeta({ layout: 'crm', middleware: ['auth'] })

const { templates, fetchTemplates, deleteTemplate } = useEmailTemplates()

const categoryFilter = ref<EmailTemplateCategory | null>(null)
const expandedId = ref<string | null>(null)
const showEditor = ref(false)
const editingTemplate = ref<EmailTemplate | null>(null)

const loadTemplates = () => fetchTemplates(categoryFilter.value)

const categoryLabel = (cat: EmailTemplateCategory) =>
  EMAIL_TEMPLATE_CATEGORIES.find(c => c.value === cat)?.label || cat

const togglePreview = (id: string) => {
  expandedId.value = expandedId.value === id ? null : id
}

const startEdit = (tpl: EmailTemplate) => {
  editingTemplate.value = tpl
  showEditor.value = true
}

const onEditorSaved = () => {
  showEditor.value = false
  editingTemplate.value = null
  loadTemplates()
}

const handleDelete = async (tpl: EmailTemplate) => {
  if (!confirm(`Vorlage "${tpl.name}" wirklich löschen?`)) return
  await deleteTemplate(tpl.id)
  loadTemplates()
}

onMounted(loadTemplates)
</script>

<style scoped>
.field-input {
  @apply px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0;
}
</style>
