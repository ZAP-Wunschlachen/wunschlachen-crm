<template>
  <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
    <h2 class="text-sm font-semibold text-dental-blue-0 mb-3">AI Voice Agent Status</h2>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <p class="text-xs text-dental-blue--3">Aktive Kampagnen</p>
        <p class="text-lg font-bold text-dental-blue-0">--</p>
      </div>
      <div>
        <p class="text-xs text-dental-blue--3">Anrufe heute</p>
        <p class="text-lg font-bold text-dental-blue-0">--</p>
      </div>
      <div>
        <p class="text-xs text-dental-blue--3">Qualifikationsrate</p>
        <p class="text-lg font-bold text-green-600">--</p>
      </div>
      <div>
        <p class="text-xs text-dental-blue--3">Avg. Gespraechsdauer</p>
        <p class="text-lg font-bold text-dental-blue-0">--</p>
      </div>
    </div>
    <p class="text-[10px] text-dental-blue--3 mt-3">Synthflow-Integration wird ueber n8n-Webhook gesteuert.</p>
  </div>
</template>
