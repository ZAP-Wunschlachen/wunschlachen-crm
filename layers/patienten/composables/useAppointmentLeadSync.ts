/**
 * useAppointmentLeadSync — Pure-Logic Event-Mapping (Plan v9 Modul C).
 *
 * Input: ein Appointment-Event vom WebSocket (oder vom Cron Resync) + der
 * aktuelle Lead.
 * Output: PlannedAction (set_status / log_only / null) — der Caller (Server
 * oder Plugin) führt sie tatsächlich aus.
 */

import type { Lead, LeadStatus } from '~/types/crm'

export interface AppointmentLite {
  id: string
  start_date_time?: string | null
  arrival_date?: string | null
  treatment_finished_date?: string | null
  treatment?: { name?: string; category?: string }
}

export type AppointmentEvent =
  | { kind: 'INSERT'; appointment: AppointmentLite }
  | { kind: 'UPDATE'; appointment: AppointmentLite }
  | { kind: 'DELETE'; appointment: AppointmentLite }

export interface PlannedAction {
  type: 'set_status' | 'log_only'
  toStatus?: LeadStatus
  sendMail?: 'appointment_confirmation_consultation' | 'appointment_confirmation_treatment' | null
  activityLabel: string
  appointmentId: string
}

const isBeratung = (a: AppointmentLite): boolean => {
  const cat = (a.treatment?.category || '').toLowerCase()
  const name = (a.treatment?.name || '').toLowerCase()
  return cat === 'beratung' || /beratung|consultation/.test(name)
}

const isBehandlung = (a: AppointmentLite): boolean => {
  const cat = (a.treatment?.category || '').toLowerCase()
  const name = (a.treatment?.name || '').toLowerCase()
  return cat === 'behandlung' || /implantation|behandlung|operation/.test(name)
}

export const useAppointmentLeadSync = () => {
  const plannedAction = (event: AppointmentEvent, lead: Lead): PlannedAction | null => {
    const appt = event.appointment

    if (event.kind === 'DELETE') {
      return {
        type: 'log_only',
        activityLabel: `Termin ${appt.id} storniert`,
        appointmentId: appt.id,
      }
    }

    if (event.kind === 'INSERT') {
      if (isBeratung(appt)) {
        return {
          type: 'set_status',
          toStatus: 'consultation_scheduled',
          sendMail: 'appointment_confirmation_consultation',
          activityLabel: `Beratungstermin gebucht: ${appt.start_date_time}`,
          appointmentId: appt.id,
        }
      }
      if (isBehandlung(appt)) {
        return {
          type: 'set_status',
          toStatus: 'treatment_scheduled',
          sendMail: 'appointment_confirmation_treatment',
          activityLabel: `Behandlungstermin gebucht: ${appt.start_date_time}`,
          appointmentId: appt.id,
        }
      }
      return null
    }

    // UPDATE
    if (appt.treatment_finished_date) {
      if (lead.status === 'completed') return null
      return {
        type: 'set_status',
        toStatus: 'completed',
        sendMail: null,
        activityLabel: `Behandlung abgeschlossen: ${appt.treatment_finished_date}`,
        appointmentId: appt.id,
      }
    }

    if (appt.arrival_date) {
      if (lead.status === 'consultation_scheduled') {
        return {
          type: 'set_status',
          toStatus: 'consultation_done',
          sendMail: null,
          activityLabel: `Patient erschienen (Beratung): ${appt.arrival_date}`,
          appointmentId: appt.id,
        }
      }
      if (lead.status === 'treatment_scheduled') {
        return {
          type: 'set_status',
          toStatus: 'treatment_in_progress',
          sendMail: null,
          activityLabel: `Patient erschienen (Behandlung): ${appt.arrival_date}`,
          appointmentId: appt.id,
        }
      }
      return null
    }

    if (appt.start_date_time) {
      return {
        type: 'log_only',
        activityLabel: `Termin verschoben auf ${appt.start_date_time}`,
        appointmentId: appt.id,
      }
    }

    return null
  }

  return { plannedAction }
}
