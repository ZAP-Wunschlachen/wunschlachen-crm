<template>
  <div class="p-6 max-w-5xl">
    <!-- Back -->
    <button class="flex items-center gap-1 text-sm text-dental-blue--2 hover:text-dental-blue-0 mb-4" @click="navigateTo('/patienten')">
      <i class="pi pi-arrow-left text-xs" />
      Zurueck
    </button>

    <div v-if="!lead" class="text-center text-dental-blue--3 py-12">Lade Lead...</div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <h1 class="text-2xl font-bold text-dental-blue-0">{{ lead.first_name }} {{ lead.last_name }}</h1>
        <PatientenLeadStatusBadge :status="lead.status" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- LEFT COLUMN -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Contact Card -->
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <h2 class="text-sm font-semibold text-dental-blue-0 mb-3">Kontakt</h2>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs text-dental-blue--3">Vorname</label>
                <input :value="lead.first_name" type="text" class="field-input" @blur="saveTextField('first_name', $event)" />
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">Nachname</label>
                <input :value="lead.last_name" type="text" class="field-input" @blur="saveTextField('last_name', $event)" />
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">Telefon</label>
                <input :value="lead.phone" type="tel" class="field-input" @blur="saveTextField('phone', $event)" />
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">E-Mail</label>
                <input :value="lead.mail" type="email" class="field-input" @blur="saveTextField('mail', $event)" />
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">Standort</label>
                <select :value="locationId" class="field-input bg-white" @change="saveField('location', ($event.target as HTMLSelectElement).value || null)">
                  <option value="">-- Auswaehlen --</option>
                  <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">Quelle</label>
                <select :value="lead.lead_source || ''" class="field-input bg-white" @change="saveField('lead_source', ($event.target as HTMLSelectElement).value || null)">
                  <option value="">-- Auswaehlen --</option>
                  <option v-for="(cfg, key) in LEAD_SOURCE_CONFIG" :key="key" :value="key">{{ cfg.label }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Treatment Card -->
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <h2 class="text-sm font-semibold text-dental-blue-0 mb-3">Behandlung</h2>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs text-dental-blue--3">Zahnaerztliche Leistung</label>
                <select :value="dentalServiceId" class="field-input bg-white" @change="saveField('dental_service', ($event.target as HTMLSelectElement).value || null)">
                  <option value="">-- Auswaehlen --</option>
                  <option v-for="svc in services" :key="svc.id" :value="svc.id">{{ svc.name }}</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">Wert (EUR)</label>
                <input :value="lead.oportunity_value" type="number" class="field-input" @blur="saveField('oportunity_value', Number(($event.target as HTMLInputElement).value) || null)" />
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">Umsatz (EUR)</label>
                <input :value="lead.revenue" type="number" class="field-input" @blur="saveField('revenue', Number(($event.target as HTMLInputElement).value) || null)" />
              </div>
            </div>
          </div>

          <!-- Activities -->
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <h2 class="text-sm font-semibold text-dental-blue-0 mb-3">Aktivitaeten</h2>
            <PatientenActivityFeed :activities="activities" @removed="onActivityRemoved" />
          </div>
        </div>

        <!-- RIGHT COLUMN -->
        <div class="space-y-4">
          <!-- Status -->
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <h2 class="text-sm font-semibold text-dental-blue-0 mb-2">Status</h2>
            <select :value="lead.status" class="field-input bg-white" @change="saveField('status', ($event.target as HTMLSelectElement).value)">
              <option v-for="(cfg, key) in LEAD_STATUS_CONFIG" :key="key" :value="key">{{ cfg.label }}</option>
            </select>
          </div>

          <!-- Follow-up -->
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <h2 class="text-sm font-semibold text-dental-blue-0 mb-2">Follow-up</h2>
            <input :value="lead.follow_up || ''" type="date" class="field-input" @change="saveField('follow_up', ($event.target as HTMLInputElement).value || null)" />
            <p v-if="isOverdue" class="text-[10px] text-red-500 mt-1 font-medium">Ueberfaellig!</p>
          </div>

          <!-- Lead Score -->
          <div v-if="leadScore" class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <h2 class="text-sm font-semibold text-dental-blue-0 mb-2">Lead Score</h2>
            <PatientenLeadScoreBadge :score="leadScore.total" />
          </div>

          <!-- Response Time -->
          <div v-if="responseTime" class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <h2 class="text-sm font-semibold text-dental-blue-0 mb-2">Reaktionszeit</h2>
            <PatientenResponseTimeBadge :result="responseTime" />
          </div>

          <!-- Meta -->
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5 text-[11px] text-dental-blue--3 space-y-1">
            <p>Erstellt: {{ formatDate(lead.date_created) }}</p>
            <p>Aktualisiert: {{ formatDate(lead.date_updated) }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { LEAD_STATUS_CONFIG, LEAD_SOURCE_CONFIG, type Lead, type LeadActivity } from '~/types/crm'
import type { LeadScoreResult, ResponseTimeResult } from '~/types/analytics'

definePageMeta({ layout: 'crm', middleware: ['auth'] })

const route = useRoute()
const lead = ref<Lead | null>(null)

const { locations, fetchLocations } = useLocations()
const { services, fetchDentalServices } = useDentalServices()
const { getActivities, removeActivity } = useLeadActivities()
const activities = ref<LeadActivity[]>([])
const { scoreLead } = useLeadScoring()
const { getResponseTime } = useResponseTime()

const leadScore = computed((): LeadScoreResult | null => {
  if (!lead.value) return null
  const maxOV = lead.value.oportunity_value || 1
  return scoreLead(lead.value, activities.value, maxOV)
})

const responseTime = computed((): ResponseTimeResult | null => {
  if (!lead.value) return null
  return getResponseTime(lead.value, activities.value)
})

const locationId = computed(() => {
  if (!lead.value?.location) return ''
  return typeof lead.value.location === 'object' ? lead.value.location.id : lead.value.location
})

const dentalServiceId = computed(() => {
  if (!lead.value?.dental_service) return ''
  return typeof lead.value.dental_service === 'object' ? lead.value.dental_service.id : lead.value.dental_service
})

const isOverdue = computed(() => {
  if (!lead.value?.follow_up) return false
  return lead.value.follow_up < new Date().toISOString().split('T')[0]
})

const loadLead = async () => {
  const { fetchLead } = useLeads()
  lead.value = await fetchLead(route.params.id as string)
  refreshActivities()
}

const refreshActivities = () => {
  activities.value = getActivities(route.params.id as string)
}

const saveField = async (field: string, value: any) => {
  if (!lead.value) return
  try {
    const { updateLead } = useLeads()
    await updateLead(lead.value.id, { [field]: value })
    ;(lead.value as any)[field] = value
  } catch (err) {
    console.error('Save failed:', err)
  }
}

const saveTextField = async (field: string, event: Event) => {
  if (!lead.value) return
  const input = event.target as HTMLInputElement | HTMLTextAreaElement
  const newValue = input.value
  const previousValue = (lead.value as any)[field]
  if (newValue === previousValue) return
  try {
    const { updateLead } = useLeads()
    await updateLead(lead.value.id, { [field]: newValue || null })
    ;(lead.value as any)[field] = newValue
  } catch (err) {
    input.value = previousValue || ''
  }
}

const onActivityRemoved = (id: string) => {
  removeActivity(id)
  refreshActivities()
}

const formatDate = (date: string) => {
  try { return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }) }
  catch { return date }
}

onMounted(async () => {
  await Promise.all([loadLead(), fetchLocations(), fetchDentalServices()])
})
</script>

<style scoped>
.field-input {
  @apply w-full px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0;
}
</style>
