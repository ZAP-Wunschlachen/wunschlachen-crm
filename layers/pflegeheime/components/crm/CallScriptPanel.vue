<template>
  <div class="bg-white rounded-lg border border-gray-200/80 overflow-hidden">
    <!-- Toggle Header -->
    <button
      class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors"
      @click="expanded = !expanded"
    >
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center">
          <i class="pi pi-book text-[11px] text-orange-500" />
        </div>
        <span class="text-[12px] font-semibold text-gray-700">Gesprächsleitfaden</span>
        <span class="text-[10px] px-1.5 py-0.5 rounded-full font-medium" :class="scenarioBadgeClass">
          {{ scenarioLabel }}
        </span>
      </div>
      <i class="pi text-[10px] text-gray-400 transition-transform duration-200" :class="expanded ? 'pi-chevron-up' : 'pi-chevron-down'" />
    </button>

    <!-- Expanded Content -->
    <div v-if="expanded" class="border-t border-gray-100 px-4 pb-4">

      <!-- Scenario Tabs -->
      <div class="flex gap-1 mt-3 mb-3">
        <button
          v-for="s in scenarios"
          :key="s.id"
          class="text-[10px] px-2 py-1 rounded-md font-medium transition-colors"
          :class="activeScenario === s.id
            ? 'bg-[#172774] text-white'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
          @click="activeScenario = s.id"
        >
          {{ s.short }}
        </button>
      </div>

      <!-- Active Scenario Opener -->
      <div class="bg-blue-50/60 rounded-lg p-3 mb-3">
        <div class="flex items-center gap-1.5 mb-1.5">
          <i class="pi pi-megaphone text-[10px] text-blue-500" />
          <span class="text-[10px] font-semibold text-blue-700 uppercase tracking-wider">Opener — {{ currentScenario.label }}</span>
        </div>
        <p class="text-[11px] text-blue-900 leading-relaxed italic">
          „{{ currentScenario.opener }}"
        </p>
        <p v-if="currentScenario.goal" class="text-[10px] text-blue-600 mt-1.5">
          <strong>Ziel:</strong> {{ currentScenario.goal }}
        </p>
      </div>

      <!-- "Gerade ungünstig" Fallback -->
      <div class="bg-amber-50/60 rounded-lg p-2.5 mb-3">
        <p class="text-[10px] text-amber-800">
          <strong>Wenn „gerade ungünstig":</strong>
          <span class="italic"> „Verstanden. Was passt besser: heute {{ suggestedTime1 }} oder morgen {{ suggestedTime2 }}? Ich brauche wirklich nur 60 Sekunden."</span>
        </p>
      </div>

      <!-- Decision Tree -->
      <div class="mb-3">
        <button
          class="flex items-center gap-1.5 w-full text-left mb-2"
          @click="showDecisionTree = !showDecisionTree"
        >
          <i class="pi text-[9px] text-gray-400" :class="showDecisionTree ? 'pi-chevron-down' : 'pi-chevron-right'" />
          <span class="text-[11px] font-semibold text-gray-700">Entscheidungsbaum</span>
        </button>
        <div v-if="showDecisionTree" class="bg-gray-50 rounded-lg p-3 text-[10px] text-gray-600 space-y-1">
          <p>Starte <strong>IMMER</strong> mit Akut-Frage (5.1). Dann:</p>
          <p class="pl-2">→ PDL klingt offen / erzählt → Wahrheitsfragen, dann Capability-Gap</p>
          <p class="pl-2">→ PDL blockt / „sind zufrieden" → Vertretungs-Frage, dann Weiterbildung</p>
          <p class="pl-2">→ PDL hat wenig Zeit → Nur Akut + Vertretung, dann Closing</p>
          <p class="text-orange-600 font-medium mt-1">Max. 2–3 Fragen pro Call. Weniger ist mehr.</p>
        </div>
      </div>

      <!-- Question Categories -->
      <div class="space-y-1 mb-3">
        <div
          v-for="cat in questionCategories"
          :key="cat.id"
          class="border border-gray-100 rounded-lg overflow-hidden"
        >
          <button
            class="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50/50 transition-colors"
            @click="toggleCategory(cat.id)"
          >
            <div class="flex items-center gap-2">
              <span class="w-4 h-4 rounded text-[8px] font-bold flex items-center justify-center" :class="cat.colorClass">
                {{ cat.badge }}
              </span>
              <span class="text-[11px] font-medium text-gray-700">{{ cat.label }}</span>
              <span v-if="cat.required" class="text-[8px] bg-red-100 text-red-600 px-1 py-0.5 rounded font-medium">PFLICHT</span>
            </div>
            <i class="pi text-[8px] text-gray-400" :class="openCategories.has(cat.id) ? 'pi-chevron-up' : 'pi-chevron-down'" />
          </button>
          <div v-if="openCategories.has(cat.id)" class="px-3 pb-3 space-y-2">
            <div
              v-for="(q, qi) in cat.questions"
              :key="qi"
              class="flex items-start gap-2"
            >
              <button
                class="mt-0.5 w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors"
                :class="checkedQuestions.has(`${cat.id}-${qi}`)
                  ? 'bg-[#172774] border-[#172774]'
                  : 'border-gray-300 hover:border-gray-400'"
                @click="toggleQuestion(`${cat.id}-${qi}`)"
              >
                <i v-if="checkedQuestions.has(`${cat.id}-${qi}`)" class="pi pi-check text-white text-[7px]" />
              </button>
              <div>
                <span v-if="q.label" class="text-[10px] font-semibold text-gray-600">{{ q.label }}: </span>
                <span class="text-[10px] text-gray-600 italic">„{{ q.text }}"</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Objection Handling -->
      <div class="mb-3">
        <button
          class="flex items-center gap-1.5 w-full text-left mb-2"
          @click="showObjections = !showObjections"
        >
          <i class="pi text-[9px] text-gray-400" :class="showObjections ? 'pi-chevron-down' : 'pi-chevron-right'" />
          <span class="text-[11px] font-semibold text-gray-700">Einwandbehandlung</span>
        </button>
        <div v-if="showObjections" class="space-y-1.5">
          <div class="bg-purple-50/50 rounded-lg p-2.5 mb-2">
            <p class="text-[10px] text-purple-800 italic">
              <strong>Reframe (immer):</strong> „Perfekt. Dann geht es nicht um Wechsel, sondern um Ergänzung: Plan B bei Akut/Prothese/Spitzen, damit Bewohner nicht warten müssen."
            </p>
          </div>
          <div
            v-for="(obj, oi) in objections"
            :key="oi"
            class="border border-gray-100 rounded-lg p-2.5"
          >
            <p class="text-[10px] font-semibold text-gray-700 mb-1">„{{ obj.objection }}"</p>
            <p class="text-[10px] text-gray-600 italic">→ „{{ obj.response }}"</p>
          </div>
        </div>
      </div>

      <!-- 15-Second Pitches -->
      <div class="mb-3">
        <button
          class="flex items-center gap-1.5 w-full text-left mb-2"
          @click="showPitches = !showPitches"
        >
          <i class="pi text-[9px] text-gray-400" :class="showPitches ? 'pi-chevron-down' : 'pi-chevron-right'" />
          <span class="text-[11px] font-semibold text-gray-700">15-Sekunden-Pitches</span>
          <span class="text-[9px] text-gray-400">(nur wenn Bedarf erkennbar)</span>
        </button>
        <div v-if="showPitches" class="space-y-2">
          <div
            v-for="pitch in pitches"
            :key="pitch.id"
            class="bg-green-50/60 rounded-lg p-2.5"
          >
            <div class="flex items-center gap-1.5 mb-1">
              <span class="text-[10px] font-semibold text-green-700">{{ pitch.label }}</span>
              <span class="text-[9px] text-green-600">— {{ pitch.useWhen }}</span>
            </div>
            <p class="text-[10px] text-green-900 italic">„{{ pitch.text }}"</p>
          </div>
        </div>
      </div>

      <!-- Closing Options -->
      <div class="mb-3">
        <button
          class="flex items-center gap-1.5 w-full text-left mb-2"
          @click="showClosing = !showClosing"
        >
          <i class="pi text-[9px] text-gray-400" :class="showClosing ? 'pi-chevron-down' : 'pi-chevron-right'" />
          <span class="text-[11px] font-semibold text-gray-700">Closing</span>
        </button>
        <div v-if="showClosing" class="space-y-2">
          <div
            v-for="close in closingOptions"
            :key="close.id"
            class="border border-gray-100 rounded-lg p-2.5"
          >
            <p class="text-[10px] font-semibold text-gray-700 mb-1">{{ close.label }}</p>
            <p class="text-[10px] text-gray-600 italic mb-2">„{{ close.text }}"</p>
            <button
              v-if="close.action"
              class="text-[9px] font-medium text-[#172774] hover:text-[#3d4a8e] transition-colors flex items-center gap-1"
              @click="close.action()"
            >
              <i :class="close.actionIcon" class="text-[9px]" />
              {{ close.actionLabel }}
            </button>
          </div>
        </div>
      </div>

      <!-- Call Documentation -->
      <div class="border-t border-gray-100 pt-3">
        <button
          class="flex items-center gap-1.5 w-full text-left mb-2"
          @click="showCallDoc = !showCallDoc"
        >
          <i class="pi text-[9px] text-gray-400" :class="showCallDoc ? 'pi-chevron-down' : 'pi-chevron-right'" />
          <span class="text-[11px] font-semibold text-gray-700">Call-Dokumentation</span>
        </button>
        <div v-if="showCallDoc" class="space-y-2.5">
          <div>
            <label class="block text-[10px] text-gray-500 mb-0.5 font-medium">Gesprächspartner</label>
            <input
              v-model="callDoc.contactName"
              type="text"
              :placeholder="primaryContactName || 'Name + Rolle'"
              class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[11px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
            />
          </div>
          <div>
            <label class="block text-[10px] text-gray-500 mb-0.5 font-medium">Erreicht</label>
            <select
              v-model="callDoc.reached"
              class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[11px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
            >
              <option value="pdl">PDL</option>
              <option value="heimleitung">Heimleitung</option>
              <option value="gatekeeper">Gatekeeper</option>
              <option value="mailbox">Mailbox</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] text-gray-500 mb-0.5 font-medium">Pain identifiziert</label>
            <div class="flex flex-wrap gap-1">
              <button
                v-for="pain in painOptions"
                :key="pain"
                class="text-[9px] px-2 py-1 rounded-full font-medium transition-colors"
                :class="callDoc.pains.includes(pain)
                  ? 'bg-[#172774] text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
                @click="togglePain(pain)"
              >
                {{ pain }}
              </button>
            </div>
          </div>
          <div>
            <label class="block text-[10px] text-gray-500 mb-0.5 font-medium">Status aktueller Partner</label>
            <select
              v-model="callDoc.partnerStatus"
              class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[11px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
            >
              <option value="">— Auswählen —</option>
              <option value="zufrieden">Zufrieden</option>
              <option value="neutral">Neutral</option>
              <option value="unzufrieden">Unzufrieden</option>
              <option value="keiner">Kein Partner</option>
              <option value="wechsel">Wechsel möglich</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] text-gray-500 mb-0.5 font-medium">Zusammenfassung</label>
            <textarea
              v-model="callDoc.summary"
              rows="3"
              placeholder="2–3 Sätze, was besprochen wurde..."
              class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[11px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40 resize-none"
            />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[10px] text-gray-500 mb-0.5 font-medium">Nächster Schritt</label>
              <input
                v-model="callDoc.nextStep"
                type="text"
                placeholder="z.B. Rückruf Di 10:30"
                class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[11px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
              />
            </div>
            <div>
              <label class="block text-[10px] text-gray-500 mb-0.5 font-medium">Follow-up Datum</label>
              <input
                v-model="callDoc.followUpDate"
                type="date"
                class="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[11px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
              />
            </div>
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              v-model="callDoc.escalation"
              class="rounded border-gray-300 text-red-500 focus:ring-red-500/30 w-3.5 h-3.5"
            />
            <span class="text-[10px] text-red-600 font-medium">Eskalation an Tony</span>
          </label>

          <!-- Save Button -->
          <button
            class="w-full py-2 rounded-lg text-[11px] font-semibold text-white transition-colors flex items-center justify-center gap-1.5"
            :class="saving ? 'bg-gray-400' : 'bg-[#172774] hover:bg-[#3d4a8e]'"
            :disabled="saving"
            @click="saveCallDoc"
          >
            <i v-if="saving" class="pi pi-spin pi-spinner text-[10px]" />
            <i v-else class="pi pi-save text-[10px]" />
            Als Aktivität speichern
          </button>
          <Transition name="fade">
            <p v-if="saveMsg" class="text-[10px] text-center" :class="saveOk ? 'text-green-600' : 'text-red-500'">{{ saveMsg }}</p>
          </Transition>
        </div>
      </div>

      <!-- Escalation Triggers -->
      <div class="mt-3 border-t border-gray-100 pt-3">
        <button
          class="flex items-center gap-1.5 w-full text-left mb-2"
          @click="showEscalation = !showEscalation"
        >
          <i class="pi text-[9px] text-gray-400" :class="showEscalation ? 'pi-chevron-down' : 'pi-chevron-right'" />
          <span class="text-[11px] font-semibold text-red-600">Eskalations-Trigger</span>
        </button>
        <div v-if="showEscalation" class="space-y-1.5">
          <div
            v-for="(esc, ei) in escalationTriggers"
            :key="ei"
            class="bg-red-50/60 rounded-lg p-2.5"
          >
            <p class="text-[10px] font-semibold text-red-700">{{ esc.signal }}</p>
            <p class="text-[9px] text-red-600 mt-0.5">→ {{ esc.action }}</p>
          </div>
        </div>
      </div>

      <!-- Tonality Reminder -->
      <div class="mt-3 bg-gray-50 rounded-lg p-2.5">
        <p class="text-[9px] text-gray-500 leading-relaxed">
          <strong>Tonalität:</strong> Ruhig, respektvoll, kollegial — nie verkäuferisch. Tempo anpassen. Nie Konkurrenz schlecht reden. Max. 20 Sek. Voicemail. Kein Pitch ohne Pain.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NursingHome, NursingHomeLead, NursingHomeContact, CrmActivity } from '~/types/crm'

const props = defineProps<{
  lead: NursingHomeLead
  nursingHome: NursingHome | null
  contact: NursingHomeContact | null
  activities: CrmActivity[]
  leadId: string
}>()

const emit = defineEmits<{
  (e: 'setFollowUp', date: string): void
  (e: 'openEmail'): void
  (e: 'saved'): void
}>()

const expanded = ref(false)
const showDecisionTree = ref(false)
const showObjections = ref(false)
const showPitches = ref(false)
const showClosing = ref(false)
const showCallDoc = ref(false)
const showEscalation = ref(false)
const openCategories = ref(new Set<string>())
const checkedQuestions = ref(new Set<string>())
const saving = ref(false)
const saveMsg = ref('')
const saveOk = ref(true)

// ─── Scenario Detection ────────────────────────────────────────────

type ScenarioId = 'cold' | 'followup' | 'checkin'

const hasEmailActivity = computed(() =>
  props.activities.some(a => a.type === 'email_sent')
)
const hasAnyActivity = computed(() => props.activities.length > 0)
const hasCoopPartner = computed(() => props.lead.has_cooperation_partner)

const detectedScenario = computed<ScenarioId>(() => {
  if (hasCoopPartner.value) return 'checkin'
  if (hasEmailActivity.value) return 'followup'
  return 'cold'
})

const activeScenario = ref<ScenarioId>(detectedScenario.value)

watch(detectedScenario, (val) => { activeScenario.value = val })

const contactName = computed(() => {
  if (!props.contact) return '[Name]'
  return [props.contact.first_name, props.contact.last_name].filter(Boolean).join(' ') || '[Name]'
})

const district = computed(() => {
  if (!props.nursingHome) return '[Bezirk]'
  return props.nursingHome.city || props.nursingHome.zip || '[Bezirk]'
})

const primaryContactName = computed(() => {
  if (!props.contact) return ''
  const parts = [props.contact.first_name, props.contact.last_name].filter(Boolean)
  if (props.contact.job_title) parts.push(`(${props.contact.job_title})`)
  return parts.join(' ')
})

const scenarios = computed(() => [
  { id: 'cold' as ScenarioId, short: 'A: Kaltanruf', label: 'Kaltanruf', goal: 'Neugier erzeugen, NICHT pitchen. Problem-First statt Produkt-First.',
    opener: `Guten Tag ${contactName.value === '[Name]' ? '' : 'Frau/Herr '}${contactName.value}, Tony Günther von Wunschlachen. Ich halte es kurz — ich spreche gerade mit mehreren Einrichtungen in ${district.value} zum Thema Akutversorgung und Transportvermeidung bei Bewohnern. Darf ich Ihnen dazu eine kurze Frage stellen?`
  },
  { id: 'followup' as ScenarioId, short: 'B: Follow-Up', label: 'Follow-Up nach E-Mail', goal: 'An die E-Mail anknüpfen, ohne „Haben Sie meine Mail gelesen?" zu fragen.',
    opener: `Guten Tag ${contactName.value === '[Name]' ? '' : 'Frau/Herr '}${contactName.value}, Tony Günther von Wunschlachen. Wir hatten Ihnen Infos zum Thema Vor-Ort-Zahnmedizin geschickt. Ich wollte kurz klären, ob das Thema Akutversorgung bei Ihnen immer noch relevant ist?`
  },
  { id: 'checkin' as ScenarioId, short: 'C: Check-in', label: 'Check-in (bestehender Kontakt)', goal: 'Beziehung pflegen, Bedarf identifizieren — ohne Verkaufsdruck.',
    opener: `Guten Tag ${contactName.value === '[Name]' ? '' : 'Frau/Herr '}${contactName.value}, Tony Günther von Wunschlachen. Wir sind ja für Ihr Haus als Notruf-Kontakt hinterlegt. Ich wollte kurz nachfragen: Wie läuft es aktuell bei Ihnen mit der zahnärztlichen Versorgung? Gibt es Themen, wo wir noch mehr unterstützen können?`
  },
])

const currentScenario = computed(() =>
  scenarios.value.find(s => s.id === activeScenario.value) || scenarios.value[0]
)

const scenarioLabel = computed(() => {
  const labels: Record<ScenarioId, string> = {
    cold: 'Kaltanruf',
    followup: 'Follow-Up',
    checkin: 'Check-in',
  }
  return labels[detectedScenario.value]
})

const scenarioBadgeClass = computed(() => {
  const classes: Record<ScenarioId, string> = {
    cold: 'bg-blue-100 text-blue-700',
    followup: 'bg-amber-100 text-amber-700',
    checkin: 'bg-green-100 text-green-700',
  }
  return classes[detectedScenario.value]
})

// Time suggestions
const suggestedTime1 = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return '14:00'
  return '10:30'
})
const suggestedTime2 = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return '10:30'
  return '14:00'
})

