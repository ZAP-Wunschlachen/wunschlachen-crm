<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <NuxtLink to="/crm/leads" class="text-[11px] text-gray-400 hover:text-gray-600 transition-colors font-medium">
          <i class="pi pi-arrow-left text-[9px] mr-0.5" />
          Leads
        </NuxtLink>
        <h2 v-if="lead" class="text-[16px] font-semibold text-gray-900 mt-0.5 flex items-center gap-2">
          {{ nursingHomeName }}
          <CrmLeadStatusBadge v-if="lead" :stage="lead.opportunity_stage" />
          <CrmGhostingRiskBadge
            v-if="lead && !activitiesLoading"
            :activities="leadActivities"
            :stage="lead.opportunity_stage"
          />
        </h2>
      </div>
      <div />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <i class="pi pi-spin pi-spinner text-xl text-gray-300" />
    </div>

    <!-- Content -->
    <div v-else-if="lead" class="grid grid-cols-1 lg:grid-cols-5 gap-4">

      <!-- LEFT: Comments + Activity -->
      <div class="lg:col-span-3 space-y-4">
        <div class="bg-white rounded-lg border border-gray-200/80 p-4">
          <h3 class="text-[12px] font-semibold text-gray-700 uppercase tracking-wider mb-3">Kommentare</h3>
          <CrmLeadTimeline collection="nursing_home_leads" :item-id="lead.id" />
        </div>
        <div class="bg-white rounded-lg border border-gray-200/80 p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-[12px] font-semibold text-gray-700 uppercase tracking-wider">Aktivitäten</h3>
          </div>
          <CrmActivityQuickActions class="mb-4" @action="openActivityDialog" />
          <CrmActivityFeed
            :activities="leadActivities"
            :loading="activitiesLoading"
            deletable
            @delete="handleDeleteActivity"
            @update="handleUpdateActivity"
          />
        </div>

        <!-- AI Call Briefing -->
        <CrmAiCallBriefing
          v-if="lead && !activitiesLoading"
          :lead="lead"
          :nursing-home="nursingHome"
          :contact="primaryContact"
          :activities="leadActivities"
        />

        <!-- Call Script Panel -->
        <CrmCallScriptPanel
          v-if="lead && !activitiesLoading"
          :lead="lead"
          :nursing-home="nursingHome"
          :contact="primaryContact"
          :activities="leadActivities"
          :lead-id="leadId"
          @set-follow-up="handleSetFollowUp"
          @open-email="emailComposeVisible = true"
          @saved="reloadActivities"
        />

        <!-- AI Summarize -->
        <CrmAiSummarizeButton
          v-if="lead && !activitiesLoading"
          :lead-id="leadId"
          :activities="leadActivities"
          :nursing-home="nursingHome"
          :lead="lead"
          class="bg-white rounded-lg border border-gray-200/80 p-4"
        />

        <!-- Next Lead Suggestion -->
        <CrmNextLeadSuggestion
          v-if="lead"
          :current-lead-id="leadId"
        />

        <!-- Documents -->
        <div class="bg-white rounded-lg border border-gray-200/80 p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-[12px] font-semibold text-gray-700 uppercase tracking-wider">Dokumente</h3>
            <button
              class="flex items-center gap-1 text-[10px] font-medium text-[#172774] hover:text-[#3d4a8e] transition-colors"
              @click="documentUploadVisible = true"
            >
              <i class="pi pi-plus text-[9px]" />
              Hochladen
            </button>
          </div>
          <CrmDocumentList
            :documents="leadDocuments"
            :loading="documentsLoading"
            deletable
            @delete="handleDeleteDocument"
          />
        </div>

        <!-- Activity Log Dialog -->
        <CrmActivityLogDialog
          v-model:visible="activityDialogVisible"
          :lead-id="leadId"
          :initial-type="activityDialogType"
          @saved="reloadActivities"
        />

        <!-- Email Compose Dialog -->
        <CrmEmailComposeDialog
          v-model:visible="emailComposeVisible"
          :lead-id="leadId"
          :contact="primaryContact"
          :nursing-home="nursingHome"
          @saved="reloadActivities"
        />

        <!-- Document Upload Dialog -->
        <CrmDocumentUploadDialog
          v-model:visible="documentUploadVisible"
          :lead-id="leadId"
          @uploaded="reloadDocuments"
        />

        <!-- Newsletter Dialog -->
        <CrmNewsletterDialog
          v-model:visible="newsletterDialogVisible"
          :lead-id="leadId"
          :contact="primaryContact"
          :nursing-home="nursingHome"
          @saved="reloadActivities"
        />

        <!-- Call Log Dialog (Placetel) -->
        <CrmCallLogDialog
          v-model:visible="callLogVisible"
          :lead-id="leadId"
          :contact-id="callLogContact?.id"
          :contact-name="callLogContact ? [callLogContact.first_name, callLogContact.last_name].filter(Boolean).join(' ') : ''"
          :phone-number="callLogPhone"
          @saved="reloadActivities"
        />
      </div>

      <!-- RIGHT: Details -->
      <div class="lg:col-span-2 space-y-3">

        <!-- Lead Status -->
        <div class="bg-white rounded-lg border border-gray-200/80 p-4">
          <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Status</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-[11px] text-gray-400 mb-0.5 font-medium">Stage</label>
              <select
                :value="lead.opportunity_stage"
                class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                @change="updateField('opportunity_stage', ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="stage in PIPELINE_STAGES" :key="stage" :value="stage">{{ stage }}</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] text-gray-400 mb-0.5 font-medium">Priorität</label>
              <select
                :value="lead.priority || ''"
                class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                @change="updateField('priority', ($event.target as HTMLSelectElement).value || null)"
              >
                <option value="">Keine</option>
                <option value="high">A (100+ Betten)</option>
                <option value="medium">B (50–100 Betten)</option>
                <option value="low">C (0–50 Betten)</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] text-gray-400 mb-0.5 font-medium">Follow-up</label>
              <input
                type="date"
                :value="lead.follow_up_date?.split('T')[0] || ''"
                class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                @change="updateField('follow_up_date', ($event.target as HTMLInputElement).value || null)"
              />
            </div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                :checked="lead.has_cooperation_partner"
                class="rounded border-gray-300 text-[#172774] focus:ring-[#172774]/30 w-3.5 h-3.5"
                @change="updateField('has_cooperation_partner', ($event.target as HTMLInputElement).checked)"
              />
              <span class="text-[12px] text-gray-600">Kooperationspartner</span>
            </label>
          </div>
          <Transition name="fade">
            <p v-if="saveMessage" class="mt-3 text-[11px] text-center" :class="saveError ? 'text-red-500' : 'text-green-600'">{{ saveMessage }}</p>
          </Transition>
        </div>

        <!-- AI Email Suggestion -->
        <CrmAiEmailSuggestion
          v-if="lead && !activitiesLoading"
          :lead="lead"
          :contact="primaryContact"
          :activities="leadActivities"
          @apply="handleEmailSuggestion"
        />

        <!-- Nursing Home -->
        <div v-if="nursingHome" class="bg-white rounded-lg border border-gray-200/80 p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pflegeheim</h3>
            <div class="flex items-center gap-1.5">
              <button
                v-if="!nhEditing"
                @click="nhEditing = true"
                class="text-[10px] text-[#172774] hover:text-[#3d4a8e] font-medium transition-colors"
              >
                <i class="pi pi-pencil text-[9px] mr-0.5" />
                Bearbeiten
              </button>
              <template v-else>
                <button
                  @click="saveNursingHome"
                  class="text-[10px] text-white bg-[#172774] hover:bg-[#3d4a8e] px-2 py-0.5 rounded font-medium transition-colors"
                >
                  Speichern
                </button>
                <button
                  @click="cancelNhEdit"
                  class="text-[10px] text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  Abbrechen
                </button>
              </template>
            </div>
          </div>

          <!-- View mode -->
          <div v-if="!nhEditing" class="space-y-1.5 text-[12px]">
            <CrmInfoRow label="Name" :value="nursingHome.name" />
            <CrmInfoRow label="Straße" :value="[nursingHome.Street, nursingHome.number].filter(Boolean).join(' ') || undefined" />
            <CrmInfoRow label="PLZ / Ort" :value="[nursingHome.zip, nursingHome.city].filter(Boolean).join(' ') || undefined" />
            <div class="flex items-center gap-2">
              <CrmInfoRow label="Telefon" :value="nursingHome.fone" link-type="tel" class="flex-1" />
              <CrmPhoneButton
                v-if="nursingHome.fone"
                :phone-number="nursingHome.fone"
                icon-only
                @dialing="() => { callLogPhone = nursingHome!.fone || ''; callLogContact = null; callLogVisible = true }"
              />
            </div>
            <CrmInfoRow label="E-Mail" :value="nursingHome.email" link-type="email" />
            <CrmInfoRow label="Website" :value="nursingHome.website" link-type="url" />
            <CrmInfoRow label="Betten" :value="nursingHome.total_capacity?.toString()" />
            <CrmInfoRow label="Entfernung" :value="nursingHome.distance_from_dental_office ? `${nursingHome.distance_from_dental_office} km` : undefined" />
            <CrmInfoRow label="Notizen" :value="nursingHome.notes" />
          </div>

          <!-- Edit mode -->
          <div v-else class="space-y-2.5">
            <div>
              <label class="block text-[11px] text-gray-400 mb-0.5 font-medium">Name</label>
              <input v-model="nhForm.name" type="text" class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40" />
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div class="col-span-2">
                <label class="block text-[11px] text-gray-400 mb-0.5 font-medium">Straße</label>
                <input v-model="nhForm.Street" type="text" class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40" />
              </div>
              <div>
                <label class="block text-[11px] text-gray-400 mb-0.5 font-medium">Nr.</label>
                <input v-model="nhForm.number" type="text" class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40" />
              </div>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block text-[11px] text-gray-400 mb-0.5 font-medium">PLZ</label>
                <input v-model="nhForm.zip" type="text" class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40" />
              </div>
              <div class="col-span-2">
                <label class="block text-[11px] text-gray-400 mb-0.5 font-medium">Ort</label>
                <input v-model="nhForm.city" type="text" class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40" />
              </div>
            </div>
            <div>
              <label class="block text-[11px] text-gray-400 mb-0.5 font-medium">Telefon</label>
              <input v-model="nhForm.fone" type="tel" class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40" />
            </div>
            <div>
              <label class="block text-[11px] text-gray-400 mb-0.5 font-medium">E-Mail</label>
              <input v-model="nhForm.email" type="email" class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40" />
            </div>
            <div>
              <label class="block text-[11px] text-gray-400 mb-0.5 font-medium">Website</label>
              <input v-model="nhForm.website" type="text" class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] text-gray-400 mb-0.5 font-medium">Betten</label>
                <input v-model.number="nhForm.total_capacity" type="number" class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40" />
              </div>
              <div>
                <label class="block text-[11px] text-gray-400 mb-0.5 font-medium">Entfernung (km)</label>
                <input v-model.number="nhForm.distance_from_dental_office" type="number" step="0.1" class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40" />
              </div>
            </div>
            <div>
              <label class="block text-[11px] text-gray-400 mb-0.5 font-medium">Notizen</label>
              <textarea v-model="nhForm.notes" rows="3" class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40 resize-none" />
            </div>
            <Transition name="fade">
              <p v-if="nhSaveMessage" class="text-[11px] text-center" :class="nhSaveError ? 'text-red-500' : 'text-green-600'">{{ nhSaveMessage }}</p>
            </Transition>
          </div>
        </div>

        <!-- Contacts -->
        <div class="bg-white rounded-lg border border-gray-200/80 p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Ansprechpartner</h3>
            <button
              @click="contactBarRef?.startAdd()"
              class="text-[10px] text-[#172774] hover:text-[#3d4a8e] font-medium transition-colors"
            >
              <i class="pi pi-plus text-[9px] mr-0.5" />
              Hinzufügen
            </button>
          </div>
          <CrmContactBar
            ref="contactBarRef"
            :contacts="contacts"
            :nursing-home-id="nursingHomeId || ''"
            :loading="contactsLoading"
            @email="handleContactEmail"
            @call="handleContactCall"
            @sms="(c) => openActivityDialog('sms')"
            @updated="reloadContacts"
          />
        </div>

        <!-- Location Map -->
        <CrmLeadLocationMap v-if="nursingHome" :nursing-home="nursingHome" />

        <!-- Nearby Map -->
        <CrmLeadNearbyMap v-if="lead && nursingHome" :current-lead="lead" :nursing-home="nursingHome" />

        <!-- Meta -->
        <div class="px-2 py-2 space-y-1 text-[10px] text-gray-400">
          <p>Erstellt {{ formatDate(lead.date_created) }} · Aktualisiert {{ formatDate(lead.date_updated) }}</p>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16">
      <p class="text-[13px] text-gray-400">Lead nicht gefunden</p>
      <NuxtLink to="/crm/leads" class="text-[12px] text-[#172774] hover:underline mt-1 inline-block">← Zurück</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { PIPELINE_STAGES } from '~/types/crm'
