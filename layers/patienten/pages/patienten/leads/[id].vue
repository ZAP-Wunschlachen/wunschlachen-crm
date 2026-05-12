<template>
  <div class="p-6 max-w-5xl">
    <!-- Back -->
    <button class="flex items-center gap-1 text-sm text-dental-blue--2 hover:text-dental-blue-0 mb-4" @click="navigateTo('/patienten/leads')">
      <i class="pi pi-arrow-left text-xs" />
      Zurück
    </button>

    <div v-if="!lead" class="text-center text-dental-blue--3 py-12">Lade Lead...</div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div>
          <h1 class="text-2xl font-bold text-dental-blue-0">{{ lead.first_name }} {{ lead.last_name }}</h1>
          <p class="text-xs text-dental-blue--3 mt-0.5">
            <NuxtLink :to="`/patienten/${lead.id}`" class="hover:underline">
              <i class="pi pi-user text-[10px] mr-0.5" />Stammdaten
            </NuxtLink>
            <span class="mx-2">·</span>
            <span class="font-medium">Sales-Detail</span>
          </p>
        </div>
        <PatientenLeadStatusBadge :status="lead.status" />
      </div>

      <!-- ⚡ Next Best Action (Plan v9 A4) -->
      <div class="mb-4">
        <PatientenNextBestActionCard :recommendation="recommendation" @action="onAction" />
      </div>

      <!-- 📊 Pipeline-Mini-Bar (Plan v9 A1) -->
      <div class="mb-6">
        <PatientenPipelineMiniBar
          :current-status="lead.status"
          :contact-attempts="lead.contact_attempts"
          :missed-appointments="lead.missed_appointments"
          :days-in-status="recommendation.days_in_status"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- LEFT COLUMN -->
        <div class="lg:col-span-2 space-y-6">

          <!-- 🕐 Communication Timeline (Plan v9 A3) -->
          <PatientenCommunicationTimeline :activities="allLeadActivities" />

          <!-- Contact Card -->
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <h2 class="text-sm font-semibold text-dental-blue-0 mb-3">Kontakt</h2>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs text-dental-blue--3">Vorname</label>
                <input
                  :value="lead.first_name"
                  type="text"
                  class="field-input"
                  @blur="saveTextField('first_name', $event)"
                />
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">Nachname</label>
                <input
                  :value="lead.last_name"
                  type="text"
                  class="field-input"
                  @blur="saveTextField('last_name', $event)"
                />
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">Telefon</label>
                <input
                  :value="lead.phone"
                  type="tel"
                  class="field-input"
                  @blur="saveTextField('phone', $event)"
                />
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">E-Mail</label>
                <input
                  :value="lead.mail"
                  type="email"
                  class="field-input"
                  @blur="saveTextField('mail', $event)"
                />
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">Standort</label>
                <select
                  :value="locationId"
                  class="field-input bg-white"
                  @change="saveField('location', ($event.target as HTMLSelectElement).value || null)"
                >
                  <option value="">— Auswählen —</option>
                  <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">Quelle</label>
                <select
                  :value="lead.lead_source || ''"
                  class="field-input bg-white"
                  @change="saveField('lead_source', ($event.target as HTMLSelectElement).value || null)"
                >
                  <option value="">— Auswählen —</option>
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
                <label class="text-xs text-dental-blue--3">Zahnärztliche Leistung</label>
                <select
                  :value="dentalServiceId"
                  class="field-input bg-white"
                  @change="saveField('dental_service', ($event.target as HTMLSelectElement).value || null)"
                >
                  <option value="">— Auswählen —</option>
                  <option v-for="svc in services" :key="svc.id" :value="svc.id">{{ svc.name }}</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">Wert (€)</label>
                <input
                  :value="lead.oportunity_value"
                  type="number"
                  class="field-input"
                  @blur="saveField('oportunity_value', Number(($event.target as HTMLInputElement).value) || null)"
                />
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">Umsatz (€)</label>
                <input
                  :value="lead.revenue"
                  type="number"
                  class="field-input"
                  @blur="saveField('revenue', Number(($event.target as HTMLInputElement).value) || null)"
                />
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">Datum/Zeit</label>
                <input
                  :value="lead.date_time || ''"
                  type="datetime-local"
                  class="field-input"
                  @change="saveField('date_time', ($event.target as HTMLInputElement).value || null)"
                />
              </div>
            </div>
          </div>

          <!-- Message Card -->
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <h2 class="text-sm font-semibold text-dental-blue-0 mb-2">Nachricht</h2>
            <textarea
              :value="lead.message"
              rows="4"
              class="field-input resize-none"
              @blur="saveTextField('message', $event)"
            />
          </div>

          <!-- Tags Card -->
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <h2 class="text-sm font-semibold text-dental-blue-0 mb-2">Tags</h2>
            <div class="flex flex-wrap gap-1 mb-2">
              <span
                v-for="(tag, i) in (lead.Tags || [])"
                :key="i"
                class="inline-flex items-center gap-1 px-2 py-0.5 bg-dental-blue--5 text-dental-blue-0 rounded-full text-[10px] font-medium"
              >
                {{ tag }}
                <button class="hover:text-power-red-0" @click="removeTag(i)">
                  <i class="pi pi-times text-[8px]" />
                </button>
              </span>
            </div>
            <input
              v-model="newTag"
              type="text"
              class="field-input"
              placeholder="Tag hinzufügen + Enter"
              @keydown.enter.prevent="addTag"
            />
          </div>

          <!-- Activities -->
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <h2 class="text-sm font-semibold text-dental-blue-0 mb-3">Aktivitäten</h2>
            <PatientenActivityQuickActions class="mb-4" @select="openActivityDialog" />
            <PatientenActivityFeed :activities="activities" @removed="onActivityRemoved" />
          </div>
        </div>

        <!-- RIGHT COLUMN -->
        <div class="space-y-4">
          <!-- Status -->
          <div id="status-section" class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-sm font-semibold text-dental-blue-0">Status</h2>
              <span v-if="LEAD_STATUS_CONFIG[lead.status]?.description"
                class="text-[10px] text-dental-blue--3 italic"
                :title="LEAD_STATUS_CONFIG[lead.status].description">ⓘ Info</span>
            </div>
            <select
              :value="lead.status"
              class="field-input bg-white"
              @change="onStatusChange(($event.target as HTMLSelectElement).value)"
            >
              <!-- Aktueller Status (immer drin) -->
              <option :value="lead.status">{{ LEAD_STATUS_CONFIG[lead.status].label }} (aktuell)</option>
              <!-- Erlaubte Folge-Status via State-Machine -->
              <option v-for="nextStatus in allowedNextStatuses" :key="nextStatus" :value="nextStatus">
                → {{ LEAD_STATUS_CONFIG[nextStatus].label }}
              </option>
            </select>
            <p v-if="LEAD_STATUS_CONFIG[lead.status]?.description"
              class="text-[11px] text-dental-blue--3 mt-1.5 leading-tight">
              {{ LEAD_STATUS_CONFIG[lead.status].description }}
            </p>
          </div>

          <!-- Follow-up -->
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <h2 class="text-sm font-semibold text-dental-blue-0 mb-2">Follow-up</h2>
            <input
              :value="lead.follow_up || ''"
              type="date"
              class="field-input"
              @change="saveField('follow_up', ($event.target as HTMLInputElement).value || null)"
            />
            <p v-if="isOverdue" class="text-[10px] text-red-500 mt-1 font-medium">Überfällig!</p>
          </div>

          <!-- E-Mail-Engagement (Brevo-Tracking) -->
          <PatientenEngagementStatsCard :activities="activities" />

          <!-- Lead Score -->
          <PatientenLeadScoreBreakdown v-if="leadScore" :result="leadScore" />

          <!-- Response Time -->
          <div v-if="responseTime" class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <h2 class="text-sm font-semibold text-dental-blue-0 mb-2">Reaktionszeit</h2>
            <PatientenResponseTimeBadge :result="responseTime" />
          </div>

          <!-- Appointments (C3) -->
          <PatientenLeadAppointments
            ref="leadAppointmentsRef"
            :lead-id="(route.params.id as string)"
            @create="appointmentDialogVisible = true"
          />

          <!-- Lost reason (cancelled only) -->
          <div v-if="lead.status === 'lost'" class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <h2 class="text-sm font-semibold text-dental-blue-0 mb-2">Verlust-Grund</h2>
            <select
              :value="lead.lost_reason || ''"
              class="field-input bg-white"
              @change="saveField('lost_reason', ($event.target as HTMLSelectElement).value || null)"
            >
              <option value="">— Auswählen —</option>
              <option v-for="(label, key) in LOST_REASON_LABELS" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>

          <!-- Meta -->
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5 text-[11px] text-dental-blue--3 space-y-1">
            <p>Erstellt: {{ formatDate(lead.date_created) }}</p>
            <p>Aktualisiert: {{ formatDate(lead.date_updated) }}</p>
            <p v-if="lead.GDPR_accepted_at">DSGVO: {{ formatDate(lead.GDPR_accepted_at) }}</p>
            <p v-if="lead.newsletter_accepted_time">Newsletter: {{ formatDate(lead.newsletter_accepted_time) }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Activity Dialog -->
    <PatientenActivityLogDialog
      v-model:visible="activityDialogVisible"
      :lead-id="(route.params.id as string)"
      :initial-type="activityDialogType"
      @saved="refreshActivities"
    />

    <!-- Email Compose Dialog -->
    <PatientenEmailComposeDialog
      v-model:visible="emailDialogVisible"
      :lead-id="(route.params.id as string)"
      :lead="lead"
      @saved="refreshActivities"
    />

    <!-- Appointment Create Dialog -->
    <PatientenAppointmentCreateDialog
      v-model:visible="appointmentDialogVisible"
      :lead-id="(route.params.id as string)"
      @saved="onAppointmentSaved"
    />

    <!-- Toast -->
    <Toast position="bottom-right" />
  </div>
</template>

<script setup lang="ts">


import {
  LEAD_STATUS_CONFIG,
  LEAD_SOURCE_CONFIG,
  LOST_REASON_LABELS,
  type Lead,
  type LeadActivityType,
  type LeadActivity,
} from '~/types/crm'
import type { LeadScoreResult, ResponseTimeResult } from '~/types/analytics'

definePageMeta({ layout: 'crm', middleware: ['auth'] })

const route = useRoute()
const toast = useToast()
const lead = ref<Lead | null>(null)

// Dropdown data
const { locations, fetchLocations } = useLocations()
const { services, fetchDentalServices } = useDentalServices()

// Activities
const { getActivities, removeActivity } = useLeadActivities()
const activities = ref<LeadActivity[]>([])
const { scoreLead } = useLeadScoring()
const { getResponseTime } = useResponseTime()

// Plan v9 A2: Next-Best-Action Engine
const { compute: computeNBA } = useNextBestAction()
const recommendation = computed(() => computeNBA(lead.value))

// Aliasing für Timeline (gleiche Daten, expliziterer Name)
const allLeadActivities = computed(() => activities.value)

// Action-Handler für Quick-Buttons in NextBestActionCard
const onAction = (action: import('../../../composables/useNextBestAction').NextBestAction) => {
  switch (action.type) {
    case 'call':
      // TODO Phase B: CloudTalk Click-to-Call
      activityDialogType.value = 'call'
      activityDialogVisible.value = true
      break
    case 'email':
      emailDialogVisible.value = true
      break
    case 'sms':
    case 'whatsapp':
      activityDialogType.value = action.type
      activityDialogVisible.value = true
      break
    case 'book_meeting':
      appointmentDialogVisible.value = true
      break
    case 'send_hkp':
      emailDialogVisible.value = true // TODO Phase B: eigener HKP-Versand-Dialog
      toast.add({ severity: 'info', summary: 'HKP-Versand', detail: 'Öffnet E-Mail-Editor mit HKP-Template (Phase B)' })
      break
    case 'status_change':
      // Status-Dropdown im Status-Card scrollen
      document.getElementById('status-section')?.scrollIntoView({ behavior: 'smooth' })
      break
    case 'mark_no_show':
      onNoShow()
      break
    case 'mark_lost':
      onMarkLost()
      break
    case 'request_review':
      toast.add({ severity: 'info', summary: 'Review-Anfrage', detail: 'Brevo-Template wird vorgeladen (Phase D)' })
      break
    case 'reactivation':
      toast.add({ severity: 'info', summary: 'Reaktivierung', detail: 'Reactivation-Mail vorbereiten (Phase D)' })
      break
    case 'send_financing_info':
      toast.add({ severity: 'info', summary: 'Finanzierungs-Info', detail: 'Finanzierungs-PDF + Erläuterung (Phase D)' })
      break
    default:
      console.warn('Unhandled action type:', action.type)
  }
}

// Plan v9: State-Machine-validierte Folge-Status
const { getNextStatuses, canTransition } = useLeadStatusTransitions()
const allowedNextStatuses = computed(() => {
  if (!lead.value) return []
  return getNextStatuses(lead.value.status).filter((s) => s !== lead.value!.status)
})

const onStatusChange = async (newStatus: string) => {
  if (!lead.value) return
  if (newStatus === lead.value.status) return
  if (!canTransition(lead.value.status, newStatus as any)) {
    toast.add({
      severity: 'warn',
      summary: 'Status-Wechsel nicht erlaubt',
      detail: `${lead.value.status} → ${newStatus} ist gemäß State-Machine nicht möglich`,
    })
    return
  }
  saveField('status', newStatus)
  // last_status_change_at parallel updaten
  saveField('last_status_change_at', new Date().toISOString())
}

// Plan v9 A5: No-Show-Handler
const { markAsNoShow } = useNoShowAction()
const onNoShow = async () => {
  if (!lead.value) return
  if (!confirm(`No-Show für ${lead.value.first_name} ${lead.value.last_name} markieren?\nDas verschiebt den Status zurück + erhöht den No-Show-Counter.`)) return
  const updated = await markAsNoShow(lead.value)
  if (updated) {
    lead.value = updated
    await loadActivities()
    toast.add({ severity: 'success', summary: 'No-Show markiert', detail: `Status zurück zu "${updated.status}"` })
  }
}

const { updateLead } = usePatientLeads()
const onMarkLost = async () => {
  if (!lead.value) return
  const reason = prompt('Lost-Grund (z.B. too_expensive / no_response / competitor):', 'no_response')
  if (!reason) return
  const updated = await updateLead(lead.value.id, {
    status: 'lost',
    lost_reason: reason as any,
    last_status_change_at: new Date().toISOString(),
  })
  if (updated) {
    lead.value = { ...lead.value, ...updated }
    toast.add({ severity: 'success', summary: 'Als verloren markiert', detail: reason })
  }
}

const loadActivities = async () => {
  if (!lead.value) return
  activities.value = await getActivities(lead.value.id)
}

const leadScore = computed((): LeadScoreResult | null => {
  if (!lead.value) return null
  const allLeadsStore = usePatientLeads()
  const maxOV = Math.max(...(allLeadsStore.leads.value || []).map(l => l.oportunity_value || 0), lead.value.oportunity_value || 0, 1)
  return scoreLead(lead.value, activities.value, maxOV)
})

const responseTime = computed((): ResponseTimeResult | null => {
  if (!lead.value) return null
  return getResponseTime(lead.value, activities.value)
})

const activityDialogVisible = ref(false)
const activityDialogType = ref<LeadActivityType>('note')
const emailDialogVisible = ref(false)

// Appointments
const appointmentDialogVisible = ref(false)
const leadAppointmentsRef = ref<InstanceType<typeof import('~/components/crm/LeadAppointments.vue').default> | null>(null)

const onAppointmentSaved = () => {
  leadAppointmentsRef.value?.reload()
}

// Tags
const newTag = ref('')

// Computed helpers for relational FK ids
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

// Load data
const loadLead = async () => {
  const { fetchLead } = usePatientLeads()
  lead.value = await fetchLead(route.params.id as string)
  refreshActivities()
}

const refreshActivities = () => {
  activities.value = getActivities(route.params.id as string)
}

// Save field with error handling (for dropdowns/selects that use :value)
const saveField = async (field: string, value: any) => {
  if (!lead.value) return
  const previousValue = (lead.value as any)[field]
  try {
    const { updateLead } = usePatientLeads()
    await updateLead(lead.value.id, { [field]: value })
    ;(lead.value as any)[field] = value
  } catch (err) {
    // Revert
    ;(lead.value as any)[field] = previousValue
    toast.add({
      severity: 'error',
      summary: 'Fehler',
      detail: 'Speichern fehlgeschlagen',
      life: 3000,
    })
  }
}

// Save text field from blur event — captures value from DOM, reverts input on failure
const saveTextField = async (field: string, event: Event) => {
  if (!lead.value) return
  const input = event.target as HTMLInputElement | HTMLTextAreaElement
  const newValue = input.value
  const previousValue = (lead.value as any)[field]
  if (newValue === previousValue) return // No change
  try {
    const { updateLead } = usePatientLeads()
    await updateLead(lead.value.id, { [field]: newValue || null })
    ;(lead.value as any)[field] = newValue
  } catch (err) {
    // Revert the DOM input and local state
    input.value = previousValue || ''
    toast.add({
      severity: 'error',
      summary: 'Fehler',
      detail: 'Speichern fehlgeschlagen',
      life: 3000,
    })
  }
}

// Tags
const addTag = async () => {
  const tag = newTag.value.trim()
  if (!tag || !lead.value) return
  const previousTags = lead.value.Tags ? [...lead.value.Tags] : []
  const tags = [...previousTags, tag]
  lead.value.Tags = tags
  newTag.value = ''
  try {
    const { updateLead } = usePatientLeads()
    await updateLead(lead.value.id, { Tags: tags })
  } catch {
    lead.value.Tags = previousTags
    toast.add({ severity: 'error', summary: 'Fehler', detail: 'Speichern fehlgeschlagen', life: 3000 })
  }
}

const removeTag = async (index: number) => {
  if (!lead.value) return
  const previousTags = lead.value.Tags ? [...lead.value.Tags] : []
  const tags = [...previousTags]
  tags.splice(index, 1)
  lead.value.Tags = tags
  try {
    const { updateLead } = usePatientLeads()
    await updateLead(lead.value.id, { Tags: tags })
  } catch {
    lead.value.Tags = previousTags
    toast.add({ severity: 'error', summary: 'Fehler', detail: 'Speichern fehlgeschlagen', life: 3000 })
  }
}

// Activities
const openActivityDialog = (type: LeadActivityType) => {
  if (type === 'email') {
    emailDialogVisible.value = true
    return
  }
  activityDialogType.value = type
  activityDialogVisible.value = true
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
