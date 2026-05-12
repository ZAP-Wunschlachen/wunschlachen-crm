// composables/useAppointments.ts — CRUD for Directus appointments collection

import type { Appointment, AttendanceStatus } from '~/types/appointments'

const COLLECTION = 'appointments'

const USE_MOCK_DATA = true
const MOCK_KEY = 'patient-crm-mock-appointments'

const readMock = (): Appointment[] => {
  if (typeof localStorage === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(MOCK_KEY) || '[]')
  } catch {
    return []
  }
}

const APPOINTMENT_FIELDS = [
  'id',
  'start_date_time',
  'end_date_time',
  'lead_id',
  'attendance_status',
  'calendar_column.id',
  'calendar_column.name',
  'calendar_column.calendar.id',
  'calendar_column.calendar.name',
  'date_created',
  'date_updated',
]

export interface AppointmentFilters {
  attendance_status?: AttendanceStatus | null
  calendar_id?: string | null
}

export const useAppointments = () => {
  const { getItems, updateItem, createItem } = useSecureData()

  const appointments = ref<Appointment[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const buildFilter = (
    dateRange?: { start: string; end: string },
    filters?: AppointmentFilters,
  ): Record<string, any> | undefined => {
    const filter: Record<string, any> = {}

    if (dateRange) {
      filter.start_date_time = {
        _gte: dateRange.start,
        _lte: dateRange.end,
      }
    }

    if (filters?.attendance_status) {
      filter.attendance_status = { _eq: filters.attendance_status }
    }

    if (filters?.calendar_id) {
      filter.calendar_column = {
        calendar: { _eq: filters.calendar_id },
      }
    }

    return Object.keys(filter).length > 0 ? filter : undefined
  }

  /**
   * Fetch appointments for a date range, optionally filtered
   */
  const fetchAppointments = async (
    dateRange: { start: string; end: string },
    filters?: AppointmentFilters,
  ) => {
    isLoading.value = true
    error.value = null

    if (USE_MOCK_DATA) {
      let mock = readMock()
      const rangeStart = new Date(dateRange.start).getTime()
      const rangeEnd = new Date(dateRange.end).getTime()
      mock = mock.filter((a) => {
        const t = new Date(a.start_date_time).getTime()
        return t >= rangeStart && t <= rangeEnd
      })
      if (filters?.attendance_status) {
        mock = mock.filter((a) => a.attendance_status === filters.attendance_status)
      }
      appointments.value = mock
      isLoading.value = false
      return mock
    }

    try {
      const result = await getItems<Appointment>({
        collection: COLLECTION,
        params: {
          fields: APPOINTMENT_FIELDS,
          filter: buildFilter(dateRange, filters),
          sort: ['start_date_time'],
          limit: -1,
        },
      })
      appointments.value = result
      return result
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch all appointments for a specific lead
   */
  const fetchLeadAppointments = async (leadId: string) => {
    isLoading.value = true
    error.value = null

    if (USE_MOCK_DATA) {
      const mock = readMock().filter((a: any) => a.lead_id === leadId)
      isLoading.value = false
      return mock
    }

    try {
      const result = await getItems<Appointment>({
        collection: COLLECTION,
        params: {
          fields: APPOINTMENT_FIELDS,
          filter: { lead_id: { _eq: leadId } },
          sort: ['-start_date_time'],
          limit: -1,
        },
      })
      return result
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update the attendance status of an appointment
   */
  const updateAttendance = async (appointmentId: string, status: AttendanceStatus) => {
    try {
      const result = await updateItem<Appointment>({
        collection: COLLECTION,
        id: appointmentId,
        data: { attendance_status: status },
      })
      // Update in local list
      const idx = appointments.value.findIndex(a => a.id === appointmentId)
      if (idx !== -1) appointments.value[idx] = { ...appointments.value[idx], attendance_status: status }
      return result
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  /**
   * Create a new appointment
   */
  const createAppointment = async (data: Partial<Appointment>) => {
    try {
      return await createItem<Appointment>({
        collection: COLLECTION,
        data,
      })
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  /**
   * Count no-show appointments for a lead
   */
  const getNoShowCount = async (leadId: string): Promise<number> => {
    try {
      const result = await getItems<Appointment>({
        collection: COLLECTION,
        params: {
          fields: ['id'],
          filter: {
            lead_id: { _eq: leadId },
            attendance_status: { _eq: 'no_show' },
          },
          limit: -1,
        },
      })
      return result.length
    } catch {
      return 0
    }
  }

  return {
    appointments,
    isLoading,
    error,
    fetchAppointments,
    fetchLeadAppointments,
    updateAttendance,
    createAppointment,
    getNoShowCount,
  }
}
