<template>
  <div class="p-6 max-w-3xl">
    <h1 class="text-2xl font-bold text-dental-blue-0 mb-6">Google Bewertungen Einstellungen</h1>

    <div class="bg-white rounded-lg p-6 border border-dental-blue--5 space-y-4">
      <div>
        <label class="text-xs text-dental-blue--3 block mb-1">Google API Key</label>
        <input v-model="form.apiKey" type="password" class="field-input" placeholder="AIza..." />
      </div>
      <div>
        <label class="text-xs text-dental-blue--3 block mb-1">Place ID</label>
        <input v-model="form.placeId" type="text" class="field-input" placeholder="ChIJ..." />
        <p class="text-[10px] text-dental-blue--3 mt-1">Findbar unter Google Maps > Ihr Geschaeft > Place ID</p>
      </div>

      <button class="px-4 py-2 text-xs font-medium text-white bg-dental-blue-0 rounded-lg hover:bg-dental-blue-1" @click="save">
        Speichern
      </button>

      <p v-if="saved" class="text-xs text-green-600">Gespeichert</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'crm', middleware: ['auth'] })

const { config, saveConfig } = useGoogleReviews()
const form = ref({ apiKey: config.value.apiKey, placeId: config.value.placeId })
const saved = ref(false)

const save = () => {
  saveConfig(form.value)
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}
</script>

<style scoped>
.field-input {
  @apply w-full px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0;
}
</style>
