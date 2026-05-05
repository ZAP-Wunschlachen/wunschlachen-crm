<template>
  <div class="p-6 max-w-7xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-dental-blue-0">AI Voice Agent</h1>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
        <p class="text-xs text-dental-blue--2 font-medium">Anrufe Gesamt</p>
        <p class="text-2xl font-bold text-dental-blue-0 mt-1">{{ stats.totalCalls }}</p>
      </div>
      <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
        <p class="text-xs text-dental-blue--2 font-medium">Qualifiziert</p>
        <p class="text-2xl font-bold text-green-600 mt-1">{{ stats.qualified }}</p>
      </div>
      <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
        <p class="text-xs text-dental-blue--2 font-medium">Nicht erreicht</p>
        <p class="text-2xl font-bold text-amber-600 mt-1">{{ stats.noContact }}</p>
      </div>
      <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
        <p class="text-xs text-dental-blue--2 font-medium">Avg. AI Score</p>
        <p class="text-2xl font-bold text-dental-blue-0 mt-1">{{ stats.avgScore }}</p>
      </div>
    </div>

    <!-- Voice AI Dashboard -->
    <PatientenVoiceAiDashboard />

    <!-- Recent Calls -->
    <div class="mt-6">
      <h2 class="text-sm font-semibold text-dental-blue-0 mb-3">Letzte AI-Anrufe</h2>
      <div v-if="recentCalls.length === 0" class="bg-white rounded-lg p-6 border border-dental-blue--5 text-center text-sm text-dental-blue--3">
        Noch keine AI-Anrufe durchgefuehrt
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="call in recentCalls"
          :key="call.id"
          class="bg-white rounded-lg p-4 border border-dental-blue--5 flex items-center justify-between"
        >
          <div>
            <p class="text-sm font-medium text-dental-blue-0">{{ call.contact }}</p>
            <p class="text-xs text-dental-blue--3">{{ formatDate(call.date_created) }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-medium"
              :class="outcomeClass(call.outcome)"
            >
              {{ outcomeLabel(call.outcome) }}
            </span>
            <span v-if="call.ai_score" class="text-xs font-medium text-dental-blue-0">
              Score: {{ call.ai_score }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'crm', middleware: ['auth'] })

const { getCallHistory } = useVoiceAgent()

const recentCalls = ref<any[]>([])
const stats = ref({
  totalCalls: 0,
  qualified: 0,
  noContact: 0,
  avgScore: 0,
})

const outcomeClass = (outcome: string) => {
  const map: Record<string, string> = {
    qualified: 'bg-green-50 text-green-600',
    not_qualified: 'bg-red-50 text-red-600',
    no_contact: 'bg-amber-50 text-amber-600',
    callback: 'bg-blue-50 text-blue-600',
  }
  return map[outcome] || 'bg-gray-100 text-gray-600'
}

const outcomeLabel = (outcome: string) => {
  const map: Record<string, string> = {
    qualified: 'Qualifiziert',
    not_qualified: 'Nicht qualifiziert',
    no_contact: 'Nicht erreicht',
    callback: 'Rueckruf',
  }
  return map[outcome] || outcome
}

const formatDate = (date: string) => {
  try { return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) }
  catch { return date }
}

onMounted(async () => {
  try {
    // Load recent calls - pass empty string to get all
    const calls = await getCallHistory('')
    recentCalls.value = calls || []

    // Calculate stats
    stats.value.totalCalls = recentCalls.value.length
    stats.value.qualified = recentCalls.value.filter((c: any) => c.outcome === 'qualified').length
    stats.value.noContact = recentCalls.value.filter((c: any) => c.outcome === 'no_contact').length
    const scores = recentCalls.value.filter((c: any) => c.ai_score).map((c: any) => c.ai_score)
    stats.value.avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0
  } catch {
    // No calls yet
  }
})
</script>
