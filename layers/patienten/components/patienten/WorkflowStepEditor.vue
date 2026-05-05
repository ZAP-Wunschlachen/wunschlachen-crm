<template>
  <div class="bg-white rounded-lg p-3 border border-dental-blue--5">
    <div class="flex items-center justify-between mb-2">
      <select :value="step.type" class="text-xs px-2 py-1 border border-dental-blue--5 rounded bg-white text-dental-blue-0" @change="updateType(($event.target as HTMLSelectElement).value as any)">
        <option value="email">E-Mail</option>
        <option value="sms">SMS</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="wait">Warten</option>
        <option value="task">Aufgabe</option>
        <option value="condition">Bedingung</option>
      </select>
      <button class="text-dental-blue--3 hover:text-red-500" @click="$emit('remove')">
        <i class="pi pi-trash text-xs" />
      </button>
    </div>
    <input
      :value="step.label"
      type="text"
      class="w-full px-2 py-1 text-xs border border-dental-blue--5 rounded outline-none focus:border-dental-blue-0 text-dental-blue-0"
      placeholder="Label..."
      @blur="updateLabel(($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
import type { WorkflowStep } from '~/types/workflow'
import type { EmailTemplate } from '~/types/email'

const props = defineProps<{ step: WorkflowStep; templates: EmailTemplate[] }>()
const emit = defineEmits(['update', 'remove'])

const updateType = (type: WorkflowStep['type']) => {
  emit('update', { ...props.step, type, config: {} })
}

const updateLabel = (label: string) => {
  emit('update', { ...props.step, label })
}
</script>
