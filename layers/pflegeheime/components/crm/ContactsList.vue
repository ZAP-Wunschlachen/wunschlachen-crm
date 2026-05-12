<template>
  <div>
    <div v-if="loading" class="flex justify-center py-4">
      <i class="pi pi-spin pi-spinner text-gray-400" />
    </div>

    <div v-else-if="contacts.length === 0" class="text-sm text-gray-400 text-center py-4">
      Keine Ansprechpartner hinterlegt
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="contact in contacts"
        :key="contact.id"
        class="flex items-start gap-3 p-3 rounded-lg"
        :class="contact.is_primary ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'"
      >
        <!-- Avatar -->
        <div
          class="flex items-center justify-center w-9 h-9 rounded-full text-xs font-semibold flex-shrink-0"
          :class="contact.is_primary ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'"
        >
          {{ initials(contact) }}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ fullName(contact) }}
            </p>
            <span
              v-if="contact.is_primary"
              class="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium"
            >
              Hauptkontakt
            </span>
          </div>
          <p v-if="contact.job_title" class="text-xs text-gray-500 mt-0.5">
            {{ contact.job_title }}
          </p>

          <!-- Contact details -->
          <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            <a
              v-if="contact.phone"
              :href="`tel:${contact.phone}`"
              class="flex items-center gap-1 text-xs text-gray-500 hover:text-[#172774]"
            >
              <i class="pi pi-phone text-[10px]" />
              {{ contact.phone }}
            </a>
            <a
              v-if="contact.mobile"
              :href="`tel:${contact.mobile}`"
              class="flex items-center gap-1 text-xs text-gray-500 hover:text-[#172774]"
            >
              <i class="pi pi-mobile text-[10px]" />
              {{ contact.mobile }}
            </a>
            <a
              v-if="contact.email"
              :href="`mailto:${contact.email}`"
              class="flex items-center gap-1 text-xs text-gray-500 hover:text-[#172774]"
            >
              <i class="pi pi-envelope text-[10px]" />
              {{ contact.email }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NursingHomeContact } from '~/types/crm'

defineProps<{
  contacts: NursingHomeContact[]
  loading?: boolean
}>()

const fullName = (c: NursingHomeContact) =>
  [c.first_name, c.last_name].filter(Boolean).join(' ') || '–'

const initials = (c: NursingHomeContact) => {
  const f = c.first_name?.[0] || ''
  const l = c.last_name?.[0] || ''
  return (f + l).toUpperCase() || '?'
}
</script>
