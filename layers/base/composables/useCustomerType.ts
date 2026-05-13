/**
 * useCustomerType — persistierter Tab-State pro Persona-Filter
 *
 * Hält den aktuellen Customer-Type ('all' | 'heimkunden' | 'patienten')
 * in einem useState, damit Tab-Auswahl beim Page-Wechsel erhalten bleibt.
 * Default richtet sich nach `useUserRole.defaultPersona` — User mit nur einer
 * zugänglichen Persona starten direkt dort.
 */

import type { CustomerType } from '../components/CustomerTypeTabs.vue'

export const useCustomerType = () => {
  const { defaultPersona } = useUserRole()
  const customerType = useState<CustomerType>('app.customer-type', () => defaultPersona.value)

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
