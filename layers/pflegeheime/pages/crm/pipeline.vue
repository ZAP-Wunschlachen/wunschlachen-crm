<template>
  <div>
    <!-- Header + Filters -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-base font-semibold text-gray-900">Pipeline</h2>
      <div class="flex items-center gap-3">
        <select
          v-model="priorityFilter"
          class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#172774]/20"
          @change="loadPipeline"
        >
          <option :value="null">Alle Prioritaeten</option>
          <option value="high">Hoch</option>
          <option value="medium">Mittel</option>
          <option value="low">Niedrig</option>
        </select>
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors"
          :class="showClosed ? 'bg-gray-100 border-gray-300 text-gray-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'"
          @click="showClosed = !showClosed"
        >
          <i class="pi pi-eye text-xs" />
          Won/Lost/Cancelled
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <i class="pi pi-spin pi-spinner text-2xl text-gray-300" />
    </div>

    <!-- Kanban -->
    <CrmPipelineKanban
      v-else
      :leads="leads"
      :stages="visibleStages"
      :primary-contacts="primaryContacts"
      @stage-change="handleStageChange"
    />

    <!-- Save feedback -->
    <Transition name="fade">
      <div
        v-if="saveMessage"
        class="fixed bottom-6 right-6 px-4 py-2 rounded-lg text-sm shadow-lg"
        :class="saveError ? 'bg-red-500 text-white' : 'bg-green-500 text-white'"
      >
        {{ saveMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'crm', middleware: 'auth' })

const PIPELINE_STAGES = ['Unqualified', 'Qualified', 'Follow-up', 'Presentation', 'Email', 'Emergency', 'Won', 'Lost', 'Cancelled']

const { fetchLeads, updateLead, pagination } = usePflegeheimLeads()
const { fetchPrimaryContact } = useContacts()

const leads = ref<any[]>([])
const primaryContacts = ref<Record<string, string | null>>({})
const loading = ref(true)
const priorityFilter = ref<string | null>(null)
const showClosed = ref(false)
const saveMessage = ref('')
const saveError = ref(false)

const activeStages = PIPELINE_STAGES.filter(
  s => !['Won', 'Lost', 'Cancelled'].includes(s)
)

const visibleStages = computed(() =>
  showClosed.value ? PIPELINE_STAGES : activeStages
)

const loadPipeline = async () => {
  loading.value = true
  try {
    const prevLimit = pagination.value.limit
    pagination.value.limit = 1000
    const result = await fetchLeads(
      { priority: priorityFilter.value },
      ['opportunity_stage', '-follow_up_date'],
    )
    pagination.value.limit = prevLimit
    leads.value = result

    const nursingHomeIds = new Set<string>()
    result.forEach(lead => {
      const id = typeof lead.nursing_home_id === 'object'
        ? lead.nursing_home_id?.id
        : lead.nursing_home_id
      if (id) nursingHomeIds.add(id)
    })

    const contactPromises = Array.from(nursingHomeIds).map(async (nhId) => {
      try {
        const contact = await fetchPrimaryContact(nhId)
        if (contact) {
          primaryContacts.value[nhId] = [contact.first_name, contact.last_name]
            .filter(Boolean).join(' ')
        } else {
          primaryContacts.value[nhId] = null
        }
      } catch {
        primaryContacts.value[nhId] = null
      }
    })

    await Promise.all(contactPromises)
  } finally {
    loading.value = false
  }
}

const handleStageChange = async (leadId: string, newStage: string) => {
  saveMessage.value = ''
  saveError.value = false

  const lead = leads.value.find(l => l.id === leadId)
  const oldStage = lead?.opportunity_stage
  if (lead) {
    lead.opportunity_stage = newStage
    lead.date_updated = new Date().toISOString()
  }

  try {
    await updateLead(leadId, { opportunity_stage: newStage })
    const name = typeof lead?.nursing_home_id === 'object' ? lead.nursing_home_id?.name || 'Lead' : 'Lead'
    saveMessage.value = `"${name}" -> ${newStage}`
    setTimeout(() => { saveMessage.value = '' }, 2500)
  } catch {
    if (lead && oldStage) lead.opportunity_stage = oldStage
    saveError.value = true
    saveMessage.value = 'Fehler beim Verschieben'
    setTimeout(() => { saveMessage.value = '' }, 3000)
  }
}

onMounted(loadPipeline)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
