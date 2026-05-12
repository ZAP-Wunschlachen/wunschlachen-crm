<template>
  <div class="bg-white rounded-lg border border-dental-blue--5 overflow-hidden">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-dental-blue--5 bg-soft-concrete--1">
          <th class="text-left px-4 py-2.5 text-[11px] font-semibold text-dental-blue--2">Datum / Zeit</th>
          <th class="text-left px-4 py-2.5 text-[11px] font-semibold text-dental-blue--2">Patient</th>
          <th class="text-left px-4 py-2.5 text-[11px] font-semibold text-dental-blue--2">Standort</th>
          <th class="text-left px-4 py-2.5 text-[11px] font-semibold text-dental-blue--2">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="apt in appointments"
          :key="apt.id"
          class="border-b border-dental-blue--5 last:border-0 hover:bg-soft-concrete--1/50 transition-colors"
        >
          <td class="px-4 py-2.5">
            <span class="text-dental-blue-0 font-medium">{{ formatDate(apt.start_date_time) }}</span>
            <br />
            <span class="text-[11px] text-dental-blue--3">{{ formatTime(apt.start_date_time) }} – {{ formatTime(apt.end_date_time) }}</span>
          </td>
          <td class="px-4 py-2.5">
            <NuxtLink
              v-if="apt.lead_id"
              :to="`/crm/leads/${apt.lead_id}`"
              class="text-dental-blue-0 hover:text-dental-blue-1 underline"
            >
              {{ apt.lead_id }}
            </NuxtLink>
            <span v-else class="text-dental-blue--3 text-[11px]">—</span>
          </td>
          <td class="px-4 py-2.5 text-dental-blue--2">
            {{ apt.calendar_column?.calendar?.name || apt.calendar_column?.name || '—' }}
          </td>
          <td class="px-4 py-2.5">
            <select
              :value="apt.attendance_status || 'scheduled'"
              class="text-[11px] px-2 py-1 rounded-lg border border-dental-blue--5 bg-white outline-none focus:border-dental-blue-0 text-dental-blue-0"
              @change="onStatusChange(apt.id, ($event.target as HTMLSelectElement).value as any)"
            >
              <option v-for="(cfg, key) in ATTENDANCE_STATUS_CONFIG" :key="key" :value="key">
                {{ cfg.label }}
              </option>
            </select>
          </td>
        </tr>
        <tr v-if="appointments.length === 0">
          <td colspan="4" class="px-4 py-8 text-center text-dental-blue--3 text-sm">
            Keine Termine gefunden.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ATTENDANCE_STATUS_CONFIG, type Appointment, type AttendanceStatus } from '~/types/appointments'

defineProps<{
  appointments: Appointment[]
}>()

const emit = defineEmits<{
  'status-changed': [appointmentId: string, status: AttendanceStatus]
}>()

const onStatusChange = (id: string, status: AttendanceStatus) => {
  emit('status-changed', id, status)
}

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit' })
  } catch { return dateStr }
}

const formatTime = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  } catch { return dateStr }
}
</script>
