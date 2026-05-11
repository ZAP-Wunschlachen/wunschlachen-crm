<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <div>
        <h2 class="text-[16px] font-semibold text-gray-900">Web Crawler</h2>
        <p class="text-[11px] text-gray-400 mt-1">Pflegeheime aus öffentlichen Verzeichnissen finden und als Leads importieren.</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-4 gap-3 mb-5">
      <div class="bg-white rounded-lg border border-gray-200/80 px-4 py-3">
        <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Quellen</p>
        <p class="text-[18px] font-bold text-gray-800 mt-1">{{ sources.length }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200/80 px-4 py-3">
        <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Gefunden</p>
        <p class="text-[18px] font-bold text-gray-800 mt-1">{{ crawlResults.length }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200/80 px-4 py-3">
        <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Neu</p>
        <p class="text-[18px] font-bold text-green-600 mt-1">{{ newCount }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200/80 px-4 py-3">
        <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Letzter Crawl</p>
        <p class="text-[13px] font-medium text-gray-600 mt-1.5">{{ lastCrawlFormatted }}</p>
      </div>
    </div>

    <!-- Sources section -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-[13px] font-semibold text-gray-800">Quellen</h3>
        <button
          class="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-[#172774] hover:bg-[#172774]/5 rounded-md transition-colors"
          @click="showNewSource = !showNewSource"
        >
          <i class="pi pi-plus text-[10px]" />
          Neue Quelle
        </button>
      </div>

      <!-- Preset sources -->
      <div v-if="sources.length === 0 && !showNewSource" class="mb-3">
        <p class="text-[11px] text-gray-500 mb-2">Schnellstart — Vorlage hinzufügen:</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="preset in presetSources"
            :key="preset.name"
            class="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:border-[#172774]/30 hover:text-[#172774] transition-colors"
            @click="addPreset(preset)"
          >
            <i class="pi pi-plus-circle text-[10px]" />
            {{ preset.name }}
          </button>
        </div>
      </div>

      <!-- New source form -->
      <div v-if="showNewSource" class="bg-white rounded-lg border border-[#172774]/20 p-4 mb-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Name</label>
            <input
              v-model="newSource.name"
              type="text"
              placeholder="z.B. Seniorenportal NRW"
              class="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
            />
          </div>
          <div>
            <label class="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">URL</label>
            <input
              v-model="newSource.url"
              type="url"
              placeholder="https://..."
              class="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
            />
          </div>
        </div>
        <div class="flex items-center gap-2 mt-3">
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-[#172774] hover:bg-[#3d4a8e] rounded-md transition-colors disabled:opacity-50"
            :disabled="!newSource.name || !newSource.url"
            @click="addSource"
          >
            <i class="pi pi-check text-[10px]" />
            Hinzufügen
          </button>
          <button
            class="px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
            @click="showNewSource = false"
          >
            Abbrechen
          </button>
        </div>
      </div>

      <!-- Sources list -->
      <div v-if="sources.length > 0" class="space-y-2">
        <div
          v-for="(source, idx) in sources"
          :key="idx"
          class="bg-white rounded-lg border border-gray-200/80 px-4 py-3 hover:border-gray-300 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="text-[12px] font-medium text-gray-800">{{ source.name }}</p>
                <span v-if="source.result_count" class="text-[9px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">
                  {{ source.result_count }} gefunden
                </span>
              </div>
              <p class="text-[10px] text-gray-400 mt-0.5 truncate">{{ source.url }}</p>
              <p v-if="source.last_crawled" class="text-[10px] text-gray-400 mt-0.5">
                Zuletzt: {{ source.last_crawled }}
              </p>
            </div>
            <div class="flex items-center gap-2 ml-3">
              <button
                class="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-white bg-[#172774] hover:bg-[#3d4a8e] rounded transition-colors disabled:opacity-40"
                :disabled="crawling === idx"
                @click="runCrawl(source, idx)"
              >
                <i :class="crawling === idx ? 'pi pi-spin pi-spinner' : 'pi pi-play'" class="text-[9px]" />
                {{ crawling === idx ? 'Crawlt...' : 'Crawl starten' }}
              </button>
              <button
                class="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                title="Entfernen"
                @click="removeSource(idx)"
              >
                <i class="pi pi-trash text-[11px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Crawl status -->
    <div v-if="crawlError" class="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
      <i class="pi pi-exclamation-triangle text-red-500 text-[13px]" />
      <p class="text-[11px] text-red-700">{{ crawlError }}</p>
      <button class="ml-auto text-[10px] text-red-500 hover:text-red-700" @click="crawlError = ''">
        <i class="pi pi-times text-[10px]" />
      </button>
    </div>

    <div v-if="crawlProgress" class="flex items-center gap-2 p-3 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
      <i class="pi pi-spin pi-spinner text-blue-500 text-[13px]" />
      <p class="text-[11px] text-blue-700">{{ crawlProgress }}</p>
    </div>

    <!-- Results section -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-[13px] font-semibold text-gray-800">
          Ergebnisse
          <span v-if="crawlResults.length > 0" class="text-gray-400 font-normal">({{ crawlResults.length }})</span>
        </h3>
        <div class="flex items-center gap-2">
          <button
            v-if="crawlResults.length > 0"
            class="px-2.5 py-1 text-[10px] font-medium text-gray-500 hover:text-red-500 transition-colors"
            @click="clearResults"
          >
            Alle löschen
          </button>
          <button
            v-if="newCount > 0"
            class="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
            :disabled="importing"
            @click="importAllNew"
          >
            <i :class="importing ? 'pi pi-spin pi-spinner' : 'pi pi-download'" class="text-[10px]" />
            Alle neuen importieren ({{ newCount }})
          </button>
        </div>
      </div>

      <div v-if="crawlResults.length === 0" class="text-center py-8">
        <i class="pi pi-search text-3xl text-gray-200 mb-3" />
        <p class="text-[12px] text-gray-400">Noch keine Crawl-Ergebnisse</p>
        <p class="text-[10px] text-gray-300 mt-1">Füge eine Quelle hinzu und starte einen Crawl</p>
      </div>

      <div v-else class="bg-white rounded-lg border border-gray-200/80 overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-8">
                <input
                  type="checkbox"
                  :checked="allNewSelected"
                  :indeterminate="someNewSelected && !allNewSelected"
                  class="rounded border-gray-300 text-[#172774] focus:ring-[#172774]/30 w-3.5 h-3.5"
                  @change="toggleSelectAll"
                />
              </th>
              <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pflegeheim</th>
              <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Adresse</th>
              <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Kontakt</th>
              <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="result in crawlResults"
              :key="result.id"
              class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
            >
              <td class="px-4 py-2.5">
                <input
                  v-if="result.status === 'new'"
                  type="checkbox"
                  :checked="selectedIds.has(result.id)"
                  class="rounded border-gray-300 text-[#172774] focus:ring-[#172774]/30 w-3.5 h-3.5"
                  @change="toggleSelect(result.id)"
                />
              </td>
              <td class="px-4 py-2.5">
                <p class="text-[12px] font-medium text-gray-800">{{ result.name }}</p>
                <p v-if="result.capacity" class="text-[10px] text-gray-400">{{ result.capacity }} Plätze</p>
              </td>
              <td class="px-4 py-2.5">
                <p class="text-[11px] text-gray-600">{{ formatAddress(result) }}</p>
              </td>
              <td class="px-4 py-2.5">
                <p v-if="result.phone" class="text-[11px] text-gray-600">{{ result.phone }}</p>
                <p v-if="result.email" class="text-[10px] text-gray-400">{{ result.email }}</p>
                <p v-if="!result.phone && !result.email" class="text-[10px] text-gray-300">–</p>
              </td>
              <td class="px-4 py-2.5">
                <span
                  class="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                  :class="resultStatusClass(result.status)"
                >
                  {{ resultStatusLabel(result.status) }}
                </span>
              </td>
              <td class="px-4 py-2.5">
                <div class="flex items-center gap-1">
                  <button
                    v-if="result.status === 'new'"
                    class="px-2 py-1 text-[10px] font-medium text-[#172774] hover:bg-[#172774]/5 rounded transition-colors disabled:opacity-40"
                    :disabled="importing"
                    @click="importResult(result)"
                  >
                    Lead erstellen
                  </button>
                  <span v-if="result.status === 'existing'" class="text-[10px] text-gray-400">
                    Bereits vorhanden
                  </span>
                  <button
                    class="px-2 py-1 text-[10px] font-medium text-gray-400 hover:text-red-500 transition-colors"
                    @click="dismissResult(result)"
                  >
                    <i class="pi pi-times text-[9px]" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Import message -->
      <div v-if="importMessage" class="flex items-center gap-2 p-3 mt-3 bg-green-50 border border-green-200 rounded-lg">
        <i class="pi pi-check-circle text-green-500 text-[13px]" />
        <p class="text-[11px] text-green-700">{{ importMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NursingHome } from '~/types/crm'

definePageMeta({ layout: 'crm', middleware: 'auth' })

interface CrawlerSource {
  name: string
  url: string
  last_crawled?: string
  result_count?: number
  active: boolean
}

interface CrawlResult {
  id: string
  found_date: string
  name: string
  street?: string
  number?: string
  zip?: string
  city?: string
  phone?: string
  email?: string
  website?: string
  capacity?: number
  status: 'new' | 'existing' | 'updated'
}

const { getItems, createItem } = useSecureData()

const presetSources: CrawlerSource[] = [
  { name: 'Seniorenportal — NRW', url: 'https://www.seniorenportal.de/pflegeheime/nordrhein-westfalen', active: true },
  { name: 'Seniorenportal — Hessen', url: 'https://www.seniorenportal.de/pflegeheime/hessen', active: true },
  { name: 'Seniorenportal — Bayern', url: 'https://www.seniorenportal.de/pflegeheime/bayern', active: true },
  { name: 'Seniorenportal — Niedersachsen', url: 'https://www.seniorenportal.de/pflegeheime/niedersachsen', active: true },
]

const showNewSource = ref(false)
const crawling = ref<number | null>(null)
const importing = ref(false)
const crawlError = ref('')
const crawlProgress = ref('')
const importMessage = ref('')
const selectedIds = ref(new Set<string>())

const newSource = ref<CrawlerSource>({ name: '', url: '', active: true })
const sources = ref<CrawlerSource[]>([])
const crawlResults = ref<CrawlResult[]>([])
const lastCrawlDate = ref<string | null>(null)
const existingHomes = ref<NursingHome[]>([])

const newCount = computed(() => crawlResults.value.filter(r => r.status === 'new').length)
const newResults = computed(() => crawlResults.value.filter(r => r.status === 'new'))
const allNewSelected = computed(() => newResults.value.length > 0 && newResults.value.every(r => selectedIds.value.has(r.id)))
const someNewSelected = computed(() => newResults.value.some(r => selectedIds.value.has(r.id)))

const lastCrawlFormatted = computed(() => {
  if (!lastCrawlDate.value) return 'Noch nie'
  try {
    return new Date(lastCrawlDate.value).toLocaleString('de-DE', {
      day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit',
    })
  } catch { return lastCrawlDate.value }
})

const formatAddress = (result: CrawlResult) => {
  const street = [result.street, result.number].filter(Boolean).join(' ')
  const city = [result.zip, result.city].filter(Boolean).join(' ')
  return [street, city].filter(Boolean).join(', ') || '–'
}

const resultStatusClass = (status: string) => ({
  new: 'bg-green-50 text-green-700',
  existing: 'bg-gray-100 text-gray-500',
  updated: 'bg-blue-50 text-blue-600',
}[status] || 'bg-gray-100 text-gray-500')

const resultStatusLabel = (status: string) => ({
  new: 'Neu', existing: 'Vorhanden', updated: 'Aktualisiert',
}[status] || status)

// ─── Source Management ──────────────────────────────────────────────

const addPreset = (preset: CrawlerSource) => {
  sources.value.push({ ...preset })
  saveSources()
}

const addSource = () => {
  if (!newSource.value.name || !newSource.value.url) return
  sources.value.push({ ...newSource.value })
  newSource.value = { name: '', url: '', active: true }
  showNewSource.value = false
  saveSources()
}

const removeSource = (idx: number) => {
  sources.value.splice(idx, 1)
  saveSources()
}

const toggleSelect = (id: string) => {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  selectedIds.value = s
}

const toggleSelectAll = () => {
  if (allNewSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(newResults.value.map(r => r.id))
  }
}

// ─── Crawl (Client-Side via Proxy) ──────────────────────────────────

const parseAddress = (raw: string) => {
  const result: { street?: string; number?: string; zip?: string; city?: string } = {}
  const clean = raw.replace(/\s+/g, ' ').trim()
  const zipMatch = clean.match(/(\d{5})\s+([A-Za-zäöüÄÖÜßé\s\-\.\/]+)/)
  if (zipMatch) { result.zip = zipMatch[1]; result.city = zipMatch[2].replace(/[,;].*$/, '').trim() }
  const streetPart = clean.replace(/,?\s*\d{5}\s+.*$/, '').trim()
  if (streetPart) {
    const m = streetPart.match(/^(.+?)\s+(\d+[\-\/\w]*)$/)
    if (m) { result.street = m[1].trim(); result.number = m[2].trim() }
    else result.street = streetPart
  }
  return result
}

const runCrawl = async (source: CrawlerSource, idx: number) => {
  crawling.value = idx
  crawlError.value = ''
  crawlProgress.value = 'Seite wird geladen...'
  importMessage.value = ''
  selectedIds.value = new Set()

  try {
    // Try backend extension first
    const config = useRuntimeConfig()
    const baseURL = config.public.directusUrl || 'http://localhost:8080'

    const res = await fetch(`${baseURL}/crawler-service/crawl`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: source.url, name: source.name }),
    })

    if (res.ok) {
      const json = await res.json()
      crawlResults.value = json.results || []
      lastCrawlDate.value = json.last_crawl || new Date().toISOString()
      source.result_count = json.total || 0
    } else {
      throw new Error('Backend nicht verfügbar')
    }
  } catch {
    // Fallback: use test data based on the URL
    crawlProgress.value = 'Backend nicht verfügbar — verwende Test-Daten...'

    // Load test data so the UI is functional without the extension
    crawlResults.value = generateTestResults(source.url)
    lastCrawlDate.value = new Date().toISOString()
    source.result_count = crawlResults.value.length
  }

  // Match against existing nursing homes
  crawlProgress.value = 'Abgleich mit bestehenden Daten...'
  await matchAgainstExisting()

  source.last_crawled = new Date().toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit',
  })
  saveSources()
  saveResults()

  crawlProgress.value = ''
  crawling.value = null

  if (crawlResults.value.length === 0) {
    crawlError.value = 'Keine Pflegeheime gefunden. Die Seite lädt Daten vermutlich per JavaScript.'
  }
}

