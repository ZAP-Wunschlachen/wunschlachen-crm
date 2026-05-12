/**
 * Mock-Seed-Plugin (Phase 9 Follow-up)
 *
 * Beim ersten Page-Load im Dev-Mode (DEV_MODE_BYPASS_AUTH=true) werden
 * 5 Demo-Records pro Hauptbereich in localStorage geseedet, damit die
 * komplette App ohne Directus-Anbindung getestet werden kann.
 *
 * Idempotent — wenn ein Key bereits Daten enthält, wird er nicht überschrieben.
 * Reset: localStorage komplett leeren im Browser-DevTools.
 */

const DEV_MODE_BYPASS_AUTH = true
const SEED_FLAG = 'mock_seed_v1_applied'

export default defineNuxtPlugin(() => {
  if (!DEV_MODE_BYPASS_AUTH) return
  if (typeof localStorage === 'undefined') return
  if (localStorage.getItem(SEED_FLAG)) return

  seedHeimkunden()
  seedHeimAktivitaeten()
  seedHeimWorkflows()
  seedPatientLeads()
  seedPatientAktivitaeten()
  seedPatientWorkflows()
  seedAppointments()
  seedGoogleReviews()
  seedEmailTemplates()

  localStorage.setItem(SEED_FLAG, new Date().toISOString())
  // eslint-disable-next-line no-console
  console.log('[mock-seed] Demo-Daten in localStorage geseedet (v1)')
})

const iso = (offsetMinutes = 0) => new Date(Date.now() + offsetMinutes * 60 * 1000).toISOString()

// ──────────────────────────────────────────────────────────────────────────────
// Heimkunden (usePflegeheimLeads)
// ──────────────────────────────────────────────────────────────────────────────