// ─── Question Categories ─────────────────────────────────────────

const questionCategories = computed(() => [
  {
    id: 'pflicht', label: 'Pflichtfragen (Resilienz)', badge: '5.1', required: true,
    colorClass: 'bg-red-100 text-red-700',
    questions: [
      { label: 'Akut', text: 'Wenn am Mittwoch eine Prothese drückt oder jemand Schmerzen hat — wie schnell bekommen Sie Hilfe?' },
      { label: 'Vertretung', text: 'Was ist Ihr Plan B, wenn der Zahnarzt Urlaub hat oder ausfällt?' },
    ],
  },
  {
    id: 'wahrheit', label: 'Wahrheitsfragen', badge: '5.2', required: false,
    colorClass: 'bg-blue-100 text-blue-700',
    questions: [
      { text: 'Wann musste zuletzt ein Bewohner wegen Zahnproblemen in eine Praxis — und warum?' },
      { text: 'Wann war der letzte echte Akutfall — wie lief die Lösung konkret ab?' },
      { text: 'Wenn eine Prothese bricht: Wie lange dauert es typischerweise, bis es wieder tragbar ist?' },
    ],
  },
  {
    id: 'operativ', label: 'Operative Fragen', badge: '5.3', required: false,
    colorClass: 'bg-purple-100 text-purple-700',
    questions: [
      { label: 'Transport', text: 'Wie oft müssen Bewohner raus — und wer organisiert/begleitet das?' },
      { label: 'Listen', text: 'Wer erstellt die Bewohnerliste — und wie oft ändert sie sich am Behandlungstag?' },
      { label: 'Einwilligungen', text: 'Wie lange dauert es im Schnitt, bis Einwilligungen/Unterschriften da sind?' },
      { label: 'Doku', text: 'Bekommen Sie nach dem Besuch eine klare Rückmeldung, was gemacht wurde und was Pflege beachten soll — oder müssen Sie nachhaken?' },
      { label: 'Arztwahl', text: 'Gibt es Bewohner/Angehörige, die den Kooperationszahnarzt nicht möchten — wie lösen Sie das organisatorisch?' },
    ],
  },
  {
    id: 'capability', label: 'Capability-Gap', badge: '5.4', required: false,
    colorClass: 'bg-orange-100 text-orange-700',
    questions: [
      { label: 'Vor-Ort-Quote', text: 'Was wird bei Ihnen wirklich im Haus gelöst — und was geht regelmäßig in die Praxis?' },
      { label: 'Prothetik', text: 'Wie läuft Prothetik konkret ab (Abdruck, Anprobe, Reparatur) — und wie lange dauert es meist?' },
      { label: 'Chirurgie', text: 'Wenn eine Extraktion ansteht: passiert das vor Ort oder wird transportiert?' },
      { label: 'Peaks', text: 'Wenn mehrere Bewohner gleichzeitig Bedarf haben: gibt es Zusatztermine oder staut sich das?' },
    ],
  },
  {
    id: 'weiterbildung', label: 'Weiterbildung / Mundpflege', badge: '5.5', required: false,
    colorClass: 'bg-teal-100 text-teal-700',
    questions: [
      { text: 'Wie lösen Sie aktuell das Thema Mundpflege-Schulung fürs Pflegepersonal — gerade auch Richtung Audit?' },
      { text: 'Macht Ihr aktueller Kooperationspartner auch regelmäßige Schulungen für die Pflege? Das ist ein Thema, das bei vielen Häusern unter den Tisch fällt.' },
    ],
  },
])

