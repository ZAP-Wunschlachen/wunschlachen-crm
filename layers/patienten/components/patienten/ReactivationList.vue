<template>
  <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-sm font-semibold text-dental-blue-0">Reaktivierung ({{ inactiveCount }})</h2>
      <button class="text-[10px] text-dental-blue--2 hover:text-dental-blue-0" @click="refresh">Aktualisieren</button>
    </div>
    <div v-if="isLoading" class="text-xs text-dental-blue--3">Laden...</div>
    <div v-else-if="inactiveLeads.length === 0" class="text-xs text-dental-blue--3">Keine inaktiven Leads</div>
    <div v-else class="space-y-2">
      <div v-for="item in inactiveLeads.slice(0, 5)" :key="item.lead.id" class="flex items-center justify-between p-2 rounded hover:bg-soft-concrete--1 cursor-pointer" @click="navigateTo(`/patienten/${item.lead.id}`)">
        <div>
          <p class="text-xs font-medium text-dental-blue-0">{{ item.lead.first_name }} {{ item.lead.last_name }}</p>
          <p class="text-[10px] text-dental-blue--3">{{ item.daysSinceActivity }} Tage inaktiv</p>
        </div>
        <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Reaktivieren</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { inactiveLeads, inactiveCount, isLoading, fetchInactiveLeads } = useReactivation()

const refresh = () => fetchInactiveLeads()
onMounted(() => fetchInactiveLeads())
</script>
