<template>
  <div class="p-6 max-w-2xl">
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/crm/einstellungen" class="text-dental-blue--3 hover:text-dental-blue-0">
        <i class="pi pi-arrow-left text-sm" />
      </NuxtLink>
      <h1 class="text-2xl font-bold text-dental-blue-0">Google Bewertungen</h1>
    </div>

    <div class="bg-white rounded-lg border border-dental-blue--5 p-6 space-y-5">
      <!-- Info banner -->
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p class="text-xs text-amber-800">
          <i class="pi pi-info-circle mr-1" />
          Für die Google Bewertungen benötigst du einen Google Cloud API-Key mit aktivierter
          <strong>Places API (New)</strong> und die Place ID deiner Praxis.
        </p>
      </div>

      <!-- API Key -->
      <div>
        <label class="block text-xs font-medium text-dental-blue--2 mb-1">Google Cloud API-Key</label>
        <input
          v-model="apiKey"
          type="password"
          placeholder="AIza..."
          class="w-full px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0"
        />
      </div>

      <!-- Place ID -->
      <div>
        <label class="block text-xs font-medium text-dental-blue--2 mb-1">Google Place ID</label>
        <input
          v-model="placeId"
          type="text"
          placeholder="ChIJ..."
          class="w-full px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0"
        />
        <p class="text-[10px] text-dental-blue--3 mt-1">
          Findest du über
          <a
            href="https://developers.google.com/maps/documentation/places/web-service/place-id-finder"
            target="_blank"
            rel="noopener"
            class="underline"
          >Place ID Finder</a>.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 pt-2">
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-dental-blue-0 rounded-lg hover:bg-dental-blue-1 transition-colors"
          @click="save"
        >
          Speichern
        </button>
        <button
          class="px-4 py-2 text-sm font-medium text-dental-blue-0 bg-dental-blue-0/10 rounded-lg hover:bg-dental-blue-0/20 transition-colors"
          :disabled="!isConfigured"
          @click="testConnection"
        >
          <i class="pi pi-check-circle mr-1 text-xs" />
          Verbindung testen
        </button>
      </div>

      <!-- Test result -->
      <div v-if="testResult" class="rounded-lg p-3 text-xs" :class="testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
        <i :class="testResult.success ? 'pi pi-check-circle' : 'pi pi-times-circle'" class="mr-1" />
        {{ testResult.message }}
      </div>

      <!-- Saved indicator -->
      <div v-if="showSaved" class="text-xs text-green-600">
        <i class="pi pi-check mr-1" /> Gespeichert
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'crm', middleware: ['auth'] })

const { config, saveConfig, loadConfig, isConfigured, fetchReviews, getAverageRating, getReviewCount } = useGoogleReviews()

const apiKey = ref('')
const placeId = ref('')
const showSaved = ref(false)
const testResult = ref<{ success: boolean; message: string } | null>(null)

onMounted(() => {
  loadConfig()
  apiKey.value = config.value.apiKey
  placeId.value = config.value.placeId
})

const save = () => {
  saveConfig({ apiKey: apiKey.value, placeId: placeId.value })
  showSaved.value = true
  testResult.value = null
  setTimeout(() => { showSaved.value = false }, 2000)
}

const testConnection = async () => {
  testResult.value = null
  save() // Save first so fetchReviews uses latest config

  const result = await fetchReviews(true)
  if (result.length > 0) {
    testResult.value = {
      success: true,
      message: `Verbindung erfolgreich! ${getReviewCount.value} Bewertungen geladen, Durchschnitt: ${getAverageRating.value} Sterne.`,
    }
  } else {
    const { error } = useGoogleReviews()
    testResult.value = {
      success: false,
      message: error.value || 'Keine Bewertungen gefunden. Bitte API-Key und Place ID prüfen.',
    }
  }
}
</script>
