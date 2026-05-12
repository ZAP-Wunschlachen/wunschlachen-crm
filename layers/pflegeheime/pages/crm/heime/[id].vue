<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <button
        @click="$router.back()"
        class="text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        <i class="pi pi-arrow-left text-xs mr-1" />
        Zurück
      </button>
      <h2 v-if="heim" class="text-xl font-semibold text-gray-900 mt-1">
        {{ heim.name }}
      </h2>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <i class="pi pi-spin pi-spinner text-2xl text-gray-300" />
    </div>

    <!-- Content -->
    <div v-else-if="heim" class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Stammdaten -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Stammdaten</h3>
        <div class="space-y-3 text-sm">
          <CrmInfoRow label="Name" :value="heim.name" />
          <CrmInfoRow label="Adresse" :value="addressLine" />
          <CrmInfoRow label="Telefon" :value="heim.fone" link-type="tel" />
          <CrmInfoRow label="E-Mail" :value="heim.email" link-type="email" />
          <CrmInfoRow label="Website" :value="heim.website" link-type="url" />
        </div>
      </div>

      <!-- Betriebsdaten -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Betriebsdaten</h3>
        <div class="space-y-3 text-sm">
          <CrmInfoRow label="Betten" :value="heim.total_capacity?.toString()" />
          <CrmInfoRow label="Entfernung" :value="heim.distance_from_dental_office ? `${heim.distance_from_dental_office} km` : undefined" />
          <CrmInfoRow label="Status" :value="heim.status" />
          <CrmInfoRow label="Koop.-Nr." :value="heim.cooperation_number" />
          <CrmInfoRow label="Abrechnungscode" :value="heim.billing_code_trip_fee" />
          <CrmInfoRow label="Quartalsregel" :value="heim.quarter_rule" />
          <CrmInfoRow label="Kündigungsfrist" :value="heim.extraction_notice_days ? `${heim.extraction_notice_days} Tage` : undefined" />
        </div>
      </div>

      <!-- Notizen -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Notizen</h3>
        <p v-if="heim.notes" class="text-sm text-gray-600 whitespace-pre-wrap">
          {{ heim.notes }}
        </p>
        <p v-else class="text-sm text-gray-300">Keine Notizen</p>
      </div>

      <!-- Ansprechpartner -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Ansprechpartner</h3>
        <CrmContactsList :contacts="contacts" :loading="contactsLoading" />
      </div>

      <!-- Verknüpfte Leads -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Verknüpfte Leads</h3>
        <div v-if="relatedLeads.length === 0" class="text-sm text-gray-300 text-center py-4">
          Keine Leads
        </div>
        <div v-else class="space-y-2">
          <NuxtLink
            v-for="rl in relatedLeads"
            :key="rl.id"
            :to="`/crm/leads/${rl.id}`"
            class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CrmLeadStatusBadge :stage="rl.opportunity_stage" />
            <span class="text-xs text-gray-400">
              {{ formatDate(rl.date_updated) }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else class="text-center py-20">
      <p class="text-gray-400">Pflegeheim nicht gefunden</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import type { NursingHome, NursingHomeLead, NursingHomeContact } from '~/types/crm'

definePageMeta({ layout: 'crm', middleware: 'auth' })

const route = useRoute()
const heimId = route.params.id as string

const { fetchNursingHome } = useNursingHomes()
const { fetchContacts } = useContacts()
const { getItems } = useSecureData()

const heim = ref<NursingHome | null>(null)
const contacts = ref<NursingHomeContact[]>([])
const relatedLeads = ref<NursingHomeLead[]>([])
const loading = ref(true)
const contactsLoading = ref(true)

const addressLine = computed(() => {
  if (!heim.value) return undefined
  const h = heim.value
  const street = [h.Street, h.number].filter(Boolean).join(' ')
  const city = [h.zip, h.city].filter(Boolean).join(' ')
  return [street, city].filter(Boolean).join(', ') || undefined
})

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '–'
  try {
    return format(parseISO(dateStr), 'dd.MM.yy', { locale: de })
  } catch {
    return '–'
  }
}

onMounted(async () => {
  try {
    const [heimData, contactsData, leadsData] = await Promise.all([
      fetchNursingHome(heimId),
      fetchContacts(heimId),
      getItems<NursingHomeLead>({
        collection: 'nursing_home_leads',
        params: {
          fields: ['id', 'opportunity_stage', 'date_updated'],
          filter: { nursing_home_id: { _eq: heimId } },
          sort: ['-date_updated'],
        },
      }),
    ])

    heim.value = heimData
    contacts.value = contactsData
    relatedLeads.value = leadsData
  } catch (err) {
    console.error('Failed to load nursing home:', err)
  } finally {
    loading.value = false
    contactsLoading.value = false
  }
})
</script>
