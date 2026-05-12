<template>
  <div class="bg-white rounded-lg border border-dental-blue--5 overflow-hidden">
    <!-- Week day headers -->
    <div class="grid grid-cols-7 border-b border-dental-blue--5 bg-soft-concrete--1">
      <div
        v-for="day in weekDays"
        :key="day.dateStr"
        class="px-2 py-2 text-center border-r border-dental-blue--5 last:border-r-0"
        :class="day.isToday ? 'bg-dental-blue-0/5' : ''"
      >
        <p class="text-[10px] font-medium text-dental-blue--3 uppercase">{{ day.weekday }}</p>
        <p class="text-sm font-semibold" :class="day.isToday ? 'text-dental-blue-0' : 'text-dental-blue--2'">
          {{ day.dayNum }}
        </p>
      </div>
    </div>

    <!-- Time grid -->
    <div class="grid grid-cols-7 min-h-[500px]">
      <div
        v-for="day in weekDays"
        :key="day.dateStr"
        class="border-r border-dental-blue--5 last:border-r-0 p-1 space-y-1"
        :class="day.isToday ? 'bg-dental-blue-0/[0.02]' : ''"
      >
        <div
          v-for="apt in getAppointmentsForDay(day.dateStr)"
          :key="apt.id"
          class="rounded-md px-2 py-1.5 text-[10px] cursor-pointer hover:opacity-80 transition-opacity"
          :style="{ backgroundColor: getStatusBgColor(apt.attendance_status), borderLeft: `3px solid ${getStatusColor(apt.attendance_status)}` }"
          :title="`${formatTime(apt.start_date_time)} – ${formatTime(apt.end_date_time)}`"
        >
          <p class="font-medium truncate" :style="{ color: getStatusColor(apt.attendance_status) }">
            {{ formatTime(apt.start_date_time) }}
          </p>
          <p class="text-dental-blue--3 truncate">
            {{ apt.calendar_column?.name || '—' }}
          </p>
        </div>
        <p v-if="getAppointmentsForDay(day.dateStr).length === 0" class="text-[10px] text-dental-blue--4 text-center py-4">
          —
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ATTENDANCE_STATUS_CONFIG, type Appointment, type AttendanceStatus } from '~/types/appointments'

const props = defineProps<{
  appointments: Appointment[]
  weekStart: Date
}>()

interface WeekDay {
  dateStr: string
  weekday: string
  dayNum: string
  isToday: boolean
}

const weekDays = computed<WeekDay[]>(() => {
  const days: WeekDay[] = []
  const today = new Date().toISOString().split('T')[0]
  for (let i = 0; i < 7; i++) {
    const d = new Date(props.weekStart)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      dateStr,
      weekday: d.toLocaleDateString('de-DE', { weekday: 'short' }),
      dayNum: d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
      isToday: dateStr === today,
    })
  }
  return days
})

const getAppointmentsForDay = (dateStr: string) => {
  return props.appointments.filter(apt => {
    const aptDate = apt.start_date_time?.split('T')[0]
    return aptDate === dateStr
  })
}

const getStatusColor = (status?: AttendanceStatus | null) => {
  return ATTENDANCE_STATUS_CONFIG[status || 'scheduled']?.color || '#3b82f6'
}

const getStatusBgColor = (status?: AttendanceStatus | null) => {
  return ATTENDANCE_STATUS_CONFIG[status || 'scheduled']?.bgColor || '#eff6ff'
}

const formatTime = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  } catch { return dateStr }
}
</script>
