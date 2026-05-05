export * from './contact'
export * from './organization'
export * from './deal'
export * from './activity'

export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  role: string
  nursing_home?: string
  [key: string]: any
}

export interface PaginatedResponse<T> {
  data: T[]
  meta?: {
    total_count?: number
    filter_count?: number
  }
}
