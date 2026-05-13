<template>
  <div class="flex h-screen bg-[#f5f5f7]">
    <!-- Sidebar — funktions-orientiert (Salesforce-Style) -->
    <aside
      :class="[
        'flex flex-col bg-[#0d1a5c] text-white transition-all duration-200 ease-in-out',
        collapsed ? 'w-[52px]' : 'w-[220px]',
      ]"
    >
      <!-- Logo -->
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
        <SidebarLink path="/dashboard" label="Dashboard" icon="pi pi-th-large" :collapsed="collapsed" exact />

        <SidebarSection label="Eingang" :collapsed="collapsed" />
        <SidebarLink path="/inbox" label="Inbox" icon="pi pi-inbox" :collapsed="collapsed" />

        <SidebarSection label="Sales" :collapsed="collapsed" />
        <SidebarLink
          :paths="salesPaths('pipeline')"
          label="Pipeline"
          icon="pi pi-bars"
          :collapsed="collapsed"
        />
        <SidebarLink
          :paths="salesPaths('leads')"
          label="Leads"
          icon="pi pi-user-plus"
          :collapsed="collapsed"
        />
        <!-- Entity-Stammdaten: nur sichtbar wenn User-Rolle Persona zugänglich + Tab passt -->
        <SidebarLink
          v-if="hasCrmAccess && customerType !== 'patienten'"
          path="/crm/heime"
          label="Heime"
          icon="pi pi-building"
          :collapsed="collapsed"
        />
        <SidebarLink
          v-if="hasPatientenAccess && customerType !== 'heimkunden'"
          path="/patienten"
          label="Patienten"
          icon="pi pi-user"
          :collapsed="collapsed"
          exact
        />
        <!-- Kontakte = Ansprechpartner im Pflegeheim (B2B-spezifisch) -->
        <SidebarLink
          v-if="hasCrmAccess && customerType !== 'patienten'"
          path="/crm/kontakte"
          label="Kontakte"
          icon="pi pi-id-card"
          :collapsed="collapsed"
        />

        <SidebarSection label="Engagement" :collapsed="collapsed" />
        <SidebarLink
          :paths="termineRoutes"
          label="Termine"
          icon="pi pi-calendar"
          :collapsed="collapsed"
        />
        <SidebarLink path="/crm/aktivitaeten" label="Aktivitäten" icon="pi pi-history" :collapsed="collapsed" />
        <SidebarLink path="/crm/aufgaben" label="Aufgaben" icon="pi pi-check-square" :collapsed="collapsed" />

        <SidebarSection v-if="hasCrmAccess || hasPatientenAccess" label="Marketing" :collapsed="collapsed" />
        <SidebarLink
          :paths="workflowPaths"
          label="Workflows"
          icon="pi pi-sitemap"
          :collapsed="collapsed"
        />
        <SidebarLink
          v-if="hasPatientenAccess"
          path="/patienten/marketing"
          label="Kampagnen"
          icon="pi pi-megaphone"
          :collapsed="collapsed"
        />
        <SidebarLink
          v-if="hasPatientenAccess"
          path="/patienten/voice-ai"
          label="Voice-AI"
          icon="pi pi-microphone"
          :collapsed="collapsed"
        />

        <SidebarSection label="Insights" :collapsed="collapsed" />
        <SidebarLink
          v-if="hasPatientenAccess"
          path="/patienten/bewertungen"
          label="Bewertungen"
          icon="pi pi-star"
          :collapsed="collapsed"
        />
        <SidebarLink path="/crm/statistiken" label="Berichte" icon="pi pi-chart-line" :collapsed="collapsed" />

        <!-- Einstellungen -->
        <div class="h-px bg-white/[0.12] my-2" />
        <SidebarLink
          :paths="settingsPaths"
          label="Einstellungen"
          icon="pi pi-cog"
          :collapsed="collapsed"
        />
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
      <!-- Top-Bar: Title + Persona-Tabs + Search -->
      <header class="flex items-center justify-between h-12 px-5 bg-white border-b border-gray-200/80">
        <div class="flex items-center gap-3">
          <h1 class="text-[14px] font-semibold text-gray-800">{{ pageTitle }}</h1>
          <span v-if="pageSubtitle" class="text-[12px] text-gray-400">{{ pageSubtitle }}</span>
        </div>

        <!-- Persona-Tabs in der Mitte (nur wenn Page persona-sensitive ist) -->
        <div v-if="showPersonaTabs" class="flex-1 flex justify-center">
          <div class="flex gap-1 bg-gray-50 rounded-md p-1">
            <button
              v-for="opt in personaTabs"
              :key="opt.value"
              :class="[
                'px-3 py-1 text-[11px] font-medium rounded transition-colors',
                customerType === opt.value
                  ? 'bg-white text-[#172774] shadow-sm'
                  : 'text-gray-500 hover:text-gray-800',
              ]"
              @click="switchPersona(opt.value)"
            >
              <i :class="opt.icon" class="text-[10px] mr-1" />
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- Search-Placeholder (Phase 9) -->
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

    <!-- Global Toast-Notifications (verfügbar in allen Pages) -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import type { CustomerType } from '../composables/useCustomerType'

