export const useUserRole = () => {
  const { user } = useAuth()

  const role = computed(() => user.value?.role || '')

  const hasCrmAccess = computed(() =>
    ['administrator', 'sales', 'crm_manager'].includes(role.value)
  )
  const hasPflegeheimeAccess = computed(() =>
    ['administrator', 'sales', 'crm_manager', 'pflege_manager'].includes(role.value)
  )
  const hasPatientenAccess = computed(() =>
    ['administrator', 'sales', 'crm_manager', 'zahnarzt'].includes(role.value)
  )
  const hasPraxenAccess = computed(() =>
    ['administrator', 'sales', 'crm_manager'].includes(role.value)
  )
  const hasCustomerAccess = computed(() =>
    ['administrator', 'customer', 'pflege_manager'].includes(role.value)
  )

  const defaultPath = computed(() => {
    if (hasCrmAccess.value) return '/dashboard'
    if (hasCustomerAccess.value) return '/dash'
    return '/login'
  })

  return { role, hasCrmAccess, hasPflegeheimeAccess, hasPatientenAccess, hasPraxenAccess, hasCustomerAccess, defaultPath }
}
