<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-8">
      <i class="pi pi-spin pi-spinner text-gray-300" />
    </div>

    <!-- Empty -->
    <div v-else-if="activities.length === 0" class="text-center py-8">
      <i class="pi pi-history text-2xl text-gray-200 mb-2" />
      <p class="text-[12px] text-gray-400">Noch keine Aktivitäten</p>
    </div>

    <!-- Feed -->
    <div v-else class="space-y-3">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="flex gap-3 group"
      >
        <!-- Icon -->
        <CrmActivityIcon :type="activity.type" />

        <!-- Content -->
        <div class="flex-1 min-w-0 pt-0.5">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <!-- Subject: editable -->
              <div v-if="editingId === activity.id" class="mb-1">
                <input
                  v-model="editForm.subject"
                  class="w-full px-2 py-1 border border-gray-200 rounded text-[12px] font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                  @keydown.enter="saveEdit(activity)"
                  @keydown.escape="cancelEdit"
                />
              </div>
              <p
                v-else
                class="text-[12px] font-medium text-gray-800 cursor-pointer whitespace-pre-wrap"
                :class="expandedIds.has(activity.id) ? '' : 'line-clamp-1'"
                @click="toggleExpand(activity.id)"
              >
                {{ activity.subject }}
              </p>
              <button
                v-if="!editingId && isTextLong(activity.subject) && !activity.content"
                @click="toggleExpand(activity.id)"
                class="text-[10px] text-[#172774] hover:text-[#3d4a8e] mt-0.5 font-medium transition-colors"
              >
                {{ expandedIds.has(activity.id) ? 'Weniger anzeigen' : 'Mehr anzeigen' }}
              </button>

              <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span class="text-[10px] text-gray-400">{{ userName(activity) }}</span>
                <span class="text-[10px] text-gray-300">·</span>
                <span class="text-[10px] text-gray-400">{{ formatDate(activity.type === 'meeting' && activity.metadata?.meeting_datetime ? activity.metadata.meeting_datetime : activity.date_created) }}</span>
                <template v-if="activity.outcome">
                  <span class="text-[10px] text-gray-300">·</span>
                  <span
                    class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    :class="outcomeClass(activity.outcome)"
                  >
                    {{ outcomeLabel(activity.outcome) }}
                  </span>
                </template>
                <template v-if="activity.duration_minutes">
                  <span class="text-[10px] text-gray-300">·</span>
                  <span class="text-[10px] text-gray-400">{{ activity.duration_minutes }} Min.</span>
                </template>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-0.5">
              <!-- Edit button (visible on hover or when editing) -->
              <button
                v-if="editingId === activity.id"
                class="text-[#172774] hover:text-[#3d4a8e] transition-all p-0.5"
                title="Speichern"
                @click="saveEdit(activity)"
              >
                <i class="pi pi-check text-[10px]" />
              </button>
              <button
                v-else
                class="text-gray-300 hover:text-[#172774] transition-all p-1"
                title="Bearbeiten"
                @click="startEdit(activity)"
              >
                <i class="pi pi-pencil text-[11px]" />
              </button>
              <!-- Delete -->
              <button
                v-if="deletable"
                class="text-gray-300 hover:text-red-400 transition-all p-1"
                title="Löschen"
                @click="$emit('delete', activity)"
              >
                <i class="pi pi-trash text-[11px]" />
              </button>
            </div>
          </div>

          <!-- Content: expandable + editable -->
          <div v-if="activity.content || editingId === activity.id">
            <div v-if="editingId === activity.id" class="mt-1">
              <textarea
                v-model="editForm.content"
                rows="4"
                class="w-full px-2 py-1.5 border border-gray-200 rounded text-[11px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40 resize-none whitespace-pre-wrap"
                @keydown.escape="cancelEdit"
              />
              <!-- Meeting date/time fields -->
              <div v-if="activity.type === 'meeting'" class="grid grid-cols-2 gap-2 mt-1.5">
                <div>
                  <label class="block text-[10px] text-gray-400 mb-0.5">Datum</label>
                  <input
                    v-model="editForm.meeting_date"
                    type="date"
                    class="w-full px-2 py-1 border border-gray-200 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                  />
                </div>
                <div>
                  <label class="block text-[10px] text-gray-400 mb-0.5">Uhrzeit</label>
                  <input
                    v-model="editForm.meeting_time"
                    type="time"
                    class="w-full px-2 py-1 border border-gray-200 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                  />
                </div>
              </div>
              <div class="flex items-center gap-1.5 mt-1">
                <button
                  @click="saveEdit(activity)"
                  :disabled="editSaving"
                  class="px-2.5 py-1 text-[10px] font-medium text-white bg-[#172774] rounded hover:bg-[#3d4a8e] transition-colors disabled:opacity-50"
                >
                  <i v-if="editSaving" class="pi pi-spin pi-spinner text-[9px] mr-0.5" />
                  Speichern
                </button>
                <button
                  @click="cancelEdit"
                  class="px-2.5 py-1 text-[10px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </div>
            <template v-else>
              <p
                class="text-[11px] text-gray-500 mt-1 whitespace-pre-wrap cursor-pointer"
                :class="expandedIds.has(activity.id) ? '' : 'line-clamp-2'"
                @click="toggleExpand(activity.id)"
              >
                {{ activity.content }}
              </p>
              <button
                v-if="isTextLong(activity.content)"
                @click="toggleExpand(activity.id)"
                class="text-[10px] text-[#172774] hover:text-[#3d4a8e] mt-0.5 font-medium transition-colors"
              >
                {{ expandedIds.has(activity.id) ? 'Weniger anzeigen' : 'Mehr anzeigen' }}
              </button>
            </template>
          </div>

          <!-- Stage change metadata -->
          <div
            v-if="activity.type === 'stage_change' && activity.metadata"
            class="flex items-center gap-1 mt-1 text-[10px]"
          >
            <span class="text-gray-400">{{ activity.metadata.old_stage }}</span>
            <i class="pi pi-arrow-right text-[8px] text-gray-300" />
            <span class="text-gray-600 font-medium">{{ activity.metadata.new_stage }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import type { CrmActivity, ActivityOutcome } from '~/types/crm'
import { ACTIVITY_OUTCOMES } from '~/types/crm'

const props = defineProps<{
  activities: CrmActivity[]
  loading?: boolean
  deletable?: boolean
}>()

const emit = defineEmits<{
  delete: [activity: CrmActivity]
  update: [activity: CrmActivity, data: { subject?: string; content?: string; date?: string }]
}>()

// Expand/collapse state
const expandedIds = ref<Set<string>>(new Set())

const toggleExpand = (id: string) => {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
  // Trigger reactivity
  expandedIds.value = new Set(expandedIds.value)
}

const isTextLong = (text?: string | null) => {
  if (!text) return false
  return text.length > 100 || text.split('\n').length > 2
}

// Edit state
const editingId = ref<string | null>(null)
const editSaving = ref(false)
const editForm = ref({ subject: '', content: '', meeting_date: '', meeting_time: '' })

const startEdit = (activity: CrmActivity) => {
  editingId.value = activity.id
  const meetingDate = activity.metadata?.meeting_date || ''
  const meetingTime = activity.metadata?.meeting_time || ''
  editForm.value = {
    subject: activity.subject || '',
    content: activity.content || '',
    meeting_date: meetingDate,
    meeting_time: meetingTime,
  }
  // Auto-expand when editing
  expandedIds.value.add(activity.id)
  expandedIds.value = new Set(expandedIds.value)
}

const cancelEdit = () => {
  editingId.value = null
}

const saveEdit = async (activity: CrmActivity) => {
  editSaving.value = true
  try {
    const data: { subject?: string; content?: string; date?: string } = {
      subject: editForm.value.subject,
      content: editForm.value.content,
    }
    if (activity.type === 'meeting' && editForm.value.meeting_date) {
      data.date = `${editForm.value.meeting_date}T${editForm.value.meeting_time || '00:00'}`
    }
    emit('update', activity, data)
    editingId.value = null
  } finally {
    editSaving.value = false
  }
}

const userName = (activity: CrmActivity) => {
  if (typeof activity.user_created === 'object' && activity.user_created) {
    return [activity.user_created.first_name, activity.user_created.last_name]
      .filter(Boolean).join(' ') || 'Unbekannt'
  }
  return 'System'
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  try {
    return format(parseISO(dateStr), 'dd.MM.yy HH:mm', { locale: de })
  } catch {
    return ''
  }
}

const outcomeLabel = (outcome: ActivityOutcome) => {
  return ACTIVITY_OUTCOMES.find(o => o.value === outcome)?.label || outcome
}

const outcomeClass = (outcome: ActivityOutcome) => {
  const classes: Record<ActivityOutcome, string> = {
    successful: 'bg-green-50 text-green-700',
    no_contact: 'bg-gray-100 text-gray-500',
    callback: 'bg-amber-50 text-amber-700',
    rejection: 'bg-red-50 text-red-600',
  }
  return classes[outcome] || 'bg-gray-100 text-gray-500'
}
</script>
