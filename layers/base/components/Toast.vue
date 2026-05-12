<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm pointer-events-none">
      <transition-group name="toast" tag="div" class="flex flex-col gap-2">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="[
            'pointer-events-auto rounded-lg shadow-lg border px-4 py-3 flex items-start gap-3 backdrop-blur-sm',
            colorClass(msg.severity),
          ]"
          role="alert"
        >
          <i :class="iconClass(msg.severity)" class="text-[16px] mt-0.5 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-semibold leading-tight">{{ msg.summary }}</p>
            <p v-if="msg.detail" class="text-[12px] opacity-80 mt-0.5">{{ msg.detail }}</p>
          </div>
          <button
            v-if="msg.closable"
            class="text-[12px] opacity-60 hover:opacity-100 flex-shrink-0"
            aria-label="Schließen"
            @click="remove(msg.id)"
          >
            <i class="pi pi-times" />
          </button>
        </div>
      </transition-group>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { messages, remove } = useToast()

const colorClass = (sev: string) => {
  if (sev === 'success') return 'bg-green-50 border-green-200 text-green-900'
  if (sev === 'error') return 'bg-red-50 border-red-200 text-red-900'
  if (sev === 'warn') return 'bg-amber-50 border-amber-200 text-amber-900'
  return 'bg-blue-50 border-blue-200 text-blue-900'
}

const iconClass = (sev: string) => {
  if (sev === 'success') return 'pi pi-check-circle text-green-600'
  if (sev === 'error') return 'pi pi-exclamation-circle text-red-600'
  if (sev === 'warn') return 'pi pi-exclamation-triangle text-amber-600'
  return 'pi pi-info-circle text-blue-600'
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
