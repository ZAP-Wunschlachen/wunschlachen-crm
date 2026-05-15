<template>
  <div class="bg-white rounded-lg border border-dental-blue--5 overflow-hidden">
    <header class="flex items-center justify-between px-4 py-3 border-b border-dental-blue--5">
      <div>
        <h3 class="text-sm font-semibold text-dental-blue-0 flex items-center gap-2">
          <i class="pi pi-chart-bar text-dental-blue--2" />
          Verlust-Analyse
        </h3>
        <p class="text-[10px] text-dental-blue--3 mt-0.5">Warum verlieren wir Leads?</p>
      </div>
      <div class="flex items-center gap-2">
        <select v-model="period" class="text-[11px] border border-dental-blue--5 rounded px-2 py-1 bg-white">
          <option value="30">Letzte 30 Tage</option>
          <option value="90">Letzte 90 Tage</option>
          <option value="365">Letzte 12 Monate</option>
          <option value="all">Alle</option>
        </select>
        <button
          class="text-[11px] text-dental-blue--1 hover:text-dental-blue-0"
          :disabled="loading"
          @click="loadStats"
        >
          <i :class="loading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'" class="text-[10px]" />
        </button>
      </div>
    </header>

    <div v-if="error" class="px-4 py-3 text-[11px] text-red-600 bg-red-50">
      Fehler: {{ error }}
    </div>

    <div v-else-if="loading && !stats" class="px-4 py-6 text-center text-[11px] text-dental-blue--3">
      <i class="pi pi-spin pi-spinner text-[14px] mb-1 block" />
      Lade Statistik …
    </div>

    <div v-else-if="!stats || stats.total === 0" class="px-4 py-6 text-center text-[11px] text-dental-blue--3">
      Keine verlorenen Leads im gewählten Zeitraum.
    </div>

    <div v-else class="px-4 py-3">
      <!-- Summary -->
      <div class="flex items-baseline gap-3 mb-3">
        <span class="text-2xl font-bold text-dental-blue-0">{{ stats.total }}</span>
        <span class="text-[11px] text-dental-blue--3">
          verlorene Leads ·
          <span v-if="stats.without_reason > 0" class="text-amber-600">
            {{ stats.without_reason }} ohne Grund
          </span>
        </span>
      </div>

      <!-- Bar chart -->
      <ul class="space-y-2">
        <li v-for="row in stats.by_reason" :key="row.reason" class="text-[11px]">
          <div class="flex items-baseline justify-between gap-2 mb-0.5">
            <span class="text-dental-blue-0 font-medium truncate">{{ labelFor(row.reason) }}</span>
            <span class="text-dental-blue--2 flex-shrink-0">{{ row.count }} · {{ percent(row.count) }}%</span>
          </div>
          <div class="h-2 bg-dental-blue--6 rounded overflow-hidden">
            <div
              class="h-full rounded transition-all"
              :class="barColor(row.reason)"
              :style="{ width: percent(row.count) + '%' }"
            />
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LOST_REASON_LABELS, type LostReason } from '~/types/crm'

interface LostStats {
  total: number
  with_reason: number
  without_reason: number
  by_reason: { reason: string; count: number }[]
}

const period = ref<'30' | '90' | '365' | 'all'>('90')
const stats = ref<LostStats | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const loadStats = async () => {
  loading.value = true
  error.value = null
  try {
    const params: Record<string, string> = {}
    if (period.value !== 'all') {
      const days = parseInt(period.value, 10)
      const since = new Date(Date.now() - days * 86400000).toISOString()
      params.since = since
    }
    stats.value = await $fetch<LostStats>('/api/leads/lost-stats', { params })
  } catch (e: any) {
    error.value = e?.message || String(e)
  } finally {
    loading.value = false
  }
}

watch(period, loadStats)
onMounted(loadStats)

const labelFor = (reason: string): string => {
  return LOST_REASON_LABELS[reason as LostReason] || reason
}

const percent = (count: number): number => {
  if (!stats.value || stats.value.total === 0) return 0
  return Math.round((count / stats.value.total) * 100)
}

const barColor = (reason: string): string => {
  // Farb-Mapping nach Lost-Reason — Kostenthemen rot, Vertrauen orange, Rest blau
  if (reason === 'too_expensive' || reason === 'no_budget') return 'bg-red-400'
  if (reason === 'missing_trust' || reason === 'other_dentist') return 'bg-amber-400'
  if (reason === 'no-contact-information') return 'bg-gray-400'
  return 'bg-dental-blue--1'
}
</script>
