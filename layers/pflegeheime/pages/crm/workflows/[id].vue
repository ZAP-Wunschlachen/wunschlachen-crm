<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <NuxtLink to="/crm/workflows" class="text-[11px] text-gray-400 hover:text-gray-600 transition-colors font-medium">
          <i class="pi pi-arrow-left text-[9px] mr-0.5" />
          Workflows
        </NuxtLink>
        <h2 v-if="workflow" class="text-[16px] font-semibold text-gray-900 mt-0.5">{{ workflow.name }}</h2>
      </div>
      <div v-if="workflow" class="flex items-center gap-2">
        <button
          class="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors"
          :class="workflow.is_active
            ? 'text-green-700 bg-green-50 border border-green-200 hover:bg-green-100'
            : 'text-gray-500 bg-white border border-gray-200 hover:bg-gray-50'"
          @click="toggleActive"
        >
          <i :class="workflow.is_active ? 'pi pi-check-circle' : 'pi pi-circle'" class="text-[10px]" />
          {{ workflow.is_active ? 'Aktiv' : 'Inaktiv' }}
        </button>
        <button
          v-if="!isNew && workflow.steps.length > 0"
          class="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          :disabled="executing"
          @click="showRunDialog = true"
        >
          <i :class="executing ? 'pi pi-spin pi-spinner' : 'pi pi-play'" class="text-[10px]" />
          Ausfuehren
        </button>
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-[#172774] hover:bg-[#3d4a8e] rounded-lg transition-colors"
          :disabled="saving"
          @click="saveWorkflow"
        >
          <i :class="saving ? 'pi pi-spin pi-spinner' : 'pi pi-save'" class="text-[10px]" />
          Speichern
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <i class="pi pi-spin pi-spinner text-xl text-gray-300" />
    </div>

    <!-- Content -->
    <div v-else-if="workflow" class="grid grid-cols-1 lg:grid-cols-4 gap-4">

      <!-- LEFT: Editor -->
      <div class="lg:col-span-3 space-y-4">

        <!-- Name + Description -->
        <div class="bg-white rounded-lg border border-gray-200/80 p-4">
          <div class="space-y-3">
            <div>
              <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Name</label>
              <input
                v-model="workflow.name"
                type="text"
                class="mt-1 w-full px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40 transition-all"
                placeholder="Workflow Name..."
              />
            </div>
            <div>
              <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Beschreibung</label>
              <textarea
                v-model="workflow.description"
                rows="2"
                class="mt-1 w-full px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40 transition-all resize-none"
                placeholder="Beschreibung..."
              />
            </div>
            <div>
              <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Trigger</label>
              <select
                v-model="workflow.trigger_type"
                class="mt-1 w-full px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
              >
                <option v-for="t in WORKFLOW_TRIGGER_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Steps (vertical timeline) -->
        <div class="bg-white rounded-lg border border-gray-200/80 p-4">
          <h3 class="text-[12px] font-semibold text-gray-700 uppercase tracking-wider mb-4">Schritte</h3>

          <div v-if="workflow.steps.length === 0" class="text-center py-8">
            <p class="text-[12px] text-gray-400 mb-2">Keine Schritte vorhanden</p>
            <button
              class="text-[11px] text-[#172774] hover:underline"
              @click="addStep(0)"
            >
              Ersten Schritt hinzufuegen
            </button>
          </div>

          <div v-else class="relative">
            <!-- Timeline line -->
            <div class="absolute left-4 top-3 bottom-3 w-px bg-gray-200" />

            <div v-for="(step, idx) in workflow.steps" :key="step.id" class="relative">
              <!-- Step card -->
              <div class="ml-10 mb-1">
                <div class="bg-gray-50 rounded-lg border border-gray-200/80 p-3">
                  <!-- Step header -->
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <!-- Timeline dot -->
                      <div class="absolute left-2.5 w-3 h-3 rounded-full border-2 border-[#172774] bg-white" />
                      <span class="text-[10px] text-gray-400 font-medium tabular-nums">{{ idx + 1 }}.</span>
                      <select
                        v-model="step.type"
                        class="px-2 py-0.5 text-[11px] bg-white border border-gray-200 rounded text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30"
                        @change="resetStepConfig(step)"
                      >
                        <option v-for="st in WORKFLOW_STEP_TYPES" :key="st.value" :value="st.value">{{ st.label }}</option>
                      </select>
                      <input
                        v-model="step.label"
                        type="text"
                        class="px-2 py-0.5 text-[11px] bg-white border border-gray-200 rounded text-gray-700 w-32 focus:outline-none focus:ring-1 focus:ring-[#172774]/30"
                        placeholder="Bezeichnung..."
                      />
                    </div>
                    <button
                      class="p-1 text-gray-300 hover:text-red-500 transition-colors"
                      title="Schritt entfernen"
                      @click="removeStep(idx)"
                    >
                      <i class="pi pi-times text-[10px]" />
                    </button>
                  </div>

                  <!-- Step config: Email -->
                  <div v-if="step.type === 'email'" class="space-y-2">
                    <div>
                      <label class="text-[10px] text-gray-400">Vorlage</label>
                      <select
                        v-model="(step.config as any).template_id"
                        class="mt-0.5 w-full px-2 py-1 text-[11px] bg-white border border-gray-200 rounded text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30"
                      >
                        <option value="">-- Vorlage waehlen --</option>
                        <option v-for="tpl in emailTemplates" :key="tpl.id" :value="tpl.id">{{ tpl.name }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-[10px] text-gray-400">Verzoegerung (Tage)</label>
                      <input
                        v-model.number="(step.config as any).delay_days"
                        type="number"
                        min="0"
                        class="mt-0.5 w-20 px-2 py-1 text-[11px] bg-white border border-gray-200 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30"
                      />
                    </div>
                  </div>

                  <!-- Step config: Wait -->
                  <div v-if="step.type === 'wait'">
                    <label class="text-[10px] text-gray-400">Tage warten</label>
                    <input
                      v-model.number="(step.config as any).days"
                      type="number"
                      min="1"
                      class="mt-0.5 w-20 px-2 py-1 text-[11px] bg-white border border-gray-200 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30"
                    />
                  </div>

                  <!-- Step config: SMS/WhatsApp -->
                  <div v-if="step.type === 'sms'">
                    <label class="text-[10px] text-gray-400">Nachricht</label>
                    <textarea
                      v-model="(step.config as any).message"
                      rows="2"
                      class="mt-0.5 w-full px-2 py-1 text-[11px] bg-white border border-gray-200 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 resize-none"
                      placeholder="Nachricht..."
                    />
                  </div>

                  <!-- Step config: Task -->
                  <div v-if="step.type === 'task'">
                    <label class="text-[10px] text-gray-400">Beschreibung</label>
                    <textarea
                      v-model="(step.config as any).description"
                      rows="2"
                      class="mt-0.5 w-full px-2 py-1 text-[11px] bg-white border border-gray-200 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 resize-none"
                      placeholder="Aufgabe beschreiben..."
                    />
                  </div>

                  <!-- Step config: Newsletter -->
                  <div v-if="step.type === 'newsletter'" class="space-y-2">
                    <div>
                      <label class="text-[10px] text-gray-400">Newsletter-Thema</label>
                      <select
                        v-model="(step.config as any).topic_id"
                        class="mt-0.5 w-full px-2 py-1 text-[11px] bg-white border border-gray-200 rounded text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#4f46e5]/30"
                      >
                        <option value="">-- Thema waehlen --</option>
                        <optgroup
                          v-for="cat in NEWSLETTER_CATEGORIES"
                          :key="cat.id"
                          :label="cat.label"
                        >
                          <option
                            v-for="topic in getTopicsForCategory(cat.id)"
                            :key="topic.id"
                            :value="topic.id"
                          >
                            {{ topic.title }}
                          </option>
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <label class="text-[10px] text-gray-400">Frequenz</label>
                      <select
                        v-model="(step.config as any).frequency"
                        class="mt-0.5 w-full px-2 py-1 text-[11px] bg-white border border-gray-200 rounded text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#4f46e5]/30"
                      >
                        <option value="einmalig">Einmalig</option>
                        <option value="monatlich">Monatlich</option>
                        <option value="quartalsweise">Quartalsweise</option>
                      </select>
                    </div>
                  </div>

                  <!-- Step config: Condition -->
                  <div v-if="step.type === 'condition'" class="space-y-2">
                    <div class="grid grid-cols-3 gap-2">
                      <div>
                        <label class="text-[10px] text-gray-400">Feld</label>
                        <input
                          v-model="(step.config as any).field"
                          type="text"
                          class="mt-0.5 w-full px-2 py-1 text-[11px] bg-white border border-gray-200 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30"
                          placeholder="z.B. opportunity_stage"
                        />
                      </div>
                      <div>
                        <label class="text-[10px] text-gray-400">Operator</label>
                        <select
                          v-model="(step.config as any).operator"
                          class="mt-0.5 w-full px-2 py-1 text-[11px] bg-white border border-gray-200 rounded text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30"
                        >
                          <option value="equals">gleich</option>
                          <option value="not_equals">ungleich</option>
                          <option value="contains">enthaelt</option>
                          <option value="greater_than">groesser als</option>
                          <option value="less_than">kleiner als</option>
                        </select>
                      </div>
                      <div>
                        <label class="text-[10px] text-gray-400">Wert</label>
                        <input
                          v-model="(step.config as any).value"
                          type="text"
                          class="mt-0.5 w-full px-2 py-1 text-[11px] bg-white border border-gray-200 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30"
                          placeholder="Wert..."
                        />
                      </div>
                    </div>
                    <div class="flex gap-3 text-[10px] text-gray-400">
                      <span class="flex items-center gap-1"><i class="pi pi-check text-green-500 text-[8px]" /> Ja-Zweig: naechster Schritt</span>
                      <span class="flex items-center gap-1"><i class="pi pi-times text-red-400 text-[8px]" /> Nein-Zweig: Workflow beenden</span>
                    </div>
                  </div>
                </div>

                <!-- Add step button between steps -->
                <div class="flex justify-center py-1">
                  <button
                    class="flex items-center gap-1 px-2 py-0.5 text-[10px] text-gray-400 hover:text-[#172774] hover:bg-[#172774]/5 rounded transition-colors"
                    @click="addStep(idx + 1)"
                  >
                    <i class="pi pi-plus text-[8px]" />
                    Schritt hinzufuegen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Sidebar - Run History -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg border border-gray-200/80 p-4 sticky top-4">
          <h3 class="text-[12px] font-semibold text-gray-700 uppercase tracking-wider mb-3">Durchlaeufe</h3>

          <div v-if="runsLoading" class="flex justify-center py-6">
            <i class="pi pi-spin pi-spinner text-gray-300" />
          </div>

          <div v-else-if="workflowRuns.length === 0" class="text-center py-6">
            <i class="pi pi-history text-2xl text-gray-200 mb-2" />
            <p class="text-[11px] text-gray-400">Noch keine Durchlaeufe</p>
            <p class="text-[10px] text-gray-300 mt-1">Klicke oben auf "Ausfuehren"</p>
          </div>

          <div v-else class="space-y-2 max-h-[60vh] overflow-y-auto">
            <div
              v-for="run in workflowRuns"
              :key="run.id"
              class="p-2 rounded border border-gray-100 bg-gray-50/50 cursor-pointer hover:border-gray-200 transition-colors"
              @click="selectedRun = selectedRun?.id === run.id ? null : run"
            >
              <div class="flex items-center justify-between mb-1">
                <span
                  class="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                  :class="runStatusClass(run.status)"
                >
                  {{ runStatusLabel(run.status) }}
                </span>
                <span class="text-[10px] text-gray-400 tabular-nums">
                  {{ formatDate(run.started_at) }}
                </span>
              </div>
              <p class="text-[10px] text-gray-500">
                {{ (run.log || []).filter((l: any) => l.status === 'done').length }} / {{ workflow?.steps.length || 0 }} Schritte
              </p>
              <!-- Run detail log -->
              <div v-if="selectedRun?.id === run.id && run.log?.length" class="mt-2 pt-2 border-t border-gray-100 space-y-1">
                <div v-for="(entry, li) in run.log" :key="li" class="flex items-start gap-1.5">
                  <i :class="entry.status === 'done' || entry.status === 'passed' ? 'pi pi-check text-green-500' : entry.status === 'error' || entry.status === 'failed' ? 'pi pi-times text-red-400' : 'pi pi-minus text-gray-300'" class="text-[8px] mt-0.5 flex-shrink-0" />
                  <span class="text-[9px] text-gray-500">{{ entry.message || entry.type }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Run Dialog: Lead Selection -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showRunDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" @click="showRunDialog = false" />
          <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div class="flex items-center gap-2">
                <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50">
                  <i class="pi pi-play text-[14px] text-green-600" />
                </div>
                <div>
                  <h3 class="text-[14px] font-semibold text-gray-800">Workflow ausfuehren</h3>
                  <p class="text-[10px] text-gray-400">{{ workflow?.name }} — {{ workflow?.steps.length }} Schritte</p>
                </div>
              </div>
              <button class="text-gray-400 hover:text-gray-600 transition-colors" @click="showRunDialog = false">
                <i class="pi pi-times text-[13px]" />
              </button>
            </div>

            <!-- Lead Selection -->
            <div class="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              <!-- Target mode -->
              <div>
                <label class="block text-[11px] text-gray-500 font-medium mb-1.5">Leads auswaehlen</label>
                <div class="space-y-1.5">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="runTarget" value="all" class="text-[#172774]" />
                    <span class="text-[12px] text-gray-700">Alle aktiven Leads <span class="text-gray-400">({{ runLeadCounts.active }})</span></span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="runTarget" value="qualified" class="text-[#172774]" />
                    <span class="text-[12px] text-gray-700">Nur Qualified+ <span class="text-gray-400">({{ runLeadCounts.qualified }})</span></span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="runTarget" value="individual" class="text-[#172774]" />
                    <span class="text-[12px] text-gray-700">Einzelne Leads auswaehlen</span>
                  </label>
                </div>
              </div>

              <!-- Individual lead picker -->
              <div v-if="runTarget === 'individual'" class="space-y-2">
                <input
                  v-model="runLeadSearch"
                  type="text"
                  placeholder="Lead suchen..."
                  class="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                />
                <div class="max-h-[200px] overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                  <label
                    v-for="lead in filteredRunLeads"
                    :key="lead.id"
                    class="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input type="checkbox" :value="lead.id" v-model="selectedRunLeadIds" class="rounded border-gray-300 text-[#172774]" />
                    <span class="text-[12px] text-gray-700">{{ getLeadName(lead) }}</span>
                    <span class="text-[10px] text-gray-400 ml-auto">{{ lead.opportunity_stage }}</span>
                  </label>
                  <p v-if="filteredRunLeads.length === 0" class="px-3 py-4 text-center text-[11px] text-gray-400">Keine Leads gefunden</p>
                </div>
              </div>

              <!-- Steps preview -->
              <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-[10px] font-semibold text-gray-500 mb-2">Schritte die ausgefuehrt werden:</p>
                <div class="space-y-1">
                  <div v-for="(step, i) in workflow?.steps || []" :key="i" class="flex items-center gap-2 text-[10px]">
                    <span class="w-4 h-4 rounded-full bg-[#172774]/10 text-[#172774] flex items-center justify-center text-[8px] font-bold flex-shrink-0">{{ i + 1 }}</span>
                    <span class="text-gray-600">{{ stepTypeLabel(step.type) }}: {{ step.label || '–' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between px-5 py-4 border-t border-gray-100 flex-shrink-0">
              <p class="text-[11px] text-gray-500">
                {{ targetLeadCount }} Lead{{ targetLeadCount !== 1 ? 's' : '' }} ausgewaehlt
              </p>
              <div class="flex items-center gap-2">
                <button class="px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" @click="showRunDialog = false">
                  Abbrechen
                </button>
                <button
                  :disabled="targetLeadCount === 0 || executing"
                  class="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  @click="runWorkflow"
                >
                  <i v-if="executing" class="pi pi-spin pi-spinner text-[10px]" />
                  <i v-else class="pi pi-play text-[10px]" />
                  Jetzt ausfuehren
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Success Toast -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="runSuccessMessage" class="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl text-[12px] font-medium flex items-center gap-2">
          <i class="pi pi-check-circle text-[14px]" />
          {{ runSuccessMessage }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import type { CrmWorkflow, WorkflowStep, WorkflowStepType, WorkflowRunStatus } from '~/types/crm'
import { WORKFLOW_TRIGGER_TYPES, WORKFLOW_STEP_TYPES } from '~/types/crm'
import { NEWSLETTER_TOPICS, NEWSLETTER_CATEGORIES } from '~/data/newsletterTopics'

definePageMeta({ layout: 'crm', middleware: 'auth' })

const route = useRoute()
const { fetchWorkflow, createWorkflow, updateWorkflow, workflowRuns, fetchWorkflowRuns, executeWorkflow, isLoading } = usePflegeheimWorkflows()
const { templates: emailTemplates, fetchTemplates: fetchEmailTemplates } = useEmailTemplates()

const workflow = ref<CrmWorkflow | null>(null)
const loading = ref(true)
const saving = ref(false)
const runsLoading = ref(false)
const executing = ref(false)
const isNew = computed(() => route.params.id === 'new')
const selectedRun = ref<any>(null)

// ─── Run Dialog State ───────────────────────────────────────────
const showRunDialog = ref(false)
const runTarget = ref<'all' | 'qualified' | 'individual'>('all')
const runLeadSearch = ref('')
const selectedRunLeadIds = ref<string[]>([])
const runSuccessMessage = ref('')

import { getLocalLeads } from '~/composables/usePflegeheimLeads'
import type { NursingHomeLead } from '~/types/crm'

const allRunLeads = computed(() => {
  const leads = getLocalLeads()
  return leads.filter(l => !['Won', 'Lost', 'Cancelled'].includes(l.opportunity_stage))
})

const runLeadCounts = computed(() => {
  const all = allRunLeads.value
  const qualified = all.filter(l => !['Unqualified'].includes(l.opportunity_stage))
  return { active: all.length, qualified: qualified.length }
})

const filteredRunLeads = computed(() => {
  const q = runLeadSearch.value.toLowerCase()
  return allRunLeads.value.filter(l => {
    if (!q) return true
    const nh = typeof l.nursing_home_id === 'object' ? l.nursing_home_id : null
    return nh?.name?.toLowerCase().includes(q) || nh?.city?.toLowerCase().includes(q)
  }).slice(0, 50)
})

const getLeadName = (lead: NursingHomeLead) => {
  if (typeof lead.nursing_home_id === 'object' && lead.nursing_home_id) return lead.nursing_home_id.name || '–'
  return '–'
}

const targetLeadIds = computed(() => {
  switch (runTarget.value) {
    case 'all': return allRunLeads.value.map(l => l.id)
    case 'qualified': return allRunLeads.value.filter(l => !['Unqualified'].includes(l.opportunity_stage)).map(l => l.id)
    case 'individual': return selectedRunLeadIds.value
  }
})

const targetLeadCount = computed(() => targetLeadIds.value.length)

const getTopicsForCategory = (categoryId: string) =>
  NEWSLETTER_TOPICS.filter(t => t.category === categoryId)

const stepTypeLabel = (type: string) => {
  const labels: Record<string, string> = { email: 'E-Mail', newsletter: 'Newsletter', wait: 'Warten', task: 'Aufgabe', sms: 'SMS', condition: 'Bedingung' }
  return labels[type] || type
}

const runWorkflow = async () => {
  if (!workflow.value || targetLeadIds.value.length === 0) return
  executing.value = true
  try {
    const runs = await executeWorkflow(workflow.value.id, targetLeadIds.value)
    showRunDialog.value = false

    // Refresh runs
    await fetchWorkflowRuns(workflow.value.id)

    const completed = runs.filter(r => r.status === 'completed').length
    runSuccessMessage.value = `Workflow fuer ${completed} / ${runs.length} Leads ausgefuehrt`
    setTimeout(() => { runSuccessMessage.value = '' }, 4000)
  } catch (err) {
    console.error('Workflow execution failed:', err)
  } finally {
    executing.value = false
  }
}

const defaultWorkflow = (): CrmWorkflow => ({
  id: '',
  name: '',
  description: '',
  trigger_type: 'manual',
  steps: [],
  is_active: false,
})

const generateStepId = () => `step_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

const defaultConfigForType = (type: WorkflowStepType): Record<string, any> => {
  switch (type) {
    case 'email': return { template_id: '', delay_days: 0 }
    case 'wait': return { days: 1 }
    case 'sms': return { message: '' }
    case 'task': return { description: '' }
    case 'newsletter': return { topic_id: '', frequency: 'einmalig' }
    case 'condition': return { field: '', operator: 'equals', value: '' }
    default: return {}
  }
}

const addStep = (atIndex: number) => {
  if (!workflow.value) return
  const newStep: WorkflowStep = {
    id: generateStepId(),
    type: 'email',
    label: '',
    config: defaultConfigForType('email'),
  }
  workflow.value.steps.splice(atIndex, 0, newStep)
}

const removeStep = (idx: number) => {
  if (!workflow.value) return
  workflow.value.steps.splice(idx, 1)
}

const resetStepConfig = (step: WorkflowStep) => {
  step.config = defaultConfigForType(step.type)
}

const saveWorkflow = async () => {
  if (!workflow.value) return
  saving.value = true
  try {
    const data = {
      name: workflow.value.name,
      description: workflow.value.description,
      trigger_type: workflow.value.trigger_type,
      steps: workflow.value.steps,
      is_active: workflow.value.is_active,
    }

    if (isNew.value) {
      const result = await createWorkflow(data)
      if (result?.id) {
        navigateTo(`/crm/workflows/${result.id}`, { replace: true })
      }
    } else {
      await updateWorkflow(workflow.value.id, data)
    }
  } catch {
    console.error('Save failed')
  } finally {
    saving.value = false
  }
}

const toggleActive = async () => {
  if (!workflow.value) return
  workflow.value.is_active = !workflow.value.is_active
  if (!isNew.value) {
    try {
      await updateWorkflow(workflow.value.id, { is_active: workflow.value.is_active })
    } catch {
      workflow.value.is_active = !workflow.value.is_active
    }
  }
}

const runStatusClass = (status: WorkflowRunStatus) => {
  switch (status) {
    case 'running': return 'bg-blue-50 text-blue-700'
    case 'completed': return 'bg-green-50 text-green-700'
    case 'failed': return 'bg-red-50 text-red-700'
    case 'paused': return 'bg-yellow-50 text-yellow-700'
    default: return 'bg-gray-100 text-gray-500'
  }
}

const runStatusLabel = (status: WorkflowRunStatus) => {
  switch (status) {
    case 'running': return 'Laeuft'
    case 'completed': return 'Abgeschlossen'
    case 'failed': return 'Fehlgeschlagen'
    case 'paused': return 'Pausiert'
    default: return status
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '--'
  try { return format(parseISO(dateStr), 'dd.MM.yy HH:mm', { locale: de }) } catch { return '--' }
}

onMounted(async () => {
  loading.value = true
  try {
    await fetchEmailTemplates()

    if (isNew.value) {
      workflow.value = defaultWorkflow()
    } else {
      const id = route.params.id as string
      workflow.value = await fetchWorkflow(id)

      // Load run history
      runsLoading.value = true
      try {
        await fetchWorkflowRuns(id)
      } finally {
        runsLoading.value = false
      }
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
