<template>
  <div
    class="bg-white rounded-md border border-gray-200/80 p-2.5 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all duration-150 group"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @click="onClick"
    @mousedown="isDragging = false"
  >
    <!-- Name + Days -->
    <div class="flex items-start justify-between gap-1.5 mb-1.5">
      <h4 class="text-[13px] font-semibold text-gray-900 leading-snug truncate">
        {{ nursingHomeName }}
      </h4>
      <span class="text-[10px] text-gray-300 flex-shrink-0 tabular-nums" :title="`${daysInStage} Tage in diesem Status`">
        {{ daysInStage }}d
      </span>
    </div>

    <!-- Location -->
    <p v-if="location" class="text-[11px] text-gray-400 mb-2 truncate">
      {{ location }}
      <span v-if="capacity" class="text-gray-300"> · {{ capacity }} Betten</span>
    </p>

    <!-- Contact -->
    <div v-if="primaryContactName" class="text-[11px] text-gray-500 mb-2 flex items-center gap-1 truncate">
      <i class="pi pi-user text-[9px] text-gray-300" />
      {{ primaryContactName }}
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between pt-1.5 border-t border-gray-100">
      <span class="text-[10px] text-gray-400">{{ lead.follow_up_date || '-' }}</span>
      <span class="text-[10px] text-gray-400">{{ lead.priority || '-' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  lead: any
  primaryContactName?: string | null
}>()

const emit = defineEmits<{
  dragstart: [leadId: string]
}>()

const nursingHomeName = computed(() => {
  if (typeof props.lead.nursing_home_id === 'object' && props.lead.nursing_home_id) {
    return props.lead.nursing_home_id.name || '-'
  }
  return '-'
})

const location = computed(() => {
  if (typeof props.lead.nursing_home_id === 'object' && props.lead.nursing_home_id) {
    const nh = props.lead.nursing_home_id
    return [nh.zip, nh.city].filter(Boolean).join(' ') || null
  }
  return null
})

const capacity = computed(() => {
  if (typeof props.lead.nursing_home_id === 'object' && props.lead.nursing_home_id) {
    return props.lead.nursing_home_id.total_capacity
  }
  return null
})

const daysInStage = computed(() => {
  if (!props.lead.date_updated) return 0
  try {
    return Math.floor((Date.now() - new Date(props.lead.date_updated).getTime()) / (1000 * 60 * 60 * 24))
  } catch {
    return 0
  }
})

const isDragging = ref(false)

const onDragStart = (event: DragEvent) => {
  isDragging.value = true
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', props.lead.id)
  }
  emit('dragstart', props.lead.id)
}

const onDragEnd = () => {
  setTimeout(() => { isDragging.value = false }, 50)
}

const onClick = () => {
  if (!isDragging.value) {
    navigateTo(`/crm/leads/${props.lead.id}`)
  }
}
</script>
