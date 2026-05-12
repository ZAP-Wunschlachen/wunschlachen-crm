<template>
  <div class="p-6 max-w-6xl">
    <!-- Back -->
    <button class="flex items-center gap-1 text-sm text-dental-blue--2 hover:text-dental-blue-0 mb-4" @click="navigateTo('/patienten/workflows')">
      <i class="pi pi-arrow-left text-xs" />
      Zurück
    </button>

    <div v-if="!workflow" class="text-center text-dental-blue--3 py-12">Lade Workflow...</div>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- LEFT: Editor (3 cols) -->
        <div class="lg:col-span-3 space-y-6">
          <!-- Header -->
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5 space-y-3">
            <div class="flex items-center justify-between">
              <input
                v-model="workflow.name"
                type="text"
                class="text-lg font-bold text-dental-blue-0 bg-transparent border-none outline-none w-full"
                placeholder="Workflow-Name"
                @blur="save"
              />
              <button
                class="flex-shrink-0 ml-3"
                :title="workflow.is_active ? 'Deaktivieren' : 'Aktivieren'"
                @click="workflow.is_active = !workflow.is_active; save()"
              >
                <span
                  class="inline-block w-10 h-5 rounded-full relative transition-colors"
                  :class="workflow.is_active ? 'bg-dental-blue-0' : 'bg-dental-blue--5'"
                >
                  <span
                    class="absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform"
                    :class="workflow.is_active ? 'left-[21px]' : 'left-[3px]'"
                  />
                </span>
              </button>
            </div>
            <input
              v-model="workflow.description"
              type="text"
              class="field-input text-xs"
              placeholder="Beschreibung (optional)"
              @blur="save"
            />
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] text-dental-blue--3 mb-0.5">Trigger</label>
                <select v-model="workflow.trigger_type" class="field-input text-xs" @change="save">
                  <option v-for="t in WORKFLOW_TRIGGER_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
                </select>
              </div>
              <div v-if="workflow.trigger_type === 'stage_change'">
                <label class="block text-[10px] text-dental-blue--3 mb-0.5">Ziel-Status</label>
                <select
                  :value="workflow.trigger_config?.to_status || ''"
                  class="field-input text-xs"
                  @change="workflow.trigger_config = { ...workflow.trigger_config, to_status: ($event.target as HTMLSelectElement).value || undefined }; save()"
                >
                  <option value="">— Beliebig —</option>
                  <option v-for="(cfg, key) in LEAD_STATUS_CONFIG" :key="key" :value="key">{{ cfg.label }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Steps -->
          <div class="space-y-3">
            <h2 class="text-sm font-semibold text-dental-blue-0">Schritte ({{ workflow.steps.length }})</h2>

            <div v-for="(step, i) in workflow.steps" :key="step.id" class="space-y-2">
              <PatientenWorkflowStepEditor
                :step="step"
                :templates="emailTemplates"
                @update="updateStep(i, $event)"
                @remove="removeStep(i)"
              />
              <!-- Connector line -->
              <div v-if="i < workflow.steps.length - 1" class="flex justify-center">
                <div class="w-px h-4 bg-dental-blue--5" />
              </div>
            </div>

            <button
              class="w-full py-2.5 text-xs font-medium text-dental-blue--2 border border-dashed border-dental-blue--4 rounded-lg hover:border-dental-blue-0 hover:text-dental-blue-0 transition-colors"
              @click="addStep"
            >
              <i class="pi pi-plus text-[10px] mr-1" />
              Schritt hinzufügen
            </button>
          </div>
        </div>

        <!-- RIGHT: Actions + Run History (1 col) -->
        <div class="space-y-4">
          <!-- Execute -->
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <button
              :disabled="workflow.steps.length === 0 || executing"
              class="w-full px-4 py-2 text-xs font-medium text-white bg-dental-blue-0 hover:bg-dental-blue-1 rounded-lg transition-colors disabled:opacity-40"
              @click="showRunDialog = true"
            >
              <i v-if="executing" class="pi pi-spin pi-spinner text-[10px] mr-1" />
              <i v-else class="pi pi-play text-[10px] mr-1" />
              Ausführen
            </button>
          </div>

          <!-- Delete -->
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <button
              class="w-full px-4 py-2 text-xs font-medium text-power-red-0 border border-power-red-0 hover:bg-power-red-0/5 rounded-lg transition-colors"
              @click="deleteWorkflow"
            >
              <i class="pi pi-trash text-[10px] mr-1" />
              Löschen
            </button>
          </div>

          <!-- Run History -->
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <h3 class="text-xs font-semibold text-dental-blue-0 mb-3">Letzte Ausf&uuml;hrungen</h3>
            <div v-if="runs.length === 0" class="text-[11px] text-dental-blue--3">Noch keine Ausf&uuml;hrungen</div>
            <div v-else class="space-y-2 max-h-[400px] overflow-y-auto">
              <div
                v-for="run in runs"
                :key="run.id"
                class="border border-dental-blue--5 rounded-lg p-2 cursor-pointer hover:bg-soft-concrete--1"
                @click="expandedRunId = expandedRunId === run.id ? null : run.id"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span
                      class="w-2 h-2 rounded-full"
                      :class="run.status === 'completed' ? 'bg-green-400' : run.status === 'failed' ? 'bg-red-400' : 'bg-amber-400'"
                    />
                    <span class="text-[10px] text-dental-blue--2">{{ run.lead_name || run.lead_id }}</span>
                  </div>
                  <span class="text-[9px] text-dental-blue--3">{{ formatDate(run.started_at) }}</span>
                </div>
                <div v-if="expandedRunId === run.id" class="mt-2 space-y-1">
                  <div
                    v-for="(entry, ei) in run.log"
                    :key="ei"
                    class="flex items-start gap-1.5 text-[10px]"
                  >
                    <i
                      class="text-[9px] mt-0.5"
                      :class="entry.status === 'done' ? 'pi pi-check text-green-500' : entry.status === 'error' ? 'pi pi-times text-red-500' : 'pi pi-minus text-gray-400'"
                    />
                    <span class="text-dental-blue--2">{{ entry.message }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Run Dialog -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showRunDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" @click="showRunDialog = false" />
          <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div class="px-5 py-4 border-b border-dental-blue--5">
              <h3 class="text-sm font-semibold text-dental-blue-0">Workflow ausführen</h3>
            </div>
            <div class="px-5 py-4 space-y-4">
              <!-- Target mode -->
              <div>
                <label class="block text-[11px] text-dental-blue--3 font-medium mb-1">Ziel-Leads</label>
                <select v-model="runTarget" class="field-input text-xs">
                  <option value="active">Alle aktiven Leads ({{ activeLeads.length }})</option>
                  <option value="qualified">Qualifiziert+ ({{ qualifiedLeads.length }})</option>
                  <option value="individual">Einzelauswahl</option>
                </select>
              </div>

              <!-- Individual selection -->
              <div v-if="runTarget === 'individual'" class="space-y-2">
                <input v-model="leadSearch" type="text" class="field-input text-xs" placeholder="Lead suchen..." />
                <div class="max-h-48 overflow-y-auto space-y-1">
                  <label
                    v-for="lead in filteredLeads"
                    :key="lead.id"
                    class="flex items-center gap-2 p-1.5 rounded hover:bg-soft-concrete--1 cursor-pointer"
                  >
                    <input v-model="selectedLeadIds" type="checkbox" :value="lead.id" class="accent-dental-blue-0" />
                    <span class="text-xs text-dental-blue-0">{{ lead.first_name }} {{ lead.last_name }}</span>
                    <span class="text-[10px] text-dental-blue--3 ml-auto">{{ lead.status }}</span>
                  </label>
                </div>
              </div>

              <p class="text-[11px] text-dental-blue--3">
                {{ targetLeadCount }} Lead(s) werden verarbeitet mit {{ workflow?.steps.length || 0 }} Schritten
              </p>
            </div>
            <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-dental-blue--5">
              <button class="px-4 py-2 text-xs font-medium text-dental-blue--2 hover:bg-[#ededed] rounded-lg" @click="showRunDialog = false">
                Abbrechen
              </button>
              <button
                :disabled="targetLeadCount === 0 || executing"
                class="px-4 py-2 text-xs font-medium text-white bg-dental-blue-0 hover:bg-dental-blue-1 rounded-lg disabled:opacity-40"
                @click="runWorkflow"
              >
                <i v-if="executing" class="pi pi-spin pi-spinner text-[10px] mr-1" />
                Ausführen ({{ targetLeadCount }})
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Toast position="bottom-right" />
  </div>
</template>

<script setup lang="ts">


import {
  WORKFLOW_TRIGGER_TYPES,
  type Workflow,
  type WorkflowStep,
  type WorkflowRun,
} from '~/types/workflow'
import { LEAD_STATUS_CONFIG, type Lead } from '~/types/crm'

definePageMeta({ layout: 'crm', middleware: ['auth'] })

const route = useRoute()
const toast = useToast()

const {
  fetchWorkflow,
  updateWorkflow,
  removeWorkflow,
  fetchWorkflowRuns,
  executeWorkflow,
} = usePatientWorkflows()

const { templates: emailTemplates, fetchTemplates: fetchEmailTemplates } = useEmailTemplates()

const workflow = ref<Workflow | null>(null)
const runs = ref<WorkflowRun[]>([])
const expandedRunId = ref<string | null>(null)

// Run dialog
const showRunDialog = ref(false)
const executing = ref(false)
const runTarget = ref<'active' | 'qualified' | 'individual'>('active')
const leadSearch = ref('')
const selectedLeadIds = ref<string[]>([])
const allLeads = ref<Lead[]>([])

const activeLeads = computed(() =>
  allLeads.value.filter(l => !['completed', 'lost'].includes(l.status))
)

const qualifiedLeads = computed(() =>
  allLeads.value.filter(l => ['consultation_scheduled', 'consultation_done', 'hkp_sent', 'hkp_signed', 'treatment_scheduled', 'treatment_in_progress'].includes(l.status))
)

const filteredLeads = computed(() => {
  if (!leadSearch.value.trim()) return allLeads.value
  const q = leadSearch.value.toLowerCase()
  return allLeads.value.filter(l =>
    `${l.first_name} ${l.last_name}`.toLowerCase().includes(q) ||
    l.mail?.toLowerCase().includes(q) ||
    l.phone?.includes(q)
  )
})

const targetLeadCount = computed(() => {
  if (runTarget.value === 'active') return activeLeads.value.length
  if (runTarget.value === 'qualified') return qualifiedLeads.value.length
  return selectedLeadIds.value.length
})

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
  workflow.value.steps.push({
    id: crypto.randomUUID(),
    type: 'email',
    label: '',
    config: { template_id: undefined, delay_days: undefined },
  })
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
  if (!confirm(`Workflow "${workflow.value.name}" wirklich löschen?`)) return
  removeWorkflow(workflow.value.id)
  navigateTo('/patienten/workflows')
}

const runWorkflow = async () => {
  if (!workflow.value) return
  executing.value = true
  try {
    let targetLeads: Lead[]
    if (runTarget.value === 'active') targetLeads = activeLeads.value
    else if (runTarget.value === 'qualified') targetLeads = qualifiedLeads.value
    else targetLeads = allLeads.value.filter(l => selectedLeadIds.value.includes(l.id))

    const result = await executeWorkflow(workflow.value.id, targetLeads)
    toast.add({
      severity: 'success',
      summary: 'Workflow ausgeführt',
      detail: `${result.completed} erfolgreich, ${result.failed} fehlgeschlagen`,
      life: 4000,
    })
    showRunDialog.value = false
    runs.value = fetchWorkflowRuns(workflow.value.id)
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Fehler', detail: err.message, life: 4000 })
  } finally {
    executing.value = false
  }
}

const formatDate = (date: string) => {
  try { return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) }
  catch { return date }
}

onMounted(async () => {
  const id = route.params.id as string
  workflow.value = fetchWorkflow(id)

  if (!workflow.value) {
    navigateTo('/patienten/workflows')
    return
  }

  runs.value = fetchWorkflowRuns(id)

  // Load leads for run dialog
  const { fetchLeads } = usePatientLeads()
  allLeads.value = await fetchLeads({}, ['-date_updated'], 1) || []

  // Load email templates for step editor
  await fetchEmailTemplates()
})
</script>

<style scoped>
.field-input {
  @apply w-full px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
