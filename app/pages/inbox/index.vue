<template>
  <div class="flex h-full -m-5">
    <!-- Linke Spalte: Filter + Liste -->
    <div class="w-[420px] flex flex-col bg-white border-r border-gray-200">
      <!-- Filter-Header -->
      <div class="px-4 py-3 border-b border-gray-100 space-y-2">
        <div class="flex gap-1 overflow-x-auto">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            :class="[
              'px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap',
              currentStatusFilter === tab.value
                ? 'bg-[#172774] text-white'
                : 'text-gray-500 hover:bg-gray-50',
            ]"
            @click="setStatusFilter(tab.value)"
          >
            {{ tab.label }}
            <span v-if="tab.count" class="ml-1 text-[10px] tabular-nums opacity-70">
              {{ tab.count }}
            </span>
          </button>
        </div>
        <div class="flex items-center gap-2">
          <i class="pi pi-search text-[11px] text-gray-300" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Suche Betreff, Kunde, Inhalt..."
            class="flex-1 text-[12px] bg-transparent border-none focus:outline-none placeholder-gray-300"
          />
        </div>
      </div>

      <!-- Liste -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="loading" class="p-6 text-center">
          <i class="pi pi-spin pi-spinner text-gray-300" />
        </div>
        <div v-else-if="filteredTickets.length === 0" class="p-6 text-center text-[12px] text-gray-400">
          Keine Tickets gefunden.
        </div>
        <NuxtLink
          v-for="t in filteredTickets"
          :key="t.id"
          :to="`/inbox/${t.id}`"
          class="block px-4 py-3 border-b border-gray-100 hover:bg-gray-50/80 transition-colors"
        >
          <div class="flex items-center justify-between gap-2 mb-1">
            <div class="flex items-center gap-1.5 min-w-0">
              <i :class="channelIcon(t.channel)" class="text-[11px] text-gray-400 flex-shrink-0" />
              <span class="text-[12px] font-medium text-gray-800 truncate">{{ t.customer_name || 'Unbekannt' }}</span>
              <span
                v-if="(t.unread_count || 0) > 0"
                class="w-1.5 h-1.5 rounded-full bg-[#172774] flex-shrink-0"
              />
            </div>
            <span class="text-[10px] text-gray-400 flex-shrink-0">{{ formatRelative(t.last_message_at || t.date_created) }}</span>
          </div>
          <p class="text-[12px] text-gray-700 font-medium truncate mb-0.5">{{ t.subject }}</p>
          <p class="text-[11px] text-gray-400 line-clamp-1">{{ t.last_message_preview }}</p>
          <div class="flex items-center gap-1.5 mt-1.5">
            <span
              class="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
              :style="{ backgroundColor: statusColor(t.status) + '20', color: statusColor(t.status) }"
            >
              {{ statusLabel(t.status) }}
            </span>
            <span
              v-if="t.priority === 'hoch' || t.priority === 'dringend'"
              class="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
              :style="{ backgroundColor: priorityColor(t.priority) + '20', color: priorityColor(t.priority) }"
            >
              {{ priorityLabel(t.priority) }}
            </span>
            <span
              v-if="t.sla_breach"
              class="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-red-100 text-red-700"
            >
              <i class="pi pi-exclamation-triangle text-[8px] mr-0.5" />SLA
            </span>
            <span v-if="t.customer_type === 'heimkunde'" class="text-[9px] text-gray-400">
              Heimkunde
            </span>
            <span v-else-if="t.customer_type === 'patient'" class="text-[9px] text-gray-400">
              Patient
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Rechte Spalte: Detail-Placeholder -->
    <div class="flex-1 flex items-center justify-center bg-[#fafafa]">
      <div class="text-center text-gray-400">
        <i class="pi pi-inbox text-4xl mb-3 block" />
        <p class="text-[13px]">Wähle ein Ticket aus der Liste,</p>
        <p class="text-[13px]">um den Thread zu sehen.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_CHANNELS,
  type TicketStatus,
} from '~/types/ticket'

definePageMeta({ layout: 'crm', middleware: 'auth' })

const { filteredTickets, counts, loading, filter, fetchTickets } = useTickets()

onMounted(() => fetchTickets())

const currentStatusFilter = ref<TicketStatus | 'all' | 'mine' | 'unread'>('all')

const statusTabs = computed(() => [
  { value: 'all' as const, label: 'Alle', count: counts.value.all },
  { value: 'mine' as const, label: 'Mir zugewiesen', count: counts.value.mine },
  { value: 'unread' as const, label: 'Ungelesen', count: counts.value.unread },
  { value: 'neu' as const, label: 'Neu', count: counts.value.neu || 0 },
  { value: 'offen' as const, label: 'Offen', count: counts.value.offen || 0 },
  { value: 'wartend_kunde' as const, label: 'Wartend', count: counts.value.wartend_kunde || 0 },
])

const setStatusFilter = (val: typeof currentStatusFilter.value) => {
  currentStatusFilter.value = val
  const { id: userId } = (useState<any>('auth.user').value) || {}
  filter.value = {}
  if (val === 'mine') {
    filter.value.assignee_id = userId
  } else if (val === 'unread') {
    filter.value.unread_only = true
  } else if (val !== 'all') {
    filter.value.status = [val]
  }
}

const searchQuery = ref('')
watch(searchQuery, (v) => {
  filter.value = { ...filter.value, search: v }
})

const channelIcon = (c: string) => TICKET_CHANNELS.find((x) => x.value === c)?.icon || 'pi pi-envelope'
const statusColor = (s: string) => TICKET_STATUSES.find((x) => x.value === s)?.color || '#6b7280'
const statusLabel = (s: string) => TICKET_STATUSES.find((x) => x.value === s)?.label || s
const priorityColor = (p: string) => TICKET_PRIORITIES.find((x) => x.value === p)?.color || '#6b7280'
const priorityLabel = (p: string) => TICKET_PRIORITIES.find((x) => x.value === p)?.label || p

const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'jetzt'
  if (min < 60) return `${min} Min`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} Std`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} T`
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}
</script>
