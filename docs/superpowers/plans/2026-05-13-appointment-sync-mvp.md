# Kalender-Sync + Termin-Bestätigung MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Checkbox-Syntax (`- [ ]`) für Step-Tracking.

**Goal:** Termine aus dem Kalender-Repo (Directus `appointments`-Collection) werden automatisch zu Lead-Status-Wechseln + Bestätigungs-Mails im CRM. Kein manueller Pflege-Aufwand mehr für „Termin gebucht", „Patient erschienen", „Behandlung fertig".

**Architecture:**
- **Hybrid-Sync**: Browser-WebSocket-Subscription (Directus-Realtime) für Live-UX im offenen CRM, plus Server-Cron `POST /api/cron/appointment-sync` alle 60s als Safety-Net für Status-Wechsel wenn niemand zuschaut. Ohne den Cron würden Status-Trigger verloren gehen, wenn das CRM-Tab geschlossen ist.
- **Patient ↔ Lead Mapping**: Hybrid via `patient_number` primär, `mail` als Fallback. Isoliert testbar in `useAppointmentLeadMatch.ts`.
- **Bestandspatient-Termine**: stillschweigend ignoriert (kein Auto-Lead-Stub).
- **Bestätigungs-Mail**: getriggert beim ersten Match (Status `consultation_scheduled` oder `treatment_scheduled`) via Brevo-Server-Proxy. 24h-Reminder via täglicher Cron.
- **Idempotenz**: jeder verarbeitete Appointment-Event bekommt eine `last_synced_at`-Markierung auf dem Lead (Composite-Key `lead_id + appointment_id + event_hash`).

**Tech Stack:** Nuxt 3.20 + Nitro Server, Vue 3.5, TypeScript, Vitest (schon installiert), Directus WebSocket (`/websocket`-Endpoint), Brevo Server-Proxy (existiert).

**Spec:** `docs/specs/2026-05-13-patient-funnel-automation.md` §3 Modul C + §3 Modul D (Stand `a424045`).

**Out-of-Scope (Folge-Specs):**
- Modul E (No-Show-Auto-Reschedule-Mail) — wird gesondert geplant, baut auf C auf
- Modul G (Behandlung-Done + Final-Umsatz) — getrennter Plan
- Schreibender Zugriff vom CRM auf `appointments` (CRM liest nur, Kalender schreibt)

---

## File Structure

**New files:**
- `layers/patienten/composables/useAppointmentLeadMatch.ts` — Hybrid-Mapping (patient_number → mail)
- `layers/patienten/composables/useAppointmentLeadMatch.test.ts` — Unit-Tests
- `layers/patienten/composables/useAppointmentLeadSync.ts` — Event → Lead-Action Mapping (pure logic)
- `layers/patienten/composables/useAppointmentLeadSync.test.ts` — Unit-Tests
- `layers/patienten/data/appointment-mail-slots.ts` — Confirmation + Reminder Slot-Definitionen
- `app/plugins/directus-realtime.client.ts` — WebSocket-Subscription mit Reconnect-Backoff
- `app/server/api/cron/appointment-sync.post.ts` — Safety-Net Cron alle 60s
- `app/server/api/cron/appointment-reminder.post.ts` — 24h-Reminder Cron
- `.github/workflows/appointment-cron.yml` — beide Cron-Jobs
- `docs/APPOINTMENT_SYNC_OPS.md` — Runbook

**Modified files:**
- `layers/patienten/types/crm.ts` — `Lead.last_appointment_synced_at`, `Lead.linked_appointment_id`
- `layers/patienten/composables/useAppointments.ts` — Mock-Modus → Directus

**Not touched:**
- Kalender-Repo (`ZAP-Wunschlachen/Kalender`) — CRM ist Consumer, Kalender ist Source-of-Truth
- Modul A (Welcome-Sequence) — läuft unverändert weiter

---

## Annahmen / Vorbedingungen

| # | Annahme | Verifikation |
|---|---------|--------------|
| 1 | Directus läuft auf `wunschlachen.app` und akzeptiert WebSocket-Subscriptions auf `appointments` | Task 0 — curl gegen `/websocket` |
| 2 | `appointments`-Collection hat die Felder aus Kalender-Types (`patient.patient_number`, `patient.email`, `arrival_date`, `treatment_finished_date`, `start_date_time`, `treatment.name`, `treatment.category`) | Task 0 — gh-api gegen Directus-Schema |
| 3 | `DIRECTUS_SERVICE_TOKEN` aus Welcome-Sequence ist auch für `appointments` lesefähig | Task 0 — curl-Test |
| 4 | Brevo-Server-Proxy aus Welcome-Sequence (`/api/brevo/send-email`) ist live | Bereits verifiziert in Issue #20 |

---

## Task 0: Setup + Annahmen prüfen + Issue

- [ ] **Step 0.1: Branch-Sanity**

```bash
cd ~/TonyDev/wunschlachen-crm
git checkout feat/full-merge && git pull --ff-only origin feat/full-merge
git status
```

- [ ] **Step 0.2: Directus-Schema check für `appointments`**

