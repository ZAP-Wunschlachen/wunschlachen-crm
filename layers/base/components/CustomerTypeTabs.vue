<template>
  <div class="border-b border-gray-200 mb-5">
    <nav class="flex gap-1" role="tablist">
      <button
        v-for="opt in tabs"
        :key="opt.value"
        :class="[
          'px-3.5 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors',
          modelValue === opt.value
            ? 'border-[#172774] text-[#172774]'
            : 'border-transparent text-gray-400 hover:text-gray-700',
        ]"
        role="tab"
        :aria-selected="modelValue === opt.value"
        @click="$emit('update:modelValue', opt.value)"
      >
        <i v-if="opt.icon" :class="opt.icon" class="text-[11px] mr-1.5" />
        {{ opt.label }}
        <span v-if="opt.count != null" class="ml-1.5 text-[10px] text-gray-400 tabular-nums">
          {{ opt.count }}
        </span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
export type CustomerType = 'all' | 'heimkunden' | 'patienten'

interface Tab {
  value: CustomerType
  label: string
  icon?: string
  count?: number | null
}

const props = withDefaults(
  defineProps<{
    modelValue: CustomerType
    showAll?: boolean
    counts?: Partial<Record<CustomerType, number>>
  }>(),
  { showAll: true, counts: () => ({}) },
)

defineEmits<{ 'update:modelValue': [value: CustomerType] }>()

const tabs = computed<Tab[]>(() => {
  const result: Tab[] = []
  if (props.showAll) {
    result.push({ value: 'all', label: 'Alle', icon: 'pi pi-th-large', count: props.counts.all })
  }
  result.push({
    value: 'heimkunden',
    label: 'Heimkunden',
    icon: 'pi pi-building',
    count: props.counts.heimkunden,
  })
  result.push({
    value: 'patienten',
    label: 'Patienten',
    icon: 'pi pi-user',
    count: props.counts.patienten,
  })
  return result
})
</script>
