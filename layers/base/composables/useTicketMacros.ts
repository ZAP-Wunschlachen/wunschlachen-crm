/**
 * useTicketMacros — Quick-Reply-Vorlagen für Tickets (Phase 9 T7)
 *
 * Mock-Mode bis Directus-Collection `ticket_macros` angelegt ist.
 */

import type { TicketMacro, TicketChannel, TicketCustomerType } from '../types/ticket'

const USE_MOCK_DATA = true
const COLLECTION_MACROS = 'ticket_macros'

const mockMacros: TicketMacro[] = [
  {
    id: 'mac-1',
    name: 'Erstkontakt Heimkunde',
    description: 'Höfliche Annahme einer Heim-Anfrage',
    channel: 'email',
    applies_to_customer_type: 'heimkunde',
    subject_template: 'AW: {{subject}}',
    body_template:
      'Sehr geehrte/r {{first_name}} {{last_name}},\n\nvielen Dank für Ihre Anfrage. Wir prüfen Ihr Anliegen und melden uns innerhalb der nächsten 24 Stunden mit einem konkreten Vorschlag bei Ihnen.\n\nMit freundlichen Grüßen\n{{sender_name}}\nWunschlachen GmbH',
    available_variables: ['first_name', 'last_name', 'subject', 'sender_name'],
    is_active: true,
  },
  {
    id: 'mac-2',
    name: 'Erstkontakt Patient',
    description: 'Antwort auf Patienten-Erstanfrage',
    channel: 'email',
    applies_to_customer_type: 'patient',
    subject_template: 'AW: {{subject}}',
    body_template:
      'Hallo {{first_name}},\n\nschön, dass Sie sich für eine Behandlung bei uns interessieren. Ich melde mich heute noch telefonisch bei Ihnen, um einen Termin abzustimmen.\n\nLiebe Grüße\n{{sender_name}}',
    available_variables: ['first_name', 'subject', 'sender_name'],
    is_active: true,
  },
  {
    id: 'mac-3',
    name: 'Termin-Bestätigung',
    description: 'Bestätigung eines Termins',
    channel: 'sms',
    applies_to_customer_type: 'any',
    body_template:
      'Hallo {{first_name}}, Ihr Termin ist bestätigt. Bitte bringen Sie Versichertenkarte und Vorbefunde mit. Antworten Sie mit STOP, um Erinnerungen zu deaktivieren.',
    available_variables: ['first_name'],
    is_active: true,
  },
  {
    id: 'mac-4',
    name: 'Rückruf-Zusage',
    description: 'Wir rufen heute zurück',
    channel: 'any',
    applies_to_customer_type: 'any',
    body_template:
      'Hallo {{first_name}}, vielen Dank für die Nachricht — wir rufen Sie heute zwischen 14 und 17 Uhr zurück.',
    available_variables: ['first_name'],
    is_active: true,
  },
  {
    id: 'mac-5',
    name: 'WhatsApp Willkommen',
    description: 'Erstantwort via WhatsApp',
    channel: 'whatsapp',
    applies_to_customer_type: 'patient',
    body_template:
      'Hi {{first_name}}! 👋 Vielen Dank für deine Nachricht. Wann passt es dir für ein kurzes Telefonat zur Beratung? Vormittags oder Nachmittags?',
    available_variables: ['first_name'],
    is_active: true,
  },
]

export const useTicketMacros = () => {
  const macros = useState<TicketMacro[]>('tickets.macros', () => [])

  const fetchMacros = async (
    filterCtx: { channel?: TicketChannel; customer_type?: TicketCustomerType } = {},
  ): Promise<TicketMacro[]> => {
    let source: TicketMacro[]
    if (USE_MOCK_DATA) {
      source = mockMacros.filter((m) => m.is_active)
    } else {
      const { getItems } = useSecureData()
      source = await getItems<TicketMacro>({
        collection: COLLECTION_MACROS,
        params: { filter: { is_active: { _eq: true } }, sort: ['name'], limit: 200 },
      })
    }

    const filtered = source.filter((m) => {
      if (filterCtx.channel && m.channel !== 'any' && m.channel !== filterCtx.channel) return false
      if (
        filterCtx.customer_type &&
        m.applies_to_customer_type !== 'any' &&
        m.applies_to_customer_type !== filterCtx.customer_type
      )
        return false
      return true
    })

    macros.value = filtered
    return filtered
  }

  return { macros, fetchMacros }
}
