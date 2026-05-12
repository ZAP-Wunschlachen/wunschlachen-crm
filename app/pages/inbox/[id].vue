<template>
  <div class="flex h-full -m-5">
    <!-- Linke Spalte: Liste (shrinking auf Detail-View) -->
    <div class="w-[320px] flex flex-col bg-white border-r border-gray-200">
      <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <NuxtLink to="/inbox" class="text-[12px] text-gray-500 hover:text-gray-800">
          <i class="pi pi-arrow-left text-[11px] mr-1" />Inbox
        </NuxtLink>
      </div>
      <div class="flex-1 overflow-y-auto">
        <NuxtLink
          v-for="t in filteredTickets"
          :key="t.id"
          :to="`/inbox/${t.id}`"
          :class="[
            'block px-3 py-2.5 border-b border-gray-100 transition-colors',
            t.id === ticketId ? 'bg-[#172774]/[0.06]' : 'hover:bg-gray-50/80',
          ]"
        >
          <div class="flex items-center justify-between mb-0.5">
            <span class="text-[12px] font-medium text-gray-800 truncate">{{ t.customer_name || 'Unbekannt' }}</span>
            <span class="text-[10px] text-gray-400">{{ formatRelative(t.last_message_at || t.date_created) }}</span>
          </div>
          <p class="text-[11px] text-gray-500 truncate">{{ t.subject }}</p>
        </NuxtLink>
      </div>
    </div>

    <!-- Mittlere Spalte: Thread + Reply -->
    <div class="flex-1 flex flex-col bg-[#fafafa] min-w-0">
      <div v-if="!ticket" class="flex-1 flex items-center justify-center text-gray-400">
        <i class="pi pi-spin pi-spinner mr-2" />Lade Ticket...
      </div>

      <template v-else>
        <!-- Header -->
        <div class="px-5 py-3 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <i :class="channelIcon(ticket.channel)" class="text-[12px] text-gray-400" />
              <h2 class="text-[14px] font-semibold text-gray-800 truncate">{{ ticket.subject }}</h2>
            </div>
            <p class="text-[11px] text-gray-400 mt-0.5">
              {{ ticket.customer_name || 'Unbekannt' }}
              <span class="mx-1">·</span>
              {{ ticket.customer_type === 'heimkunde' ? 'Heimkunde' : ticket.customer_type === 'patient' ? 'Patient' : 'Unbekannt' }}
              <span v-if="ticket.related_lead_id" class="mx-1">·</span>
              <NuxtLink
                v-if="ticket.related_lead_id"
                :to="leadLink"
                class="text-[#172774] hover:underline"
              >
                Lead öffnen →
              </NuxtLink>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <select
              :value="ticket.status"
              class="text-[11px] px-2 py-1 border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400"
              @change="onStatusChange(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="s in TICKET_STATUSES" :key="s.value" :value="s.value">
                {{ s.label }}
              </option>
            </select>
            <select
              :value="ticket.priority"
              class="text-[11px] px-2 py-1 border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400"
              @change="onPriorityChange(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="p in TICKET_PRIORITIES" :key="p.value" :value="p.value">
                {{ p.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Thread -->
        <div class="flex-1 overflow-y-auto p-5 space-y-3">
          <div
            v-for="msg in messages"
            :key="msg.id"
            :class="['flex', msg.direction === 'outbound' ? 'justify-end' : 'justify-start']"
          >
            <div
              :class="[
                'max-w-[75%] rounded-lg p-3 border',
                msg.direction === 'outbound'
                  ? 'bg-[#172774] text-white border-[#172774]'
                  : 'bg-white border-gray-200',
              ]"
            >
              <div
                :class="[
                  'flex items-center gap-2 text-[10px] mb-1.5 font-medium',
                  msg.direction === 'outbound' ? 'text-white/70' : 'text-gray-400',
                ]"
              >
                <i :class="channelIcon(msg.channel)" class="text-[10px]" />
                <span v-if="msg.direction === 'outbound'">
                  {{ msg.sender ? `${msg.sender.first_name} ${msg.sender.last_name}` : 'Team' }}
                </span>
                <span v-else>{{ msg.from_address || ticket.customer_name }}</span>
                <span class="mx-1">·</span>
                <span>{{ formatDateTime(msg.date_created) }}</span>
              </div>
              <div v-if="msg.subject && msg.subject !== ticket.subject" class="text-[12px] font-medium mb-1">
                {{ msg.subject }}
              </div>
              <div class="text-[13px] whitespace-pre-wrap leading-relaxed">{{ msg.body_text }}</div>
            </div>
          </div>
        </div>

        <!-- Reply-Box -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white p-3">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-[11px] text-gray-400">Antworten via:</span>
            <select
              v-model="replyChannel"
              class="text-[11px] px-2 py-1 border border-gray-200 rounded-md bg-white"
            >
              <option value="email">E-Mail</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
            <button
              class="text-[11px] px-2 py-1 border border-gray-200 rounded-md bg-white text-gray-600 hover:bg-gray-50"
              :disabled="!macros.length"
              @click="showMacros = !showMacros"
            >
              <i class="pi pi-bolt text-[10px] mr-1" />Macros
            </button>
          </div>

          <!-- Macros-Picker (T7) -->
          <div v-if="showMacros && macros.length" class="mb-2 bg-gray-50 border border-gray-200 rounded-md p-2 max-h-32 overflow-y-auto">
            <button
              v-for="m in macros"
              :key="m.id"
              class="block w-full text-left px-2 py-1.5 text-[11px] hover:bg-white rounded transition-colors"
              @click="applyMacro(m)"
            >
              <span class="font-medium text-gray-700">{{ m.name }}</span>
              <span v-if="m.description" class="text-gray-400 ml-2">{{ m.description }}</span>
            </button>
          </div>

          <textarea
            v-model="replyBody"
            :placeholder="`Antwort als ${replyChannel}...`"
            rows="3"
            class="w-full text-[13px] border border-gray-200 rounded-md p-2.5 focus:outline-none focus:border-[#172774] resize-none"
          />
          <div class="flex items-center justify-between mt-2">
            <span class="text-[11px] text-gray-400">{{ replyBody.length }} Zeichen</span>
            <button
              class="px-4 py-1.5 bg-[#172774] text-white text-[12px] font-medium rounded-md hover:bg-[#1f2f8a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :disabled="!replyBody.trim() || sending"
              @click="onSendReply"
            >
              <i v-if="sending" class="pi pi-spin pi-spinner text-[11px] mr-1" />
              {{ sending ? 'Senden...' : 'Antworten' }}
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Rechte Spalte: Sidebar (Status, Assignee, Tags, Verlauf) -->
    <aside v-if="ticket" class="w-[280px] bg-white border-l border-gray-200 flex flex-col overflow-y-auto flex-shrink-0">
      <div class="p-4 space-y-4">
        <!-- Assignee -->
        <div>
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Zugewiesen</p>
          <div v-if="ticket.assignee" class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-[#172774] text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
              {{ getInitials(ticket.assignee) }}
            </div>
            <div class="min-w-0">
              <p class="text-[12px] font-medium text-gray-800 truncate">
                {{ ticket.assignee.first_name }} {{ ticket.assignee.last_name }}
              </p>
            </div>
          </div>
          <button v-else class="text-[12px] text-[#172774] hover:underline" @click="assignToMe">
            <i class="pi pi-user-plus text-[11px] mr-1" />Mir zuweisen
          </button>
        </div>

        <!-- Kunde -->
        <div>
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Kunde</p>
          <p class="text-[12px] font-medium text-gray-800">{{ ticket.customer_name || 'Unbekannt' }}</p>
          <p class="text-[11px] text-gray-500">
            {{ ticket.customer_type === 'heimkunde' ? 'Heimkunde' : ticket.customer_type === 'patient' ? 'Patient' : '—' }}
          </p>
          <NuxtLink v-if="leadLink" :to="leadLink" class="text-[11px] text-[#172774] hover:underline mt-1 inline-block">
            <i class="pi pi-external-link text-[10px] mr-1" />Profil öffnen
          </NuxtLink>
        </div>

        <!-- Tags -->
        <div>
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Tags</p>
          <div v-if="ticket.tags?.length" class="flex flex-wrap gap-1">
            <span
              v-for="tag in ticket.tags"
              :key="tag"
              class="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full"
            >{{ tag }}</span>
          </div>
          <p v-else class="text-[11px] text-gray-300">Keine Tags</p>
        </div>

        <!-- Metadaten -->
        <div>
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Details</p>
          <dl class="text-[11px] space-y-1">
            <div class="flex justify-between">
              <dt class="text-gray-400">Kanal</dt>
              <dd class="text-gray-700">
                <i :class="channelIcon(ticket.channel)" class="text-[10px] mr-1" />
                {{ TICKET_CHANNELS.find(c => c.value === ticket.channel)?.label }}
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-400">Erstellt</dt>
              <dd class="text-gray-700">{{ formatDateTime(ticket.date_created) }}</dd>
            </div>
            <div v-if="ticket.first_response_at" class="flex justify-between">
              <dt class="text-gray-400">1. Antwort</dt>
              <dd class="text-gray-700">{{ formatDateTime(ticket.first_response_at) }}</dd>
            </div>
            <div v-if="ticket.resolved_at" class="flex justify-between">
              <dt class="text-gray-400">Gelöst</dt>
              <dd class="text-gray-700">{{ formatDateTime(ticket.resolved_at) }}</dd>
            </div>
            <div v-if="ticket.sla_breach" class="text-[11px] text-red-600 mt-2">
              <i class="pi pi-exclamation-triangle text-[10px] mr-1" />SLA überschritten
            </div>
          </dl>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_CHANNELS,
  type Ticket,
  type TicketMessage,
  type TicketMacro,
  type TicketUser,
} from '~/types/ticket'

