<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-[16px] font-semibold text-gray-900">Duplikat-Erkennung</h2>
        <p class="text-[12px] text-gray-400 mt-0.5">Potenzielle Duplikate finden und zusammenführen</p>
      </div>
      <div class="flex items-center gap-2">
        <select
          v-model.number="threshold"
          class="px-2 py-1.5 border border-gray-200 rounded-md text-[11px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30"
        >
          <option :value="60">Streng (60+)</option>
          <option :value="40">Normal (40+)</option>
          <option :value="25">Locker (25+)</option>
        </select>
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-colors"
          :class="scanning ? 'bg-gray-400' : 'bg-[#172774] hover:bg-[#3d4a8e]'"
          :disabled="scanning"
          @click="runScan"
        >
          <i v-if="scanning" class="pi pi-spin pi-spinner text-[10px]" />
          <i v-else class="pi pi-search text-[10px]" />
          {{ scanning ? 'Scanne...' : 'Scan starten' }}
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="scanComplete" class="grid grid-cols-3 gap-3 mb-4">
      <div class="bg-white rounded-lg border border-gray-200/80 p-3 text-center">
        <p class="text-[20px] font-bold text-gray-800">{{ totalLeads }}</p>
        <p class="text-[10px] text-gray-400 font-medium">Leads geprüft</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200/80 p-3 text-center">
        <p class="text-[20px] font-bold" :class="totalDuplicates > 0 ? 'text-orange-500' : 'text-green-500'">
          {{ totalDuplicates }}
        </p>
        <p class="text-[10px] text-gray-400 font-medium">Potenzielle Duplikate</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200/80 p-3 text-center">
        <p class="text-[20px] font-bold text-gray-800">{{ duplicateGroups.length }}</p>
        <p class="text-[10px] text-gray-400 font-medium">Gruppen</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!scanComplete && !scanning" class="bg-white rounded-lg border border-gray-200/80 p-12 text-center">
      <div class="w-12 h-12 rounded-full bg-[#f6f6f8] flex items-center justify-center mx-auto mb-3">
        <i class="pi pi-clone text-[20px] text-[#172774]" />
      </div>
      <h3 class="text-[14px] font-semibold text-gray-800 mb-1">Duplikat-Check starten</h3>
      <p class="text-[12px] text-gray-400 max-w-md mx-auto">
        Scannt alle Leads nach ähnlichen Namen, gleicher Adresse, Telefonnummer oder E-Mail und gruppiert potenzielle Duplikate.
      </p>
      <button
        class="mt-4 px-4 py-2 rounded-lg bg-[#172774] hover:bg-[#3d4a8e] text-white text-[12px] font-semibold transition-colors"
        @click="runScan"
      >
        Jetzt scannen
      </button>
    </div>

    <!-- No Duplicates -->
    <div v-else-if="scanComplete && duplicateGroups.length === 0" class="bg-white rounded-lg border border-gray-200/80 p-12 text-center">
      <div class="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
        <i class="pi pi-check-circle text-[20px] text-green-500" />
      </div>
      <h3 class="text-[14px] font-semibold text-gray-800 mb-1">Keine Duplikate gefunden</h3>
      <p class="text-[12px] text-gray-400">Alle {{ totalLeads }} Leads sind einzigartig.</p>
    </div>

    <!-- Duplicate Groups -->
    <div v-else class="space-y-3">
      <div
        v-for="(group, gi) in duplicateGroups"
        :key="gi"
        class="bg-white rounded-lg border border-gray-200/80 overflow-hidden"
      >
        <!-- Group Header -->
        <div class="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-b border-gray-100">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">
              {{ group.matches.length + 1 }}
            </span>
            <span class="text-[12px] font-semibold text-gray-700">
              {{ group.anchorNh?.name || '–' }}
            </span>
            <span class="text-[10px] text-gray-400">
              und {{ group.matches.length }} {{ group.matches.length === 1 ? 'ähnlicher Lead' : 'ähnliche Leads' }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              :class="getScoreClass(Math.max(...group.matches.map(m => m.score)))"
            >
              {{ Math.max(...group.matches.map(m => m.score)) }}% Match
            </span>
          </div>
        </div>

        <!-- Comparison Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-[11px]">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="px-4 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-32">Feld</th>
                <th class="px-4 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  <div class="flex items-center gap-1.5">
                    <i class="pi pi-star-fill text-[8px] text-amber-400" />
                    Original
                  </div>
                </th>
                <th
                  v-for="(match, mi) in group.matches"
                  :key="mi"
                  class="px-4 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Duplikat {{ mi + 1 }}
                  <span class="ml-1 text-[9px] px-1.5 py-0.5 rounded-full" :class="getScoreClass(match.score)">
                    {{ match.score }}%
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="field in comparisonFields" :key="field.key" class="border-b border-gray-50">
                <td class="px-4 py-1.5 text-gray-500 font-medium">{{ field.label }}</td>
                <td class="px-4 py-1.5 text-gray-700">{{ getFieldValue(group.anchorNh, group.anchor, field.key) || '–' }}</td>
                <td
                  v-for="(match, mi) in group.matches"
                  :key="mi"
                  class="px-4 py-1.5"
                  :class="isFieldDifferent(group.anchorNh, group.anchor, match.nh, match.lead, field.key) ? 'text-orange-600 font-medium' : 'text-gray-700'"
                >
                  {{ getFieldValue(match.nh, match.lead, field.key) || '–' }}
                </td>
              </tr>
              <!-- Match reasons -->
              <tr class="border-b border-gray-50">
                <td class="px-4 py-1.5 text-gray-500 font-medium">Match-Gründe</td>
                <td class="px-4 py-1.5 text-gray-400 italic">—</td>
                <td
                  v-for="(match, mi) in group.matches"
                  :key="mi"
                  class="px-4 py-1.5"
                >
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="(reason, ri) in match.reasons"
                      :key="ri"
                      class="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium"
                    >
                      {{ reason }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between px-4 py-3 bg-gray-50/30 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <NuxtLink
              :to="`/crm/leads/${group.anchor.id}`"
              class="text-[10px] font-medium text-[#172774] hover:text-[#3d4a8e] transition-colors flex items-center gap-1"
            >
              <i class="pi pi-external-link text-[9px]" />
              Original öffnen
            </NuxtLink>
            <span class="text-gray-300">|</span>
            <NuxtLink
              v-for="(match, mi) in group.matches"
              :key="mi"
              :to="`/crm/leads/${match.lead.id}`"
              class="text-[10px] font-medium text-[#172774] hover:text-[#3d4a8e] transition-colors flex items-center gap-1"
            >
              <i class="pi pi-external-link text-[9px]" />
              Duplikat {{ mi + 1 }} öffnen
            </NuxtLink>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-for="(match, mi) in group.matches"
              :key="'dismiss-' + mi"
              class="text-[10px] font-medium text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
              @click="handleDismiss(group.anchor.id, match.lead.id)"
            >
              <i class="pi pi-eye-slash text-[9px]" />
              Ignorieren
            </button>
            <button
              v-for="(match, mi) in group.matches"
              :key="'merge-' + mi"
              class="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold text-white bg-[#172774] hover:bg-[#3d4a8e] transition-colors"
              @click="confirmMerge(group.anchor, match.lead, group.anchorNh, match.nh)"
            >
              <i class="pi pi-arrow-right-arrow-left text-[9px]" />
              Zusammenführen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Merge Confirmation Dialog -->
    <Teleport to="body">
      <div v-if="mergeDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="mergeDialog = false">
        <div class="bg-white rounded-xl shadow-2xl w-[480px] max-h-[80vh] overflow-y-auto">
          <div class="p-5 border-b border-gray-100">
            <h3 class="text-[14px] font-semibold text-gray-800">Leads zusammenführen</h3>
            <p class="text-[11px] text-gray-400 mt-1">Welchen Lead möchtest du behalten?</p>
          </div>
          <div class="p-5 space-y-3">
            <!-- Option A: Keep anchor -->
            <button
              class="w-full text-left p-3 rounded-lg border-2 transition-colors"
              :class="mergeKeepId === mergeAnchor?.id ? 'border-[#172774] bg-[#f6f6f8]/50' : 'border-gray-200 hover:border-gray-300'"
              @click="mergeKeepId = mergeAnchor?.id || ''"
            >
              <div class="flex items-center gap-2 mb-1">
                <i class="pi pi-star-fill text-[10px] text-amber-400" />
                <span class="text-[12px] font-semibold text-gray-800">{{ mergeAnchorNh?.name || '–' }}</span>
              </div>
              <p class="text-[10px] text-gray-500">
                {{ [mergeAnchorNh?.Street, mergeAnchorNh?.number].filter(Boolean).join(' ') }},
                {{ [mergeAnchorNh?.zip, mergeAnchorNh?.city].filter(Boolean).join(' ') }}
              </p>
              <p class="text-[10px] text-gray-400">Stage: {{ mergeAnchor?.opportunity_stage }}</p>
            </button>

            <!-- Option B: Keep duplicate -->
            <button
              class="w-full text-left p-3 rounded-lg border-2 transition-colors"
              :class="mergeKeepId === mergeDuplicate?.id ? 'border-[#172774] bg-[#f6f6f8]/50' : 'border-gray-200 hover:border-gray-300'"
              @click="mergeKeepId = mergeDuplicate?.id || ''"
            >
              <div class="flex items-center gap-2 mb-1">
                <i class="pi pi-clone text-[10px] text-orange-400" />
                <span class="text-[12px] font-semibold text-gray-800">{{ mergeDuplicateNh?.name || '–' }}</span>
              </div>
              <p class="text-[10px] text-gray-500">
                {{ [mergeDuplicateNh?.Street, mergeDuplicateNh?.number].filter(Boolean).join(' ') }},
                {{ [mergeDuplicateNh?.zip, mergeDuplicateNh?.city].filter(Boolean).join(' ') }}
              </p>
              <p class="text-[10px] text-gray-400">Stage: {{ mergeDuplicate?.opportunity_stage }}</p>
            </button>

            <div class="bg-amber-50 rounded-lg p-3">
              <p class="text-[10px] text-amber-800">
                <i class="pi pi-info-circle text-[10px] mr-1" />
                Der gelöschte Lead wird entfernt. Seine Aktivitäten, Kontakte und fehlende Datenfelder werden auf den behaltenen Lead übertragen.
              </p>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100">
            <button
              class="px-3 py-1.5 rounded-md text-[11px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
              @click="mergeDialog = false"
            >
              Abbrechen
            </button>
            <button
              class="flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-semibold text-white transition-colors"
              :class="merging || !mergeKeepId ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'"
              :disabled="merging || !mergeKeepId"
              @click="executeMerge"
            >
              <i v-if="merging" class="pi pi-spin pi-spinner text-[10px]" />
              <i v-else class="pi pi-arrow-right-arrow-left text-[10px]" />
              {{ merging ? 'Zusammenführen...' : 'Zusammenführen' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Transition name="slide-up">
      <div v-if="toast" class="fixed bottom-4 right-4 z-50 px-4 py-2.5 rounded-lg shadow-lg text-[12px] font-medium" :class="toastOk ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
        {{ toast }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { NursingHome, NursingHomeLead } from '~/types/crm'

definePageMeta({ layout: 'crm', middleware: 'auth' })

const {
  duplicateGroups,
  scanning,
  scanComplete,
  totalLeads,
  totalDuplicates,
  scanForDuplicates,
  mergeLeads,
  dismissPair,
} = useDuplicates()

const threshold = ref(40)
const toast = ref('')
const toastOk = ref(true)

const showToast = (msg: string, ok = true) => {
  toast.value = msg
  toastOk.value = ok
  setTimeout(() => { toast.value = '' }, 3000)
}

const runScan = () => {
  scanForDuplicates(threshold.value)
}

// ─── Comparison table fields ────────────────────────────────

const comparisonFields = [
  { key: 'name', label: 'Name' },
  { key: 'street', label: 'Straße' },
  { key: 'zip', label: 'PLZ' },
  { key: 'city', label: 'Ort' },
  { key: 'fone', label: 'Telefon' },
  { key: 'email', label: 'E-Mail' },
  { key: 'capacity', label: 'Betten' },
  { key: 'stage', label: 'Stage' },
]

const getFieldValue = (nh: NursingHome | null, lead: NursingHomeLead, key: string): string => {
  switch (key) {
    case 'name': return nh?.name || ''
    case 'street': return [nh?.Street, nh?.number].filter(Boolean).join(' ')
    case 'zip': return nh?.zip || ''
    case 'city': return nh?.city || ''
    case 'fone': return nh?.fone || ''
    case 'email': return nh?.email || ''
    case 'capacity': return nh?.total_capacity?.toString() || ''
    case 'stage': return lead.opportunity_stage || ''
    default: return ''
  }
}

const isFieldDifferent = (nhA: NursingHome | null, leadA: NursingHomeLead, nhB: NursingHome | null, leadB: NursingHomeLead, key: string): boolean => {
  const vA = getFieldValue(nhA, leadA, key)
  const vB = getFieldValue(nhB, leadB, key)
  return vA !== vB && vA !== '' && vB !== ''
}

const getScoreClass = (score: number): string => {
  if (score >= 70) return 'bg-red-100 text-red-700'
  if (score >= 50) return 'bg-orange-100 text-orange-700'
  return 'bg-amber-100 text-amber-700'
}

// ─── Dismiss ────────────────────────────────────────────────

const handleDismiss = (idA: string, idB: string) => {
  dismissPair(idA, idB)
  showToast('Duplikat-Paar ignoriert')
}

// ─── Merge Dialog ───────────────────────────────────────────

const mergeDialog = ref(false)
const mergeAnchor = ref<NursingHomeLead | null>(null)
const mergeDuplicate = ref<NursingHomeLead | null>(null)
const mergeAnchorNh = ref<NursingHome | null>(null)
const mergeDuplicateNh = ref<NursingHome | null>(null)
const mergeKeepId = ref('')
const merging = ref(false)

const confirmMerge = (anchor: NursingHomeLead, duplicate: NursingHomeLead, anchorNh: NursingHome | null, dupNh: NursingHome | null) => {
  mergeAnchor.value = anchor
  mergeDuplicate.value = duplicate
  mergeAnchorNh.value = anchorNh
  mergeDuplicateNh.value = dupNh
  mergeKeepId.value = anchor.id
  mergeDialog.value = true
}

const executeMerge = async () => {
  if (!mergeAnchor.value || !mergeDuplicate.value || !mergeKeepId.value) return
  merging.value = true

  try {
    const removeId = mergeKeepId.value === mergeAnchor.value.id
      ? mergeDuplicate.value.id
      : mergeAnchor.value.id

    await mergeLeads(mergeKeepId.value, removeId)
    mergeDialog.value = false
    showToast('Leads erfolgreich zusammengeführt!')
  } catch (err: any) {
    showToast(err.message || 'Fehler beim Zusammenführen', false)
  } finally {
    merging.value = false
  }
}
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(10px); }
</style>
