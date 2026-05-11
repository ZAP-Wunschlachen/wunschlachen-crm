/**
 * useCustomerType — persistierter Tab-State pro Persona-Filter
 *
 * Hält den aktuellen Customer-Type ('all' | 'heimkunden' | 'patienten')
 * in einem useState, damit Tab-Auswahl beim Page-Wechsel erhalten bleibt.
 * Default 'all' für übergreifende Sicht.
 */

import type { CustomerType } from '../components/CustomerTypeTabs.vue'

export const useCustomerType = () => {
  const customerType = useState<CustomerType>('app.customer-type', () => 'all')

  const isAll = computed(() => customerType.value === 'all')
  const isHeimkunden = computed(() => customerType.value === 'heimkunden')
  const isPatienten = computed(() => customerType.value === 'patienten')

  return {
    customerType,
    isAll,
    isHeimkunden,
    isPatienten,
  }
}

export type { CustomerType }