definePageMeta({ layout: 'crm', middleware: 'auth' })

const route = useRoute()
const ticketId = computed(() => route.params.id as string)

const { filteredTickets, fetchTickets, fetchTicket, fetchMessages, sendReply, updateTicket } = useTickets()
const { fetchMacros } = useTicketMacros()

const ticket = ref<Ticket | null>(null)
const messages = ref<TicketMessage[]>([])
const macros = ref<TicketMacro[]>([])
const sending = ref(false)
const replyBody = ref('')
const replyChannel = ref<'email' | 'sms' | 'whatsapp'>('email')
const showMacros = ref(false)

const loadAll = async () => {
  if (!filteredTickets.value.length) await fetchTickets()
  ticket.value = await fetchTicket(ticketId.value)
  if (ticket.value) {
    messages.value = await fetchMessages(ticket.value.id)
    replyChannel.value = (ticket.value.channel === 'sms' || ticket.value.channel === 'whatsapp')
      ? ticket.value.channel
      : 'email'
    macros.value = await fetchMacros({
      channel: ticket.value.channel,
      customer_type: ticket.value.customer_type,
    })
  }
}
watch(ticketId, loadAll, { immediate: true })

const leadLink = computed(() => {
  if (!ticket.value?.related_lead_id) return ''
  return ticket.value.customer_type === 'patient'
    ? `/patienten/${ticket.value.related_lead_id}`
    : `/crm/heime/${ticket.value.related_lead_id}`
})

