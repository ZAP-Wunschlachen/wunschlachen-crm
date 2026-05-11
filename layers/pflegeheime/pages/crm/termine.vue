<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-[16px] font-semibold text-gray-900">Termine</h2>
      <div class="flex items-center gap-2">
        <!-- View toggle -->
        <div class="flex items-center bg-white border border-gray-200 rounded-md overflow-hidden">
          <button
            class="px-2.5 py-1 text-[11px] font-medium transition-colors"
            :class="viewMode === 'list' ? 'bg-[#172774] text-white' : 'text-gray-500 hover:bg-gray-50'"
            @click="viewMode = 'list'"
          >
            <i class="pi pi-list text-[10px]" />
          </button>
          <button
            class="px-2.5 py-1 text-[11px] font-medium transition-colors"
            :class="viewMode === 'calendar' ? 'bg-[#172774] text-white' : 'text-gray-500 hover:bg-gray-50'"
            @click="viewMode = 'calendar'"
          >
            <i class="pi pi-calendar text-[10px]" />
          </button>
        </div>
      </div>
    </div>

    <!-- Tabs: Upcoming / Past -->
    <div class="flex items-center gap-4 mb-4 border-b border-gray-200">
      <button
        class="pb-2 text-[12px] font-medium border-b-2 transition-colors -mb-px"
        :class="tab === 'upcoming' ? 'border-[#172774] text-[#172774]' : 'border-transparent text-gray-400 hover:text-gray-600'"
        @click="tab = 'upcoming'"
      >
        Anstehend
        <span v-if="upcomingMeetings.length" class="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#172774]/10 text-[#172774]">{{ upcomingMeetings.length }}</span>
      </button>
      <button
        class="pb-2 text-[12px] font-medium border-b-2 transition-colors -mb-px"
        :class="tab === 'past' ? 'border-[#172774] text-[#172774]' : 'border-transparent text-gray-400 hover:text-gray-600'"
        @click="tab = 'past'"
      >
        Vergangen
      </button>
      <button
        class="pb-2 text-[12px] font-medium border-b-2 transition-colors -mb-px"
        :class="tab === 'all' ? 'border-[#172774] text-[#172774]' : 'border-transparent text-gray-400 hover:text-gray-600'"
        @click="tab = 'all'"
      >
        Alle
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-16">
      <i class="pi pi-spin pi-spinner text-xl text-gray-300" />
    </div>

    <!-- Empty -->
    <div v-else-if="filteredMeetings.length === 0" class="text-center py-16">
      <i class="pi pi-calendar text-3xl text-gray-200 mb-3" />
      <p class="text-[13px] text-gray-400">Keine Termine {{ tab === 'upcoming' ? 'geplant' : 'vorhanden' }}</p>
    </div>

    <!-- Calendar View -->
    <div v-else-if="viewMode === 'calendar'" class="space-y-4">
      <div v-for="group in groupedByDate" :key="group.date" class="bg-white rounded-lg border border-gray-200/80 overflow-hidden">
        <div class="px-4 py-2.5 bg-gray-50/60 border-b border-gray-100">
          <p class="text-[12px] font-semibold text-gray-700">{{ formatGroupDate(group.date) }}</p>
          <p class="text-[10px] text-gray-400">{{ group.meetings.length }} Termin{{ group.meetings.length > 1 ? 'e' : '' }}</p>
        </div>
        <div class="divide-y divide-gray-50">
          <div
            v-for="meeting in group.meetings"
            :key="meeting.id"
            class="flex items-center gap-4 px-4 py-3 hover:bg-gray-50/50 cursor-pointer transition-colors"
            @click="navigateToLead(meeting)"
          >
            <!-- Time -->
            <div class="w-14 text-center flex-shrink-0">
              <p class="text-[14px] font-semibold text-[#172774]">{{ getMeetingTime(meeting) }}</p>
            </div>
            <!-- Divider line -->
            <div class="w-px h-10 bg-[#172774]/20 flex-shrink-0" />
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-[12px] font-medium text-gray-800 truncate">{{ meeting.subject }}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[10px] text-gray-500">{{ getLeadName(meeting) }}</span>
                <span v-if="meeting.duration_minutes" class="text-[10px] text-gray-400">
                  · {{ meeting.duration_minutes }} Min.
                </span>
              </div>
              <p v-if="meeting.content" class="text-[10px] text-gray-400 truncate mt-0.5">{{ meeting.content }}</p>
            </div>
            <!-- Status -->
            <div class="flex-shrink-0">
              <span
                v-if="meeting.outcome"
                class="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                :class="outcomeClass(meeting.outcome)"
              >
                {{ outcomeLabel(meeting.outcome) }}
              </span>
              <span
                v-else-if="isFuture(meeting)"
                class="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600"
              >
                Geplant
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="bg-white rounded-lg border border-gray-200/80 overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-100 bg-gray-50/60">
            <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Datum</th>
            <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Uhrzeit</th>
            <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Betreff</th>
            <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Lead</th>
            <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Dauer</th>
            <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="meeting in filteredMeetings"
            :key="meeting.id"
            class="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
            @click="navigateToLead(meeting)"
          >
            <td class="px-4 py-2.5 text-[12px] text-gray-700 font-medium tabular-nums">{{ formatMeetingDate(meeting) }}</td>
            <td class="px-4 py-2.5 text-[12px] text-[#172774] font-semibold tabular-nums">{{ getMeetingTime(meeting) }}</td>
            <td class="px-4 py-2.5">
              <p class="text-[12px] text-gray-800 truncate max-w-[250px]">{{ meeting.subject }}</p>
            </td>
            <td class="px-4 py-2.5 text-[11px] text-gray-500">{{ getLeadName(meeting) }}</td>
            <td class="px-4 py-2.5 text-[11px] text-gray-400">{{ meeting.duration_minutes ? `${meeting.duration_minutes} Min.` : '–' }}</td>
            <td class="px-4 py-2.5">
              <span
                v-if="meeting.outcome"
                class="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                :class="outcomeClass(meeting.outcome)"
              >
                {{ outcomeLabel(meeting.outcome) }}
              </span>
              <span
                v-else-if="isFuture(meeting)"
                class="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600"
              >
                Geplant
              </span>
              <span v-else class="text-[10px] text-gray-300">–</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, parseISO, isAfter, isBefore, isToday, isTomorrow, startOfDay } from 'date-fns'
