<template>
  <div class="flex gap-3 overflow-x-auto pb-4 h-full">
    <div
      v-for="status in LEAD_STATUSES"
      :key="status"
      class="flex-shrink-0 w-[260px] flex flex-col"
      @dragover.prevent
      @drop="onDrop($event, status)"
    >
      <!-- Column header -->
      <div class="flex items-center gap-2 px-3 py-2 mb-2">
        <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: LEAD_STATUS_CONFIG[status].color }" />
        <span class="text-xs font-semibold text-dental-blue-0">{{ LEAD_STATUS_CONFIG[status].label }}</span>
        <span class="text-[10px] text-dental-blue--3 ml-auto">{{ columnCounts[status] || 0 }}</span>
      </div>

      <!-- Cards -->
      <div class="flex-1 space-y-2 overflow-y-auto min-h-[100px] px-1">
        <div
          v-for="lead in columns[status]"
          :key="lead.id"
          draggable="true"
          class="cursor-grab active:cursor-grabbing"
          @dragstart="onDragStart($event, lead)"
        >
          <CrmLeadCard :lead="lead" @click="$emit('select', lead)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LEAD_STATUSES, LEAD_STATUS_CONFIG, type Lead, type LeadStatus } from '~/types/crm'

const props = defineProps<{ leads: Lead[] }>()
const emit = defineEmits<{ select: [lead: Lead]; statusChange: [id: string, status: LeadStatus] }>()

const columns = computed(() => {
  const cols: Record<LeadStatus, Lead[]> = {} as any
  for (const s of LEAD_STATUSES) cols[s] = []
  for (const lead of props.leads) {
    if (cols[lead.status]) cols[lead.status].push(lead)
  }
  return cols
})

const columnCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const s of LEAD_STATUSES) counts[s] = columns.value[s]?.length || 0
  return counts
})

let draggedLeadId: string | null = null

const onDragStart = (e: DragEvent, lead: Lead) => {
  draggedLeadId = lead.id
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', lead.id)
  }
}

const onDrop = (e: DragEvent, status: LeadStatus) => {
  e.preventDefault()
  if (draggedLeadId) {
    emit('statusChange', draggedLeadId, status)
    draggedLeadId = null
  }
}
</script>
