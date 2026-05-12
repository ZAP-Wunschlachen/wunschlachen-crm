<template>
  <div class="p-6 max-w-5xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-dental-blue-0">Workflows</h1>
      <button
        class="px-3 py-1.5 text-xs font-medium text-white bg-dental-blue-0 hover:bg-dental-blue-1 rounded-lg transition-colors"
        @click="createNew"
      >
        <i class="pi pi-plus text-[10px] mr-1" />
        Neuer Workflow
      </button>
    </div>

    <!-- Active Workflows -->
    <div v-if="workflows.length === 0 && !loading" class="text-center py-8 text-sm text-dental-blue--3">
      Keine Workflows vorhanden. Erstelle einen oder nutze eine Vorlage.
    </div>

    <div v-if="workflows.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <div
        v-for="wf in workflows"
        :key="wf.id"
        class="bg-white rounded-lg border border-dental-blue--5 p-4 hover:border-dental-blue--4 transition-colors cursor-pointer"
        @click="navigateTo(`/crm/workflows/${wf.id}`)"
      >
        <div class="flex items-start justify-between mb-2">
          <p class="text-sm font-medium text-dental-blue-0 truncate">{{ wf.name }}</p>
          <button
            class="flex-shrink-0 ml-2"
            :title="wf.is_active ? 'Deaktivieren' : 'Aktivieren'"
            @click.stop="toggleActive(wf)"
          >
            <span
              class="inline-block w-8 h-[18px] rounded-full relative transition-colors"
              :class="wf.is_active ? 'bg-dental-blue-0' : 'bg-dental-blue--5'"
            >
              <span
                class="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform"
                :class="wf.is_active ? 'left-[16px]' : 'left-[2px]'"
              />
            </span>
          </button>
        </div>
        <p v-if="wf.description" class="text-[11px] text-dental-blue--3 mb-2 line-clamp-2">{{ wf.description }}</p>
        <div class="flex items-center gap-2">
          <span class="text-[9px] px-1.5 py-0.5 rounded-full font-medium" :class="triggerBadgeClass(wf.trigger_type)">
            {{ triggerLabel(wf.trigger_type) }}
          </span>
          <span class="text-[10px] text-dental-blue--3">{{ wf.steps.length }} Schritte</span>
        </div>
      </div>
    </div>

    <!-- Template Gallery -->
    <div class="mt-8">
      <h2 class="text-sm font-semibold text-dental-blue-0 mb-4">Vorlagen</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(tpl, i) in templates"
          :key="i"
          class="bg-soft-concrete--1 rounded-lg border border-dashed border-dental-blue--4 p-4"
        >
          <p class="text-sm font-medium text-dental-blue-0 mb-1">{{ tpl.name }}</p>
          <p class="text-[11px] text-dental-blue--3 mb-3">{{ tpl.description }}</p>
          <div class="flex items-center justify-between">
            <span class="text-[9px] px-1.5 py-0.5 rounded-full font-medium" :class="triggerBadgeClass(tpl.trigger_type!)">
              {{ triggerLabel(tpl.trigger_type!) }}
            </span>
            <button
              class="px-2.5 py-1 text-[10px] font-medium text-dental-blue-0 border border-dental-blue-0 hover:bg-dental-blue-0/5 rounded-lg transition-colors"
              @click="useTemplate(tpl)"
            >
              Verwenden
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WORKFLOW_TRIGGER_TYPES, type WorkflowTriggerType, type Workflow } from '~/types/workflow'

definePageMeta({ layout: 'crm', middleware: ['auth'] })

const { workflows, fetchWorkflows, createWorkflow, updateWorkflow, getTemplates } = usePatientWorkflows()

const loading = ref(true)
const templates = getTemplates()

const triggerLabel = (type: WorkflowTriggerType) =>
  WORKFLOW_TRIGGER_TYPES.find(t => t.value === type)?.label || type

const triggerBadgeClass = (type: WorkflowTriggerType) => {
  const map: Record<WorkflowTriggerType, string> = {
    stage_change: 'bg-blue-50 text-blue-600',
    new_lead: 'bg-green-50 text-green-600',
    follow_up_due: 'bg-amber-50 text-amber-600',
    manual: 'bg-gray-100 text-gray-600',
  }
  return map[type] || 'bg-gray-100 text-gray-600'
}

const toggleActive = (wf: Workflow) => {
  updateWorkflow(wf.id, { is_active: !wf.is_active })
  fetchWorkflows()
}

const createNew = () => {
  const wf = createWorkflow({ name: 'Neuer Workflow', trigger_type: 'manual', steps: [] })
  navigateTo(`/crm/workflows/${wf.id}`)
}

const useTemplate = (tpl: Partial<Workflow>) => {
  const wf = createWorkflow({
    name: tpl.name,
    description: tpl.description,
    trigger_type: tpl.trigger_type,
    trigger_config: tpl.trigger_config,
    steps: (tpl.steps || []).map(s => ({ ...s, id: crypto.randomUUID() })),
  })
  navigateTo(`/crm/workflows/${wf.id}`)
}

onMounted(() => {
  fetchWorkflows()
  loading.value = false
})
</script>
