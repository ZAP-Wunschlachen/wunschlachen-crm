<template>
  <div class="flex h-screen bg-gray-50">
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div class="p-4 border-b border-gray-200">
        <h1 class="text-xl font-bold text-gray-900">Wunschlachen</h1>
        <p class="text-xs text-gray-500 mt-0.5">CRM</p>
      </div>

      <nav class="flex-1 overflow-y-auto p-3 space-y-1">
        <div class="mb-4">
          <p class="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Ubersicht</p>
          <NavItem to="/dashboard" icon="pi pi-home" label="Dashboard" />
          <NavItem to="/inbox" icon="pi pi-inbox" label="Inbox" />
          <NavItem to="/aufgaben" icon="pi pi-check-square" label="Aufgaben" />
        </div>

        <div v-if="hasPflegeheimeAccess" class="mb-4">
          <p class="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Pflege</p>
          <NavItem to="/pflegeheime" icon="pi pi-building" label="Heime" />
          <NavItem to="/pflegeheime/bewohner" icon="pi pi-users" label="Bewohner" />
          <NavItem to="/pflegeheime/vertraege" icon="pi pi-file" label="Vertrage" />
        </div>

        <div v-if="hasPatientenAccess" class="mb-4">
          <p class="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Implant</p>
          <NavItem to="/patienten" icon="pi pi-user" label="Leads" />
          <NavItem to="/patienten/pipeline" icon="pi pi-th-large" label="Pipeline" />
          <NavItem to="/patienten/marketing" icon="pi pi-chart-bar" label="Marketing" />
          <NavItem to="/patienten/voice-ai" icon="pi pi-phone" label="Voice AI" />
        </div>

        <div v-if="hasPraxenAccess" class="mb-4">
          <p class="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Praxen</p>
          <NavItem to="/praxen" icon="pi pi-briefcase" label="Partner" />
          <NavItem to="/praxen/referrals" icon="pi pi-share-alt" label="Referrals" />
        </div>

        <div class="mb-4">
          <p class="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Tools</p>
          <NavItem to="/workflows" icon="pi pi-bolt" label="Workflows" />
          <NavItem to="/statistiken" icon="pi pi-chart-line" label="Statistiken" />
          <NavItem to="/einstellungen" icon="pi pi-cog" label="Einstellungen" />
        </div>
      </nav>

      <div class="p-3 border-t border-gray-200">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span class="text-sm font-medium text-blue-700">{{ userInitials }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-700 truncate">{{ fullName }}</p>
            <p class="text-xs text-gray-400 truncate">{{ user?.email }}</p>
          </div>
          <button @click="redirectToLogout" class="text-gray-400 hover:text-gray-600">
            <i class="pi pi-sign-out text-sm"></i>
          </button>
        </div>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, redirectToLogout, getFullName } = useAuth()
const { hasPflegeheimeAccess, hasPatientenAccess, hasPraxenAccess } = useUserRole()

const fullName = computed(() => getFullName())
const userInitials = computed(() => {
  if (!user.value) return ''
  const f = user.value.first_name?.[0] || ''
  const l = user.value.last_name?.[0] || ''
  return `${f}${l}`.toUpperCase()
})
</script>
