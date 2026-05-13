import { describe, it, expect } from 'vitest'
import { useCallbackScheduler } from './useCallbackScheduler'
import type { Lead } from '../types/crm'

const mkLead = (overrides: Partial<Lead> = {}): Lead => ({
  id: 'l-1', first_name: 'A', last_name: 'B', mail: 'a@b.de',
  status: 'new', date_created: '2026-05-01T08:00:00Z', date_updated: '2026-05-01T08:00:00Z',
  ...overrides,
})

describe('useCallbackScheduler.classifySlot', () => {
  const { classifySlot } = useCallbackScheduler()

  it('morning für 08-11 Uhr', () => {
    expect(classifySlot(new Date('2026-05-01T09:00:00Z'))).toBe('morning')
    expect(classifySlot(new Date('2026-05-01T10:30:00Z'))).toBe('morning')
  })
  it('midday für 11-15 Uhr', () => {
    expect(classifySlot(new Date('2026-05-01T12:00:00Z'))).toBe('midday')
    expect(classifySlot(new Date('2026-05-01T14:30:00Z'))).toBe('midday')
  })
  it('evening für 15-20 Uhr', () => {
    expect(classifySlot(new Date('2026-05-01T16:00:00Z'))).toBe('evening')
    expect(classifySlot(new Date('2026-05-01T19:30:00Z'))).toBe('evening')
  })
  it('null außerhalb Geschäftszeiten', () => {
    expect(classifySlot(new Date('2026-05-01T05:00:00Z'))).toBeNull()
    expect(classifySlot(new Date('2026-05-01T23:00:00Z'))).toBeNull()
  })
})

describe('useCallbackScheduler.nextRetrySlot', () => {
  const { nextRetrySlot } = useCallbackScheduler()
  const now = new Date('2026-05-04T10:00:00Z') // Montag morgen

  it('Versuch 1 → +2h (anderer Slot)', () => {
    const lead = mkLead({ call_attempt_count: 1, last_call_attempt_at: now.toISOString() })
    const next = nextRetrySlot(lead, now)
    expect(next).not.toBeNull()
    const diffHours = (next!.getTime() - now.getTime()) / 3600000
    expect(diffHours).toBeGreaterThanOrEqual(2)
    expect(diffHours).toBeLessThan(5)
  })

  it('Versuch 2 → +1 Tag (anderer Wochentag)', () => {
    const lead = mkLead({ call_attempt_count: 2, last_call_attempt_at: now.toISOString() })
    const next = nextRetrySlot(lead, now)
    expect(next).not.toBeNull()
    const diffHours = (next!.getTime() - now.getTime()) / 3600000
    expect(diffHours).toBeGreaterThanOrEqual(20)
    expect(diffHours).toBeLessThan(30)
  })

  it('Versuch 3 → +7 Tage (Wiedervorlage nach Email/SMS)', () => {
    const lead = mkLead({ call_attempt_count: 3, last_call_attempt_at: now.toISOString() })
    const next = nextRetrySlot(lead, now)
    expect(next).not.toBeNull()
    const diffDays = (next!.getTime() - now.getTime()) / 86400000
    expect(diffDays).toBeGreaterThanOrEqual(7)
    expect(diffDays).toBeLessThan(8)
  })

  it('Versuch >3 → null (keine weiteren Versuche)', () => {
    const lead = mkLead({ call_attempt_count: 5, last_call_attempt_at: now.toISOString() })
    expect(nextRetrySlot(lead, now)).toBeNull()
  })

  it('Bei successful_call_window bevorzugt diesen Slot', () => {
    const lead = mkLead({
      call_attempt_count: 1,
      last_call_attempt_at: now.toISOString(),
      successful_call_window: 'evening',
    })
    const next = nextRetrySlot(lead, now)
    expect(next).not.toBeNull()
    const hour = next!.getUTCHours()
    expect(hour).toBeGreaterThanOrEqual(15)
    expect(hour).toBeLessThan(20)
  })
})

describe('useCallbackScheduler.shouldFailover', () => {
  const { shouldFailover } = useCallbackScheduler()

  it('true ab 3 fehlgeschlagenen Versuchen', () => {
    expect(shouldFailover({ call_attempt_count: 2 } as Lead)).toBe(false)
    expect(shouldFailover({ call_attempt_count: 3 } as Lead)).toBe(true)
    expect(shouldFailover({ call_attempt_count: 5 } as Lead)).toBe(true)
  })
})

describe('useCallbackScheduler.urgencyScore', () => {
  const { urgencyScore } = useCallbackScheduler()
  const now = new Date('2026-05-04T10:00:00Z')

  it('hoher Score für neuen, unbearbeiteten Lead', () => {
    const lead = mkLead({ status: 'new', date_created: now.toISOString() })
    expect(urgencyScore(lead, now)).toBeGreaterThan(80)
  })

  it('niedriger Score für mehrfach versuchten Lead', () => {
    const lead = mkLead({
      status: 'contacting',
      date_created: '2026-05-01T08:00:00Z',
      call_attempt_count: 3,
      last_call_attempt_at: '2026-05-04T09:00:00Z',
    })
    expect(urgencyScore(lead, now)).toBeLessThan(40)
  })

  it('Score 0 für lost/completed', () => {
    expect(urgencyScore(mkLead({ status: 'lost' }), now)).toBe(0)
    expect(urgencyScore(mkLead({ status: 'completed' }), now)).toBe(0)
  })

  it('Score 0 wenn next_call_slot_at in der Zukunft', () => {
    const lead = mkLead({
      status: 'new',
      next_call_slot_at: new Date(now.getTime() + 3600000).toISOString(),
    })
    expect(urgencyScore(lead, now)).toBe(0)
  })
})
