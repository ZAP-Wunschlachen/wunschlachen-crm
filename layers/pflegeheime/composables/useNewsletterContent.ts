/**
 * useNewsletterContent Composable
 *
 * Manages newsletter content: default templates from data file,
 * user-customized versions in localStorage, and variable replacement.
 */

const STORAGE_KEY = 'crm_newsletter_content'

export interface NewsletterVariables {
  kontakt?: {
    vorname?: string
    nachname?: string
    position?: string
  }
  pflegeheim?: {
    name?: string
    ort?: string
  }
  praxis?: {
    name?: string
  }
}

const DEFAULT_VARIABLES: NewsletterVariables = {
  praxis: { name: 'Ihre Zahnarztpraxis' },
}

// Load customized content from localStorage
const loadCustomContent = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch { return {} }
}

const saveCustomContent = (data: Record<string, string>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { /* ignore */ }
}

export const useNewsletterContent = () => {
  const customContent = ref<Record<string, string>>(loadCustomContent())

  /**
   * Get the content for a topic (custom version if exists, otherwise default)
   */
  const getContent = (topicId: string): string => {
    if (customContent.value[topicId]) return customContent.value[topicId]
    // TODO: integrate with newsletterTopics data file
    return ''
  }

  /**
   * Save customized content for a topic
   */
  const saveContent = (topicId: string, content: string) => {
    customContent.value[topicId] = content
    saveCustomContent(customContent.value)
  }

  /**
   * Reset to default content
   */
  const resetContent = (topicId: string) => {
    delete customContent.value[topicId]
    saveCustomContent(customContent.value)
  }

  /**
   * Check if topic has custom content
   */
  const isCustomized = (topicId: string): boolean => {
    return !!customContent.value[topicId]
  }

  /**
   * Replace variables in content with actual values
   */
  const resolveVariables = (content: string, vars: NewsletterVariables): string => {
    const merged = {
      kontakt: { ...vars.kontakt },
      pflegeheim: { ...vars.pflegeheim },
      praxis: { ...DEFAULT_VARIABLES.praxis, ...vars.praxis },
    }

    return content
      .replace(/\{\{kontakt\.vorname\}\}/g, merged.kontakt?.vorname || 'Frau/Herr')
      .replace(/\{\{kontakt\.nachname\}\}/g, merged.kontakt?.nachname || '')
      .replace(/\{\{kontakt\.position\}\}/g, merged.kontakt?.position || '')
      .replace(/\{\{pflegeheim\.name\}\}/g, merged.pflegeheim?.name || 'Ihr Pflegeheim')
      .replace(/\{\{pflegeheim\.ort\}\}/g, merged.pflegeheim?.ort || '')
      .replace(/\{\{praxis\.name\}\}/g, merged.praxis?.name || 'Ihre Zahnarztpraxis')
  }

  /**
   * Build variables from lead data
   */
  const buildVariables = (
    contact?: NursingHomeContact | null,
    nursingHome?: NursingHome | null,
  ): NewsletterVariables => {
    return {
      kontakt: contact ? {
        vorname: contact.first_name || undefined,
        nachname: contact.last_name || undefined,
        position: contact.job_title || undefined,
      } : undefined,
      pflegeheim: nursingHome ? {
        name: nursingHome.name || undefined,
        ort: nursingHome.city || undefined,
      } : undefined,
      praxis: { name: 'Zahnarztpraxis Wunschlachen' },
    }
  }

  /**
   * Get preview with resolved variables
   */
  const getPreview = (
    topicId: string,
    contact?: NursingHomeContact | null,
    nursingHome?: NursingHome | null,
  ): string => {
    const content = getContent(topicId)
    const vars = buildVariables(contact, nursingHome)
    return resolveVariables(content, vars)
  }

  /**
   * Available variables for reference
   */
  const availableVariables = [
    { key: '{{kontakt.vorname}}', label: 'Vorname des Kontakts', example: 'Maria' },
    { key: '{{kontakt.nachname}}', label: 'Nachname des Kontakts', example: 'Mueller' },
    { key: '{{kontakt.position}}', label: 'Position/Titel', example: 'PDL' },
    { key: '{{pflegeheim.name}}', label: 'Name des Pflegeheims', example: 'Seniorenresidenz am Park' },
    { key: '{{pflegeheim.ort}}', label: 'Ort des Pflegeheims', example: 'Berlin' },
    { key: '{{praxis.name}}', label: 'Name der Praxis', example: 'Zahnarztpraxis Wunschlachen' },
  ]

  return {
    getContent,
    saveContent,
    resetContent,
    isCustomized,
    resolveVariables,
    buildVariables,
    getPreview,
    availableVariables,
  }
}