function seedHeimkunden() {
  if (localStorage.getItem('crm_leads')) return

  const nursingHomes = [
    {
      id: 'nh-1',
      name: 'Seniorenresidenz Sonnenhof',
      Street: 'Hauptstraße',
      number: '12',
      zip: '10115',
      city: 'Berlin',
      fone: '+49 30 12345601',
      email: 'leitung@sonnenhof.de',
      website: 'https://sonnenhof.de',
      total_capacity: 84,
      distance_from_dental_office: 4.2,
      coordinates_lat: 52.5251,
      coordinates_lon: 13.387,
      status: 'aktiv',
    },
    {
      id: 'nh-2',
      name: 'Pflegezentrum Am Park',
      Street: 'Parkallee',
      number: '45',
      zip: '14059',
      city: 'Berlin',
      fone: '+49 30 12345602',
      email: 'kontakt@pflege-park.de',
      website: 'https://pflege-park.de',
      total_capacity: 120,
      distance_from_dental_office: 8.1,
      coordinates_lat: 52.5135,
      coordinates_lon: 13.2879,
      status: 'aktiv',
    },
    {
      id: 'nh-3',
      name: 'Haus Lindenblick',
      Street: 'Lindenweg',
      number: '7',
      zip: '12555',
      city: 'Berlin',
      fone: '+49 30 12345603',
      email: 'info@lindenblick.de',
      total_capacity: 56,
      distance_from_dental_office: 12.5,
      coordinates_lat: 52.4575,
      coordinates_lon: 13.5778,
      status: 'interessiert',
    },
    {
      id: 'nh-4',
      name: 'Curanum Charlottenburg',
      Street: 'Kantstraße',
      number: '88',
      zip: '10627',
      city: 'Berlin',
      fone: '+49 30 12345604',
      email: 'verwaltung@curanum-cw.de',
      total_capacity: 98,
      distance_from_dental_office: 5.7,
      coordinates_lat: 52.5071,
      coordinates_lon: 13.3098,
      status: 'aktiv',
    },
    {
      id: 'nh-5',
      name: 'AWO Pflegeheim Spandau',
      Street: 'Berliner Allee',
      number: '202',
      zip: '13585',
      city: 'Berlin',
      fone: '+49 30 12345605',
      email: 'spandau@awo-pflege.de',
      total_capacity: 142,
      distance_from_dental_office: 14.8,
      coordinates_lat: 52.5414,
      coordinates_lon: 13.2046,
      status: 'neu',
    },
  ]

  const leads = [
    {
      id: 'lead-h-1',
      nursing_home_id: nursingHomes[0],
      opportunity_stage: 'Presentation',
      priority: 'high',
      follow_up_date: iso(60 * 24),
      has_cooperation_partner: false,
      date_created: iso(-60 * 24 * 7),
      date_updated: iso(-60 * 12),
    },
    {
      id: 'lead-h-2',
      nursing_home_id: nursingHomes[1],
      opportunity_stage: 'Follow-up',
      priority: 'high',
      follow_up_date: iso(60 * 2),
      has_cooperation_partner: false,
      date_created: iso(-60 * 24 * 14),
      date_updated: iso(-60 * 6),
    },
    {
      id: 'lead-h-3',
      nursing_home_id: nursingHomes[2],
      opportunity_stage: 'Qualified',
      priority: 'medium',
      follow_up_date: iso(60 * 48),
      has_cooperation_partner: false,
      date_created: iso(-60 * 24 * 3),
      date_updated: iso(-60 * 24),
    },
    {
      id: 'lead-h-4',
      nursing_home_id: nursingHomes[3],
      opportunity_stage: 'Won',
      priority: 'medium',
      has_cooperation_partner: true,
      date_created: iso(-60 * 24 * 30),
      date_updated: iso(-60 * 24 * 2),
    },
    {
      id: 'lead-h-5',
      nursing_home_id: nursingHomes[4],
      opportunity_stage: 'Unqualified',
      priority: 'low',
      follow_up_date: iso(60 * 24 * 7),
      has_cooperation_partner: false,
      date_created: iso(-60 * 24),
      date_updated: iso(-60 * 24),
    },
  ]

  localStorage.setItem('crm_leads', JSON.stringify(leads))

  // Primary-Kontakte für die 5 Heime
  const contacts = [
    {
      id: 'ct-1',
      nursing_home_id: 'nh-1',
      first_name: 'Martina',
      last_name: 'Berger',
      email: 'm.berger@sonnenhof.de',
      phone: '+49 30 12345601-22',
      job_title: 'Heimleitung',
      is_primary: true,
    },
    {
      id: 'ct-2',
      nursing_home_id: 'nh-2',
      first_name: 'Klaus',
      last_name: 'Wagner',
      email: 'k.wagner@pflege-park.de',
      phone: '+49 30 12345602-44',
      job_title: 'Geschäftsführer',
      is_primary: true,
    },
    {
      id: 'ct-3',
      nursing_home_id: 'nh-3',
      first_name: 'Sabine',
      last_name: 'Lehmann',
      email: 's.lehmann@lindenblick.de',
      phone: '+49 30 12345603-10',
      job_title: 'Pflegedienstleitung',
      is_primary: true,
    },
    {
      id: 'ct-4',
      nursing_home_id: 'nh-4',
      first_name: 'Dr. Andreas',
      last_name: 'Müller',
      email: 'a.mueller@curanum-cw.de',
      phone: '+49 30 12345604-01',
      job_title: 'Einrichtungsleitung',
      is_primary: true,
    },
    {
      id: 'ct-5',
      nursing_home_id: 'nh-5',
      first_name: 'Petra',
      last_name: 'Schulz',
      email: 'p.schulz@awo-pflege.de',
      phone: '+49 30 12345605-07',
      job_title: 'Pflegedienstleitung',
      is_primary: true,
    },
  ]
  localStorage.setItem('crm_lead_contacts', JSON.stringify(contacts))
}

function seedHeimAktivitaeten() {
  if (localStorage.getItem('nursing_home_lead_activities')) return

  const activities = [
    {
      id: 'act-h-1',
      nursing_home_lead_id: 'lead-h-1',
      nursing_home_id: 'nh-1',
      contact_id: 'ct-1',
      type: 'call',
      subject: 'Erstgespräch Heimleitung',
      content: 'Frau Berger hat starkes Interesse, bittet um Präsentationstermin.',
      direction: 'outbound',
      outcome: 'successful',
      duration_minutes: 18,
      date_created: iso(-60 * 24 * 3),
    },
    {
      id: 'act-h-2',
      nursing_home_lead_id: 'lead-h-1',
      type: 'email_sent',
      subject: 'Angebot Kooperation Implantatversorgung',
      content: 'Angebot mit 3 Optionen versendet.',
      direction: 'outbound',
      outcome: 'successful',
      date_created: iso(-60 * 24 * 2),
    },
    {
      id: 'act-h-3',
      nursing_home_lead_id: 'lead-h-2',
      type: 'meeting',
      subject: 'Vor-Ort-Termin im Park-Zentrum',
      content: 'Begehung mit Hr. Wagner; 12 Bewohner identifiziert.',
      direction: 'outbound',
      outcome: 'successful',
      duration_minutes: 90,
      date_created: iso(-60 * 24 * 5),
    },
    {
      id: 'act-h-4',
      nursing_home_lead_id: 'lead-h-3',
      type: 'newsletter',
      subject: 'Q1-Newsletter "Dental-Care im Heim"',
      content: 'Versendet an 12 Heimleitungen.',
      direction: 'outbound',
      outcome: 'successful',
      date_created: iso(-60 * 24 * 10),
    },
    {
      id: 'act-h-5',
      nursing_home_lead_id: 'lead-h-5',
      type: 'note',
      subject: 'Notiz: Zuständige Person noch unklar',
      content: 'Heimleitung wechselt aktuell, neuer Kontakt erst ab nächster Woche erreichbar.',
      date_created: iso(-60 * 12),
    },
  ]
  localStorage.setItem('nursing_home_lead_activities', JSON.stringify(activities))
}

