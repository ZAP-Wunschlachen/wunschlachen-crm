<template>
  <Dialog
    v-model:visible="visible"
    header="Neuer Lead"
    :style="{ width: '480px' }"
    modal
    :closable="true"
  >
    <div class="space-y-4 pt-2">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs text-dental-blue--2 font-medium">Vorname *</label>
          <input v-model="form.first_name" type="text" class="w-full mt-1 px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0" />
        </div>
        <div>
          <label class="text-xs text-dental-blue--2 font-medium">Nachname *</label>
          <input v-model="form.last_name" type="text" class="w-full mt-1 px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs text-dental-blue--2 font-medium">Telefon</label>
          <input v-model="form.phone" type="tel" class="w-full mt-1 px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0" />
        </div>
        <div>
          <label class="text-xs text-dental-blue--2 font-medium">E-Mail</label>
          <input v-model="form.mail" type="email" class="w-full mt-1 px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0" />
        </div>
      </div>

      <div>
        <label class="text-xs text-dental-blue--2 font-medium">Lead Source</label>
        <select v-model="form.lead_source" class="w-full mt-1 px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0 bg-white">
          <option value="">— Auswählen —</option>
          <option v-for="(cfg, key) in LEAD_SOURCE_CONFIG" :key="key" :value="key">{{ cfg.label }}</option>
        </select>
      </div>

      <div>
        <label class="text-xs text-dental-blue--2 font-medium">Nachricht</label>
        <textarea v-model="form.message" rows="3" class="w-full mt-1 px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0 resize-none" />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <button class="px-3 py-1.5 text-sm font-medium text-dental-blue-0 bg-dental-blue--5 rounded-lg hover:bg-dental-blue--4" @click="visible = false">
          Abbrechen
        </button>
        <button
          class="px-5 py-1.5 text-sm font-semibold text-white bg-dental-blue-0 rounded-lg hover:bg-dental-blue-1 disabled:opacity-50"
          :disabled="!canSubmit || saving"
          @click="submit"
        >
          {{ saving ? 'Speichern...' : 'Lead anlegen' }}
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog'
import { LEAD_SOURCE_CONFIG, type LeadSource } from '~/types/crm'

const visible = defineModel<boolean>('visible', { default: false })
const emit = defineEmits<{ created: [] }>()

const saving = ref(false)
const form = reactive({
  first_name: '',
  last_name: '',
  phone: '',
  mail: '',
  lead_source: '' as LeadSource | '',
  message: '',
})

const canSubmit = computed(() => form.first_name.trim() && form.last_name.trim())

const submit = async () => {
  if (!canSubmit.value) return
  saving.value = true

  try {
    const { createLead } = useLeads()
    await createLead({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone: form.phone || undefined,
      mail: form.mail || undefined,
      lead_source: (form.lead_source || undefined) as LeadSource | undefined,
      message: form.message || undefined,
      status: 'open',
    })
    visible.value = false
    Object.assign(form, { first_name: '', last_name: '', phone: '', mail: '', lead_source: '', message: '' })
    emit('created')
  } catch (err) {
    console.error('Create lead failed:', err)
  } finally {
    saving.value = false
  }
}
</script>
