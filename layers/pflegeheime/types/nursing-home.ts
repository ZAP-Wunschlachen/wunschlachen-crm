export interface NursingHome {
  id: string
  name: string
  Street?: string
  number?: string
  zip?: string
  city?: string
  fone?: string
  email?: string
  website?: string
  total_capacity?: number
  distance_from_dental_office?: number
  coordinates_lat?: number
  coordinates_lon?: number
  notes?: string
  status?: string
  cooperation_number?: string
  billing_code_trip_fee?: string
  quarter_rule?: string
  trip?: string
  users?: string[]
  notification_emails?: string
  fax_numbers?: string
  extraction_notice_days?: number
  date_created?: string
  date_updated?: string
}

export interface NursingHomeListOptions {
  search?: string
  limit?: number
  offset?: number
  sort?: string
}
