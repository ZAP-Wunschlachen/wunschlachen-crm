// Stubs für Nuxt-Auto-Imports — pure-logic-Tests laufen ohne Nuxt-Runtime
import { ref, computed, reactive } from 'vue'

;(globalThis as any).ref = ref
;(globalThis as any).computed = computed
;(globalThis as any).reactive = reactive