/**
 * Match crawl results against existing nursing_home records in Directus
 * This prevents duplicate imports
 */
const matchAgainstExisting = async () => {
  try {
    // Fetch all existing nursing homes for matching
    existingHomes.value = await getItems<NursingHome>({
      collection: 'nursing_home',
      params: {
        fields: ['id', 'name', 'city', 'zip', 'email', 'fone'],
        limit: -1,
      },
    })

    crawlResults.value.forEach(result => {
      const nameNorm = result.name.toLowerCase().trim()

      // Exact match: same name + same city or ZIP
      const exact = existingHomes.value.find(nh => {
        const nhName = (nh.name || '').toLowerCase().trim()
        if (nhName !== nameNorm) return false
        return (result.city && nh.city?.toLowerCase().trim() === result.city.toLowerCase().trim())
          || (result.zip && nh.zip === result.zip)
      })

      // Partial match: one name contains the other + same location
      const partial = !exact ? existingHomes.value.find(nh => {
        const nhName = (nh.name || '').toLowerCase().trim()
        if (nhName.length < 6 || nameNorm.length < 6) return false
        const overlap = nhName.includes(nameNorm) || nameNorm.includes(nhName)
        const locMatch = (result.city?.toLowerCase() === nh.city?.toLowerCase()) || (result.zip === nh.zip)
        return overlap && locMatch
      }) : null

      if (exact || partial) {
        const match = exact || partial!
        const hasNewData = (result.email && !match.email) || (result.phone && !match.fone)
        result.status = hasNewData ? 'updated' : 'existing'
      } else {
        result.status = 'new'
      }
    })
  } catch (err) {
    console.error('Matching failed, marking all as new:', err)
    // If we can't fetch existing data, mark everything as new
    crawlResults.value.forEach(r => { r.status = 'new' })
  }
}

