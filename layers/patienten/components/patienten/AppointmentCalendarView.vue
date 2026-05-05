<template>
  <div class="bg-white rounded-lg border border-dental-blue--5 overflow-hidden">
    <div class="grid grid-cols-7 border-b border-dental-blue--5">
      <div v-for="(day, i) in weekDays" :key="i" class="px-2 py-2 text-center border-r last:border-r-0 border-dental-blue--5">
        <p class="text-[10px] text-dental-blue--3">{{ day.label }}</p>
        <p class="text-xs font-medium text-dental-blue-0">{{ day.date }}</p>
      </div>
    </div>
    <div class="grid grid-cols-7 min-h-[300px]">
      <div v-for="(day, i) in weekDays" :key="i" class="p-1 border-r last:border-r-0 border-dental-blue--5 space-y-1">
        <div v-for="apt in getAppointmentsForDay(day.fullDate)" :key="apt.id" class="bg-dental-blue--5 rounded p-1.5">
          <p class="text-[10px] font-medium text-dental-blue-0 truncate">{{ formatTime(apt.start_date_time) }}</p>
          <p class="text-[9px] text-dental-blue--3 truncate">{{ apt.lead_id }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Appointment } from '~/types/appointments'

const props = defineProps<{ appointments: Appointment[]; weekStart: Date }>()

const weekDays = computed(() => {
  const days = []
  const labels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  for (let i = 0; i < 7; i++) {
    const d = new Date(props.weekStart)
    d.setDate(d.getDate() + i)
    days.push({
      label: labels[i],
      date: d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
      fullDate: d.toISOString().split('T')[0],
    })
  }
  return days
})

const getAppointmentsForDay = (dateStr: string) => {
  return props.appointments.filter(a => a.start_date_time?.startsWith(dateStr))
}

const formatTime = (dt: string) => {
  try { return new Date(dt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}
</script>
