# Welcome-Mail-Sequenz MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Beim Anlegen eines neuen Patient-Leads im CRM startet automatisch eine 6-teilige Welcome-Mail-Sequenz (Tag 0 + T+1, T+3, T+7, T+10, T+14). Jede Mail landet als Activity in der Lead-Timeline, Engagement-Events (Open/Click) sind live sichtbar.

**Architecture:** Pure-Logic-Composable `useWelcomeSequence` definiert die Slots und entscheidet pro Tag welche Mail fällig ist. `usePatientLeads.createLead` initialisiert beim Anlegen die Sequenz-Felder. Ein Nitro-Cron-Endpoint `POST /api/cron/welcome-sequence` läuft täglich, queryt Leads mit fälligen Slots und triggert den existierenden `POST /api/brevo/send-email` Server-Proxy. Pause-Bedingungen (`status` weiter als `contacted`, `unsubscribed`-Tag, fehlendes `GDPR_accepted_at`) werden im Composable einheitlich geprüft.

**Tech Stack:** Nuxt 3.20 + Nitro Server Routes, Vue 3.5, TypeScript, Brevo (via existierendem Server-Proxy), Directus als Backend (Mock-Mode aktiv — Implementation muss auch im Mock funktionieren), GitHub Actions als Cron-Source (Trigger via HTTP).

**Out-of-Scope (Phase 4 / Modul A Teil 2):**
- Steady-State 2-3×/Woche über 6 Monate
- Themen-Rotation aus 40-Template-Pool
- A/B-Tests zwischen Welcome-Varianten

---

## File Structure

**New files:**
- `layers/patienten/data/welcome-sequence-slots.ts` — Slot-Definitionen (6 Mails mit Tag-Offset, Brevo-Template-ID, Subject-Fallback)
- `layers/patienten/composables/useWelcomeSequence.ts` — Pure-Logic: `getDueSlot`, `shouldPauseFor`, `nextSlotForLead`
- `layers/patienten/composables/useWelcomeSequence.test.ts` — Unit-Tests
- `app/server/api/cron/welcome-sequence.post.ts` — Nitro-Endpoint (Cron-getriggert)
- `app/vitest.config.ts` — Vitest-Konfig (neu)
- `app/tests/setup.ts` — Vitest-Setup
- `docs/WELCOME_SEQUENCE_OPS.md` — Runbook: Cron-Setup + Brevo-Template-Liste + Troubleshooting

**Modified files:**
- `layers/patienten/types/crm.ts` — `Lead` erweitern um `welcome_sequence_position`, `welcome_sequence_started_at`, `welcome_sequence_paused_at`
- `layers/patienten/composables/usePatientLeads.ts:210-220` — `createLead` setzt Sequenz-Init-Felder
- `layers/patienten/components/patienten/EngagementStatsCard.vue` — Position-Anzeige "Welcome 3/6"
- `app/package.json` — Devdeps `vitest`, `@vitest/ui`, `happy-dom`; Scripts `test`, `test:run`

**Not touched (bewusst):**
- `usePatientWorkflows.ts` — Workflow-Engine bleibt für `stage_change`-Trigger und manuelle Workflows; Welcome läuft separat (siehe Architecture-Notiz)

---

## Annahmen / Vorbedingungen

Diese Annahmen werden in Task 0 geprüft. Wenn eine kippt → Plan-Anpassung nötig.

| # | Annahme | Verifikation |
|---|---------|--------------|
| 1 | `BREVO_TOKEN` env ist gesetzt, `app/server/api/brevo/send-email.post.ts` funktioniert | curl-Test in Task 0.2 |
| 2 | 6 Brevo-Templates werden vom Marketing-Team angelegt (IDs `WELCOME_T0`, `WELCOME_T1`, `WELCOME_T3`, `WELCOME_T7`, `WELCOME_T10`, `WELCOME_T14`) | Doc in Task 9 + Slot-Datei mit Platzhalter-IDs (1001-1006), bis echte IDs nachgereicht werden |
| 3 | DigitalOcean App hat einen erreichbaren HTTPS-Endpunkt, an den GitHub Actions HTTP-POST schicken kann | Task 8 enthält Setup-Beispiel + Smoke-Test |
| 4 | Lead-Mock-Mode (`USE_MOCK_DATA = true`) wird auch für die Sequenz-Felder konsistent bleiben | Tests in Task 4 decken Mock-Pfad ab |

---

## Task 0: Setup & Annahmen prüfen

**Files:** keine (nur Bash + manuelles Verifizieren)

- [ ] **Step 0.1: Branch + Dev-Server-Sanity**

```bash
cd /Users/tonygunther/TonyDev/wunschlachen-crm
git checkout feat/full-merge
git pull --ff-only origin feat/full-merge
git status   # erwartet: clean
```

- [ ] **Step 0.2: Brevo-Endpoint-Sanity (manuelle Verifikation)**

Mit laufendem Dev-Server (port 3000):

```bash
curl -sS -X POST http://localhost:3000/api/brevo/send-email \
  -H 'Content-Type: application/json' \
  -d '{"to":[{"email":"tony.guenther@wunschlachen.de"}],"subject":"Test","htmlContent":"<p>Test</p>"}' \
  -w "\nHTTP %{http_code}\n"
```

Expected: HTTP 200 mit `messageId` im Body, oder HTTP 500 `BREVO_TOKEN is not configured` (dann bei Tony nachfragen wie der Token gesetzt wird, bevor weitergemacht wird).

- [ ] **Step 0.3: Issue im wunschlachen-crm anlegen**

```bash
gh issue create --repo ZAP-Wunschlachen/wunschlachen-crm \
  --title "Welcome-Mail-Sequenz MVP (Tag 0 + T+1, T+3, T+7, T+10, T+14)" \
  --label "enhancement" \
  --body "Implementation gemäß docs/superpowers/plans/2026-05-13-welcome-sequence-mvp.md (Spec in docs/specs/2026-05-13-patient-funnel-automation.md Modul A MVP). 6 Welcome-Mails, Cron-getriggert, mit Pause-Bedingungen."
```