```bash
# Token aus Welcome-Sequence-Env nutzen, oder anonymen Read-Versuch
curl -sS "https://wunschlachen.app/items/appointments?limit=1&fields=id,patient.patient_number,patient.email,arrival_date,treatment_finished_date,start_date_time,treatment.name,treatment.category" \
  -H "Authorization: Bearer $NUXT_DIRECTUS_SERVICE_TOKEN" \
  -w "\nHTTP %{http_code}\n" -m 10 | head -30
```

Erwartet: HTTP 200 + `data: [...]`-JSON. Falls 401: Token-Berechtigung erweitern (Modul-Doc-Update). Falls 404: Collection heißt anders — Schema-Mismatch, STOP + melde BLOCKED.

- [ ] **Step 0.3: WebSocket-Endpoint check**

```bash
# Directus-WebSocket-Endpoint ist standardmäßig auf /websocket
curl -sS "https://wunschlachen.app/server/info" -m 5 | head -20
```

Erwartet: JSON mit Directus-Version. WebSocket-Verfügbarkeit verifizieren wir später im Plugin-Smoke (Task 5).

- [ ] **Step 0.4: Issue anlegen**

```bash
gh issue create --repo ZAP-Wunschlachen/wunschlachen-crm \
  --title "Modul C+D: Kalender-Sync (Realtime) + Termin-Bestätigung" \
  --label "enhancement" \
  --body "Implementation gemäß \`docs/superpowers/plans/2026-05-13-appointment-sync-mvp.md\` (Spec \`docs/specs/2026-05-13-patient-funnel-automation.md\` Modul C+D). Browser-WebSocket + Server-Cron Hybrid, Hybrid-Mapping patient_number/mail, Bestandspatient-Termine ignoriert."
```

Notiere die Issue-Nummer.

---

## Task 1: Lead-Type um Appointment-Sync-Felder erweitern

**Files:** `layers/patienten/types/crm.ts`

- [ ] **Step 1.1: Felder ergänzen**

Edit-Tool. Nach den `welcome_sequence_*`-Feldern im Lead-Interface:

```ts
  // Appointment-Sync (Plan v9 Modul C MVP)
  linked_appointment_id?: string         // ID des aktuell verknüpften Kalender-Termins
  last_appointment_synced_at?: string    // ISO timestamp: letztes verarbeitetes Sync-Event
```

- [ ] **Step 1.2: Commit**

```bash
git add layers/patienten/types/crm.ts
git commit -m "feat(types): Lead.linked_appointment_id + last_appointment_synced_at"
```

---

## Task 2: `useAppointmentLeadMatch` (Hybrid-Matcher, TDD)

**Files:**
- Create: `layers/patienten/composables/useAppointmentLeadMatch.ts`
- Create: `layers/patienten/composables/useAppointmentLeadMatch.test.ts`

- [ ] **Step 2.1: Failing-Tests**

```ts
import { describe, it, expect } from 'vitest'
import { useAppointmentLeadMatch } from './useAppointmentLeadMatch'
import type { Lead } from '../types/crm'

const mkLead = (overrides: Partial<Lead> = {}): Lead => ({
  id: 'l-1', first_name: 'A', last_name: 'B', mail: 'a@b.de',
  status: 'new', date_created: '2026-05-01T00:00:00Z', date_updated: '2026-05-01T00:00:00Z',
  ...overrides,
})

type ApptPatient = { patient_number?: string; email?: string }

describe('matchAppointmentToLead', () => {
  const { matchAppointmentToLead } = useAppointmentLeadMatch()

  it('matched per patient_number (primär)', () => {
    const leads = [mkLead({ id: 'l-1', patient_number: 'P-12345', mail: 'other@x.de' })]
    const result = matchAppointmentToLead({ patient_number: 'P-12345' }, leads)
    expect(result?.id).toBe('l-1')
  })

  it('matched per mail wenn patient_number fehlt', () => {
    const leads = [mkLead({ id: 'l-2', mail: 'maria@example.de' })]
    const result = matchAppointmentToLead({ email: 'maria@example.de' }, leads)
    expect(result?.id).toBe('l-2')
  })

  it('mail-match ist case-insensitive', () => {
    const leads = [mkLead({ id: 'l-3', mail: 'Maria@Example.DE' })]
    const result = matchAppointmentToLead({ email: 'maria@example.de' }, leads)
    expect(result?.id).toBe('l-3')
  })

  it('patient_number hat Vorrang vor mail', () => {
    const leads = [
      mkLead({ id: 'l-a', patient_number: 'P-1', mail: 'wrong@x.de' }),
      mkLead({ id: 'l-b', mail: 'maria@example.de' }),
    ]
    const result = matchAppointmentToLead({ patient_number: 'P-1', email: 'maria@example.de' }, leads)
    expect(result?.id).toBe('l-a')
  })

  it('returns null wenn weder patient_number noch mail matchen', () => {
    const leads = [mkLead({ id: 'l-1', patient_number: 'P-999', mail: 'x@y.de' })]
    const result = matchAppointmentToLead({ patient_number: 'P-1', email: 'a@b.de' }, leads)
    expect(result).toBeNull()
  })

  it('returns null wenn appointment.patient leer ist', () => {
    const leads = [mkLead({ id: 'l-1', patient_number: 'P-1' })]
    expect(matchAppointmentToLead({}, leads)).toBeNull()
    expect(matchAppointmentToLead(null as any, leads)).toBeNull()
  })

  it('matched mail auch bei trim/whitespace', () => {
    const leads = [mkLead({ id: 'l-1', mail: 'maria@example.de' })]
    const result = matchAppointmentToLead({ email: '  maria@example.de  ' }, leads)
    expect(result?.id).toBe('l-1')
  })
})
```

