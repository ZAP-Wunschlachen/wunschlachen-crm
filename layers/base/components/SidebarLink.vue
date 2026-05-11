<template>
  <NuxtLink
    :to="path"
    :class="[
      'group relative flex items-center rounded-md text-[13px] font-medium transition-all duration-150',
      collapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-2.5 py-[7px]',
      isActive ? 'bg-white/[0.15] text-white' : 'text-gray-400 hover:bg-white/[0.08] hover:text-white',
    ]"
  >
    <i
      :class="icon"
      class="w-5 text-center flex-shrink-0"
      :style="collapsed ? 'font-size: 18px' : 'font-size: 15px'"
    />
    <span v-if="!collapsed">{{ label }}</span>

    <!-- Tooltip im collapsed-State -->
    <span
      v-if="collapsed"
      class="absolute left-full ml-2 px-2 py-1 text-[11px] font-medium text-white bg-gray-800 rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
    >
      {{ label }}
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  path: string
  label: string
  icon: string
  collapsed?: boolean
  exact?: boolean
}>()

const route = useRoute()
const isActive = computed(() => {
  if (props.exact) return route.path === props.path
  return route.path === props.path || route.path.startsWith(props.path + '/')
})
</script>
