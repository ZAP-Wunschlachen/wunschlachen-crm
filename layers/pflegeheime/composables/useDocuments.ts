/**
 * useDocuments Composable
 *
 * LOCAL MODE: Uses localStorage for document metadata.
 * Files are stored as base64 data URLs locally.
 * When ready for production, switch USE_LOCAL to false.
 */

const USE_LOCAL = false
const STORAGE_KEY = 'nursing_home_lead_documents'

// Shared state
const _allDocuments = ref<CrmDocument[]>([])
let _loaded = false

const loadFromStorage = () => {
  if (_loaded) return
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) _allDocuments.value = JSON.parse(stored)
  } catch { /* ignore */ }
  _loaded = true
}

const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_allDocuments.value))
  } catch { /* ignore */ }
}

export const useDocuments = () => {
  const runtimeConfig = USE_LOCAL ? null : useRuntimeConfig()
  const baseURL = runtimeConfig?.public?.url || 'http://localhost:8080'
  const secureData = USE_LOCAL ? null : useSecureData()
  const getItems = secureData?.getItems ?? (async () => [])
  const updateItem = secureData?.updateItem ?? (async () => null as any)
  const isLoading = secureData?.isLoading ?? ref(false)
  const error = secureData?.error ?? ref(null)
  const authData = USE_LOCAL ? { refreshToken: async () => false, redirectToLogout: () => {} } : useAuth()
  const { refreshToken, redirectToLogout } = authData

  const documents = ref<CrmDocument[]>([])

  if (USE_LOCAL) loadFromStorage()

  // ─── LOCAL implementations ──────────────────────────────────────

  const fetchDocumentsLocal = (leadId: string) => {
    documents.value = _allDocuments.value
      .filter(d => d.nursing_home_lead_id === leadId)
      .sort((a, b) => (b.date_created || '').localeCompare(a.date_created || ''))
    return documents.value
  }

  const uploadDocumentLocal = async (
    leadId: string,
    file: File,
    data: { name: string; category: string; notes?: string }
  ) => {
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })

    const id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    const newDoc: CrmDocument = {
      id,
      nursing_home_lead_id: leadId,
      file_id: {
        id,
        filename_download: file.name,
        type: file.type,
        filesize: file.size,
      },
      category: data.category as DocumentCategory,
      name: data.name,
      notes: data.notes || null,
      date_created: new Date().toISOString(),
    }

    _allDocuments.value.push(newDoc)

    try {
      localStorage.setItem(`crm_doc_file_${id}`, dataUrl)
    } catch { /* storage full */ }

    saveToStorage()
    documents.value = [...documents.value, newDoc]
    return newDoc
  }

  const removeDocumentLocal = (docId: string) => {
    _allDocuments.value = _allDocuments.value.filter(d => d.id !== docId)
    documents.value = documents.value.filter(d => d.id !== docId)
    try { localStorage.removeItem(`crm_doc_file_${docId}`) } catch {}
    saveToStorage()
  }

  const getFileUrlLocal = (fileId: string) => {
    try {
      return localStorage.getItem(`crm_doc_file_${fileId}`) || '#'
    } catch {
      return '#'
    }
  }

  // ─── Directus implementations ─────────────────────────────────

  const getCrmFolderId = async (): Promise<string | null> => {
    try {
      const folders = await getItems<{ id: string; name: string }>({
        collection: 'directus_folders',
        params: { filter: { name: { _eq: 'CRM Dokumente' } }, limit: 1 },
      })
      if (folders.length > 0) return folders[0].id

      let response = await fetch(`${baseURL}/secure-data/items/directus_folders`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'CRM Dokumente' }),
      })
      if (response.status === 401) {
        const refreshed = await refreshToken()
        if (refreshed) {
          response = await fetch(`${baseURL}/secure-data/items/directus_folders`, {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'CRM Dokumente' }),
          })
        } else { redirectToLogout(); throw new Error('Session expired') }
      }
      if (!response.ok) return null
      const result = await response.json()
      return result.data?.id || null
    } catch { return null }
  }

  // ─── Public API ─────────────────────────────────────────────────

  const fetchDocuments = async (leadId: string) => {
    if (USE_LOCAL) return fetchDocumentsLocal(leadId)

    try {
      const result = await getItems<CrmDocument>({
        collection: 'nursing_home_lead_documents',
        params: {
          filter: { nursing_home_lead_id: { _eq: leadId } },
          fields: ['id', 'nursing_home_lead_id', 'file_id.id', 'file_id.filename_download', 'file_id.type', 'file_id.filesize', 'category', 'name', 'notes', 'date_created', 'user_created.first_name', 'user_created.last_name'],
          sort: ['-date_created'],
          limit: -1,
        },
      })
      documents.value = result || []
      return documents.value
    } catch { documents.value = []; return [] }
  }

  const uploadDocument = async (
    leadId: string,
    file: File,
    data: { name: string; category: string; notes?: string }
  ) => {
    if (USE_LOCAL) return await uploadDocumentLocal(leadId, file, data)

    const folderId = await getCrmFolderId()
    const formData = new FormData()
    formData.append('file', file)
    if (folderId) formData.append('folder', folderId)

    let response = await fetch(`${baseURL}/secure-data/files`, {
      method: 'POST', credentials: 'include', body: formData,
    })
    if (response.status === 401) {
      const refreshed = await refreshToken()
      if (refreshed) {
        response = await fetch(`${baseURL}/secure-data/files`, {
          method: 'POST', credentials: 'include', body: formData,
        })
      } else { redirectToLogout(); throw new Error('Session expired') }
    }
    if (!response.ok) throw new Error('File upload failed')
    const fileResult = await response.json()
    const fileData = fileResult.data
    if (!fileData?.id) throw new Error('No file ID returned')

    const createItem = secureData!.createItem
    const newDoc = await createItem<any>({
      collection: 'nursing_home_lead_documents',
      data: {
        nursing_home_lead_id: leadId,
        file_id: fileData.id,
        category: data.category,
        name: data.name,
        notes: data.notes || null,
      },
    })

    await fetchDocuments(leadId)
    return newDoc
  }

  const removeDocument = async (docId: string, leadId?: string) => {
    if (USE_LOCAL) return removeDocumentLocal(docId)

    const deleteItem = secureData!.deleteItem
    await deleteItem({ collection: 'nursing_home_lead_documents', id: docId })
    documents.value = documents.value.filter(d => d.id !== docId)
  }

  const getFileUrl = (fileId: string) => {
    if (USE_LOCAL) return getFileUrlLocal(fileId)
    return `${baseURL}/assets/${fileId}`
  }

  return {
    documents,
    isLoading,
    error,
    fetchDocuments,
    uploadDocument,
    removeDocument,
    getFileUrl,
  }
}