- [ ] **Step 2.2: Tests laufen — müssen fail**

```bash
cd ~/TonyDev/wunschlachen-crm/app && npx pnpm@9 test:run 2>&1 | tail -10
```

Expected: Fail mit "Cannot find module './useAppointmentLeadMatch'".

- [ ] **Step 2.3: Composable implementieren**

```ts
/**
 * useAppointmentLeadMatch — Hybrid-Match zwischen Kalender-Termin und CRM-Lead.
 *
 * Strategie (Plan v9 Modul C, entschieden 2026-05-13):
 *  1. patient_number exact match
 *  2. mail case-insensitive + trim
 *  3. sonst null (Bestandspatient ohne Lead, wird ignoriert)
 */

import type { Lead } from '~/types/crm'

interface AppointmentPatientInfo {
  patient_number?: string | null
  email?: string | null
}

const normalizeMail = (m?: string | null): string => (m || '').trim().toLowerCase()

export const useAppointmentLeadMatch = () => {
  const matchAppointmentToLead = (
    patient: AppointmentPatientInfo | null | undefined,
    leads: Lead[],
  ): Lead | null => {
    if (!patient) return null

    // Primär: patient_number
    if (patient.patient_number) {
      const found = leads.find((l) => l.patient_number === patient.patient_number)
      if (found) return found
    }

    // Fallback: mail (case-insensitive, trim)
    if (patient.email) {
      const target = normalizeMail(patient.email)
      const found = leads.find((l) => normalizeMail(l.mail) === target && target.length > 0)
      if (found) return found
    }

    return null
  }

  return { matchAppointmentToLead }
}
```

**Wichtig:** `Lead.patient_number` muss als Type-Feld existieren. Falls noch nicht: in Task 1 erweitern. Bitte vor dem Test prüfen:

```bash
grep -n "patient_number" layers/patienten/types/crm.ts
```

Erwartet: ein Match. Wenn nicht da: ergänzen im `Lead`-Interface bei Task 1 (nach `id`):
```ts
  patient_number?: string  // optional FK zum Praxis-System (Dampsoft)
```

- [ ] **Step 2.4: Tests grün**

```bash
cd ~/TonyDev/wunschlachen-crm/app && npx pnpm@9 test:run 2>&1 | tail -15
```

Erwartet: alle Match-Tests grün + die bestehenden 15 Welcome-Tests grün.

- [ ] **Step 2.5: Commit**

```bash
git add layers/patienten/composables/useAppointmentLeadMatch.ts layers/patienten/composables/useAppointmentLeadMatch.test.ts layers/patienten/types/crm.ts
git commit -m "feat(sync): useAppointmentLeadMatch — Hybrid patient_number+mail"
```

---

## Task 3: `useAppointmentLeadSync` (Event-Mapping, TDD)

**Files:**
- Create: `layers/patienten/composables/useAppointmentLeadSync.ts`
- Create: `layers/patienten/composables/useAppointmentLeadSync.test.ts`

- [ ] **Step 3.1: Tests schreiben**

