<template>
  <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-sm font-semibold text-dental-blue-0">Lead Score</h2>
      <CrmLeadScoreBadge :score="result.total" />
    </div>
    <div class="space-y-2">
      <div v-for="rule in rules" :key="rule.id">
        <div class="flex items-center justify-between text-[11px]">
          <span class="text-dental-blue--2">{{ rule.label }}</span>
          <span class="font-medium text-dental-blue-0">{{ getBreakdown(rule.id).raw }}</span>
        </div>
        <div class="mt-0.5 h-1.5 bg-dental-blue--5 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all"
            :class="barColor(getBreakdown(rule.id).raw)"
            :style="{ width: `${getBreakdown(rule.id).raw}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LeadScoreResult, ScoringRuleId } from '~/types/analytics'
import { SCORING_RULES } from '~/types/analytics'

const props = defineProps<{ result: LeadScoreResult }>()

const rules = SCORING_RULES

const getBreakdown = (ruleId: ScoringRuleId) => {
  return props.result.breakdown[ruleId] || { raw: 0, weighted: 0 }
}

const barColor = (value: number) => {
  if (value > 70) return 'bg-green-500'
  if (value > 40) return 'bg-amber-400'
  return 'bg-red-400'
}
</script>
