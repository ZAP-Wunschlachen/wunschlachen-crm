<template>
  <NuxtLink
    :to="resolvedPath"
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
    <span v-if="!collapsed" class="truncate">{{ label }}</span>

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
import type { CustomerType } from '../composables/useCustomerType'

const props = defineProps<{
  /**
   * Statischer Pfad — wird verwendet wenn `paths` nicht gesetzt ist.
   */
  path?: string
  /**
   * Smart-Routing: Pfad pro Customer-Type. Wenn der aktuelle
   * customerType in `paths` matcht, wird die entsprechende URL genutzt.
   * Fallback: `paths.heimkunden` oder `paths.patienten` oder `path`.
   */
  paths?: Partial<Record<CustomerType, string>>
  label: string
  icon: string
  collapsed?: boolean
  exact?: boolean
}>()

const route = useRoute()
const { customerType } = useCustomerType()

const resolvedPath = computed(() => {
  if (props.paths) {
    return (
      props.paths[customerType.value] ||
      props.paths.heimkunden ||
      props.paths.patienten ||
      props.paths.all ||
      props.path ||
      '/'
    )
  }
  return props.path || '/'
})

// Active wenn aktuelle Route mit IRGENDEINEM zugewiesenen Pfad matcht
// (egal welcher Tab gerade gewählt ist)
const allPossiblePaths = computed(() => {
  if (props.paths) return Object.values(props.paths).filter(Boolean) as string[]
  return [props.path || '/']
})

const isActive = computed(() => {
  return allPossiblePaths.value.some((p) => {
    if (props.exact) return route.path === p
    return route.path === p || route.path.startsWith(p + '/')
  })
})
</script>