function seedHeimWorkflows() {
  if (localStorage.getItem('crm_workflows')) return

  const workflows = [
    {
      id: 'wf-h-1',
      name: 'Heim-Erstkontakt Sequenz',
      description: 'E-Mail → 3 Tage Wartezeit → Anruf-Aufgabe',
      trigger_type: 'new_lead',
      steps: [
        { id: 's1', type: 'email', label: 'Begrüßungs-Mail', config: { template_id: 'tpl-1', delay_days: 0 } },
        { id: 's2', type: 'wait', label: '3 Tage warten', config: { days: 3 } },
        { id: 's3', type: 'task', label: 'Nachfass-Anruf', config: { description: 'Heim anrufen' } },
      ],
      is_active: true,
      date_created: iso(-60 * 24 * 30),
    },
    {
      id: 'wf-h-2',
      name: 'Won → Onboarding',
      description: 'Vertrag verschicken + Onboarding-Newsletter',
      trigger_type: 'stage_change',
      steps: [
        { id: 's1', type: 'email', label: 'Vertrag', config: { template_id: 'tpl-2' } },
        { id: 's2', type: 'task', label: 'Onboarding-Call', config: { description: 'Kick-off-Telefonat planen' } },
      ],
      is_active: true,
      date_created: iso(-60 * 24 * 20),
    },
    {
      id: 'wf-h-3',
      name: 'Follow-up fällig',
      description: 'Bei follow_up_date Anruf + Reminder-Mail',
      trigger_type: 'follow_up_due',
      steps: [
        { id: 's1', type: 'task', label: 'Anruf', config: { description: 'Follow-up-Anruf durchführen' } },
        { id: 's2', type: 'email', label: 'Reminder-Mail', config: { template_id: 'tpl-3', delay_days: 1 } },
      ],
      is_active: true,
      date_created: iso(-60 * 24 * 15),
    },
    {
      id: 'wf-h-4',
      name: 'Q-Newsletter (manuell)',
      description: 'Quartals-Newsletter an alle Bestandskunden',
      trigger_type: 'manual',
      steps: [
        { id: 's1', type: 'newsletter', label: 'Quartals-Newsletter', config: { frequency: 'quartalsweise' } },
      ],
      is_active: true,
      date_created: iso(-60 * 24 * 8),
    },
    {
      id: 'wf-h-5',
      name: 'Lost-Recovery',
      description: 'Nach 6 Monaten Lost-Status erneut anschreiben',
      trigger_type: 'stage_change',
      steps: [
        { id: 's1', type: 'wait', label: '180 Tage warten', config: { days: 180 } },
        { id: 's2', type: 'email', label: 'Wieder-Annäherung', config: { template_id: 'tpl-4' } },
      ],
      is_active: false,
      date_created: iso(-60 * 24 * 2),
    },
  ]
  localStorage.setItem('crm_workflows', JSON.stringify(workflows))
}

// ──────────────────────────────────────────────────────────────────────────────
// Patienten
// ──────────────────────────────────────────────────────────────────────────────

