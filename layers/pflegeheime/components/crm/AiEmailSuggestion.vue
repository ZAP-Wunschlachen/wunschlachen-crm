<template>
  <div class="bg-white rounded-lg border border-gray-200/80 p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
        <i class="pi pi-sparkles text-[10px] text-[#172774]" />
        KI E-Mail Vorschlag
      </h3>
      <button
        class="text-[10px] text-gray-400 hover:text-[#172774] transition-colors font-medium"
        title="Neu generieren"
        @click="regenerate"
      >
        <i class="pi pi-refresh text-[10px]" />
        Neu generieren
      </button>
    </div>

    <div v-if="currentSuggestion" class="space-y-2">
      <!-- Subject -->
      <div class="bg-gray-50 rounded-md px-3 py-2">
        <p class="text-[10px] text-gray-400 font-medium mb-0.5">Betreff</p>
        <p class="text-[12px] text-gray-800 font-medium">{{ currentSuggestion.subject }}</p>
      </div>

      <!-- Body preview -->
      <div class="bg-gray-50 rounded-md px-3 py-2">
        <p class="text-[10px] text-gray-400 font-medium mb-0.5">Vorschau</p>
        <p class="text-[11px] text-gray-600 leading-relaxed whitespace-pre-line">{{ currentSuggestion.preview }}</p>
      </div>

      <!-- Action button -->
      <button
        class="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-[#172774] rounded-md hover:bg-[#3d4a8e] transition-colors mt-1"
        @click="$emit('apply', currentSuggestion)"
      >
        <i class="pi pi-check text-[10px]" />
        Übernehmen
      </button>
    </div>

    <div v-else class="text-[11px] text-gray-400 text-center py-3">
      Kein Vorschlag verfügbar
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NursingHomeLead, NursingHomeContact, CrmActivity } from '~/types/crm'

const props = defineProps<{
  lead: NursingHomeLead
  contact: NursingHomeContact | null
  activities: CrmActivity[]
}>()

defineEmits<{
  apply: [suggestion: { subject: string; body: string; preview: string; category: string }]
}>()

interface EmailSuggestion {
  subject: string
  body: string
  preview: string
  category: string
}

const currentIndex = ref(0)

const contactName = computed(() => {
  if (!props.contact) return ''
  return [props.contact.first_name, props.contact.last_name].filter(Boolean).join(' ')
})

const contactGreeting = computed(() => {
  if (!props.contact?.last_name) return 'Sehr geehrte Damen und Herren'
  return `Sehr geehrte/r Frau/Herr ${props.contact.last_name}`
})

