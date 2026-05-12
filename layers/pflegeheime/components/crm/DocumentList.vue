<template>
  <div>
    <div v-if="loading" class="flex justify-center py-6">
      <i class="pi pi-spin pi-spinner text-gray-300" />
    </div>

    <div v-else-if="documents.length === 0" class="text-center py-6">
      <i class="pi pi-file text-xl text-gray-200 mb-2" />
      <p class="text-[11px] text-gray-400">Keine Dokumente</p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all group"
      >
        <!-- File icon -->
        <div class="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
          :class="fileIconBg(doc)"
        >
          <i :class="fileIcon(doc)" class="text-[12px]" :style="{ color: fileIconColor(doc) }" />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-[12px] font-medium text-gray-700 truncate">{{ doc.name }}</p>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span
              class="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500"
            >
              {{ categoryLabel(doc.category) }}
            </span>
            <span v-if="fileName(doc)" class="text-[10px] text-gray-400 truncate">{{ fileName(doc) }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            v-if="fileId(doc)"
            class="p-1.5 text-gray-400 hover:text-[#172774] transition-colors"
            title="Download"
            @click="downloadFile(doc)"
          >
            <i class="pi pi-download text-[11px]" />
          </button>
          <button
            v-if="deletable"
            class="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            title="Löschen"
            @click="$emit('delete', doc)"
          >
            <i class="pi pi-trash text-[11px]" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CrmDocument, DocumentCategory } from '~/types/crm'
import { DOCUMENT_CATEGORIES } from '~/types/crm'

defineProps<{
  documents: CrmDocument[]
  loading?: boolean
  deletable?: boolean
}>()

defineEmits<{
  delete: [doc: CrmDocument]
}>()

const { getFileUrl } = useDocuments()

const fileId = (doc: CrmDocument) => {
  if (typeof doc.file_id === 'object' && doc.file_id) return doc.file_id.id
  return doc.file_id as string
}

const fileName = (doc: CrmDocument) => {
  if (typeof doc.file_id === 'object' && doc.file_id) return doc.file_id.filename_download
  return null
}

const fileType = (doc: CrmDocument) => {
  if (typeof doc.file_id === 'object' && doc.file_id) return doc.file_id.type || ''
  return ''
}

const categoryLabel = (cat: DocumentCategory) =>
  DOCUMENT_CATEGORIES.find(c => c.value === cat)?.label || cat

const fileIcon = (doc: CrmDocument) => {
  const type = fileType(doc)
  if (type.includes('pdf')) return 'pi pi-file-pdf'
  if (type.includes('word') || type.includes('document')) return 'pi pi-file-word'
  if (type.includes('sheet') || type.includes('excel')) return 'pi pi-file-excel'
  if (type.includes('image')) return 'pi pi-image'
  return 'pi pi-file'
}

const fileIconColor = (doc: CrmDocument) => {
  const type = fileType(doc)
  if (type.includes('pdf')) return '#dc2626'
  if (type.includes('word') || type.includes('document')) return '#2563eb'
  if (type.includes('sheet') || type.includes('excel')) return '#16a34a'
  if (type.includes('image')) return '#8b5cf6'
  return '#64748b'
}

const downloadFile = (doc: CrmDocument) => {
  const id = fileId(doc)
  if (!id) return
  const url = getFileUrl(id)
  const name = fileName(doc) || doc.name || 'download'

  // Data URLs (local mode): trigger programmatic download
  if (url.startsWith('data:')) {
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } else {
    // Directus URL: open in new tab
    window.open(url, '_blank')
  }
}

const fileIconBg = (doc: CrmDocument) => {
  const type = fileType(doc)
  if (type.includes('pdf')) return 'bg-red-50'
  if (type.includes('word') || type.includes('document')) return 'bg-blue-50'
  if (type.includes('sheet') || type.includes('excel')) return 'bg-green-50'
  if (type.includes('image')) return 'bg-purple-50'
  return 'bg-gray-50'
}
</script>
