<template>
  <PatientenPipelineKPIs :leads="leads" />
</template>

<script setup lang="ts">
import type { Lead } from '~/types/crm'
defineProps<{ leads: Lead[] }>()
</script>
