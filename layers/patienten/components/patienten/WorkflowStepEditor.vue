<template>
  <div class="bg-white rounded-lg border border-dental-blue--5 p-4">
    <div class="flex items-start gap-3">
      <!-- Step icon + number -->
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        :style="{ backgroundColor: stepTypeConfig?.bgColor || '#f3f4f6' }"
      >
        <i :class="stepTypeConfig?.icon || 'pi pi-circle'" class="text-xs" :style="{ color: stepTypeConfig?.color || '#6b7280' }" />
      </div>

      <div class="flex-1 min-w-0 space-y-3">
        <!-- Header: type + label + delete -->
        <div class="flex items-center gap-2">
          <select
            :value="step.type"
            class="field-input w-auto text-xs"
            @change="updateField('type', ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="st in WORKFLOW_STEP_TYPES" :key="st.value" :value="st.value">{{ st.label }}</option>
          </select>
          <input
            :value="step.label || ''"
            type="text"
            class="field-input text-xs flex-1"
            placeholder="Beschriftung (optional)"
            @blur="updateField('label', ($event.target as HTMLInputElement).value || undefined)"
          />
          <button class="p-1.5 text-dental-blue--3 hover:text-power-red-0 flex-shrink-0" title="Entfernen" @click="$emit('remove')">
            <i class="pi pi-trash text-[11px]" />
          </button>
        </div>

        <!-- Email config -->
        <div v-if="step.type === 'email'" class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[10px] text-dental-blue--3 mb-0.5">Vorlage</label>
            <select
              :value="(step.config as any).template_id || ''"
              class="field-input text-xs"
              @change="updateConfig('template_id', ($event.target as HTMLSelectElement).value || undefined)"
            >
              <option value="">— Keine Vorlage —</option>
              <option v-for="tpl in templates" :key="tpl.id" :value="tpl.id">{{ tpl.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] text-dental-blue--3 mb-0.5">Verzögerung (Tage)</label>
            <input
              :value="(step.config as any).delay_days || ''"
              type="number"
              min="0"
              class="field-input text-xs"
              placeholder="0"
              @blur="updateConfig('delay_days', Number(($event.target as HTMLInputElement).value) || undefined)"
            />
          </div>
        </div>

        <!-- SMS config -->
        <div v-if="step.type === 'sms'">
          <label class="block text-[10px] text-dental-blue--3 mb-0.5">Nachricht</label>
          <textarea
            :value="(step.config as any).message || ''"
            rows="2"
            class="field-input text-xs resize-none"
            placeholder="SMS-Text..."
            @blur="updateConfig('message', ($event.target as HTMLTextAreaElement).value)"
          />
          <p class="text-[9px] text-dental-blue--3 mt-0.5" v-pre>Variablen: {{ patient.first_name }}, {{ patient.last_name }}, {{ location.name }}</p>
        </div>

        <!-- WhatsApp config -->
        <div v-if="step.type === 'whatsapp'">
          <label class="block text-[10px] text-dental-blue--3 mb-0.5">Nachricht</label>
          <textarea
            :value="(step.config as any).message || ''"
            rows="2"
            class="field-input text-xs resize-none"
            placeholder="WhatsApp-Text..."
            @blur="updateConfig('message', ($event.target as HTMLTextAreaElement).value)"
          />
          <p class="text-[9px] text-dental-blue--3 mt-0.5" v-pre>Variablen: {{ patient.first_name }}, {{ patient.last_name }}, {{ location.name }}</p>
        </div>

        <!-- Wait config -->
        <div v-if="step.type === 'wait'">
          <label class="block text-[10px] text-dental-blue--3 mb-0.5">Tage warten</label>
          <input
            :value="(step.config as any).days || 1"
            type="number"
            min="1"
            class="field-input text-xs w-24"
            @blur="updateConfig('days', Number(($event.target as HTMLInputElement).value) || 1)"
          />
        </div>

        <!-- Task config -->
        <div v-if="step.type === 'task'">
          <label class="block text-[10px] text-dental-blue--3 mb-0.5">Aufgabenbeschreibung</label>
          <textarea
            :value="(step.config as any).description || ''"
            rows="2"
            class="field-input text-xs resize-none"
            placeholder="Was soll erledigt werden..."
            @blur="updateConfig('description', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>

        <!-- Newsletter config -->
        <div v-if="step.type === 'newsletter'" class="space-y-2">
          <div>
            <label class="block text-[10px] text-dental-blue--3 mb-0.5">Betreff</label>
            <input
              :value="(step.config as any).subject || ''"
              type="text"
              class="field-input text-xs"
              placeholder="Newsletter-Betreff"
              @blur="updateConfig('subject', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div>
            <label class="block text-[10px] text-dental-blue--3 mb-0.5">Nachricht</label>
            <textarea
              :value="(step.config as any).message || ''"
              rows="3"
              class="field-input text-xs resize-none"
              placeholder="Newsletter-Inhalt..."
              @blur="updateConfig('message', ($event.target as HTMLTextAreaElement).value)"
            />
          </div>
        </div>

        <!-- Condition config -->
        <div v-if="step.type === 'condition'" class="grid grid-cols-3 gap-2">
          <div>
            <label class="block text-[10px] text-dental-blue--3 mb-0.5">Feld</label>
            <input
              :value="(step.config as any).field || ''"
              type="text"
              class="field-input text-xs"
              placeholder="z.B. status"
              @blur="updateConfig('field', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div>
            <label class="block text-[10px] text-dental-blue--3 mb-0.5">Operator</label>
            <select
              :value="(step.config as any).operator || 'equals'"
              class="field-input text-xs"
              @change="updateConfig('operator', ($event.target as HTMLSelectElement).value)"
            >
              <option value="equals">Gleich</option>
              <option value="not_equals">Ungleich</option>
              <option value="contains">Enthält</option>
              <option value="greater_than">Größer als</option>
              <option value="less_than">Kleiner als</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] text-dental-blue--3 mb-0.5">Wert</label>
            <input
              :value="(step.config as any).value || ''"
              type="text"
              class="field-input text-xs"
              placeholder="Vergleichswert"
              @blur="updateConfig('value', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WORKFLOW_STEP_TYPES, type WorkflowStep, type WorkflowStepType } from '~/types/workflow'
