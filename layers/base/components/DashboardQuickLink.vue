<template>
  <NuxtLink
    :to="to"
    class="flex items-center gap-3 px-2.5 py-2 -mx-2.5 rounded-md hover:bg-gray-50 transition-colors group"
  >
    <i :class="icon" class="text-[14px] text-gray-400 group-hover:text-[#172774] w-5 text-center" />
    <div class="flex-1 min-w-0">
      <p class="text-[13px] font-medium text-gray-800 truncate">{{ label }}</p>
      <p v-if="hint" class="text-[11px] text-gray-400 truncate">{{ hint }}</p>
    </div>
    <i class="pi pi-angle-right text-[11px] text-gray-300 group-hover:text-gray-500" />
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  to: string
  icon: string
  label: string
  hint?: string
}>()
</script>