function seedPatientAktivitaeten() {
  if (localStorage.getItem('patient-crm-activities')) return

  const activities = [
    {
      id: 'pact-1',
      lead_id: 'pl-1',
      type: 'call',
      subject: 'Erstgespräch Maria Schmidt',
      content: 'Interessiert an Implantatberatung, möchte nächste Woche Termin.',
      direction: 'inbound',
      outcome: 'successful',
      duration_minutes: 12,
      date_created: iso(-60 * 24),
    },
    {
      id: 'pact-2',
      lead_id: 'pl-2',
      type: 'email_sent',
      subject: 'Behandlungsplan Hr. Becker',
      content: 'Detaillierter Heil- und Kostenplan zugeschickt.',
      direction: 'outbound',
      date_created: iso(-60 * 24 * 2),
    },
    {
      id: 'pact-3',
      lead_id: 'pl-3',
      type: 'whatsapp',
      subject: 'Frage zur Anästhesie',
      content: 'Patient fragt nach Vollnarkose-Option.',
      direction: 'inbound',
      date_created: iso(-60 * 4),
    },
    {
      id: 'pact-4',
      lead_id: 'pl-4',
      type: 'meeting',
      subject: 'Beratungstermin Lisa Wagner',
      content: 'Aufklärung, Abdruck, Foto-Dokumentation.',
      direction: 'outbound',
      duration_minutes: 45,
      date_created: iso(-60 * 24 * 5),
    },
    {
      id: 'pact-5',
      lead_id: 'pl-5',
      type: 'note',
      subject: 'Patient bevorzugt Vormittagstermine',
      content: 'Wichtige Info für Terminplanung.',
      date_created: iso(-60 * 24 * 8),
    },
  ]
  localStorage.setItem('patient-crm-activities', JSON.stringify(activities))
}

function seedPatientWorkflows() {
  if (localStorage.getItem('patient-crm-workflows')) return

  const workflows = [
    {
      id: 'wf-p-1',
      name: 'Lead-Welcome (Implant-Anfrage)',
      description: 'Sofort Bestätigungs-Mail + 24h SMS-Reminder',
      trigger_type: 'new_lead',
      steps: [
        { id: 's1', type: 'email', config: { template_id: 'pt-1', delay_days: 0 } },
        { id: 's2', type: 'wait', config: { days: 1 } },
        { id: 's3', type: 'sms', config: { message: 'Schon Zeit für Beratungstermin gefunden?' } },
      ],
      is_active: true,
      date_created: iso(-60 * 24 * 30),
    },
    {
      id: 'wf-p-2',
      name: 'Termin-Reminder',
      description: '24h und 2h vor Termin SMS',
      trigger_type: 'stage_change',
      steps: [
        { id: 's1', type: 'sms', config: { message: 'Morgen ist Ihr Beratungstermin um {{time}}' } },
        { id: 's2', type: 'wait', config: { days: 1 } },
        { id: 's3', type: 'sms', config: { message: '2h Termin-Erinnerung' } },
      ],
      is_active: true,
      date_created: iso(-60 * 24 * 25),
    },
    {
      id: 'wf-p-3',
      name: 'Reactivation 90 Tage',
      description: 'Wenn 90 Tage kein Kontakt: Reactivation-Mail',
      trigger_type: 'follow_up_due',
      steps: [
        { id: 's1', type: 'email', config: { template_id: 'pt-2' } },
      ],
      is_active: true,
      date_created: iso(-60 * 24 * 20),
    },
    {
      id: 'wf-p-4',
      name: 'Bewertungs-Anfrage',
      description: 'Nach Behandlung Google-Review erbitten',
      trigger_type: 'stage_change',
      steps: [
        { id: 's1', type: 'wait', config: { days: 7 } },
        { id: 's2', type: 'email', config: { template_id: 'pt-3' } },
      ],
      is_active: true,
      date_created: iso(-60 * 24 * 15),
    },
    {
      id: 'wf-p-5',
      name: 'Marketing Newsletter Q',
      description: 'Quartals-Newsletter (Tipps, Aktionen)',
      trigger_type: 'manual',
      steps: [
        { id: 's1', type: 'newsletter', config: { frequency: 'quartalsweise' } },
      ],
      is_active: true,
      date_created: iso(-60 * 24 * 10),
    },
  ]
  localStorage.setItem('patient-crm-workflows', JSON.stringify(workflows))
}

// ──────────────────────────────────────────────────────────────────────────────
// Patient-Leads (für usePatientLeads — wird durch Mock-Mode-Branch im
// Composable gelesen; siehe localStorage-Key 'patient-crm-mock-leads')
// ──────────────────────────────────────────────────────────────────────────────