import type { NursingHome, NursingHomeLead, NursingHomeContact, CrmActivity, CrmDocument, ActivityType, Priority } from '~/types/crm'

definePageMeta({ layout: 'crm', middleware: 'auth' })

const route = useRoute()
const leadId = route.params.id as string
const { fetchLead, updateLead } = usePflegeheimLeads()
const { fetchContacts } = useContacts()
const { activities: leadActivities, fetchActivities, removeActivity, updateActivity } = useActivities()
const { documents: leadDocuments, fetchDocuments, removeDocument } = useDocuments()

const lead = ref<NursingHomeLead | null>(null)
const contacts = ref<NursingHomeContact[]>([])
const contactBarRef = ref<{ startAdd: () => void } | null>(null)
const loading = ref(true)
const contactsLoading = ref(true)
const activitiesLoading = ref(true)
const documentsLoading = ref(true)
const saveMessage = ref('')
const saveError = ref(false)
const activityDialogVisible = ref(false)
const activityDialogType = ref<ActivityType>('note')
const emailComposeVisible = ref(false)
const documentUploadVisible = ref(false)
const callLogVisible = ref(false)
const callLogContact = ref<NursingHomeContact | null>(null)
const callLogPhone = ref('')
const newsletterDialogVisible = ref(false)

// Nursing home editing
const nhEditing = ref(false)
const nhSaveMessage = ref('')
const nhSaveError = ref(false)
const nhForm = ref<Partial<NursingHome>>({})

