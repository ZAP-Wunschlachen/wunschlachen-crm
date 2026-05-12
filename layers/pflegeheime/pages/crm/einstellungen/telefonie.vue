<template>
  <div class="max-w-2xl">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-[14px] font-semibold text-gray-800">Telefonie (Placetel)</h2>
      <span
        class="text-[10px] px-2 py-0.5 rounded-full font-medium"
        :class="statusClass"
      >
        {{ statusLabel }}
      </span>
    </div>

    <div class="space-y-4">
      <!-- Status Card -->
      <div class="bg-white rounded-lg border border-gray-200/80 p-4">
        <div class="flex items-start gap-3">
          <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-[#172774]/10 flex-shrink-0">
            <i class="pi pi-phone text-[18px] text-[#172774]" />
          </div>
          <div class="flex-1">
            <h3 class="text-[13px] font-semibold text-gray-800">Placetel Integration</h3>
            <p class="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
              Click-to-Call direkt aus dem CRM. Anrufe werden automatisch als Aktivität protokolliert.
              Jeder Agent nutzt seinen eigenen Placetel API-Token.
            </p>
          </div>
        </div>
      </div>

      <!-- Enable/Disable -->
      <div class="bg-white rounded-lg border border-gray-200/80 p-4">
        <label class="flex items-center justify-between cursor-pointer">
          <div>
            <p class="text-[12px] font-medium text-gray-800">Click-to-Call aktivieren</p>
            <p class="text-[11px] text-gray-400 mt-0.5">Telefon-Buttons bei Kontakten und Leads anzeigen</p>
          </div>
          <div class="relative">
            <input
              type="checkbox"
              :checked="config.enabled"
              @change="toggleEnabled"
              class="sr-only peer"
            />
            <div class="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#172774] transition-colors" />
            <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
          </div>
        </label>
      </div>

      <!-- API Token -->
      <div class="bg-white rounded-lg border border-gray-200/80 p-4 space-y-3">
        <div>
          <label class="block text-[12px] font-medium text-gray-800 mb-0.5">API-Token</label>
          <p class="text-[11px] text-gray-400 mb-2">
            Dein persönlicher Placetel API-Token. Findest du im Placetel-Portal unter
            <em>Einstellungen → Integrationen → API</em>.
          </p>
          <div class="relative">
            <input
              v-model="apiToken"
              :type="tokenVisible ? 'text' : 'password'"
              placeholder="Placetel API-Token eingeben"
              class="w-full px-2.5 py-1.5 pr-8 border border-gray-200 rounded-md text-[12px] text-gray-700 font-mono focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
            />
            <button
              @click="tokenVisible = !tokenVisible"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <i :class="tokenVisible ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-[11px]" />
            </button>
          </div>
        </div>
      </div>

      <!-- SIP User -->
      <div class="bg-white rounded-lg border border-gray-200/80 p-4 space-y-3">
        <div>
          <label class="block text-[12px] font-medium text-gray-800 mb-0.5">SIP-Benutzer</label>
          <p class="text-[11px] text-gray-400 mb-2">
            Dein Placetel SIP-Benutzername (z.B. 777123456s0). Wird verwendet um Anrufe über dein Telefon auszulösen.
          </p>
          <input
            v-model="sipUser"
            type="text"
            placeholder="z.B. 777123456s0"
            class="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
          />
        </div>

        <!-- SIP User Dropdown (populated after connection test) -->
        <div v-if="availableSipUsers.length > 0">
          <p class="text-[11px] text-gray-400 mb-1">Oder SIP-User aus deinem Account auswählen:</p>
          <select
            v-model="sipUser"
            class="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30"
          >
            <option value="">— Auswählen —</option>
            <option v-for="su in availableSipUsers" :key="su.id" :value="su.name">
              {{ su.name }} {{ su.caller_id ? `(${su.caller_id})` : '' }}
            </option>
          </select>
        </div>
      </div>

      <!-- Save + Test -->
      <div class="flex items-center gap-2">
        <button
          @click="saveAll"
          :disabled="!hasChanges"
          class="flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-white bg-[#172774] rounded-md hover:bg-[#3d4a8e] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <i class="pi pi-check text-[10px]" />
          Speichern
        </button>

        <button
          @click="runConnectionTest"
          :disabled="!apiToken || testing"
          class="flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-[#172774] bg-[#172774]/5 rounded-md hover:bg-[#172774]/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <i :class="testing ? 'pi pi-spin pi-spinner' : 'pi pi-bolt'" class="text-[10px]" />
          Verbindung testen
        </button>
      </div>

      <!-- Status Messages -->
      <div v-if="saved" class="bg-green-50 rounded-lg border border-green-200/80 p-3 flex items-center gap-2">
        <i class="pi pi-check-circle text-[12px] text-green-600" />
        <p class="text-[11px] text-green-700">Einstellungen gespeichert</p>
      </div>

      <div v-if="testResult" class="rounded-lg border p-3 flex items-center gap-2" :class="testResult.success ? 'bg-green-50 border-green-200/80' : 'bg-red-50 border-red-200/80'">
        <i :class="testResult.success ? 'pi pi-check-circle text-green-600' : 'pi pi-times-circle text-red-600'" class="text-[12px]" />
        <p class="text-[11px]" :class="testResult.success ? 'text-green-700' : 'text-red-700'">{{ testResult.message }}</p>
      </div>

      <!-- Info -->
      <div class="bg-amber-50 rounded-lg border border-amber-200/80 p-4">
        <div class="flex items-start gap-2.5">
          <i class="pi pi-info-circle text-[14px] text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p class="text-[12px] font-medium text-amber-800">So funktioniert's</p>
            <ol class="text-[11px] text-amber-700 mt-1 leading-relaxed space-y-1 list-decimal list-inside">
              <li>API-Token aus dem Placetel-Portal kopieren und hier eintragen</li>
              <li>"Verbindung testen" klicken — zeigt verfügbare SIP-User</li>
              <li>Deinen SIP-User auswählen (Softphone/Tischtelefon)</li>
              <li>Click-to-Call: Klingelt erst bei dir, dann beim Kontakt</li>
            </ol>
          </div>
        </div>
      </div>

      <!-- API Reference -->
      <div class="bg-white rounded-lg border border-gray-200/80 p-4">
        <h3 class="text-[12px] font-semibold text-gray-800 mb-2">API-Referenz</h3>
        <div class="space-y-1.5 text-[11px]">
          <div class="flex items-center gap-2">
            <span class="text-gray-400 w-20 flex-shrink-0">REST API</span>
            <span class="text-gray-600 font-mono">api.placetel.de/v2</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-400 w-20 flex-shrink-0">Click-to-Call</span>
            <span class="text-gray-600 font-mono">POST /v2/calls</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-400 w-20 flex-shrink-0">Auth</span>
            <span class="text-gray-600">Bearer Token (pro Agent)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'crm', middleware: 'auth' })

