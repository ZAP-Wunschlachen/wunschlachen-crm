<template>
  <div class="p-6 max-w-3xl">
    <h1 class="text-2xl font-bold text-dental-blue-0 mb-6">Brevo Konfiguration</h1>

    <div class="bg-white rounded-lg p-6 border border-dental-blue--5 space-y-4">
      <div>
        <label class="text-xs text-dental-blue--3 block mb-1">API-Key</label>
        <input v-model="form.apiKey" type="password" class="field-input" placeholder="xkeysib-..." />
      </div>
      <div>
        <label class="text-xs text-dental-blue--3 block mb-1">Absender E-Mail</label>
        <input v-model="form.senderEmail" type="email" class="field-input" />
      </div>
      <div>
        <label class="text-xs text-dental-blue--3 block mb-1">Absender Name</label>
        <input v-model="form.senderName" type="text" class="field-input" />
      </div>
      <div>
        <label class="text-xs text-dental-blue--3 block mb-1">Telefonnummer (SMS/WhatsApp)</label>
        <input v-model="form.senderPhone" type="tel" class="field-input" />
      </div>

      <div class="flex items-center gap-3 pt-2">
        <button class="px-4 py-2 text-xs font-medium text-white bg-dental-blue-0 rounded-lg hover:bg-dental-blue-1" @click="saveForm">
          Speichern
        </button>
        <button class="px-4 py-2 text-xs font-medium text-dental-blue-0 border border-dental-blue--5 rounded-lg hover:bg-[#ededed]" @click="testConn">
          Verbindung testen
        </button>
      </div>

      <p v-if="message" class="text-xs mt-2" :class="success ? 'text-green-600' : 'text-red-500'">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'crm', middleware: ['auth'] })

const { config, updateConfig, testConnection } = useBrevoCom()

const form = ref({
  apiKey: config.value.apiKey,
  senderEmail: config.value.senderEmail,
  senderName: config.value.senderName,
  senderPhone: config.value.senderPhone,
})

const message = ref('')
const success = ref(false)

const saveForm = () => {
  updateConfig(form.value)
  message.value = 'Gespeichert'
  success.value = true
}

const testConn = async () => {
  saveForm()
  const result = await testConnection()
  message.value = result.message
  success.value = result.success
}
</script>

<style scoped>
.field-input {
  @apply w-full px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0;
}
</style>
