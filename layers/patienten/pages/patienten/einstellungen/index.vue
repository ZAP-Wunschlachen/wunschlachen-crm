<template>
  <div class="p-6 max-w-4xl">
    <h1 class="text-2xl font-bold text-dental-blue-0 mb-6">Einstellungen</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NuxtLink
        v-for="item in settingsItems"
        :key="item.path"
        :to="item.path"
        class="bg-white rounded-lg p-4 border border-dental-blue--5 hover:border-dental-blue--4 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="item.bgColor">
            <i :class="item.icon" class="text-[16px]" :style="{ color: item.iconColor }" />
          </div>
          <div>
            <p class="text-sm font-medium text-dental-blue-0">{{ item.label }}</p>
            <p class="text-[11px] text-dental-blue--3">{{ item.description }}</p>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Reactivation Config -->
    <div class="mt-6 bg-white rounded-lg p-4 border border-dental-blue--5 max-w-md">
      <h3 class="text-sm font-semibold text-dental-blue-0 mb-3">Reaktivierung</h3>
      <div class="flex items-center gap-3">
        <label class="text-xs text-dental-blue--2 whitespace-nowrap">Inaktivitäts-Schwelle</label>
        <input
          v-model.number="reactivationThreshold"
          type="number"
          min="1"
          max="365"
          class="w-20 px-2 py-1.5 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0"
          @change="saveReactivationConfig"
        />
        <span class="text-xs text-dental-blue--3">Tage</span>
      </div>
      <p class="text-[10px] text-dental-blue--3 mt-2">
        Leads ohne Aktivität nach dieser Anzahl Tage werden zur Reaktivierung vorgeschlagen.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'crm', middleware: ['auth'] })

const settingsItems = [
  {
    path: '/patienten/einstellungen/welcome-sequence',
    label: 'Welcome-Sequenz',
    description: 'Slot-Einstellungen & Brevo-Template-IDs',
    icon: 'pi pi-inbox',
    iconColor: '#06b6d4',
    bgColor: 'bg-cyan-50',
  },
  {
    path: '/patienten/einstellungen/email-vorlagen',
    label: 'E-Mail Vorlagen',
    description: 'E-Mail-Templates verwalten',
    icon: 'pi pi-envelope',
    iconColor: '#3b82f6',
    bgColor: 'bg-blue-50',
  },
  {
    path: '/patienten/einstellungen/brevo',
    label: 'Brevo (SMS/E-Mail)',
    description: 'API-Key und Absender konfigurieren',
    icon: 'pi pi-send',
    iconColor: '#8b5cf6',
    bgColor: 'bg-violet-50',
  },
  {
    path: '/patienten/einstellungen/bewertungen',
    label: 'Google Bewertungen',
    description: 'API-Key und Place ID konfigurieren',
    icon: 'pi pi-star',
    iconColor: '#f59e0b',
    bgColor: 'bg-amber-50',
  },
  {
    path: '/patienten/einstellungen/lead-scoring',
    label: 'Lead Scoring',
    description: 'Scoring-Gewichtung anpassen',
    icon: 'pi pi-chart-line',
    iconColor: '#10b981',
    bgColor: 'bg-emerald-50',
  },
]

const { config: reactivationConfig, saveConfig: saveReactivationConfigFn, loadConfig } = useReactivation()

const reactivationThreshold = ref(30)

onMounted(() => {
  loadConfig()
  reactivationThreshold.value = reactivationConfig.value.thresholdDays
})

const saveReactivationConfig = () => {
  saveReactivationConfigFn({ thresholdDays: reactivationThreshold.value })
}
</script>
