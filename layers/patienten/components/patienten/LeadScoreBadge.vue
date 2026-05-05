<template>
  <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold" :class="badgeClass">
    {{ score }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{ score: number }>()

const badgeClass = computed(() => {
  if (props.score >= 70) return 'bg-green-50 text-green-700'
  if (props.score >= 40) return 'bg-amber-50 text-amber-700'
  return 'bg-red-50 text-red-700'
})
</script>
