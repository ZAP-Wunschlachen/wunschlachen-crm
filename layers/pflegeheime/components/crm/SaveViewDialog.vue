<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40" @click="close" />

        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-sm">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 class="text-[14px] font-semibold text-gray-800">Ansicht speichern</h3>
            <button class="text-gray-400 hover:text-gray-600 transition-colors" @click="close">
              <i class="pi pi-times text-[13px]" />
            </button>
          </div>

          <div class="px-5 py-4 space-y-4">
            <div>
              <label class="block text-[11px] text-gray-500 font-medium mb-1">Name</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="z.B. Heiße Leads"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
              />
            </div>

            <div>
              <label class="block text-[11px] text-gray-500 font-medium mb-1">Icon</label>
              <select
                v-model="form.icon"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
              >
                <option v-for="ico in icons" :key="ico.value" :value="ico.value">{{ ico.label }}</option>
              </select>
            </div>

            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.is_shared"
                type="checkbox"
                class="rounded border-gray-300 text-[#172774] focus:ring-[#172774]/30 w-3.5 h-3.5"
              />
              <span class="text-[12px] text-gray-600">Für alle Benutzer sichtbar</span>
            </label>
          </div>

          <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
            <button
              class="px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              @click="close"
            >
              Abbrechen
            </button>
            <button
              :disabled="!form.name.trim() || saving"
              class="px-4 py-2 text-[12px] font-medium text-white bg-[#172774] hover:bg-[#3d4a8e] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              @click="save"
            >
              <i v-if="saving" class="pi pi-spin pi-spinner text-[10px] mr-1" />
              Speichern
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  visible: boolean
  filters: Record<string, any>
  sort?: Record<string, any> | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const { createSmartView } = useSmartViews()
const saving = ref(false)

const form = ref({
  name: '',
  icon: 'pi pi-filter',
  is_shared: false,
})

const icons = [
  { value: 'pi pi-filter', label: 'Filter' },
  { value: 'pi pi-star', label: 'Stern' },
  { value: 'pi pi-bolt', label: 'Blitz' },
  { value: 'pi pi-flag', label: 'Flagge' },
  { value: 'pi pi-clock', label: 'Uhr' },
  { value: 'pi pi-exclamation-triangle', label: 'Warnung' },
  { value: 'pi pi-check-circle', label: 'Erledigt' },
  { value: 'pi pi-eye', label: 'Auge' },
]

watch(() => props.visible, (val) => {
  if (val) form.value = { name: '', icon: 'pi pi-filter', is_shared: false }
})

const close = () => emit('update:visible', false)

const save = async () => {
  if (!form.value.name.trim()) return
  saving.value = true
  try {
    await createSmartView({
      name: form.value.name.trim(),
      filters: props.filters,
      sort: props.sort || null,
      icon: form.value.icon,
      is_shared: form.value.is_shared,
    })
    emit('saved')
    close()
  } catch (err) {
    console.error('Failed to save view:', err)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
