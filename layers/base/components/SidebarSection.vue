<template>
  <div :class="['pt-3 pb-1 px-2.5', collapsed ? 'sr-only' : '']">
    <p class="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
      {{ label }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  collapsed?: boolean
}>()
</script>
