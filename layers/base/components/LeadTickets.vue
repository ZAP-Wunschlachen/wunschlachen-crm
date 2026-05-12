<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <i class="pi pi-inbox text-[12px] text-gray-400" />
        <h3 class="text-[12px] font-semibold text-gray-700 uppercase tracking-wider">
          Tickets
          <span v-if="leadTickets.length" class="text-gray-400 ml-1 text-[10px]">
            ({{ leadTickets.length }})
          </span>
        </h3>
      </div>
      <NuxtLink
        to="/inbox"
        class="text-[10px] font-medium text-[#172774] hover:underline"
      >
        Alle →
      </NuxtLink>
    </div>

    <div v-if="loading" class="p-4 text-center">
      <i class="pi pi-spin pi-spinner text-gray-300 text-sm" />
    </div>

    <div v-else-if="!leadTickets.length" class="p-4 text-[11px] text-gray-400 text-center">
      Keine Tickets verknüpft.
    </div>

    <div v-else class="divide-y divide-gray-100">
      <NuxtLink
        v-for="t in leadTickets"
        :key="t.id"
        :to="`/inbox/${t.id}`"
        class="block px-4 py-2.5 hover:bg-gray-50/80 transition-colors"
      >
        <div class="flex items-center justify-between mb-0.5">
          <div class="flex items-center gap-1.5 min-w-0">
            <i :class="channelIcon(t.channel)" class="text-[10px] text-gray-400 flex-shrink-0" />
            <span class="text-[12px] font-medium text-gray-800 truncate">{{ t.subject }}</span>
          </div>
          <span class="text-[9px] text-gray-400 flex-shrink-0">
            {{ formatDate(t.last_message_at || t.date_created) }}
          </span>
        </div>
        <div class="flex items-center gap-1.5">
          <span
            class="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
            :style="{
              backgroundColor: statusColor(t.status) + '20',
              color: statusColor(t.status),
            }"
          >
            {{ statusLabel(t.status) }}
          </span>
          <span v-if="t.sla_breach" class="text-[9px] text-red-600 font-medium">
            <i class="pi pi-exclamation-triangle text-[8px]" /> SLA
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TICKET_STATUSES, TICKET_CHANNELS, type TicketCustomerType } from '~/types/ticket'

const props = defineProps<{
  leadId: string
  customerType: TicketCustomerType
}>()

const { tickets, fetchTickets, loading } = useTickets()

onMounted(() => {
  if (!tickets.value.length) fetchTickets()
})

const leadTickets = computed(() =>
  tickets.value
    .filter(
      (t) =>
        t.customer_type === props.customerType &&
        (t.customer_id === props.leadId || t.related_lead_id === props.leadId),
    )
    .slice(0, 10),
)

const channelIcon = (c: string) =>
  TICKET_CHANNELS.find((x) => x.value === c)?.icon || 'pi pi-envelope'
const statusColor = (s: string) =>
  TICKET_STATUSES.find((x) => x.value === s)?.color || '#6b7280'
const statusLabel = (s: string) =>
  TICKET_STATUSES.find((x) => x.value === s)?.label || s

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
</script>
