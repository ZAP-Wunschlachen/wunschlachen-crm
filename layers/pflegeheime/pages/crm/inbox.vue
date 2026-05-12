<!-- Backwards-Compat-Redirect: /crm/inbox → /inbox (Phase 9 hat Inbox auf Top-Level) -->
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
await navigateTo('/inbox', { replace: true })
</script>

<template>
  <div class="flex items-center justify-center h-full">
    <i class="pi pi-spin pi-spinner text-gray-300" />
  </div>
</template>
