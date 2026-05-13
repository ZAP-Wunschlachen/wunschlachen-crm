# Appointment-Sync Operations-Runbook

**Letzte Aktualisierung:** 2026-05-13
**Owner:** Tony Günther
**Spec:** [docs/specs/2026-05-13-patient-funnel-automation.md](specs/2026-05-13-patient-funnel-automation.md) Modul C + D
**Plan:** [docs/superpowers/plans/2026-05-13-appointment-sync-mvp.md](superpowers/plans/2026-05-13-appointment-sync-mvp.md)

## Was es macht

Hält den Lead-Status im CRM automatisch synchron mit den Kalender-Terminen (Directus `appointments`-Collection). Zwei Wege:

1. **Browser-WebSocket** (`app/plugins/directus-realtime.client.ts`): wenn das CRM offen ist und ein Sales-Agent einen Lead anschaut, kommt jedes Appointment-Event live an, ruft den Sync-Endpoint mit `appointment_id` auf
2. **n8n-Cron alle 2 Min** (`[TONY] CRM Appointment-Sync alle 2 Minuten`): Safety-Net wenn niemand das CRM offen hat — verarbeitet alle in den letzten 10 Minuten geänderten Termine

Plus: 24h-Reminder-Cron sendet Mail an alle Patienten, deren Termin in 23-25h liegt und die noch nicht erschienen sind.

## Status-Mapping

| Event | Bedingung | Lead-Status |
|---|---|---|
| INSERT appointment | `treatment.category=beratung` | → `consultation_scheduled` + Bestätigungs-Mail |
| INSERT appointment | `treatment.category=behandlung` | → `treatment_scheduled` + Bestätigungs-Mail |
| UPDATE appointment | `arrival_date` gesetzt + Lead in `consultation_scheduled` | → `consultation_done` |
| UPDATE appointment | `arrival_date` gesetzt + Lead in `treatment_scheduled` | → `treatment_in_progress` |
| UPDATE appointment | `treatment_finished_date` gesetzt | → `completed` |
| DELETE | — | Activity „Termin storniert", kein Status-Wechsel |

## Patient-Lead-Matching

Hybrid:
1. **Primär:** `appointment.patient.email == lead.mail` (case-insensitive, trim)
2. **Sekundär:** `appointment.patient.patient_number == lead.patient_number` (nur Post-Visit-Leads)
3. **Backfill:** Match per Mail + Termin hat patient_number → diese Nummer wird auf den Lead geschrieben

Bestandspatienten ohne Lead (kein Match in beiden Wegen) werden stillschweigend ignoriert.

## CRM-Env-Variablen (DigitalOcean App Platform)

```
NUXT_APPOINTMENT_CRON_SECRET=<Hex-Wert aus ~/.claude/wunschlachen-credentials.md § n8n § CRM-Workflows>
NUXT_DIRECTUS_URL=https://wunschlachen.app
NUXT_DIRECTUS_SERVICE_TOKEN=<Lese-Zugriff Leads/appointments/activities, Schreib auf Leads + activities>
```

**Token-Permission-TODO:** Aktuell hat der Static-Token aus credentials.md HTTP 403 auf `treatments`-Collection. Solange das so ist, kann der Sync `treatment.name`/`treatment.category` nicht lesen und kann INSERT-Events nicht eindeutig nach Beratung vs. Behandlung klassifizieren. Lösung: Token-Permissions im Directus-Admin auf `treatments.read` erweitern. Bis dahin werden INSERT-Termine ohne `treatment`-Info nicht automatisch klassifiziert (Cron returns null/skip).

## n8n-Workflows

| Workflow | ID | Trigger | Endpoint |
|---|---|---|---|
| `[TONY] CRM Appointment-Sync alle 2 Minuten` | `dAXviHpQXzqCXYv4` | every 2 min | `POST /api/cron/appointment-sync` |
| `[TONY] CRM Appointment-Reminder täglich 08:30` | `v8Tiuovdmu3fhibh` | cron `30 6 * * *` (08:30 Berlin) | `POST /api/cron/appointment-reminder` |

**Aktivierung nach Production-Deploy:**

```bash
N8N_KEY=$(grep "API Key:" ~/.claude/wunschlachen-credentials.md | head -1 | sed 's/.*API Key:\*\* //')
for WF in dAXviHpQXzqCXYv4 v8Tiuovdmu3fhibh; do
  curl -sS -X POST "https://workflows.wunschlachen.de/api/v1/workflows/$WF/activate" \
    -H "X-N8N-API-KEY: $N8N_KEY" -w "\nHTTP %{http_code}\n"
done
```

Erwartet 2× HTTP 200.

## Manueller Trigger / Debugging

```bash
SECRET=<aus credentials.md>
curl -sS -X POST "https://crm.wunschlachen.app/api/cron/appointment-sync" \
  -H "x-appointment-cron-secret: $SECRET" \
  -H "content-type: application/json"
```

Antwort:
```json
{ "processed": 7, "status_changes": 2, "mails_sent": 2, "backfills": 1, "ignored_no_match": 4, "errors": [] }
```

`ignored_no_match` = Bestandspatienten-Termine (kein CRM-Lead), das ist normal.

## Brevo-Templates

| Slot | ID | Variablen |
|---|---|---|
| `appointment-confirmation-consultation` | 2001 | firstName, startDate, startTime, locationName |
| `appointment-confirmation-treatment` | 2002 | firstName, startDate, startTime, locationName |
| `appointment-reminder-24h` | 2003 | firstName, startDate, startTime, locationName |

Bis Marketing reale Templates anlegt, sendet der Endpoint die `html_fallback`-Bodies.

## Troubleshooting

**`ignored_no_match` immer hoch:**
- Sales-MA legt Leads ohne Mail an → Match scheitert. Mail-Pflichtfeld erzwingen.
- Patient nutzt bei der Kalender-Buchung eine andere Mail als bei der Lead-Anlage. Lösung: Backfill triggern indem patient_number manuell verknüpft wird (Lead-Detail UI).

**Doppelte Bestätigungs-Mails:**
- Sollte nicht passieren — `linked_appointment_id` markiert den Termin als verarbeitet. Falls doch: Idempotenz im Endpoint prüfen (PATCH läuft VOR Mail-Send).

**WebSocket disconnected:**
- Browser-Plugin verbindet automatisch neu (exponential backoff 1s → 30s). Live-Updates pausieren bis Reconnect; Cron-Safety-Net füllt die Lücke nach max. 2 Min.

**Reminder-Mail kommt nicht:**
- n8n-Execution-Log prüfen (`https://workflows.wunschlachen.de` → Workflow `v8Tiuovdmu3fhibh` → Executions)
- Patient-Mail leer / Lead-Status `completed|lost` → wird vom Endpoint ignoriert.

## DSGVO

- Nur Lead-zugeordnete Termine werden verarbeitet — Bestandspatienten-Daten fließen NICHT durchs CRM.
- Brevo-Mails enthalten Standard-Unsubscribe-Link.
- Activity-Log dokumentiert jeden Sync-Touch mit Zeitstempel und Match-Pfad.
