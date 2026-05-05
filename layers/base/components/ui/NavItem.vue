<template>
  <NuxtLink
    :to="to"
    class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
    :class="isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'"
  >
    <i :class="icon" class="text-base w-5 text-center"></i>
    <span>{{ label }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  to: string
  icon: string
  label: string
}>()

const route = useRoute()
const isActive = computed(() => route.path.startsWith(props.to))
</script>