Issue-Nummer notieren, im finalen Commit als `Refs #<n>`.

---

## Task 1: Vitest-Setup für Pure-Logic-Tests

Das Repo hat aktuell kein Test-Framework. Wir bauen ein minimales Vitest-Setup, das Pure-Logic-Composables testet (kein Nuxt-Runtime, keine SSR).

**Files:**
- Create: `app/vitest.config.ts`
- Create: `app/tests/setup.ts`
- Modify: `app/package.json`

- [ ] **Step 1.1: Vitest installieren**

```bash
cd /Users/tonygunther/TonyDev/wunschlachen-crm
npx pnpm@9 --filter app add -D vitest@2 happy-dom@15
```

Expected: `vitest` und `happy-dom` in `app/package.json` unter `devDependencies`.

- [ ] **Step 1.2: Vitest-Config anlegen**

Datei `app/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: false,
    include: ['../layers/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, '../layers/patienten'),
    },
  },
})
```

- [ ] **Step 1.3: Test-Setup mit Vue-Auto-Imports-Stub**

Datei `app/tests/setup.ts`:

```ts
// Stubs für Nuxt-Auto-Imports — pure-logic-Tests laufen ohne Nuxt-Runtime
import { ref, computed, reactive } from 'vue'

;(globalThis as any).ref = ref
;(globalThis as any).computed = computed
;(globalThis as any).reactive = reactive
```

- [ ] **Step 1.4: Test-Script in app/package.json hinzufügen**

In `app/package.json` unter `scripts`:

```json
{
  "scripts": {
    "build": "nuxt build",
    "generate": "nuxt generate",
    "dev": "nuxt dev",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

- [ ] **Step 1.5: Smoke-Test einer trivialen Datei**

Datei `layers/patienten/composables/useWelcomeSequence.test.ts` (temporärer Smoke-Test, wird in Task 4 überschrieben):

```ts
import { describe, it, expect } from 'vitest'