const startNhEdit = () => {
  if (!nursingHome.value) return
  nhForm.value = { ...nursingHome.value }
  nhEditing.value = true
}

const cancelNhEdit = () => {
  nhEditing.value = false
  nhForm.value = {}
  nhSaveMessage.value = ''
}

watch(nhEditing, (val) => {
  if (val && nursingHome.value) {
    nhForm.value = { ...nursingHome.value }
  }
})

// Auto-priority based on bed count: 0-50 → C (low), 50-100 → B (medium), 100+ → A (high)
const getPriorityFromBeds = (beds?: number | null): Priority | null => {
  if (!beds || beds <= 0) return null
  if (beds > 100) return 'high'
  if (beds > 50) return 'medium'
  return 'low'
}

const saveNursingHome = async () => {
  if (!nursingHome.value || !lead.value) return
  nhSaveMessage.value = ''; nhSaveError.value = false

  try {
    // Update local state (nursing home is embedded in lead)
    if (typeof lead.value.nursing_home_id === 'object' && lead.value.nursing_home_id) {
      Object.assign(lead.value.nursing_home_id, nhForm.value)
    }

    // Persist via updateLead (works in both local and Directus mode)
    await updateLead(lead.value.id, { nursing_home_id: lead.value.nursing_home_id } as any)

    // Auto-assign priority based on bed count
    const autoPriority = getPriorityFromBeds(nhForm.value.total_capacity)
    if (autoPriority && autoPriority !== lead.value.priority) {
      await updateLead(lead.value.id, { priority: autoPriority })
      lead.value.priority = autoPriority
    }

    nhSaveMessage.value = 'Gespeichert'
    setTimeout(() => {
      nhEditing.value = false
      nhSaveMessage.value = ''
    }, 800)
  } catch {
    nhSaveError.value = true
    nhSaveMessage.value = 'Fehler beim Speichern'
    setTimeout(() => { nhSaveMessage.value = '' }, 2500)
  }
}

