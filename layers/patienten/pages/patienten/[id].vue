<template>
  <div class="p-6 max-w-5xl">
    <button
      class="flex items-center gap-1 text-sm text-dental-blue--2 hover:text-dental-blue-0 mb-4"
      @click="navigateTo('/patienten')"
    >
      <i class="pi pi-arrow-left text-xs" />
      Zurück zur Patientenliste
    </button>

    <div v-if="!lead" class="text-center text-dental-blue--3 py-12">
      <i class="pi pi-spin pi-spinner text-2xl" />
      <p class="mt-2 text-sm">Lade Patientendaten…</p>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-dental-blue-0">
            {{ lead.first_name }} {{ lead.last_name }}
          </h1>
          <p class="text-sm text-dental-blue--3 mt-0.5">
            Patient-ID: {{ lead.id }}
          </p>
        </div>
        <NuxtLink
          :to="`/patienten/leads/${lead.id}`"
          class="px-3 py-1.5 text-xs font-medium border border-dental-blue--5 rounded-lg text-dental-blue-0 hover:bg-dental-blue--6"
        >
          <i class="pi pi-chart-line text-[10px] mr-1" />
          Sales-Detail öffnen
        </NuxtLink>
      </div>

      <!-- Two-column grid: links Stammdaten, rechts Sidebar -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <!-- Kontaktdaten -->
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-sm font-semibold text-dental-blue-0">Kontaktdaten</h2>
              <button
                v-if="!editing"
                class="text-[11px] font-medium text-dental-blue-0 hover:underline"
                @click="startEdit"
              >
                <i class="pi pi-pencil text-[10px] mr-1" />Bearbeiten
              </button>
              <div v-else class="flex gap-2">
                <button
                  class="text-[11px] font-medium text-dental-blue--3 hover:text-dental-blue-0"
                  @click="cancelEdit"
                >
                  Abbrechen
                </button>
                <button
                  class="text-[11px] font-medium text-white bg-dental-blue-0 px-2 py-1 rounded hover:bg-dental-blue-1"
                  :disabled="saving"
                  @click="saveEdit"
                >
                  <i v-if="saving" class="pi pi-spin pi-spinner text-[10px] mr-1" />
                  {{ saving ? 'Speichern…' : 'Speichern' }}
                </button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs text-dental-blue--3">Vorname</label>
                <input v-model="form.first_name" :disabled="!editing" class="field-input" />
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">Nachname</label>
                <input v-model="form.last_name" :disabled="!editing" class="field-input" />
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">Telefon</label>
                <input v-model="form.phone" :disabled="!editing" class="field-input" type="tel" />
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">E-Mail</label>
                <input v-model="form.mail" :disabled="!editing" class="field-input" type="email" />
              </div>
            </div>
          </div>

          <!-- Patient-Info / Behandlung -->
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <h2 class="text-sm font-semibold text-dental-blue-0 mb-3">Behandlungs-Info</h2>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs text-dental-blue--3">Zahnärztliche Leistung</label>
                <p class="text-sm text-dental-blue-0 py-2">
                  {{ getServiceName(lead) || '—' }}
                </p>
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">Geplanter Behandlungswert</label>
                <p class="text-sm text-dental-blue-0 py-2 tabular-nums">
                  {{ lead.oportunity_value ? `${lead.oportunity_value} €` : '—' }}
                </p>
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">Standort</label>
                <p class="text-sm text-dental-blue-0 py-2">
                  {{ getLocationName(lead) || '—' }}
                </p>
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">Lead-Quelle</label>
                <p class="text-sm text-dental-blue-0 py-2">
                  {{ lead.lead_source || '—' }}
                </p>
              </div>
            </div>
            <div v-if="lead.message" class="mt-3 pt-3 border-t border-dental-blue--5">
              <label class="text-xs text-dental-blue--3">Anfrage-Nachricht</label>
              <p class="text-sm text-dental-blue-0 mt-1 whitespace-pre-wrap">{{ lead.message }}</p>
            </div>
          </div>

          <!-- Termine -->
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-sm font-semibold text-dental-blue-0">Termine</h2>
              <NuxtLink to="/patienten/termine" class="text-[11px] text-dental-blue-0 hover:underline">
                Alle Termine →
              </NuxtLink>
            </div>
            <div v-if="!appointments.length" class="text-sm text-dental-blue--3 py-3">
              Keine Termine für diesen Patienten.
            </div>
            <ul v-else class="divide-y divide-dental-blue--5">
              <li v-for="a in appointments" :key="a.id" class="py-2 flex items-center justify-between">
                <div>
                  <p class="text-sm text-dental-blue-0">
                    {{ formatDateTime(a.start_date_time) }}
                  </p>
                  <p class="text-[11px] text-dental-blue--3">
                    {{ a.calendar_column?.name || 'Praxis' }}
                  </p>
                </div>
                <span
                  class="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  :class="statusBadgeClass(a.attendance_status)"
                >
                  {{ statusLabel(a.attendance_status) }}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Sidebar: Stammdaten-Metadaten -->
        <aside class="space-y-4">
          <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <h3 class="text-xs font-semibold text-dental-blue--3 uppercase tracking-wider mb-2">
              Status
            </h3>
            <p class="text-sm text-dental-blue-0 font-medium">
              {{ statusLabelLead(lead.status) }}
            </p>
            <p class="text-[11px] text-dental-blue--3 mt-1">
              Tags:
              <span v-if="lead.Tags?.length">{{ lead.Tags.join(', ') }}</span>
              <span v-else>—</span>
            </p>
          </div>

          <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <h3 class="text-xs font-semibold text-dental-blue--3 uppercase tracking-wider mb-2">
              Zeitstempel
            </h3>
            <dl class="text-[11px] space-y-1">
              <div class="flex justify-between">
                <dt class="text-dental-blue--3">Erstellt</dt>
                <dd class="text-dental-blue-0">{{ formatDate(lead.date_created) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-dental-blue--3">Aktualisiert</dt>
                <dd class="text-dental-blue-0">{{ formatDate(lead.date_updated) }}</dd>
              </div>
              <div v-if="lead.follow_up" class="flex justify-between">
                <dt class="text-dental-blue--3">Follow-up</dt>
                <dd class="text-dental-blue-0">{{ formatDate(lead.follow_up) }}</dd>
              </div>
            </dl>
          </div>

          <NuxtLink
            :to="`/patienten/leads/${lead.id}`"
            class="block bg-dental-blue-0 text-white text-sm font-medium text-center py-2.5 rounded-lg hover:bg-dental-blue-1 transition-colors"
          >
            <i class="pi pi-chart-line text-xs mr-1.5" />
            Zur Sales-Detail
          </NuxtLink>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LEAD_STATUS_CONFIG, type Lead } from '~/types/crm'

definePageMeta({ layout: 'crm', middleware: 'auth' })

const route = useRoute()
const id = computed(() => route.params.id as string)

const { fetchLead, updateLead } = usePatientLeads()
const { fetchLeadAppointments } = useAppointments()

const lead = ref<Lead | null>(null)
const appointments = ref<any[]>([])
const editing = ref(false)
const saving = ref(false)
const form = reactive({
  first_name: '',
  last_name: '',
  phone: '',
  mail: '',
})

const loadLead = async () => {
  const result = await fetchLead(id.value)
  if (result) {
    lead.value = result
    Object.assign(form, {
      first_name: result.first_name || '',
      last_name: result.last_name || '',
      phone: result.phone || '',
      mail: result.mail || '',
    })
  }
  if (result?.id) {
    appointments.value = await fetchLeadAppointments(result.id)
  }
}

watch(id, loadLead, { immediate: true })

const startEdit = () => {
  editing.value = true
}
const cancelEdit = () => {
  editing.value = false
  if (lead.value) {
    Object.assign(form, {
      first_name: lead.value.first_name || '',
      last_name: lead.value.last_name || '',
      phone: lead.value.phone || '',
      mail: lead.value.mail || '',
    })
  }
}
const saveEdit = async () => {
  if (!lead.value) return
  saving.value = true
  try {
    await updateLead(lead.value.id, { ...form })
    Object.assign(lead.value, form)
    editing.value = false
  } finally {
    saving.value = false
  }
}

const getServiceName = (l: Lead) => {
  if (typeof l.dental_service === 'object' && l.dental_service) return l.dental_service.name
  return '—'
}
const getLocationName = (l: Lead) => {
  if (typeof l.location === 'object' && l.location) return l.location.name
  return '—'
}

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('de-DE') : '—'
const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })

// Nutzt zentrale LEAD_STATUS_CONFIG für Konsistenz
const statusLabelLead = (status?: string) => {
  if (!status) return '—'
  return LEAD_STATUS_CONFIG[status as keyof typeof LEAD_STATUS_CONFIG]?.label || status
}
const statusLabel = (s: string) => ({ scheduled: 'Geplant', attended: 'Erschienen', missed: 'Verpasst' }[s] || s)
const statusBadgeClass = (s: string) =>
  s === 'attended'
    ? 'bg-green-100 text-green-800'
    : s === 'missed'
      ? 'bg-red-100 text-red-700'
      : 'bg-blue-100 text-blue-800'
</script>
