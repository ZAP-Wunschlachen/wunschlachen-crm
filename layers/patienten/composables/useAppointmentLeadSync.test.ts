import { describe, it, expect } from 'vitest'
import { useAppointmentLeadSync, type AppointmentEvent } from './useAppointmentLeadSync'
import type { Lead, LeadStatus } from '../types/crm'

const mkLead = (status: LeadStatus = 'new'): Lead => ({
  id: 'l-1', first_name: 'A', last_name: 'B', mail: 'a@b.de',
  status, date_created: '2026-05-01T00:00:00Z', date_updated: '2026-05-01T00:00:00Z',
})

const mkApptInsert = (overrides: any = {}): AppointmentEvent => ({
  kind: 'INSERT',
  appointment: {
    id: 'a-1',
    start_date_time: '2026-06-01T10:00:00Z',
    arrival_date: null,
    treatment_finished_date: null,
    treatment: { name: 'Erstberatung Implantat', category: 'beratung' },
    ...overrides.appointment,
  },
  ...overrides,
})

describe('plannedAction', () => {
  const { plannedAction } = useAppointmentLeadSync()

  it('INSERT mit Beratung → consultation_scheduled', () => {
    const action = plannedAction(mkApptInsert(), mkLead('new'))
    expect(action?.type).toBe('set_status')
    expect(action?.toStatus).toBe('consultation_scheduled')
    expect(action?.sendMail).toBe('appointment_confirmation_consultation')
  })

  it('INSERT mit Behandlung → treatment_scheduled', () => {
    const evt = mkApptInsert({ appointment: { treatment: { name: 'Implantation', category: 'behandlung' } } })
    const action = plannedAction(evt, mkLead('hkp_signed'))
    expect(action?.toStatus).toBe('treatment_scheduled')
    expect(action?.sendMail).toBe('appointment_confirmation_treatment')
  })

  it('UPDATE arrival_date != null → consultation_done', () => {
    const evt: AppointmentEvent = {
      kind: 'UPDATE',
      appointment: {
        id: 'a-1', start_date_time: '2026-06-01T10:00:00Z',
        arrival_date: '2026-06-01T10:05:00Z', treatment_finished_date: null,
        treatment: { name: 'Beratung', category: 'beratung' },
      },
    }
    const action = plannedAction(evt, mkLead('consultation_scheduled'))
    expect(action?.toStatus).toBe('consultation_done')
    expect(action?.sendMail).toBeNull()
  })

  it('UPDATE treatment_finished_date → completed', () => {
    const evt: AppointmentEvent = {
      kind: 'UPDATE',
      appointment: {
        id: 'a-1', start_date_time: '2026-06-01T10:00:00Z',
        arrival_date: '2026-06-01T10:00:00Z', treatment_finished_date: '2026-06-01T12:00:00Z',
        treatment: { name: 'Implantation', category: 'behandlung' },
      },
    }
    const action = plannedAction(evt, mkLead('treatment_in_progress'))
    expect(action?.toStatus).toBe('completed')
  })

  it('UPDATE auf bereits abgeschlossenem Lead → null (idempotent)', () => {
    const evt: AppointmentEvent = {
      kind: 'UPDATE',
      appointment: {
        id: 'a-1', start_date_time: '2026-06-01T10:00:00Z',
        arrival_date: '2026-06-01T10:05:00Z', treatment_finished_date: null,
        treatment: { name: 'Beratung', category: 'beratung' },
      },
    }
    expect(plannedAction(evt, mkLead('consultation_done'))).toBeNull()
    expect(plannedAction(evt, mkLead('hkp_sent'))).toBeNull()
  })

  it('DELETE → activity-only, kein Status-Wechsel', () => {
    const evt: AppointmentEvent = { kind: 'DELETE', appointment: { id: 'a-1' } as any }
    const action = plannedAction(evt, mkLead('consultation_scheduled'))
    expect(action?.type).toBe('log_only')
    expect(action?.activityLabel).toContain('storniert')
  })

  it('UPDATE start_date_time only → activity log, kein Status', () => {
    const action = plannedAction(
      { kind: 'UPDATE', appointment: { id: 'a-1', start_date_time: '2026-06-15T10:00:00Z' } as any },
      mkLead('consultation_scheduled'),
    )
    expect(action?.type).toBe('log_only')
    expect(action?.activityLabel).toContain('verschoben')
  })
})
