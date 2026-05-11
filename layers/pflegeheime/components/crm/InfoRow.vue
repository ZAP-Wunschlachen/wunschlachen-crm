<template>
  <div class="flex justify-between items-start gap-2">
    <span class="text-gray-500 flex-shrink-0">{{ label }}</span>
    <span v-if="!value" class="text-gray-300">–</span>
    <a
      v-else-if="linkType === 'tel'"
      :href="`tel:${value}`"
      class="text-gray-900 text-right hover:text-[#172774] transition-colors"
    >
      {{ value }}
    </a>
    <a
      v-else-if="linkType === 'email'"
      :href="`mailto:${value}`"
      class="text-gray-900 text-right hover:text-[#172774] transition-colors truncate"
    >
      {{ value }}
    </a>
    <a
      v-else-if="linkType === 'url'"
      :href="value.startsWith('http') ? value : `https://${value}`"
      target="_blank"
      class="text-gray-900 text-right hover:text-[#172774] transition-colors truncate"
    >
      {{ value }}
    </a>
    <span v-else class="text-gray-900 text-right">{{ value }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value?: string | null
  linkType?: 'tel' | 'email' | 'url'
}>()
</script>
