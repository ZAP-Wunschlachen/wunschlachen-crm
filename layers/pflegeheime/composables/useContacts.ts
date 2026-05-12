/**
 * useContacts Composable
 *
 * LOCAL MODE: Uses localStorage for all contact data.
 * When ready for production, switch USE_LOCAL to false.
 */

const USE_LOCAL = true
const STORAGE_KEY = 'crm_contacts'

export interface ContactFilters {
  search?: string
}

const CONTACT_FIELDS = [
  'id',
  'nursing_home_id',
  'first_name',
  'last_name',
  'email',
  'phone',
  'mobile',
  'job_title',
  'is_primary',
]

const CONTACT_ALL_FIELDS = [
  ...CONTACT_FIELDS,
  'nursing_home_id.id',
  'nursing_home_id.name',
  'nursing_home_id.city',
]

// ─── Shared localStorage state ──────────────────────────────────────
const _allContacts = ref<NursingHomeContact[]>([])
let _loaded = false

const loadFromStorage = () => {
  if (_loaded) return
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) _allContacts.value = JSON.parse(stored)
  } catch { /* ignore */ }
  _loaded = true
}

const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_allContacts.value))
  } catch { /* ignore */ }
}

/**
 * Import contacts from parsed Excel data
 */
export const importContactsToLocal = (contacts: NursingHomeContact[]) => {
  loadFromStorage()
  _allContacts.value = contacts
  saveToStorage()
  _loaded = true
}

export const useContacts = () => {
  // Only initialize Directus API when not in local mode
  const secureData = USE_LOCAL ? null : useSecureData()
  const getItems = secureData?.getItems ?? (async () => [])
  const createItem = secureData?.createItem ?? (async () => null as any)
  const updateItem = secureData?.updateItem ?? (async () => null as any)
  const deleteItem = secureData?.deleteItem ?? (async () => null as any)
  const isLoading = secureData?.isLoading ?? ref(false)
  const error = secureData?.error ?? ref(null)

  const contacts = ref<NursingHomeContact[]>([])

  if (USE_LOCAL && import.meta.client) loadFromStorage()

  // ─── LOCAL implementations ──────────────────────────────────────

  const fetchContactsLocal = (nursingHomeId: string) => {
    return _allContacts.value
      .filter(c => {
        const nhId = typeof c.nursing_home_id === 'object' ? c.nursing_home_id?.id : c.nursing_home_id
        return nhId === nursingHomeId
      })
      .sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1
        if (!a.is_primary && b.is_primary) return 1
        return (a.last_name || '').localeCompare(b.last_name || '')
      })
  }

  const fetchAllContactsLocal = (filters: ContactFilters = {}, sort: string[] = ['last_name'], limit = 200) => {
    let result = [..._allContacts.value]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(c => {
        const name = [c.first_name, c.last_name].filter(Boolean).join(' ').toLowerCase()
        const email = c.email?.toLowerCase() || ''
        const nhName = typeof c.nursing_home_id === 'object' ? c.nursing_home_id?.name?.toLowerCase() || '' : ''
        return name.includes(q) || email.includes(q) || nhName.includes(q)
      })
    }

    result.sort((a, b) => (a.last_name || '').localeCompare(b.last_name || ''))
    result = result.slice(0, limit)
    contacts.value = result
    return result
  }

  const addContactLocal = (data: Partial<NursingHomeContact>) => {
    const newContact: NursingHomeContact = {
      id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      nursing_home_id: data.nursing_home_id || '',
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      email: data.email || '',
      phone: data.phone || '',
      mobile: data.mobile || '',
      job_title: data.job_title || '',
      is_primary: data.is_primary || false,
    }
    _allContacts.value.push(newContact)
    saveToStorage()
    return newContact
  }

  const editContactLocal = (id: string, data: Partial<NursingHomeContact>) => {
    const idx = _allContacts.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      _allContacts.value[idx] = { ..._allContacts.value[idx], ...data }
      saveToStorage()
    }
    return _allContacts.value[idx] || null
  }

  const removeContactLocal = (id: string) => {
    _allContacts.value = _allContacts.value.filter(c => c.id !== id)
    saveToStorage()
  }

  // ─── Public API ─────────────────────────────────────────────────

  const fetchContacts = async (nursingHomeId: string) => {
    if (USE_LOCAL) return fetchContactsLocal(nursingHomeId)

    return await getItems<NursingHomeContact>({
      collection: 'nursing_home_contacts',
      params: {
        fields: CONTACT_FIELDS,
        filter: { nursing_home_id: { _eq: nursingHomeId } },
        sort: ['-is_primary', 'last_name'],
      },
    })
  }

  const fetchPrimaryContact = async (nursingHomeId: string) => {
    if (USE_LOCAL) {
      const all = fetchContactsLocal(nursingHomeId)
      return all.find(c => c.is_primary) || all[0] || null
    }

    const contacts = await getItems<NursingHomeContact>({
      collection: 'nursing_home_contacts',
      params: {
        fields: CONTACT_FIELDS,
        filter: { nursing_home_id: { _eq: nursingHomeId }, is_primary: { _eq: true } },
        limit: 1,
      },
    })
    return contacts?.[0] || null
  }

  const fetchAllContacts = async (
    filters: ContactFilters = {},
    sort: string[] = ['last_name', 'first_name'],
    limit = 200
  ) => {
    if (USE_LOCAL) return fetchAllContactsLocal(filters, sort, limit)

    const result = await getItems<NursingHomeContact>({
      collection: 'nursing_home_contacts',
      params: {
        fields: CONTACT_ALL_FIELDS,
        search: filters.search || undefined,
        sort,
        limit,
      },
    })
    contacts.value = result
    return result
  }

  const addContact = async (data: Partial<NursingHomeContact>) => {
    if (USE_LOCAL) return addContactLocal(data)
    return await createItem<NursingHomeContact>({ collection: 'nursing_home_contacts', data })
  }

  const editContact = async (id: string, data: Partial<NursingHomeContact>) => {
    if (USE_LOCAL) return editContactLocal(id, data)
    return await updateItem<NursingHomeContact>({ collection: 'nursing_home_contacts', id, data })
  }

  const removeContact = async (id: string) => {
    if (USE_LOCAL) return removeContactLocal(id)
    return await deleteItem({ collection: 'nursing_home_contacts', id })
  }

  return {
    contacts,
    isLoading,
    error,
    fetchContacts,
    fetchPrimaryContact,
    fetchAllContacts,
    addContact,
    editContact,
    removeContact,
  }
}
