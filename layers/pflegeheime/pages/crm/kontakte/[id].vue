<template>
  <div class="max-w-5xl">
    <!-- Back -->
    <button class="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4" @click="$router.back()">
      <i class="pi pi-arrow-left text-xs" />
      Zurück
    </button>

    <div v-if="loading" class="flex justify-center py-20">
      <i class="pi pi-spin pi-spinner text-2xl text-gray-300" />
    </div>

    <div v-else-if="!contact" class="text-center text-gray-400 py-12">
      <i class="pi pi-user-times text-[28px] block mb-2" />
      Kontakt nicht gefunden
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <div class="flex items-center gap-3">
          <div
            class="flex items-center justify-center w-12 h-12 rounded-full text-[14px] font-semibold flex-shrink-0"
            :class="contact.is_primary ? 'bg-[#172774]/10 text-[#172774]' : 'bg-gray-100 text-gray-500'"
          >
            {{ initials(contact) }}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-[18px] font-semibold text-gray-900">{{ fullName(contact) }}</h1>
              <span
                v-if="contact.is_primary"
                class="text-[10px] px-2 py-0.5 bg-[#172774]/10 text-[#172774] rounded-full font-semibold uppercase tracking-wide"
              >
                Primär
              </span>
            </div>
            <p v-if="contact.job_title" class="text-[12px] text-gray-500">{{ contact.job_title }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <a
            v-if="contact.email"
            :href="`mailto:${contact.email}`"
            class="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-500 bg-white border border-gray-200 rounded hover:bg-[#172774] hover:text-white hover:border-[#172774] transition-colors"
          >
            <i class="pi pi-envelope text-[11px]" />
            E-Mail
          </a>
          <a
            v-if="contact.phone || contact.mobile"
            :href="`tel:${contact.mobile || contact.phone}`"
            class="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-500 bg-white border border-gray-200 rounded hover:bg-[#172774] hover:text-white hover:border-[#172774] transition-colors"
          >
            <i class="pi pi-phone text-[11px]" />
            Anrufen
          </a>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- LEFT: Stammdaten -->
        <div class="lg:col-span-2 space-y-4">
          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <h2 class="text-[12px] font-semibold text-gray-800 mb-3">Stammdaten</h2>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-[11px] text-gray-400">Vorname</label>
                <input
                  :value="contact.first_name"
                  type="text"
                  class="field-input"
                  @blur="saveField('first_name', $event)"
                />
              </div>
              <div>
                <label class="text-[11px] text-gray-400">Nachname</label>
                <input
                  :value="contact.last_name"
                  type="text"
                  class="field-input"
                  @blur="saveField('last_name', $event)"
                />
              </div>
              <div>
                <label class="text-[11px] text-gray-400">Position</label>
                <input
                  :value="contact.job_title"
                  type="text"
                  class="field-input"
                  @blur="saveField('job_title', $event)"
                />
              </div>
              <div>
                <label class="text-[11px] text-gray-400">Primärkontakt</label>
                <select
                  :value="contact.is_primary ? '1' : '0'"
                  class="field-input bg-white"
                  @change="saveField('is_primary', ($event.target as HTMLSelectElement).value === '1')"
                >
                  <option value="0">Nein</option>
                  <option value="1">Ja</option>
                </select>
              </div>
              <div>
                <label class="text-[11px] text-gray-400">E-Mail</label>
                <input
                  :value="contact.email"
                  type="email"
                  class="field-input"
                  @blur="saveField('email', $event)"
                />
              </div>
              <div>
                <label class="text-[11px] text-gray-400">Telefon</label>
                <input
                  :value="contact.phone"
                  type="tel"
                  class="field-input"
                  @blur="saveField('phone', $event)"
                />
              </div>
              <div>
                <label class="text-[11px] text-gray-400">Mobil</label>
                <input
                  :value="contact.mobile"
                  type="tel"
                  class="field-input"
                  @blur="saveField('mobile', $event)"
                />
              </div>
            </div>
          </div>

          <!-- Aktionen (Notiz, Anruf-Log, etc.) -->
          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <h2 class="text-[12px] font-semibold text-gray-800 mb-3">Schnellaktionen</h2>
            <div class="grid grid-cols-3 gap-2">
              <a
                v-if="contact.email"
                :href="`mailto:${contact.email}`"
                class="flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-[#172774] hover:text-white hover:border-[#172774] transition-colors"
              >
                <i class="pi pi-envelope text-[11px]" />
                E-Mail
              </a>
              <a
                v-if="contact.phone"
                :href="`tel:${contact.phone}`"
                class="flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-[#172774] hover:text-white hover:border-[#172774] transition-colors"
              >
                <i class="pi pi-phone text-[11px]" />
                Festnetz
              </a>
              <a
                v-if="contact.mobile"
                :href="`tel:${contact.mobile}`"
                class="flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-[#172774] hover:text-white hover:border-[#172774] transition-colors"
              >
                <i class="pi pi-mobile text-[11px]" />
                Mobil
              </a>
              <a
                v-if="contact.mobile"
                :href="`https://wa.me/${cleanPhone(contact.mobile)}`"
                target="_blank"
                class="flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-[#22c55e] hover:text-white hover:border-[#22c55e] transition-colors"
              >
                <i class="pi pi-whatsapp text-[11px]" />
                WhatsApp
              </a>
              <a
                v-if="contact.mobile"
                :href="`sms:${contact.mobile}`"
                class="flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-[#172774] hover:text-white hover:border-[#172774] transition-colors"
              >
                <i class="pi pi-comment text-[11px]" />
                SMS
              </a>
            </div>
          </div>
        </div>

        <!-- RIGHT: Pflegeheim + Meta -->
        <div class="space-y-4">
          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <h2 class="text-[12px] font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
              <i class="pi pi-building text-[11px] text-gray-400" />
              Pflegeheim
            </h2>
            <div v-if="nursingHomeId" class="space-y-2">
              <NuxtLink
                :to="`/crm/heime/${nursingHomeId}`"
                class="block text-[13px] font-medium text-[#172774] hover:underline"
              >
                {{ nursingHomeName }}
              </NuxtLink>
              <p v-if="nursingHomeCity" class="text-[11px] text-gray-500">{{ nursingHomeCity }}</p>
              <div v-if="linkedLeadId" class="pt-2 mt-2 border-t border-gray-100">
                <NuxtLink
                  :to="`/crm/leads/${linkedLeadId}`"
                  class="flex items-center gap-1 text-[11px] text-gray-500 hover:text-[#172774]"
                >
                  <i class="pi pi-chart-line text-[10px]" />
                  Sales-Lead öffnen
                </NuxtLink>
              </div>
            </div>
            <p v-else class="text-[11px] text-gray-400 italic">Kein Pflegeheim verknüpft</p>
          </div>

          <div class="bg-white rounded-lg border border-gray-200 p-3 text-[11px] text-gray-400">
            <p>Kontakt-ID: <span class="font-mono">{{ contact.id }}</span></p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { NursingHomeContact } from '~/types/crm'
import { getLocalLeads } from '~/composables/usePflegeheimLeads'

definePageMeta({ layout: 'crm', middleware: 'auth' })

const route = useRoute()
const toast = useToast()
const { contacts, fetchAllContacts, editContact } = useContacts()

const loading = ref(true)

const contact = computed<NursingHomeContact | null>(() => {
  return contacts.value.find((c) => c.id === route.params.id) || null
})

const fullName = (c: NursingHomeContact) =>
  [c.first_name, c.last_name].filter(Boolean).join(' ') || '–'

const initials = (c: NursingHomeContact) => {
  const f = c.first_name?.[0] || ''
  const l = c.last_name?.[0] || ''
  return (f + l).toUpperCase() || '?'
}

const cleanPhone = (p?: string) => (p || '').replace(/[^0-9]/g, '')

const nursingHomeId = computed<string | null>(() => {
  if (!contact.value) return null
  const nh = contact.value.nursing_home_id
  if (typeof nh === 'object' && nh) return nh.id
  if (typeof nh === 'string') return nh
  return null
})

const nursingHomeName = computed(() => {
  if (!contact.value) return ''
  const nh = contact.value.nursing_home_id
  if (typeof nh === 'object' && nh) return nh.name || '–'
  return '–'
})

const nursingHomeCity = computed(() => {
  if (!contact.value) return ''
  const nh = contact.value.nursing_home_id
  if (typeof nh === 'object' && nh) return nh.city || ''
  return ''
})

// Optional: Link zum bestehenden Lead (falls dieser Kontakt zu einem Heim mit aktivem Lead gehört)
const linkedLeadId = ref<string | null>(null)
const loadLinkedLead = () => {
  if (!nursingHomeId.value) {
    linkedLeadId.value = null
    return
  }
  try {
    const leads = getLocalLeads()
    const match = leads.find((l) => {
      const nh = typeof l.nursing_home_id === 'object'
        ? (l.nursing_home_id as any)?.id
        : l.nursing_home_id
      return nh === nursingHomeId.value
    })
    linkedLeadId.value = match?.id || null
  } catch {
    linkedLeadId.value = null
  }
}

const saveField = async (field: keyof NursingHomeContact, eventOrValue: Event | any) => {
  if (!contact.value) return
  const value =
    eventOrValue instanceof Event ? (eventOrValue.target as HTMLInputElement).value : eventOrValue
  if (value === contact.value[field]) return
  try {
    await editContact(contact.value.id, { [field]: value } as Partial<NursingHomeContact>)
    toast.add({ severity: 'success', summary: 'Gespeichert', detail: `${field} aktualisiert`, life: 2000 })
  } catch (e) {
    console.error('Save failed:', e)
    toast.add({ severity: 'error', summary: 'Fehler', detail: 'Speichern fehlgeschlagen', life: 3000 })
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await fetchAllContacts()
    loadLinkedLead()
  } finally {
    loading.value = false
  }
})

watch(nursingHomeId, () => loadLinkedLead())
</script>
