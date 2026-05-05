<template>
  <div class="relative inline-flex items-center gap-1 cursor-default group" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
    <div class="w-1.5 h-1.5 rounded-full" :class="dotClass" />
    <span class="text-[10px] font-medium" :class="textClass">{{ label }}</span>

    <!-- Tooltip -->
    <Transition name="fade">
      <div
        v-if="showTooltip"
        class="absolute left-0 top-full mt-1.5 z-50 bg-gray-900 text-white rounded-md px-3 py-2 shadow-lg whitespace-nowrap"
      >
        <p class="text-[10px] font-semibold mb-1">Ghosting-Risiko: {{ label }}</p>
        <p class="text-[9px] text-gray-300">{{ reason }}</p>
        <div class="text-[9px] text-gray-400 mt-1 space-y-0.5">
          <p>{{ daysSinceLast }} Tage seit letzter Aktivitaet</p>
          <p>{{ noContactCount }}x kein Kontakt erreicht</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  activities: any[]
  stage: string
}>()

const showTooltip = ref(false)

const riskData = computed(() => {
  const acts = props.activities || []

  let daysSinceLast = 999
  if (acts.length > 0) {
    const sorted = [...acts].sort((a, b) =>
      new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime()
    )
    const lastDate = sorted[0]?.date_created
    if (lastDate) {
      daysSinceLast = Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))
    }
  }

  const noContactCount = acts.filter(a => a.outcome === 'no_contact').length

  let score = 0
  if (daysSinceLast > 14) score += 3
  else if (daysSinceLast > 7) score += 2
  else if (daysSinceLast > 3) score += 1

  if (noContactCount >= 3) score += 3
  else if (noContactCount >= 2) score += 2
  else if (noContactCount >= 1) score += 1

  if (['Unqualified', 'Qualified', 'Follow-up'].includes(props.stage) && acts.length === 0) score += 2

  let level: 'high' | 'medium' | 'low'
  let reason: string
  if (score >= 5) {
    level = 'high'
    reason = 'Hohe Gefahr den Lead zu verlieren'
  } else if (score >= 3) {
    level = 'medium'
    reason = 'Aufmerksamkeit erforderlich'
  } else {
    level = 'low'
    reason = 'Kontakt ist aktiv'
  }

  return { level, reason, daysSinceLast, noContactCount }
})

const label = computed(() => {
  const map = { high: 'Hoch', medium: 'Mittel', low: 'Niedrig' }
  return map[riskData.value.level]
})

const dotClass = computed(() => {
  const map = { high: 'bg-red-500', medium: 'bg-yellow-500', low: 'bg-green-500' }
  return map[riskData.value.level]
})

const textClass = computed(() => {
  const map = { high: 'text-red-600', medium: 'text-yellow-600', low: 'text-green-600' }
  return map[riskData.value.level]
})

const reason = computed(() => riskData.value.reason)
const daysSinceLast = computed(() => riskData.value.daysSinceLast === 999 ? 'N/A' : riskData.value.daysSinceLast)
const noContactCount = computed(() => riskData.value.noContactCount)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
