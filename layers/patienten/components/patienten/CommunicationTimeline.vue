<template>
  <div class="bg-white rounded-lg border border-dental-blue--5 overflow-hidden">
    <header class="flex items-center justify-between px-4 py-3 border-b border-dental-blue--5">
      <h3 class="text-sm font-semibold text-dental-blue-0">Kommunikations-Timeline</h3>
      <div class="flex gap-1">
        <button
          v-for="f in filters"
          :key="f.value"
          :class="[
            'text-[10px] px-2 py-0.5 rounded-md transition-colors',
            activeFilter === f.value
              ? 'bg-dental-blue-0 text-white'
              : 'text-dental-blue--2 hover:bg-dental-blue--6',
          ]"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
        </button>
      </div>
    </header>

    <div v-if="!grouped.length" class="px-4 py-8 text-center text-sm text-dental-blue--3">
      <i class="pi pi-clock text-2xl mb-2 block opacity-40" />
      Noch keine Kommunikation für diesen Lead.
    </div>

    <div v-else class="divide-y divide-dental-blue--6">
      <section v-for="group in grouped" :key="group.label" class="px-4 py-3">
        <h4 class="text-[10px] font-bold text-dental-blue--3 uppercase tracking-wider mb-2">
          {{ group.label }}
        </h4>
        <ul class="space-y-3">
          <li v-for="item in group.items" :key="item.key" class="flex gap-3">
            <!-- Icon -->
            <div
              class="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
              :style="{ backgroundColor: item.iconBg, color: item.iconColor }"
            >
              <i :class="item.icon" class="text-[12px]" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline justify-between gap-2">
                <p class="text-sm text-dental-blue-0 font-medium truncate">
                  {{ item.title }}
                </p>
                <span class="text-[11px] text-dental-blue--3 flex-shrink-0">
                  {{ formatTime(item.date) }}
                </span>
              </div>
              <p v-if="item.subtitle" class="text-[12px] text-dental-blue--2 mt-0.5 line-clamp-2">
                {{ item.subtitle }}
              </p>
              <div v-if="item.badges?.length" class="flex flex-wrap gap-1 mt-1.5">
                <span
                  v-for="b in item.badges"
                  :key="b.label"
                  class="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  :style="{ backgroundColor: b.bgColor, color: b.color }"
                >
                  <i v-if="b.icon" :class="b.icon" class="text-[9px]" />
                  {{ b.label }}
                </span>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <!-- Mehr-anzeigen-Footer -->
    <div v-if="hiddenCount > 0" class="px-4 py-3 border-t border-dental-blue--5 text-center">
      <button
        class="text-[11px] text-dental-blue--1 hover:text-dental-blue-0 hover:underline font-medium"
        @click="showAll = true"
      >
        ↓ {{ hiddenCount }} weitere {{ hiddenCount === 1 ? 'Eintrag' : 'Einträge' }} anzeigen
      </button>
    </div>
    <div v-else-if="showAll && totalFilteredCount > INITIAL_LIMIT" class="px-4 py-3 border-t border-dental-blue--5 text-center">
      <button
        class="text-[11px] text-dental-blue--3 hover:text-dental-blue-0 hover:underline"
        @click="showAll = false"
      >
        ↑ Einklappen (nur {{ INITIAL_LIMIT }} neueste)
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ACTIVITY_TYPE_CONFIG, LEAD_STATUS_CONFIG, type LeadActivity, type LeadActivityType } from '~/types/crm'

const props = defineProps<{
  activities: LeadActivity[]
}>()

const { getEmailStatus, getStatusBadge } = useEmailEvents()

type FilterValue = 'all' | 'communication' | 'status'

const filters: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'Alle' },
  { value: 'communication', label: 'Nachrichten' },
  { value: 'status', label: 'Status' },
]
const activeFilter = ref<FilterValue>('all')

const INITIAL_LIMIT = 5
const showAll = ref(false)

// Beim Filter-Wechsel die Limit-Anzeige zurücksetzen
watch(activeFilter, () => { showAll.value = false })

interface TimelineItem {
  key: string
  date: string
  title: string
  subtitle?: string
  icon: string
  iconColor: string
  iconBg: string
  badges?: { label: string; color: string; bgColor: string; icon?: string }[]
}

