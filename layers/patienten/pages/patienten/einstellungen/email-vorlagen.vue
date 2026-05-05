<template>
  <div class="p-6 max-w-5xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-dental-blue-0">E-Mail Vorlagen</h1>
      <button class="px-3 py-1.5 text-xs font-medium text-white bg-dental-blue-0 hover:bg-dental-blue-1 rounded-lg" @click="createNew">
        Neue Vorlage
      </button>
    </div>

    <div class="space-y-3">
      <div
        v-for="tpl in templates"
        :key="tpl.id"
        class="bg-white rounded-lg p-4 border border-dental-blue--5 flex items-center justify-between cursor-pointer hover:border-dental-blue--4"
        @click="editTemplate = tpl"
      >
        <div>
          <p class="text-sm font-medium text-dental-blue-0">{{ tpl.name }}</p>
          <p class="text-xs text-dental-blue--3">{{ tpl.subject }}</p>
        </div>
        <span class="text-[10px] px-2 py-0.5 rounded-full bg-dental-blue--5 text-dental-blue-0">{{ tpl.category }}</span>
      </div>
    </div>

    <!-- Editor Dialog -->
    <PatientenEmailTemplateEditor
      v-if="editTemplate"
      :template="editTemplate"
      @close="editTemplate = null; loadTemplates()"
      @saved="editTemplate = null; loadTemplates()"
    />
  </div>
</template>

<script setup lang="ts">
import type { EmailTemplate } from '~/types/email'

definePageMeta({ layout: 'crm', middleware: ['auth'] })

const { templates, fetchTemplates, createTemplate } = useEmailTemplates()
const editTemplate = ref<EmailTemplate | null>(null)

const loadTemplates = () => fetchTemplates()

const createNew = async () => {
  const tpl = await createTemplate({ name: 'Neue Vorlage', subject: '', body_html: '', category: 'allgemein' })
  editTemplate.value = tpl
}

onMounted(loadTemplates)
</script>