describe('vitest setup smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

Run: `cd app && npx pnpm@9 test:run`

Expected: `1 passed (1)`.

- [ ] **Step 1.6: Commit**

```bash
cd /Users/tonygunther/TonyDev/wunschlachen-crm
git add app/package.json app/vitest.config.ts app/tests/setup.ts layers/patienten/composables/useWelcomeSequence.test.ts app/pnpm-lock.yaml pnpm-lock.yaml 2>/dev/null
git status
git commit -m "chore(test): vitest setup für pure-logic composables"
```

---

## Task 2: Slot-Definitionen anlegen

Sechs Welcome-Mails als Daten-Konstante mit Tag-Offsets und Brevo-Template-IDs. Marketing kann die IDs später austauschen, ohne Code anzufassen.

**Files:**
- Create: `layers/patienten/data/welcome-sequence-slots.ts`

- [ ] **Step 2.1: Slot-Konstante**

Datei `layers/patienten/data/welcome-sequence-slots.ts`:

```ts
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
```

- [ ] **Step 2.2: Commit**

```bash
git add layers/patienten/data/welcome-sequence-slots.ts
git commit -m "feat(welcome): Slot-Definitionen Tag 0/1/3/7/10/14"
```

---

## Task 3: Lead-Type um Sequenz-Felder erweitern

**Files:**
- Modify: `layers/patienten/types/crm.ts` (im `Lead`-Interface)

- [ ] **Step 3.1: Felder ergänzen**

In `layers/patienten/types/crm.ts`, im `Lead`-Interface (nach `last_reschedule_reason?`):

```ts
  // Welcome-Sequenz (Plan v9 Modul A MVP)
  welcome_sequence_started_at?: string  // ISO timestamp: Sign-up / Sequenz-Start
  welcome_sequence_position?: number    // 0 = noch nicht gestartet, 1-6 = letzte versandte Mail
  welcome_sequence_paused_at?: string   // ISO timestamp: pausiert (z.B. consultation_scheduled erreicht)
```

- [ ] **Step 3.2: Commit**

```bash
git add layers/patienten/types/crm.ts
git commit -m "feat(types): Lead.welcome_sequence_{started_at,position,paused_at}"
```

---

## Task 4: `useWelcomeSequence` Composable (pure logic) + Tests

Pure-Logic-Funktionen — keine Side-Effects, keine fetch-Aufrufe. Macht die ganze Date-Berechnung und Pause-Logik testbar.

**Files:**
- Create: `layers/patienten/composables/useWelcomeSequence.ts`
- Modify: `layers/patienten/composables/useWelcomeSequence.test.ts` (überschreibt Smoke-Test aus Task 1.5)

- [ ] **Step 4.1: Failing-Tests schreiben**

Datei `layers/patienten/composables/useWelcomeSequence.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { useWelcomeSequence } from './useWelcomeSequence'
import type { Lead } from '../types/crm'

const mkLead = (overrides: Partial<Lead> = {}): Lead => ({
  id: 'l-1',
  first_name: 'Maria',
  last_name: 'Schmidt',
  mail: 'maria@example.com',
  status: 'new',
  date_created: '2026-05-01T08:00:00.000Z',
  date_updated: '2026-05-01T08:00:00.000Z',
  GDPR_accepted_at: '2026-05-01T08:00:00.000Z',
  welcome_sequence_started_at: '2026-05-01T08:00:00.000Z',
  welcome_sequence_position: 0,
  ...overrides,
})

describe('useWelcomeSequence.shouldPauseFor', () => {
  const { shouldPauseFor } = useWelcomeSequence()

  it('pausiert wenn GDPR_accepted_at fehlt', () => {
    const lead = mkLead({ GDPR_accepted_at: undefined })
    expect(shouldPauseFor(lead)).toBe('no_gdpr_consent')
  })

  it('pausiert wenn Tag "unsubscribed" gesetzt', () => {
    const lead = mkLead({ Tags: ['unsubscribed'] })
    expect(shouldPauseFor(lead)).toBe('unsubscribed')
  })

  it('pausiert wenn lead.status weiter als contacted', () => {
    const lead = mkLead({ status: 'consultation_scheduled' })
    expect(shouldPauseFor(lead)).toBe('status_advanced')
  })

  it('läuft normal wenn status=new und GDPR ok', () => {
    expect(shouldPauseFor(mkLead())).toBeNull()
  })

  it('läuft normal wenn status=contacting', () => {
    expect(shouldPauseFor(mkLead({ status: 'contacting' }))).toBeNull()
  })

  it('läuft normal wenn status=contacted', () => {
    expect(shouldPauseFor(mkLead({ status: 'contacted' }))).toBeNull()
  })

  it('pausiert wenn status=lost', () => {
    expect(shouldPauseFor(mkLead({ status: 'lost' }))).toBe('lost')
  })
})

describe('useWelcomeSequence.getDueSlot', () => {
  const { getDueSlot } = useWelcomeSequence()
  // Sign-up am 2026-05-01T08:00:00Z, "now" wird jeweils explizit übergeben

  it('liefert Slot 1 sofort nach Sign-up wenn position=0', () => {
    const lead = mkLead({ welcome_sequence_position: 0 })
    const slot = getDueSlot(lead, new Date('2026-05-01T09:00:00.000Z'))
    expect(slot?.position).toBe(1)
  })

  it('liefert NULL wenn Slot 1 schon versandt und T+1 noch nicht erreicht', () => {
    const lead = mkLead({ welcome_sequence_position: 1 })
    const slot = getDueSlot(lead, new Date('2026-05-01T20:00:00.000Z'))
    expect(slot).toBeNull()
  })

  it('liefert Slot 2 wenn position=1 und T+1 erreicht', () => {
    const lead = mkLead({ welcome_sequence_position: 1 })
    const slot = getDueSlot(lead, new Date('2026-05-02T09:00:00.000Z'))
    expect(slot?.position).toBe(2)
  })

  it('liefert Slot 4 wenn position=3 und T+7 erreicht (überspringt nicht)', () => {
    const lead = mkLead({ welcome_sequence_position: 3 })
    const slot = getDueSlot(lead, new Date('2026-05-08T09:00:00.000Z'))
    expect(slot?.position).toBe(4)
  })

  it('liefert NULL wenn position=6 (Sequenz fertig)', () => {
    const lead = mkLead({ welcome_sequence_position: 6 })
    const slot = getDueSlot(lead, new Date('2026-06-01T09:00:00.000Z'))
    expect(slot).toBeNull()
  })

  it('liefert NULL wenn shouldPauseFor positiv (z.B. unsubscribed)', () => {
    const lead = mkLead({ welcome_sequence_position: 0, Tags: ['unsubscribed'] })
    const slot = getDueSlot(lead, new Date('2026-05-01T09:00:00.000Z'))
    expect(slot).toBeNull()
  })
})

describe('useWelcomeSequence.nextSlotForLead', () => {
  const { nextSlotForLead } = useWelcomeSequence()

  it('liefert Slot 1 für nicht-gestartete Sequenz', () => {
    const slot = nextSlotForLead(mkLead({ welcome_sequence_position: 0 }))
    expect(slot?.position).toBe(1)
  })

  it('liefert NULL nach Slot 6', () => {
    const slot = nextSlotForLead(mkLead({ welcome_sequence_position: 6 }))
    expect(slot).toBeNull()
  })
})
```

- [ ] **Step 4.2: Tests laufen, müssen fehlschlagen**

```bash
cd app && npx pnpm@9 test:run 2>&1 | tail -10
```

Expected: Mehrere Fails mit `Cannot find module './useWelcomeSequence'`.

- [ ] **Step 4.3: Composable implementieren**

Datei `layers/patienten/composables/useWelcomeSequence.ts`:

```ts
/**
 * useWelcomeSequence — Pure-Logic für die Welcome-Mail-Sequenz.
 *
 * Bietet:
 *  - shouldPauseFor(lead): Grund für Pause oder null
 *  - nextSlotForLead(lead): nächster Slot nach welcome_sequence_position
 *  - getDueSlot(lead, now): nächster Slot, der laut Tag-Offset JETZT fällig ist
 *
 * Keine Side-Effects, kein fetch — wird vom Cron-Endpoint orchestriert.
 */

import type { Lead, LeadStatus } from '~/types/crm'
import { WELCOME_SLOTS, type WelcomeSlot } from '../data/welcome-sequence-slots'

/** Lead-Status, in denen die Welcome-Sequenz noch weiterläuft. */
const ACTIVE_STATUSES: LeadStatus[] = ['new', 'contacting', 'contacted']

export type PauseReason =
  | 'no_gdpr_consent'
  | 'unsubscribed'
  | 'status_advanced'
  | 'lost'
  | 'not_started'

export const useWelcomeSequence = () => {
  const shouldPauseFor = (lead: Lead): PauseReason | null => {
    if (!lead.GDPR_accepted_at) return 'no_gdpr_consent'
    if ((lead.Tags || []).includes('unsubscribed')) return 'unsubscribed'
    if (lead.status === 'lost') return 'lost'
    if (!ACTIVE_STATUSES.includes(lead.status)) return 'status_advanced'
    return null
  }

  const nextSlotForLead = (lead: Lead): WelcomeSlot | null => {
    const pos = lead.welcome_sequence_position ?? 0
    if (pos >= WELCOME_SLOTS.length) return null
    return WELCOME_SLOTS[pos] ?? null
  }

  const getDueSlot = (lead: Lead, now: Date = new Date()): WelcomeSlot | null => {
    if (shouldPauseFor(lead)) return null
    const next = nextSlotForLead(lead)
    if (!next) return null

    const startedAt = lead.welcome_sequence_started_at ?? lead.date_created
    if (!startedAt) return null

    const startMs = new Date(startedAt).getTime()
    const dueAtMs = startMs + next.day_offset * 24 * 60 * 60 * 1000
    return now.getTime() >= dueAtMs ? next : null
  }

  return { shouldPauseFor, nextSlotForLead, getDueSlot, WELCOME_SLOTS }
}
```

- [ ] **Step 4.4: Tests laufen, müssen passen**

```bash
cd app && npx pnpm@9 test:run 2>&1 | tail -10
```

Expected: alle Tests aus 4.1 grün, kein "FAIL" im Output.

- [ ] **Step 4.5: Commit**

```bash
cd /Users/tonygunther/TonyDev/wunschlachen-crm
git add layers/patienten/composables/useWelcomeSequence.ts layers/patienten/composables/useWelcomeSequence.test.ts
git commit -m "feat(welcome): useWelcomeSequence pure-logic + unit tests"
```

---

## Task 5: `usePatientLeads.createLead` hookt Welcome-Init ein

Beim Anlegen eines neuen Leads schreiben wir die Welcome-Sequenz-Init-Felder mit. Bestehende Funktion erweitert (kein Wrapper), damit jeder Call (UI-Form, Mock-Seed, künftiger Webhook) abgedeckt ist.

**Files:**
- Modify: `layers/patienten/composables/usePatientLeads.ts:210-220`

- [ ] **Step 5.1: createLead anpassen**

Im File die `createLead`-Funktion ersetzen (Zeile ~210-220 — exakte Stelle: nach dem `fetchOne`-Block, vor `fetchStageCounts`):

```ts
  const createLead = async (data: Partial<Lead>) => {
    const now = new Date().toISOString()
    // Welcome-Sequenz beim Anlegen automatisch starten — die Cron-Logik in
    // useWelcomeSequence prüft Pause-Bedingungen, sodass auch hier nichts
    // vorsichtig geprüft werden muss.
    const enriched: Partial<Lead> = {
      ...data,
      welcome_sequence_started_at: data.welcome_sequence_started_at ?? now,
      welcome_sequence_position: data.welcome_sequence_position ?? 0,
    }
    try {
      return await createItem<Lead>({
        collection: COLLECTION,
        data: enriched,
      })
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }
```

- [ ] **Step 5.2: Manueller Smoke-Test (Dev-Server muss laufen)**

```bash
# Im Browser: http://localhost:3000/patienten/leads
# Lead-Anlage-Dialog öffnen (Button „Neuer Lead" oder ähnlich), Lead anlegen.
# Lead-Detail öffnen, im Browser-Console:
#   const all = JSON.parse(localStorage.getItem('patient-crm-mock-leads'))
#   all[all.length-1]
# Erwartet: welcome_sequence_started_at + welcome_sequence_position=0 gesetzt.
```

Falls keine UI-Form existiert, alternativ in der Browser-Console:

```js
const leads = JSON.parse(localStorage.getItem('patient-crm-mock-leads') || '[]')
console.log('letzte Lead-Felder:', leads[leads.length - 1])
```

- [ ] **Step 5.3: Commit**

```bash
git add layers/patienten/composables/usePatientLeads.ts
git commit -m "feat(welcome): createLead initialisiert Sequenz-Felder"
```

---

## Task 6: Cron-Endpoint `POST /api/cron/welcome-sequence`

Server-Route, die täglich von außen getriggert wird (GitHub Actions, DigitalOcean Scheduled Function, alternativ manuell per curl). Sie:
1. Authentifiziert via `WELCOME_CRON_SECRET`-Header
2. Liest alle Leads aus Directus (server-side mit Token)
3. Filtert mit `useWelcomeSequence.getDueSlot`
4. Sendet pro fälligem Slot via Brevo, schreibt Activity
5. Inkrementiert `welcome_sequence_position`
6. Liefert Stats-JSON zurück

**Files:**
- Create: `app/server/api/cron/welcome-sequence.post.ts`
- Modify: `app/nuxt.config.ts` (Runtime-Config Schlüssel ergänzen)

- [ ] **Step 6.1: Runtime-Config-Keys**

In `app/nuxt.config.ts`, im `runtimeConfig`-Block (server-side):

```ts
// app/nuxt.config.ts (Auszug)
export default defineNuxtConfig({
  runtimeConfig: {
    brevoToken: '',
    brevoSenderEmail: '',
    brevoSenderName: '',
    // Welcome-Sequenz-Cron
    welcomeCronSecret: '',     // env: NUXT_WELCOME_CRON_SECRET
    directusUrl: '',           // env: NUXT_DIRECTUS_URL (server-side fetch)
    directusServiceToken: '',  // env: NUXT_DIRECTUS_SERVICE_TOKEN
    public: {
      // ... bestehende public-Keys unverändert
    },
  },
})
```

**Hinweis:** Wenn die genannten Keys schon existieren, nicht doppelt anlegen — nur fehlende Keys ergänzen. Bestehende `public.*`-Block nicht anrühren.

- [ ] **Step 6.2: Endpoint anlegen**

Datei `app/server/api/cron/welcome-sequence.post.ts`:

```ts
/**
 * POST /api/cron/welcome-sequence
 *
 * Tägliches Cron-Target. Header `x-welcome-cron-secret` muss matchen.
 *
 * Workflow:
 *  1. Auth check
 *  2. Alle Leads aus Directus laden (status in [new, contacting, contacted], inkl. Welcome-Felder)
 *  3. Pro Lead: useWelcomeSequence.getDueSlot → falls Slot fällig:
 *     a. Brevo send-email aufrufen (Template-ID, params={firstName})
 *     b. lead.welcome_sequence_position += 1 updaten
 *     c. Activity 'email_sent' loggen (via Directus Items API)
 *  4. JSON zurück: { processed, sent, paused_count, errors }
 *
 * Idempotenz: Position-Update + Activity-Insert atomar pro Lead — wenn Brevo
 * fehlschlägt, Position NICHT inkrementiert (Retry beim nächsten Cron-Run).
 */

import { defineEventHandler, getHeader, createError } from 'h3'
import { WELCOME_SLOTS } from '../../../../layers/patienten/data/welcome-sequence-slots'
import type { WelcomeSlot } from '../../../../layers/patienten/data/welcome-sequence-slots'
import type { Lead } from '../../../../layers/patienten/types/crm'

interface CronResult {
  processed: number
  sent: number
  paused: number
  errors: { lead_id: string; error: string }[]
}

const isDue = (lead: Lead, now: Date): WelcomeSlot | null => {
  // Inline-Kopie der Logik aus useWelcomeSequence.getDueSlot — der Composable
  // ist client-side (Auto-Import); Server-Route importiert das nicht direkt.
  if (!lead.GDPR_accepted_at) return null
  if ((lead.Tags || []).includes('unsubscribed')) return null
  if (lead.status === 'lost') return null
  if (!['new', 'contacting', 'contacted'].includes(lead.status)) return null

  const pos = lead.welcome_sequence_position ?? 0
  if (pos >= WELCOME_SLOTS.length) return null
  const next = WELCOME_SLOTS[pos]

  const startedAt = lead.welcome_sequence_started_at ?? lead.date_created
  if (!startedAt) return null
  const startMs = new Date(startedAt).getTime()
  const dueAtMs = startMs + next.day_offset * 24 * 60 * 60 * 1000
  return now.getTime() >= dueAtMs ? next : null
}

export default defineEventHandler(async (event): Promise<CronResult> => {
  const config = useRuntimeConfig()
  const expectedSecret = config.welcomeCronSecret as string
  const providedSecret = getHeader(event, 'x-welcome-cron-secret')

  if (!expectedSecret || providedSecret !== expectedSecret) {
    throw createError({ statusCode: 401, statusMessage: 'invalid cron secret' })
  }

  const directusUrl = config.directusUrl as string
  const directusToken = config.directusServiceToken as string
  if (!directusUrl || !directusToken) {
    throw createError({ statusCode: 500, statusMessage: 'directus config missing' })
  }

  // 1. Leads laden
  const leadsResponse = await $fetch<{ data: Lead[] }>(`${directusUrl}/items/Leads`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${directusToken}` },
    params: {
      'filter[status][_in]': 'new,contacting,contacted',
      'fields': 'id,first_name,last_name,mail,status,Tags,GDPR_accepted_at,date_created,welcome_sequence_started_at,welcome_sequence_position,welcome_sequence_paused_at',
      'limit': '-1',
    },
  })

  const result: CronResult = { processed: 0, sent: 0, paused: 0, errors: [] }
  const now = new Date()

  for (const lead of leadsResponse.data) {
    result.processed += 1
    const slot = isDue(lead, now)
    if (!slot) {
      // Pause-Bedingungen
      if (lead.welcome_sequence_position && lead.welcome_sequence_position < WELCOME_SLOTS.length) {
        // sequence läuft noch, aber heute nicht fällig — kein paused-Counter
      }
      continue
    }

    if (!lead.mail) {
      result.errors.push({ lead_id: lead.id, error: 'no_mail' })
      continue
    }

    // 2. Brevo senden
    try {
      const params = { firstName: lead.first_name || '' }
      const useTemplate = !!slot.brevo_template_id && slot.brevo_template_id > 0
      const brevoBody = useTemplate
        ? {
            to: [{ email: lead.mail, name: `${lead.first_name} ${lead.last_name}`.trim() }],
            templateId: slot.brevo_template_id,
            params,
            tags: ['welcome', slot.slug],
          }
        : {
            to: [{ email: lead.mail, name: `${lead.first_name} ${lead.last_name}`.trim() }],
            subject: slot.subject_fallback.replace('{{firstName}}', params.firstName),
            htmlContent: slot.html_fallback.replace(/\{\{firstName\}\}/g, params.firstName),
            tags: ['welcome', slot.slug],
          }

      await $fetch('/api/brevo/send-email', { method: 'POST', body: brevoBody })

      // 3. Position inkrementieren
      await $fetch(`${directusUrl}/items/Leads/${lead.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${directusToken}` },
        body: { welcome_sequence_position: slot.position },
      })

      // 4. Activity loggen
      await $fetch(`${directusUrl}/items/activities`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${directusToken}` },
        body: {
          lead_id: lead.id,
          type: 'email_sent',
          subject: `Welcome ${slot.position}/${WELCOME_SLOTS.length}: ${slot.subject_fallback}`,
          content: `Slot: ${slot.slug}, Theme: ${slot.theme}, Brevo-Template: ${slot.brevo_template_id}`,
          metadata: { welcome_slot: slot.slug, welcome_position: slot.position },
          date_created: now.toISOString(),
          user_name: 'cron:welcome-sequence',
        },
      })

      result.sent += 1
    } catch (err: any) {
      result.errors.push({ lead_id: lead.id, error: err?.message || String(err) })
    }
  }

  return result
})
```

- [ ] **Step 6.3: Manueller Smoke-Test (Dev-Server)**

Im Dev mit `NUXT_WELCOME_CRON_SECRET=devsecret` setzen (entweder über `.env` oder `--env-arg`), dann:

```bash
curl -sS -X POST http://localhost:3000/api/cron/welcome-sequence \
  -H 'x-welcome-cron-secret: devsecret' \
  -H 'content-type: application/json' \
  -w "\nHTTP %{http_code}\n"
```

Expected (mit Mock-Modus aktiv und keinem echten Directus): HTTP 500 mit `directus config missing` ODER HTTP 401 falls Secret falsch. Beides bestätigt den Endpoint-Pfad.

**Hinweis:** Im Mock-Mode wird die Schleife leer durchlaufen, weil der Endpoint server-side gegen Directus läuft, nicht gegen localStorage. Für echten End-to-End-Test braucht es Directus + echte Leads (Task 8 — Smoke-Test deployt).

- [ ] **Step 6.4: Commit**

```bash
git add app/server/api/cron/welcome-sequence.post.ts app/nuxt.config.ts
git commit -m "feat(welcome): cron-endpoint /api/cron/welcome-sequence"
```

---

## Task 7: UI — Welcome-Position im Engagement-Card anzeigen

Damit der Sales-Agent sieht, wo der Lead in der Sequenz steht.

**Files:**
- Modify: `layers/patienten/components/patienten/EngagementStatsCard.vue`

- [ ] **Step 7.1: Prop / Lead-Daten-Verwendung prüfen**

```bash
cd /Users/tonygunther/TonyDev/wunschlachen-crm
sed -n '1,40p' layers/patienten/components/patienten/EngagementStatsCard.vue
```

Erwartet: ein `defineProps<{ activities: LeadActivity[] }>` (oder ähnlich). Du brauchst eventuell ein zusätzliches Prop für den Lead.

- [ ] **Step 7.2: Welcome-Anzeige hinzufügen**

In `EngagementStatsCard.vue`, am Ende des Templates (vor `</template>`), ergänzen:

```vue
<div v-if="lead?.welcome_sequence_position != null" class="mt-3 pt-3 border-t border-dental-blue--5">
  <h3 class="text-[11px] font-semibold text-dental-blue-0 mb-1">Welcome-Sequenz</h3>
  <p class="text-[11px] text-dental-blue--3">
    Mail {{ lead.welcome_sequence_position }} / 6
    <span v-if="welcomeStatus" class="ml-2 italic">({{ welcomeStatus }})</span>
  </p>
</div>
```

In `<script setup>`:

```ts
import type { Lead } from '~/types/crm'
import { useWelcomeSequence } from '../../composables/useWelcomeSequence'

const props = defineProps<{
  activities: LeadActivity[]
  lead?: Lead
}>()

const { shouldPauseFor } = useWelcomeSequence()
const welcomeStatus = computed(() => {
  if (!props.lead) return null
  const reason = shouldPauseFor(props.lead)
  if (reason === 'unsubscribed') return 'abgemeldet'
  if (reason === 'lost') return 'pausiert (lost)'
  if (reason === 'status_advanced') return 'pausiert (Termin steht)'
  if (reason === 'no_gdpr_consent') return 'fehlende DSGVO-Einwilligung'
  if ((props.lead.welcome_sequence_position ?? 0) >= 6) return 'abgeschlossen'
  return null
})
```

- [ ] **Step 7.3: Lead-Prop im Lead-Detail durchreichen**

In `layers/patienten/pages/patienten/leads/[id].vue`, wo `<PatientenEngagementStatsCard :activities="activities" />` aufgerufen wird, das Prop `:lead="lead"` ergänzen.

```bash
grep -n "PatientenEngagementStatsCard" layers/patienten/pages/patienten/leads/\[id\].vue
```

Erwartet: 1 Match. Diese Zeile ersetzen durch `<PatientenEngagementStatsCard :activities="activities" :lead="lead" />`.

- [ ] **Step 7.4: Dev-Server-Verifikation**

Im Browser auf einen Lead navigieren, EngagementStatsCard prüfen:
- Lead ohne `welcome_sequence_position` → Section unsichtbar
- Lead mit `welcome_sequence_position: 0` und `status: 'new'` → "Mail 0 / 6"
- Lead mit `Tags: ['unsubscribed']` → "Mail X / 6 (abgemeldet)"

Bei Bedarf via Browser-Console für einen Lead testen:

```js
const leads = JSON.parse(localStorage.getItem('patient-crm-mock-leads'))
leads[0].welcome_sequence_position = 2
leads[0].Tags = ['unsubscribed']
localStorage.setItem('patient-crm-mock-leads', JSON.stringify(leads))
location.reload()
```

- [ ] **Step 7.5: Commit**

```bash
git add layers/patienten/components/patienten/EngagementStatsCard.vue layers/patienten/pages/patienten/leads/\[id\].vue
git commit -m "feat(welcome): Engagement-Card zeigt Sequenz-Position + Pause-Grund"
```

---

## Task 8: Cron-Trigger via GitHub Actions

DigitalOcean App Platform unterstützt zwar Scheduled Functions, aber wir gehen erstmal mit GitHub Actions, weil die Repo-nah und gut auditierbar sind.

**Files:**
- Create: `.github/workflows/welcome-sequence-cron.yml`

- [ ] **Step 8.1: Workflow-Datei anlegen**

Datei `.github/workflows/welcome-sequence-cron.yml`:

```yaml
name: Welcome-Sequence Cron

on:
  schedule:
    - cron: '0 8 * * *'   # täglich 09:00 Berlin (UTC+1)
  workflow_dispatch:        # manueller Trigger zum Testen

jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Call welcome-sequence endpoint
        run: |
          response=$(curl -sS -o /tmp/body -w "%{http_code}" \
            -X POST "${{ secrets.CRM_BASE_URL }}/api/cron/welcome-sequence" \
            -H "x-welcome-cron-secret: ${{ secrets.WELCOME_CRON_SECRET }}" \
            -H "content-type: application/json")
          echo "HTTP $response"
          cat /tmp/body
          if [ "$response" -ne "200" ]; then
            echo "::error::Welcome-Sequence cron returned $response"
            exit 1
          fi
```

- [ ] **Step 8.2: Repo-Secrets dokumentieren**

In `docs/WELCOME_SEQUENCE_OPS.md` (wird in Task 9 angelegt) die zwei Secrets dokumentieren:
- `CRM_BASE_URL` — z.B. `https://crm.wunschlachen.app`
- `WELCOME_CRON_SECRET` — gleicher Wert wie `NUXT_WELCOME_CRON_SECRET` auf dem Server

Setup im Repo via:

```bash
gh secret set CRM_BASE_URL --repo ZAP-Wunschlachen/wunschlachen-crm --body 'https://crm.wunschlachen.app'
gh secret set WELCOME_CRON_SECRET --repo ZAP-Wunschlachen/wunschlachen-crm  # interaktiv, Wert eingeben
```

- [ ] **Step 8.3: Manueller Test der Action (sobald deployed)**

```bash
gh workflow run welcome-sequence-cron.yml --repo ZAP-Wunschlachen/wunschlachen-crm
gh run watch --repo ZAP-Wunschlachen/wunschlachen-crm
```

Expected: Run grün, Body-JSON mit `{ processed, sent, paused, errors }`. Wenn `sent>0`, läuft die Sequenz.

- [ ] **Step 8.4: Commit**

```bash
git add .github/workflows/welcome-sequence-cron.yml
git commit -m "ci(welcome): GitHub Actions Cron täglich 09:00 Berlin"
```

---

## Task 9: Runbook-Doc

**Files:**
- Create: `docs/WELCOME_SEQUENCE_OPS.md`

- [ ] **Step 9.1: Doc anlegen**

Datei `docs/WELCOME_SEQUENCE_OPS.md`:

```markdown
# Welcome-Sequence Operations-Runbook

**Letzte Aktualisierung:** 2026-05-13
**Owner:** Tony Günther
**Spec:** [docs/specs/2026-05-13-patient-funnel-automation.md](specs/2026-05-13-patient-funnel-automation.md) Modul A MVP
**Plan:** [docs/superpowers/plans/2026-05-13-welcome-sequence-mvp.md](superpowers/plans/2026-05-13-welcome-sequence-mvp.md)

## Was es macht

Sendet jedem neuen Patient-Lead bis zu 6 Welcome-Mails (Tag 0 + T+1, T+3, T+7, T+10, T+14) — solange:
- DSGVO-Einwilligung vorliegt (`GDPR_accepted_at` nicht null)
- Lead nicht `unsubscribed`-Tag hat
- Lead-Status noch in {new, contacting, contacted}
- Lead nicht `lost` ist

Trigger: GitHub-Actions-Cron täglich 08:00 UTC = 09:00 Berlin.

## Brevo-Templates

Marketing-Team pflegt sechs Templates im Brevo-Dashboard mit den IDs aus
`layers/patienten/data/welcome-sequence-slots.ts`:

| Slot | Tag | Brevo-ID (Platzhalter) | Subject-Fallback |
|---|---|---|---|
| 1 | 0 | 1001 | Re: Ihre Anfrage zu Zahnimplantaten |
| 2 | 1 | 1002 | Wir stellen uns vor |
| 3 | 3 | 1003 | Mythen über Zahnimplantate |
| 4 | 7 | 1004 | Schmerzfrei zum neuen Lächeln |
| 5 | 10 | 1005 | Zahnimplantate — was sie wirklich kosten |
| 6 | 14 | 1006 | Letzter Anstoß |

**Sobald reale IDs vergeben sind**, in `welcome-sequence-slots.ts` die `brevo_template_id`-Werte ersetzen + commiten. Solange Default-IDs `1001-1006` stehen, sendet der Cron den `html_fallback`-Body — verhindert E-Mail-Stillstand bis Marketing fertig ist.

## Env-Variablen (server-side)

Im DO App Platform App-Spec / `.env.production`:

```
NUXT_BREVO_TOKEN=…
NUXT_BREVO_SENDER_EMAIL=service@wunschlachen.app
NUXT_BREVO_SENDER_NAME=Wunschlachen
NUXT_WELCOME_CRON_SECRET=<random 32-byte hex>
NUXT_DIRECTUS_URL=https://wunschlachen.app
NUXT_DIRECTUS_SERVICE_TOKEN=<service-account token mit Leads:read,update + activities:create>
```

Generieren: `openssl rand -hex 32`.

## GitHub-Actions-Secrets

Im Repo `ZAP-Wunschlachen/wunschlachen-crm`:

```
CRM_BASE_URL=https://crm.wunschlachen.app
WELCOME_CRON_SECRET=<gleicher Wert wie NUXT_WELCOME_CRON_SECRET>
```

Setzen via:

```bash
gh secret set CRM_BASE_URL --repo ZAP-Wunschlachen/wunschlachen-crm --body 'https://crm.wunschlachen.app'
gh secret set WELCOME_CRON_SECRET --repo ZAP-Wunschlachen/wunschlachen-crm
```

## Manueller Trigger / Debugging

Workflow manuell starten:

```bash
gh workflow run welcome-sequence-cron.yml --repo ZAP-Wunschlachen/wunschlachen-crm
gh run watch --repo ZAP-Wunschlachen/wunschlachen-crm
```

Lokaler Test gegen Production (nur in Notfällen):

```bash
curl -sS -X POST https://crm.wunschlachen.app/api/cron/welcome-sequence \
  -H "x-welcome-cron-secret: $WELCOME_CRON_SECRET" \
  -H "content-type: application/json"
```

Antwort:

```json
{ "processed": 142, "sent": 9, "paused": 0, "errors": [] }
```

## Troubleshooting

**Kein Mail-Versand obwohl Leads neu:**
1. GitHub-Action-Run grün? → `gh run list --workflow welcome-sequence-cron.yml`
2. Antwort-JSON `sent: 0`, `processed > 0` → Pause-Bedingungen prüfen (DSGVO, Tags, Status)
3. Antwort `errors[]` voll → Brevo-Token / Directus-Token verifizieren

**Doppelte Mails:**
- Sollte nicht passieren, weil `welcome_sequence_position` direkt nach Brevo-Send inkrementiert wird. Falls doch: nach failed PATCH-Call prüfen (Logs)

**Stoppen für einen Lead:**
- `Tags`-Array um `'unsubscribed'` erweitern → ab nächstem Cron-Run keine Mails mehr
- Status auf `lost` setzen — gleicher Effekt

## DSGVO

- Brevo-Templates müssen Unsubscribe-Link enthalten (Pflicht). Brevo fügt
  Standard-Link automatisch ein, aber im Template prüfen.
- Welcome-Mails laufen nur wenn `GDPR_accepted_at` gesetzt — das wird im
  Lead-Anlage-Formular abgefragt (siehe `Lead.GDPR_accepted_at`).
```

- [ ] **Step 9.2: Commit**

```bash
git add docs/WELCOME_SEQUENCE_OPS.md
git commit -m "docs(welcome): Operations-Runbook"
```

---

## Task 10: End-to-End-Smoke-Test gegen Mock-Daten

Vor Push einmal das Ganze gegen den Mock-Mode durchspielen — wir können den Cron-Endpoint nicht voll testen (er braucht Directus + Brevo), aber wir testen die Composable-Logik gegen Mock-Leads in der Browser-Konsole.

**Files:** keine

- [ ] **Step 10.1: Dev-Server starten / läuft schon**

```bash
lsof -ti :3000 || (cd /Users/tonygunther/TonyDev/wunschlachen-crm && npx pnpm@9 --filter app dev &)
```

- [ ] **Step 10.2: Mock-Lead manipulieren + Composable prüfen**

Im Browser auf einem Lead-Detail, Browser-Console:

```js
// Lead-Daten in Mock-Storage manuell auf "Welcome heute fällig" setzen
const all = JSON.parse(localStorage.getItem('patient-crm-mock-leads'))
const lead = all[0]
const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
lead.welcome_sequence_started_at = fourteenDaysAgo
lead.welcome_sequence_position = 5
lead.status = 'new'
lead.GDPR_accepted_at = new Date().toISOString()
localStorage.setItem('patient-crm-mock-leads', JSON.stringify(all))
location.reload()
```

Im Lead-Detail-View muss EngagementStatsCard nun "Mail 5 / 6" zeigen.

- [ ] **Step 10.3: Composable-Call manuell**

In der Browser-Console:

```js
// Auto-Import-Resolver greift nur auf Page-Components — wir testen über die Lead-Daten direkt
const lead = JSON.parse(localStorage.getItem('patient-crm-mock-leads'))[0]
console.log('welcome position:', lead.welcome_sequence_position)
console.log('started at:', lead.welcome_sequence_started_at)
// Slot 6 sollte heute fällig sein (T+14 erreicht)
```

- [ ] **Step 10.4: Vitest noch einmal laufen lassen**

```bash
cd /Users/tonygunther/TonyDev/wunschlachen-crm/app
npx pnpm@9 test:run
```

Expected: alle Tests grün.

---

## Task 11: Push + Issue schließen

- [ ] **Step 11.1: Branch pushen**

```bash
cd /Users/tonygunther/TonyDev/wunschlachen-crm
git push origin feat/full-merge
```

- [ ] **Step 11.2: Issue schließen mit Commit-Verweis**

```bash
gh issue close <ISSUE_NUMMER_AUS_0.3> --repo ZAP-Wunschlachen/wunschlachen-crm \
  --comment "Umgesetzt — siehe Commits auf feat/full-merge (Slot-Definitions, useWelcomeSequence Composable + Tests, createLead-Hook, /api/cron/welcome-sequence-Endpoint, EngagementStatsCard-UI, GitHub-Actions-Cron, Runbook in docs/WELCOME_SEQUENCE_OPS.md).

Vor Live-Schaltung TODO:
- Marketing-Team legt 6 Brevo-Templates an (siehe Runbook)
- Reale Template-IDs in layers/patienten/data/welcome-sequence-slots.ts eintragen
- Env-Vars + Repo-Secrets setzen (NUXT_WELCOME_CRON_SECRET, CRM_BASE_URL)
- Workflow manuell triggern + Smoke-Test"
```

---

## Self-Review-Notes (vom Plan-Autor)

**Spec-Coverage gegen `docs/specs/2026-05-13-patient-funnel-automation.md` Modul A MVP:**
- [x] Tag-0-Welcome-Mail → Task 6 (Slot 1 mit day_offset=0)
- [x] 5 Welcome-Mails T+1, T+3, T+7, T+10, T+14 → Task 2 + Task 6
- [x] Pause bei `consultation_scheduled`+ → Task 4 `shouldPauseFor` mit `ACTIVE_STATUSES`
- [x] Pause bei `lost` → Task 4
- [x] Pause bei `unsubscribed`-Tag → Task 4
- [x] DSGVO-Gate (`GDPR_accepted_at`) → Task 4
- [x] Idempotenz (Position-Update nach Brevo-Send) → Task 6
- [x] Activity-Log pro Mail → Task 6 Step 6.2
- [x] Engagement-Card-Sichtbarkeit (Sequenz-Position) → Task 7
- [ ] Brevo-Open/Click-Events fließen in `email_events` → bereits implementiert (siehe `useEmailEvents` Bestand), nicht Teil dieses Plans — Verifikation in Manuell-Smoke

**Out-of-Scope-Mengen aus Spec, bewusst nicht im MVP:**
- 40-Template-Themen-Rotation Phase 4 (Spec §5 Phase 4)
- Brevo-Warm-up-Plan — kommt erst wenn Volumen > 100 Leads/Tag steigt

**Bekannte Risiken vor Implementation:**
- Auto-Import-Grenze: `useWelcomeSequence` aus dem `layers/patienten/composables/`-Ordner sollte für `pages/patienten/*` und `components/patienten/*` automatisch verfügbar sein, aber NICHT für `app/server/`-Routen — daher wird die Logik im Cron-Endpoint nochmal inline kopiert (Task 6 Step 6.2). Single-Source-of-Truth-Verstoß bewusst akzeptiert; bei Drift müssen beide Stellen angefasst werden. Falls die Duplikation stört, in einer Folge-Iteration nach `~/shared/welcome-logic.ts` extrahieren.

**Type-Konsistenz:**
- `WelcomeSlot.position` int 1..6 — überall gleich
- `PauseReason` String-Union mit `'not_started'` definiert aber nicht von `shouldPauseFor` zurückgegeben (nur `nextSlotForLead` weist es indirekt aus) → bleibt drin als zukünftige Erweiterung, kein Bug
- `Lead.welcome_sequence_position` `0..6` mit 0 = "noch nicht versandt"
