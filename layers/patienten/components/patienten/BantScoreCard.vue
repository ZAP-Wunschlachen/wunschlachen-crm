<template>
  <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
    <h3 class="text-xs font-semibold text-dental-blue-0 mb-3">BANT Score</h3>
    <div class="space-y-2">
      <div v-for="(item, key) in bantItems" :key="key" class="flex items-center justify-between">
        <span class="text-[10px] text-dental-blue-0 font-medium">{{ item.label }}</span>
        <div class="flex items-center gap-2">
          <div class="w-16 h-1.5 bg-dental-blue--5 rounded-full overflow-hidden">
            <div class="h-full rounded-full" :class="item.color" :style="{ width: `${item.score}%` }" />
          </div>
          <span class="text-[10px] text-dental-blue--3 w-6 text-right">{{ item.score }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  budget?: number
  authority?: number
  need?: number
  timeline?: number
}>()

const bantItems = computed(() => ({
  budget: { label: 'Budget', score: props.budget ?? 0, color: 'bg-green-400' },
  authority: { label: 'Authority', score: props.authority ?? 0, color: 'bg-blue-400' },
  need: { label: 'Need', score: props.need ?? 0, color: 'bg-amber-400' },
  timeline: { label: 'Timeline', score: props.timeline ?? 0, color: 'bg-purple-400' },
}))
</script>
