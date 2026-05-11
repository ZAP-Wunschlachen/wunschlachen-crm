<template>
  <div class="flex h-screen bg-[#f5f5f7]">
    <!-- Sidebar — Close.com Style, dental-blue, collapsible -->
    <aside
      :class="[
        'flex flex-col bg-[#0d1a5c] text-white transition-all duration-200 ease-in-out',
        collapsed ? 'w-[52px]' : 'w-[220px]',
      ]"
    >
      <!-- Logo area -->
      <div class="flex items-center h-14 px-3 gap-2.5">
        <div class="flex items-center justify-center w-8 h-8 flex-shrink-0">
          <div class="w-8 h-8 rounded-md bg-[#172774] flex items-center justify-center text-white text-[13px] font-bold">
            W
          </div>
        </div>
        <transition name="fade-text">
          <span v-if="!collapsed" class="text-[13px] font-semibold tracking-tight text-white/90 truncate">
            Wunschlachen CRM
          </span>
        </transition>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        <!-- Dashboard -->
        <SidebarLink path="/dashboard" label="Dashboard" icon="pi pi-th-large" :collapsed="collapsed" exact />

        <!-- B2B-Sektion: CRM Pflegeheim-Sales -->
        <template v-if="hasCrmAccess">
          <SidebarSection label="CRM B2B" :collapsed="collapsed" />
          <SidebarLink path="/crm" label="Übersicht" icon="pi pi-objects-column" :collapsed="collapsed" exact />
          <SidebarLink path="/crm/pipeline" label="Pipeline" icon="pi pi-bars" :collapsed="collapsed" />
          <SidebarLink path="/crm/leads" label="Leads" icon="pi pi-building" :collapsed="collapsed" />
          <SidebarLink path="/crm/heime" label="Heime" icon="pi pi-home" :collapsed="collapsed" />
          <SidebarLink path="/crm/kontakte" label="Kontakte" icon="pi pi-users" :collapsed="collapsed" />
          <SidebarLink path="/crm/aktivitaeten" label="Aktivitäten" icon="pi pi-history" :collapsed="collapsed" />
          <SidebarLink path="/crm/termine" label="Termine" icon="pi pi-calendar" :collapsed="collapsed" />
          <SidebarLink path="/crm/inbox" label="Inbox" icon="pi pi-inbox" :collapsed="collapsed" />
          <SidebarLink path="/crm/aufgaben" label="Aufgaben" icon="pi pi-check-square" :collapsed="collapsed" />
          <SidebarLink path="/crm/workflows" label="Workflows" icon="pi pi-sitemap" :collapsed="collapsed" />
          <SidebarLink path="/crm/statistiken" label="Berichte" icon="pi pi-chart-line" :collapsed="collapsed" />
        </template>

        <!-- B2C-Sektion: Patient-Lead-Funnel -->
        <template v-if="hasPatientenAccess">
          <SidebarSection label="Patienten B2C" :collapsed="collapsed" />
          <SidebarLink path="/patienten" label="Übersicht" icon="pi pi-objects-column" :collapsed="collapsed" exact />
          <SidebarLink path="/patienten/pipeline" label="Pipeline" icon="pi pi-bars" :collapsed="collapsed" />
          <SidebarLink path="/patienten/termine" label="Termine" icon="pi pi-calendar" :collapsed="collapsed" />
          <SidebarLink path="/patienten/bewertungen" label="Bewertungen" icon="pi pi-star" :collapsed="collapsed" />
          <SidebarLink path="/patienten/voice-ai" label="Voice-AI" icon="pi pi-microphone" :collapsed="collapsed" />
          <SidebarLink path="/patienten/marketing" label="Marketing" icon="pi pi-megaphone" :collapsed="collapsed" />
          <SidebarLink path="/patienten/workflows" label="Workflows" icon="pi pi-sitemap" :collapsed="collapsed" />
        </template>

        <!-- Einstellungen -->
        <div class="h-px bg-white/[0.12] my-2" />
        <SidebarLink v-if="hasCrmAccess" path="/crm/einstellungen" label="CRM-Einstellungen" icon="pi pi-cog" :collapsed="collapsed" />
        <SidebarLink v-if="hasPatientenAccess" path="/patienten/einstellungen" label="Patienten-Einstellungen" icon="pi pi-cog" :collapsed="collapsed" />
      </nav>

      <!-- Bottom: Collapse + User -->
      <div class="px-2 pb-2 space-y-1">
        <button
          @click="collapsed = !collapsed"
          class="group relative flex items-center justify-center rounded-md w-full py-2 bg-white/[0.08] hover:bg-white/[0.15] transition-all duration-150"
          :aria-label="collapsed ? 'Sidebar ausklappen' : 'Sidebar einklappen'"
        >
          <i :class="collapsed ? 'pi pi-angle-double-right' : 'pi pi-angle-double-left'" class="text-white" style="font-size: 18px" />
        </button>

        <div :class="['flex items-center rounded-md', collapsed ? 'justify-center py-2' : 'gap-2.5 px-2.5 py-2']">
          <div class="flex items-center justify-center w-7 h-7 rounded-full bg-[#172774] text-[11px] font-semibold flex-shrink-0">
            {{ userInitials }}
          </div>
          <div v-if="!collapsed" class="flex-1 min-w-0">
            <p class="text-[12px] font-medium text-white/80 truncate leading-tight">{{ userName }}</p>
            <button @click="handleLogout" class="text-[11px] text-gray-500 hover:text-white/70 transition-colors leading-tight">
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden min-w-0">
      <header class="flex items-center justify-between h-12 px-5 bg-white border-b border-gray-200/80">
        <div class="flex items-center gap-3">
          <h1 class="text-[14px] font-semibold text-gray-800">{{ pageTitle }}</h1>
          <span v-if="pageSubtitle" class="text-[12px] text-gray-400">{{ pageSubtitle }}</span>
        </div>
        <!-- Search-Field — wird in Phase 3 mit Daten verkabelt -->
        <div class="relative">
          <i class="pi pi-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[12px]" />
          <input
            type="text"
            placeholder="Suchen... (⌘K)"
            disabled
            class="pl-8 pr-3 py-1.5 w-56 bg-gray-50 border border-gray-200 rounded-md text-[13px] text-gray-400 placeholder-gray-300 focus:outline-none cursor-not-allowed"
          />
        </div>
      </header>

      <main class="flex-1 overflow-auto p-5">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { user, redirectToLogout } = useAuth()
