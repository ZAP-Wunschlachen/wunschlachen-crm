<template>
  <div class="bg-white rounded-lg border border-gray-200/80 p-4">
    <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Standort</h3>

    <div v-if="mapQuery" class="rounded-lg overflow-hidden border border-gray-200">
      <iframe
        :src="`https://maps.google.com/maps?q=${mapQuery}&output=embed&hl=de`"
        class="w-full h-[200px]"
        style="border: 0"
        loading="lazy"
        allowfullscreen
      />
    </div>

    <div v-else class="text-center py-6">
      <i class="pi pi-map-marker text-xl text-gray-200 mb-2" />
      <p class="text-[11px] text-gray-400">Keine Standortdaten vorhanden</p>
    </div>

    <div v-if="address" class="flex items-center justify-between mt-2">
      <p class="text-[11px] text-gray-500 flex items-center gap-1">
        <i class="pi pi-map-marker text-[10px] text-gray-400" />
        {{ address }}
      </p>
      <a
        :href="`https://www.google.com/maps/search/${encodeURIComponent(address)}`"
        target="_blank"
        class="text-[10px] text-[#172774] hover:underline font-medium flex-shrink-0 ml-2"
      >
        Google Maps
        <i class="pi pi-external-link text-[8px] ml-0.5" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NursingHome } from '~/types/crm'

const props = defineProps<{
  nursingHome: NursingHome | null
}>()

const address = computed(() => {
  if (!props.nursingHome) return null
  const nh = props.nursingHome
  const street = [nh.Street, nh.number].filter(Boolean).join(' ')
  const city = [nh.zip, nh.city].filter(Boolean).join(' ')
  return [street, city].filter(Boolean).join(', ') || null
})

const mapQuery = computed(() => {
  if (!props.nursingHome) return null
  const nh = props.nursingHome

  // Prefer coordinates
  if (nh.coordinates_lat && nh.coordinates_lon) {
    return encodeURIComponent(`${nh.coordinates_lat},${nh.coordinates_lon}`)
  }

  // Fallback to address
  if (address.value) {
    return encodeURIComponent(address.value)
  }

  // Fallback to name + city
  if (nh.name && nh.city) {
    return encodeURIComponent(`${nh.name}, ${nh.city}`)
  }

  return null
})
</script>
