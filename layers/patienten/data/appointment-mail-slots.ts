/**
 * Termin-Bezogene Mail-Slots (Plan v9 Modul D MVP).
 * Werden vom Sync-Cron (Confirmation) + Reminder-Cron (24h) verschickt.
 *
 * Brevo-Template-IDs sind Platzhalter — Marketing-Team trägt reale Werte ein,
 * bis dahin sendet der Endpoint die html_fallback-Bodies.
 */

export interface AppointmentMailSlot {
  slug: string
  brevo_template_id: number
  subject_fallback: string
  html_fallback: string
}

export const APPOINTMENT_MAIL_SLOTS = {
  consultation_confirmation: {
    slug: 'appointment-confirmation-consultation',
    brevo_template_id: 2001,
    subject_fallback: 'Termin-Bestätigung: Beratung am {{startDate}}',
    html_fallback: '<p>Hallo {{firstName}},</p><p>Ihr Beratungstermin am <strong>{{startDate}}</strong> um <strong>{{startTime}}</strong> ist bestätigt.</p><p>Sie finden uns in der Praxis <strong>{{locationName}}</strong>.</p><p>Was Sie mitbringen sollten: Versichertenkarte, ggf. aktuelle Röntgenbilder.</p><p>Falls Sie den Termin verschieben müssen: <a href="https://wunschlachen.app/buchen">Hier neu buchen</a>.</p>',
  },
  treatment_confirmation: {
    slug: 'appointment-confirmation-treatment',
    brevo_template_id: 2002,
    subject_fallback: 'Termin-Bestätigung: Behandlung am {{startDate}}',
    html_fallback: '<p>Hallo {{firstName}},</p><p>Ihre Behandlung ist gebucht: <strong>{{startDate}}</strong> um <strong>{{startTime}}</strong> in der Praxis <strong>{{locationName}}</strong>.</p><p>Bitte erscheinen Sie 15 Minuten vor Termin.</p>',
  },
  reminder_24h: {
    slug: 'appointment-reminder-24h',
    brevo_template_id: 2003,
    subject_fallback: 'Erinnerung: Ihr Termin morgen um {{startTime}}',
    html_fallback: '<p>Hallo {{firstName}},</p><p>Nur zur Erinnerung: morgen um <strong>{{startTime}}</strong> erwarten wir Sie in der Praxis {{locationName}}.</p><p>Falls etwas dazwischenkommt, bitte melden Sie sich.</p>',
  },
} as const

export type AppointmentMailSlotKey = keyof typeof APPOINTMENT_MAIL_SLOTS
