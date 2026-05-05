<template>
  <div class="p-6 max-w-6xl">
    <button class="flex items-center gap-1 text-sm text-dental-blue--2 hover:text-dental-blue-0 mb-4" @click="navigateTo('/patienten/workflows')">
      <i class="pi pi-arrow-left text-xs" />
      Zurueck
    </button>

    <div v-if="!workflow" class="text-center text-dental-blue--3 py-12">Lade Workflow...</div>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="lg:col-span-3 space-y-6">
          <!-- Header -->
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5 space-y-3">
            <div class="flex items-center justify-between">
              <input v-model="workflow.name" type="text" class="text-lg font-bold text-dental-blue-0 bg-transparent border-none outline-none w-full" @blur="save" />
              <button class="flex-shrink-0 ml-3" @click="workflow.is_active = !workflow.is_active; save()">
                <span class="inline-block w-10 h-5 rounded-full relative transition-colors" :class="workflow.is_active ? 'bg-dental-blue-0' : 'bg-dental-blue--5'">
                  <span class="absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform" :class="workflow.is_active ? 'left-[21px]' : 'left-[3px]'" />
                </span>
              </button>
            </div>
            <input v-model="workflow.description" type="text" class="field-input text-xs" placeholder="Beschreibung (optional)" @blur="save" />
          </div>

          <!-- Steps -->
          <div class="space-y-3">
            <h2 class="text-sm font-semibold text-dental-blue-0">Schritte ({{ workflow.steps.length }})</h2>
            <div v-for="(step, i) in workflow.steps" :key="step.id" class="space-y-2">
              <PatientenWorkflowStepEditor :step="step" :templates="emailTemplates" @update="updateStep(i, $event)" @remove="removeStep(i)" />
              <div v-if="i < workflow.steps.length - 1" class="flex justify-center">
                <div class="w-px h-4 bg-dental-blue--5" />
              </div>
            </div>
            <button class="w-full py-2.5 text-xs font-medium text-dental-blue--2 border border-dashed border-dental-blue--4 rounded-lg hover:border-dental-blue-0 hover:text-dental-blue-0" @click="addStep">
              <i class="pi pi-plus text-[10px] mr-1" />
              Schritt hinzufuegen
            </button>
          </div>
        </div>

        <!-- RIGHT -->
        <div class="space-y-4">
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <button :disabled="workflow.steps.length === 0" class="w-full px-4 py-2 text-xs font-medium text-white bg-dental-blue-0 hover:bg-dental-blue-1 rounded-lg disabled:opacity-40" @click="runWorkflow">
              Ausfuehren
            </button>
          </div>
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <button class="w-full px-4 py-2 text-xs font-medium text-power-red-0 border border-power-red-0 hover:bg-power-red-0/5 rounded-lg" @click="deleteWorkflow">
              Loeschen
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Workflow, WorkflowStep } from '~/types/workflow'
import type { Lead } from '~/types/crm'

definePageMeta({ layout: 'crm', middleware: ['auth'] })

const route = useRoute()
const { fetchWorkflow, updateWorkflow, removeWorkflow, executeWorkflow } = useWorkflows()
const { templates: emailTemplates, fetchTemplates: fetchEmailTemplates } = useEmailTemplates()

const workflow = ref<Workflow | null>(null)

const save = () => {
  if (!workflow.value) return
  updateWorkflow(workflow.value.id, {
    name: workflow.value.name,
    description: workflow.value.description,
    trigger_type: workflow.value.trigger_type,
    trigger_config: workflow.value.trigger_config,
    steps: workflow.value.steps,
    is_active: workflow.value.is_active,
  })
}

const addStep = () => {
  if (!workflow.value) return
  workflow.value.steps.push({ id: crypto.randomUUID(), type: 'email', label: '', config: {} })
  save()
}

const updateStep = (index: number, step: WorkflowStep) => {
  if (!workflow.value) return
  workflow.value.steps[index] = step
  save()
}

const removeStep = (index: number) => {
  if (!workflow.value) return
  workflow.value.steps.splice(index, 1)
  save()
}

const deleteWorkflow = () => {
  if (!workflow.value) return
  if (!confirm(`Workflow "${workflow.value.name}" wirklich loeschen?`)) return
  removeWorkflow(workflow.value.id)
  navigateTo('/patienten/workflows')
}

const runWorkflow = async () => {
  if (!workflow.value) return
  try {
    const { fetchLeads } = useLeads()
    const leads = await fetchLeads({}, ['-date_updated'], 1)
    const activeLeads = leads.filter((l: Lead) => !['done', 'cancelled'].includes(l.status))
    await executeWorkflow(workflow.value.id, activeLeads)
  } catch (err: any) {
    console.error('Workflow execution failed:', err)
  }
}

onMounted(async () => {
  const id = route.params.id as string
  workflow.value = fetchWorkflow(id)
  if (!workflow.value) { navigateTo('/patienten/workflows'); return }
  await fetchEmailTemplates()
})
</script>

<style scoped>
.field-input {
  @apply w-full px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0;
}
</style>
