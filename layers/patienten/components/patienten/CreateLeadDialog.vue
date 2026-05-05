<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40" @click="close" />
        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div class="px-5 py-4 border-b border-dental-blue--5">
            <h3 class="text-sm font-semibold text-dental-blue-0">Neuer Lead</h3>
          </div>
          <div class="px-5 py-4 space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs text-dental-blue--3">Vorname *</label>
                <input v-model="form.first_name" type="text" class="field-input" />
              </div>
              <div>
                <label class="text-xs text-dental-blue--3">Nachname *</label>
                <input v-model="form.last_name" type="text" class="field-input" />
              </div>
            </div>
            <div>
              <label class="text-xs text-dental-blue--3">E-Mail</label>
              <input v-model="form.mail" type="email" class="field-input" />
            </div>
            <div>
              <label class="text-xs text-dental-blue--3">Telefon</label>
              <input v-model="form.phone" type="tel" class="field-input" />
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-dental-blue--5">
            <button class="px-4 py-2 text-xs font-medium text-dental-blue--2 hover:bg-[#ededed] rounded-lg" @click="close">Abbrechen</button>
            <button class="px-4 py-2 text-xs font-medium text-white bg-dental-blue-0 hover:bg-dental-blue-1 rounded-lg disabled:opacity-40" :disabled="!canSubmit" @click="submit">Erstellen</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ visible: boolean }>()
const emit = defineEmits(['update:visible', 'created'])

const form = ref({ first_name: '', last_name: '', mail: '', phone: '' })
const canSubmit = computed(() => form.value.first_name.trim() && form.value.last_name.trim())

const close = () => emit('update:visible', false)

const submit = async () => {
  const { createLead } = useLeads()
  await createLead({ ...form.value, status: 'open' as any })
  form.value = { first_name: '', last_name: '', mail: '', phone: '' }
  emit('created')
  close()
}
</script>

<style scoped>
.field-input { @apply w-full px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
