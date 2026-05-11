/**
 * useUserRole
 *
 * Determines access scopes from the Directus user.
 *
 * Two-tier role detection (in Reihenfolge):
 *   1. Directus-UUID-Lookup via DIRECTUS_ROLE_NAMES (preferred — Phase 5f: echte
 *      UUIDs eintragen, sobald Tony die vom Directus-Admin hat)
 *   2. Direkter String-Match falls Directus den Rollen-Namen statt UUID liefert
 *   3. Fallback-Heuristik: User ohne `nursing_home` = internes Personal
 */

// TODO Phase 5f: echte Directus-Rollen-UUIDs eintragen (auf Tonys Bestätigung)
// Map: Directus-Rollen-UUID → semantischer Rollen-Name
// Bis dann ist diese Map leer und wir fallen auf String-Match + Heuristik zurück.
const DIRECTUS_ROLE_NAMES: Record<string, string> = {
  // 'uuid-der-administrator-rolle': 'administrator',
  // 'uuid-der-sales-rolle':         'sales',
  // 'uuid-der-crm-manager-rolle':   'crm_manager',
  // 'uuid-der-pflege-manager-rolle': 'pflege_manager',
  // 'uuid-der-zahnarzt-rolle':      'zahnarzt',
}

const NAMED_INTERNAL_ROLES = ['administrator', 'sales', 'crm_manager', 'pflege_manager', 'zahnarzt']

const resolveRoleName = (rawRole: string | undefined): string => {
  if (!rawRole) return ''
  if (DIRECTUS_ROLE_NAMES[rawRole]) return DIRECTUS_ROLE_NAMES[rawRole]
  return rawRole
}

export const useUserRole = () => {
  const { user } = useAuth()

  const role = computed(() => resolveRoleName(user.value?.role))

  const isInternal = computed(() => {
    if (!user.value) return false
    if (NAMED_INTERNAL_ROLES.includes(role.value)) return true
    // Fallback-Heuristik: kein nursing_home zugewiesen = internes Personal
    return !user.value.nursing_home
  })

  const isCustomer = computed(
    () => !!user.value?.nursing_home && !NAMED_INTERNAL_ROLES.includes(role.value),
  )

  const hasCrmAccess = computed(
    () => isInternal.value || ['crm_manager', 'sales', 'administrator'].includes(role.value),
  )
  const hasPflegeheimeAccess = computed(
    () => isInternal.value || ['pflege_manager'].includes(role.value),
  )
  const hasPatientenAccess = computed(
    () => isInternal.value || ['zahnarzt'].includes(role.value),
  )
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
