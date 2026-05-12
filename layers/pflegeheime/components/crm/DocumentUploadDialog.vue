<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40" @click="close" />

        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 class="text-[14px] font-semibold text-gray-800">Dokument hochladen</h3>
            <button class="text-gray-400 hover:text-gray-600 transition-colors" @click="close">
              <i class="pi pi-times text-[13px]" />
            </button>
          </div>

          <div class="px-5 py-4 space-y-4">
            <!-- Drop zone -->
            <div
              class="border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer"
              :class="dragOver ? 'border-[#172774] bg-[#172774]/5' : 'border-gray-200 hover:border-gray-300'"
              @dragover.prevent="dragOver = true"
              @dragleave="dragOver = false"
              @drop.prevent="handleDrop"
              @click="fileInput?.click()"
            >
              <input ref="fileInput" type="file" class="hidden" @change="handleFileSelect" />
              <div v-if="!selectedFile">
                <i class="pi pi-cloud-upload text-2xl text-gray-300 mb-2" />
                <p class="text-[12px] text-gray-500">Datei hierher ziehen oder klicken</p>
              </div>
              <div v-else>
                <i class="pi pi-file text-2xl text-[#172774] mb-2" />
                <p class="text-[12px] text-gray-700 font-medium">{{ selectedFile.name }}</p>
                <p class="text-[10px] text-gray-400 mt-0.5">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
            </div>

            <!-- Name -->
            <div>
              <label class="block text-[11px] text-gray-500 font-medium mb-1">Anzeigename</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Dokumentname"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
              />
            </div>

            <!-- Category -->
            <div>
              <label class="block text-[11px] text-gray-500 font-medium mb-1">Kategorie</label>
              <select
                v-model="form.category"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
              >
                <option v-for="cat in DOCUMENT_CATEGORIES" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
              </select>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-[11px] text-gray-500 font-medium mb-1">Notizen</label>
              <textarea
                v-model="form.notes"
                rows="2"
                placeholder="Optionale Notizen..."
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] resize-none focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
            <button
              class="px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              @click="close"
            >
              Abbrechen
            </button>
            <button
              :disabled="!isValid || uploading"
              class="px-4 py-2 text-[12px] font-medium text-white bg-[#172774] hover:bg-[#3d4a8e] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              @click="upload"
            >
              <i v-if="uploading" class="pi pi-spin pi-spinner text-[10px] mr-1" />
              Hochladen
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { DocumentCategory } from '~/types/crm'
import { DOCUMENT_CATEGORIES } from '~/types/crm'

const props = defineProps<{
  visible: boolean
  leadId: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  uploaded: []
}>()

const { uploadDocument } = useDocuments()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const dragOver = ref(false)
const uploading = ref(false)

const form = ref({
  name: '',
  category: 'other' as DocumentCategory,
  notes: '',
})

const isValid = computed(() => selectedFile.value && form.value.name.trim())

watch(() => props.visible, (val) => {
  if (val) {
    selectedFile.value = null
    form.value = { name: '', category: 'other', notes: '' }
    dragOver.value = false
  }
})

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
    if (!form.value.name) form.value.name = file.name.replace(/\.[^/.]+$/, '')
  }
}

const handleDrop = (e: DragEvent) => {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    selectedFile.value = file
    if (!form.value.name) form.value.name = file.name.replace(/\.[^/.]+$/, '')
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const close = () => emit('update:visible', false)

const upload = async () => {
  if (!selectedFile.value || !isValid.value) return
  uploading.value = true
  try {
    await uploadDocument(props.leadId, selectedFile.value, {
      name: form.value.name.trim(),
      category: form.value.category,
      notes: form.value.notes.trim() || undefined,
    })
    emit('uploaded')
    close()
  } catch (err) {
    console.error('Upload failed:', err)
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