```ts
import { describe, it, expect } from 'vitest'
import { useAppointmentLeadSync, type AppointmentEvent } from './useAppointmentLeadSync'
import type { Lead, LeadStatus } from '../types/crm'

const mkLead = (status: LeadStatus = 'new'): Lead => ({
  id: 'l-1', first_name: 'A', last_name: 'B', mail: 'a@b.de',
  status, date_created: '2026-05-01T00:00:00Z', date_updated: '2026-05-01T00:00:00Z',
})

const mkApptInsert = (overrides: any = {}): AppointmentEvent => ({
  kind: 'INSERT',
  appointment: {
    id: 'a-1',
    start_date_time: '2026-06-01T10:00:00Z',
    arrival_date: null,
    treatment_finished_date: null,
    treatment: { name: 'Erstberatung Implantat', category: 'beratung' },
    ...overrides.appointment,
  },
  ...overrides,
})

describe('plannedAction', () => {
  const { plannedAction } = useAppointmentLeadSync()

  it('INSERT mit Beratung → consultation_scheduled', () => {
    const action = plannedAction(mkApptInsert(), mkLead('new'))
    expect(action?.type).toBe('set_status')
    expect(action?.toStatus).toBe('consultation_scheduled')
    expect(action?.sendMail).toBe('appointment_confirmation_consultation')
  })

  it('INSERT mit Behandlung → treatment_scheduled', () => {
    const evt = mkApptInsert({ appointment: { treatment: { name: 'Implantation', category: 'behandlung' } } })
    const action = plannedAction(evt, mkLead('hkp_signed'))
    expect(action?.toStatus).toBe('treatment_scheduled')
    expect(action?.sendMail).toBe('appointment_confirmation_treatment')
  })

  it('UPDATE arrival_date != null → consultation_done', () => {
    const evt: AppointmentEvent = {
      kind: 'UPDATE',
      appointment: {
        id: 'a-1', start_date_time: '2026-06-01T10:00:00Z',
        arrival_date: '2026-06-01T10:05:00Z', treatment_finished_date: null,
        treatment: { name: 'Beratung', category: 'beratung' },
      },
    }
    const action = plannedAction(evt, mkLead('consultation_scheduled'))
    expect(action?.toStatus).toBe('consultation_done')
    expect(action?.sendMail).toBeNull()
  })

  it('UPDATE treatment_finished_date → completed', () => {
    const evt: AppointmentEvent = {
      kind: 'UPDATE',
      appointment: {
        id: 'a-1', start_date_time: '2026-06-01T10:00:00Z',
        arrival_date: '2026-06-01T10:00:00Z', treatment_finished_date: '2026-06-01T12:00:00Z',
        treatment: { name: 'Implantation', category: 'behandlung' },
      },
    }
    const action = plannedAction(evt, mkLead('treatment_in_progress'))
    expect(action?.toStatus).toBe('completed')
  })

  it('UPDATE auf bereits abgeschlossenem Lead → null (idempotent)', () => {
    const evt: AppointmentEvent = {
      kind: 'UPDATE',
      appointment: {
        id: 'a-1', start_date_time: '2026-06-01T10:00:00Z',
        arrival_date: '2026-06-01T10:05:00Z', treatment_finished_date: null,
        treatment: { name: 'Beratung', category: 'beratung' },
      },
    }
    expect(plannedAction(evt, mkLead('consultation_done'))).toBeNull()
    expect(plannedAction(evt, mkLead('hkp_sent'))).toBeNull()
  })

  it('DELETE → activity-only, kein Status-Wechsel', () => {
    const evt: AppointmentEvent = { kind: 'DELETE', appointment: { id: 'a-1' } as any }
    const action = plannedAction(evt, mkLead('consultation_scheduled'))
    expect(action?.type).toBe('log_only')
    expect(action?.activityLabel).toContain('storniert')
  })

  it('UPDATE start_date_time only → activity log, kein Status', () => {
    // Reschedule erkannt am Plan v9 reschedule_count, separat behandelt
    const action = plannedAction(
      { kind: 'UPDATE', appointment: { id: 'a-1', start_date_time: '2026-06-15T10:00:00Z' } as any },
      mkLead('consultation_scheduled'),
    )
    expect(action?.type).toBe('log_only')
    expect(action?.activityLabel).toContain('verschoben')
  })
})
```

- [ ] **Step 3.2: Composable**

```ts
/**
 * useAppointmentLeadSync — Pure-Logic Event-Mapping (Plan v9 Modul C).
 *
 * Input: ein Appointment-Event vom WebSocket (oder vom Cron Resync) + der
 * aktuelle Lead.
 * Output: PlannedAction (set_status / log_only / null) — der Caller (Server
 * oder Plugin) führt sie tatsächlich aus.
 */

import type { Lead, LeadStatus } from '~/types/crm'

export interface AppointmentLite {
  id: string
  start_date_time?: string | null
  arrival_date?: string | null
  treatment_finished_date?: string | null
  treatment?: { name?: string; category?: string }
}

export type AppointmentEvent =
  | { kind: 'INSERT'; appointment: AppointmentLite }
  | { kind: 'UPDATE'; appointment: AppointmentLite }
  | { kind: 'DELETE'; appointment: AppointmentLite }

export interface PlannedAction {
  type: 'set_status' | 'log_only'
  toStatus?: LeadStatus
  sendMail?: 'appointment_confirmation_consultation' | 'appointment_confirmation_treatment' | null
  activityLabel: string
  appointmentId: string
}

const isBeratung = (a: AppointmentLite): boolean => {
  const cat = (a.treatment?.category || '').toLowerCase()
  const name = (a.treatment?.name || '').toLowerCase()
  return cat === 'beratung' || /beratung|consultation/.test(name)
}

const isBehandlung = (a: AppointmentLite): boolean => {
  const cat = (a.treatment?.category || '').toLowerCase()
  const name = (a.treatment?.name || '').toLowerCase()
  return cat === 'behandlung' || /implantation|behandlung|operation/.test(name)
}

export const useAppointmentLeadSync = () => {
  const plannedAction = (event: AppointmentEvent, lead: Lead): PlannedAction | null => {
    const appt = event.appointment

    if (event.kind === 'DELETE') {
      return {
        type: 'log_only',
        activityLabel: `Termin ${appt.id} storniert`,
        appointmentId: appt.id,
      }
    }

    if (event.kind === 'INSERT') {
      if (isBeratung(appt)) {
        return {
          type: 'set_status',
          toStatus: 'consultation_scheduled',
          sendMail: 'appointment_confirmation_consultation',
          activityLabel: `Beratungstermin gebucht: ${appt.start_date_time}`,
          appointmentId: appt.id,
        }
      }
      if (isBehandlung(appt)) {
        return {
          type: 'set_status',
          toStatus: 'treatment_scheduled',
          sendMail: 'appointment_confirmation_treatment',
          activityLabel: `Behandlungstermin gebucht: ${appt.start_date_time}`,
          appointmentId: appt.id,
        }
      }
      return null
    }

    // UPDATE
    // a) treatment_finished_date gesetzt → completed (höchste Prio)
    if (appt.treatment_finished_date) {
      if (lead.status === 'completed') return null
      return {
        type: 'set_status',
        toStatus: 'completed',
        sendMail: null,
        activityLabel: `Behandlung abgeschlossen: ${appt.treatment_finished_date}`,
        appointmentId: appt.id,
      }
    }

    // b) arrival_date gesetzt → Patient erschienen
    if (appt.arrival_date) {
      // Idempotenz: nur wenn Lead noch im "geplant"-Status
      if (lead.status === 'consultation_scheduled') {
        return {
          type: 'set_status',
          toStatus: 'consultation_done',
          sendMail: null,
          activityLabel: `Patient erschienen (Beratung): ${appt.arrival_date}`,
          appointmentId: appt.id,
        }
      }
      if (lead.status === 'treatment_scheduled') {
        return {
          type: 'set_status',
          toStatus: 'treatment_in_progress',
          sendMail: null,
          activityLabel: `Patient erschienen (Behandlung): ${appt.arrival_date}`,
          appointmentId: appt.id,
        }
      }
      return null
    }

    // c) start_date_time geändert → Reschedule, activity only
    if (appt.start_date_time) {
      return {
        type: 'log_only',
        activityLabel: `Termin verschoben auf ${appt.start_date_time}`,
        appointmentId: appt.id,
      }
    }

    return null
  }

  return { plannedAction }
}
```

