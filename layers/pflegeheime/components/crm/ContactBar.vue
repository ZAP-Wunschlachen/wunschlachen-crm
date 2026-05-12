<template>
  <div>
    <div v-if="loading" class="flex justify-center py-6">
      <i class="pi pi-spin pi-spinner text-gray-400" />
    </div>

    <div v-else-if="contacts.length === 0 && !editing" class="text-center py-6">
      <p class="text-[12px] text-gray-400 mb-2">Keine Ansprechpartner hinterlegt</p>
      <button
        @click="startAdd"
        class="text-[11px] text-[#172774] hover:text-[#3d4a8e] font-medium transition-colors"
      >
        <i class="pi pi-plus text-[9px] mr-0.5" />
        Ansprechpartner hinzufügen
      </button>
    </div>

    <div v-else>
      <!-- Tab selector for multiple contacts -->
      <div v-if="contacts.length > 1 && !editing" class="flex border-b border-gray-200 mb-3 -mx-4 px-4">
        <button
          v-for="(contact, idx) in contacts"
          :key="contact.id"
          class="flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium border-b-2 transition-colors mr-1"
          :class="selectedIndex === idx
            ? 'border-[#172774] text-[#172774]'
            : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'"
          @click="selectedIndex = idx"
        >
          {{ fullName(contact) }}
          <span v-if="contact.job_title" class="text-[10px] text-gray-400 font-normal">{{ contact.job_title }}</span>
        </button>
      </div>

      <!-- View mode -->
      <div v-if="selectedContact && !editing" class="space-y-3">
        <!-- Contact header -->
        <div class="flex items-center gap-3">
          <div
            class="flex items-center justify-center w-11 h-11 rounded-full text-[13px] font-semibold flex-shrink-0"
            :class="selectedContact.is_primary ? 'bg-[#172774]/10 text-[#172774]' : 'bg-gray-100 text-gray-600'"
          >
            {{ initials(selectedContact) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-[13px] font-semibold text-gray-900 truncate">{{ fullName(selectedContact) }}</p>
              <span
                v-if="selectedContact.is_primary"
                class="text-[9px] px-1.5 py-0.5 bg-[#172774]/10 text-[#172774] rounded-full font-semibold uppercase tracking-wide"
              >
                Primär
              </span>
            </div>
            <p v-if="selectedContact.job_title" class="text-[11px] text-gray-500 mt-0.5">{{ selectedContact.job_title }}</p>
          </div>
          <!-- Edit / Delete -->
          <div class="flex items-center gap-1 flex-shrink-0">
            <button
              @click="startEdit(selectedContact)"
              class="p-1.5 text-gray-400 hover:text-[#172774] transition-colors rounded hover:bg-gray-50"
              title="Bearbeiten"
            >
              <i class="pi pi-pencil text-[11px]" />
            </button>
            <button
              @click="handleDelete(selectedContact)"
              class="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded hover:bg-gray-50"
              title="Löschen"
            >
              <i class="pi pi-trash text-[11px]" />
            </button>
          </div>
        </div>

        <!-- Quick action buttons -->
        <div class="flex gap-1.5">
          <CrmPhoneButton
            v-if="selectedContact.phone || selectedContact.mobile"
            :phone-number="selectedContact.mobile || selectedContact.phone"
            :contact="selectedContact"
            @dialing="$emit('call', selectedContact)"
          />
          <button
            v-if="selectedContact.email"
            class="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-[#172774] hover:text-white hover:border-[#172774] transition-colors"
            @click="$emit('email', selectedContact)"
          >
            <i class="pi pi-envelope text-[10px]" />
            E-Mail
          </button>
          <button
            v-if="selectedContact.mobile"
            class="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-[#172774] hover:text-white hover:border-[#172774] transition-colors"
            @click="$emit('sms', selectedContact)"
          >
            <i class="pi pi-comment text-[10px]" />
            SMS
          </button>
          <a
            v-if="selectedContact.mobile"
            :href="`https://wa.me/${cleanPhone(selectedContact.mobile)}`"
            target="_blank"
            class="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors"
          >
            <i class="pi pi-comments text-[10px]" />
            WhatsApp
          </a>
        </div>

        <!-- Contact details -->
        <div class="space-y-1.5 pt-1">
          <a
            v-if="selectedContact.phone"
            :href="`tel:${selectedContact.phone}`"
            class="flex items-center gap-2 text-[11px] text-gray-600 hover:text-[#172774] transition-colors"
          >
            <i class="pi pi-phone text-[10px] text-gray-400 w-4 text-center" />
            {{ selectedContact.phone }}
          </a>
          <a
            v-if="selectedContact.mobile"
            :href="`tel:${selectedContact.mobile}`"
            class="flex items-center gap-2 text-[11px] text-gray-600 hover:text-[#172774] transition-colors"
          >
            <i class="pi pi-mobile text-[10px] text-gray-400 w-4 text-center" />
            {{ selectedContact.mobile }}
          </a>
          <a
            v-if="selectedContact.email"
            :href="`mailto:${selectedContact.email}`"
            class="flex items-center gap-2 text-[11px] text-gray-600 hover:text-[#172774] transition-colors"
          >
            <i class="pi pi-envelope text-[10px] text-gray-400 w-4 text-center" />
            {{ selectedContact.email }}
          </a>
        </div>

        <!-- Add another contact -->
        <button
          @click="startAdd"
          class="flex items-center gap-1 text-[10px] text-[#172774] hover:text-[#3d4a8e] font-medium transition-colors pt-1"
        >
          <i class="pi pi-plus text-[9px]" />
          Weiteren Kontakt hinzufügen
        </button>
      </div>

      <!-- Edit / Add form -->
      <div v-if="editing" class="space-y-2.5">
        <p class="text-[12px] font-semibold text-gray-700">
          {{ editingId ? 'Kontakt bearbeiten' : 'Neuer Kontakt' }}
        </p>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[11px] text-gray-400 mb-0.5 font-medium">Vorname</label>
            <input v-model="form.first_name" type="text" class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40" />
          </div>
          <div>
            <label class="block text-[11px] text-gray-400 mb-0.5 font-medium">Nachname</label>
            <input v-model="form.last_name" type="text" class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40" />
          </div>
        </div>
        <div>
          <label class="block text-[11px] text-gray-400 mb-0.5 font-medium">Position</label>
          <input v-model="form.job_title" type="text" class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40" placeholder="z.B. Heimleitung, PDL" />
        </div>
        <div>
          <label class="block text-[11px] text-gray-400 mb-0.5 font-medium">E-Mail</label>
          <input v-model="form.email" type="email" class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[11px] text-gray-400 mb-0.5 font-medium">Telefon</label>
            <input v-model="form.phone" type="tel" class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40" />
          </div>
          <div>
            <label class="block text-[11px] text-gray-400 mb-0.5 font-medium">Mobil</label>
            <input v-model="form.mobile" type="tel" class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40" />
          </div>
        </div>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="form.is_primary"
            type="checkbox"
            class="rounded border-gray-300 text-[#172774] focus:ring-[#172774]/30 w-3.5 h-3.5"
          />
          <span class="text-[12px] text-gray-600">Primärer Kontakt</span>
        </label>

        <div class="flex items-center gap-2 pt-1">
          <button
            @click="saveContact"
            :disabled="saving"
            class="flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-white bg-[#172774] rounded-md hover:bg-[#3d4a8e] transition-colors disabled:opacity-50"
          >
            <i v-if="saving" class="pi pi-spin pi-spinner text-[10px]" />
            <i v-else class="pi pi-check text-[10px]" />
            Speichern
          </button>
          <button
            @click="cancelEdit"
            class="px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Abbrechen
          </button>
        </div>
        <p v-if="saveMessage" class="text-[11px]" :class="saveError ? 'text-red-500' : 'text-green-600'">{{ saveMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NursingHomeContact } from '~/types/crm'

const props = defineProps<{
  contacts: NursingHomeContact[]
  nursingHomeId: string
  loading?: boolean
}>()

const emit = defineEmits<{
  call: [contact: NursingHomeContact]
  email: [contact: NursingHomeContact]
  sms: [contact: NursingHomeContact]
  updated: []
}>()

const { addContact, editContact, removeContact } = useContacts()

const selectedIndex = ref(0)
const editing = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const saveMessage = ref('')
const saveError = ref(false)

const form = ref<Partial<NursingHomeContact>>({})

// Auto-select primary contact on load
watch(() => props.contacts, (newContacts) => {
  if (newContacts.length > 0) {
    const primaryIdx = newContacts.findIndex(c => c.is_primary)
    selectedIndex.value = primaryIdx >= 0 ? primaryIdx : 0
  }
}, { immediate: true })

const selectedContact = computed(() => props.contacts[selectedIndex.value] || null)

const fullName = (c: NursingHomeContact) =>
  [c.first_name, c.last_name].filter(Boolean).join(' ') || '–'

const initials = (c: NursingHomeContact) => {
  const f = c.first_name?.[0] || ''
  const l = c.last_name?.[0] || ''
  return (f + l).toUpperCase() || '?'
}

const cleanPhone = (phone: string) =>
  phone.replace(/[^\d+]/g, '').replace(/^0/, '49')

const startAdd = () => {
  editingId.value = null
  form.value = {
    nursing_home_id: props.nursingHomeId,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    job_title: '',
    is_primary: props.contacts.length === 0,
  }
  editing.value = true
  saveMessage.value = ''
}

const startEdit = (contact: NursingHomeContact) => {
  editingId.value = contact.id
  form.value = {
    first_name: contact.first_name || '',
    last_name: contact.last_name || '',
    email: contact.email || '',
    phone: contact.phone || '',
    mobile: contact.mobile || '',
    job_title: contact.job_title || '',
    is_primary: contact.is_primary || false,
  }
  editing.value = true
  saveMessage.value = ''
}

const cancelEdit = () => {
  editing.value = false
  editingId.value = null
  form.value = {}
  saveMessage.value = ''
}

const saveContact = async () => {
  saving.value = true
  saveMessage.value = ''
  saveError.value = false

  try {
    if (editingId.value) {
      await editContact(editingId.value, form.value)
    } else {
      await addContact({ ...form.value, nursing_home_id: props.nursingHomeId })
    }
    saveMessage.value = 'Gespeichert'
    setTimeout(() => {
      editing.value = false
      editingId.value = null
      saveMessage.value = ''
      emit('updated')
    }, 600)
  } catch {
    saveError.value = true
    saveMessage.value = 'Fehler beim Speichern'
  } finally {
    saving.value = false
  }
}

const handleDelete = async (contact: NursingHomeContact) => {
  if (!confirm(`${fullName(contact)} wirklich löschen?`)) return
  try {
    await removeContact(contact.id)
    selectedIndex.value = 0
    emit('updated')
  } catch {
    console.error('Failed to delete contact')
  }
}

defineExpose({ startAdd })
</script>
