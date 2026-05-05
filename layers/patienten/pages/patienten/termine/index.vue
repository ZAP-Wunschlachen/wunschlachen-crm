<template>
  <div class="p-6">
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
      <div class="flex items-center bg-white rounded-lg border border-dental-blue--5 overflow-hidden">
        <button
          class="px-4 py-2 text-xs font-medium transition-colors"
          :class="view === 'calendar' ? 'bg-dental-blue-0 text-white' : 'text-dental-blue--2 hover:bg-[#ededed]'"
          @click="view = 'calendar'"
        >
          Kalender
        </button>
        <button
          class="px-4 py-2 text-xs font-medium transition-colors"
          :class="view === 'list' ? 'bg-dental-blue-0 text-white' : 'text-dental-blue--2 hover:bg-[#ededed]'"
          @click="view = 'list'"
        >
          Liste
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button class="px-3 py-2 text-xs font-medium text-dental-blue--2 bg-white border border-dental-blue--5 rounded-lg hover:bg-[#ededed]" @click="navigateWeek(-1)">
          <i class="pi pi-chevron-left text-[10px]" />
        </button>
        <button class="px-4 py-2 text-xs font-medium text-dental-blue-0 bg-white border border-dental-blue--5 rounded-lg hover:bg-[#ededed]" @click="goToToday">
          Heute
        </button>
        <button class="px-3 py-2 text-xs font-medium text-dental-blue--2 bg-white border border-dental-blue--5 rounded-lg hover:bg-[#ededed]" @click="navigateWeek(1)">
          <i class="pi pi-chevron-right text-[10px]" />
        </button>
        <span class="text-sm font-medium text-dental-blue-0 ml-2">{{ weekLabel }}</span>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-12 text-dental-blue--3">
      <p class="text-sm mt-2">Termine laden...</p>
    </div>

    <PatientenAppointmentCalendarView v-else-if="view === 'calendar'" :appointments="appointments" :week-start="weekStart" />
    <PatientenAppointmentListView v-else :appointments="appointments" @status-changed="onStatusChanged" />

    <PatientenAppointmentCreateDialog v-model:visible="createDialogVisible" @saved="loadAppointments" />
  </div>
</template>

<script setup lang="ts">
import type { AttendanceStatus } from '~/types/appointments'

definePageMeta({ layout: 'crm', middleware: ['auth'] })

const { appointments, isLoading, fetchAppointments, updateAttendance } = useAppointments()

const view = ref<'calendar' | 'list'>('calendar')
const createDialogVisible = ref(false)

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

const goToToday = () => { weekStart.value = getMonday(new Date()) }

const loadAppointments = async () => {
  const dateRange = {
    start: weekStart.value.toISOString(),
    end: weekEnd.value.toISOString(),
  }
  try { await fetchAppointments(dateRange) } catch { /* handled */ }
}

const onStatusChanged = async (appointmentId: string, status: AttendanceStatus) => {
  try { await updateAttendance(appointmentId, status) } catch { /* handled */ }
}

watch([weekStart], () => loadAppointments())
onMounted(() => loadAppointments())
</script>