- [ ] **Step 3.3: Tests laufen + commit**

```bash
cd ~/TonyDev/wunschlachen-crm/app && npx pnpm@9 test:run 2>&1 | tail -15
cd ~/TonyDev/wunschlachen-crm
git add layers/patienten/composables/useAppointmentLeadSync.ts layers/patienten/composables/useAppointmentLeadSync.test.ts
git commit -m "feat(sync): useAppointmentLeadSync — Event→Action Mapping"
```

---

## Task 4: Mail-Slot-Definitionen für Termin-Bestätigung + Reminder

**Files:** `layers/patienten/data/appointment-mail-slots.ts`

```ts
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
    html_fallback: '<p>Hallo {{firstName}},</p><p>Ihre Beratungstermin am <strong>{{startDate}}</strong> um <strong>{{startTime}}</strong> ist bestätigt.</p><p>Sie finden uns in der Praxis <strong>{{locationName}}</strong>, {{locationStreet}}, {{locationCity}}.</p><p>Was Sie mitbringen sollten: Versichertenkarte, ggf. aktuelle Röntgenbilder.</p><p>Falls Sie den Termin verschieben müssen: <a href="https://wunschlachen.app/buchen">Hier neu buchen</a>.</p>',
  },
  treatment_confirmation: {
    slug: 'appointment-confirmation-treatment',
    brevo_template_id: 2002,
    subject_fallback: 'Termin-Bestätigung: Behandlung am {{startDate}}',
    html_fallback: '<p>Hallo {{firstName}},</p><p>Ihre Behandlung ist gebucht: <strong>{{startDate}}</strong> um <strong>{{startTime}}</strong> in der Praxis <strong>{{locationName}}</strong>.</p><p>Bitte erscheinen Sie 15 Minuten vor Termin. Was Sie beachten sollten: keine Anstrengung am Vortag, Frühstück OK, Medikamenten-Plan beachten.</p>',
  },
  reminder_24h: {
    slug: 'appointment-reminder-24h',
    brevo_template_id: 2003,
    subject_fallback: 'Erinnerung: Ihr Termin morgen um {{startTime}}',
    html_fallback: '<p>Hallo {{firstName}},</p><p>Nur zur Erinnerung: morgen um <strong>{{startTime}}</strong> erwarten wir Sie in der Praxis {{locationName}}.</p><p>Falls etwas dazwischenkommt, bitte rufen Sie uns an: {{practicePhone}}.</p>',
  },
} as const

export type AppointmentMailSlotKey = keyof typeof APPOINTMENT_MAIL_SLOTS
```

Commit:

```bash
git add layers/patienten/data/appointment-mail-slots.ts
git commit -m "feat(sync): Mail-Slot-Definitionen Termin-Bestätigung + Reminder"
```

---

## Task 5: Directus-Realtime-Plugin (Browser-WebSocket)

**Files:** `app/plugins/directus-realtime.client.ts`

