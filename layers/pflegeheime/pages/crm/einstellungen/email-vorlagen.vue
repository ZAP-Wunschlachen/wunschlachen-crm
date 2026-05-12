<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-[16px] font-semibold text-gray-900">E-Mail Vorlagen</h2>
      <button
        class="px-3 py-1.5 text-[12px] font-medium text-white bg-[#172774] hover:bg-[#3d4a8e] rounded-lg transition-colors"
        @click="showEditor = true; editingTemplate = null"
      >
        <i class="pi pi-plus text-[10px] mr-1" />
        Neue Vorlage
      </button>
    </div>

    <!-- Editor -->
    <div v-if="showEditor" class="mb-4">
      <CrmEmailTemplateEditor
        :template="editingTemplate"
        @saved="onEditorSaved"
        @cancel="showEditor = false; editingTemplate = null"
      />
    </div>

    <!-- Filter -->
    <div class="mb-4">
      <select
        v-model="categoryFilter"
        class="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
        @change="loadTemplates"
      >
        <option :value="null">Alle Kategorien</option>
        <option v-for="cat in EMAIL_TEMPLATE_CATEGORIES" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
      </select>
    </div>

    <!-- Empty -->
    <div v-if="templates.length === 0" class="text-center py-16">
      <i class="pi pi-envelope text-3xl text-gray-200 mb-3" />
      <p class="text-[13px] text-gray-400">Keine Vorlagen in dieser Kategorie</p>
    </div>

    <!-- Template list -->
    <div v-else class="space-y-2">
      <div
        v-for="tpl in templates"
        :key="tpl.id"
        class="bg-white rounded-lg border border-gray-200/80 p-4 hover:border-gray-300 transition-colors cursor-pointer"
        @click="togglePreview(tpl.id)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-[13px] font-medium text-gray-800">{{ tpl.name }}</p>
              <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                {{ categoryLabel(tpl.category) }}
              </span>
              <span v-if="tpl.id.startsWith('custom_')" class="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-500 font-medium">
                Eigene
              </span>
            </div>
            <p class="text-[11px] text-gray-500 mt-1 truncate">
              <strong>Betreff:</strong> {{ tpl.subject }}
            </p>
          </div>
          <div class="flex items-center gap-1">
            <button
              class="p-1.5 text-gray-400 hover:text-[#172774] transition-colors"
              title="Bearbeiten"
              @click.stop="startEdit(tpl)"
            >
              <i class="pi pi-pencil text-[11px]" />
            </button>
            <button
              class="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
              title="Löschen"
              @click.stop="handleDelete(tpl)"
            >
              <i class="pi pi-trash text-[11px]" />
            </button>
            <i
              class="pi text-[11px] text-gray-400 ml-1"
              :class="expandedId === tpl.id ? 'pi-chevron-up' : 'pi-chevron-down'"
            />
          </div>
        </div>

        <!-- Preview -->
        <div v-if="expandedId === tpl.id" class="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p class="text-[10px] font-medium text-gray-500 mb-2 uppercase tracking-wider">Vorschau</p>
          <div class="text-[12px] text-gray-600 prose prose-sm max-w-none" v-html="tpl.body_html" />
          <div v-if="tpl.variables?.length" class="mt-3 flex flex-wrap gap-1">
            <span class="text-[10px] text-gray-400 mr-1">Variablen:</span>
            <span
              v-for="v in tpl.variables"
              :key="v"
              class="text-[9px] font-mono px-1.5 py-0.5 bg-gray-200/60 text-gray-500 rounded"
            >
              {{ v }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CrmEmailTemplate, EmailTemplateCategory } from '~/types/crm'
import { EMAIL_TEMPLATE_CATEGORIES } from '~/types/crm'

definePageMeta({ layout: 'crm', middleware: 'auth' })

const { templates, fetchTemplates, deleteTemplate } = useEmailTemplates()

const categoryFilter = ref<EmailTemplateCategory | null>(null)
const expandedId = ref<string | null>(null)
const showEditor = ref(false)
const editingTemplate = ref<CrmEmailTemplate | null>(null)

const loadTemplates = () => fetchTemplates(categoryFilter.value)

const categoryLabel = (cat: EmailTemplateCategory) =>
  EMAIL_TEMPLATE_CATEGORIES.find(c => c.value === cat)?.label || cat

const togglePreview = (id: string) => {
  expandedId.value = expandedId.value === id ? null : id
}

const startEdit = (tpl: CrmEmailTemplate) => {
  editingTemplate.value = tpl
  showEditor.value = true
}

const onEditorSaved = () => {
  showEditor.value = false
  editingTemplate.value = null
  loadTemplates()
}

const handleDelete = async (tpl: CrmEmailTemplate) => {
  if (!confirm(`Vorlage "${tpl.name}" wirklich löschen?`)) return
  await deleteTemplate(tpl.id)
  loadTemplates()
}

onMounted(loadTemplates)
</script>
