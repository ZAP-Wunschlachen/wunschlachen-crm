import { describe, it, expect } from 'vitest'
import { useWelcomeSequence } from './useWelcomeSequence'
import type { Lead } from '../types/crm'

const mkLead = (overrides: Partial<Lead> = {}): Lead => ({
  id: 'l-1',
  first_name: 'Maria',
  last_name: 'Schmidt',
  mail: 'maria@example.com',
  status: 'new',
  date_created: '2026-05-01T08:00:00.000Z',
  date_updated: '2026-05-01T08:00:00.000Z',
  GDPR_accepted_at: '2026-05-01T08:00:00.000Z',
  welcome_sequence_started_at: '2026-05-01T08:00:00.000Z',
  welcome_sequence_position: 0,
  ...overrides,
})

describe('useWelcomeSequence.shouldPauseFor', () => {
  const { shouldPauseFor } = useWelcomeSequence()

  it('pausiert wenn GDPR_accepted_at fehlt', () => {
    const lead = mkLead({ GDPR_accepted_at: undefined })
    expect(shouldPauseFor(lead)).toBe('no_gdpr_consent')
  })

  it('pausiert wenn Tag "unsubscribed" gesetzt', () => {
    const lead = mkLead({ Tags: ['unsubscribed'] })
    expect(shouldPauseFor(lead)).toBe('unsubscribed')
  })

  it('pausiert wenn lead.status weiter als contacted', () => {
    const lead = mkLead({ status: 'consultation_scheduled' })
    expect(shouldPauseFor(lead)).toBe('status_advanced')
  })

  it('läuft normal wenn status=new und GDPR ok', () => {
    expect(shouldPauseFor(mkLead())).toBeNull()
  })

  it('läuft normal wenn status=contacting', () => {
    expect(shouldPauseFor(mkLead({ status: 'contacting' }))).toBeNull()
  })

  it('läuft normal wenn status=contacted', () => {
    expect(shouldPauseFor(mkLead({ status: 'contacted' }))).toBeNull()
  })

  it('pausiert wenn status=lost', () => {
    expect(shouldPauseFor(mkLead({ status: 'lost' }))).toBe('lost')
  })
})

describe('useWelcomeSequence.getDueSlot', () => {
  const { getDueSlot } = useWelcomeSequence()
  // Sign-up am 2026-05-01T08:00:00Z, "now" wird jeweils explizit übergeben

  it('liefert Slot 1 sofort nach Sign-up wenn position=0', () => {
    const lead = mkLead({ welcome_sequence_position: 0 })
    const slot = getDueSlot(lead, new Date('2026-05-01T09:00:00.000Z'))
    expect(slot?.position).toBe(1)
  })

  it('liefert NULL wenn Slot 1 schon versandt und T+1 noch nicht erreicht', () => {
    const lead = mkLead({ welcome_sequence_position: 1 })
    const slot = getDueSlot(lead, new Date('2026-05-01T20:00:00.000Z'))
    expect(slot).toBeNull()
  })

  it('liefert Slot 2 wenn position=1 und T+1 erreicht', () => {
    const lead = mkLead({ welcome_sequence_position: 1 })
    const slot = getDueSlot(lead, new Date('2026-05-02T09:00:00.000Z'))
    expect(slot?.position).toBe(2)
  })

  it('liefert Slot 4 wenn position=3 und T+7 erreicht (überspringt nicht)', () => {
    const lead = mkLead({ welcome_sequence_position: 3 })
    const slot = getDueSlot(lead, new Date('2026-05-08T09:00:00.000Z'))
    expect(slot?.position).toBe(4)
  })

  it('liefert NULL wenn position=6 (Sequenz fertig)', () => {
    const lead = mkLead({ welcome_sequence_position: 6 })
    const slot = getDueSlot(lead, new Date('2026-06-01T09:00:00.000Z'))
    expect(slot).toBeNull()
  })

  it('liefert NULL wenn shouldPauseFor positiv (z.B. unsubscribed)', () => {
    const lead = mkLead({ welcome_sequence_position: 0, Tags: ['unsubscribed'] })
    const slot = getDueSlot(lead, new Date('2026-05-01T09:00:00.000Z'))
    expect(slot).toBeNull()
  })
})

describe('useWelcomeSequence.nextSlotForLead', () => {
  const { nextSlotForLead } = useWelcomeSequence()

  it('liefert Slot 1 für nicht-gestartete Sequenz', () => {
    const slot = nextSlotForLead(mkLead({ welcome_sequence_position: 0 }))
    expect(slot?.position).toBe(1)
  })

  it('liefert NULL nach Slot 6', () => {
    const slot = nextSlotForLead(mkLead({ welcome_sequence_position: 6 }))
    expect(slot).toBeNull()
  })
})
