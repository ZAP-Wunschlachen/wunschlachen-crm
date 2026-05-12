<template>
  <div class="flex flex-col h-full p-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-dental-blue-0">Pipeline</h1>
      <button
        class="px-5 py-2 text-sm font-semibold text-white bg-dental-blue-0 rounded-lg hover:bg-dental-blue-1 flex items-center gap-2"
        @click="showCreate = true"
      >
        <i class="pi pi-plus text-xs" />
        Neuer Lead
      </button>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center text-dental-blue--3">
      Lade Pipeline...
    </div>

    <PatientenPipelineKanban
      v-else
      :leads="allLeads"
      class="flex-1"
      @select="(lead) => navigateTo(`/patienten/leads/${lead.id}`)"
      @status-change="onStatusChange"
    />

    <PatientenCreateLeadDialog v-model:visible="showCreate" @created="loadLeads" />
  </div>
</template>

<script setup lang="ts">
import type { Lead, LeadStatus } from '~/types/crm'

definePageMeta({ layout: 'crm', middleware: ['auth'] })

const allLeads = ref<Lead[]>([])
const loading = ref(true)
const showCreate = ref(false)

const loadLeads = async () => {
  loading.value = true
  try {
    const { fetchLeads, pagination } = usePatientLeads()
    pagination.value.limit = 500
    const result = await fetchLeads({}, ['-date_updated'], 1)
    allLeads.value = result
  } catch (err) {
    console.error('Failed to load pipeline:', err)
  } finally {
    loading.value = false
  }
}

const onStatusChange = async (id: string, newStatus: LeadStatus) => {
  const lead = allLeads.value.find(l => l.id === id)
  if (lead) lead.status = newStatus

  try {
    const { updateLead } = usePatientLeads()
    await updateLead(id, { status: newStatus })
  } catch (err) {
    console.error('Status update failed:', err)
    await loadLeads()
  }
}

onMounted(loadLeads)
</script>
