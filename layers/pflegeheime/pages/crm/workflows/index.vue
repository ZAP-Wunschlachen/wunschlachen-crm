<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-[16px] font-semibold text-gray-900">Workflows</h2>
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-[#172774] hover:bg-[#3d4a8e] rounded-lg transition-colors"
        @click="navigateTo('/crm/workflows/new')"
      >
        <i class="pi pi-plus text-[10px]" />
        Neuer Workflow
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-16">
      <i class="pi pi-spin pi-spinner text-xl text-gray-300" />
    </div>

    <!-- Empty -->
    <div v-else-if="workflows.length === 0 && !isLoading" class="text-center py-16">
      <i class="pi pi-sitemap text-3xl text-gray-200 mb-3" />
      <p class="text-[13px] text-gray-400">Keine Workflows vorhanden</p>
      <button
        class="mt-3 text-[12px] text-[#172774] hover:underline"
        @click="navigateTo('/crm/workflows/new')"
      >
        Ersten Workflow erstellen
      </button>
    </div>

    <!-- Workflow cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
      <div
        v-for="wf in workflows"
        :key="wf.id"
        class="bg-white rounded-lg border border-gray-200/80 p-4 hover:border-gray-300 cursor-pointer transition-colors"
        @click="navigateTo(`/crm/workflows/${wf.id}`)"
      >
        <div class="flex items-start justify-between mb-2">
          <p class="text-[13px] font-medium text-gray-800 truncate flex-1">{{ wf.name }}</p>
          <button
            class="ml-2 flex-shrink-0"
            :title="wf.is_active ? 'Deaktivieren' : 'Aktivieren'"
            @click.stop="toggleActive(wf)"
          >
            <span
              class="inline-block w-7 h-4 rounded-full relative transition-colors"
              :class="wf.is_active ? 'bg-[#172774]' : 'bg-gray-200'"
            >
              <span
                class="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform"
                :class="wf.is_active ? 'left-3.5' : 'left-0.5'"
              />
            </span>
          </button>
        </div>
        <p v-if="wf.description" class="text-[11px] text-gray-500 mb-3 line-clamp-2">{{ wf.description }}</p>
        <div class="flex items-center gap-2">
          <span class="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
            {{ triggerLabel(wf.trigger_type) }}
          </span>
          <span
            class="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
            :class="wf.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'"
          >
            {{ wf.is_active ? 'Aktiv' : 'Inaktiv' }}
          </span>
          <span class="text-[10px] text-gray-400 ml-auto tabular-nums">
            {{ (wf.steps || []).length }} {{ (wf.steps || []).length === 1 ? 'Schritt' : 'Schritte' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Template gallery -->
    <div class="mt-6">
      <h3 class="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Vorlagen</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
        <button
          v-for="tpl in templateGallery"
          :key="tpl.key"
          class="bg-white rounded-lg border border-dashed border-gray-200 p-3 hover:border-[#172774]/40 hover:bg-[#172774]/[0.02] transition-colors text-left"
          @click="createFromTemplate(tpl)"
        >
          <div class="flex items-center gap-2 mb-1">
            <i :class="tpl.icon" class="text-[12px] text-[#172774]" />
            <span class="text-[12px] font-medium text-gray-700">{{ tpl.name }}</span>
          </div>
          <p class="text-[10px] text-gray-400">{{ tpl.description }}</p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CrmWorkflow, WorkflowTriggerType } from '~/types/crm'
import { WORKFLOW_TRIGGER_TYPES } from '~/types/crm'

definePageMeta({ layout: 'crm', middleware: 'auth' })

const { workflows, isLoading, fetchWorkflows, createWorkflow, updateWorkflow } = usePflegeheimWorkflows()

const triggerLabel = (type: WorkflowTriggerType) =>
  WORKFLOW_TRIGGER_TYPES.find(t => t.value === type)?.label || type

const toggleActive = async (wf: CrmWorkflow) => {
  try {
    await updateWorkflow(wf.id, { is_active: !wf.is_active })
  } catch {
    console.error('Toggle failed')
  }
}

const templateGallery = [
  {
    key: 'cold_outreach',
    name: 'Cold Outreach',
    description: 'Erstansprache neuer Pflegeheime per E-Mail',
    icon: 'pi pi-send',
    trigger: 'new_lead' as WorkflowTriggerType,
    steps: [
      { id: '1', type: 'email' as const, label: 'Erstansprache', config: { template_id: '', delay_days: 0 } },
      { id: '2', type: 'wait' as const, label: 'Warten', config: { days: 3 } },
      { id: '3', type: 'email' as const, label: 'Nachfass', config: { template_id: '', delay_days: 0 } },
    ],
  },
  {
    key: 'follow_up',
    name: 'Follow-up Sequenz',
    description: 'Automatische Nachverfolgung offener Leads',
    icon: 'pi pi-replay',
    trigger: 'follow_up_due' as WorkflowTriggerType,
    steps: [
      { id: '1', type: 'task' as const, label: 'Anruf planen', config: { description: 'Lead kontaktieren' } },
      { id: '2', type: 'wait' as const, label: 'Warten', config: { days: 2 } },
      { id: '3', type: 'email' as const, label: 'Follow-up E-Mail', config: { template_id: '', delay_days: 0 } },
    ],
  },
  {
    key: 'onboarding',
    name: 'Onboarding',
    description: 'Gewonnene Leads durch Onboarding begleiten',
    icon: 'pi pi-check-circle',
    trigger: 'stage_change' as WorkflowTriggerType,
    steps: [
      { id: '1', type: 'email' as const, label: 'Willkommen', config: { template_id: '', delay_days: 0 } },
      { id: '2', type: 'task' as const, label: 'Vertrag vorbereiten', config: { description: 'Kooperationsvertrag erstellen' } },
      { id: '3', type: 'wait' as const, label: 'Warten', config: { days: 7 } },
      { id: '4', type: 'task' as const, label: 'Erstbesuch planen', config: { description: 'Erstbesuch im Heim vereinbaren' } },
    ],
  },
  {
    key: 'lead_nurturing',
    name: 'Lead Nurturing',
    description: 'Langfristige Pflege potenzieller Kontakte',
    icon: 'pi pi-heart',
    trigger: 'manual' as WorkflowTriggerType,
    steps: [
      { id: '1', type: 'email' as const, label: 'Info-Mail', config: { template_id: '', delay_days: 0 } },
      { id: '2', type: 'wait' as const, label: 'Warten', config: { days: 14 } },
      { id: '3', type: 'email' as const, label: 'Mehrwert-Mail', config: { template_id: '', delay_days: 0 } },
      { id: '4', type: 'wait' as const, label: 'Warten', config: { days: 14 } },
      { id: '5', type: 'task' as const, label: 'Persoenlich kontaktieren', config: { description: 'Telefonisch nachfassen' } },
    ],
  },
  {
    key: 're_engagement',
    name: 'Re-Engagement',
    description: 'Inaktive Leads reaktivieren',
    icon: 'pi pi-refresh',
    trigger: 'manual' as WorkflowTriggerType,
    steps: [
      { id: '1', type: 'email' as const, label: 'Re-Engagement', config: { template_id: '', delay_days: 0 } },
      { id: '2', type: 'wait' as const, label: 'Warten', config: { days: 5 } },
      { id: '3', type: 'condition' as const, label: 'Reaktion?', config: { field: 'opportunity_stage', operator: 'not_equals', value: 'Lost' } },
      { id: '4', type: 'task' as const, label: 'Anrufen', config: { description: 'Lead telefonisch kontaktieren' } },
    ],
  },
]

const createFromTemplate = async (tpl: (typeof templateGallery)[number]) => {
  try {
    const result = await createWorkflow({
      name: tpl.name,
      description: tpl.description,
      trigger_type: tpl.trigger,
      steps: tpl.steps,
      is_active: false,
    })

    if (result?.id) {
      navigateTo(`/crm/workflows/${result.id}`)
    }
  } catch {
    console.error('Template creation failed')
  }
}

onMounted(fetchWorkflows)
</script>
