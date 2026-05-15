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

      <!-- 💰 Revenue-Banner (Modul G) -->
      <div v-if="lead.status === 'completed' && !lead.revenue" class="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-amber-600 text-lg" />
        <div class="flex-1">
          <p class="text-sm font-semibold text-amber-900">Behandlung abgeschlossen — bitte Umsatz eintragen</p>
          <p class="text-[11px] text-amber-700">Für Reporting + Lead-Source-Analyse</p>
        </div>
        <input
          :value="lead.revenue || ''"
          type="number"
          placeholder="0.00 €"
          class="field-input w-32 bg-white"
          @blur="saveField('revenue', Number(($event.target as HTMLInputElement).value) || null)"
        />
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
            <PatientenActivityQuickActions class="mb-4" @select="openActivityDialog" @book="openKalenderForBooking" />
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

            <!-- Termin verschoben — separat zu „Verloren", damit Krankheits-Absage nicht zum Lost-Status führt -->
            <button
              v-if="canRescheduleStatus"
              type="button"
              class="mt-2 w-full px-3 py-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors"
              @click="openRescheduleDialog"
            >
              <i class="pi pi-clock text-[10px] mr-1" />
              Termin verschoben (statt Verloren)
            </button>
            <p v-if="lead.reschedule_count && lead.reschedule_count > 0" class="text-[10px] text-dental-blue--3 mt-1">
              Verschoben: {{ lead.reschedule_count }}× · letzter Grund: {{ lead.last_reschedule_reason ? RESCHEDULE_REASON_LABELS[lead.last_reschedule_reason] : '—' }}
            </p>
          </div>

          <!-- Anruf-Rotation (Plan v9 Modul B MVP) -->
          <div v-if="lead.status === 'new' || lead.status === 'contacting' || lead.status === 'contacted'"
            class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <h2 class="text-sm font-semibold text-dental-blue-0 mb-2">Anruf-Rotation</h2>
            <div class="flex gap-2 mb-2">
              <button class="flex-1 px-3 py-1.5 text-[11px] font-medium text-white bg-green-600 hover:bg-green-700 rounded transition-colors" @click="onCallSuccess">
                <i class="pi pi-check text-[10px] mr-1" /> Erreicht
              </button>
              <button class="flex-1 px-3 py-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors" @click="onCallFailed">
                <i class="pi pi-times text-[10px] mr-1" /> Nicht erreicht
              </button>
            </div>
            <p v-if="lead.call_attempt_count" class="text-[10px] text-dental-blue--3">
              Versuche: {{ lead.call_attempt_count }}
              <span v-if="lead.next_call_slot_at" class="ml-2">· nächster Slot: {{ formatCallDateTime(lead.next_call_slot_at) }}</span>
              <span v-if="lead.successful_call_window" class="ml-2 italic">· erfolgreich: {{ lead.successful_call_window }}</span>
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
          <PatientenEngagementStatsCard :activities="activities" :lead="lead" />

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
            @create="openKalenderForBooking"
          />

          <!-- HKP-Sub-State (nur bei status='hkp_sent', Plan v9 Phase E) -->
          <div v-if="lead.status === 'hkp_sent'" class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <div class="flex items-start justify-between mb-2">
              <h2 class="text-sm font-semibold text-dental-blue-0">HKP-Sub-Status</h2>
              <span
                v-if="lead.hkp_substate"
                class="text-[10px] font-medium px-2 py-0.5 rounded-full"
                :style="{
                  color: HKP_SUBSTATE_CONFIG[lead.hkp_substate]?.color,
                  backgroundColor: HKP_SUBSTATE_CONFIG[lead.hkp_substate]?.bgColor,
                }"
              >
                {{ HKP_SUBSTATE_CONFIG[lead.hkp_substate]?.label }}
              </span>
            </div>
            <select
              :value="lead.hkp_substate || ''"
              class="field-input bg-white"
              @change="saveField('hkp_substate', ($event.target as HTMLSelectElement).value || null)"
            >
              <option value="">— Nicht gesetzt —</option>
              <option v-for="(cfg, key) in HKP_SUBSTATE_CONFIG" :key="key" :value="key">{{ cfg.label }}</option>
            </select>
            <p v-if="lead.hkp_substate" class="text-[10px] text-dental-blue--3 mt-1.5">
              <i class="pi pi-info-circle text-[9px] mr-0.5" />
              {{ HKP_SUBSTATE_CONFIG[lead.hkp_substate]?.hint }}
            </p>
            <p v-if="lead.hkp_substate" class="text-[10px] text-dental-blue--3 mt-0.5">
              Nachfass empfohlen in {{ HKP_SUBSTATE_CONFIG[lead.hkp_substate]?.followup_days }} Tagen
            </p>
          </div>

          <!-- HKP-Upload-Fallback (Modul F MVP) -->
          <div v-if="lead.status === 'hkp_sent'" class="bg-white rounded-lg p-4 border border-dental-blue--5">
            <h2 class="text-sm font-semibold text-dental-blue-0 mb-2">HKP unterschrieben hochladen</h2>
            <input type="file" accept="application/pdf" class="text-[11px]" @change="onHkpUpload" />
            <p class="text-[10px] text-dental-blue--3 mt-1">Fallback wenn die n8n-Postbox-Ingest nicht greift</p>
          </div>

          <!-- Lost reason + Reactivation (cancelled only) -->
          <div v-if="lead.status === 'lost'" class="bg-white rounded-lg p-4 border border-dental-blue--5 space-y-3">
            <div>
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

            <!-- Reactivation-Strategie + Button -->
            <div class="pt-3 border-t border-dental-blue--5">
              <div class="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 class="text-[12px] font-semibold text-dental-blue-0">Reaktivierung</h3>
                  <p class="text-[11px] text-dental-blue--3 mt-0.5">
                    Strategie: <strong>{{ reactivationStrategy.label }}</strong>
                  </p>
                  <p class="text-[10px] text-dental-blue--3 mt-0.5">{{ reactivationStrategy.approach }}</p>
                  <p v-if="reactivationDueText" class="text-[10px] text-dental-blue--3 mt-1 italic">
                    {{ reactivationDueText }}
                  </p>
                </div>
              </div>
              <button
                class="w-full px-3 py-2 text-[12px] font-medium text-white bg-[#22c55e] rounded hover:bg-[#16a34a] transition-colors disabled:opacity-50"
                :disabled="reactivationRunning"
                @click="onReactivateNow"
              >
                <i v-if="reactivationRunning" class="pi pi-spin pi-spinner text-[11px] mr-1" />
                <i v-else class="pi pi-refresh text-[11px] mr-1" />
                Jetzt reaktivieren
              </button>
            </div>

            <!-- Lead zurückholen — Fehlklicks rückgängig machen (springt zum Status vor Lost zurück) -->
            <div v-if="rollbackTarget" class="pt-3 border-t border-dental-blue--5">
              <button
                type="button"
                class="w-full px-3 py-1.5 text-[11px] font-medium text-dental-blue-0 bg-white hover:bg-dental-blue--5 border border-dental-blue--4 rounded transition-colors disabled:opacity-50"
                :disabled="rollbackRunning"
                @click="onRollbackFromLost"
              >
                <i v-if="rollbackRunning" class="pi pi-spin pi-spinner text-[10px] mr-1" />
                <i v-else class="pi pi-undo text-[10px] mr-1" />
                Lead zurückholen → {{ LEAD_STATUS_CONFIG[rollbackTarget]?.label }}
              </button>
              <p class="text-[10px] text-dental-blue--3 mt-1 italic">
                Macht den letzten „Verloren"-Wechsel rückgängig (Fehlklick-Rettung).
              </p>
            </div>
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

    <!-- Quick-Send-Dialog für NBA-Actions mit Template -->
    <PatientenQuickSendDialog
      v-model:visible="quickSendVisible"
      :lead="lead"
      :channel="quickSendChannel"
      :label="quickSendLabel"
      :template-id="quickSendTemplateId"
      @sent="loadActivities"
    />

    <!-- Reschedule-Dialog -->
    <div
      v-if="rescheduleDialogVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      @click.self="closeRescheduleDialog"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-4">
        <div>
          <h3 class="text-base font-semibold text-dental-blue-0 flex items-center gap-2">
            <i class="pi pi-clock text-amber-500" />
            Termin verschoben
          </h3>
          <p class="text-[11px] text-dental-blue--3 mt-1" v-if="lead">
            Status springt zurück: <strong>{{ LEAD_STATUS_CONFIG[lead.status]?.label }}</strong>
            → <strong>{{ rescheduleFallbackLabel }}</strong>. Lead bleibt im Funnel.
          </p>
        </div>
        <div>
          <label class="text-[11px] font-medium text-dental-blue-0 mb-1 block">Grund</label>
          <select v-model="rescheduleReason" class="field-input bg-white">
            <option v-for="(label, key) in RESCHEDULE_REASON_LABELS" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
        <div>
          <label class="text-[11px] font-medium text-dental-blue-0 mb-1 block">Wiedervorlage in (Tagen)</label>
          <input v-model.number="rescheduleDays" type="number" min="1" max="90" class="field-input bg-white" />
          <p class="text-[10px] text-dental-blue--3 mt-1">Setzt Follow-up-Datum auf {{ rescheduleFollowupPreview }}.</p>
        </div>
        <div>
          <label class="text-[11px] font-medium text-dental-blue-0 mb-1 block">Notiz (optional)</label>
          <textarea v-model="rescheduleNote" rows="2" class="field-input bg-white" placeholder="z.B. Patient ruft selbst zurück sobald genesen" />
        </div>
        <div class="flex gap-2 pt-2">
          <button
            type="button"
            class="flex-1 px-3 py-2 text-[12px] font-medium text-dental-blue-0 bg-white hover:bg-dental-blue--5 border border-dental-blue--4 rounded transition-colors"
            :disabled="rescheduleRunning"
            @click="closeRescheduleDialog"
          >
            Abbrechen
          </button>
          <button
            type="button"
            class="flex-1 px-3 py-2 text-[12px] font-medium text-white bg-amber-500 hover:bg-amber-600 rounded transition-colors disabled:opacity-50"
            :disabled="rescheduleRunning"
            @click="confirmReschedule"
          >
            <i v-if="rescheduleRunning" class="pi pi-spin pi-spinner text-[11px] mr-1" />
            <i v-else class="pi pi-check text-[11px] mr-1" />
            Bestätigen
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <Toast position="bottom-right" />
  </div>
