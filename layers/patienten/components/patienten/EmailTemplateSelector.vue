<template>
  <div class="space-y-1">
    <label class="text-xs text-dental-blue--3">Vorlage</label>
    <select :value="modelValue" class="field-input text-xs" @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
      <option value="">-- Keine Vorlage --</option>
      <option v-for="tpl in templates" :key="tpl.id" :value="tpl.id">{{ tpl.name }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import type { EmailTemplate } from '~/types/email'

defineProps<{ modelValue: string; templates: EmailTemplate[] }>()
defineEmits(['update:modelValue'])
</script>

<style scoped>
.field-input { @apply w-full px-3 py-2 text-sm border border-dental-blue--5 rounded-lg outline-none focus:border-dental-blue-0 text-dental-blue-0; }
</style>