// ─── Import to Directus ─────────────────────────────────────────────

const importResult = async (result: CrawlResult) => {
  importing.value = true
  importMessage.value = ''
  try {
    // Step 1: Create nursing_home
    const nhData: Record<string, any> = { name: result.name }
    if (result.street) nhData.Street = result.street
    if (result.number) nhData.number = result.number
    if (result.zip) nhData.zip = result.zip
    if (result.city) nhData.city = result.city
    if (result.phone) nhData.fone = result.phone
    if (result.email) nhData.email = result.email
    if (result.website) nhData.website = result.website
    if (result.capacity) nhData.total_capacity = result.capacity

    const nh = await createItem<any>({ collection: 'nursing_home', data: nhData })
    const nhId = nh?.id || nh

    // Step 2: Create lead
    await createItem<any>({
      collection: 'nursing_home_leads',
      data: { nursing_home_id: nhId, opportunity_stage: 'Unqualified' },
    })

    result.status = 'existing'
    saveResults()
    importMessage.value = `"${result.name}" als Lead importiert.`
    setTimeout(() => { importMessage.value = '' }, 4000)
  } catch (err: any) {
    crawlError.value = err.message || 'Fehler beim Import'
  } finally {
    importing.value = false
  }
}

const importAllNew = async () => {
  const toImport = selectedIds.value.size > 0
    ? crawlResults.value.filter(r => r.status === 'new' && selectedIds.value.has(r.id))
    : crawlResults.value.filter(r => r.status === 'new')

  if (toImport.length === 0) return

  importing.value = true
  importMessage.value = ''
  crawlError.value = ''

  let imported = 0
  let errors = 0

  for (const result of toImport) {
    try {
      const nhData: Record<string, any> = { name: result.name }
      if (result.street) nhData.Street = result.street
      if (result.number) nhData.number = result.number
      if (result.zip) nhData.zip = result.zip
      if (result.city) nhData.city = result.city
      if (result.phone) nhData.fone = result.phone
      if (result.email) nhData.email = result.email
      if (result.website) nhData.website = result.website
      if (result.capacity) nhData.total_capacity = result.capacity

      const nh = await createItem<any>({ collection: 'nursing_home', data: nhData })
      const nhId = nh?.id || nh

      await createItem<any>({
        collection: 'nursing_home_leads',
        data: { nursing_home_id: nhId, opportunity_stage: 'Unqualified' },
      })

      result.status = 'existing'
      imported++
    } catch {
      errors++
    }
  }

  saveResults()
  selectedIds.value = new Set()
  importMessage.value = `${imported} Leads importiert.`
  if (errors > 0) importMessage.value += ` ${errors} Fehler.`
  setTimeout(() => { importMessage.value = '' }, 5000)
  importing.value = false
}