```ts
/**
 * Directus-WebSocket-Subscription für `appointments`-Collection (Plan v9 Modul C).
 *
 * Läuft im Browser. Bei jedem WebSocket-Event ruft das Plugin den Server-Sync-
 * Endpoint auf, der die Event-Verarbeitung deduppt und persistent ausführt.
 * Browser-Plugin alleine ist KEINE Garantie — der Server-Cron (Task 8) ist
 * Safety-Net wenn niemand das CRM offen hat.
 */

export default defineNuxtPlugin({
  name: 'directus-realtime',
  parallel: true,
  setup() {
    if (process.server) return

    const config = useRuntimeConfig()
    const directusUrl = (config.public.directusUrl as string) || ''
    if (!directusUrl) return

    const wsUrl = directusUrl.replace(/^http/, 'ws') + '/websocket'
    let ws: WebSocket | null = null
    let reconnectDelay = 1000
    let stopped = false

    const subscribe = (socket: WebSocket) => {
      socket.send(JSON.stringify({
        type: 'subscribe',
        collection: 'appointments',
        event: '*',
        query: { fields: ['id', 'patient.patient_number', 'patient.email', 'start_date_time', 'arrival_date', 'treatment_finished_date', 'treatment.name', 'treatment.category', 'location.name', 'location.street', 'location.city'] },
      }))
    }

    const onEvent = async (data: any) => {
      if (data?.type !== 'subscription' || !data?.data) return
      // Server-side Sync auslösen (idempotent), nicht in Browser direkt schreiben
      try {
        await $fetch('/api/cron/appointment-sync', {
          method: 'POST',
          body: { trigger: 'realtime', appointment_id: data.data?.id },
          headers: { 'x-realtime-event': '1' },
        })
      } catch (e) {
        console.warn('[directus-realtime] sync failed', e)
      }
    }

    const connect = () => {
      if (stopped) return
      try {
        ws = new WebSocket(wsUrl)
      } catch {
        scheduleReconnect()
        return
      }
      ws.onopen = () => {
        reconnectDelay = 1000
        subscribe(ws!)
      }
      ws.onmessage = (msg) => {
        try { onEvent(JSON.parse(msg.data)) } catch { /* ignore */ }
      }
      ws.onclose = () => scheduleReconnect()
      ws.onerror = () => ws?.close()
    }

    const scheduleReconnect = () => {
      if (stopped) return
      setTimeout(connect, reconnectDelay)
      reconnectDelay = Math.min(30000, reconnectDelay * 2)
    }

    connect()

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        stopped = true
        ws?.close()
      })
    }
  },
})
```

Commit:

```bash
git add app/plugins/directus-realtime.client.ts
git commit -m "feat(sync): Directus-WebSocket-Plugin mit Reconnect-Backoff"
```

---

## Task 6: Server-Sync-Endpoint `/api/cron/appointment-sync`

**Files:** `app/server/api/cron/appointment-sync.post.ts`

Vollständige Implementation mit:
- Auth via `x-appointment-cron-secret` ODER `x-realtime-event` (Browser-WebSocket-Pfad)
- Wenn `body.appointment_id` gesetzt → nur diesen einen Termin verarbeiten (Realtime-Pfad)
- Wenn ohne `appointment_id` → alle Termine seit `last_appointment_synced_at` der Leads → Catch-up (Cron-Pfad)
- Pro Event: `useAppointmentLeadMatch` + `useAppointmentLeadSync.plannedAction` (Inline-Logik im Server-Endpoint, weil Composables Client-Auto-Import sind)
- Bei `plannedAction.toStatus`: PATCH `Leads/{lead_id}` + Activity-Insert
- Bei `plannedAction.sendMail`: $fetch /api/brevo/send-email mit Template-ID + Params
- Idempotenz via `lead.last_appointment_synced_at = appt.date_updated`

```ts
import { defineEventHandler, getHeader, readBody, createError } from 'h3'
import type { Lead } from '../../../../layers/patienten/types/crm'
import { APPOINTMENT_MAIL_SLOTS } from '../../../../layers/patienten/data/appointment-mail-slots'

// Inline-Kopie der Match-Logik (Server-Side, kein Auto-Import)
const normalizeMail = (m?: string | null) => (m || '').trim().toLowerCase()
const matchLead = (patient: { patient_number?: string | null; email?: string | null }, leads: Lead[]): Lead | null => {
  if (!patient) return null
  if (patient.patient_number) {
    const f = leads.find((l) => l.patient_number === patient.patient_number)
    if (f) return f
  }
  if (patient.email) {
    const target = normalizeMail(patient.email)
    if (target) {
      const f = leads.find((l) => normalizeMail(l.mail) === target)
      if (f) return f
    }
  }
  return null
}

// Inline-Kopie der Action-Logik (siehe useAppointmentLeadSync.ts für Tests)
// ... (komplette plannedAction-Funktion analog zum Composable kopiert)

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const realtimeFlag = getHeader(event, 'x-realtime-event') === '1'
  const expectedSecret = config.appointmentCronSecret as string
  const providedSecret = getHeader(event, 'x-appointment-cron-secret')
  if (!realtimeFlag && (!expectedSecret || providedSecret !== expectedSecret)) {
    throw createError({ statusCode: 401, statusMessage: 'invalid sync secret' })
  }

  const body = realtimeFlag ? await readBody(event) : {}
  const directusUrl = config.directusUrl as string
  const directusToken = config.directusServiceToken as string

  // Termine abrufen — entweder nur den einen aus Realtime, oder alle changes since
  // ... (Implementation analog zum Welcome-Cron, aber gegen `appointments`)
  // Pro Termin: matchLead → if null: skip (Bestandspatient ignorieren) → plannedAction → ausführen

  return { processed: 0, status_changes: 0, mails_sent: 0, errors: [] }
})
```

