<template>
  <div class="p-6 max-w-3xl">
    <div class="flex items-center gap-2 mb-6">
      <button class="text-dental-blue--3 hover:text-dental-blue-0" @click="navigateTo('/patienten/einstellungen')">
        <i class="pi pi-arrow-left text-xs" />
      </button>
      <h1 class="text-2xl font-bold text-dental-blue-0">Welcome-Sequence Einstellungen</h1>
    </div>

    <!-- Globaler Toggle -->
    <div class="bg-white rounded-lg p-4 border border-dental-blue--5 mb-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-dental-blue-0">Welcome-Sequenz aktiv</p>
          <p class="text-[11px] text-dental-blue--3 mt-1 max-w-sm">
            Schaltet UI-Hilfen ab. Cron auf Server stoppt erst nach DigitalOcean-Workflow-Disable.
          </p>
        </div>
        <button
          class="relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none"
          :class="sequenceEnabled ? 'bg-dental-blue-0' : 'bg-dental-blue--5'"
          @click="toggleSequenceEnabled"
        >
          <span
            class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
            :class="sequenceEnabled ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>
    </div>

    <!-- Slot-Karten -->
    <div class="space-y-4">
      <div
        v-for="(slot, idx) in editableSlots"
        :key="slot.slug"
        class="bg-white rounded-lg p-5 border border-dental-blue--5"
      >
        <!-- Read-only Badges -->
        <div class="flex items-center gap-2 mb-4">
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-dental-blue--5 text-dental-blue--2 font-medium">
            Position {{ slot.position }}
          </span>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
            Tag {{ slot.day_offset }}
          </span>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium capitalize">
            {{ slot.theme }}
          </span>
          <span v-if="isSlotOverridden(idx)" class="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">
            Angepasst
          </span>
        </div>

        <!-- Editable Fields -->
        <div class="space-y-3">
          <div>
            <label class="text-xs text-dental-blue--3 block mb-1">Betreff (Fallback)</label>
            <input
              v-model="slot.subject_fallback"
              type="text"
              class="field-input"
              placeholder="Betreff wenn Brevo-Template nicht gesetzt..."
            />
          </div>
          <div>
            <label class="text-xs text-dental-blue--3 block mb-1">HTML-Body (Fallback)</label>
            <textarea
              v-model="slot.html_fallback"
              class="field-input min-h-[8rem] resize-y"
              placeholder="<p>Hallo {{firstName}},</p><p>...</p>"
            />
          </div>
          <div>
            <label class="text-xs text-dental-blue--3 block mb-1">Brevo Template ID</label>
            <input
              v-model.number="slot.brevo_template_id"
              type="number"
              class="field-input w-36"
              placeholder="z.B. 1001"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 mt-4">
          <button
            class="px-3 py-1.5 text-xs font-medium text-white bg-dental-blue-0 rounded-lg hover:bg-dental-blue-1"
            @click="saveSlot(idx)"
          >
            Speichern
          </button>
          <button
            v-if="isSlotOverridden(idx)"
            class="px-3 py-1.5 text-xs font-medium text-dental-blue-0 border border-dental-blue--5 rounded-lg hover:bg-[#ededed]"
            @click="resetSlot(idx)"
          >
            Auf Standard zurücksetzen
          </button>
          <span v-if="savedIdx === idx" class="text-xs text-green-600 ml-1">Gespeichert</span>
        </div>
      </div>
    </div>

    <!-- Alle zurücksetzen -->
    <div class="mt-6">
      <button
        class="px-4 py-2 text-xs font-medium text-power-red-0 border border-power-red--3 rounded-lg hover:bg-red-50"
        @click="resetAll"
      >
        Alle Slots auf Standard zurücksetzen
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WELCOME_SLOTS, type WelcomeSlot } from '~/data/welcome-sequence-slots'
import { WELCOME_SEQUENCE_STORAGE_KEY } from '~/composables/useWelcomeSequence'

definePageMeta({ layout: 'crm', middleware: ['auth'] })

const ENABLED_STORAGE_KEY = 'welcome-sequence-enabled'

// Deep-clone default slots for editing
const editableSlots = ref<WelcomeSlot[]>(structuredClone(WELCOME_SLOTS))
const sequenceEnabled = ref(true)
const savedIdx = ref<number | null>(null)

// Track which slot indices have been overridden
const overriddenIndices = ref<Set<number>>(new Set())

const loadFromStorage = () => {
  try {
    const enabledRaw = localStorage.getItem(ENABLED_STORAGE_KEY)
    sequenceEnabled.value = enabledRaw === null ? true : enabledRaw === 'true'

    const stored = localStorage.getItem(WELCOME_SEQUENCE_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as WelcomeSlot[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        const defaultMap = new Map(WELCOME_SLOTS.map(s => [s.slug, s]))
        parsed.forEach((overrideSlot, i) => {
          const def = defaultMap.get(overrideSlot.slug)
          if (def && JSON.stringify(def) !== JSON.stringify(overrideSlot)) {
            overriddenIndices.value.add(i)
          }
          editableSlots.value[i] = { ...overrideSlot }
        })
      }
    }
  } catch { /* ignore */ }
}

const persistOverrides = () => {
  try {
    const defaultMap = new Map(WELCOME_SLOTS.map(s => [s.slug, s]))
    const newOverridden = new Set<number>()
    editableSlots.value.forEach((s, i) => {
      if (JSON.stringify(defaultMap.get(s.slug)) !== JSON.stringify(s)) {
        newOverridden.add(i)
      }
    })
    overriddenIndices.value = newOverridden

    if (newOverridden.size > 0) {
      localStorage.setItem(WELCOME_SEQUENCE_STORAGE_KEY, JSON.stringify(editableSlots.value))
    } else {
      localStorage.removeItem(WELCOME_SEQUENCE_STORAGE_KEY)
    }
  } catch { /* ignore */ }
}

const toggleSequenceEnabled = () => {
  sequenceEnabled.value = !sequenceEnabled.value
  try {
    localStorage.setItem(ENABLED_STORAGE_KEY, String(sequenceEnabled.value))
  } catch { /* ignore */ }
}

const isSlotOverridden = (idx: number) => overriddenIndices.value.has(idx)

const saveSlot = (idx: number) => {
  persistOverrides()
  savedIdx.value = idx
  setTimeout(() => { savedIdx.value = null }, 2000)
}

const resetSlot = (idx: number) => {
  editableSlots.value[idx] = structuredClone(WELCOME_SLOTS[idx])
  persistOverrides()
}

const resetAll = () => {
  if (!confirm('Alle Slots auf Standard zurücksetzen?')) return
  editableSlots.value = structuredClone(WELCOME_SLOTS)
  overriddenIndices.value = new Set()
  try {
    localStorage.removeItem(WELCOME_SEQUENCE_STORAGE_KEY)
  } catch { /* ignore */ }
}

onMounted(loadFromStorage)
</script>

<style scoped>
.field-input {
  @apply w-full px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0;
}
</style>