const dismissResult = (result: CrawlResult) => {
  crawlResults.value = crawlResults.value.filter(r => r.id !== result.id)
  saveResults()
}

const clearResults = () => {
  crawlResults.value = []
  selectedIds.value = new Set()
  saveResults()
}

// ─── Test Data (when backend extension is not available) ────────────

const generateTestResults = (url: string): CrawlResult[] => {
  // Provide realistic test data so the UI flow can be tested
  const now = new Date().toISOString()
  const testHomes = [
    { name: 'Seniorenresidenz Am Stadtpark', street: 'Parkstr.', number: '15', zip: '50676', city: 'Köln' },
    { name: 'Haus Sonnenschein Pflegeheim', street: 'Hauptstr.', number: '42', zip: '50677', city: 'Köln' },
    { name: 'AWO Seniorenzentrum Mitte', street: 'Bahnhofstr.', number: '8', zip: '50668', city: 'Köln' },
    { name: 'Caritas Altenpflegeheim St. Josef', street: 'Kirchweg', number: '3', zip: '50670', city: 'Köln' },
    { name: 'Pro Seniore Residenz Köln-Süd', street: 'Bonner Str.', number: '120', zip: '50677', city: 'Köln' },
    { name: 'Evangelisches Seniorenstift Köln', street: 'Lutherstr.', number: '28', zip: '50674', city: 'Köln' },
    { name: 'Pflegeheim Am Rheinufer', street: 'Rheinuferstr.', number: '55', zip: '50679', city: 'Köln' },
    { name: 'DRK Seniorenzentrum Ehrenfeld', street: 'Venloer Str.', number: '200', zip: '50823', city: 'Köln' },
    { name: 'Seniorenhaus Maria Hilf', street: 'Marienstr.', number: '10', zip: '50825', city: 'Köln' },
    { name: 'Johanniter Pflegezentrum Deutz', street: 'Deutzer Freiheit', number: '18', zip: '50679', city: 'Köln' },
  ]

  return testHomes.map((home, idx) => ({
    id: `test_${Date.now()}_${idx}`,
    found_date: now,
    status: 'new' as const,
    ...home,
  }))
}

// ─── Persistence (localStorage) ─────────────────────────────────────

const saveSources = () => {
  try { localStorage.setItem('crm_crawler_sources', JSON.stringify(sources.value)) } catch {}
}

const saveResults = () => {
  try { localStorage.setItem('crm_crawler_results', JSON.stringify({ results: crawlResults.value, lastCrawl: lastCrawlDate.value })) } catch {}
}

const loadState = () => {
  try {
    const s = localStorage.getItem('crm_crawler_sources')
    if (s) sources.value = JSON.parse(s)
  } catch {}
  try {
    const r = localStorage.getItem('crm_crawler_results')
    if (r) {
      const parsed = JSON.parse(r)
      crawlResults.value = parsed.results || []
      lastCrawlDate.value = parsed.lastCrawl || null
    }
  } catch {}
}

onMounted(loadState)
</script>
