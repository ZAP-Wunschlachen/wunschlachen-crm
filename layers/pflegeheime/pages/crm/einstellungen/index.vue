<template>
  <div>
    <div class="mb-5">
      <h2 class="text-[16px] font-semibold text-gray-900">Einstellungen</h2>
      <p class="text-[11px] text-gray-400 mt-1">CRM-Konfiguration und Verwaltung</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <NuxtLink
        v-for="card in settingsCards"
        :key="card.to"
        :to="card.to"
        class="group bg-white rounded-lg border border-gray-200/80 p-5 hover:border-[#172774]/30 hover:shadow-sm transition-all"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded-lg bg-[#172774]/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[#172774]/10 transition-colors">
              <i :class="card.icon" class="text-[14px] text-[#172774]" />
            </div>
            <div>
              <p class="text-[13px] font-semibold text-gray-800 group-hover:text-[#172774] transition-colors">{{ card.title }}</p>
              <p class="text-[11px] text-gray-400 mt-1 leading-relaxed">{{ card.description }}</p>
            </div>
          </div>
          <i class="pi pi-arrow-right text-[11px] text-gray-300 group-hover:text-[#172774] transition-colors mt-1" />
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'crm', middleware: 'auth' })

const settingsCards = [
  {
    icon: 'pi pi-upload',
    title: 'Daten-Import',
    description: 'Sales Pipeline aus Excel importieren und lokal verwalten.',
    to: '/crm/einstellungen/import',
  },
  {
    icon: 'pi pi-envelope',
    title: 'E-Mail Vorlagen',
    description: 'E-Mail-Vorlagen fuer Erstansprache, Follow-ups und Onboarding verwalten.',
    to: '/crm/einstellungen/email-vorlagen',
  },
  {
    icon: 'pi pi-bell',
    title: 'Erinnerungen',
    description: 'Automatische Erinnerungen und Follow-up-Benachrichtigungen konfigurieren.',
    to: '/crm/einstellungen/erinnerungen',
  },
  {
    icon: 'pi pi-megaphone',
    title: 'Newsletter',
    description: 'Edukative zahnmedizinische Inhalte automatisch an Pflegeheim-Leads senden.',
    to: '/crm/einstellungen/newsletter',
  },
  {
    icon: 'pi pi-phone',
    title: 'Telefonie',
    description: 'Placetel Click-to-Call Konfiguration und SIP-Einstellungen.',
    to: '/crm/einstellungen/telefonie',
  },
  {
    icon: 'pi pi-globe',
    title: 'Web Crawler',
    description: 'Crawler-Quellen verwalten und neue Pflegeheime automatisch finden.',
    to: '/crm/einstellungen/crawler',
  },
  {
    icon: 'pi pi-clone',
    title: 'Duplikat-Erkennung',
    description: 'Potenzielle Duplikate finden, vergleichen und zusammenführen.',
    to: '/crm/duplikate',
  },
  {
    icon: 'pi pi-wrench',
    title: 'Implementation',
    description: 'Go-Live Checkliste: Directus Collections, Extensions, Migration und Testing.',
    to: '/crm/einstellungen/implementation',
  },
]
</script>