</template>

<script setup lang="ts">


import {
  LEAD_STATUS_CONFIG,
  LEAD_SOURCE_CONFIG,
  LOST_REASON_LABELS,
  RESCHEDULE_REASON_LABELS,
  HKP_SUBSTATE_CONFIG,
  type Lead,
  type LeadActivityType,
  type LeadActivity,
  type RescheduleReason,
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

// Plan v9 Modul C: bei Sync-Update (Cron oder Realtime) Activities + Termine reladen
watch(() => lead.value?.last_appointment_synced_at, async (val, oldVal) => {
  if (!val || val === oldVal) return
  await loadActivities()
  leadAppointmentsRef.value?.reload?.()
})

// Aliasing für Timeline (gleiche Daten, expliziterer Name)
const allLeadActivities = computed(() => activities.value)

// Plan v9 Phase E: Lost-Lead-Reaktivierung
const { getStrategy, reactivate } = useReactivationQueue()
const reactivationRunning = ref(false)
const reactivationStrategy = computed(() => {
  if (!lead.value) return { label: '—', approach: '', template_id: '', reason: 'other' as const }
  return getStrategy(lead.value)
})
const reactivationDueText = computed(() => {
  if (!lead.value?.reactivation_due_at) return null
  const due = new Date(lead.value.reactivation_due_at).getTime()
  const days = Math.round((due - Date.now()) / (1000 * 60 * 60 * 24))
  if (days > 0) return `Vorgesehen ab ${days} Tag${days === 1 ? '' : 'en'}`
  if (days === 0) return 'Heute fällig'
  return `Fällig seit ${Math.abs(days)} Tag${Math.abs(days) === 1 ? '' : 'en'}`
})

const onReactivateNow = async () => {
  if (!lead.value || reactivationRunning.value) return
  if (!confirm(`Lead ${lead.value.first_name} ${lead.value.last_name} jetzt reaktivieren?\nStatus springt zurück zu "contacting".`)) return
  reactivationRunning.value = true
  try {
    const result = await reactivate(lead.value)
    if (result) {
      lead.value = result
      await refreshActivities()
      toast.add({
        severity: 'success',
        summary: 'Lead reaktiviert',
        detail: `Strategie: ${reactivationStrategy.value.label}`,
      })
    }
  } catch (e) {
    console.error('Reactivation failed:', e)
    toast.add({ severity: 'error', summary: 'Fehler', detail: 'Reaktivierung fehlgeschlagen' })
  } finally {
    reactivationRunning.value = false
  }
}

// QuickSend: NBA-Quick-Actions mit template_id öffnen den QuickSendDialog
// statt des generischen Aktivitäts-Dialogs.
const quickSendVisible = ref(false)
const quickSendChannel = ref<'email' | 'sms' | 'whatsapp'>('email')
const quickSendLabel = ref('')
const quickSendTemplateId = ref<string | undefined>(undefined)

const openQuickSend = (channel: 'email' | 'sms' | 'whatsapp', label: string, templateId?: string) => {
  quickSendChannel.value = channel
  quickSendLabel.value = label
  quickSendTemplateId.value = templateId
  quickSendVisible.value = true
}

// Action-Handler für Quick-Buttons in NextBestActionCard
const onAction = (action: import('../../../composables/useNextBestAction').NextBestAction) => {
  switch (action.type) {
    case 'call':
      // TODO Phase B: CloudTalk Click-to-Call
      activityDialogType.value = 'call'
      activityDialogVisible.value = true
      break
    case 'email':
      // Mit template_id: QuickSend mit vorgefülltem Inhalt. Ohne: freier Compose-Dialog.
      if (action.template_id) openQuickSend('email', action.label, action.template_id)
      else emailDialogVisible.value = true
      break
    case 'sms':
    case 'whatsapp':
      if (action.template_id) openQuickSend(action.type, action.label, action.template_id)
      else { activityDialogType.value = action.type; activityDialogVisible.value = true }
      break
    case 'book_meeting':
      openKalenderForBooking()
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
const {
  getNextStatuses,
  canTransition,
  defaultReactivationDate,
  canReschedule,
  getRescheduleFallback,
  getRollbackTargetFromActivities,
} = useLeadStatusTransitions()
const { addActivity } = useLeadActivities()
const allowedNextStatuses = computed(() => {
  if (!lead.value) return []
  return getNextStatuses(lead.value.status).filter((s) => s !== lead.value!.status)
})

const canRescheduleStatus = computed(() => !!lead.value && canReschedule(lead.value.status))
const rescheduleFallbackLabel = computed(() => {
  if (!lead.value) return ''
  const fb = getRescheduleFallback(lead.value.status)
  return fb ? LEAD_STATUS_CONFIG[fb]?.label || fb : ''
})

// Rollback-Ziel aus Activity-Log (für „Lead zurückholen" wenn status='lost')
const rollbackTarget = computed(() => {
  if (!lead.value || lead.value.status !== 'lost') return null
  return getRollbackTargetFromActivities(activities.value as any)
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
  const fromStatus = lead.value.status
  const now = new Date().toISOString()
  saveField('status', newStatus)
  saveField('last_status_change_at', now)

  // Plan v9: Audit-Trail in Timeline
  try {
    addActivity({
      lead_id: lead.value.id,
      type: 'stage_change',
      subject: `Status-Wechsel: ${LEAD_STATUS_CONFIG[fromStatus]?.label} → ${LEAD_STATUS_CONFIG[newStatus as keyof typeof LEAD_STATUS_CONFIG]?.label}`,
      content: `Manuell durch ${getCurrentUserNameForActivity()}`,
      metadata: { from_status: fromStatus, to_status: newStatus as any },
      date_created: now,
    } as any)
    await loadActivities()
  } catch (e) {
    console.warn('Status-Change-Activity-Log fehlgeschlagen:', e)
  }
}

const getCurrentUserNameForActivity = (): string => {
  const u = useState<any>('auth.user').value
  if (!u) return 'System'
  return `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'System'
}

// Plan v9 Iter2: Reschedule-Handler — Termin proaktiv verschoben (≠ Lost)
const { markAsRescheduled } = useRescheduleAction()
const rescheduleDialogVisible = ref(false)
const rescheduleReason = ref<RescheduleReason>('illness')
const rescheduleDays = ref(14)
const rescheduleNote = ref('')
const rescheduleRunning = ref(false)
const rescheduleFollowupPreview = computed(() => {
  const days = Math.max(1, Math.min(90, rescheduleDays.value || 14))
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('de-DE')
})

const openRescheduleDialog = () => {
  rescheduleReason.value = 'illness'
  rescheduleDays.value = 14
  rescheduleNote.value = ''
  rescheduleDialogVisible.value = true
}
const closeRescheduleDialog = () => {
  if (rescheduleRunning.value) return
  rescheduleDialogVisible.value = false
}
const confirmReschedule = async () => {
  if (!lead.value || rescheduleRunning.value) return
  rescheduleRunning.value = true
  try {
    const updated = await markAsRescheduled(lead.value, rescheduleReason.value, {
      followUpDays: rescheduleDays.value,
      note: rescheduleNote.value || undefined,
    })
    if (updated) {
      lead.value = { ...lead.value, ...updated }
      await loadActivities()
      toast.add({
        severity: 'success',
        summary: 'Termin verschoben',
        detail: `Status zurück zu "${LEAD_STATUS_CONFIG[updated.status]?.label}" · Follow-up gesetzt`,
      })
      rescheduleDialogVisible.value = false
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Verschiebung nicht möglich',
        detail: 'Dieser Status erlaubt keine Termin-Verschiebung',
      })
    }
  } catch (e) {
    console.error('[reschedule] failed:', e)
    toast.add({ severity: 'error', summary: 'Fehler', detail: 'Verschiebung fehlgeschlagen' })
  } finally {
    rescheduleRunning.value = false
  }
}

// Plan v9 Iter2: Lead aus 'lost' zurückholen (Fehlklick-Rettung)
const rollbackRunning = ref(false)
const onRollbackFromLost = async () => {
  if (!lead.value || rollbackRunning.value) return
  const target = rollbackTarget.value
  if (!target) return
  if (!confirm(`Lead "${lead.value.first_name} ${lead.value.last_name}" zurückholen?\nStatus springt von "Verloren" zurück auf "${LEAD_STATUS_CONFIG[target]?.label}".`)) return
  rollbackRunning.value = true
  try {
    const now = new Date().toISOString()
    const updated = await updateLead(lead.value.id, {
      status: target,
      lost_reason: null as any,
      reactivation_due_at: null as any,
      last_status_change_at: now,
    })
    if (updated) {
      lead.value = { ...lead.value, ...updated }
      try {
        await addActivity({
          lead_id: lead.value.id,
          type: 'lost_rollback',
          subject: `Lead zurückgeholt: Verloren → ${LEAD_STATUS_CONFIG[target]?.label}`,
          content: `Manuell durch ${getCurrentUserNameForActivity()} — Fehlklick-Rettung`,
          metadata: { from_status: 'lost', to_status: target },
          date_created: now,
        } as any)
        await loadActivities()
      } catch (e) {
        console.warn('Rollback-Activity-Log fehlgeschlagen:', e)
      }
      toast.add({
        severity: 'success',
        summary: 'Lead zurückgeholt',
        detail: `Status: ${LEAD_STATUS_CONFIG[target]?.label}`,
      })
    }
  } catch (e) {
    console.error('[lost-rollback] failed:', e)
    toast.add({ severity: 'error', summary: 'Fehler', detail: 'Rückholen fehlgeschlagen' })
  } finally {
    rollbackRunning.value = false
  }
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
    reactivation_due_at: defaultReactivationDate(),
  })
  if (updated) {
    lead.value = { ...lead.value, ...updated }
    toast.add({
      severity: 'success',
      summary: 'Als verloren markiert',
      detail: `${reason} · Reaktivierung in 90 Tagen vorgemerkt`,
    })
  }
}

// Plan v9 Modul B: Smart-Callback-Rotation
const { classifySlot, nextRetrySlot, shouldFailover } = useCallbackScheduler()

const formatCallDateTime = (iso: string) => new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

const onCallSuccess = async () => {
  if (!lead.value) return
  const now = new Date()
  const slot = classifySlot(now)
  await saveField('last_call_attempt_at', now.toISOString())
  if (slot) await saveField('successful_call_window', slot)
  await saveField('next_call_slot_at', null)
  try {
    await addActivity({
      lead_id: lead.value.id,
      type: 'call',
      subject: 'Patient erreicht',
      content: `Slot: ${slot || 'außerhalb Geschäftszeit'}`,
      direction: 'outbound',
      outcome: 'successful',
      metadata: { call_slot: slot },
      date_created: now.toISOString(),
    } as any)
    await loadActivities()
  } catch (e) { console.warn(e) }
  toast.add({ severity: 'success', summary: 'Erreicht', detail: slot ? `Slot ${slot} als erfolgreich markiert` : 'Erfolgreich' })
}

const onCallFailed = async () => {
  if (!lead.value) return
  const now = new Date()
  const attempts = (lead.value.call_attempt_count || 0) + 1
  await saveField('last_call_attempt_at', now.toISOString())
  await saveField('call_attempt_count', attempts)
  const failover = shouldFailover({ ...lead.value, call_attempt_count: attempts } as any)
  const nextSlot = nextRetrySlot({ ...lead.value, call_attempt_count: attempts, last_call_attempt_at: now.toISOString() } as any, now)
  await saveField('next_call_slot_at', nextSlot ? nextSlot.toISOString() : null)
  try {
    await addActivity({
      lead_id: lead.value.id,
      type: 'call',
      subject: failover ? `Nicht erreicht (Versuch ${attempts}, Failover SMS+Email)` : `Nicht erreicht (Versuch ${attempts})`,
      content: nextSlot ? `Nächster Slot: ${nextSlot.toLocaleString('de-DE')}` : 'Keine weiteren Versuche geplant',
      direction: 'outbound',
      outcome: 'no_contact',
      metadata: { call_slot: classifySlot(now), next_slot: nextSlot?.toISOString() },
      date_created: now.toISOString(),
    } as any)
    await loadActivities()
  } catch (e) { console.warn(e) }
  toast.add({ severity: 'warn', summary: 'Nicht erreicht', detail: nextSlot ? `Wiedervorlage: ${nextSlot.toLocaleString('de-DE')}` : 'Keine weiteren Versuche' })
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
const leadAppointmentsRef = ref<InstanceType<typeof import('~/components/crm/LeadAppointments.vue').default> | null>(null)

/**
 * Termin-Buchung im Kalender (Plan v9 Modul C+D — Deep-Link statt Nachbau).
 * Kopiert Lead-Daten ins Clipboard für schnelles Einfügen im Kalender,
 * öffnet anschließend den Kalender im neuen Tab. Der Kalender ist Source-of-
 * Truth für Verfügbarkeiten + Patient-Anlage; unser Sync zieht den Termin
 * danach via WebSocket/Cron automatisch ins Lead.
 */
const openKalenderForBooking = async () => {
  if (!lead.value) return
  const kalenderUrl = (useRuntimeConfig().public.kalenderUrl as string) || 'https://kalender.wunschlachen.app'
  const fullName = `${lead.value.first_name || ''} ${lead.value.last_name || ''}`.trim()
  const lines = [
    fullName,
    lead.value.mail || '',
    lead.value.phone || '',
  ].filter(Boolean).join('\n')

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(lines)
      toast.add({
        severity: 'info',
        summary: 'Lead-Daten in Zwischenablage',
        detail: `${fullName} · ${lead.value.mail || lead.value.phone || ''} — im Kalender einfügen. Email muss matchen, sonst kein Auto-Sync!`,
        life: 7000,
      })
    }
  } catch (e) {
    // Clipboard kann z.B. ohne HTTPS-Permission fehlschlagen — kein Blocker
    console.warn('[kalender] clipboard write failed:', e)
  }

  window.open(kalenderUrl, '_blank', 'noopener,noreferrer')
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

// HKP-Upload-Fallback (Modul F MVP)
const onHkpUpload = async (e: Event) => {
  if (!lead.value) return
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async () => {
    const base64 = (reader.result as string).split(',')[1] || ''
    try {
      await $fetch('/api/leads/match-and-attach-hkp', {
        method: 'POST',
        headers: { 'x-hkp-ingest-secret': 'manual-upload-token' },
        body: {
          patient_number: lead.value?.patient_number,
          sender_email: lead.value?.mail,
          pdf_base64: base64,
          pdf_filename: file.name,
        },
      })
      toast.add({ severity: 'success', summary: 'HKP hochgeladen', detail: 'Status auf hkp_signed gesetzt' })
      await loadLead()
    }
    catch (err: any) {
      toast.add({ severity: 'error', summary: 'Upload fehlgeschlagen', detail: err?.message || String(err) })
    }
  }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.field-input {
  @apply w-full px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0;
}
</style>
