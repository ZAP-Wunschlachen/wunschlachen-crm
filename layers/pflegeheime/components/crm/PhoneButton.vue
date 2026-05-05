<template>
  <button
    @click.stop="handleClick"
    :disabled="!phoneNumber || callState.active"
    class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-colors"
    :class="buttonClass"
    :title="phoneNumber || 'Keine Nummer'"
  >
    <i :class="iconClass" class="text-[10px]" />
    <span v-if="!iconOnly">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  phoneNumber?: string | null
  contact?: any | null
  iconOnly?: boolean
  size?: 'sm' | 'md'
}>()

const emit = defineEmits<{
  dialing: [phoneNumber: string]
}>()

const { callState, dial } = usePlacetel()

const label = computed(() => {
  if (callState.value.active && callState.value.phoneNumber === props.phoneNumber) {
    switch (callState.value.status) {
      case 'dialing': return 'Waehlt...'
      case 'ringing': return 'Klingelt...'
      case 'connected': return 'Verbunden'
      default: return 'Anrufen'
    }
  }
  return 'Anrufen'
})

const iconClass = computed(() => {
  if (callState.value.active && callState.value.phoneNumber === props.phoneNumber) {
    if (callState.value.status === 'dialing' || callState.value.status === 'ringing') {
      return 'pi pi-spin pi-spinner'
    }
  }
  return 'pi pi-phone'
})

const isActiveCall = computed(() =>
  callState.value.active && callState.value.phoneNumber === props.phoneNumber
)

const buttonClass = computed(() => {
  if (!props.phoneNumber) {
    return 'text-gray-300 bg-gray-50 border border-gray-100 cursor-not-allowed'
  }
  if (isActiveCall.value) {
    return 'text-white bg-green-600 border border-green-600'
  }
  return 'text-gray-600 bg-gray-50 border border-gray-200 hover:bg-[#172774] hover:text-white hover:border-[#172774]'
})

const handleClick = () => {
  if (!props.phoneNumber || callState.value.active) return
  dial(props.phoneNumber, props.contact)
  emit('dialing', props.phoneNumber)
}
</script>