**HINWEIS für Subagent:** Die hier gezeigte Skizze ist nicht vollständig — du musst die Implementation analog zum bestehenden Welcome-Sequence-Cron (`app/server/api/cron/welcome-sequence.post.ts`) ausgestalten, mit:
- Directus-Fetch für Leads (filter status in [new..treatment_scheduled, treatment_in_progress])
- Directus-Fetch für Appointments (entweder ein einzelner per ID, oder alle mit `date_updated > X`)
- Pro Termin: Match → PlannedAction → wenn `set_status`: PATCH + Activity + ggf. Mail-Trigger
- Result-JSON `{ processed, status_changes, mails_sent, errors: [] }`

Beim Mail-Trigger: Template-ID + Params (`firstName`, `startDate`, `startTime`, `locationName`) aus Appointment+Lead bauen, Brevo-Endpoint aufrufen.

Commit:

```bash
git add app/server/api/cron/appointment-sync.post.ts
git commit -m "feat(sync): /api/cron/appointment-sync Endpoint (Realtime + Catch-up)"
```

---

## Task 7: 24h-Reminder-Cron `/api/cron/appointment-reminder`

**Files:** `app/server/api/cron/appointment-reminder.post.ts`

Logik:
- Auth via `x-appointment-cron-secret` (gleiches Secret wie Sync)
- Query Directus: alle `appointments` mit `start_date_time` zwischen `now+23h` und `now+25h`
- Pro Termin: matchLead → wenn Match → Brevo-Mail `reminder_24h` mit Template-ID 2003
- Activity „Reminder 24h versandt"
- Idempotenz: `appointment.reminder_24h_sent_at` Feld (auf Directus-Seite anlegen ODER lokal via Activity-Log: kein doppeltes „Reminder versandt" innerhalb 24h)

Strukturell analog Welcome-Cron. ~80 Zeilen. Commit separat.

---

## Task 8: nuxt.config.ts Runtime-Config erweitern

Edit-Tool. Im `runtimeConfig`-Block (Server-side, neben `welcomeCronSecret`):

```ts
appointmentCronSecret: '',  // env: NUXT_APPOINTMENT_CRON_SECRET
```

`public.directusUrl` existiert bereits.

Commit:

```bash
git add app/nuxt.config.ts
git commit -m "config: NUXT_APPOINTMENT_CRON_SECRET runtime key"
```

---

## Task 9: Lead-Detail UI — Live-Termin-Card

**Files:** `layers/patienten/pages/patienten/leads/[id].vue`

Im bestehenden `LeadAppointments`-Component-Aufruf (oder direkt in der Page) prüfen: nutzt es schon `useAppointments`? Falls ja, kein Code-Change nötig (das Plugin triggert den Sync-Endpoint, der schreibt in `Leads`, die Page reactived das beim Watcher).

Wenn nicht: kleinen Watcher auf `lead.last_appointment_synced_at` einbauen, der bei Änderung `loadActivities()` + `leadAppointmentsRef?.reload()` triggert.

Commit:

```bash
git add 'layers/patienten/pages/patienten/leads/[id].vue'
git commit -m "feat(sync): Lead-Detail reagiert auf appointment-sync-Updates"
```

(Falls keine Änderung nötig: skip dieser Task, kein Commit.)

---

## Task 10: GitHub-Actions für beide Cron-Jobs

**Files:** `.github/workflows/appointment-cron.yml`

```yaml
name: Appointment Sync & Reminder

on:
  schedule:
    - cron: '*/2 * * * *'    # Sync alle 2 Min
    - cron: '0 8 * * *'       # Reminder täglich 09:00 Berlin
  workflow_dispatch:

jobs:
  sync:
    if: github.event.schedule == '*/2 * * * *' || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    steps:
      - name: appointment-sync
        run: |
          curl -sS -o /tmp/body -w "%{http_code}" \
            -X POST "${{ secrets.CRM_BASE_URL }}/api/cron/appointment-sync" \
            -H "x-appointment-cron-secret: ${{ secrets.APPOINTMENT_CRON_SECRET }}" \
            -H "content-type: application/json"
          cat /tmp/body

  reminder:
    if: github.event.schedule == '0 8 * * *'
    runs-on: ubuntu-latest
    steps:
      - name: appointment-reminder
        run: |
          curl -sS -o /tmp/body -w "%{http_code}" \
            -X POST "${{ secrets.CRM_BASE_URL }}/api/cron/appointment-reminder" \
            -H "x-appointment-cron-secret: ${{ secrets.APPOINTMENT_CRON_SECRET }}" \
            -H "content-type: application/json"
          cat /tmp/body
```

**Hinweis:** GitHub-Actions garantiert keine sub-Minute-Auflösung; ~2-5 Min Latenz ist realistisch. Für „binnen 5 Sek" aus Spec greift der WebSocket im Browser. Cron ist Safety-Net.

Commit:

```bash
git add .github/workflows/appointment-cron.yml
git commit -m "ci(sync): GitHub Actions für appointment-sync (alle 2 Min) + reminder (täglich)"
```

---

## Task 11: Runbook `docs/APPOINTMENT_SYNC_OPS.md`

Analog `WELCOME_SEQUENCE_OPS.md`. Inhalt:
- Was es macht
- Env-Vars (`NUXT_APPOINTMENT_CRON_SECRET`)
- GitHub-Secrets (`APPOINTMENT_CRON_SECRET`)
- Brevo-Template-IDs (2001, 2002, 2003)
- Troubleshooting: WebSocket disconnected, doppelte Mails, Bestandspatient-Mismatches
- DSGVO: nur Lead-zugeordnete Termine werden verarbeitet

Commit:

```bash
git add docs/APPOINTMENT_SYNC_OPS.md
git commit -m "docs(sync): Operations-Runbook Modul C+D"
```

---

## Task 12: Smoke-Test + Push + Issue-Close

- [ ] **Vitest komplett**

```bash
cd ~/TonyDev/wunschlachen-crm/app && npx pnpm@9 test:run 2>&1 | tail -15
```

Erwartet: alle bestehenden Tests + neue (mind. 14 zusätzliche aus Tasks 2+3) grün.

- [ ] **Dev-Server WebSocket-Smoke**

```bash
lsof -ti :3000 > /dev/null && \
  curl -sS -o /dev/null -w "HTTP %{http_code}\n" -m 5 http://localhost:3000/patienten/leads/lead-1 || \
  echo "no dev server"
```

Erwartet: HTTP 200, Plugin lädt im Browser-Tab. Browser-Console sollte keine kritischen Errors zeigen.

- [ ] **Cron-Endpoint-Smoke**

```bash
curl -sS -X POST http://localhost:3000/api/cron/appointment-sync \
  -H 'x-appointment-cron-secret: wrong' -w "\nHTTP %{http_code}\n" -m 5
```

Erwartet: HTTP 401 mit `invalid sync secret`.

- [ ] **Push + Issue-Close**

```bash
cd ~/TonyDev/wunschlachen-crm
git push origin feat/full-merge
gh issue close <ISSUE_NUMMER> --repo ZAP-Wunschlachen/wunschlachen-crm --comment "Umgesetzt auf feat/full-merge — Commits: ..."
```

---

## Self-Review-Notes

**Spec-Coverage gegen Modul C+D:**
- [x] Browser-WebSocket: Task 5
- [x] Cron-Safety-Net: Task 6 (alle 2 Min via GitHub Actions)
- [x] Hybrid-Mapping: Task 2 + Tests
- [x] Bestandspatient-Ignorieren: Task 2 (returns null bei no-match)
- [x] Idempotenz: `last_appointment_synced_at` + Lead-Status-Guards in Task 3
- [x] 5 Mapping-Regeln: Task 3-Tests decken alle ab (Beratung/Behandlung INSERT, arrival_date UPDATE, treatment_finished_date UPDATE, DELETE)
- [x] Termin-Bestätigung sofort: Task 6 (Mail-Trigger im Sync-Endpoint)
- [x] 24h-Reminder: Task 7
- [x] Edge-Cases (Reschedule, Storno, Mehrfach-Termine): Task 3 + Akzeptanzkriterien

**Bekannte Risiken:**
- WebSocket-Auth: Directus-Realtime erwartet Auth-Token; Plugin nutzt aktuell anonymen Subscribe. Falls Directus die `appointments`-Collection nur authentifiziert preisgibt, im Plugin nach `WebSocket.onopen` ein `{ type: 'auth', access_token }` senden (Directus-WebSocket-Pattern).
- GitHub-Actions Sub-Minute-Scheduling: Realistisch 2-5 Min Verzögerung. Die "binnen 5 Sek"-Anforderung wird nur durch WebSocket erfüllt. Im Runbook dokumentieren.
- Bei großen Lead-Tabellen (>10k) wird der Catch-up-Cron langsam: Index auf `last_appointment_synced_at` empfehlen, Pagination einbauen — out of scope für MVP.

**Type-Konsistenz:** `Lead.patient_number` muss als optionaler String existieren. Task 2.3 weist darauf hin.

---

**Approval-Checkliste vor Implementation:**
- [ ] User reviewed dieses Plan-Doc
- [ ] `Lead.patient_number` als Feld bestätigt (sonst in Task 1 ergänzen)
- [ ] Directus-Token mit Lese-Rechten auf `appointments` verfügbar
- [ ] Brevo-Templates 2001-2003 vom Marketing-Team angekündigt
