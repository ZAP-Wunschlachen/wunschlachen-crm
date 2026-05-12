<template>
  <div class="max-w-3xl">
    <div class="mb-4">
      <h2 class="text-[14px] font-semibold text-gray-800">Excel-Import</h2>
      <p class="text-[11px] text-gray-400 mt-0.5">Sales Pipeline aus Excel importieren (lokal)</p>
    </div>

    <div class="space-y-4">
      <!-- Upload area -->
      <div
        class="bg-white rounded-lg border-2 border-dashed border-gray-200 p-8 text-center hover:border-[#172774]/30 transition-colors cursor-pointer"
        @click="triggerFileInput"
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop.prevent="handleDrop"
        :class="{ 'border-[#172774]/50 bg-[#172774]/[0.02]': dragOver }"
      >
        <i class="pi pi-upload text-[24px] text-gray-300 mb-2" />
        <p class="text-[13px] text-gray-600 font-medium">Excel-Datei hierher ziehen</p>
        <p class="text-[11px] text-gray-400 mt-1">oder klicken um auszuwählen (.xlsx)</p>
        <input
          ref="fileInput"
          type="file"
          accept=".xlsx,.xls"
          class="hidden"
          @change="handleFileSelect"
        />
      </div>

      <!-- Parsing status -->
      <div v-if="parsing" class="flex items-center gap-2 px-4 py-3 bg-[#172774]/5 border border-[#172774]/20 rounded-lg">
        <i class="pi pi-spin pi-spinner text-[14px] text-[#172774]" />
        <span class="text-[12px] text-[#172774] font-medium">Datei wird verarbeitet...</span>
      </div>

      <!-- Preview -->
      <div v-if="parsed && !parsing" class="space-y-4">
        <!-- Summary -->
        <div class="bg-white rounded-lg border border-gray-200/80 p-4">
          <h3 class="text-[13px] font-semibold text-gray-800 mb-3">Vorschau</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <p class="text-[20px] font-bold text-gray-800 tabular-nums">{{ parsedLeads.length }}</p>
              <p class="text-[10px] text-gray-400 mt-0.5">Leads</p>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <p class="text-[20px] font-bold text-gray-800 tabular-nums">{{ parsedContacts.length }}</p>
              <p class="text-[10px] text-gray-400 mt-0.5">Kontakte</p>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <p class="text-[20px] font-bold text-gray-800 tabular-nums">{{ parsedActivities.length }}</p>
              <p class="text-[10px] text-gray-400 mt-0.5">Notizen</p>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <p class="text-[20px] font-bold text-gray-800 tabular-nums">{{ totalBeds }}</p>
              <p class="text-[10px] text-gray-400 mt-0.5">Betten gesamt</p>
            </div>
          </div>
        </div>

        <!-- Stage breakdown -->
        <div class="bg-white rounded-lg border border-gray-200/80 p-4">
          <h3 class="text-[12px] font-semibold text-gray-700 mb-2">Stages</h3>
          <div class="space-y-1">
            <div v-for="s in stageSummary" :key="s.stage" class="flex items-center justify-between text-[11px]">
              <span class="text-gray-600">{{ s.stage }}</span>
              <span class="text-gray-800 font-medium tabular-nums">{{ s.count }}</span>
            </div>
          </div>
        </div>

        <!-- Sample rows -->
        <div class="bg-white rounded-lg border border-gray-200/80 p-4">
          <h3 class="text-[12px] font-semibold text-gray-700 mb-2">Erste 10 Einträge</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-[11px]">
              <thead>
                <tr class="border-b border-gray-100">
                  <th class="text-left px-2 py-1 text-[10px] text-gray-400 font-semibold">Name</th>
                  <th class="text-left px-2 py-1 text-[10px] text-gray-400 font-semibold">Ort</th>
                  <th class="text-left px-2 py-1 text-[10px] text-gray-400 font-semibold">Stage</th>
                  <th class="text-left px-2 py-1 text-[10px] text-gray-400 font-semibold">Prio</th>
                  <th class="text-left px-2 py-1 text-[10px] text-gray-400 font-semibold">Betten</th>
                  <th class="text-left px-2 py-1 text-[10px] text-gray-400 font-semibold">Kontakt</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="lead in parsedLeads.slice(0, 10)" :key="lead.id" class="border-b border-gray-50">
                  <td class="px-2 py-1.5 font-medium text-gray-800">
                    {{ typeof lead.nursing_home_id === 'object' ? lead.nursing_home_id.name : '–' }}
                  </td>
                  <td class="px-2 py-1.5 text-gray-500">
                    {{ typeof lead.nursing_home_id === 'object' ? [lead.nursing_home_id.zip, lead.nursing_home_id.city].filter(Boolean).join(' ') : '–' }}
                  </td>
                  <td class="px-2 py-1.5"><CrmLeadStatusBadge :stage="lead.opportunity_stage" /></td>
                  <td class="px-2 py-1.5"><CrmPriorityBadge :priority="lead.priority" /></td>
                  <td class="px-2 py-1.5 text-gray-500 tabular-nums">
                    {{ typeof lead.nursing_home_id === 'object' ? lead.nursing_home_id.total_capacity || '–' : '–' }}
                  </td>
                  <td class="px-2 py-1.5 text-gray-500">
                    {{ getContactForLead(lead)?.first_name }} {{ getContactForLead(lead)?.last_name }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Import actions -->
        <div class="flex items-center gap-3">
          <button
            @click="doImport"
            :disabled="importing"
            class="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium text-white bg-[#172774] rounded-md hover:bg-[#3d4a8e] transition-colors disabled:opacity-50"
          >
            <i v-if="importing" class="pi pi-spin pi-spinner text-[11px]" />
            <i v-else class="pi pi-download text-[11px]" />
            {{ parsedLeads.length }} Leads importieren
          </button>
          <button
            @click="reset"
            class="px-4 py-2 text-[12px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>

      <!-- Success -->
      <div v-if="imported" class="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
        <i class="pi pi-check-circle text-[14px] text-green-600" />
        <span class="text-[12px] text-green-700 font-medium">
          {{ importedCount }} Leads, {{ importedContactCount }} Kontakte und {{ parsedActivities.length }} Notizen importiert!
        </span>
        <NuxtLink to="/crm/leads" class="ml-auto text-[11px] text-[#172774] hover:text-[#3d4a8e] font-medium">
          Leads ansehen →
        </NuxtLink>
      </div>

      <!-- Existing data warning -->
      <div v-if="existingLeadCount > 0 && !imported" class="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
        <i class="pi pi-exclamation-triangle text-[14px] text-amber-600 mt-0.5" />
        <div>
          <p class="text-[12px] font-medium text-amber-800">Bestehende Daten</p>
          <p class="text-[11px] text-amber-700 mt-0.5">
            Es sind bereits {{ existingLeadCount }} Leads lokal gespeichert. Ein Import ersetzt alle bestehenden Daten.
          </p>
        </div>
      </div>

      <!-- Info -->
      <div class="bg-white rounded-lg border border-gray-200/80 p-4">
        <h3 class="text-[12px] font-semibold text-gray-800 mb-2">Unterstützte Formate</h3>
        <p class="text-[11px] text-gray-500 leading-relaxed">
          Die Import-Funktion erkennt automatisch die Spalten der Wunschlachen Sales Pipeline Excel-Datei.
          Unterstützt werden die Sheets <strong>Opportunities</strong> (Haupt-Pipeline) und
          <strong>Newsletter List</strong> (zusätzliche Kontakte).
        </p>
        <p class="text-[11px] text-gray-400 mt-2">
          Daten werden lokal im Browser gespeichert. Wenn die Directus-Anbindung steht, können die Daten synchronisiert werden.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as XLSX from 'xlsx'
import { importLeadsToLocal, getLocalLeads } from '~/composables/usePflegeheimLeads'
import { importContactsToLocal } from '~/composables/useContacts'
import { importActivitiesToLocal } from '~/composables/useActivities'
import type { NursingHomeLead, NursingHome, NursingHomeContact, CrmActivity, OpportunityStage, Priority } from '~/types/crm'

definePageMeta({ layout: 'crm', middleware: 'auth' })

const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const parsing = ref(false)
const parsed = ref(false)
const importing = ref(false)
const imported = ref(false)
const importedCount = ref(0)
const importedContactCount = ref(0)

const parsedLeads = ref<NursingHomeLead[]>([])
const parsedContacts = ref<NursingHomeContact[]>([])
const parsedActivities = ref<CrmActivity[]>([])

const existingLeadCount = computed(() => {
  try { return getLocalLeads().length } catch { return 0 }
})

const totalBeds = computed(() =>
  parsedLeads.value.reduce((sum, l) => {
    const nh = typeof l.nursing_home_id === 'object' ? l.nursing_home_id : null
    return sum + (nh?.total_capacity || 0)
  }, 0)
)

const stageSummary = computed(() => {
  const counts: Record<string, number> = {}
  for (const l of parsedLeads.value) {
    counts[l.opportunity_stage] = (counts[l.opportunity_stage] || 0) + 1
  }
  return Object.entries(counts)
    .map(([stage, count]) => ({ stage, count }))
    .sort((a, b) => b.count - a.count)
})

const getContactForLead = (lead: NursingHomeLead) => {
  const nhId = typeof lead.nursing_home_id === 'object' ? lead.nursing_home_id.id : lead.nursing_home_id
  return parsedContacts.value.find(c => {
    const cNhId = typeof c.nursing_home_id === 'object' ? c.nursing_home_id.id : c.nursing_home_id
    return cNhId === nhId
  })
}

const triggerFileInput = () => fileInput.value?.click()

const handleFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) parseFile(file)
}

