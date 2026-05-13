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

// Plan v9: Rolle → erlaubte Personas (für Sidebar/Tab-Visibility)
const MULTI_ACCESS_ROLES = ['administrator', 'crm_manager']    // sehen beide Personas
const CRM_ONLY_ROLES     = ['sales', 'pflege_manager']         // nur B2B-Heimkunden
const PATIENT_ONLY_ROLES = ['zahnarzt']                        // nur B2C-Patienten

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

  const hasCrmAccess = computed(() => {
    const r = role.value
    if (MULTI_ACCESS_ROLES.includes(r) || CRM_ONLY_ROLES.includes(r)) return true
    if (PATIENT_ONLY_ROLES.includes(r)) return false
    // Fallback (Dev-Bypass / unbekannte Rolle): interner User sieht alles
    return isInternal.value
  })

  const hasPatientenAccess = computed(() => {
    const r = role.value
    if (MULTI_ACCESS_ROLES.includes(r) || PATIENT_ONLY_ROLES.includes(r)) return true
    if (CRM_ONLY_ROLES.includes(r)) return false
    return isInternal.value
  })

  /** Sieht beide Personas → "Alle"-Tab nur dann anzeigen. */
  const hasMultiPersonaAccess = computed(
    () => hasCrmAccess.value && hasPatientenAccess.value,
  )

  /** Default-Persona bei Layout-Mount, wenn nur eine zugänglich ist. */
  const defaultPersona = computed<'all' | 'heimkunden' | 'patienten'>(() => {
    if (hasMultiPersonaAccess.value) return 'all'
    if (hasCrmAccess.value) return 'heimkunden'
    if (hasPatientenAccess.value) return 'patienten'
    return 'all'
  })

  const hasPflegeheimeAccess = computed(() => hasCrmAccess.value)
  const hasPraxenAccess = computed(() => isInternal.value)
  const hasCustomerAccess = computed(() => isCustomer.value || role.value === 'administrator')

  const defaultPath = computed(() => {
    if (hasCrmAccess.value) return '/dashboard'
    if (hasPatientenAccess.value) return '/dashboard'
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
    hasMultiPersonaAccess,
    hasPraxenAccess,
    hasCustomerAccess,
    defaultPersona,
    defaultPath,
  }
}
