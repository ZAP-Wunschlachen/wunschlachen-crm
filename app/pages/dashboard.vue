<template>
  <div class="space-y-6">
    <!-- KPI-Reihe -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Heimkunden-Leads</p>
        <p class="text-2xl font-semibold text-gray-900 mt-1">—</p>
        <p class="text-[11px] text-gray-400 mt-0.5">Aktive Pipeline-Stages</p>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Patienten-Leads</p>
        <p class="text-2xl font-semibold text-gray-900 mt-1">—</p>
        <p class="text-[11px] text-gray-400 mt-0.5">Aktive Pipeline-Stages</p>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Termine heute</p>
        <p class="text-2xl font-semibold text-gray-900 mt-1">—</p>
        <p class="text-[11px] text-gray-400 mt-0.5">Geplante Termine</p>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Aktivitäten (7 T.)</p>
        <p class="text-2xl font-semibold text-gray-900 mt-1">—</p>
        <p class="text-[11px] text-gray-400 mt-0.5">Calls, E-Mails, Notizen</p>
      </div>
    </div>

    <!-- Sales-Urgency + Reactivation (Plan v9 Erweiterung) -->
    <div v-if="hasPatientenAccess" class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <PatientenUrgencyKpiCard />
      <PatientenReactivationQueueCard />
    </div>

    <!-- Bereichs-Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Heimkunden -->
      <div v-if="hasCrmAccess" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="pi pi-building text-[14px] text-[#172774]" />
            <h3 class="text-[13px] font-semibold text-gray-800">Heimkunden — Pflegeheim-Akquise</h3>
          </div>
          <NuxtLink to="/crm/pipeline" class="text-[11px] font-medium text-[#172774] hover:underline">Öffnen →</NuxtLink>
        </div>
        <div class="p-4 space-y-2">
          <DashboardQuickLink to="/crm/pipeline" icon="pi pi-bars" label="Pipeline" hint="Kanban-Board aller Heim-Leads" />
          <DashboardQuickLink to="/crm/heime" icon="pi pi-building" label="Heimkunden" hint="Alle Pflegeheime" />
          <DashboardQuickLink to="/crm/inbox" icon="pi pi-inbox" label="Inbox" hint="Eingehende Nachrichten (Phase 9)" />
          <DashboardQuickLink to="/crm/aufgaben" icon="pi pi-check-square" label="Aufgaben" hint="Offene Tasks" />
        </div>
      </div>

      <!-- Patienten -->
      <div v-if="hasPatientenAccess" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="pi pi-user text-[14px] text-[#172774]" />
            <h3 class="text-[13px] font-semibold text-gray-800">Patienten — Implant-Funnel</h3>
          </div>
          <NuxtLink to="/patienten" class="text-[11px] font-medium text-[#172774] hover:underline">Öffnen →</NuxtLink>
        </div>
        <div class="p-4 space-y-2">
          <DashboardQuickLink to="/patienten/pipeline" icon="pi pi-bars" label="Pipeline" hint="Lead-Funnel Kanban" />
          <DashboardQuickLink to="/patienten/termine" icon="pi pi-calendar" label="Termine" hint="Patiententermine" />
          <DashboardQuickLink to="/patienten/voice-ai" icon="pi pi-microphone" label="Voice-AI" hint="AI-Anrufe" />
          <DashboardQuickLink to="/patienten/bewertungen" icon="pi pi-star" label="Bewertungen" hint="Google Reviews" />
        </div>
      </div>
    </div>

    <!-- Status-Hinweis (Migration in Arbeit) -->
    <div class="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
      <p class="text-[12px] text-amber-800">
        <i class="pi pi-info-circle mr-1.5" />
        <strong>Migration läuft:</strong> Daten werden in Phase 5 (Backend/Auth) verkabelt. KPIs zeigen aktuell Platzhalter.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'crm', middleware: 'auth' })

const { hasCrmAccess, hasPatientenAccess } = useUserRole()
</script>