function seedPatientLeads() {
  if (localStorage.getItem('patient-crm-mock-leads')) return

  const leads = [
    {
      id: 'pl-1',
      first_name: 'Maria',
      last_name: 'Schmidt',
      mail: 'maria.schmidt@email.de',
      phone: '+49 151 11111111',
      status: 'scheduled',
      lead_source: 'google',
      follow_up: iso(60 * 24 * 2),
      oportunity_value: 3500,
      missed_appointments: 0,
      Tags: ['neu', 'beratung'],
      date_created: iso(-60 * 24 * 2),
      date_updated: iso(-60 * 12),
      message: 'Hallo, ich interessiere mich für eine Implantatberatung.',
    },
    {
      id: 'pl-2',
      first_name: 'Thomas',
      last_name: 'Becker',
      mail: 'thomas.becker@email.de',
      phone: '+49 151 22222222',
      status: 'hkp_sended',
      lead_source: 'facebook',
      follow_up: iso(60 * 24 * 3),
      oportunity_value: 8500,
      missed_appointments: 0,
      Tags: ['hkp', 'follow-up'],
      date_created: iso(-60 * 24 * 7),
      date_updated: iso(-60 * 24),
      message: 'Mehrere Zahnlücken, brauche Beratung.',
    },
    {
      id: 'pl-3',
      first_name: 'Anna',
      last_name: 'Wolf',
      mail: 'anna.wolf@email.de',
      phone: '+49 151 33333333',
      status: 'contacted',
      lead_source: 'instagram',
      follow_up: iso(60 * 24),
      oportunity_value: 2800,
      missed_appointments: 1,
      Tags: ['kontaktiert'],
      date_created: iso(-60 * 24 * 4),
      date_updated: iso(-60 * 24 * 2),
    },
    {
      id: 'pl-4',
      first_name: 'Lisa',
      last_name: 'Wagner',
      mail: 'lisa.wagner@email.de',
      phone: '+49 151 44444444',
      status: 'open',
      lead_source: 'tiktok',
      oportunity_value: 4200,
      missed_appointments: 0,
      Tags: ['lead', 'neu'],
      date_created: iso(-60 * 6),
      date_updated: iso(-60 * 6),
      message: 'Habe Ihr Video gesehen, möchte mehr erfahren.',
    },
    {
      id: 'pl-5',
      first_name: 'Michael',
      last_name: 'Roth',
      mail: 'michael.roth@email.de',
      phone: '+49 151 55555555',
      status: 'contacted_twice',
      lead_source: 'referral',
      follow_up: iso(60 * 48),
      oportunity_value: 6500,
      missed_appointments: 0,
      Tags: ['empfehlung'],
      date_created: iso(-60 * 24 * 10),
      date_updated: iso(-60 * 24 * 3),
    },
  ]
  localStorage.setItem('patient-crm-mock-leads', JSON.stringify(leads))
}

function seedAppointments() {
  if (localStorage.getItem('patient-crm-mock-appointments')) return

  const appointments = [
    {
      id: 'app-1',
      lead_id: 'pl-1',
      start_date_time: iso(60 * 24 * 2),
      end_date_time: iso(60 * 24 * 2 + 60),
      attendance_status: 'scheduled',
      calendar_column: { id: 'cc-1', name: 'Praxis Mitte' },
      date_created: iso(-60 * 12),
    },
    {
      id: 'app-2',
      lead_id: 'pl-2',
      start_date_time: iso(60 * 24 * 3),
      end_date_time: iso(60 * 24 * 3 + 90),
      attendance_status: 'scheduled',
      calendar_column: { id: 'cc-1', name: 'Praxis Mitte' },
      date_created: iso(-60 * 24),
    },
    {
      id: 'app-3',
      lead_id: 'pl-3',
      start_date_time: iso(-60 * 24 * 2),
      end_date_time: iso(-60 * 24 * 2 + 60),
      attendance_status: 'missed',
      calendar_column: { id: 'cc-2', name: 'Praxis Charlottenburg' },
      date_created: iso(-60 * 24 * 6),
    },
    {
      id: 'app-4',
      lead_id: 'pl-4',
      start_date_time: iso(60 * 24 * 5),
      end_date_time: iso(60 * 24 * 5 + 45),
      attendance_status: 'scheduled',
      calendar_column: { id: 'cc-1', name: 'Praxis Mitte' },
      date_created: iso(-60 * 4),
    },
    {
      id: 'app-5',
      lead_id: 'pl-5',
      start_date_time: iso(-60 * 24 * 14),
      end_date_time: iso(-60 * 24 * 14 + 60),
      attendance_status: 'attended',
      calendar_column: { id: 'cc-1', name: 'Praxis Mitte' },
      date_created: iso(-60 * 24 * 20),
    },
  ]
  localStorage.setItem('patient-crm-mock-appointments', JSON.stringify(appointments))
}