const enriched = computed<TimelineItem[]>(() => {
  const items: TimelineItem[] = []

  for (const a of props.activities) {
    const cfg = ACTIVITY_TYPE_CONFIG[a.type as LeadActivityType]
    const item: TimelineItem = {
      key: a.id,
      date: a.date_created,
      title: a.subject,
      subtitle: a.content,
      icon: cfg?.icon || 'pi pi-circle',
      iconColor: cfg?.color || '#94a3b8',
      iconBg: cfg?.bgColor || '#f1f5f9',
      badges: [],
    }

    // Direction-Badge (für Communication)
    if (a.direction) {
      item.badges!.push({
        label: a.direction === 'inbound' ? 'Eingehend' : 'Ausgehend',
        color: '#6b7280',
        bgColor: '#f3f4f6',
        icon: a.direction === 'inbound' ? 'pi pi-arrow-down' : 'pi pi-arrow-up',
      })
    }

    // Duration für Calls/Meetings
    if (a.duration_minutes) {
      item.badges!.push({
        label: `${a.duration_minutes} Min`,
        color: '#6b7280',
        bgColor: '#f3f4f6',
        icon: 'pi pi-clock',
      })
    }

    // Brevo-Tracking-Badge für E-Mails
    if (a.type === 'email' || a.type === 'email_sent') {
      const status = getEmailStatus(a.id)
      const badge = getStatusBadge(status)
      if (badge) {
        item.badges!.push({
          label: badge.label,
          color: badge.color,
          bgColor: badge.bgColor,
          icon: badge.icon,
        })
      }
    }

    // Status-Change-Spezial-Anzeige
    if (a.type === 'stage_change') {
      const from = a.metadata?.from_status
      const to = a.metadata?.to_status
      if (from && to) {
        item.title = `Status: ${LEAD_STATUS_CONFIG[from]?.label || from} → ${LEAD_STATUS_CONFIG[to]?.label || to}`
      }
    }

    // No-Show Spezial
    if (a.type === 'no_show') {
      item.badges!.push({
        label: 'Patient nicht erschienen',
        color: '#ef4444',
        bgColor: '#fee2e2',
        icon: 'pi pi-times-circle',
      })
    }

    items.push(item)
  }

  // Filter anwenden
  return items.filter((i) => {
    if (activeFilter.value === 'all') return true
    const orig = props.activities.find((a) => a.id === i.key)
    if (!orig) return false
    if (activeFilter.value === 'status') {
      return orig.type === 'stage_change' || orig.type === 'no_show'
    }
    if (activeFilter.value === 'communication') {
      return ['call', 'email', 'email_sent', 'email_received', 'sms', 'whatsapp', 'meeting', 'note', 'newsletter'].includes(orig.type)
    }
    return true
  })
})

// Sortiert + (optional) auf Limit geschnitten
const sortedEnriched = computed<TimelineItem[]>(() =>
  [...enriched.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
)

const totalFilteredCount = computed(() => sortedEnriched.value.length)

const visibleEnriched = computed<TimelineItem[]>(() =>
  showAll.value ? sortedEnriched.value : sortedEnriched.value.slice(0, INITIAL_LIMIT),
)

const hiddenCount = computed(() =>
  !showAll.value && totalFilteredCount.value > INITIAL_LIMIT
    ? totalFilteredCount.value - INITIAL_LIMIT
    : 0,
)

// Gruppierung nach Datum (auf der gesliceten Liste)
type Group = { label: string; items: TimelineItem[] }
const grouped = computed<Group[]>(() => {
  const groups: Record<string, TimelineItem[]> = {}

  for (const item of visibleEnriched.value) {
    const label = relativeDayLabel(item.date)
    if (!groups[label]) groups[label] = []
    groups[label].push(item)
  }

  return Object.entries(groups).map(([label, items]) => ({ label, items }))
})

const relativeDayLabel = (iso: string): string => {
  const now = new Date()
  const d = new Date(iso)
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Heute'
  if (diffDays === 1) return 'Gestern'
  if (diffDays < 7) return `Vor ${diffDays} Tagen`
  if (diffDays < 30) return `Vor ${Math.floor(diffDays / 7)} Wochen`
  return d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
}

const formatTime = (iso: string): string => {
  const d = new Date(iso)
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}
</script>
