<script setup lang="ts">
definePageMeta({ layout: 'crm', middleware: 'auth' })
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="bg-white rounded-xl border p-5">
        <p class="text-sm text-gray-500">Pflegeheime (B2B)</p>
        <p class="text-2xl font-bold mt-1">--</p>
        <p class="text-xs text-gray-400 mt-1">Pipeline-Wert</p>
      </div>

      <div class="bg-white rounded-xl border p-5">
        <p class="text-sm text-gray-500">Implant-Leads (B2C)</p>
        <p class="text-2xl font-bold mt-1">--</p>
        <p class="text-xs text-gray-400 mt-1">Pipeline-Wert</p>
      </div>

      <div class="bg-white rounded-xl border p-5">
        <p class="text-sm text-gray-500">Gesamt Revenue</p>
        <p class="text-2xl font-bold mt-1">--</p>
        <p class="text-xs text-gray-400 mt-1">Diesen Monat</p>
      </div>
    </div>

    <p class="text-gray-500 text-sm">
      Module werden in Plan 2 (Pflegeheime) und Plan 3 (Patienten) aktiviert.
    </p>
  </div>
</template>
