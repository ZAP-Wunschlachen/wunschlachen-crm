<template>
  <div class="bg-gradient-to-br from-[#f6f6f8]/80 to-[#e5e6ee]/50 rounded-lg border border-[#cacdde]/50 overflow-hidden">
    <!-- Header -->
    <button
      class="w-full flex items-center justify-between px-4 py-3 hover:bg-white/30 transition-colors"
      @click="isOpen = !isOpen"
    >
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-[#172774] to-purple-500 flex items-center justify-center">
          <i class="pi pi-sparkles text-[11px] text-white" />
        </div>
        <div class="text-left">
          <span class="text-[12px] font-semibold text-gray-800">Call Briefing</span>
          <span v-if="!isOpen && briefing" class="text-[10px] text-[#3d4a8e] ml-1.5">{{ briefing.readiness }}</span>
        </div>
      </div>
      <i class="pi text-[10px] text-gray-400" :class="isOpen ? 'pi-chevron-up' : 'pi-chevron-down'" />
    </button>

    <div v-if="isOpen" class="px-4 pb-4 space-y-3">
      <!-- Readiness Score -->
      <div class="flex items-center gap-3 bg-white/60 rounded-lg p-3">
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-bold border-2"
          :class="readinessClass"
        >
          {{ briefing?.score || 0 }}
        </div>
        <div class="flex-1">
          <p class="text-[11px] font-semibold text-gray-800">{{ briefing?.readiness }}</p>
          <p class="text-[10px] text-gray-500 mt-0.5">{{ briefing?.readinessDetail }}</p>
        </div>
      </div>

      <!-- Key Facts -->
      <div class="bg-white/60 rounded-lg p-3">
        <h4 class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <i class="pi pi-info-circle text-[9px]" />
          Kurz-Briefing
        </h4>
        <ul class="space-y-1.5">
          <li v-for="(fact, fi) in briefing?.facts || []" :key="fi" class="flex items-start gap-2">
            <span class="text-[10px] mt-0.5" :class="fact.iconClass">{{ fact.icon }}</span>
            <span class="text-[11px] text-gray-700 leading-relaxed">{{ fact.text }}</span>
          </li>
        </ul>
      </div>

      <!-- Recommended Approach -->
      <div class="bg-white/60 rounded-lg p-3">
        <h4 class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <i class="pi pi-compass text-[9px]" />
          Empfohlener Ansatz
        </h4>
        <div class="space-y-2">
          <div v-if="briefing?.scenario" class="flex items-center gap-2">
            <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold" :class="briefing.scenario.badgeClass">
              {{ briefing.scenario.label }}
            </span>
            <span class="text-[10px] text-gray-500">{{ briefing.scenario.reason }}</span>
          </div>
          <p v-if="briefing?.approach" class="text-[11px] text-gray-700 leading-relaxed">{{ briefing.approach }}</p>
        </div>
      </div>

      <!-- Suggested Questions -->
      <div v-if="briefing?.questions?.length" class="bg-white/60 rounded-lg p-3">
        <h4 class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <i class="pi pi-question-circle text-[9px]" />
          Fragen für diesen Call
        </h4>
        <ul class="space-y-1.5">
          <li v-for="(q, qi) in briefing.questions" :key="qi" class="text-[10px] text-gray-600 italic flex items-start gap-1.5">
            <span class="text-gray-400 mt-px">{{ qi + 1 }}.</span>
            <span>„{{ q }}"</span>
          </li>
        </ul>
      </div>

      <!-- Warnings / Opportunities -->
      <div v-if="briefing?.alerts?.length" class="space-y-1.5">
        <div
          v-for="(alert, ai) in briefing.alerts"
          :key="ai"
          class="rounded-lg p-2.5 text-[10px] flex items-start gap-2"
          :class="alert.type === 'warning' ? 'bg-amber-50 text-amber-800' : alert.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'"
        >
          <i :class="alert.icon" class="text-[10px] mt-0.5" />
          <span class="leading-relaxed">{{ alert.text }}</span>
        </div>
      </div>

      <!-- Personalization Tips -->
      <div v-if="briefing?.personalTips?.length" class="bg-white/60 rounded-lg p-3">
        <h4 class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <i class="pi pi-heart text-[9px]" />
          Personalisierung
        </h4>
        <ul class="space-y-1">
          <li v-for="(tip, ti) in briefing.personalTips" :key="ti" class="text-[10px] text-gray-600 flex items-start gap-1.5">
            <span class="text-purple-400">*</span>
            <span>{{ tip }}</span>
          </li>
        </ul>
      </div>

      <!-- Motivation -->
      <div class="bg-gradient-to-r from-[#172774]/10 to-[#3d4a8e]/10 rounded-lg p-3 text-center">
        <p class="text-[11px] font-medium text-[#0d1a5c] italic">{{ briefing?.motivation }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NursingHomeLead, NursingHome, NursingHomeContact, CrmActivity } from '~/types/crm'
import { format, parseISO, differenceInDays, differenceInHours } from 'date-fns'
import { de } from 'date-fns/locale'

const props = defineProps<{
  lead: NursingHomeLead
  nursingHome: NursingHome | null
  contact: NursingHomeContact | null
  activities: CrmActivity[]
}>()

const isOpen = ref(false)

interface BriefingFact { icon: string; iconClass: string; text: string }
interface BriefingAlert { type: 'warning' | 'success' | 'info'; icon: string; text: string }
interface Briefing {
  score: number
  readiness: string
  readinessDetail: string
  facts: BriefingFact[]
  scenario: { label: string; badgeClass: string; reason: string } | null
  approach: string
  questions: string[]
  alerts: BriefingAlert[]
  personalTips: string[]
  motivation: string
}

const readinessClass = computed(() => {
  const s = briefing.value?.score || 0
  if (s >= 80) return 'border-green-400 text-green-600 bg-green-50'
  if (s >= 60) return 'border-blue-400 text-blue-600 bg-blue-50'
  if (s >= 40) return 'border-amber-400 text-amber-600 bg-amber-50'
  return 'border-red-400 text-red-600 bg-red-50'
})

// ─── Briefing Generation ──────────────────────────────────────

const briefing = computed<Briefing | null>(() => {
  if (!props.lead) return null

  const nh = props.nursingHome
  const acts = props.activities
  const contact = props.contact
  const now = new Date()

  // ── Analyze activity history ──
  const calls = acts.filter(a => a.type === 'call')
  const emails = acts.filter(a => a.type === 'email_sent' || a.type === 'newsletter')
  const notes = acts.filter(a => a.type === 'note')
  const allSorted = [...acts].sort((a, b) => (b.date_created || '').localeCompare(a.date_created || ''))
  const lastActivity = allSorted[0]
  const lastCall = [...calls].sort((a, b) => (b.date_created || '').localeCompare(a.date_created || ''))[0]

  const daysSinceLastActivity = lastActivity?.date_created
    ? differenceInDays(now, parseISO(lastActivity.date_created))
    : null

  const daysSinceLastCall = lastCall?.date_created
    ? differenceInDays(now, parseISO(lastCall.date_created))
    : null

  const daysSinceCreated = differenceInDays(now, parseISO(props.lead.date_created))

  // ── Identified pains from call notes ──
  const painKeywords = ['akut', 'prothese', 'transport', 'vertretung', 'doku', 'weiterbildung', 'schulung', 'mundpflege']
  const identifiedPains: string[] = []
  for (const act of acts) {
    const content = ((act.content || '') + ' ' + (act.subject || '')).toLowerCase()
    for (const pain of painKeywords) {
      if (content.includes(pain) && !identifiedPains.includes(pain)) {
        identifiedPains.push(pain)
      }
    }
  }

  // Check metadata for pains from CallScriptPanel
  for (const act of acts) {
    if (act.metadata?.pains && Array.isArray(act.metadata.pains)) {
      for (const p of act.metadata.pains) {
        const lp = p.toLowerCase()
        if (!identifiedPains.includes(lp)) identifiedPains.push(lp)
      }
    }
  }

  // ── Partner status from call notes ──
  let partnerStatus = ''
  for (const act of [...acts].reverse()) {
    if (act.metadata?.partner_status) {
      partnerStatus = act.metadata.partner_status
      break
    }
  }

  // ── Previous outcomes ──
  const successfulCalls = calls.filter(c => c.outcome === 'successful').length
  const noContactCalls = calls.filter(c => c.outcome === 'no_contact').length
  const rejections = calls.filter(c => c.outcome === 'rejection').length

  // ── Follow-up status ──
  const followUpDate = props.lead.follow_up_date
  const followUpOverdue = followUpDate && parseISO(followUpDate.split('T')[0]) <= now
  const followUpDays = followUpDate ? differenceInDays(now, parseISO(followUpDate.split('T')[0])) : null

  // ── Calculate readiness score ──
  let score = 50 // base

  // Contact info available
  if (contact) score += 10
  if (nh?.fone) score += 5

  // Has prior interaction
  if (acts.length > 0) score += 10
  if (identifiedPains.length > 0) score += 10

  // Recency penalty
  if (daysSinceLastActivity !== null && daysSinceLastActivity > 30) score -= 10
  if (daysSinceLastActivity !== null && daysSinceLastActivity > 60) score -= 10

  // Follow-up overdue bonus (they're expecting a call)
  if (followUpOverdue) score += 10

  // Rejection penalty
  if (rejections > 0) score -= 15

  // Good stage bonus
  if (['Qualified', 'Follow-up', 'Presentation'].includes(props.lead.opportunity_stage)) score += 5

  score = Math.max(10, Math.min(100, score))

  // ── Readiness label ──
  let readiness = ''
  let readinessDetail = ''
  if (score >= 80) { readiness = 'Sehr gute Ausgangslage'; readinessDetail = 'Du hast alle Infos für einen starken Call.' }
  else if (score >= 60) { readiness = 'Gute Vorbereitung'; readinessDetail = 'Solide Basis — fokussiere dich auf die offenen Punkte.' }
  else if (score >= 40) { readiness = 'Erste Kontaktaufnahme'; readinessDetail = 'Noch wenig Infos — nutze den Call zum Kennenlernen.' }
  else { readiness = 'Schwierige Ausgangslage'; readinessDetail = 'Vorsicht — prüfe ob der Zeitpunkt passt.' }

  // ── Build facts ──
  const facts: BriefingFact[] = []

  // Lead age + stage
  facts.push({
    icon: '📋', iconClass: '',
    text: `Lead seit ${daysSinceCreated} Tagen im CRM, aktuell in Stage "${props.lead.opportunity_stage}".`,
  })

  // Bed count / priority
  if (nh?.total_capacity) {
    const prio = nh.total_capacity > 100 ? 'A-Lead' : nh.total_capacity > 50 ? 'B-Lead' : 'C-Lead'
    facts.push({ icon: '🏥', iconClass: '', text: `${nh.name}: ${nh.total_capacity} Betten (${prio}).` })
  }

  // Contact info
  if (contact) {
    const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ')
    const role = contact.job_title || 'Ansprechpartner'
    facts.push({ icon: '👤', iconClass: '', text: `Kontakt: ${name} (${role}).` })
  } else {
    facts.push({ icon: '⚠️', iconClass: '', text: 'Kein Ansprechpartner hinterlegt — im Call nach PDL/Heimleitung fragen.' })
  }

  // Interaction history
  if (acts.length === 0) {
    facts.push({ icon: '🆕', iconClass: '', text: 'Noch kein Kontakt — dies ist der Erstanruf.' })
  } else {
    facts.push({
      icon: '📊', iconClass: '',
      text: `${calls.length} Anrufe, ${emails.length} E-Mails, ${notes.length} Notizen. Letzter Kontakt: ${daysSinceLastActivity === 0 ? 'heute' : daysSinceLastActivity === 1 ? 'gestern' : `vor ${daysSinceLastActivity} Tagen`}.`,
    })
  }

  // Cooperation partner
  if (props.lead.has_cooperation_partner) {
    facts.push({ icon: '🤝', iconClass: '', text: 'Hat bereits einen Kooperationspartner — als Ergänzung/Plan B positionieren.' })
  }

  // Previous pains
  if (identifiedPains.length > 0) {
    const painLabels: Record<string, string> = {
      akut: 'Akutversorgung', prothese: 'Prothetik', transport: 'Transport',
      vertretung: 'Vertretung', doku: 'Dokumentation', weiterbildung: 'Weiterbildung',
      schulung: 'Schulung', mundpflege: 'Mundpflege',
    }
    const labels = identifiedPains.map(p => painLabels[p] || p).join(', ')
    facts.push({ icon: '🎯', iconClass: '', text: `Bekannte Pain Points: ${labels}. Darauf aufbauen!` })
  }

  // Partner status
  if (partnerStatus) {
    const statusLabels: Record<string, string> = {
      zufrieden: 'zufrieden mit aktuellem Partner', neutral: 'neutral gegenüber aktuellem Partner',
      unzufrieden: 'unzufrieden mit aktuellem Partner', keiner: 'hat keinen Partner',
      wechsel: 'Wechsel möglich',
    }
    facts.push({ icon: '🔄', iconClass: '', text: `Partner-Status: ${statusLabels[partnerStatus] || partnerStatus}.` })
  }

  // ── Determine scenario ──
  let scenario: Briefing['scenario'] = null
  if (acts.length === 0) {
    scenario = { label: 'Szenario A: Kaltanruf', badgeClass: 'bg-blue-100 text-blue-700', reason: 'Kein vorheriger Kontakt' }
  } else if (emails.length > 0 && calls.length === 0) {
    scenario = { label: 'Szenario B: Follow-Up', badgeClass: 'bg-amber-100 text-amber-700', reason: 'E-Mail gesendet, noch kein Call' }
  } else if (props.lead.has_cooperation_partner || props.lead.opportunity_stage === 'Won') {
    scenario = { label: 'Szenario C: Check-in', badgeClass: 'bg-green-100 text-green-700', reason: 'Bestehende Beziehung' }
  } else if (calls.length > 0) {
    scenario = { label: 'Szenario B: Follow-Up', badgeClass: 'bg-amber-100 text-amber-700', reason: `${calls.length} vorherige Anrufe` }
  } else {
    scenario = { label: 'Szenario A: Kaltanruf', badgeClass: 'bg-blue-100 text-blue-700', reason: 'Erster Anruf' }
  }

  // ── Build approach ──
  let approach = ''
  if (acts.length === 0) {
    approach = `Neugier erzeugen, NICHT pitchen. Starte mit der Akut-Frage: "Wenn eine Prothese drückt — wie schnell bekommen Sie Hilfe?" Maximal 60 Sekunden Intro, dann Fragen stellen.`
  } else if (identifiedPains.length > 0) {
    const mainPain = identifiedPains[0]
    approach = `An den bekannten Pain "${mainPain}" anknüpfen. Frage nach konkreten Entwicklungen seit dem letzten Gespräch. Wenn möglich, Pitch ${mainPain === 'weiterbildung' || mainPain === 'schulung' ? 'C (Compliance)' : mainPain === 'transport' || mainPain === 'akut' ? 'A (Backup)' : 'B (Versorgungstiefe)'} nutzen.`
  } else if (noContactCalls > 1) {
    approach = `Mehrfach nicht erreicht — probiere eine andere Uhrzeit (Di–Do 9:30–11:30 ist Prime Time). Evtl. Voicemail hinterlassen: Max. 20 Sek, Thema nennen, Rückruf-Zeitpunkt anbieten.`
  } else if (partnerStatus === 'unzufrieden' || partnerStatus === 'wechsel') {
    approach = `Wechsel-Bereitschaft nutzen! Pain genau dokumentieren. Wenn möglich: Termin vor Ort vorschlagen. Bei klarem Interesse → Eskalation an Tony.`
  } else {
    approach = `Kurzes Check-in: "Wie läuft es aktuell mit der zahnärztlichen Versorgung?" Dann gezielt nach Veränderungen fragen (Personal, Zahnarzt, Kapazitäten).`
  }

  // ── Suggested questions ──
  const questions: string[] = []
  if (identifiedPains.length === 0) {
    questions.push('Wenn am Mittwoch eine Prothese drückt oder jemand Schmerzen hat — wie schnell bekommen Sie Hilfe?')
    questions.push('Was ist Ihr Plan B, wenn der Zahnarzt Urlaub hat oder ausfällt?')
  }
  if (identifiedPains.includes('transport') || identifiedPains.length === 0) {
    questions.push('Wie oft müssen Bewohner raus — und wer organisiert/begleitet das?')
  }
  if (identifiedPains.includes('prothese')) {
    questions.push('Wie läuft Prothetik konkret ab — und wie lange dauert es meist?')
  }
  if (daysSinceLastCall && daysSinceLastCall > 14) {
    questions.push('Hat sich seit unserem letzten Gespräch etwas verändert in der zahnärztlichen Versorgung?')
  }
  if (props.lead.has_cooperation_partner && !identifiedPains.includes('weiterbildung')) {
    questions.push('Macht Ihr aktueller Kooperationspartner auch regelmäßige Schulungen für die Pflege?')
  }

  // ── Alerts ──
  const alerts: BriefingAlert[] = []

  if (followUpOverdue && followUpDays && followUpDays > 0) {
    alerts.push({
      type: 'warning', icon: 'pi pi-exclamation-triangle',
      text: `Follow-up ist ${followUpDays} Tag${followUpDays > 1 ? 'e' : ''} überfällig! Jetzt anrufen.`,
    })
  }

  if (noContactCalls >= 3) {
    alerts.push({
      type: 'warning', icon: 'pi pi-exclamation-triangle',
      text: `${noContactCalls}x nicht erreicht — anderen Zeitpunkt oder Kanal (E-Mail/Mail) versuchen.`,
    })
  }

  if (rejections > 0) {
    alerts.push({
      type: 'warning', icon: 'pi pi-ban',
      text: 'Ablehnung im Verlauf — besonders behutsam vorgehen. Neuen Aufhänger nutzen (z.B. Weiterbildung, saisonales Thema).',
    })
  }

  if (daysSinceLastActivity && daysSinceLastActivity > 30) {
    alerts.push({
      type: 'info', icon: 'pi pi-clock',
      text: `${daysSinceLastActivity} Tage ohne Kontakt — neuen Aufhänger finden (Referenz, saisonales Thema).`,
    })
  }

  if (partnerStatus === 'unzufrieden' || partnerStatus === 'wechsel') {
    alerts.push({
      type: 'success', icon: 'pi pi-star',
      text: `Wechsel-Potenzial! ${partnerStatus === 'unzufrieden' ? 'PDL ist unzufrieden' : 'Wechsel wurde signalisiert'}. Bei konkretem Interesse → Eskalation an Tony.`,
    })
  }

  if (nh?.total_capacity && nh.total_capacity > 100 && props.lead.opportunity_stage === 'Qualified') {
    alerts.push({
      type: 'success', icon: 'pi pi-star',
      text: `A-Lead mit ${nh.total_capacity} Betten in "Qualified" — hohe Priorität!`,
    })
  }

  // ── Personal tips ──
  const personalTips: string[] = []

  // Extract personal details from previous call notes
  for (const act of acts) {
    const content = (act.content || '').toLowerCase()
    if (content.includes('urlaub')) personalTips.push('PDL erwähnte Urlaub — frage wie es war.')
    if (content.includes('sommerfest') || content.includes('fest')) personalTips.push('Es wurde ein Fest/Event erwähnt — darauf Bezug nehmen.')
    if (content.includes('audit') || content.includes('prüfung')) personalTips.push('Audit/Prüfung war Thema — frage nach dem Ergebnis.')
    if (content.includes('personalmangel') || content.includes('unterbesetzt')) personalTips.push('Personalmangel wurde erwähnt — zeige Verständnis.')
    if (content.includes('nachfolge') || content.includes('rente') || content.includes('aufhört')) personalTips.push('Zahnarzt-Nachfolge war Thema — ⚠️ Timing-kritisch, evtl. Eskalation!')
  }

  if (contact?.first_name) {
    personalTips.push(`Sprich ${contact.first_name} mit Namen an — schafft Nähe.`)
  }

  // Best call time
  const hour = now.getHours()
  const day = now.getDay()
  if (day >= 2 && day <= 4 && hour >= 9 && hour < 12) {
    personalTips.push('Guter Zeitpunkt — Di–Do Vormittag ist Prime Time für Erstanrufe.')
  } else if (day === 5 && hour >= 14) {
    personalTips.push('Freitag Nachmittag — schwierig. Viele PDLs sind schon im Wochenend-Modus.')
  }

  // ── Motivation ──
  const motivations = [
    'Jeder Anruf bringt dich einem Deal näher. Du bist Fachkollege, nicht Verkäufer.',
    'PDLs schätzen echtes Interesse an ihren Prozessen. Frag, hör zu, versteh.',
    '60 Sekunden reichen für den Einstieg. Der Rest ergibt sich im Gespräch.',
    'Du löst ein echtes Problem — Bewohner brauchen Versorgung, und du machst sie möglich.',
    'Konversionen brauchen 5–10 Touchpoints. Jeder Call ist ein Baustein.',
    'Geduld zahlt sich aus. Die besten Kooperationen entstehen über Wochen.',
    'Dein Vorteil: Du verstehst Pflege UND Zahnmedizin. Das merken PDLs sofort.',
    'Nicht jeder Call endet mit einem Termin — aber jeder gute Call baut Vertrauen auf.',
  ]
  const motivation = motivations[Math.floor(Math.random() * motivations.length)]

  return {
    score,
    readiness,
    readinessDetail,
    facts,
    scenario,
    approach,
    questions: questions.slice(0, 3),
    alerts,
    personalTips: [...new Set(personalTips)].slice(0, 4),
    motivation,
  }
})
</script>
