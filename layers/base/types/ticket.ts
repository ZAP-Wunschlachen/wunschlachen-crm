// Ticket-System Types (Phase 9)
// Schema: docs/TICKETS_SCHEMA.md

export type TicketStatus = 'neu' | 'offen' | 'wartend_kunde' | 'in_bearbeitung' | 'geloest' | 'geschlossen'

export const TICKET_STATUSES: { value: TicketStatus; label: string; color: string }[] = [
  { value: 'neu', label: 'Neu', color: '#3b82f6' },
  { value: 'offen', label: 'Offen', color: '#f59e0b' },
  { value: 'wartend_kunde', label: 'Wartet auf Kunde', color: '#a855f7' },
  { value: 'in_bearbeitung', label: 'In Bearbeitung', color: '#06b6d4' },
  { value: 'geloest', label: 'Gelöst', color: '#10b981' },
  { value: 'geschlossen', label: 'Geschlossen', color: '#6b7280' },
]

export type TicketPriority = 'niedrig' | 'mittel' | 'hoch' | 'dringend'

export const TICKET_PRIORITIES: { value: TicketPriority; label: string; color: string }[] = [
  { value: 'niedrig', label: 'Niedrig', color: '#94a3b8' },
  { value: 'mittel', label: 'Mittel', color: '#3b82f6' },
  { value: 'hoch', label: 'Hoch', color: '#f97316' },
  { value: 'dringend', label: 'Dringend', color: '#dc2626' },
]

export type TicketChannel = 'email' | 'sms' | 'whatsapp' | 'phone' | 'form' | 'chat'

export const TICKET_CHANNELS: { value: TicketChannel; label: string; icon: string }[] = [
  { value: 'email', label: 'E-Mail', icon: 'pi pi-envelope' },
  { value: 'sms', label: 'SMS', icon: 'pi pi-comment' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'pi pi-whatsapp' },
  { value: 'phone', label: 'Anruf', icon: 'pi pi-phone' },
  { value: 'form', label: 'Formular', icon: 'pi pi-list' },
  { value: 'chat', label: 'Chat', icon: 'pi pi-comments' },
]

export type TicketCustomerType = 'heimkunde' | 'patient' | 'unbekannt'

export type TicketDirection = 'inbound' | 'outbound'

export interface TicketUser {
  id: string
  first_name?: string
  last_name?: string
  email?: string
}

export interface Ticket {
  id: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  channel: TicketChannel
  customer_type: TicketCustomerType
  customer_id?: string | null
  customer_name?: string | null // applikationsseitig aufgelöst
  assignee_id?: string | null
  assignee?: TicketUser | null
  tags: string[]
  related_lead_id?: string | null
  first_response_at?: string | null
  resolved_at?: string | null
  sla_breach: boolean
  date_created: string
  date_updated: string
  // Computed/Joined
  message_count?: number
  last_message_preview?: string
  last_message_at?: string
  last_message_direction?: TicketDirection
  unread_count?: number
}

export interface TicketMessage {
  id: string
  ticket_id: string
  direction: TicketDirection
  channel: TicketChannel
  from_address?: string | null
  to_address?: string | null
  subject?: string | null
  body_html?: string | null
  body_text: string
  attachments: string[]
  sender_user_id?: string | null
  sender?: TicketUser | null
  external_message_id?: string | null
  read_at?: string | null
  date_created: string
}

export interface TicketMacro {
  id: string
  name: string
  description?: string | null
  channel: TicketChannel | 'any'
  applies_to_customer_type: TicketCustomerType | 'any'
  subject_template?: string | null
  body_template: string
  available_variables: string[]
  is_active: boolean
  date_created?: string
  date_updated?: string
}

export interface TicketFilter {
  status?: TicketStatus[]
  priority?: TicketPriority[]
  channel?: TicketChannel[]
  customer_type?: TicketCustomerType[]
  assignee_id?: string | null
  search?: string
  tag?: string
  unread_only?: boolean
}
