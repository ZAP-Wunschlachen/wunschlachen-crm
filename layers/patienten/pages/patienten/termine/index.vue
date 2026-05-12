<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-dental-blue-0">Termine</h1>
      <button
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-dental-blue-0 rounded-lg hover:bg-dental-blue-1 transition-colors"
        @click="createDialogVisible = true"
      >
        <i class="pi pi-plus text-xs" />
        Termin anlegen
      </button>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
      <!-- View toggle -->
      <div class="flex items-center bg-white rounded-lg border border-dental-blue--5 overflow-hidden">
        <button
          class="px-4 py-2 text-xs font-medium transition-colors"
          :class="view === 'calendar' ? 'bg-dental-blue-0 text-white' : 'text-dental-blue--2 hover:bg-[#ededed]'"
          @click="view = 'calendar'"
        >
          <i class="pi pi-calendar text-[10px] mr-1" />
          Kalender
        </button>
        <button
          class="px-4 py-2 text-xs font-medium transition-colors"
          :class="view === 'list' ? 'bg-dental-blue-0 text-white' : 'text-dental-blue--2 hover:bg-[#ededed]'"
          @click="view = 'list'"
        >
          <i class="pi pi-list text-[10px] mr-1" />
          Liste
        </button>
      </div>

      <!-- Time navigation -->
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-2 text-xs font-medium text-dental-blue--2 bg-white border border-dental-blue--5 rounded-lg hover:bg-[#ededed] transition-colors"
          @click="navigateWeek(-1)"
        >
          <i class="pi pi-chevron-left text-[10px]" />
        </button>
        <button
          class="px-4 py-2 text-xs font-medium text-dental-blue-0 bg-white border border-dental-blue--5 rounded-lg hover:bg-[#ededed] transition-colors"
          @click="goToToday"
        >
          Heute
        </button>
        <button
          class="px-3 py-2 text-xs font-medium text-dental-blue--2 bg-white border border-dental-blue--5 rounded-lg hover:bg-[#ededed] transition-colors"
          @click="navigateWeek(1)"
        >
          <i class="pi pi-chevron-right text-[10px]" />
        </button>
        <span class="text-sm font-medium text-dental-blue-0 ml-2">{{ weekLabel }}</span>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-2">
        <select
          v-model="filterStatus"
          class="text-xs px-3 py-2 border border-dental-blue--5 rounded-lg bg-white outline-none focus:border-dental-blue-0 text-dental-blue-0"
        >
          <option value="">Alle Status</option>
          <option v-for="(cfg, key) in ATTENDANCE_STATUS_CONFIG" :key="key" :value="key">
            {{ cfg.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-12 text-dental-blue--3">
      <i class="pi pi-spin pi-spinner text-lg" />
      <p class="text-sm mt-2">Termine laden...</p>
    </div>

    <!-- Calendar View -->
    <PatientenAppointmentCalendarView
      v-else-if="view === 'calendar'"
      :appointments="appointments"
      :week-start="weekStart"
    />

    <!-- List View -->
    <PatientenAppointmentListView
      v-else
      :appointments="appointments"
      @status-changed="onStatusChanged"
    />

    <!-- Create Dialog -->
    <PatientenAppointmentCreateDialog
      v-model:visible="createDialogVisible"
      @saved="loadAppointments"
    />

    <!-- Toast -->
    <Toast position="bottom-right" />
  </div>
</template>

<script setup lang="ts">


import { ATTENDANCE_STATUS_CONFIG, type AttendanceStatus } from '~/types/appointments'

definePageMeta({ layout: 'crm', middleware: ['auth'] })

const toast = useToast()
const { appointments, isLoading, fetchAppointments, updateAttendance } = useAppointments()

const view = ref<'calendar' | 'list'>('calendar')
const filterStatus = ref<AttendanceStatus | ''>('')
const createDialogVisible = ref(false)

// Week navigation
const weekStart = ref(getMonday(new Date()))

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

const weekEnd = computed(() => {
  const end = new Date(weekStart.value)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
})

const weekLabel = computed(() => {
  const start = weekStart.value.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
  const end = weekEnd.value.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${start} – ${end}`
})

const navigateWeek = (direction: number) => {
  const next = new Date(weekStart.value)
  next.setDate(next.getDate() + direction * 7)
  weekStart.value = next
}

const goToToday = () => {
  weekStart.value = getMonday(new Date())
}

const loadAppointments = async () => {
  const dateRange = {
    start: weekStart.value.toISOString(),
    end: weekEnd.value.toISOString(),
  }
  const filters = filterStatus.value ? { attendance_status: filterStatus.value as AttendanceStatus } : undefined
  try {
    await fetchAppointments(dateRange, filters)
  } catch {
    toast.add({ severity: 'error', summary: 'Fehler', detail: 'Termine konnten nicht geladen werden', life: 3000 })
  }
}

const onStatusChanged = async (appointmentId: string, status: AttendanceStatus) => {
  try {
    await updateAttendance(appointmentId, status)
    toast.add({ severity: 'success', summary: 'Gespeichert', detail: 'Status aktualisiert', life: 2000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Fehler', detail: 'Status konnte nicht geändert werden', life: 3000 })
  }
}

// Reload when week or filter changes
watch([weekStart, filterStatus], () => loadAppointments())

onMounted(() => loadAppointments())
</script>
