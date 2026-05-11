import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },

  build: {
    transpile: ['vuetify', '@zap-wunschlachen/wl-shared-components'],
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  css: ['primeicons/primeicons.css', resolve(currentDir, 'assets/css/global.css')],

  tailwindcss: {
    configPath: resolve(currentDir, '../../tailwind.config.ts'),
  },

  runtimeConfig: {
    // Server-only: niemals im Client-Bundle exposed
    brevoToken: process.env.BREVO_TOKEN || '',
    brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || '',
    brevoSenderName: process.env.BREVO_SENDER_NAME || 'Wunschlachen',

    public: {
      socketUrl: process.env.SOCKET_URL || '',
      directusUrl: process.env.DIRECTUS_URL || 'https://wunschlachen.app',
      authUrl: process.env.AUTH_URL || 'https://login.wunschlachen.app',
    },
  },
})
