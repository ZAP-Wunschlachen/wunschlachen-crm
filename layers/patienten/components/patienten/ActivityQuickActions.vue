<template>
  <div class="flex flex-wrap gap-3">
    <button
      v-for="type in MANUAL_ACTIVITY_TYPES"
      :key="type"
      class="flex flex-col items-center gap-1.5 group"
      @click="$emit('select', type)"
    >
      <div
        class="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
        :style="{ backgroundColor: ACTIVITY_TYPE_CONFIG[type].bgColor }"
      >
        <i :class="ACTIVITY_TYPE_CONFIG[type].icon" class="text-sm" :style="{ color: ACTIVITY_TYPE_CONFIG[type].color }" />
      </div>
      <span class="text-[10px] text-dental-blue--2 group-hover:text-dental-blue-0">{{ ACTIVITY_TYPE_CONFIG[type].label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ACTIVITY_TYPE_CONFIG, MANUAL_ACTIVITY_TYPES, type LeadActivityType } from '~/types/crm'

defineEmits<{
  select: [type: LeadActivityType]
}>()
</script>