const { hasCrmAccess, hasPatientenAccess } = useUserRole()

const collapsed = ref(false)

const userName = computed(() => {
  if (!user.value) return ''
  return `${user.value.first_name || ''} ${user.value.last_name || ''}`.trim()
})

const userInitials = computed(() => {
  if (!user.value) return '?'
  const first = user.value.first_name?.[0] || ''
  const last = user.value.last_name?.[0] || ''
  return (first + last).toUpperCase() || '?'
})

const handleLogout = () => {
  redirectToLogout()
}

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/crm': 'CRM-Übersicht',
  '/crm/pipeline': 'Pipeline',
  '/crm/leads': 'Leads',
  '/crm/heime': 'Heime',
  '/crm/kontakte': 'Kontakte',
  '/crm/aktivitaeten': 'Aktivitäten',
  '/crm/termine': 'Termine',
  '/crm/inbox': 'Inbox',
  '/crm/aufgaben': 'Aufgaben',
  '/crm/workflows': 'Workflows',
  '/crm/statistiken': 'Berichte',
  '/crm/einstellungen': 'CRM-Einstellungen',
  '/patienten': 'Patienten-Übersicht',
  '/patienten/pipeline': 'Patienten Pipeline',
  '/patienten/termine': 'Patienten Termine',
  '/patienten/bewertungen': 'Bewertungen',
  '/patienten/voice-ai': 'Voice-AI',
  '/patienten/marketing': 'Marketing',
  '/patienten/workflows': 'Patienten Workflows',
  '/patienten/einstellungen': 'Patienten-Einstellungen',
}

const pageTitle = computed(() => {
  const exact = titleMap[route.path]
  if (exact) return exact
  const match = Object.keys(titleMap)
    .filter((p) => p !== '/dashboard' && route.path.startsWith(p))
    .sort((a, b) => b.length - a.length)[0]
  return match ? titleMap[match] : 'Wunschlachen CRM'
})

const pageSubtitle = computed(() => {
  if (route.path.match(/^\/crm\/leads\/.+/)) return '/ Lead Details'
  if (route.path.match(/^\/crm\/heime\/[^/]+$/) && !['index', 'bewohner'].includes(route.path.split('/').pop() || '')) {
    return '/ Heim Details'
  }
  if (route.path.match(/^\/crm\/workflows\/.+/)) return '/ Workflow Editor'
  if (route.path.match(/^\/patienten\/workflows\/.+/)) return '/ Workflow Editor'
  if (route.path.match(/^\/patienten\/[^/]+$/) && !titleMap[route.path]) {
    return '/ Patient Details'
  }
  return ''
})
</script>

<style scoped>
.fade-text-enter-active,
.fade-text-leave-active {
  transition: opacity 0.15s ease;
}
.fade-text-enter-from,
.fade-text-leave-to {
  opacity: 0;
}
</style>
