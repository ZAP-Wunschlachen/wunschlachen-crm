<template>
  <div>
    <div v-if="activities.length === 0" class="text-sm text-dental-blue--3 py-4 text-center">
      Noch keine Aktivitäten
    </div>

    <div v-else>
      <!-- Filter-Bar -->
      <div class="flex items-center justify-between gap-2 mb-3 text-[11px]">
        <label class="flex items-center gap-1.5 text-dental-blue--2 cursor-pointer select-none">
          <input v-model="hideSystemEvents" type="checkbox" class="accent-dental-blue-0" />
          System-Events ausblenden
          <span v-if="systemEventCount > 0" class="text-dental-blue--3">({{ systemEventCount }})</span>
        </label>
        <span class="text-dental-blue--3">{{ filteredActivities.length }} von {{ activities.length }}</span>
      </div>

    <div class="space-y-3">
      <div
        v-for="activity in displayedActivities"
        :key="activity.id"
        class="flex gap-3 group"
      >
        <!-- Type icon -->
        <div
          class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
          :style="{ backgroundColor: typeConfig(activity.type).bgColor }"
        >
          <i :class="typeConfig(activity.type).icon" class="text-xs" :style="{ color: typeConfig(activity.type).color }" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-medium text-dental-blue-0 truncate">{{ activity.subject }}</p>
            <button
              class="text-dental-blue--3 hover:text-power-red-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Löschen"
              @click="$emit('removed', activity.id)"
            >
              <i class="pi pi-trash text-[10px]" />
            </button>
          </div>

          <div class="flex items-center gap-2 text-[10px] text-dental-blue--3 mt-0.5">
            <span>{{ activity.user_name }}</span>
            <span>·</span>
            <span>{{ relativeDate(activity.date_created) }}</span>
            <span v-if="activity.outcome" class="px-1.5 py-0.5 rounded-full text-[9px] font-medium" :style="outcomeStyle(activity.outcome)">
              {{ ACTIVITY_OUTCOME_LABELS[activity.outcome] }}
            </span>
            <span v-if="activity.duration_minutes" class="text-dental-blue--3">
              {{ activity.duration_minutes }} Min.
            </span>
          </div>

          <!-- Content preview -->
          <div v-if="activity.content" class="mt-1">
            <p
              class="text-xs text-dental-blue--2 whitespace-pre-wrap"
              :class="{ 'line-clamp-3': !expanded.has(activity.id) }"
            >
              {{ activity.content }}
            </p>
            <button
              v-if="activity.content.length > 150"
              class="text-[10px] text-dental-blue--1 hover:underline mt-0.5"
              @click="toggleExpand(activity.id)"
            >
              {{ expanded.has(activity.id) ? 'Weniger' : 'Mehr' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mehr-anzeigen-Button -->
    <div v-if="hiddenCount > 0" class="mt-3 pt-3 border-t border-dental-blue--5 text-center">
      <button
        class="text-[11px] text-dental-blue--1 hover:text-dental-blue-0 hover:underline font-medium"
        @click="showAll = true"
      >
        ↓ {{ hiddenCount }} weitere {{ hiddenCount === 1 ? 'Aktivität' : 'Aktivitäten' }} anzeigen
      </button>
    </div>
    <div v-else-if="showAll && filteredActivities.length > INITIAL_LIMIT" class="mt-3 pt-3 border-t border-dental-blue--5 text-center">
      <button
        class="text-[11px] text-dental-blue--3 hover:text-dental-blue-0 hover:underline"
        @click="showAll = false"
      >
        ↑ Einklappen (nur {{ INITIAL_LIMIT }} neueste)
      </button>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ACTIVITY_TYPE_CONFIG,
  ACTIVITY_OUTCOME_LABELS,
  MANUAL_ACTIVITY_TYPES,
  type LeadActivity,
  type LeadActivityType,
  type ActivityOutcome,
} from '~/types/crm'

const props = defineProps<{
  activities: LeadActivity[]
}>()

defineEmits<{ removed: [id: string] }>()

const INITIAL_LIMIT = 5
const expanded = ref<Set<string>>(new Set())
const showAll = ref(false)
const hideSystemEvents = ref(false)

const isManual = (t: LeadActivityType): boolean => MANUAL_ACTIVITY_TYPES.includes(t)

const sortedActivities = computed(() =>
  [...props.activities].sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime()),
)

const systemEventCount = computed(() => sortedActivities.value.filter((a) => !isManual(a.type)).length)

const filteredActivities = computed(() =>
  hideSystemEvents.value
    ? sortedActivities.value.filter((a) => isManual(a.type))
    : sortedActivities.value,
)

const displayedActivities = computed(() =>
  showAll.value ? filteredActivities.value : filteredActivities.value.slice(0, INITIAL_LIMIT),
)

const hiddenCount = computed(() =>
  !showAll.value && filteredActivities.value.length > INITIAL_LIMIT
    ? filteredActivities.value.length - INITIAL_LIMIT
    : 0,
)

const typeConfig = (type: LeadActivityType) => ACTIVITY_TYPE_CONFIG[type] || ACTIVITY_TYPE_CONFIG.note

const toggleExpand = (id: string) => {
  const next = new Set(expanded.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expanded.value = next
}

const outcomeStyle = (outcome: ActivityOutcome) => {
  const colors: Record<ActivityOutcome, { color: string; bg: string }> = {
    successful: { color: '#22c55e', bg: '#f0fdf4' },
    no_contact: { color: '#f97316', bg: '#fff7ed' },
    callback: { color: '#3b82f6', bg: '#eff6ff' },
    rejection: { color: '#ef4444', bg: '#fef2f2' },
  }
  const c = colors[outcome]
  return { color: c.color, backgroundColor: c.bg }
}

const relativeDate = (iso: string): string => {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'gerade eben'
  if (diffMin < 60) return `vor ${diffMin} Min.`
  if (diffH < 24) return `vor ${diffH} Std.`
  if (diffD < 7) return `vor ${diffD} Tag${diffD > 1 ? 'en' : ''}`
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })
}
</script>
