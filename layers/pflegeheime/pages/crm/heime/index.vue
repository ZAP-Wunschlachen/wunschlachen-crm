<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-5">
      <div>
        <h2 class="text-xl font-semibold text-gray-900">Pflegeheime</h2>
        <p class="text-xs text-gray-400 mt-0.5">
          <span v-if="!loading" class="tabular-nums">{{ heime.length }}</span>
          <span v-else class="inline-block w-6 h-3 bg-gray-100 rounded animate-pulse" />
          Heime
        </p>
      </div>

      <div class="relative">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Suche nach Name, Stadt..."
          class="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-72 focus:outline-none focus:border-gray-400"
        />
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200/80 overflow-hidden">
      <div v-if="loading" class="flex justify-center py-16">
        <i class="pi pi-spin pi-spinner text-2xl text-gray-300" />
      </div>

      <div v-else-if="heime.length === 0" class="text-center py-16 text-sm text-gray-400">
        <i class="pi pi-building text-3xl text-gray-200 block mb-2" />
        {{ searchQuery ? 'Keine Heime gefunden' : 'Noch keine Heime vorhanden' }}
      </div>

      <table v-else class="w-full text-sm">
        <thead class="bg-gray-50/60 border-b border-gray-100">
          <tr>
            <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Name</th>
            <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Adresse</th>
            <th class="text-right px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Betten</th>
            <th class="text-right px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Entfernung</th>
            <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="h in heime"
            :key="h.id"
            class="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/80 cursor-pointer transition-colors"
            @click="navigateTo(`/crm/heime/${h.id}`)"
          >
            <td class="px-4 py-3 font-medium text-gray-900">{{ h.name }}</td>
            <td class="px-4 py-3 text-gray-500">{{ formatAddress(h) }}</td>
            <td class="px-4 py-3 text-right text-gray-600 tabular-nums">{{ h.total_capacity || '-' }}</td>
            <td class="px-4 py-3 text-right text-gray-600 tabular-nums">
              {{ h.distance_from_dental_office ? `${h.distance_from_dental_office} km` : '-' }}
            </td>
            <td class="px-4 py-3 text-gray-500">{{ h.status || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NursingHome } from '../../types/nursing-home'

definePageMeta({ layout: 'crm', middleware: 'auth' })

const { fetchNursingHomes } = useNursingHomes()

const heime = ref<NursingHome[]>([])
const loading = ref(true)
const searchQuery = ref('')

const formatAddress = (h: NursingHome) => {
  const street = [h.Street, h.number].filter(Boolean).join(' ')
  const city = [h.zip, h.city].filter(Boolean).join(' ')
  return [street, city].filter(Boolean).join(', ') || '-'
}

const load = async (search?: string) => {
  loading.value = true
  try {
    heime.value = await fetchNursingHomes({ search, limit: 200 })
  } finally {
    loading.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, (q) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => load(q.trim() || undefined), 250)
})

onMounted(() => load())
</script>
