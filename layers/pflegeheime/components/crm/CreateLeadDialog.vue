<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40" @click="close" />

        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <div class="flex items-center gap-2">
              <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-[#172774]/10">
                <i class="pi pi-building text-[14px] text-[#172774]" />
              </div>
              <h3 class="text-[14px] font-semibold text-gray-800">Neuer Lead</h3>
            </div>
            <button class="text-gray-400 hover:text-gray-600 transition-colors" @click="close">
              <i class="pi pi-times text-[13px]" />
            </button>
          </div>

          <!-- Form -->
          <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <!-- Name (required) -->
            <div>
              <label class="block text-[11px] text-gray-500 font-medium mb-1">Pflegeheim Name *</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="z.B. Seniorenresidenz am Park"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                autofocus
              />
            </div>

            <!-- Address row -->
            <div class="grid grid-cols-[1fr_80px] gap-2">
              <div>
                <label class="block text-[11px] text-gray-500 font-medium mb-1">Straße</label>
                <input
                  v-model="form.street"
                  type="text"
                  placeholder="Musterstraße"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                />
              </div>
              <div>
                <label class="block text-[11px] text-gray-500 font-medium mb-1">Nr.</label>
                <input
                  v-model="form.number"
                  type="text"
                  placeholder="12"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                />
              </div>
            </div>

            <!-- PLZ / City -->
            <div class="grid grid-cols-[100px_1fr] gap-2">
              <div>
                <label class="block text-[11px] text-gray-500 font-medium mb-1">PLZ</label>
                <input
                  v-model="form.zip"
                  type="text"
                  placeholder="12345"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                />
              </div>
              <div>
                <label class="block text-[11px] text-gray-500 font-medium mb-1">Stadt</label>
                <input
                  v-model="form.city"
                  type="text"
                  placeholder="Berlin"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                />
              </div>
            </div>

            <!-- Phone / Email -->
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] text-gray-500 font-medium mb-1">Telefon</label>
                <input
                  v-model="form.fone"
                  type="tel"
                  placeholder="+49 30 123456"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                />
              </div>
              <div>
                <label class="block text-[11px] text-gray-500 font-medium mb-1">E-Mail</label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="info@pflegeheim.de"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                />
              </div>
            </div>

            <!-- Website / Capacity -->
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] text-gray-500 font-medium mb-1">Website</label>
                <input
                  v-model="form.website"
                  type="url"
                  placeholder="www.pflegeheim.de"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                />
              </div>
              <div>
                <label class="block text-[11px] text-gray-500 font-medium mb-1">Betten</label>
                <input
                  v-model.number="form.total_capacity"
                  type="number"
                  placeholder="80"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                />
              </div>
            </div>

            <!-- Stage / Priority -->
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] text-gray-500 font-medium mb-1">Stage</label>
                <select
                  v-model="form.stage"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                >
                  <option v-for="s in PIPELINE_STAGES" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] text-gray-500 font-medium mb-1">Priorität</label>
                <select
                  v-model="form.priority"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                >
                  <option :value="undefined">Keine</option>
                  <option value="high">A (100+ Betten)</option>
                  <option value="medium">B (50–100 Betten)</option>
                  <option value="low">C (0–50 Betten)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 flex-shrink-0">
            <button
              class="px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              @click="close"
            >
              Abbrechen
            </button>
            <button
              :disabled="!form.name.trim() || saving"
              class="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium text-white bg-[#172774] hover:bg-[#3d4a8e] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              @click="save"
            >
              <i v-if="saving" class="pi pi-spin pi-spinner text-[10px]" />
              <i v-else class="pi pi-plus text-[10px]" />
              Lead erstellen
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { PIPELINE_STAGES } from '~/types/crm'
import type { OpportunityStage, Priority } from '~/types/crm'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: [leadId: string]
}>()

const { createLead } = usePflegeheimLeads()
const saving = ref(false)

const defaultForm = () => ({
  name: '',
  street: '',
  number: '',
  zip: '',
  city: '',
  fone: '',
  email: '',
  website: '',
  total_capacity: undefined as number | undefined,
  stage: 'Unqualified' as OpportunityStage,
  priority: undefined as Priority | undefined,
})

const form = ref(defaultForm())

watch(() => props.visible, (val) => {
  if (val) form.value = defaultForm()
})

const close = () => emit('update:visible', false)

const save = async () => {
  if (!form.value.name.trim()) return
  saving.value = true
  try {
    const lead = await createLead({
      name: form.value.name.trim(),
      city: form.value.city.trim() || undefined,
      zip: form.value.zip.trim() || undefined,
      street: form.value.street.trim() || undefined,
      number: form.value.number.trim() || undefined,
      fone: form.value.fone.trim() || undefined,
      email: form.value.email.trim() || undefined,
      website: form.value.website.trim() || undefined,
      total_capacity: form.value.total_capacity || undefined,
      stage: form.value.stage,
      priority: form.value.priority,
    })
    emit('saved', lead.id)
    close()
  } catch (err) {
    console.error('Failed to create lead:', err)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
