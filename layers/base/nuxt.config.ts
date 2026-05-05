import Aura from '@primevue/themes/aura'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@primevue/nuxt-module',
    '@pinia/nuxt',
  ],

  css: ['primeicons/primeicons.css', resolve(currentDir, 'assets/css/global.css')],

  tailwindcss: {
    configPath: resolve(currentDir, '../../tailwind.config.ts'),
  },

  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark-mode',
          cssLayer: {
            name: 'primevue',
            order: 'tailwind-base, primevue, tailwind-utilities',
          },
        },
      },
    },
  },

  runtimeConfig: {
    public: {
      socketUrl: process.env.SOCKET_URL || '',
      directusUrl: process.env.DIRECTUS_URL || 'https://wunschlachen.app',
      authUrl: process.env.AUTH_URL || 'https://login.wunschlachen.app',
      brevoToken: process.env.BREVO_TOKEN || '',
      brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || '',
      brevoSenderName: process.env.BREVO_SENDER_NAME || 'Wunschlachen',
    },
  },
})
