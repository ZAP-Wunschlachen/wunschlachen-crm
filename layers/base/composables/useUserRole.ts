/**
 * useUserRole
 *
 * Determines access scopes from the Directus user.
 *
 * Directus returns `role` as a UUID, so a string match against
 * named roles ('administrator', 'sales', ...) only works once a
 * proper UUID-to-name mapping is in place. Until then we fall back
 * to the same heuristic used in the legacy CRM: a user without an
 * assigned `nursing_home` is considered internal staff and gets
 * full module access. Customers (with a `nursing_home`) get the
 * customer scope only.
 */

const NAMED_INTERNAL_ROLES = ['administrator', 'sales', 'crm_manager', 'pflege_manager', 'zahnarzt']

export const useUserRole = () => {
  const { user } = useAuth()

  const role = computed(() => user.value?.role || '')

  const isInternal = computed(() => {
    if (!user.value) return false
    if (NAMED_INTERNAL_ROLES.includes(role.value)) return true
    return !user.value.nursing_home
  })

  const isCustomer = computed(() => !!user.value?.nursing_home && !NAMED_INTERNAL_ROLES.includes(role.value))

  const hasCrmAccess = computed(() => isInternal.value || ['crm_manager', 'sales', 'administrator'].includes(role.value))
  const hasPflegeheimeAccess = computed(() => isInternal.value || ['pflege_manager'].includes(role.value))
  const hasPatientenAccess = computed(() => isInternal.value || ['zahnarzt'].includes(role.value))
  const hasPraxenAccess = computed(() => isInternal.value)
  const hasCustomerAccess = computed(() => isCustomer.value || role.value === 'administrator')

  const defaultPath = computed(() => {
    if (hasCrmAccess.value) return '/dashboard'
    if (hasCustomerAccess.value) return '/dash'
    return '/dashboard'
  })

  return {
    role,
    isInternal,
    isCustomer,
    hasCrmAccess,
    hasPflegeheimeAccess,
    hasPatientenAccess,
    hasPraxenAccess,
    hasCustomerAccess,
    defaultPath,
  }
}