const toggleCategory = (id: string) => {
  const s = new Set(openCategories.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  openCategories.value = s
}

const toggleQuestion = (key: string) => {
  const s = new Set(checkedQuestions.value)
  if (s.has(key)) s.delete(key)
  else s.add(key)
  checkedQuestions.value = s
}

// ─── Objections ───────────────────────────────────────────────────

const objections = [
  { objection: 'Wir sind zufrieden.', response: 'Super. Dann nur zwei Fragen zur Absicherung: Akut zwischen Terminen — wie schnell Hilfe? Und Plan B bei Ausfall?' },
  { objection: 'Schicken Sie erst mal Unterlagen.', response: 'Gern. Damit es nicht untergeht: Wann darf ich 8 Minuten nachfassen — Di 10:30 oder Do 14:00?' },
  { objection: 'Das entscheidet die Hausleitung.', response: 'Verstanden. Wer ist die richtige Person und wann passt ein 10-Minuten-Call zu dritt?' },
  { objection: 'Wir brauchen keinen zweiten.', response: 'Es geht nicht um zweiten Zahnarzt, sondern um Plan B für Akut/Prothetik, wenn Kapazitäten knapp sind.' },
  { objection: 'Keine Zeit.', response: 'Absolut. Dann nur 2 Fragen jetzt — wenn es nicht relevant ist, hake ich es sofort ab.' },
  { objection: 'Wir haben eine Praxis direkt nebenan.', response: 'Für die mobilen Bewohner super. Was machen Sie mit den Bettlägerigen oder den Demenzkranken, die nicht raus können?' },
  { objection: 'Die Bewohner gehen selbst zum Zahnarzt.', response: 'Das klappt gut — solange es klappt. Was passiert, wenn sich die Mobilität ändert — Demenz, Rollstuhl, Pflegegrad steigt?' },
  { objection: 'Die Charité / ein großes Haus macht das.', response: 'Wie ist die Erreichbarkeit bei echten Akutfällen? Wie lang ist der Terminvorlauf normalerweise?' },
]

// ─── Pitches ──────────────────────────────────────────────────────

const pitches = [
  { id: 'backup', label: 'Pitch A: Backup / Entlastung', useWhen: 'Akutprobleme, Vertretung, Engpässe',
    text: 'Genau für solche Akut- und Prothesenfälle werden wir oft ergänzend genutzt: Wir lösen viel vor Ort, reduzieren Transporte/Begleitung und sind bei Bedarf kurzfristig im Haus. Das entlastet Pflege und vermeidet Eskalationen.' },
  { id: 'tiefe', label: 'Pitch B: Versorgungstiefe', useWhen: 'Capability-Gaps, Überweisungen, lange Prothetik',
    text: 'Viele Häuser sind in der Routine gut versorgt, aber bei Prothetik/Extraktionen oder Peaks wird es organisatorisch zäh. Wir sind als mobiles Team so aufgestellt, dass ein großer Teil dieser Fälle im Heim lösbar ist — mit klarer Kommunikation und digitaler Doku.' },
  { id: 'compliance', label: 'Pitch C: Weiterbildung / Compliance', useWhen: 'Mundpflege-Defizite, Audits',
    text: 'Ein Thema, das bei vielen Häusern unter den Tisch fällt: die praktische Mundpflege-Schulung fürs Pflegepersonal. Wir bieten das pflegepraktisch und auditfähig an — als Ergänzung zur Routine. Das entlastet Sie beim Qualitätsthema.' },
]

// ─── Closing Options ──────────────────────────────────────────────

const closingOptions = computed(() => [
  {
    id: 'termin', label: 'Option A — Termin im Haus (15 Min)',
    text: 'Lassen Sie uns das kurz bei Ihnen klären — 15 Minuten reichen. Passt eher Dienstag 10:00 oder Donnerstag 14:30?',
    action: () => emit('setFollowUp', getNextWeekday(2)),
    actionLabel: 'Follow-up Termin setzen',
    actionIcon: 'pi pi-calendar-plus',
  },
  {
    id: 'call', label: 'Option B — Mini-Call (8–10 Min)',
    text: 'Ich schicke eine 1-Seite. Damit es nicht untergeht: Soll ich Sie Donnerstag 10:30 oder Freitag 12:00 kurz anrufen?',
    action: () => { emit('openEmail'); emit('setFollowUp', getNextWeekday(4)) },
    actionLabel: 'E-Mail senden + Follow-up',
    actionIcon: 'pi pi-envelope',
  },
  {
    id: 'mail', label: 'Option C — Mail-only abfangen',
    text: 'Gern. Ich sende es jetzt. Ich rufe dann am nächsten Dienstag kurz an — passt das?',
    action: () => emit('openEmail'),
    actionLabel: 'E-Mail öffnen',
    actionIcon: 'pi pi-envelope',
  },
])

const getNextWeekday = (targetDay: number): string => {
  const now = new Date()
  const current = now.getDay()
  let diff = targetDay - current
  if (diff <= 0) diff += 7
  const target = new Date(now)
  target.setDate(target.getDate() + diff)
  return target.toISOString().split('T')[0]
}

// ─── Escalation Triggers ──────────────────────────────────────────

const escalationTriggers = [
  { signal: '„Unser Zahnarzt geht in Rente / hört auf"', action: 'Termin vereinbaren, sofort Tony informieren' },
  { signal: 'PDL ist aktiv unzufrieden mit aktuellem Partner', action: 'Pain genau dokumentieren, Tony übernimmt' },
  { signal: 'Termin vor Ort wird angeboten', action: 'Termin bestätigen, Tony geht mit oder übernimmt' },
  { signal: 'Hausleitung / QM will direkt sprechen', action: 'Termin koordinieren, Tony macht den Call' },
  { signal: 'Große Kette signalisiert Interesse (5+ Häuser)', action: 'Kontaktdaten sichern, Tony übernimmt' },
]

// ─── Call Documentation ───────────────────────────────────────────

const painOptions = ['Akut', 'Prothetik', 'Transport', 'Vertretung', 'Doku', 'Weiterbildung']

const callDoc = ref({
  contactName: '',
  reached: 'pdl' as string,
  pains: [] as string[],
  partnerStatus: '' as string,
  summary: '',
  nextStep: '',
  followUpDate: '',
  escalation: false,
})

const togglePain = (pain: string) => {
  const idx = callDoc.value.pains.indexOf(pain)
  if (idx >= 0) callDoc.value.pains.splice(idx, 1)
  else callDoc.value.pains.push(pain)
}

const saveCallDoc = async () => {
  saving.value = true
  saveMsg.value = ''

  try {
    const { createActivity } = useActivities()
    const lines = [
      `Gesprächspartner: ${callDoc.value.contactName || primaryContactName.value || '–'}`,
      `Erreicht: ${callDoc.value.reached}`,
      `Pain: ${callDoc.value.pains.length > 0 ? callDoc.value.pains.join(', ') : 'keiner'}`,
      `Partner-Status: ${callDoc.value.partnerStatus || '–'}`,
      `Nächster Schritt: ${callDoc.value.nextStep || '–'}`,
      callDoc.value.escalation ? '⚠️ ESKALATION AN TONY' : '',
      '',
      callDoc.value.summary,
    ].filter(Boolean).join('\n')

    await createActivity({
      nursing_home_lead_id: props.leadId,
      type: 'call',
      subject: `Anruf: ${callDoc.value.contactName || primaryContactName.value || nursingHomeName.value}`,
      content: lines,
      direction: 'outbound',
      outcome: callDoc.value.reached === 'mailbox' ? 'no_contact' : (callDoc.value.pains.length > 0 ? 'successful' : 'callback'),
      metadata: {
        reached: callDoc.value.reached,
        pains: callDoc.value.pains,
        partner_status: callDoc.value.partnerStatus,
        next_step: callDoc.value.nextStep,
        escalation: callDoc.value.escalation,
        source: 'call_script',
      },
    })

    // Set follow-up date if provided
    if (callDoc.value.followUpDate) {
      emit('setFollowUp', callDoc.value.followUpDate)
    }

    saveOk.value = true
    saveMsg.value = 'Aktivität gespeichert!'
    emit('saved')

    // Reset form
    setTimeout(() => {
      callDoc.value = { contactName: '', reached: 'pdl', pains: [], partnerStatus: '', summary: '', nextStep: '', followUpDate: '', escalation: false }
      checkedQuestions.value = new Set()
      saveMsg.value = ''
    }, 1500)
  } catch {
    saveOk.value = false
    saveMsg.value = 'Fehler beim Speichern'
  } finally {
    saving.value = false
  }
}

const nursingHomeName = computed(() => props.nursingHome?.name || '–')
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
