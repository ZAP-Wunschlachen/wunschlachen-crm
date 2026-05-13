/**
 * Welcome-Mail-Sequenz (Plan v9 Modul A MVP).
 * 6 Mails: Tag 0 (sofort nach Sign-up) + 5 Follow-Ups in den ersten 14 Tagen.
 *
 * brevo_template_id: ID des Templates in Brevo (vom Marketing-Team gepflegt).
 * Falls in Brevo noch nicht angelegt: subject + html_fallback wird verwendet.
 *
 * Themen-Cluster siehe docs/specs/2026-05-13-patient-funnel-automation.md §3 Modul A.
 */

export interface WelcomeSlot {
  position: number               // 1-6
  day_offset: number             // 0, 1, 3, 7, 10, 14
  slug: string                   // stabiler Key für Activity-Log
  brevo_template_id: number      // platzhalter bis Marketing reale IDs liefert
  subject_fallback: string       // wenn brevo_template_id nicht gesetzt / 0
  html_fallback: string          // minimaler Body bis Template existiert
  theme: 'cta_booking' | 'trust' | 'mythen' | 'pain_point' | 'cost' | 'last_call'
}

export const WELCOME_SLOTS: WelcomeSlot[] = [
  {
    position: 1,
    day_offset: 0,
    slug: 'welcome-day-0-confirmation',
    brevo_template_id: 1001,
    subject_fallback: 'Re: Ihre Anfrage zu Zahnimplantaten bei Wunschlachen',
    html_fallback: '<p>Hallo {{firstName}},</p><p>vielen Dank für Ihre Anfrage. Wir melden uns binnen 24 Stunden bei Ihnen — oder buchen Sie direkt einen Beratungstermin: <a href="https://wunschlachen.app/buchen">Jetzt buchen</a>.</p><p>Herzliche Grüße<br>Ihr Wunschlachen-Team</p>',
    theme: 'cta_booking',
  },
  {
    position: 2,
    day_offset: 1,
    slug: 'welcome-day-1-trust',
    brevo_template_id: 1002,
    subject_fallback: 'Wir stellen uns vor — Ihr Wunschlachen-Team',
    html_fallback: '<p>Hallo {{firstName}},</p><p>Wer sind wir und warum vertrauen Patienten uns ihre Zahngesundheit an? Erfahren Sie mehr über unser Team und unsere Praxis: <a href="https://wunschlachen.app/team">Über uns</a></p>',
    theme: 'trust',
  },
  {
    position: 3,
    day_offset: 3,
    slug: 'welcome-day-3-mythen',
    brevo_template_id: 1003,
    subject_fallback: 'Mythen über Zahnimplantate — was wirklich stimmt',
    html_fallback: '<p>Hallo {{firstName}},</p><p>"Implantate sind unbezahlbar", "es tut weh", "sieht man sofort" — wir räumen mit den häufigsten Mythen auf: <a href="https://wunschlachen.app/mythen">Mythen-Check</a></p>',
    theme: 'mythen',
  },
  {
    position: 4,
    day_offset: 7,
    slug: 'welcome-day-7-pain',
    brevo_template_id: 1004,
    subject_fallback: 'Schmerzfrei zum neuen Lächeln, {{firstName}}',
    html_fallback: '<p>Hallo {{firstName}},</p><p>Angst vor Schmerzen ist der häufigste Grund, eine Behandlung aufzuschieben. Hier erklären wir, wie moderne Sedierung & Lokal-Anästhesie das Implantat zum unspektakulären Routine-Eingriff machen: <a href="https://wunschlachen.app/schmerzfrei">Schmerzfrei-Konzept</a></p>',
    theme: 'pain_point',
  },
  {
    position: 5,
    day_offset: 10,
    slug: 'welcome-day-10-cost',
    brevo_template_id: 1005,
    subject_fallback: 'Zahnimplantate — was sie wirklich kosten',
    html_fallback: '<p>Hallo {{firstName}},</p><p>Kostenrechnung ohne Schock-Effekt: Was ein Implantat wirklich kostet, welche Kassenleistung übrig bleibt und wie wir die Finanzierung gestalten. <a href="https://wunschlachen.app/kosten">Kosten-Übersicht</a></p>',
    theme: 'cost',
  },
  {
    position: 6,
    day_offset: 14,
    slug: 'welcome-day-14-last-call',
    brevo_template_id: 1006,
    subject_fallback: 'Letzter Anstoß: Ihre Beratung bei Wunschlachen',
    html_fallback: '<p>Hallo {{firstName}},</p><p>Wir haben Ihnen die letzten zwei Wochen viele Informationen geschickt. Jetzt ist der richtige Moment für den nächsten Schritt: <a href="https://wunschlachen.app/buchen">Beratungstermin buchen</a> — kostenfrei, telefonisch oder vor Ort.</p>',
    theme: 'last_call',
  },
]
