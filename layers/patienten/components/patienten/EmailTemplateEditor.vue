<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/40" @click="$emit('close')" />
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
      <div class="px-5 py-4 border-b border-dental-blue--5 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-dental-blue-0">Vorlage bearbeiten</h3>
        <button class="text-dental-blue--3 hover:text-dental-blue-0" @click="$emit('close')">
          <i class="pi pi-times text-xs" />
        </button>
      </div>
      <div class="px-5 py-4 space-y-3">
        <div>
          <label class="text-xs text-dental-blue--3">Name</label>
          <input v-model="form.name" type="text" class="field-input" />
        </div>
        <div>
          <label class="text-xs text-dental-blue--3">Betreff</label>
          <input v-model="form.subject" type="text" class="field-input" />
        </div>
        <div>
          <label class="text-xs text-dental-blue--3">HTML Body</label>
          <textarea v-model="form.body_html" rows="10" class="field-input resize-none font-mono text-xs" />
        </div>
        <div>
          <label class="text-xs text-dental-blue--3">Kategorie</label>
          <select v-model="form.category" class="field-input">
            <option value="erstansprache">Erstansprache</option>
            <option value="follow_up">Follow-up</option>
            <option value="termin_erinnerung">Termin-Erinnerung</option>
            <option value="nachsorge">Nachsorge</option>
            <option value="allgemein">Allgemein</option>
          </select>
        </div>
      </div>
      <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-dental-blue--5">
        <button class="px-4 py-2 text-xs text-dental-blue--2 hover:bg-[#ededed] rounded-lg" @click="$emit('close')">Abbrechen</button>
        <button class="px-4 py-2 text-xs text-white bg-dental-blue-0 rounded-lg" @click="save">Speichern</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EmailTemplate } from '~/types/email'

const props = defineProps<{ template: EmailTemplate }>()
const emit = defineEmits(['close', 'saved'])

const form = ref({ ...props.template })

const save = async () => {
  const { updateTemplate } = useEmailTemplates()
  await updateTemplate(props.template.id, form.value)
  emit('saved')
}
</script>

<style scoped>
.field-input { @apply w-full px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0; }
</style>
