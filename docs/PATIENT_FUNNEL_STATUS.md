# Patient-Funnel Automation — Status

**Stand:** 2026-05-13
**Branch:** `feat/full-merge`
**Spec:** [docs/specs/2026-05-13-patient-funnel-automation.md](specs/2026-05-13-patient-funnel-automation.md)

## Module-Übersicht

| Modul | Inhalt | Status | Issue | Plan-Doc |
|---|---|---|---|---|
| **A** | Welcome-Mail-Sequenz Tag 0–14 (6 Mails) + Settings-UI + 54 Marketing-Templates | ✅ Code fertig | #20, #21 | `superpowers/plans/2026-05-13-welcome-sequence-mvp.md` |
| **B** | Speed-to-Lead + Smart-Callback-Rotation + Anruf-Schlangen-Sortierung | ✅ Code fertig | #23 | `superpowers/plans/2026-05-13-speed-to-lead-mvp.md` |
| **C** | Kalender-Sync (Directus-WebSocket + Cron-Safety-Net + Hybrid-Mapping + Backfill) | ✅ Code fertig | #22 | `superpowers/plans/2026-05-13-appointment-sync-mvp.md` |
| **D** | Termin-Bestätigungs-Mail + 24h-Reminder | ✅ Code fertig | #22 | (gleicher Plan wie C) |
| **E** | No-Show → Auto-Reschedule-Mail | ✅ Code fertig | #24 | `superpowers/plans/2026-05-13-noshow-revenue-mvp.md` |
| **F** | Dampsoft-HKP-Postbox via n8n-Webhook | ✅ Code fertig | #25 | `superpowers/plans/2026-05-13-dampsoft-hkp-mvp.md` |
| **G** | Behandlung-Done + Final-Umsatz-Banner + 14d-Reminder | ✅ Code fertig | #24 | (gleicher Plan wie E) |

## Liefer-Stand Repository

**55 automatisierte Tests grün** (Vitest):
- 15 Welcome-Sequence (Pause-Logik + Slot-Berechnung)
- 9 Appointment-Lead-Match (Hybrid Mail-primary + Backfill)
- 7 Appointment-Lead-Sync (Event→Action)
- 14 Callback-Scheduler (Rotation + UrgencyScore)
- 10 HKP-Extract (Regex-Patterns)

**Build erfolgreich** — Nuxt 3.20 + Nitro 2.13. Alle 6 neuen API-Routen kompiliert (Σ 494 kB gzipped).

**Auth-Smokes** auf allen Endpoints HTTP 401 mit falschem Secret:
- `/api/cron/welcome-sequence`
- `/api/cron/appointment-sync`
- `/api/cron/appointment-reminder`
- `/api/cron/no-show-reschedule`
- `/api/cron/revenue-reminder`
- `/api/leads/match-and-attach-hkp`

## n8n-Workflows (alle deaktiviert, bereit für Aktivierung)

| Workflow | ID | Trigger | Endpoint |
|---|---|---|---|
| Welcome-Sequence (Migration TBD) | — (GitHub-Action aktiv) | täglich | `/api/cron/welcome-sequence` |
| Appointment-Sync | `dAXviHpQXzqCXYv4` | alle 2 Min | `/api/cron/appointment-sync` |
| Appointment-Reminder | `v8Tiuovdmu3fhibh` | 08:30 Berlin | `/api/cron/appointment-reminder` |
| No-Show-Reschedule | `rx5wz7ln9t44yjji` | alle 30 Min | `/api/cron/no-show-reschedule` |
| Revenue-Reminder | `2akRAQi8K4qtt8FJ` | 09:00 Berlin | `/api/cron/revenue-reminder` |
| HKP-Postbox-Inbound | `XkNlJ0Wowqh4rfzc` | Webhook | `/api/leads/match-and-attach-hkp` |

Workflow-IDs + Secrets in `~/.claude/wunschlachen-credentials.md` § n8n § CRM-Workflows.

## Vor Live-Schaltung TODO (Operations-Team)

### 1. Directus-Schema-Migration

Auf der `Leads`-Collection folgende Spalten anlegen (im Directus-Admin):

```
welcome_sequence_started_at     timestamp
welcome_sequence_position       integer
welcome_sequence_paused_at      timestamp
patient_number                  string
linked_appointment_id           uuid
last_appointment_synced_at      timestamp
successful_call_window          string  (enum: morning, midday, evening)
last_call_attempt_at            timestamp
call_attempt_count              integer
next_call_slot_at               timestamp
hkp_signed_pdf_id               uuid    (FK → directus_files)
hkp_signed_received_at          timestamp
```

Auf der `activities`-Collection: `type` muss zusätzlich `reschedule`, `lost_rollback`, `hkp_ingest` als gültige Werte akzeptieren.