const openActivityDialog = (type: ActivityType) => {
  if (type === 'email_sent') {
    emailComposeVisible.value = true
    return
  }
  if (type === 'newsletter') {
    newsletterDialogVisible.value = true
    return
  }
  activityDialogType.value = type
  activityDialogVisible.value = true
}

const reloadActivities = async () => {
  activitiesLoading.value = true
  try { await fetchActivities(leadId) } catch {}
  finally { activitiesLoading.value = false }
}

const reloadContacts = async () => {
  if (!nursingHomeId.value) return
  contactsLoading.value = true
  try { contacts.value = await fetchContacts(nursingHomeId.value) } catch {}
  finally { contactsLoading.value = false }
}

const handleDeleteActivity = async (activity: CrmActivity) => {
  try { await removeActivity(activity.id) } catch { console.error('Failed to delete activity') }
}

const handleUpdateActivity = async (activity: CrmActivity, data: { subject?: string; content?: string; date?: string }) => {
  try { await updateActivity(activity.id, data) } catch { console.error('Failed to update activity') }
}

const reloadDocuments = async () => {
  documentsLoading.value = true
  try { await fetchDocuments(leadId) } catch {}
  finally { documentsLoading.value = false }
}

const handleDeleteDocument = async (doc: CrmDocument) => {
  try { await removeDocument(doc.id, leadId) } catch { console.error('Failed to delete document') }
}