const onSendReply = async () => {
  if (!ticket.value || !replyBody.value.trim()) return
  sending.value = true
  try {
    const msg = await sendReply({
      ticket_id: ticket.value.id,
      channel: replyChannel.value,
      body_text: replyBody.value.trim(),
    })
    messages.value.push(msg)
    replyBody.value = ''
    // Ticket-State refreshen für Header-Update
    ticket.value = await fetchTicket(ticket.value.id)
  } finally {
    sending.value = false
  }
}

const onStatusChange = async (newStatus: string) => {
  if (!ticket.value) return
  ticket.value = (await updateTicket(ticket.value.id, { status: newStatus as any })) || ticket.value
}
const onPriorityChange = async (newPriority: string) => {
  if (!ticket.value) return
  ticket.value = (await updateTicket(ticket.value.id, { priority: newPriority as any })) || ticket.value
}

const assignToMe = async () => {
  if (!ticket.value) return
  const me = useState<any>('auth.user').value
  if (!me) return
  ticket.value = (await updateTicket(ticket.value.id, {
    assignee_id: me.id,
    assignee: { id: me.id, first_name: me.first_name, last_name: me.last_name },
  })) || ticket.value
}

const applyMacro = (m: TicketMacro) => {
  const u = useState<any>('auth.user').value
  const variables: Record<string, string> = {
    first_name: ticket.value?.customer_name?.split(' ')[0] || '',
    last_name: ticket.value?.customer_name?.split(' ').slice(1).join(' ') || '',
    ticket_id: ticket.value?.id || '',
    sender_name: u ? `${u.first_name} ${u.last_name}` : '',
  }
  let body = m.body_template
  for (const [k, v] of Object.entries(variables)) {
    body = body.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'g'), v)
  }
  replyBody.value = body
  showMacros.value = false
}

const channelIcon = (c: string) => TICKET_CHANNELS.find((x) => x.value === c)?.icon || 'pi pi-envelope'

const formatRelative = (iso?: string) => {
  if (!iso) return ''
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

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })

const getInitials = (u: TicketUser) => {
  const f = u.first_name?.[0] || ''
  const l = u.last_name?.[0] || ''
  return (f + l).toUpperCase() || '?'
}
</script>
