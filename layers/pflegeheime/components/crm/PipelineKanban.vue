<template>
  <div class="flex gap-2.5 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-thin">
    <div
      v-for="stage in stages"
      :key="stage"
      class="flex-shrink-0 w-[264px] flex flex-col rounded-lg bg-[#f1f3f5]"
      @dragover.prevent="onDragOver($event, stage)"
      @dragleave="onDragLeave($event)"
      @drop.prevent="onDrop($event, stage)"
    >
      <!-- Column Header -->
      <div class="flex items-center justify-between px-2.5 pt-2.5 pb-1.5">
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: stageColors[stage] || '#6b7280' }" />
          <h3 class="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
            {{ stage }}
          </h3>
        </div>
        <span class="text-[11px] font-semibold text-gray-400 tabular-nums">
          {{ stageLeads(stage).length }}
        </span>
      </div>

      <!-- Cards -->
      <div
        class="flex-1 px-1.5 pb-1.5 space-y-1.5 min-h-[80px] transition-colors duration-150 rounded-b-lg"
        :class="dropTarget === stage ? 'bg-[#172774]/[0.06] ring-1 ring-inset ring-[#172774]/20' : ''"
      >
        <div v-if="stageLeads(stage).length === 0" class="flex items-center justify-center h-full">
          <p class="text-[11px] text-gray-300 py-4">Keine Leads</p>
        </div>

        <CrmLeadCard
          v-for="lead in stageLeads(stage)"
          :key="lead.id"
          :lead="lead"
          :primary-contact-name="primaryContacts[getNursingHomeId(lead)]"
          @dragstart="draggedLeadId = lead.id"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const STAGE_COLORS: Record<string, string> = {
  'Unqualified': '#6b7280',
  'Qualified': '#3b82f6',
  'Follow-up': '#f59e0b',
  'Email': '#8b5cf6',
  'Presentation': '#10b981',
  'Emergency': '#ef4444',
  'Won': '#22c55e',
  'Lost': '#ef4444',
  'Cancelled': '#9ca3af',
}

const props = defineProps<{
  leads: any[]
  stages: string[]
  primaryContacts: Record<string, string | null>
}>()

const emit = defineEmits<{
  'stage-change': [leadId: string, newStage: string]
}>()

const stageColors = STAGE_COLORS
const draggedLeadId = ref<string | null>(null)
const dropTarget = ref<string | null>(null)

const stageLeads = (stage: string) =>
  props.leads.filter(l => l.opportunity_stage === stage)

const getNursingHomeId = (lead: any): string => {
  if (typeof lead.nursing_home_id === 'object' && lead.nursing_home_id) {
    return lead.nursing_home_id.id
  }
  return lead.nursing_home_id as string
}

const onDragOver = (event: DragEvent, stage: string) => {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  dropTarget.value = stage
}

const onDragLeave = (event: DragEvent) => {
  const target = event.currentTarget as HTMLElement
  const related = event.relatedTarget as Node | null
  if (!related || !target.contains(related)) {
    dropTarget.value = null
  }
}

const onDrop = (event: DragEvent, newStage: string) => {
  event.preventDefault()
  dropTarget.value = null

  const leadId = event.dataTransfer?.getData('text/plain') || draggedLeadId.value
  if (!leadId) return

  const lead = props.leads.find(l => l.id === leadId)
  if (!lead || lead.opportunity_stage === newStage) return

  emit('stage-change', leadId, newStage)
  draggedLeadId.value = null
}
</script>
