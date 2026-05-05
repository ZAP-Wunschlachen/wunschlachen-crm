export type OrgType = 'pflegeheim' | 'zahnarztpraxis' | 'klinik'

export type ContractStatus = 'prospect' | 'active' | 'paused' | 'cancelled'

export interface Organization {
  id: string
  org_type: OrgType
  name: string
  address?: string
  city?: string
  zip?: string
  phone?: string
  email?: string
  website?: string
  contract_status?: ContractStatus
  contract_value?: number
  contract_start?: string
  contract_end?: string
  notes?: string
  latitude?: number
  longitude?: number
  date_created?: string
  date_updated?: string
}
