<template>
  <div class="flex gap-3">
    <button
      v-for="(config, type) in ACTIVITY_TYPE_CONFIG"
      :key="type"
      class="flex flex-col items-center gap-1.5 group"
      @click="$emit('select', type)"
    >
      <div
        class="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
        :style="{ backgroundColor: config.bgColor }"
      >
        <i :class="config.icon" class="text-sm" :style="{ color: config.color }" />
      </div>
      <span class="text-[10px] text-dental-blue--2 group-hover:text-dental-blue-0">{{ config.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ACTIVITY_TYPE_CONFIG, type LeadActivityType } from '~/types/crm'

defineEmits<{
  select: [type: LeadActivityType]
}>()
</script>