const { config, updateConfig, testConnection } = usePlacetel()

const apiToken = ref(config.value.apiToken || '')
const sipUser = ref(config.value.sipUser || '')
const tokenVisible = ref(false)
const saved = ref(false)
const testing = ref(false)
const testResult = ref<{ success: boolean; message: string } | null>(null)
const availableSipUsers = ref<any[]>([])

const hasChanges = computed(() =>
  apiToken.value !== (config.value.apiToken || '') ||
  sipUser.value !== (config.value.sipUser || '')
)

const statusLabel = computed(() => {
  if (!config.value.enabled) return 'Inaktiv'
  if (!config.value.apiToken) return 'Nicht konfiguriert'
  if (!config.value.sipUser) return 'SIP fehlt'
  return 'Aktiv'
})

const statusClass = computed(() => {
  if (!config.value.enabled) return 'bg-gray-100 text-gray-500'
  if (!config.value.apiToken || !config.value.sipUser) return 'bg-amber-50 text-amber-600'
  return 'bg-green-50 text-green-700'
})

const toggleEnabled = () => {
  updateConfig({ enabled: !config.value.enabled })
}

const saveAll = () => {
  updateConfig({
    apiToken: apiToken.value || undefined,
    sipUser: sipUser.value || undefined,
  })
  saved.value = true
  testResult.value = null
  setTimeout(() => { saved.value = false }, 2000)
}

const runConnectionTest = async () => {
  testing.value = true
  testResult.value = null

  // Save both token and SIP user before testing
  updateConfig({ apiToken: apiToken.value || undefined, sipUser: sipUser.value || undefined })

  const result = await testConnection()
  testResult.value = result
  testing.value = false

  if (result.sipUsers) {
    availableSipUsers.value = result.sipUsers
  }
}
</script>
