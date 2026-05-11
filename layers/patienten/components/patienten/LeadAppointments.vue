<template>
  <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-sm font-semibold text-dental-blue-0">Termine</h2>
      <button
        class="text-[11px] text-dental-blue-0 hover:text-dental-blue-1 font-medium"
        @click="$emit('create')"
      >
        <i class="pi pi-plus text-[10px] mr-0.5" />
        Anlegen
      </button>
    </div>

    <!-- No-Show Counter -->
    <div v-if="noShowCount > 0" class="flex items-center gap-2 mb-3 px-2 py-1.5 bg-red-50 rounded-lg">
      <i class="pi pi-exclamation-triangle text-[11px] text-red-500" />
      <span class="text-[11px] font-medium text-red-600">{{ noShowCount }}x nicht erschienen</span>
    </div>
    <div v-else class="flex items-center gap-2 mb-3 px-2 py-1.5 bg-green-50 rounded-lg">
      <i class="pi pi-check-circle text-[11px] text-green-500" />
      <span class="text-[11px] font-medium text-green-600">Keine No-Shows</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-4">
      <i class="pi pi-spin pi-spinner text-dental-blue--3 text-sm" />
    </div>

    <!-- Next Appointment -->
    <div v-if="nextAppointment" class="mb-3 p-2 bg-dental-blue-0/5 rounded-lg border border-dental-blue-0/10">
      <p class="text-[10px] font-medium text-dental-blue-0 uppercase mb-1">Nächster Termin</p>
      <p class="text-sm font-semibold text-dental-blue-0">{{ formatDateTime(nextAppointment.start_date_time) }}</p>
      <p class="text-[11px] text-dental-blue--3">{{ nextAppointment.calendar_column?.calendar?.name || nextAppointment.calendar_column?.name || '' }}</p>
    </div>

    <!-- Appointment List -->
    <div v-if="!loading && leadAppointments.length > 0" class="space-y-2 max-h-[300px] overflow-y-auto">
      <div
        v-for="apt in leadAppointments"
        :key="apt.id"
        class="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-soft-concrete--1/50 transition-colors"
        :class="apt.id === nextAppointment?.id ? 'opacity-50' : ''"
      >
        <div>
          <p class="text-[11px] font-medium text-dental-blue-0">{{ formatDateTime(apt.start_date_time) }}</p>
          <p class="text-[10px] text-dental-blue--3">{{ apt.calendar_column?.name || '' }}</p>
        </div>
        <CrmAppointmentStatusBadge v-if="apt.attendance_status" :status="apt.attendance_status" />
      </div>
    </div>

    <p v-if="!loading && leadAppointments.length === 0" class="text-[11px] text-dental-blue--3 text-center py-3">
      Keine Termine vorhanden.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Appointment } from '~/types/appointments'

const props = defineProps<{
  leadId: string
}>()

defineEmits<{
  create: []
}>()

const { fetchLeadAppointments, getNoShowCount } = useAppointments()

const leadAppointments = ref<Appointment[]>([])
const noShowCount = ref(0)
const loading = ref(false)

const nextAppointment = computed(() => {
  const now = new Date().toISOString()
  return leadAppointments.value
    .filter(a => a.start_date_time > now && a.attendance_status !== 'cancelled')
    .sort((a, b) => a.start_date_time.localeCompare(b.start_date_time))[0] || null
})

const loadData = async () => {
  loading.value = true
  try {
    const [apts, count] = await Promise.all([
      fetchLeadAppointments(props.leadId),
      getNoShowCount(props.leadId),
    ])
    leadAppointments.value = apts
    noShowCount.value = count
  } catch (err) {
    console.error('Failed to load lead appointments:', err)
  } finally {
    loading.value = false
  }
}

const formatDateTime = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch { return dateStr }
}

onMounted(loadData)

// Reload when leadId changes
watch(() => props.leadId, loadData)

// Expose reload for parent
defineExpose({ reload: loadData })
</script>
