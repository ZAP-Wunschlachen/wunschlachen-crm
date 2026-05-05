<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <button
        @click="$router.back()"
        class="text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        <i class="pi pi-arrow-left text-xs mr-1" />
        Zurueck
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
          <div><span class="text-gray-400">Name:</span> {{ heim.name }}</div>
          <div><span class="text-gray-400">Adresse:</span> {{ addressLine }}</div>
          <div><span class="text-gray-400">Telefon:</span> {{ heim.fone || '-' }}</div>
          <div><span class="text-gray-400">E-Mail:</span> {{ heim.email || '-' }}</div>
          <div><span class="text-gray-400">Website:</span> {{ heim.website || '-' }}</div>
        </div>
      </div>

      <!-- Betriebsdaten -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Betriebsdaten</h3>
        <div class="space-y-3 text-sm">
          <div><span class="text-gray-400">Betten:</span> {{ heim.total_capacity || '-' }}</div>
          <div><span class="text-gray-400">Entfernung:</span> {{ heim.distance_from_dental_office ? `${heim.distance_from_dental_office} km` : '-' }}</div>
          <div><span class="text-gray-400">Status:</span> {{ heim.status || '-' }}</div>
          <div><span class="text-gray-400">Koop.-Nr.:</span> {{ heim.cooperation_number || '-' }}</div>
        </div>
      </div>

      <!-- Notizen -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Notizen</h3>
        <p v-if="heim.notes" class="text-sm text-gray-600 whitespace-pre-wrap">{{ heim.notes }}</p>
        <p v-else class="text-sm text-gray-300">Keine Notizen</p>
      </div>

      <!-- Ansprechpartner -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Ansprechpartner</h3>
        <div v-if="contacts.length === 0" class="text-sm text-gray-300">Keine Kontakte</div>
        <div v-else class="space-y-2">
          <div v-for="c in contacts" :key="c.id" class="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
            <span class="font-medium text-sm">{{ c.first_name }} {{ c.last_name }}</span>
            <span class="text-xs text-gray-400">{{ c.job_title }}</span>
          </div>
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
definePageMeta({ layout: 'crm', middleware: 'auth' })

const route = useRoute()
const heimId = route.params.id as string

const { fetchNursingHome } = useNursingHomes()
const { fetchContacts } = useContacts()

const heim = ref<any>(null)
const contacts = ref<any[]>([])
const loading = ref(true)

const addressLine = computed(() => {
  if (!heim.value) return '-'
  const h = heim.value
  const street = [h.Street, h.number].filter(Boolean).join(' ')
  const city = [h.zip, h.city].filter(Boolean).join(' ')
  return [street, city].filter(Boolean).join(', ') || '-'
})

onMounted(async () => {
  try {
    const [heimData, contactsData] = await Promise.all([
      fetchNursingHome(heimId),
      fetchContacts(heimId),
    ])
    heim.value = heimData
    contacts.value = contactsData
  } catch (err) {
    console.error('Failed to load nursing home:', err)
  } finally {
    loading.value = false
  }
})
</script>
