<template>
  <div>
    <p v-if="!collapsed" class="px-2.5 text-[9px] font-bold text-white/25 uppercase tracking-widest mb-1">Smart Views</p>
    <div class="max-h-[200px] overflow-y-auto smart-views-scroll">
      <NuxtLink
        v-for="view in allViews"
        :key="view.id"
        :to="`/crm/leads?view=${view.id}`"
        :class="[
          'group relative flex items-center gap-2.5 rounded-md text-[13px] font-medium transition-all duration-150',
          collapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-[7px]',
          isActive(view.id)
            ? 'bg-white/[0.12] text-white'
            : 'text-white/40 hover:bg-white/[0.07] hover:text-white/70'
        ]"
        :title="collapsed ? view.name : undefined"
      >
        <i :class="view.icon || 'pi pi-filter'" class="text-[13px] w-5 text-center flex-shrink-0" />
        <span v-if="!collapsed" class="truncate flex-1">{{ view.name }}</span>
        <!-- Delete button for custom views -->
        <button
          v-if="!collapsed && isCustomView(view.id)"
          class="flex items-center justify-center w-5 h-5 rounded hover:bg-red-500/30 transition-all flex-shrink-0"
          title="Entfernen"
          @click.prevent.stop="handleDelete(view.id)"
        >
          <i class="pi pi-times text-[9px] text-white/40 hover:text-red-300" />
        </button>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CrmSmartView } from '~/types/crm'

defineProps<{
  collapsed: boolean
}>()

const route = useRoute()
const { smartViews, fetchSmartViews, removeSmartView } = useSmartViews()

// Default smart views that always show (client-side, no collection needed)
const defaultViews: CrmSmartView[] = [
  {
    id: '_hot',
    name: 'Heiße Leads',
    filters: { priority: 'high' },
    icon: 'pi pi-bolt',
    is_shared: true,
  },
  {
    id: '_followup',
    name: 'Follow-up fällig',
    filters: { follow_up_due: true },
    icon: 'pi pi-clock',
    is_shared: true,
  },
  {
    id: '_inactive',
    name: 'Ohne Aktivität',
    filters: { no_activity_days: 14 },
    icon: 'pi pi-exclamation-triangle',
    is_shared: true,
  },
]

const allViews = computed(() => [...defaultViews, ...smartViews.value])

const isActive = (viewId: string) => {
  return route.query.view === viewId
}

const isCustomView = (viewId: string) => {
  return !viewId.startsWith('_')
}

const handleDelete = async (id: string) => {
  await removeSmartView(id)
}

onMounted(async () => {
  try { await fetchSmartViews() } catch {}
})
</script>

<style scoped>
.smart-views-scroll::-webkit-scrollbar {
  width: 3px;
}
.smart-views-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.smart-views-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}
</style>
