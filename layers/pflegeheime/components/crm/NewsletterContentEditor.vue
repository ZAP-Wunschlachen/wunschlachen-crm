<template>
  <div class="space-y-3">
    <!-- Variable toolbar -->
    <div>
      <label class="block text-[10px] text-gray-400 mb-1 font-medium">Variablen einfügen</label>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="v in availableVariables"
          :key="v.key"
          @click="insertVariable(v.key)"
          class="px-1.5 py-0.5 text-[9px] font-mono bg-[#172774]/5 text-[#172774] border border-[#172774]/20 rounded hover:bg-[#172774]/10 transition-colors"
          :title="v.label + ' — z.B. ' + v.example"
        >
          {{ v.key }}
        </button>
      </div>
    </div>

    <!-- Editor -->
    <div>
      <div class="flex items-center justify-between mb-1">
        <label class="text-[10px] text-gray-400 font-medium">Inhalt</label>
        <div class="flex items-center gap-2">
          <button
            v-if="isCustomized"
            @click="handleReset"
            class="text-[9px] text-gray-400 hover:text-red-500 transition-colors"
          >
            Zurücksetzen
          </button>
          <button
            @click="showPreview = !showPreview"
            class="text-[9px] font-medium transition-colors"
            :class="showPreview ? 'text-[#172774]' : 'text-gray-400 hover:text-gray-600'"
          >
            {{ showPreview ? 'Bearbeiten' : 'Vorschau' }}
          </button>
        </div>
      </div>

      <!-- Edit mode -->
      <textarea
        v-if="!showPreview"
        ref="textareaRef"
        v-model="editContent"
        rows="12"
        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[12px] text-gray-700 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40 resize-y"
        spellcheck="true"
        lang="de"
        @input="handleInput"
      />

      <!-- Preview mode -->
      <div
        v-else
        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-[12px] text-gray-700 leading-relaxed bg-gray-50 min-h-[200px] whitespace-pre-wrap"
      >
        {{ previewText }}
      </div>
    </div>

    <!-- Status -->
    <div class="flex items-center justify-between">
      <span v-if="isCustomized" class="text-[9px] text-amber-600 flex items-center gap-1">
        <i class="pi pi-pencil text-[8px]" />
        Angepasster Inhalt
      </span>
      <span v-else class="text-[9px] text-gray-400 flex items-center gap-1">
        <i class="pi pi-file text-[8px]" />
        Standard-Vorlage
      </span>
      <span class="text-[9px] text-gray-300 tabular-nums">{{ editContent.length }} Zeichen</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NursingHome, NursingHomeContact } from '~/types/crm'

const props = defineProps<{
  topicId: string
  contact?: NursingHomeContact | null
  nursingHome?: NursingHome | null
}>()

const { getContent, saveContent, resetContent, isCustomized: checkCustomized, resolveVariables, buildVariables, availableVariables } = useNewsletterContent()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const showPreview = ref(false)
const editContent = ref('')

const isCustomized = computed(() => checkCustomized(props.topicId))

const previewText = computed(() => {
  const vars = buildVariables(props.contact, props.nursingHome)
  return resolveVariables(editContent.value, vars)
})

// Load content when topic changes
watch(() => props.topicId, (id) => {
  if (id) {
    editContent.value = getContent(id)
    showPreview.value = false
  }
}, { immediate: true })

let saveTimer: ReturnType<typeof setTimeout> | null = null
const handleInput = () => {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveContent(props.topicId, editContent.value)
  }, 500)
}

const handleReset = () => {
  resetContent(props.topicId)
  editContent.value = getContent(props.topicId)
}

const insertVariable = (variable: string) => {
  if (!textareaRef.value) return
  const ta = textareaRef.value
  const start = ta.selectionStart
  const end = ta.selectionEnd
  const before = editContent.value.slice(0, start)
  const after = editContent.value.slice(end)
  editContent.value = before + variable + after
  handleInput()
  nextTick(() => {
    ta.focus()
    ta.setSelectionRange(start + variable.length, start + variable.length)
  })
}
</script>
