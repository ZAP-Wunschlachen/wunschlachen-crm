// types/appointments.ts — Types for the appointments collection

export type AttendanceStatus = 'scheduled' | 'attended' | 'no_show' | 'cancelled'

export const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  'scheduled',
  'attended',
  'no_show',
  'cancelled',
]

export const ATTENDANCE_STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  scheduled:  { label: 'Geplant',    color: '#3b82f6', bgColor: '#eff6ff', icon: 'pi pi-clock' },
  attended:   { label: 'Erschienen', color: '#22c55e', bgColor: '#f0fdf4', icon: 'pi pi-check-circle' },
  no_show:    { label: 'Nicht erschienen', color: '#ef4444', bgColor: '#fef2f2', icon: 'pi pi-times-circle' },
  cancelled:  { label: 'Abgesagt',   color: '#6b7280', bgColor: '#f3f4f6', icon: 'pi pi-ban' },
}

export interface CalendarColumn {
  id: string
  name?: string
  calendar?: {
    id: string
    name?: string
  }
}

export interface Appointment {
  id: string
  start_date_time: string
  end_date_time: string
  lead_id?: string | null
  attendance_status?: AttendanceStatus | null
  calendar_column?: CalendarColumn | null
  // Directus system fields
  date_created?: string
  date_updated?: string
}
