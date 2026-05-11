import { defineNuxtPlugin } from '#app'
// @ts-expect-error — wl-shared-components ships a JS Vuetify config without typings
import vuetify from '@zap-wunschlachen/wl-shared-components/src/plugins/vuetify'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(vuetify)
})