const route = useRoute()
const router = useRouter()
const { user, redirectToLogout } = useAuth()
const { customerType } = useCustomerType()
const { hasCrmAccess, hasPatientenAccess, hasMultiPersonaAccess, defaultPersona } = useUserRole()

const collapsed = ref(false)

// Plan v9 Issue #5: Sales-Routen je nach erlaubter Persona auflösen.
// Wenn User nur CRM darf → patienten-Route fällt auf crm-Route zurück (und v.v.).
type SalesKey = 'pipeline' | 'leads'
const SALES_BASE: Record<SalesKey, { crm: string; patienten: string }> = {
  pipeline: { crm: '/crm/pipeline', patienten: '/patienten/pipeline' },
  leads: { crm: '/crm/leads', patienten: '/patienten/leads' },
}
const salesPaths = (key: SalesKey) => {
  const b = SALES_BASE[key]
  const crm = hasCrmAccess.value ? b.crm : b.patienten
  const patienten = hasPatientenAccess.value ? b.patienten : b.crm
  return { heimkunden: crm, patienten, all: hasCrmAccess.value ? b.crm : b.patienten }
}
const termineRoutes = computed(() => ({
  heimkunden: hasCrmAccess.value ? '/crm/termine' : '/patienten/termine',
  patienten: hasPatientenAccess.value ? '/patienten/termine' : '/crm/termine',
  all: hasCrmAccess.value ? '/crm/termine' : '/patienten/termine',
}))
const workflowPaths = computed(() => ({
  heimkunden: hasCrmAccess.value ? '/crm/workflows' : '/patienten/workflows',
  patienten: hasPatientenAccess.value ? '/patienten/workflows' : '/crm/workflows',
  all: hasCrmAccess.value ? '/crm/workflows' : '/patienten/workflows',
}))
const settingsPaths = computed(() => ({
  heimkunden: hasCrmAccess.value ? '/crm/einstellungen' : '/patienten/einstellungen',
  patienten: hasPatientenAccess.value ? '/patienten/einstellungen' : '/crm/einstellungen',
  all: hasCrmAccess.value ? '/crm/einstellungen' : '/patienten/einstellungen',
}))

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

// Persona-Tabs in der Top-Bar — gefiltert nach User-Access (Plan v9 Issue #5)
const ALL_PERSONA_TABS: { value: CustomerType; label: string; icon: string }[] = [
  { value: 'all', label: 'Alle', icon: 'pi pi-th-large' },
  { value: 'heimkunden', label: 'Heimkunden', icon: 'pi pi-building' },
  { value: 'patienten', label: 'Patienten', icon: 'pi pi-user' },
]
const personaTabs = computed(() => {
  return ALL_PERSONA_TABS.filter((t) => {
    if (t.value === 'all') return hasMultiPersonaAccess.value
    if (t.value === 'heimkunden') return hasCrmAccess.value
    if (t.value === 'patienten') return hasPatientenAccess.value
    return false
  })
})

// Mapping: aktuelle Route → korrespondierende Route in der anderen Persona
// Entity-spezifische B2B-Pages (heime, kontakte) haben keine direkte B2C-Entsprechung;
// beim Switch zu Patienten fallen sie auf /patienten (Übersicht) zurück.
const personaRouteMap: { heimkunden: string; patienten: string }[] = [
  { heimkunden: '/crm/pipeline', patienten: '/patienten/pipeline' },
  { heimkunden: '/crm/leads', patienten: '/patienten/leads' },
  { heimkunden: '/crm/heime', patienten: '/patienten' },
  { heimkunden: '/crm/kontakte', patienten: '/patienten' },
  { heimkunden: '/crm/termine', patienten: '/patienten/termine' },
  { heimkunden: '/crm/workflows', patienten: '/patienten/workflows' },
  { heimkunden: '/crm/einstellungen', patienten: '/patienten/einstellungen' },
]