### 2. Directus-Token-Permissions erweitern

Der aktuelle Static-Token aus `~/.claude/wunschlachen-credentials.md` hat HTTP 403 auf `treatments`. Erweitern auf:
- `Leads`: read + create + update (alle neuen Felder)
- `activities`: read + create
- `appointments`: read (inkl. `treatment.*` und `patient.*`)
- `treatments`: read (mind. `name` + `category`)
- `directus_files`: create + read (für HKP-PDF-Upload)

### 3. Env-Variablen auf DigitalOcean App Platform

App `crm.wunschlachen.app` (ID `f049bfa9-f4ae-451f-b411-d02e4eb0d56f`) Component-Env:

```bash
NUXT_BREVO_TOKEN=xkeysib-...                                            # bereits in credentials.md
NUXT_BREVO_SENDER_EMAIL=info@wunschlachen.de
NUXT_BREVO_SENDER_NAME=Wunschlachen
NUXT_DIRECTUS_URL=https://wunschlachen.app
NUXT_DIRECTUS_SERVICE_TOKEN=<mit erweiterten Permissions aus Step 2>
NUXT_WELCOME_CRON_SECRET=<neuer Hex; siehe docs/WELCOME_SEQUENCE_OPS.md>
NUXT_APPOINTMENT_CRON_SECRET=ddf08e0868942dda34b05adb1aa1a0191102ee208ec43de09f7b872779b3adbe
NUXT_HKP_INGEST_SECRET=<aus credentials.md § n8n § CRM-Workflows>
```

### 4. n8n-Workflows aktivieren

Nach Production-Deploy:

```bash
N8N_KEY=$(grep "API Key:" ~/.claude/wunschlachen-credentials.md | head -1 | sed 's/.*API Key:\*\* //')
for WF in dAXviHpQXzqCXYv4 v8Tiuovdmu3fhibh rx5wz7ln9t44yjji 2akRAQi8K4qtt8FJ XkNlJ0Wowqh4rfzc; do
  curl -sS -X POST "https://workflows.wunschlachen.de/api/v1/workflows/$WF/activate" \
    -H "X-N8N-API-KEY: $N8N_KEY" -w "\nHTTP %{http_code}\n"
done
```

Erwartet 5× HTTP 200.

### 5. Brevo-Templates anlegen

Marketing-Team trägt im Brevo-Dashboard echte Templates mit folgenden IDs ein:

| ID | Inhalt | Quelle |
|---|---|---|
| 1001–1006 | Welcome-Sequenz Tag 0/1/3/7/10/14 | `docs/marketing/email-sequence-plan.md` § Welcome |
| 2001 | Appointment Consultation Confirmation | `docs/marketing/email-sequence-plan.md` § Termin-Trigger |
| 2002 | Appointment Treatment Confirmation | dito |
| 2003 | 24h Reminder | dito |
| 2010 | No-Show Reschedule Mail | dito |

Bis Templates angelegt sind, sendet das CRM die `html_fallback`-Bodies aus den `*-slots.ts`-Dateien — kein E-Mail-Stillstand.

### 6. n8n HKP-Postbox-Inbound konfigurieren

Workflow `XkNlJ0Wowqh4rfzc` nutzt aktuell Webhook-Trigger (URL: `https://workflows.wunschlachen.de/webhook/hkp-postbox-inbound`). Praxis-IT-Team verbindet die Inbox (z.B. `hkp@wunschlachen.app`) mit n8n via IMAP — oder erweitert den Workflow um einen Email-Trigger-Node der Anhänge an den Webhook weiterleitet.

### 7. WebSocket-URL für CRM-Client

`directus-realtime.client.ts` braucht `config.public.directusUrl`. Aktuell nicht im public-Block der `nuxt.config.ts` — Plugin skippt stumm. Hinzufügen für Live-UX:

```ts
public: {
  // ...
  directusUrl: 'https://wunschlachen.app',
}
```

Solange das fehlt, ist der Cron alle 2 Min der einzige Sync-Pfad — funktional vollständig, aber 2-min-Latenz statt sub-Sekunde.

## Reference

- Live-CRM: `crm.wunschlachen.app` (DigitalOcean App `f049bfa9-f4ae-451f-b411-d02e4eb0d56f`)
- n8n: `https://workflows.wunschlachen.de`
- Directus: `https://wunschlachen.app`
- Kalender-Repo: `ZAP-Wunschlachen/Kalender` (Branch `live`) — gleiche Directus-Instanz
- Marketing-Konzept: `docs/marketing/email-sequence-plan.md` (54 Templates)
- Runbooks:
  - `docs/WELCOME_SEQUENCE_OPS.md`
  - `docs/APPOINTMENT_SYNC_OPS.md`
  - `docs/HKP_INGEST_OPS.md`
