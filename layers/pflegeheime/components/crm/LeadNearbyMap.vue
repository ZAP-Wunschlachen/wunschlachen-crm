<template>
  <div class="bg-white rounded-lg border border-gray-200/80 p-4">
    <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Umgebung</h3>

    <div v-if="loading" class="flex justify-center py-6">
      <i class="pi pi-spin pi-spinner text-gray-300" />
    </div>

    <template v-else-if="currentCoords">
      <!-- Map centered on current lead -->
      <div class="rounded-lg overflow-hidden border border-gray-200 mb-3">
        <iframe
          :src="`https://maps.google.com/maps?q=${currentCoords.lat},${currentCoords.lon}&z=11&output=embed&hl=de`"
          class="w-full h-[220px]"
          style="border: 0"
          loading="lazy"
          allowfullscreen
        />
      </div>

      <!-- Cooperations -->
      <div v-if="nearbyCooperations.length > 0" class="mb-3">
        <p class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          <i class="pi pi-star-fill text-[9px] text-amber-500 mr-1" />
          Nächste Kooperationen
        </p>
        <div class="space-y-1">
          <NuxtLink
            v-for="item in nearbyCooperations"
            :key="item.lead.id"
            :to="`/crm/leads/${item.lead.id}`"
            class="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors group"
          >
            <div class="flex-1 min-w-0">
              <p class="text-[12px] font-medium text-gray-700 truncate group-hover:text-[#172774]">
                {{ getNursingHomeName(item.lead) }}
              </p>
              <p class="text-[10px] text-gray-400 truncate">{{ getNursingHomeCity(item.lead) }}</p>
            </div>
            <span class="text-[11px] font-semibold text-amber-600 ml-2 flex-shrink-0">
              {{ item.distance.toFixed(1) }} km
            </span>
          </NuxtLink>
        </div>
      </div>

      <!-- Nearby leads -->
      <div v-if="nearbyLeads.length > 0">
        <p class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          <i class="pi pi-map-marker text-[9px] text-[#172774] mr-1" />
          Nächste Leads
        </p>
        <div class="space-y-1">
          <NuxtLink
            v-for="item in nearbyLeads"
            :key="item.lead.id"
            :to="`/crm/leads/${item.lead.id}`"
            class="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors group"
          >
            <div class="flex-1 min-w-0">
              <p class="text-[12px] font-medium text-gray-700 truncate group-hover:text-[#172774]">
                {{ getNursingHomeName(item.lead) }}
              </p>
              <p class="text-[10px] text-gray-400 truncate">
                {{ getNursingHomeCity(item.lead) }}
                <span class="ml-1 text-gray-300">·</span>
                <span class="ml-1">{{ getStageLabel(item.lead.opportunity_stage) }}</span>
              </p>
            </div>
            <span class="text-[11px] font-semibold text-[#172774] ml-2 flex-shrink-0">
              {{ item.distance.toFixed(1) }} km
            </span>
          </NuxtLink>
        </div>
      </div>

      <div v-if="nearbyCooperations.length === 0 && nearbyLeads.length === 0" class="text-center py-4">
        <p class="text-[11px] text-gray-400">Keine Leads in der Nähe gefunden</p>
      </div>
    </template>

    <div v-else class="text-center py-6">
      <i class="pi pi-map text-xl text-gray-200 mb-2" />
      <p class="text-[11px] text-gray-400">Standort konnte nicht ermittelt werden</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NursingHomeLead, NursingHome, OpportunityStage } from '~/types/crm'

const props = defineProps<{
  currentLead: NursingHomeLead
  nursingHome: NursingHome | null
}>()

const { leads: allLeads, fetchLeads, pagination } = usePflegeheimLeads()
const { getCoordinates } = useGeocode()
const loading = ref(true)

interface NearbyItem {
  lead: NursingHomeLead
  distance: number
}

const currentCoords = ref<{ lat: number; lon: number } | null>(null)
const nearbyCooperations = ref<NearbyItem[]>([])
const nearbyLeads = ref<NearbyItem[]>([])

const getNursingHome = (lead: NursingHomeLead): NursingHome | null => {
  if (typeof lead.nursing_home_id === 'object' && lead.nursing_home_id) return lead.nursing_home_id
  return null
}

const getNursingHomeName = (lead: NursingHomeLead) =>
  getNursingHome(lead)?.name || '–'

const getNursingHomeCity = (lead: NursingHomeLead) => {
  const nh = getNursingHome(lead)
  return nh ? [nh.zip, nh.city].filter(Boolean).join(' ') : ''
}

const getStageLabel = (stage?: OpportunityStage) => stage || '–'

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const isCooperationPartner = (lead: NursingHomeLead): boolean => {
  // A cooperation partner has stage "Won" or the nursing home has status "published"
  if (lead.opportunity_stage === 'Won') return true
  const nh = getNursingHome(lead)
  if (nh && (nh as any).status === 'published') return true
  return false
}

const computeNearby = async () => {
  if (!currentCoords.value) return
  const { lat, lon } = currentCoords.value

  const items: NearbyItem[] = []

  for (const l of allLeads.value) {
    if (l.id === props.currentLead.id) continue
    const nh = getNursingHome(l)
    if (!nh) continue

    // Only use leads with stored coordinates — no geocoding to avoid infinite loading
    if (nh.coordinates_lat && nh.coordinates_lon) {
      // Distance from currently viewed nursing home
      items.push({
        lead: l,
        distance: haversine(lat, lon, nh.coordinates_lat, nh.coordinates_lon),
      })
    }
  }

  items.sort((a, b) => a.distance - b.distance)

  nearbyCooperations.value = items
    .filter(item => isCooperationPartner(item.lead))
    .slice(0, 3)

  nearbyLeads.value = items
    .filter(item => !isCooperationPartner(item.lead))
    .slice(0, 3)
}

onMounted(async () => {
  loading.value = true
  try {
    if (props.nursingHome) {
      currentCoords.value = await getCoordinates(props.nursingHome)
    }
    if (!currentCoords.value) { loading.value = false; return }

    const prevLimit = pagination.value.limit
    pagination.value.limit = 500
    await fetchLeads()
    pagination.value.limit = prevLimit

    await computeNearby()
  } catch (err) {
    console.error('Failed to load nearby leads:', err)
  } finally {
    loading.value = false
  }
})
</script>