const suggestions = computed<EmailSuggestion[]>(() => {
  const acts = props.activities || []
  const stage = props.lead?.opportunity_stage
  const sortedActs = [...acts].sort((a, b) =>
    new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime()
  )
  const lastAct = sortedActs[0]
  const result: EmailSuggestion[] = []

  // No activity: initial outreach
  if (acts.length === 0) {
    result.push({
      category: 'outreach',
      subject: 'Zahnärztliche Versorgung für Ihre Bewohner',
      body: `${contactGreeting.value},\n\nwir möchten uns als zahnärztliche Praxis vorstellen, die sich auf die Versorgung von Pflegeheimbewohnern spezialisiert hat.\n\nWir bieten regelmäßige Besuche vor Ort an und kümmern uns um die komplette zahnärztliche Betreuung Ihrer Bewohner.\n\nGerne würden wir Ihnen unser Konzept in einem persönlichen Gespräch vorstellen.\n\nMit freundlichen Grüßen`,
      preview: `${contactGreeting.value},\n\nwir möchten uns als zahnärztliche Praxis vorstellen, die sich auf die Versorgung von Pflegeheimbewohnern spezialisiert hat.`,
    })
  }

  // Last activity was call with no_contact
  if (lastAct?.type === 'call' && lastAct?.outcome === 'no_contact') {
    result.push({
      category: 'follow_up',
      subject: 'Follow-up: Zahnärztliche Versorgung',
      body: `${contactGreeting.value},\n\nleider konnte ich Sie telefonisch nicht erreichen. Ich wollte mich bezüglich der zahnärztlichen Versorgung Ihrer Bewohner bei Ihnen melden.\n\nBitte lassen Sie mich wissen, wann ich Sie am besten erreichen kann, oder antworten Sie gerne auf diese E-Mail.\n\nMit freundlichen Grüßen`,
      preview: `${contactGreeting.value},\n\nleider konnte ich Sie telefonisch nicht erreichen. Ich wollte mich bezüglich der zahnärztlichen Versorgung...`,
    })
  }

  // Presentation stage
  if (stage === 'Presentation') {
    result.push({
      category: 'presentation',
      subject: 'Terminbestätigung: Präsentation zahnärztliche Versorgung',
      body: `${contactGreeting.value},\n\nhiermit bestätige ich unseren vereinbarten Termin zur Präsentation unseres zahnärztlichen Versorgungskonzepts.\n\nIch werde Ihnen einen Überblick über unser Leistungsspektrum geben und freue mich auf den persönlichen Austausch.\n\nMit freundlichen Grüßen`,
      preview: `${contactGreeting.value},\n\nhiermit bestätige ich unseren vereinbarten Termin zur Präsentation unseres zahnärztlichen Versorgungskonzepts.`,
    })
  }

  // Follow-up stage
  if (stage === 'Follow-up') {
    result.push({
      category: 'follow_up',
      subject: 'Rückmeldung zu unserem Gespräch',
      body: `${contactGreeting.value},\n\nvielen Dank für das freundliche Gespräch. Wie besprochen, sende ich Ihnen weitere Informationen zu unserem Versorgungskonzept.\n\nBei Fragen stehe ich Ihnen jederzeit zur Verfügung.\n\nMit freundlichen Grüßen`,
      preview: `${contactGreeting.value},\n\nvielen Dank für das freundliche Gespräch. Wie besprochen, sende ich Ihnen weitere Informationen...`,
    })
  }

  // Last activity was rejection
  if (lastAct?.outcome === 'rejection') {
    result.push({
      category: 'follow_up',
      subject: 'Vielen Dank für Ihre Rückmeldung',
      body: `${contactGreeting.value},\n\nvielen Dank für Ihre ehrliche Rückmeldung. Wir verstehen Ihre Entscheidung und respektieren diese.\n\nSollte sich Ihre Situation in Zukunft ändern, stehen wir Ihnen gerne zur Verfügung.\n\nMit freundlichen Grüßen`,
      preview: `${contactGreeting.value},\n\nvielen Dank für Ihre ehrliche Rückmeldung. Wir verstehen Ihre Entscheidung und respektieren diese.`,
    })
  }

  // Generic follow-up (always available as fallback)
  result.push({
    category: 'general',
    subject: 'Kurzes Update — Zahnärztliche Betreuung',
    body: `${contactGreeting.value},\n\nich wollte mich kurz bei Ihnen melden und nachfragen, ob es Neuigkeiten bezüglich der zahnärztlichen Versorgung Ihrer Bewohner gibt.\n\nWir stehen Ihnen weiterhin gerne zur Verfügung.\n\nMit freundlichen Grüßen`,
    preview: `${contactGreeting.value},\n\nich wollte mich kurz bei Ihnen melden und nachfragen, ob es Neuigkeiten bezüglich der zahnärztlichen Versorgung...`,
  })

  return result
})

const currentSuggestion = computed(() => {
  if (suggestions.value.length === 0) return null
  return suggestions.value[currentIndex.value % suggestions.value.length]
})

const regenerate = () => {
  if (suggestions.value.length > 1) {
    currentIndex.value = (currentIndex.value + 1) % suggestions.value.length
  }
}
</script>