function seedGoogleReviews() {
  if (localStorage.getItem('praxis-crm-google-reviews')) return

  const reviews = [
    {
      reviewId: 'gr-1',
      reviewer: { displayName: 'Sandra K.' },
      starRating: 5,
      comment: 'Wunderbare Beratung, sehr kompetent und einfühlsam. Empfehle Wunschlachen weiter!',
      createTime: iso(-60 * 24 * 7),
      updateTime: iso(-60 * 24 * 7),
      reviewReply: {
        comment: 'Vielen Dank für Ihre Bewertung, Frau K.!',
        updateTime: iso(-60 * 24 * 6),
      },
    },
    {
      reviewId: 'gr-2',
      reviewer: { displayName: 'Jürgen M.' },
      starRating: 5,
      comment: 'Schmerzfreie Behandlung, top organisiert. Perfekte Praxis.',
      createTime: iso(-60 * 24 * 14),
      updateTime: iso(-60 * 24 * 14),
      reviewReply: null,
    },
    {
      reviewId: 'gr-3',
      reviewer: { displayName: 'Anonymous' },
      starRating: 4,
      comment: 'Sehr freundlich, Wartezeit könnte kürzer sein.',
      createTime: iso(-60 * 24 * 21),
      updateTime: iso(-60 * 24 * 21),
      reviewReply: null,
    },
    {
      reviewId: 'gr-4',
      reviewer: { displayName: 'Petra S.' },
      starRating: 5,
      comment: 'Ergebnis ist fantastisch, ich kann wieder lachen!',
      createTime: iso(-60 * 24 * 30),
      updateTime: iso(-60 * 24 * 30),
      reviewReply: {
        comment: 'Das freut uns sehr zu hören, Frau S.!',
        updateTime: iso(-60 * 24 * 29),
      },
    },
    {
      reviewId: 'gr-5',
      reviewer: { displayName: 'Markus B.' },
      starRating: 5,
      comment: 'Beste Implantat-Praxis Berlins. Würde immer wieder hingehen.',
      createTime: iso(-60 * 24 * 45),
      updateTime: iso(-60 * 24 * 45),
      reviewReply: null,
    },
  ]
  localStorage.setItem(
    'praxis-crm-google-reviews',
    JSON.stringify({ reviews, timestamp: Date.now() }),
  )
}

function seedEmailTemplates() {
  if (localStorage.getItem('praxis-crm-email-templates')) return

  const templates = [
    {
      id: 'pt-1',
      name: 'Welcome-Mail Patient',
      subject: 'Willkommen bei Wunschlachen, {{first_name}}!',
      body_html: '<p>Hallo {{first_name}},</p><p>vielen Dank für Ihr Interesse. Wir melden uns binnen 24h.</p>',
      category: 'outreach',
      is_active: true,
    },
    {
      id: 'pt-2',
      name: 'Reactivation 90 Tage',
      subject: 'Wir denken an Sie, {{first_name}}',
      body_html: '<p>Es ist eine Weile her seit unserem letzten Kontakt. Wir wären weiterhin gerne für Sie da.</p>',
      category: 'follow_up',
      is_active: true,
    },
    {
      id: 'pt-3',
      name: 'Bewertungs-Anfrage',
      subject: 'Wie war Ihre Behandlung?',
      body_html: '<p>Wir würden uns über eine kurze Google-Bewertung sehr freuen!</p>',
      category: 'general',
      is_active: true,
    },
    {
      id: 'pt-4',
      name: 'HKP-Versand',
      subject: 'Ihr Heil- und Kostenplan',
      body_html: '<p>Anbei der detaillierte HKP zu Ihrer Behandlung.</p>',
      category: 'presentation',
      is_active: true,
    },
    {
      id: 'pt-5',
      name: 'Termin-Bestätigung',
      subject: 'Termin bestätigt: {{date}} um {{time}}',
      body_html: '<p>Ihr Termin ist bestätigt. Bitte denken Sie an Versichertenkarte.</p>',
      category: 'general',
      is_active: true,
    },
  ]
  localStorage.setItem('praxis-crm-email-templates', JSON.stringify(templates))
}
