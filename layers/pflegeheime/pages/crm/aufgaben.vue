<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <h2 class="text-[14px] font-semibold text-gray-800">Aufgaben</h2>
        <span v-if="tasks.length > 0" class="text-[11px] text-gray-400 tabular-nums">{{ tasks.length }}</span>
      </div>
      <div class="flex items-center gap-2">
        <select
          v-model="statusFilter"
          class="px-2 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#4f46e5]/30"
          @change="loadTasks"
        >
          <option value="open">Offen</option>
          <option value="done">Erledigt</option>
          <option value="all">Alle</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <i class="pi pi-spin pi-spinner text-xl text-gray-300" />
    </div>

    <!-- Empty state -->
    <div v-else-if="tasks.length === 0" class="bg-white rounded-lg border border-gray-200/80 py-16 text-center">
      <i class="pi pi-check-square text-3xl text-gray-200 mb-3" />
      <p class="text-[13px] text-gray-400">Keine Aufgaben {{ statusFilter === 'open' ? 'offen' : 'gefunden' }}</p>
    </div>

    <!-- Task list -->
    <div v-else class="space-y-1.5">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="flex items-start gap-3 bg-white rounded-lg border border-gray-200/80 px-4 py-3 hover:border-[#4f46e5]/20 transition-colors group"
      >
        <!-- Checkbox -->
        <button
          @click="toggleTask(task)"
          class="mt-0.5 flex-shrink-0"
        >
          <div
            class="w-4 h-4 rounded border-2 flex items-center justify-center transition-colors"
            :class="task.metadata?.completed
              ? 'bg-[#4f46e5] border-[#4f46e5]'
              : 'border-gray-300 hover:border-[#4f46e5]/50'"
          >
            <i v-if="task.metadata?.completed" class="pi pi-check text-white text-[8px]" />
          </div>
        </button>

        <!-- Content -->
        <NuxtLink
          :to="getLeadLink(task)"
          class="flex-1 min-w-0"
        >
          <p
            class="text-[13px] font-medium transition-colors"
            :class="task.metadata?.completed ? 'text-gray-400 line-through' : 'text-gray-800 group-hover:text-[#4f46e5]'"
          >
            {{ task.subject }}
          </p>
          <div class="flex items-center gap-2 mt-0.5">
            <span v-if="getLeadName(task)" class="text-[10px] text-gray-400">
              <i class="pi pi-building text-[8px] mr-0.5" />
              {{ getLeadName(task) }}
            </span>
            <span v-if="task.date_created" class="text-[10px] text-gray-300">
              {{ formatDate(task.date_created) }}
            </span>
            <span v-if="task.user_created" class="text-[10px] text-gray-300">
              {{ getUserName(task) }}
            </span>
          </div>
        </NuxtLink>

        <!-- Due indicator -->
        <div v-if="task.metadata?.due_date" class="flex-shrink-0">
          <span
            class="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            :class="isOverdue(task.metadata.due_date)
              ? 'bg-red-50 text-red-600'
              : 'bg-gray-50 text-gray-500'"
          >
            {{ formatDate(task.metadata.due_date) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, parseISO, isBefore, startOfDay } from 'date-fns'
import { de } from 'date-fns/locale'
import type { CrmActivity } from '~/types/crm'

definePageMeta({ layout: 'crm', middleware: 'auth' })

const { activities, fetchAllActivities, updateActivity } = useActivities()

const tasks = ref<CrmActivity[]>([])
const loading = ref(true)
const statusFilter = ref<'open' | 'done' | 'all'>('open')

const loadTasks = async () => {
  loading.value = true
  try {
    await fetchAllActivities({ type: 'task' }, ['-date_created'], 500)
    if (statusFilter.value === 'open') {
      tasks.value = activities.value.filter(a => !a.metadata?.completed)
    } else if (statusFilter.value === 'done') {
      tasks.value = activities.value.filter(a => a.metadata?.completed)
    } else {
      tasks.value = activities.value
    }
  } finally {
    loading.value = false
  }
}

const toggleTask = async (task: CrmActivity) => {
  const completed = !task.metadata?.completed
  const metadata = { ...(task.metadata || {}), completed, completed_at: completed ? new Date().toISOString() : null }
  task.metadata = metadata
  try {
    await updateActivity(task.id, { metadata } as any)
  } catch { /* ignore */ }
  // Re-filter
  if (statusFilter.value === 'open') {
    tasks.value = tasks.value.filter(t => !t.metadata?.completed)
  } else if (statusFilter.value === 'done') {
    tasks.value = tasks.value.filter(t => t.metadata?.completed)
  }
}

const getLeadLink = (task: CrmActivity): string => {
  const ref = task.nursing_home_lead_id
  if (typeof ref === 'object' && ref && 'id' in ref) return `/crm/leads/${ref.id}`
  if (typeof ref === 'string') return `/crm/leads/${ref}`
  return '/crm/leads'
}

const getLeadName = (task: CrmActivity): string => {
  const ref = task.nursing_home_lead_id
  if (typeof ref === 'object' && ref && 'nursing_home_id' in ref) {
    const nh = (ref as any).nursing_home_id
    if (typeof nh === 'object' && nh?.name) return nh.name
  }
  return ''
}

const getUserName = (task: CrmActivity): string => {
  if (typeof task.user_created === 'object' && task.user_created) {
    return [task.user_created.first_name, task.user_created.last_name].filter(Boolean).join(' ')
  }
  return ''
}

const formatDate = (dateStr: string) => {
  try { return format(parseISO(dateStr), 'dd.MM.yy', { locale: de }) } catch { return '–' }
}

const isOverdue = (dateStr: string) => {
  try { return isBefore(parseISO(dateStr), startOfDay(new Date())) } catch { return false }
}

onMounted(loadTasks)
</script>
