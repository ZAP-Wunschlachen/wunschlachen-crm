<template>
  <Teleport to="body">
    <transition name="dialog">
      <div
        v-if="visible"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        :class="modal ? 'bg-black/40 backdrop-blur-sm' : ''"
        @click.self="onBackdropClick"
      >
        <div
          class="bg-white rounded-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          :class="dialogClass"
          :style="dialogStyle"
        >
          <header
            v-if="$slots.header || header || closable"
            class="flex items-center justify-between px-5 py-3 border-b border-gray-200"
          >
            <slot name="header">
              <h3 class="text-[14px] font-semibold text-gray-800">{{ header }}</h3>
            </slot>
            <button
              v-if="closable"
              class="text-gray-400 hover:text-gray-700 text-[16px]"
              aria-label="Schließen"
              @click="close"
            >
              <i class="pi pi-times" />
            </button>
          </header>

          <div class="flex-1 overflow-y-auto p-5">
            <slot />
          </div>

          <footer
            v-if="$slots.footer"
            class="px-5 py-3 border-t border-gray-200 flex items-center justify-end gap-2"
          >
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    visible: boolean
    modal?: boolean
    header?: string
    closable?: boolean
    dismissableMask?: boolean
    style?: Record<string, string> | string
    pt?: any
  }>(),
  { modal: true, closable: true, dismissableMask: true },
)

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const close = () => emit('update:visible', false)
const onBackdropClick = () => {
  if (props.dismissableMask) close()
}

const dialogStyle = computed(() => {
  if (typeof props.style === 'string') return props.style
  if (typeof props.style === 'object') return props.style
  return { width: '90vw', maxWidth: '600px' }
})

const dialogClass = computed(() => '')
</script>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.18s ease;
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
</style>
