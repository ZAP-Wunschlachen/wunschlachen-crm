// composables/useEmailTemplates.ts

import type { EmailTemplate, EmailTemplateCategory } from '~/types/email'
import templateData from '~/data/email-templates.json'

const STORAGE_KEY = 'praxis-crm-email-templates'
const DEFAULT_TEMPLATES: EmailTemplate[] = templateData as EmailTemplate[]

const loadTemplates = (): EmailTemplate[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const custom = JSON.parse(stored) as EmailTemplate[]
      const customIds = new Set(custom.map(t => t.id))
      return [
        ...DEFAULT_TEMPLATES.filter(t => !customIds.has(t.id)),
        ...custom,
      ]
    }
  } catch { /* ignore */ }
  return [...DEFAULT_TEMPLATES]
}

const saveCustomTemplates = (all: EmailTemplate[]) => {
  const defaultMap = new Map(DEFAULT_TEMPLATES.map(t => [t.id, t]))
  const custom = all.filter(t => {
    const def = defaultMap.get(t.id)
    return !def || JSON.stringify(def) !== JSON.stringify(t)
  })
  try {
    if (custom.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(custom))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch { /* ignore */ }
}

const _allTemplates = ref<EmailTemplate[]>(loadTemplates())

export const useEmailTemplates = () => {
  const templates = ref<EmailTemplate[]>([])

  const fetchTemplates = async (category?: EmailTemplateCategory | null) => {
    let result = _allTemplates.value.filter(t => t.is_active)
    if (category) result = result.filter(t => t.category === category)
    templates.value = result
    return result
  }

  const fetchTemplate = async (id: string) => {
    return _allTemplates.value.find(t => t.id === id) || null
  }

  const createTemplate = async (data: Partial<EmailTemplate>) => {
    const newTemplate: EmailTemplate = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: data.name || '',
      subject: data.subject || '',
      body_html: data.body_html || '',
      category: data.category || 'allgemein',
      variables: data.variables || ['patient.first_name', 'patient.last_name', 'location.name'],
      is_active: data.is_active ?? true,
    }
    _allTemplates.value.push(newTemplate)
    saveCustomTemplates(_allTemplates.value)
    return newTemplate
  }

  const updateTemplate = async (id: string, data: Partial<EmailTemplate>) => {
    const idx = _allTemplates.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      _allTemplates.value[idx] = { ..._allTemplates.value[idx], ...data }
      saveCustomTemplates(_allTemplates.value)
    }
  }

  const deleteTemplate = async (id: string) => {
    _allTemplates.value = _allTemplates.value.filter(t => t.id !== id)
    saveCustomTemplates(_allTemplates.value)
  }

  const resolveTemplate = (
    template: string,
    context: Record<string, Record<string, any>>
  ): string => {
    return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, path: string) => {
      const parts = path.split('.')
      if (parts.length === 2) {
        const [obj, field] = parts
        return context[obj]?.[field]?.toString() || ''
      }
      return ''
    })
  }

  return {
    templates,
    fetchTemplates,
    fetchTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    resolveTemplate,
  }
}
