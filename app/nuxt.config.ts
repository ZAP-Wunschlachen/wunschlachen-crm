export default defineNuxtConfig({
  extends: [
    '../layers/base',
    '../layers/pflegeheime',
    '../layers/patienten',
  ],

  app: {
    head: {
      title: 'Wunschlachen CRM',
      meta: [
        { name: 'description', content: 'Wunschlachen CRM' },
        { name: 'robots', content: 'noindex, nofollow' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  vite: {
    server: {
      hmr: { clientPort: 3000 },
    },
  },

  runtimeConfig: {
    // Welcome-Sequenz-Cron
    welcomeCronSecret: '',       // env: NUXT_WELCOME_CRON_SECRET
    // Appointment-Sync + Reminder-Cron
    appointmentCronSecret: '',   // env: NUXT_APPOINTMENT_CRON_SECRET
    // HKP-Postbox Inbound (Modul F MVP)
    hkpIngestSecret: '',         // env: NUXT_HKP_INGEST_SECRET
    directusUrl: '',             // env: NUXT_DIRECTUS_URL (server-side fetch, ggf. interne URL)
    directusServiceToken: '',    // env: NUXT_DIRECTUS_SERVICE_TOKEN
    public: {
      // Deep-Link in den Kalender für Termin-Buchung (Plan v9 Modul C+D)
      kalenderUrl: 'https://kalender.wunschlachen.app',   // env: NUXT_PUBLIC_KALENDER_URL
    },
  },
})