const primaryContact = computed(() =>
  contacts.value.find(c => c.is_primary) || contacts.value[0] || null
)

const handleContactCall = (contact: NursingHomeContact) => {
  callLogContact.value = contact
  callLogPhone.value = contact.mobile || contact.phone || ''
  callLogVisible.value = true
}

const handleContactEmail = (contact: NursingHomeContact) => {
  emailComposeVisible.value = true
}

const handleEmailSuggestion = (suggestion: { subject: string; body: string; preview: string; category: string }) => {
  emailComposeVisible.value = true
}

const handleSetFollowUp = async (date: string) => {
  if (!lead.value) return
  await updateField('follow_up_date', date)
}

const nursingHome = computed<NursingHome | null>(() => {
  if (lead.value && typeof lead.value.nursing_home_id === 'object') return lead.value.nursing_home_id
  return null
})
const nursingHomeId = computed(() => nursingHome.value?.id || (typeof lead.value?.nursing_home_id === 'string' ? lead.value.nursing_home_id : null))
const nursingHomeName = computed(() => nursingHome.value?.name || '–')
const addressLine = computed(() => {
  if (!nursingHome.value) return undefined
  const nh = nursingHome.value
  const street = [nh.Street, nh.number].filter(Boolean).join(' ')
  const city = [nh.zip, nh.city].filter(Boolean).join(' ')
  return [street, city].filter(Boolean).join(', ') || undefined
})

const updateField = async (field: string, value: any) => {
  if (!lead.value) return
  saveMessage.value = ''; saveError.value = false
  try {
    await updateLead(lead.value.id, { [field]: value } as any)
    ;(lead.value as any)[field] = value
    saveMessage.value = 'Gespeichert'
    setTimeout(() => { saveMessage.value = '' }, 1500)
  } catch {
    saveError.value = true
    saveMessage.value = 'Fehler'
    setTimeout(() => { saveMessage.value = '' }, 2500)
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '–'
  try { return format(parseISO(dateStr), 'dd.MM.yy HH:mm', { locale: de }) } catch { return '–' }
}

onMounted(async () => {
  try {
    lead.value = await fetchLead(leadId)
    if (nursingHomeId.value) {
      contactsLoading.value = true
      contacts.value = await fetchContacts(nursingHomeId.value)
    }
  } catch { console.error('Failed to load lead') }
  finally { loading.value = false; contactsLoading.value = false }

  // Load activities and documents
  reloadActivities()
  reloadDocuments()
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
