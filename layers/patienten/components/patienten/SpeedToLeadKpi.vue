<template>
  <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs text-dental-blue--2 font-medium">Speed to Lead</p>
        <p class="text-2xl font-bold mt-1" :class="color">{{ label }}</p>
        <p class="text-[10px] text-dental-blue--3 mt-0.5">Durchschn. Reaktionszeit auf neue Leads</p>
      </div>
      <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="bgColor">
        <i class="pi pi-bolt text-sm" :class="color" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Lead } from '~/types/crm'

const { getAverageResponseTime } = useResponseTime()
const { getAllActivities } = useLeadActivities()

const label = ref('--')
const color = ref('text-dental-blue--3')
const bgColor = ref('bg-dental-blue--5')

onMounted(async () => {
  try {
    const { fetchLeads, pagination } = useLeads()
    pagination.value.limit = 200
    const leads = await fetchLeads({}, ['-date_created'], 1)

    const activitiesByLead: Record<string, any[]> = {}
    for (const a of getAllActivities()) {
      if (!activitiesByLead[a.lead_id]) activitiesByLead[a.lead_id] = []
      activitiesByLead[a.lead_id].push(a)
    }

    const result = getAverageResponseTime(leads, activitiesByLead)
    label.value = result.label

    if (result.color === 'green') { color.value = 'text-green-600'; bgColor.value = 'bg-green-50' }
    else if (result.color === 'yellow') { color.value = 'text-amber-600'; bgColor.value = 'bg-amber-50' }
    else if (result.color === 'red') { color.value = 'text-red-500'; bgColor.value = 'bg-red-50' }
  } catch {
    label.value = 'Keine Daten'
  }
})
</script>