import type { EmailTemplate } from '~/types/email'

const props = defineProps<{
  step: WorkflowStep
  templates?: EmailTemplate[]
}>()

const emit = defineEmits<{
  update: [step: WorkflowStep]
  remove: []
}>()

const stepTypeConfig = computed(() => {
  const colorMap: Record<WorkflowStepType, { icon: string; color: string; bgColor: string }> = {
    email:     { icon: 'pi pi-envelope',        color: '#3b82f6', bgColor: '#eff6ff' },
    sms:       { icon: 'pi pi-comment',          color: '#8b5cf6', bgColor: '#f5f3ff' },
    whatsapp:  { icon: 'pi pi-comments',         color: '#22c55e', bgColor: '#f0fdf4' },
    wait:      { icon: 'pi pi-clock',            color: '#f97316', bgColor: '#fff7ed' },
    task:      { icon: 'pi pi-check-square',     color: '#14b8a6', bgColor: '#f0fdfa' },
    condition: { icon: 'pi pi-question-circle',  color: '#eab308', bgColor: '#fefce8' },
    newsletter: { icon: 'pi pi-megaphone',       color: '#ec4899', bgColor: '#fdf2f8' },
  }
  return colorMap[props.step.type]
})

const defaultConfig = (type: WorkflowStepType): Record<string, any> => {
  switch (type) {
    case 'email': return { template_id: undefined, delay_days: undefined }
    case 'sms': return { message: '' }
    case 'whatsapp': return { message: '' }
    case 'wait': return { days: 1 }
    case 'task': return { description: '' }
    case 'condition': return { field: '', operator: 'equals', value: '' }
    case 'newsletter': return { subject: '', message: '' }
    default: return {}
  }
}

const updateField = (field: string, value: any) => {
  if (field === 'type' && value !== props.step.type) {
    emit('update', { ...props.step, type: value as WorkflowStepType, config: defaultConfig(value as WorkflowStepType) })
  } else {
    emit('update', { ...props.step, [field]: value })
  }
}

const updateConfig = (key: string, value: any) => {
  emit('update', { ...props.step, config: { ...props.step.config, [key]: value } })
}
</script>

<style scoped>
.field-input {
  @apply w-full px-2 py-1.5 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0;
}
</style>
