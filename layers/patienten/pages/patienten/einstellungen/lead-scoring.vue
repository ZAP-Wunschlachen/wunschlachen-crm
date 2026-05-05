<template>
  <div class="p-6 max-w-3xl">
    <h1 class="text-2xl font-bold text-dental-blue-0 mb-6">Lead Scoring Gewichtung</h1>

    <div class="bg-white rounded-lg p-6 border border-dental-blue--5 space-y-4">
      <div v-for="(label, ruleId) in ruleLabels" :key="ruleId">
        <div class="flex items-center justify-between mb-1">
          <label class="text-xs text-dental-blue-0 font-medium">{{ label }}</label>
          <span class="text-xs text-dental-blue--3">{{ weights[ruleId] }}%</span>
        </div>
        <input
          :value="weights[ruleId]"
          type="range"
          min="0"
          max="100"
          class="w-full"
          @input="weights[ruleId] = Number(($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="flex items-center gap-3 pt-4">
        <button class="px-4 py-2 text-xs font-medium text-white bg-dental-blue-0 rounded-lg hover:bg-dental-blue-1" @click="save">
          Speichern
        </button>
        <button class="px-4 py-2 text-xs font-medium text-dental-blue-0 border border-dental-blue--5 rounded-lg hover:bg-[#ededed]" @click="reset">
          Zuruecksetzen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ScoringWeights } from '~/types/analytics'

definePageMeta({ layout: 'crm', middleware: ['auth'] })

const { weights, updateWeights, resetWeights } = useLeadScoring()

const ruleLabels: Record<string, string> = {
  treatment_value: 'Behandlungswert',
  activity_count: 'Aktivitaeten',
  lead_source: 'Lead-Quelle',
  response_time: 'Reaktionszeit',
  appointment_behavior: 'Terminverhalten',
  follow_up_status: 'Follow-up Status',
}

const save = () => updateWeights(weights.value)
const reset = () => resetWeights()
</script>
