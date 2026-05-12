/**
 * useTickets — zentrales Composable für Ticket-System (Phase 9)
 *
 * Solange Directus-Schema noch nicht angelegt ist (siehe docs/TICKETS_SCHEMA.md),
 * läuft der Composable im Mock-Mode mit lokalen Demo-Daten. Sobald Tony die
 * Collections in Directus angelegt hat, USE_MOCK_DATA = false setzen.
 */

import type {
  Ticket,
  TicketMessage,
  TicketFilter,
  TicketStatus,
  TicketPriority,
} from '../types/ticket'

const USE_MOCK_DATA = true
const COLLECTION_TICKETS = 'tickets'
const COLLECTION_MESSAGES = 'ticket_messages'

// ──────────────────────────────────────────────────────────────────────────────
// MOCK-DATEN (entfernt sobald Directus bereit)
// ──────────────────────────────────────────────────────────────────────────────

const mockTickets: Ticket[] = [
  {
    id: 'tk-001',
    subject: 'Anfrage Neueinrichtung Implantatversorgung',
    status: 'neu',
    priority: 'hoch',
    channel: 'email',
    customer_type: 'heimkunde',
    customer_id: 'mock-heim-1',
    customer_name: 'Seniorenresidenz Sonnenhof',
    assignee_id: null,
    assignee: null,
    tags: ['neueinrichtung', 'angebot'],
    related_lead_id: 'mock-heim-1',
    first_response_at: null,
    resolved_at: null,
    sla_breach: false,
    date_created: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    date_updated: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    message_count: 1,
    last_message_preview: 'Sehr geehrte Damen und Herren, wir suchen für unseren neuen Standort eine Kooperation für Implantat-Versorgung von 12 Bewohnern...',
    last_message_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    last_message_direction: 'inbound',
    unread_count: 1,
  },
  {
    id: 'tk-002',
    subject: 'Termin verschieben',
    status: 'offen',
    priority: 'mittel',
    channel: 'sms',
    customer_type: 'patient',
    customer_id: 'mock-pat-1',
    customer_name: 'Maria Schmidt',
    assignee_id: 'dev-tony',
    assignee: { id: 'dev-tony', first_name: 'Tony', last_name: 'Günther' },
    tags: ['termin'],
    related_lead_id: null,
    first_response_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    resolved_at: null,
    sla_breach: false,
    date_created: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    date_updated: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    message_count: 3,
    last_message_preview: 'Vielen Dank, dann sehen wir uns am Donnerstag.',
    last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    last_message_direction: 'inbound',
    unread_count: 0,
  },
  {
    id: 'tk-003',
    subject: 'Frage zur Beratung',
    status: 'wartend_kunde',
    priority: 'mittel',
    channel: 'whatsapp',
    customer_type: 'patient',
    customer_id: 'mock-pat-2',
    customer_name: 'Thomas Becker',
    assignee_id: 'dev-tony',
    assignee: { id: 'dev-tony', first_name: 'Tony', last_name: 'Günther' },
    tags: ['beratung'],
    related_lead_id: null,
    first_response_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    resolved_at: null,
    sla_breach: false,
    date_created: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    date_updated: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    message_count: 4,
    last_message_preview: 'Welche Unterlagen genau benötigen Sie noch von mir?',
    last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    last_message_direction: 'outbound',
    unread_count: 0,
  },
  {
    id: 'tk-004',
    subject: 'Reklamation Rechnung Q4',
    status: 'in_bearbeitung',
    priority: 'dringend',
    channel: 'email',
    customer_type: 'heimkunde',
    customer_id: 'mock-heim-2',
    customer_name: 'Pflegezentrum Am Park',
    assignee_id: 'dev-tony',
    assignee: { id: 'dev-tony', first_name: 'Tony', last_name: 'Günther' },
    tags: ['rechnung', 'reklamation', 'eskalation'],
    related_lead_id: 'mock-heim-2',
    first_response_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    resolved_at: null,
    sla_breach: true,
    date_created: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    date_updated: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    message_count: 7,
    last_message_preview: 'Wir prüfen die Position 4-7 und melden uns bis morgen mit einer Lösung.',
    last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    last_message_direction: 'outbound',
    unread_count: 0,
  },
  {
    id: 'tk-005',
    subject: 'Lead-Anfrage Webformular',
    status: 'geloest',
    priority: 'niedrig',
    channel: 'form',
    customer_type: 'patient',
    customer_id: 'mock-pat-3',
    customer_name: 'Lisa Wagner',
    assignee_id: 'dev-tony',
    assignee: { id: 'dev-tony', first_name: 'Tony', last_name: 'Günther' },
    tags: ['lead', 'website'],
    related_lead_id: 'mock-pat-3',
    first_response_at: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    resolved_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    sla_breach: false,
    date_created: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    date_updated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    message_count: 5,
    last_message_preview: 'Danke für die schnelle Hilfe!',
    last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    last_message_direction: 'inbound',
    unread_count: 0,
  },
]

