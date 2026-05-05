export type DealType =
  | 'pflegeheim_vertrag'
  | 'implant_case'
  | 'praxis_kooperation'

export type DealStage =
  | 'qualification'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost'

export interface Deal {
  id: string
  deal_type: DealType
  title: string
  value: number
  stage: DealStage
  probability?: number
  contact?: string
  organization?: string
  expected_close?: string
  actual_close?: string
  lost_reason?: string
  date_created?: string
  date_updated?: string
  user_created?: string
}