const handleDrop = (e: DragEvent) => {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) parseFile(file)
}

// ─── Stage mapping ────────────────────────────────────────────────
const mapStage = (raw?: string): OpportunityStage => {
  if (!raw) return 'Unqualified'
  const s = raw.trim()
  const map: Record<string, OpportunityStage> = {
    'Qualified': 'Qualified',
    'Follow-Up': 'Follow-up',
    'Follow-up': 'Follow-up',
    'Follow Up': 'Follow-up',
    'Presentation': 'Presentation',
    'Emergency Phone': 'Emergency Phone',
    'E-Mail': 'Email',
    'Email': 'Email',
    'Further Education': 'Further Education',
    'Won': 'Won',
    'Lost': 'Lost',
    'Unqualified': 'Unqualified',
    'Contract Sent': 'Presentation',
    'Negotiation': 'Presentation',
    'Cancelled': 'Cancelled',
  }
  return map[s] || 'Unqualified'
}

const mapPriority = (raw?: string): Priority | undefined => {
  if (!raw) return undefined
  const p = raw.trim().toUpperCase()
  if (p === 'A') return 'high'
  if (p === 'B') return 'medium'
  if (p === 'C') return 'low'
  return undefined
}

const parseExcelDate = (val: any): string | undefined => {
  if (!val) return undefined
  // Excel serial date number
  if (typeof val === 'number') {
    const date = XLSX.SSF.parse_date_code(val)
    if (date) {
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
    }
  }
  // String date
  if (typeof val === 'string') {
    const str = val.trim()
    // DD.MM.YYYY
    const dmy = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
    if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`
    // YYYY-MM-DD
    if (str.match(/^\d{4}-\d{2}-\d{2}/)) return str.slice(0, 10)
    return undefined
  }
  return undefined
}

// ─── Parse the XLSX file ──────────────────────────────────────────
const parseFile = async (file: File) => {
  parsing.value = true
  parsed.value = false
  imported.value = false

  try {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })

    const leads: NursingHomeLead[] = []
    const contacts: NursingHomeContact[] = []
    const activities: CrmActivity[] = []

    // Parse Opportunities sheet
    const opSheet = workbook.Sheets['Opportunities']
    if (opSheet) {
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(opSheet)

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const companyName = row['Company Name']?.toString().trim()
        if (!companyName) continue

        const nhId = `nh_${i + 1}`
        const leadId = `lead_${i + 1}`

        // Parse address — try to split street into Street + number
        const rawStreet = row['Street Address']?.toString().trim() || ''
        let street = rawStreet
        let number = ''
        const streetMatch = rawStreet.match(/^(.+?)\s+(\d+\s*[a-zA-Z]?)$/)
        if (streetMatch) {
          street = streetMatch[1]
          number = streetMatch[2]
        }

        const beds = row['Anzahl an Betten']
        const totalCapacity = beds ? Math.round(Number(beds)) : undefined

        // Create nursing home object (embedded in lead)
        const nursingHome: NursingHome = {
          id: nhId,
          name: companyName,
          Street: street || undefined,
          number: number || undefined,
          zip: row['Zip Code']?.toString().trim() || undefined,
          city: row['City']?.toString().trim() || undefined,
          fone: row['Phone Number']?.toString().trim() || undefined,
          email: row['Email Address']?.toString().trim() || undefined,
          website: row['Website']?.toString().trim() || undefined,
          total_capacity: totalCapacity || undefined,
          distance_from_dental_office: row['Distance'] ? Number(row['Distance']) : undefined,
        }

        // Map priority from beds if not set in Excel
        let priority = mapPriority(row['Prio']?.toString())
        if (!priority && totalCapacity) {
          if (totalCapacity > 100) priority = 'high'
          else if (totalCapacity > 50) priority = 'medium'
          else priority = 'low'
        }

        const followUpDate = parseExcelDate(row['Follow Up Date'])
        const lastModified = parseExcelDate(row['Opportunity Last Modified'] || row['Letzter Tag der Bearbeitung'])
        const hasCoop = row['Existing Coop']?.toString().trim().toLowerCase()

        const lead: NursingHomeLead = {
          id: leadId,
          nursing_home_id: nursingHome,
          opportunity_stage: mapStage(row['Opportunity Stage']?.toString()),
          priority,
          follow_up_date: followUpDate,
          has_cooperation_partner: hasCoop === 'yes' || hasCoop === 'ja',
          closest_nursing_home: row['Closest Partner']?.toString().trim() || undefined,
          user_id: row['Assignee']?.toString().trim() || undefined,
          date_created: lastModified || new Date().toISOString().slice(0, 10),
          date_updated: lastModified || new Date().toISOString().slice(0, 10),
        }

        leads.push(lead)

        // Create activity from Notes field
        const notes = row['Notes']?.toString().trim()
        if (notes) {
          activities.push({
            id: `activity_note_${i + 1}`,
            nursing_home_lead_id: leadId,
            type: 'note',
            subject: `Import-Notizen: ${companyName}`,
            content: notes,
            direction: null,
            outcome: null,
            duration_minutes: null,
            metadata: { source: 'excel_import' },
            date_created: lastModified ? `${lastModified}T00:00:00.000Z` : new Date().toISOString(),
            user_created: { first_name: row['Assignee']?.toString().trim() || 'Import', last_name: '' },
          })
        }

        // Create activity from Material Sent field
        const materialSent = row['Material Sent']?.toString().trim()
        if (materialSent) {
          activities.push({
            id: `activity_material_${i + 1}`,
            nursing_home_lead_id: leadId,
            type: 'email_sent',
            subject: `Material gesendet: ${materialSent}`,
            content: `Material/Info gesendet: ${materialSent}`,
            direction: 'outbound',
            outcome: null,
            duration_minutes: null,
            metadata: { source: 'excel_import', material: materialSent },
            date_created: lastModified ? `${lastModified}T00:00:00.000Z` : new Date().toISOString(),
            user_created: { first_name: row['Assignee']?.toString().trim() || 'Import', last_name: '' },
          })
        }

        // Create contact from Primary Contact column
        const contactName = row['Primary Contact']?.toString().trim()
        if (contactName) {
          const nameParts = contactName.split(/\s+/)
          const firstName = nameParts[0] || ''
          const lastName = nameParts.slice(1).join(' ') || ''

          contacts.push({
            id: `contact_${i + 1}`,
            nursing_home_id: { id: nhId, name: companyName, city: nursingHome.city },
            first_name: firstName,
            last_name: lastName,
            job_title: row['Primary Contact (Title)']?.toString().trim() || undefined,
            email: row['Email Address']?.toString().trim() || undefined,
            phone: row['Phone Number']?.toString().trim() || undefined,
            is_primary: true,
          })
        }
      }
    }

    // Parse Newsletter List for additional contacts
    const nlSheet = workbook.Sheets['Newsletter List']
    if (nlSheet) {
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(nlSheet)
      let nlIdx = contacts.length

      for (const row of rows) {
        const nhName = row['Pflegeheim']?.toString().trim()
        const pdl = row['PDL']?.toString().trim()
        const email = row['Email']?.toString().trim()

        if (!nhName || !email) continue

        // Check if this contact already exists (by email)
        const exists = contacts.some(c => c.email === email)
        if (exists) continue

        // Find matching lead by nursing home name
        const matchingLead = leads.find(l => {
          const nh = typeof l.nursing_home_id === 'object' ? l.nursing_home_id : null
          return nh?.name?.toLowerCase() === nhName.toLowerCase()
        })

        const nhId = matchingLead
          ? (typeof matchingLead.nursing_home_id === 'object' ? matchingLead.nursing_home_id.id : matchingLead.nursing_home_id)
          : `nh_nl_${++nlIdx}`

        const nameParts = (pdl || '').split(/\s+/)
        contacts.push({
          id: `contact_nl_${nlIdx}`,
          nursing_home_id: { id: nhId, name: nhName },
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          email,
          job_title: 'PDL',
          is_primary: !matchingLead, // primary if no existing contact
        })
      }
    }

    parsedLeads.value = leads
    parsedContacts.value = contacts
    parsedActivities.value = activities
    parsed.value = true
  } catch (err) {
    console.error('Excel parse error:', err)
    alert('Fehler beim Lesen der Excel-Datei. Bitte stelle sicher, dass es eine .xlsx-Datei ist.')
  } finally {
    parsing.value = false
  }
}

const doImport = () => {
  importing.value = true
  try {
    importLeadsToLocal(parsedLeads.value)
    importContactsToLocal(parsedContacts.value)
    importActivitiesToLocal(parsedActivities.value)
    importedCount.value = parsedLeads.value.length
    importedContactCount.value = parsedContacts.value.length
    imported.value = true
    parsed.value = false
  } finally {
    importing.value = false
  }
}

const reset = () => {
  parsed.value = false
  parsedLeads.value = []
  parsedContacts.value = []
  parsedActivities.value = []
  if (fileInput.value) fileInput.value.value = ''
}
</script>
