<template>
  <Teleport to="body">
    <transition name="whatsnew-slide">
      <div
        v-if="visible"
        class="fixed bottom-5 right-5 z-[9999] w-[340px] bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#172774] to-[#3d4a8e]">
          <div class="flex items-center gap-2">
            <i class="pi pi-sparkles text-white/90 text-[13px]" />
            <span class="text-[13px] font-semibold text-white">Neu im CRM</span>
          </div>
          <button
            @click="dismiss"
            class="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/20 transition-colors"
          >
            <i class="pi pi-times text-white/80 text-[11px]" />
          </button>
        </div>

        <!-- Content -->
        <div class="px-4 py-3">
          <h3 class="text-[13px] font-semibold text-gray-800 mb-1">{{ currentUpdate.title }}</h3>
          <p class="text-[11px] text-gray-500 leading-relaxed">{{ currentUpdate.description }}</p>

          <!-- Feature bullets -->
          <ul v-if="currentUpdate.features?.length" class="mt-2 space-y-1">
            <li
              v-for="(feature, i) in currentUpdate.features"
              :key="i"
              class="flex items-start gap-1.5 text-[11px] text-gray-600"
            >
              <i class="pi pi-check-circle text-[#172774] text-[10px] mt-0.5 flex-shrink-0" />
              <span>{{ feature }}</span>
            </li>
          </ul>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t border-gray-100">
          <span class="text-[10px] text-gray-400">{{ currentUpdate.date }}</span>
          <button
            @click="dismiss"
            class="text-[11px] font-medium text-[#172774] hover:text-[#3d4a8e] transition-colors"
          >
            Verstanden
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
interface FeatureUpdate {
  id: string
  title: string
  description: string
  features?: string[]
  date: string
}

const UPDATES: FeatureUpdate[] = [
  {
    id: 'v1.5-newsletter',
    title: 'Newsletter-Workflows',
    description: 'Sende edukative Inhalte zu zahnmedizinischen Themen automatisch an deine Pflegeheim-Leads.',
    features: [
      'Breite Auswahl an zahnmedizinischen Themen',
      'Einmalige oder wiederkehrende Newsletter',
      'Automatische Zuordnung als Aktivitat',
    ],
    date: '15. Marz 2026',
  },
  {
    id: 'v1.4-notes-fix',
    title: 'Import-Notizen als Kommentare',
    description: 'Excel-Notizen werden jetzt korrekt als Aktivitaten im Feed angezeigt, nicht mehr im Pflegeheim-Notizfeld.',
    features: [
      'Notizen erscheinen im Activity Feed',
      'Bessere Nachverfolgbarkeit',
    ],
    date: '15. Marz 2026',
  },
  {
    id: 'v1.3-placetel',
    title: 'Click-to-Call Telefonie',
    description: 'Starte Anrufe direkt aus dem CRM heraus und tracke Ergebnisse automatisch.',
    features: [
      'Click-to-Call bei allen Kontakten',
      'Anruf-Ergebnis Dialog nach dem Gesprach',
      'Anruf-Historie pro Lead',
    ],
    date: '14. Marz 2026',
  },
  {
    id: 'v1.2-import',
    title: 'Excel-Import',
    description: '786 Leads aus der Sales Pipeline importiert. Alle Daten lokal verfugbar.',
    features: [
      'Drag & Drop Excel-Upload',
      'Kontakte, Leads & Aktivitaten',
      'Lokaler Modus ohne Backend',
    ],
    date: '13. Marz 2026',
  },
]

const STORAGE_KEY = 'crm_whatsnew_seen'

const visible = ref(false)

const getSeenUpdates = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

const currentUpdate = computed(() => {
  const seen = getSeenUpdates()
  return UPDATES.find(u => !seen.includes(u.id)) || UPDATES[0]
})

const dismiss = () => {
  visible.value = false
  const seen = getSeenUpdates()
  if (!seen.includes(currentUpdate.value.id)) {
    seen.push(currentUpdate.value.id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seen))
  }
}

onMounted(() => {
  const seen = getSeenUpdates()
  const hasUnseen = UPDATES.some(u => !seen.includes(u.id))
  if (hasUnseen) {
    setTimeout(() => { visible.value = true }, 1500)
  }
})
</script>

<style scoped>
.whatsnew-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.whatsnew-slide-leave-active {
  transition: all 0.25s ease-in;
}
.whatsnew-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.whatsnew-slide-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
</style>
