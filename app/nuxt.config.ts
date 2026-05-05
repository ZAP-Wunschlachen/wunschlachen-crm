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
})