const mockMessages: Record<string, TicketMessage[]> = {
  'tk-001': [
    {
      id: 'msg-001-1',
      ticket_id: 'tk-001',
      direction: 'inbound',
      channel: 'email',
      from_address: 'leitung@sonnenhof-residenz.de',
      to_address: 'kontakt@wunschlachen.de',
      subject: 'Anfrage Neueinrichtung Implantatversorgung',
      body_html: '<p>Sehr geehrte Damen und Herren,</p><p>wir suchen für unseren neuen Standort eine Kooperation für Implantat-Versorgung von 12 Bewohnern. Können Sie uns Ihr Angebot zusenden?</p><p>Mit freundlichen Grüßen<br/>M. Berger, Heimleitung</p>',
      body_text: 'Sehr geehrte Damen und Herren, wir suchen für unseren neuen Standort eine Kooperation...',
      attachments: [],
      sender_user_id: null,
      sender: null,
      external_message_id: 'brevo-xyz-001',
      read_at: null,
      date_created: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  ],
  'tk-002': [
    {
      id: 'msg-002-1',
      ticket_id: 'tk-002',
      direction: 'inbound',
      channel: 'sms',
      from_address: '+49 151 12345678',
      to_address: '+49 1801 WUNSCH',
      body_text: 'Hi, kann ich den Termin am Mittwoch auf Donnerstag verschieben?',
      attachments: [],
      sender_user_id: null,
      sender: null,
      read_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      date_created: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
    {
      id: 'msg-002-2',
      ticket_id: 'tk-002',
      direction: 'outbound',
      channel: 'sms',
      from_address: '+49 1801 WUNSCH',
      to_address: '+49 151 12345678',
      body_text: 'Hallo Frau Schmidt, klar, Donnerstag 10:00 ginge bei uns. Passt das?',
      attachments: [],
      sender_user_id: 'dev-tony',
      sender: { id: 'dev-tony', first_name: 'Tony', last_name: 'Günther' },
      read_at: null,
      date_created: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: 'msg-002-3',
      ticket_id: 'tk-002',
      direction: 'inbound',
      channel: 'sms',
      from_address: '+49 151 12345678',
      to_address: '+49 1801 WUNSCH',
      body_text: 'Vielen Dank, dann sehen wir uns am Donnerstag.',
      attachments: [],
      sender_user_id: null,
      sender: null,
      read_at: null,
      date_created: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// Composable
// ──────────────────────────────────────────────────────────────────────────────

export const useTickets = () => {
  const tickets = useState<Ticket[]>('tickets.list', () => [])
  const loading = useState<boolean>('tickets.loading', () => false)
  const filter = useState<TicketFilter>('tickets.filter', () => ({}))

  const fetchTickets = async () => {
    loading.value = true
    try {
      if (USE_MOCK_DATA) {
        await new Promise((r) => setTimeout(r, 200))
        tickets.value = [...mockTickets]
        return
      }
      const { getItems } = useSecureData()
      const data = await getItems<Ticket>({
        collection: COLLECTION_TICKETS,
        params: { sort: ['-date_updated'], limit: 200 },
      })
      tickets.value = data
    } catch (err) {
      console.error('[useTickets] fetch failed:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchTicket = async (id: string): Promise<Ticket | null> => {
    if (USE_MOCK_DATA) {
      return mockTickets.find((t) => t.id === id) || null
    }
    const { getItem } = useSecureData()
    return await getItem<Ticket>({ collection: COLLECTION_TICKETS, id })
  }

  const fetchMessages = async (ticketId: string): Promise<TicketMessage[]> => {
    if (USE_MOCK_DATA) {
      return mockMessages[ticketId] || []
    }
    const { getItems } = useSecureData()
    return await getItems<TicketMessage>({
      collection: COLLECTION_MESSAGES,
      params: {
        filter: { ticket_id: { _eq: ticketId } },
        sort: ['date_created'],
        limit: 500,
      },
    })
  }

  const sendReply = async (params: {
    ticket_id: string
    channel: 'email' | 'sms' | 'whatsapp'
    body_text: string
    body_html?: string
    subject?: string
    to_address?: string
  }): Promise<TicketMessage> => {
    if (USE_MOCK_DATA) {
      const newMsg: TicketMessage = {
        id: `msg-${Date.now()}`,
        ticket_id: params.ticket_id,
        direction: 'outbound',
        channel: params.channel,
        from_address: 'kontakt@wunschlachen.de',
        to_address: params.to_address,
        subject: params.subject,
        body_html: params.body_html,
        body_text: params.body_text,
        attachments: [],
        sender_user_id: 'dev-tony',
        sender: { id: 'dev-tony', first_name: 'Tony', last_name: 'Günther' },
        read_at: null,
        date_created: new Date().toISOString(),
      }
      ;(mockMessages[params.ticket_id] ||= []).push(newMsg)
      const t = mockTickets.find((t) => t.id === params.ticket_id)
      if (t) {
        t.last_message_preview = params.body_text.slice(0, 200)
        t.last_message_at = newMsg.date_created
        t.last_message_direction = 'outbound'
        t.message_count = (t.message_count || 0) + 1
        t.date_updated = newMsg.date_created
        if (!t.first_response_at) t.first_response_at = newMsg.date_created
        if (t.status === 'neu') t.status = 'in_bearbeitung'
      }
      return newMsg
    }
    // TODO Phase 9 T3-T5: an /api/outbound/{channel} senden
    const fetchUrl = `/api/outbound/${params.channel}`
    return await $fetch<TicketMessage>(fetchUrl, { method: 'POST', body: params })
  }

  const updateTicket = async (id: string, updates: Partial<Ticket>): Promise<Ticket | null> => {
    if (USE_MOCK_DATA) {
      const t = mockTickets.find((t) => t.id === id)
      if (!t) return null
      Object.assign(t, updates, { date_updated: new Date().toISOString() })
      if (updates.status === 'geloest' && !t.resolved_at) {
        t.resolved_at = new Date().toISOString()
      }
      return t
    }
    const { updateItem } = useSecureData()
    return await updateItem<Ticket>({ collection: COLLECTION_TICKETS, id, data: updates })
  }

  // Computed: gefilterte Liste
  const filteredTickets = computed<Ticket[]>(() => {
    let list = tickets.value
    const f = filter.value
    if (f.status?.length) list = list.filter((t) => f.status!.includes(t.status))
    if (f.priority?.length) list = list.filter((t) => f.priority!.includes(t.priority))
    if (f.channel?.length) list = list.filter((t) => f.channel!.includes(t.channel))
    if (f.customer_type?.length) list = list.filter((t) => f.customer_type!.includes(t.customer_type))
    if (f.assignee_id !== undefined) list = list.filter((t) => t.assignee_id === f.assignee_id)
    if (f.search) {
      const q = f.search.toLowerCase()
      list = list.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          (t.customer_name?.toLowerCase().includes(q) ?? false) ||
          (t.last_message_preview?.toLowerCase().includes(q) ?? false),
      )
    }
    if (f.tag) list = list.filter((t) => t.tags.includes(f.tag!))
    if (f.unread_only) list = list.filter((t) => (t.unread_count || 0) > 0)
    return list
  })

  // Counts pro Status für Tab-Badges
  const counts = computed(() => {
    const c: Record<string, number> = {
      all: tickets.value.length,
      neu: 0,
      offen: 0,
      wartend_kunde: 0,
      in_bearbeitung: 0,
      geloest: 0,
      geschlossen: 0,
      unread: 0,
      mine: 0,
    }
    const currentUserId = (useState<any>('auth.user').value?.id) || null
    for (const t of tickets.value) {
      c[t.status] = (c[t.status] || 0) + 1
      if ((t.unread_count || 0) > 0) c.unread++
      if (currentUserId && t.assignee_id === currentUserId) c.mine++
    }
    return c
  })

  return {
    tickets,
    filteredTickets,
    counts,
    loading,
    filter,
    fetchTickets,
    fetchTicket,
    fetchMessages,
    sendReply,
    updateTicket,
  }
}
