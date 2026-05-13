import { describe, it, expect } from 'vitest'
import { useAppointmentLeadMatch } from './useAppointmentLeadMatch'
import type { Lead } from '../types/crm'

const mkLead = (overrides: Partial<Lead> = {}): Lead => ({
  id: 'l-1', first_name: 'A', last_name: 'B', mail: 'a@b.de',
  status: 'new', date_created: '2026-05-01T00:00:00Z', date_updated: '2026-05-01T00:00:00Z',
  ...overrides,
})

describe('matchAppointmentToLead', () => {
  const { matchAppointmentToLead } = useAppointmentLeadMatch()

  it('matched per mail (primär für Pre-Visit-Leads)', () => {
    const leads = [mkLead({ id: 'l-1', mail: 'maria@example.de' })]
    const result = matchAppointmentToLead({ email: 'maria@example.de' }, leads)
    expect(result.lead?.id).toBe('l-1')
    expect(result.matched_by).toBe('mail')
  })

  it('matched per patient_number als sekundärer Pfad (Post-Visit-Leads)', () => {
    const leads = [mkLead({ id: 'l-2', patient_number: 'P-12345', mail: 'old-mail@x.de' })]
    const result = matchAppointmentToLead({ patient_number: 'P-12345', email: 'new-mail@x.de' }, leads)
    expect(result.lead?.id).toBe('l-2')
    expect(result.matched_by).toBe('patient_number')
  })

  it('mail-match ist case-insensitive', () => {
    const leads = [mkLead({ id: 'l-3', mail: 'Maria@Example.DE' })]
    const result = matchAppointmentToLead({ email: 'maria@example.de' }, leads)
    expect(result.lead?.id).toBe('l-3')
  })

  it('mail hat Vorrang vor patient_number — gleiches Match-Subjekt', () => {
    const leads = [
      mkLead({ id: 'l-a', mail: 'maria@example.de' }),
      mkLead({ id: 'l-b', patient_number: 'P-1' }),
    ]
    const result = matchAppointmentToLead({ patient_number: 'P-1', email: 'maria@example.de' }, leads)
    expect(result.lead?.id).toBe('l-a')
    expect(result.matched_by).toBe('mail')
  })

  it('backfill-Flag: matched per mail + appointment hat patient_number → backfill empfehlen', () => {
    const leads = [mkLead({ id: 'l-1', mail: 'maria@example.de' /* keine patient_number */ })]
    const result = matchAppointmentToLead({ email: 'maria@example.de', patient_number: 'P-NEW-42' }, leads)
    expect(result.lead?.id).toBe('l-1')
    expect(result.backfill_patient_number).toBe('P-NEW-42')
  })

  it('kein backfill wenn Lead bereits patient_number hat', () => {
    const leads = [mkLead({ id: 'l-1', mail: 'maria@example.de', patient_number: 'P-OLD-1' })]
    const result = matchAppointmentToLead({ email: 'maria@example.de', patient_number: 'P-NEW-42' }, leads)
    expect(result.backfill_patient_number).toBeUndefined()
  })

  it('returns null wenn weder mail noch patient_number matchen', () => {
    const leads = [mkLead({ id: 'l-1', mail: 'x@y.de' })]
    const result = matchAppointmentToLead({ email: 'a@b.de', patient_number: 'P-9' }, leads)
    expect(result.lead).toBeNull()
    expect(result.matched_by).toBe('none')
  })

  it('returns null wenn appointment.patient leer ist', () => {
    const leads = [mkLead({ id: 'l-1', mail: 'maria@example.de' })]
    expect(matchAppointmentToLead({}, leads).lead).toBeNull()
    expect(matchAppointmentToLead(null as any, leads).lead).toBeNull()
  })

  it('matched mail auch bei trim/whitespace', () => {
    const leads = [mkLead({ id: 'l-1', mail: 'maria@example.de' })]
    const result = matchAppointmentToLead({ email: '  maria@example.de  ' }, leads)
    expect(result.lead?.id).toBe('l-1')
  })
})
