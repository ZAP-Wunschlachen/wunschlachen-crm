<template>
  <div class="flex flex-wrap gap-3">
    <!-- Buchungs-Button: öffnet Kalender im neuen Tab statt Aktivitäts-Dialog -->
    <button class="flex flex-col items-center gap-1.5 group" title="Termin im Kalender buchen" @click="$emit('book')">
      <div class="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 bg-[#fff7ed]">
        <i class="pi pi-calendar-plus text-sm text-[#f97316]" />
      </div>
      <span class="text-[10px] text-dental-blue--2 group-hover:text-dental-blue-0">Termin</span>
    </button>

    <!-- Manuelle Activity-Types (Erfassung) -->
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
  book: []
}>()
</script>
