<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40" @click="close" />
        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-sm">
          <div class="px-5 py-4 border-b border-dental-blue--5">
            <h3 class="text-sm font-semibold text-dental-blue-0">AI Anruf starten</h3>
          </div>
          <div class="px-5 py-4 space-y-3">
            <p class="text-xs text-dental-blue--2">
              Ein AI Voice Agent wird den Kontakt anrufen und qualifizieren.
            </p>
            <div>
              <label class="text-xs text-dental-blue--3">Telefonnummer</label>
              <input v-model="phone" type="tel" class="field-input" :placeholder="contactPhone" />
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-dental-blue--5">
            <button class="px-4 py-2 text-xs text-dental-blue--2 hover:bg-[#ededed] rounded-lg" @click="close">Abbrechen</button>
            <button class="px-4 py-2 text-xs text-white bg-dental-blue-0 rounded-lg disabled:opacity-40" :disabled="!phoneToUse" @click="startCall">
              Anruf starten
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ visible: boolean; contactId: string; contactPhone?: string }>()
const emit = defineEmits(['update:visible', 'called'])

const phone = ref('')
const phoneToUse = computed(() => phone.value || props.contactPhone || '')

const close = () => emit('update:visible', false)

const startCall = async () => {
  const { initiateCall } = useVoiceAgent()
  await initiateCall(props.contactId, phoneToUse.value)
  emit('called')
  close()
}
</script>

<style scoped>
.field-input { @apply w-full px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
