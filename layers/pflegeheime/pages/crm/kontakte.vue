<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <h2 class="text-[14px] font-semibold text-gray-800">Kontakte</h2>
        <span v-if="filteredContacts.length > 0" class="text-[11px] text-gray-400 tabular-nums">{{ filteredContacts.length }}</span>
      </div>
    </div>

    <!-- Search -->
    <div class="flex flex-wrap items-center gap-2 mb-3">
      <div class="relative flex-1 min-w-[180px] max-w-xs">
        <i class="pi pi-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Name, E-Mail, Telefon..."
          class="w-full pl-7 pr-3 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40 transition-all"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg border border-gray-200/80 overflow-hidden">
      <table class="w-full text-[12px]">
        <thead>
          <tr class="border-b border-gray-100 bg-gray-50/60">
            <th class="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Name</th>
            <th class="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Position</th>
            <th class="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pflegeheim</th>
            <th class="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">E-Mail</th>
            <th class="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Telefon</th>
            <th class="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Mobil</th>
            <th class="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Aktionen</th>
          </tr>
        </thead>
        <tbody v-if="loading">
          <tr><td colspan="7" class="text-center py-10 text-gray-300"><i class="pi pi-spin pi-spinner" /></td></tr>
        </tbody>
        <tbody v-else-if="filteredContacts.length === 0">
          <tr>
            <td colspan="7" class="text-center py-10">
              <div class="flex flex-col items-center gap-2">
                <i class="pi pi-users text-[24px] text-gray-300" />
                <p class="text-[13px] text-gray-400">Keine Kontakte gefunden</p>
                <p v-if="searchQuery" class="text-[11px] text-gray-300">Versuchen Sie einen anderen Suchbegriff</p>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr
            v-for="contact in filteredContacts"
            :key="contact.id"
            class="border-b border-gray-50 hover:bg-[#172774]/[0.02] cursor-pointer transition-colors"
            @click="navigateToLead(contact)"
          >
            <td class="px-3 py-2">
              <div class="flex items-center gap-2">
                <div
                  class="flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-semibold flex-shrink-0"
                  :class="contact.is_primary ? 'bg-[#172774]/10 text-[#172774]' : 'bg-gray-100 text-gray-500'"
                >
                  {{ initials(contact) }}
                </div>
                <div>
                  <span class="font-medium text-gray-900 text-[13px]">{{ fullName(contact) }}</span>
                  <span
                    v-if="contact.is_primary"
                    class="ml-1.5 text-[9px] px-1.5 py-0.5 bg-[#172774]/10 text-[#172774] rounded-full font-semibold uppercase tracking-wide"
                  >
                    Primär
                  </span>
                </div>
              </div>
            </td>
            <td class="px-3 py-2 text-gray-500">{{ contact.job_title || '–' }}</td>
            <td class="px-3 py-2">
              <span class="font-medium text-gray-700">{{ getNursingHomeName(contact) }}</span>
            </td>
            <td class="px-3 py-2 text-gray-500">{{ contact.email || '–' }}</td>
            <td class="px-3 py-2 text-gray-500 tabular-nums">{{ contact.phone || '–' }}</td>
            <td class="px-3 py-2 text-gray-500 tabular-nums">{{ contact.mobile || '–' }}</td>
            <td class="px-3 py-2" @click.stop>
              <div class="flex items-center gap-1">
                <a
                  v-if="contact.email"
                  :href="`mailto:${contact.email}`"
                  class="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded hover:bg-[#172774] hover:text-white hover:border-[#172774] transition-colors"
                  title="E-Mail senden"
                >
                  <i class="pi pi-envelope text-[9px]" />
                  E-Mail
                </a>
                <a
                  v-if="contact.phone || contact.mobile"
                  :href="`tel:${contact.mobile || contact.phone}`"
                  class="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded hover:bg-[#172774] hover:text-white hover:border-[#172774] transition-colors"
                  title="Anrufen"
                >
                  <i class="pi pi-phone text-[9px]" />
                  Anrufen
                </a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NursingHomeContact } from '~/types/crm'
import { getLocalLeads } from '~/composables/usePflegeheimLeads'

definePageMeta({ layout: 'crm', middleware: 'auth' })

const { contacts, fetchAllContacts } = useContacts()

const searchQuery = ref('')
const loading = ref(false)
const leadMap = ref<Record<string, string>>({})

const fullName = (c: NursingHomeContact) =>
  [c.first_name, c.last_name].filter(Boolean).join(' ') || '–'

const initials = (c: NursingHomeContact) => {
  const f = c.first_name?.[0] || ''
  const l = c.last_name?.[0] || ''
  return (f + l).toUpperCase() || '?'
}

const getNursingHomeName = (c: NursingHomeContact) => {
  if (typeof c.nursing_home_id === 'object' && c.nursing_home_id) return c.nursing_home_id.name || '–'
  return '–'
}

const getNursingHomeId = (c: NursingHomeContact): string | null => {
  if (typeof c.nursing_home_id === 'object' && c.nursing_home_id) return c.nursing_home_id.id
  if (typeof c.nursing_home_id === 'string') return c.nursing_home_id
  return null
}

const filteredContacts = computed(() => {
  if (!searchQuery.value) return contacts.value
  const q = searchQuery.value.toLowerCase()
  return contacts.value.filter((c) => {
    const name = fullName(c).toLowerCase()
    const email = (c.email || '').toLowerCase()
    const phone = (c.phone || '').toLowerCase()
    const mobile = (c.mobile || '').toLowerCase()
    const nhName = getNursingHomeName(c).toLowerCase()
    return name.includes(q) || email.includes(q) || phone.includes(q) || mobile.includes(q) || nhName.includes(q)
  })
})

const navigateToLead = (contact: NursingHomeContact) => {
  const nhId = getNursingHomeId(contact)
  if (nhId && leadMap.value[nhId]) {
    navigateTo(`/crm/leads/${leadMap.value[nhId]}`)
  }
}

const loadLeadMap = () => {
  try {
    const leads = getLocalLeads()
    const map: Record<string, string> = {}
    for (const lead of leads) {
      const nhId = typeof lead.nursing_home_id === 'object'
        ? (lead.nursing_home_id as any)?.id
        : lead.nursing_home_id
      if (nhId) map[nhId] = lead.id
    }
    leadMap.value = map
  } catch (err) {
    console.error('Failed to load lead map:', err)
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchAllContacts(),
      loadLeadMap(),
    ])
  } finally {
    loading.value = false
  }
})
</script>
