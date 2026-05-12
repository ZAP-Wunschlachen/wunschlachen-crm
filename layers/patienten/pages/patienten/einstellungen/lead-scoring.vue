<template>
  <div class="p-6 max-w-3xl">
    <button class="flex items-center gap-1 text-sm text-dental-blue--2 hover:text-dental-blue-0 mb-4" @click="navigateTo('/patienten/einstellungen')">
      <i class="pi pi-arrow-left text-xs" />
      Zurück
    </button>

    <h1 class="text-2xl font-bold text-dental-blue-0 mb-6">Lead Scoring — Gewichtung</h1>

    <div class="bg-white rounded-lg p-6 border border-dental-blue--5 space-y-6">
      <p class="text-sm text-dental-blue--2">
        Passe die Gewichtung der einzelnen Scoring-Regeln an. Die Werte werden automatisch auf 100% normalisiert.
      </p>

      <div v-for="rule in rules" :key="rule.id" class="space-y-1">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-sm font-medium text-dental-blue-0">{{ rule.label }}</span>
            <span class="text-xs text-dental-blue--3 ml-2">{{ rule.description }}</span>
          </div>
          <span class="text-sm font-bold text-dental-blue-0 min-w-[40px] text-right">
            {{ Math.round(normalizedWeights[rule.id]) }}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          :value="localWeights[rule.id]"
          class="w-full h-2 bg-dental-blue--5 rounded-lg appearance-none cursor-pointer accent-dental-blue-0"
          @input="onSliderChange(rule.id, $event)"
        />
        <div class="flex justify-between text-[10px] text-dental-blue--3">
          <span>0</span>
          <span>Rohwert: {{ localWeights[rule.id] }}</span>
          <span>100</span>
        </div>
      </div>

      <div class="flex items-center justify-between pt-4 border-t border-dental-blue--5">
        <button
          class="px-4 py-2 text-sm text-dental-blue--2 hover:text-dental-blue-0 transition-colors"
          @click="handleReset"
        >
          Zurücksetzen
        </button>
        <button
          class="px-5 py-2 text-sm font-semibold text-white bg-dental-blue-0 rounded-lg hover:bg-dental-blue-1 transition-colors"
          @click="handleSave"
        >
          Speichern
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ScoringRuleId, ScoringWeights } from '~/types/analytics'
import { SCORING_RULES, DEFAULT_SCORING_WEIGHTS } from '~/types/analytics'

definePageMeta({ layout: 'crm', middleware: ['auth'] })

const { weights, normalizedWeights, updateWeights, resetWeights } = useLeadScoring()

const rules = SCORING_RULES
const localWeights = ref<ScoringWeights>({ ...weights.value })

const onSliderChange = (ruleId: ScoringRuleId, event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  localWeights.value = { ...localWeights.value, [ruleId]: value }
  // Live-update normalized preview
  updateWeights(localWeights.value)
}

const handleSave = () => {
  updateWeights(localWeights.value)
}

const handleReset = () => {
  resetWeights()
  localWeights.value = { ...DEFAULT_SCORING_WEIGHTS }
}
</script>
