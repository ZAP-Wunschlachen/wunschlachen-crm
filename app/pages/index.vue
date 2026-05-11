<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { defaultPath } = useUserRole()

await navigateTo(defaultPath.value, { replace: true })
</script>

<template>
  <div class="flex items-center justify-center h-screen bg-[#f5f5f7]">
    <i class="pi pi-spin pi-spinner text-2xl text-gray-400" />
  </div>
</template>
