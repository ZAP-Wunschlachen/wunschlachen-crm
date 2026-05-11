import { defineNuxtPlugin } from '#app'
// @ts-expect-error — wl-shared-components exports a Vue plugin from a TS source file
import { WlSharedComponents } from '@zap-wunschlachen/wl-shared-components/src/index.ts'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(WlSharedComponents)
})
