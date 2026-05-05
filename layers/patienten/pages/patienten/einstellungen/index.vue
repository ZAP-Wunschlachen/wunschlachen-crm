<template>
  <div class="p-6 max-w-3xl">
    <h1 class="text-2xl font-bold text-dental-blue-0 mb-6">Einstellungen</h1>

    <div class="space-y-3">
      <NuxtLink
        v-for="item in settings"
        :key="item.path"
        :to="item.path"
        class="block bg-white rounded-lg p-4 border border-dental-blue--5 hover:border-dental-blue--4 transition-colors"
      >
        <p class="text-sm font-medium text-dental-blue-0">{{ item.label }}</p>
        <p class="text-xs text-dental-blue--3 mt-0.5">{{ item.description }}</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'crm', middleware: ['auth'] })

const settings = [
  { path: '/patienten/einstellungen/email-vorlagen', label: 'E-Mail Vorlagen', description: 'Vorlagen fuer automatische E-Mails verwalten' },
  { path: '/patienten/einstellungen/brevo', label: 'Brevo (E-Mail/SMS/WhatsApp)', description: 'API-Key und Absender konfigurieren' },
  { path: '/patienten/einstellungen/lead-scoring', label: 'Lead Scoring', description: 'Gewichtung der Scoring-Regeln anpassen' },
  { path: '/patienten/einstellungen/bewertungen', label: 'Google Bewertungen', description: 'Google API-Key und Place ID hinterlegen' },
]
</script>