// Zeige Persona-Tabs nur wenn aktuelle Route persona-sensitive ist UND User Zugriff auf >1 Persona hat
const showPersonaTabs = computed(() => {
  if (personaTabs.value.length < 2) return false
  return personaRouteMap.some(
    (m) => route.path.startsWith(m.heimkunden) || route.path.startsWith(m.patienten),
  )
})

const switchPersona = (target: CustomerType) => {
  customerType.value = target
  if (target === 'all') return // keine Navigation bei "Alle"

  // Finde mapping für aktuelle Route und navigiere zur Counterpart
  const map = personaRouteMap.find(
    (m) => route.path.startsWith(m.heimkunden) || route.path.startsWith(m.patienten),
  )
  if (!map) return

  if (target === 'heimkunden' && !route.path.startsWith(map.heimkunden)) {
    router.push(map.heimkunden)
  } else if (target === 'patienten' && !route.path.startsWith(map.patienten)) {
    router.push(map.patienten)
  }
}

// Auto-update customerType wenn User direkt eine /crm/* oder /patienten/* Route besucht
watch(
  () => route.path,
  (newPath) => {
    if (newPath.startsWith('/crm/') && customerType.value === 'patienten') {
      customerType.value = 'heimkunden'
    } else if (newPath.startsWith('/patienten/') && customerType.value === 'heimkunden') {
      customerType.value = 'patienten'
    }

    // Plan v9 Issue #5: Redirect wenn User auf nicht-erlaubte Persona-Route landet
    if (newPath.startsWith('/crm/') && !hasCrmAccess.value && hasPatientenAccess.value) {
      const counterpart = personaRouteMap.find((m) => newPath.startsWith(m.heimkunden))
      if (counterpart) {
        router.replace(counterpart.patienten)
      } else {
        router.replace('/dashboard')
      }
    } else if (newPath.startsWith('/patienten/') && !hasPatientenAccess.value && hasCrmAccess.value) {
      const counterpart = personaRouteMap.find((m) => newPath.startsWith(m.patienten))
      if (counterpart) {
        router.replace(counterpart.heimkunden)
      } else {
        router.replace('/dashboard')
      }
    }
  },
  { immediate: true },
)

// Beim ersten Mount: wenn User in einer "nicht-erlaubten" Persona steht (vom Storage übernommen)
// → auf erlaubte Persona umstellen.
onMounted(() => {
  if (customerType.value === 'heimkunden' && !hasCrmAccess.value) {
    customerType.value = defaultPersona.value
  } else if (customerType.value === 'patienten' && !hasPatientenAccess.value) {
    customerType.value = defaultPersona.value
  } else if (customerType.value === 'all' && !hasMultiPersonaAccess.value) {
    customerType.value = defaultPersona.value
  }
})

// Page-Title
const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/inbox': 'Inbox',
  '/crm/pipeline': 'Pipeline',
  '/crm/leads': 'Leads',
  '/crm/heime': 'Heime',
  '/crm/kontakte': 'Kontakte',
  '/crm/aktivitaeten': 'Aktivitäten',
  '/crm/termine': 'Termine',
  '/crm/aufgaben': 'Aufgaben',
  '/crm/workflows': 'Workflows',
  '/crm/statistiken': 'Berichte',
  '/crm/einstellungen': 'Einstellungen',
  '/patienten': 'Patienten',
  '/patienten/pipeline': 'Pipeline',
  '/patienten/leads': 'Leads',
  '/patienten/termine': 'Termine',
  '/patienten/bewertungen': 'Bewertungen',
  '/patienten/voice-ai': 'Voice-AI',
  '/patienten/marketing': 'Kampagnen',
  '/patienten/workflows': 'Workflows',
  '/patienten/einstellungen': 'Einstellungen',
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
  if (route.path.match(/^\/crm\/heime\/[^/]+$/) && !['bewohner'].includes(route.path.split('/').pop() || '')) {
    return '/ Heimkunde Details'
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