import { de } from 'date-fns/locale'
import type { CrmActivity, ActivityOutcome } from '~/types/crm'
import { ACTIVITY_OUTCOMES } from '~/types/crm'

definePageMeta({ layout: 'crm', middleware: 'auth' })

const router = useRouter()
const { activities, isLoading, fetchAllActivities } = useActivities()

const viewMode = ref<'list' | 'calendar'>('calendar')
const tab = ref<'upcoming' | 'past' | 'all'>('upcoming')

const today = startOfDay(new Date())

// Load all meetings
onMounted(async () => {
  await fetchAllActivities({ type: 'meeting' }, ['-date_created'], 200)
})

const getMeetingDatetime = (meeting: CrmActivity): Date | null => {
  if (meeting.metadata?.meeting_datetime) {
    try { return parseISO(meeting.metadata.meeting_datetime) } catch { return null }
  }
  if (meeting.metadata?.meeting_date) {
    const time = meeting.metadata.meeting_time || '00:00'
    try { return parseISO(`${meeting.metadata.meeting_date}T${time}`) } catch { return null }
  }
  // Fallback to date_created
  if (meeting.date_created) {
    try { return parseISO(meeting.date_created) } catch { return null }
  }
  return null
}

const isFuture = (meeting: CrmActivity): boolean => {
  const dt = getMeetingDatetime(meeting)
  return dt ? isAfter(dt, new Date()) : false
}

const upcomingMeetings = computed(() =>
  activities.value
    .filter(a => isFuture(a))
    .sort((a, b) => {
      const dtA = getMeetingDatetime(a)?.getTime() || 0
      const dtB = getMeetingDatetime(b)?.getTime() || 0
      return dtA - dtB
    })
)

const pastMeetings = computed(() =>
  activities.value
    .filter(a => !isFuture(a))
    .sort((a, b) => {
      const dtA = getMeetingDatetime(a)?.getTime() || 0
      const dtB = getMeetingDatetime(b)?.getTime() || 0
      return dtB - dtA
    })
)

const filteredMeetings = computed(() => {
  if (tab.value === 'upcoming') return upcomingMeetings.value
  if (tab.value === 'past') return pastMeetings.value
  // All: upcoming first (asc), then past (desc)
  return [...upcomingMeetings.value, ...pastMeetings.value]
})

// Group by date for calendar view
const groupedByDate = computed(() => {
  const groups: { date: string; meetings: CrmActivity[] }[] = []
  const map = new Map<string, CrmActivity[]>()

  for (const meeting of filteredMeetings.value) {
    const dt = getMeetingDatetime(meeting)
    const dateKey = dt ? format(dt, 'yyyy-MM-dd') : 'unknown'
    if (!map.has(dateKey)) map.set(dateKey, [])
    map.get(dateKey)!.push(meeting)
  }

  for (const [date, meetings] of map) {
    // Sort meetings within day by time
    meetings.sort((a, b) => {
      const dtA = getMeetingDatetime(a)?.getTime() || 0
      const dtB = getMeetingDatetime(b)?.getTime() || 0
      return dtA - dtB
    })
    groups.push({ date, meetings })
  }

  return groups
})

const getMeetingTime = (meeting: CrmActivity): string => {
  if (meeting.metadata?.meeting_time) return meeting.metadata.meeting_time
  const dt = getMeetingDatetime(meeting)
  if (dt) return format(dt, 'HH:mm')
  return '–'
}

const formatMeetingDate = (meeting: CrmActivity): string => {
  const dt = getMeetingDatetime(meeting)
  if (!dt) return '–'
  try { return format(dt, 'dd.MM.yyyy', { locale: de }) } catch { return '–' }
}

const formatGroupDate = (dateStr: string): string => {
  if (dateStr === 'unknown') return 'Ohne Datum'
  try {
    const dt = parseISO(dateStr)
    if (isToday(dt)) return 'Heute'
    if (isTomorrow(dt)) return 'Morgen'
    return format(dt, 'EEEE, dd. MMMM yyyy', { locale: de })
  } catch {
    return dateStr
  }
}

const getLeadName = (meeting: CrmActivity): string => {
  if (typeof meeting.nursing_home_lead_id === 'object' && meeting.nursing_home_lead_id) {
    const lead = meeting.nursing_home_lead_id as any
    if (typeof lead.nursing_home_id === 'object' && lead.nursing_home_id) {
      return lead.nursing_home_id.name || '–'
    }
  }
  return '–'
}

const getLeadId = (meeting: CrmActivity): string | null => {
  if (typeof meeting.nursing_home_lead_id === 'object' && meeting.nursing_home_lead_id) {
    return (meeting.nursing_home_lead_id as any).id
  }
  return typeof meeting.nursing_home_lead_id === 'string' ? meeting.nursing_home_lead_id : null
}

const navigateToLead = (meeting: CrmActivity) => {
  const id = getLeadId(meeting)
  if (id) router.push(`/crm/leads/${id}`)
}

const outcomeLabel = (outcome: ActivityOutcome) =>
  ACTIVITY_OUTCOMES.find(o => o.value === outcome)?.label || outcome

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
