<template>
  <div class="bg-white rounded-lg border border-dental-blue--5 overflow-hidden">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-dental-blue--5">
          <th class="text-left px-4 py-3 text-xs font-medium text-dental-blue--2">Datum</th>
          <th class="text-left px-4 py-3 text-xs font-medium text-dental-blue--2">Zeit</th>
          <th class="text-left px-4 py-3 text-xs font-medium text-dental-blue--2">Lead</th>
          <th class="text-left px-4 py-3 text-xs font-medium text-dental-blue--2">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="apt in appointments" :key="apt.id" class="border-b border-dental-blue--5 last:border-0">
          <td class="px-4 py-3 text-xs text-dental-blue-0">{{ formatDate(apt.start_date_time) }}</td>
          <td class="px-4 py-3 text-xs text-dental-blue-0">{{ formatTime(apt.start_date_time) }}</td>
          <td class="px-4 py-3 text-xs text-dental-blue--2">{{ apt.lead_id }}</td>
          <td class="px-4 py-3">
            <select
              :value="apt.attendance_status || ''"
              class="text-[10px] px-2 py-1 border border-dental-blue--5 rounded"
              @change="$emit('status-changed', apt.id, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">--</option>
              <option value="confirmed">Bestaetigt</option>
              <option value="attended">Erschienen</option>
              <option value="no_show">Nicht erschienen</option>
              <option value="cancelled">Abgesagt</option>
            </select>
          </td>
        </tr>
        <tr v-if="appointments.length === 0">
          <td colspan="4" class="px-4 py-8 text-center text-dental-blue--3 text-xs">Keine Termine</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Appointment } from '~/types/appointments'

defineProps<{ appointments: Appointment[] }>()
defineEmits(['status-changed'])

const formatDate = (dt: string) => {
  try { return new Date(dt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }) }
  catch { return '' }
}
const formatTime = (dt: string) => {
  try { return new Date(dt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}
</script>
