# Patient-Funnel-Automation — End-to-End Spec

**Datum:** 2026-05-13
**Autor:** Tony Günther
**Status:** Design (Brainstorming abgeschlossen, wartet auf Approval vor Plan-Skill)
**Branch-Ziel:** `feat/full-merge`
**Bezug:** [MIGRATION.md §B2C](../../MIGRATION.md), Plan v9 (HKP Phase E)

---

## 1. Ziel & Motivation

End-to-End-Automatisierung des Patient-Lead-Funnels von Sign-up bis Behandlungs-Abrechnung. Der Sales-Agent soll für *Beziehungsarbeit* zuständig sein (anrufen, beraten), nicht für *Pflege-Arbeit* (Status manuell setzen, Termine händisch synchronisieren, Mails händisch verschicken, zwischen Brevo/Kalender/Dampsoft wechseln).

**Primäre KPIs:**
- Speed-to-Lead < 5 min (von Sign-up bis erster Outbound-Touch)
- ≥ 80 % der Leads erhalten innerhalb 24 h einen Telefon-Kontakt-Versuch
- Termin-Show-Up-Rate > 70 %
- HKP-Signed → Behandlungs-Termin-Buchung < 7 Tage (heute teilweise > 30 Tage = verlorenes Geschäft)

**Sekundäre KPIs:**
- Brevo-Open-Rates / Click-Rates pro Email-Slot sichtbar im Lead-Detail (kein Tool-Switch)
- Final-Umsatz pro Lead-Source trackbar

## 2. Architektur-Überblick

Drei externe Systeme, eine gemeinsame Daten-Schicht (Directus), das CRM als Orchestrator:

```
        ┌──────────────────────────────────────────────┐
        │              Directus (Single SoT)            │
        │  Collections: leads, appointments, email_events│
        │  WebSocket-Channel für Realtime-Updates       │
        └────────┬──────────────────┬───────────────────┘
                 │                  │
   ┌─────────────▼──┐   ┌──────────▼─────────┐
   │ Kalender-App   │   │ wunschlachen-crm   │
   │ (booking UI)   │   │ (sales cockpit)    │
   └─────────┬──────┘   └────┬───────┬──────┬┘
             │ schreibt      │ liest │ ruft │ ruft
             │ appointments  │ alles │ Brevo│ CloudTalk
             │               │       │      │
             ▼               ▼       ▼      ▼
        ┌──────────────────────────────────────────┐
        │  Brevo (Email/SMS) · CloudTalk (Voice)   │
        │       Dampsoft (HKP, KEINE API)          │
        │                ↑                          │
        │   n8n-Workflow ─┘ pollt Email-Postbox    │
        │   für unterschriebene HKPs               │
        └──────────────────────────────────────────┘
```

**Kern-Design-Entscheidungen:**
- **Kalender und CRM teilen Directus.** Kein Webhook-Bridging. CRM subscribed auf `appointments`-Änderungen via Directus-WebSocket (`useSocket.ts` Pattern existiert schon im Kalender).
- **CRM ist der Mail-Sender.** Alle Brevo-Triggers (Welcome, Bestätigung, No-Show-Reschedule) laufen über das CRM, damit jede Mail im Activity-Log sichtbar ist. SMS für Termin-Erinnerung bleibt im Kalender (existierender Flow, nicht anfassen).
- **Email-Engagement wird live in den Lead-Detail gezogen** (`email_events` Mock-Store existiert bereits, Schema in `docs/EMAIL_EVENTS_SCHEMA.md`).
- **Dampsoft bleibt manueller Bottleneck**, mit n8n-Postfach-Hack als beste verfügbare Halbautomatisierung.

## 3. Sub-Projekte / Module

Sieben unabhängige Liefer-Pakete. **MVP-Schnitt: A + B + C + D** (markiert mit ⭐). E, F, G folgen direkt danach.

| Modul | Inhalt | Abhängig | Aufwand | MVP |
|---|---|---|---|---|
| A | Welcome-Mail-Sequenz (Dentaprime-Style, 6 Mo) | — | 5–7 T | ⭐ |
| B | Speed-to-Lead-Cockpit + Smart-Callback | A | 4–6 T | ⭐ |
| C | Kalender-Sync (Realtime Directus → Lead-Status) | — | 3–4 T | ⭐ |
| D | Termin-Bestätigungs-Mail + 24h-Reminder | C | 1–2 T | ⭐ |
| E | No-Show → Auto-Reschedule-Mail | C, A | 2 T |   |
| F | Dampsoft-Hack: HKP-Signed via n8n-Email-Postbox | — | 4–7 T |   |
| G | Behandlung-Done + Final-Umsatz-Eintragung | C | 2 T |   |

**Gesamtschätzung: 21–30 Tage solo.** MVP ist ~13–19 Tage.

---

### Modul A — Welcome-Mail-Sequenz (Dentaprime-Style) ⭐

**Ziel:** Sofortige Reaktion bei Sign-up + 6-Monats-Nurture mit 2–3 Mails/Woche, vollständig im Activity-Log sichtbar.

**Trigger-Logik:**
- **Tag 0 (sofort, < 60 s nach Sign-up):** Welcome-Mail mit Buchungs-CTA (anlog "Re: Ihre Anfrage zur Krankenkasse" bei Dentaprime)
- **Tag 1–14 — Welcome-Sequenz, 5 Mails:**
  - T+1: Vertrauen aufbauen ("Wir stellen uns vor", Team + Klinik)
  - T+3: Mythen-Aufklärung
  - T+7: Pain-Point / Schmerzfreiheit
  - T+10: Kosten / Finanzierung
  - T+14: Letzter Direkt-CTA "Buchen Sie heute"
- **Tag 15–180 — Steady-State 2–3×/Woche:** Themen-Rotation aus Cluster-Pool (siehe unten), Frequenz Mi (Content) + So (CTA), zusätzlich saisonale Specials (EM, Sommer, Weihnachten, Gewinnspiele)
- **Pause-Bedingungen:**
  - Lead-Status `consultation_scheduled` und weiter → Nurture-Mails pausiert (eigene Reihen)
  - Lead-Status `lost` → in Reactivation-Queue (existiert), keine Nurture-Mails
  - User klickt Unsubscribe (Brevo-Standard) → komplett aus

**Themen-Cluster (für ~40 Templates):**
1. Direct-Booking-CTA (10×)
2. Vertrauen / Team / Klinik (5×)
3. Mythen-Aufklärung (5×)
4. Pain-Point / Schmerzfreiheit (5×)
5. Kosten / Finanzierung (5×)
6. Lifestyle / Karriere / Selbstbewusstsein (5×)
7. Saison / Anlass / FOMO (5×)

**Komponenten (neu/erweitern):**
- `composables/usePatientWorkflows.ts` — vorhanden, vermutlich erweitern: Welcome-Trigger auf `lead.created`-Event aus Directus-Subscription
- `composables/useEmailTemplates.ts` — vorhanden, `category: 'welcome_sequence'` ergänzen
- Brevo-Templates: 40 neue Templates anlegen (Marketing-Aufgabe — Spec liefert nur die Slot-Definition, nicht den Content)
- `server/api/brevo/send-email.post.ts` — vorhanden, ggf. Cron-Endpoint für Steady-State-Slots
- `pages/patienten/leads/[id].vue` — Activity-Timeline zeigt bereits Mail-Events, ggf. Engagement-Card erweitern um Sequenz-Position ("Mail #12 von 40 versandt")

**Akzeptanzkriterien:**
- [ ] Bei neuem Lead-INSERT in Directus läuft binnen 60 s Welcome-Mail raus
- [ ] Aktivität "Welcome-Mail #1 versandt" landet in der Lead-Timeline
- [ ] Brevo-Open / Click / Bounce / Spam-Events fließen via Webhook in `email_events`, sind im Engagement-Card sichtbar
- [ ] Lead in `consultation_scheduled`+ erhält keine Nurture-Mails mehr
- [ ] Tag `unsubscribed` stoppt alle Sequenzen sofort
- [ ] Email-Cron läuft idempotent (kein doppeltes Senden bei Restart)

**Risiken:**
- Brevo-Rate-Limit / Domain-Reputation bei 40+ Templates × Leads-Volumen → schrittweise hochfahren, Warm-up-Plan
- Sales-Team-Frequenz-Klärung: 2–3×/Woche kann manche Leads abschrecken → A/B-Test gegen schlanke Variante einplanen

**Aufwand:** 5–7 Tage (Code) + ~2–3 Wochen Template-Content-Erstellung im Marketing-Team (parallel)

---

### Modul B — Speed-to-Lead-Cockpit + Smart-Callback-Rotation ⭐

**Ziel:** Sales-Agent sieht beim Login eine priorisierte Anrufliste. Bei nicht erreichten Leads schlägt das System automatisch einen neuen Zeitslot vor (variiert), lernt aus erfolgreichen Slots.

**Komponenten:**
- `composables/useSpeedToLead.ts` — vorhanden, Metriken-Output. Wird ergänzt um:
  - `getTopPriorityLeads(limit)` — sortiert nach Urgency-Score (existiert in `useNextBestAction`)
- `composables/useCallbackScheduler.ts` — **neu**
  - `scheduleRetry(lead, attempt)` — berechnet nächsten Slot aus Rotations-Schema
  - `recordOutcome(lead, slot, success)` — schreibt erfolgreichen Tageszeit-Slot in `lead.successful_call_window`
- `pages/patienten/leads/index.vue` — neue Sortier-Mode "Anruf-Schlange" (Filter "nicht erreicht, Wiedervorlage fällig"); existierende `urgencyRank`-Logik wiederverwenden

**Rotations-Schema (3-Slot-Strategie + Tag-Variation):**

| Versuch | Wann | Slot |
|---|---|---|
| 1 | Sofort nach Sign-up oder bei Re-Engagement | aktuelle Tageszeit |
| 2 | +2 h | anderer Tagesabschnitt (Morgen/Mittag/Abend) |
| 3 | +1 Tag | gleiche Uhrzeit, anderer Wochentag |
| Failover | nach 3 erfolglosen Anrufen | Auto-SMS + Auto-Email mit Buchungs-Link, dann +7 Tage Wiedervorlage |

**Lern-Komponente:**
- Bei erfolgreichem Anruf wird `lead.successful_call_window = 'morning' | 'midday' | 'evening'` gespeichert
- Bei Re-Engagement bevorzugt das System gelernte Slots
- Aggregat-Statistik: welche Wochentag/Tageszeit-Kombi konvertiert am besten (Dashboard für Manager)

**Activity-Log:**
- `type: 'call'` mit `outcome: 'no_contact' | 'successful'` und `metadata.call_slot: 'morning' | …`
- Schon vorhanden, nur konsequent nutzen

**Akzeptanzkriterien:**
- [ ] Sales-Dashboard zeigt Top-20-Leads nach Urgency
- [ ] Klick auf "Nicht erreicht" markiert Anruf + schedulet automatisch nächsten Slot
- [ ] Nach 3 erfolglosen Versuchen läuft Auto-SMS+Email + Wiedervorlage +7 Tage
- [ ] Erfolgreicher Anruf → `successful_call_window` gespeichert
- [ ] Manager-Dashboard zeigt Wochentag×Tageszeit-Heatmap (Conversion-Rate)

**Aufwand:** 4–6 T

---

### Modul C — Kalender-Sync (Realtime Directus → Lead-Status) ⭐

**Ziel:** Wenn ein Termin im Kalender gebucht wird (von Patient via Online-Buchung oder von MA manuell), reagiert das CRM automatisch: Lead-Status wechselt, Bestätigungs-Mail geht raus, Activity wird geloggt. Wenn der Termin stattfindet (`arrival_date`), Status weiter. Bei No-Show (`arrival_date == null && start_date_time < now()`) Auto-Trigger zu Modul E.

**Komponenten:**
- `composables/useAppointments.ts` — vorhanden, derzeit Mock-Modus. Auf echten Directus-Endpoint + WebSocket-Subscription umstellen.
- `plugins/directus-realtime.client.ts` — **neu** — startet Directus-WebSocket-Subscription (analog zum Kalender, sieh dort `useSocket.ts`)
- `composables/useAppointmentLeadSync.ts` — **neu** — Bridge: bei `appointments`-Events das passende Lead-Objekt updaten

**Mapping Appointment-Event → Lead-Status:**

| Directus-Event | Bedingung | Lead-Action |
|---|---|---|
| INSERT `appointments` | `treatment.name` matcht "Beratung" | `lead.status = consultation_scheduled` + Activity `meeting` + Mail (Modul D) |
| UPDATE `appointments` | `arrival_date != null` | `lead.status = consultation_done` (wenn vorher scheduled), Activity `meeting completed` |
| UPDATE `appointments` | `start_date_time < now() && arrival_date == null && status='consultation_scheduled'` | Trigger Modul E (No-Show-Reschedule) |
| UPDATE `appointments` | `treatment_finished_date != null` und `treatment.category = behandlung` | Trigger Modul G (Behandlung-Done) |
| INSERT `appointments` | `treatment.category = behandlung` | `lead.status = treatment_scheduled` + Mail |

**Daten-Match (entschieden 2026-05-13, korrigiert 2026-05-13):**
- **Reale Bedingung:** Leads haben **keine** `patient_number`, bis sie das erste Mal in der Praxis waren — die Nummer wird erst in Dampsoft bei Erst-Termin vergeben. Mail ist also der primäre Identifier für Pre-Visit-Leads.
- **Hybrid-Mapping mit Mail-Priorität:**
  1. **Primär**: `lead.mail === appointment.patient.email` (case-insensitive trim)
  2. **Sekundär**: `lead.patient_number === appointment.patient.patient_number` (nur falls Lead bereits eine Nummer hat → post-visit-Match)
- **Backfill-Logik**: bei Mail-Match und gleichzeitig vorhandener `appointment.patient.patient_number` schreibt das CRM die Nummer auf den Lead (`lead.patient_number := patient.patient_number`). Ab da ist der Lead auch per Nummer matchbar — robuster bei Folge-Terminen oder Mail-Änderung.
- **Bestandspatient ohne Lead → ignorieren** (kein Auto-Create-Stub). CRM kümmert sich nur um B2C-Funnel-Leads. Wenn ein Patient seit Jahren in Dampsoft ist und einen Wartungs-Termin bucht, taucht er nicht im CRM auf.
- Match-Logik in eigenem Composable `useAppointmentLeadMatch.ts` (testbar isoliert).

**Edge-Cases:**
- Termin wird verschoben (Update `start_date_time`) → keine Status-Änderung, nur Activity-Log "Termin verschoben"
- Termin wird gelöscht → Lead bleibt im aktuellen Status, Activity "Termin storniert"
- Mehrere offene Termine pro Lead → nur der jüngste triggert Status-Wechsel

**Sync-Modus (entschieden 2026-05-13):**
- **Directus-WebSocket-Subscription** als primärer Kanal (Pattern aus Kalender-`useSocket.ts` adaptieren).
- Reconnect-Logik mit exponential Backoff (1s, 2s, 4s, … max 30s).
- Auth via dasselbe Directus-Token wie HTTP-Calls.
- Server-side Re-Sync-Endpoint `POST /api/cron/appointment-resync` für verpasste Events (nicht als Default-Cron, nur manuell triggerbar — z.B. nach Server-Restart).

**Akzeptanzkriterien:**
- [ ] Buchung im Kalender erscheint binnen 5 s als Termin-Card im Lead-Detail
- [ ] Status wechselt automatisch nach Mapping
- [ ] WebSocket-Disconnect löst Reconnect aus, in der Zwischenzeit verpasste Events kommen via Resync-Endpoint nach
- [ ] Idempotenz: gleicher Event mehrfach verarbeitet → kein doppelter Status-Wechsel, kein doppeltes Mail
- [ ] Bestandspatient-Termine (kein matching Lead) werden stillschweigend ignoriert, kein Error-Log

**Aufwand:** 3–4 T

---

### Modul D — Termin-Bestätigungs-Mail + 24h-Reminder ⭐

**Ziel:** Sofortige Mail nach Buchung mit allen Termin-Infos + 24h-Reminder. SMS-Erinnerung läuft weiter über den Kalender (existiert).

**Trigger-Modus:**
- INSERT `appointments` mit Bedingung aus Modul C → Brevo Send mit Template `appointment_confirmation`
- Cron: täglich 09:00 für alle Termine `start_date_time = morgen` → Reminder-Mail

**Email-Slots:**
| Slot | Trigger | Brevo-Template |
|---|---|---|
| `appointment_confirmation` | sofort nach Buchung | Begrüßung + Termin-Daten + Anfahrt + Was mitbringen |
| `appointment_reminder_24h` | T-24h Cron | Erinnerung + Termin-Daten + Kontakt bei Fragen |

**Akzeptanzkriterien:**
- [ ] Confirmation-Mail kommt binnen 2 min nach Termin-INSERT
- [ ] Reminder-Mail läuft täglich 09:00 idempotent
- [ ] Bei Termin-Storno wird kein Reminder mehr gesendet (Cron-Filter)
- [ ] Activity-Log zeigt beide Touches

**Aufwand:** 1–2 T

---

### Modul E — No-Show → Auto-Reschedule-Mail

**Ziel:** Patient verpasst Termin, ohne abzusagen. System schickt nach 2h automatisch eine "Schade, schauen wir nochmal?"-Mail mit Self-Service-Buchungslink.

**Trigger-Logik:**
- Cron alle 30 min auf `appointments.start_date_time < now() - 2h && arrival_date IS NULL && status = consultation_scheduled`
- Brevo-Template `appointment_no_show_reschedule` mit Buchungs-Link
- Activity `type: 'no_show' + auto_reschedule_mail_sent: true`
- Lead-Status springt zurück auf `contacted` (existierende `useNoShowAction`-Logik)
- Sales-Agent sieht den Lead in der Anruf-Schlange (Modul B) für persönlichen Follow-up

**Akzeptanzkriterien:**
- [ ] No-Show wird binnen 30 min erkannt
- [ ] Auto-Mail geht raus + Activity geloggt
- [ ] Lead landet in der Anruf-Schlange wieder oben (high urgency)
- [ ] Beim nächsten Termin-Buchen durch den Patient läuft Modul C/D ganz normal

**Aufwand:** 2 T

---

### Modul F — Dampsoft-Hack: HKP-Signed via n8n-Email-Postbox

**Ziel:** Halbautomatischer Eingang von "HKP wurde unterschrieben"-Info aus Dampsoft. Praxis-Team schickt unterschriebenen HKP an Email-Adresse, n8n parsed + matcht + setzt Lead auf `hkp_signed`.

**Architektur:**

```
Praxis-Team scannt HKP
        │
        ▼
hkp-signed@wunschlachen.app  ──► n8n-Workflow
                                  │
                                  ├─ Attachment + Subject parsen
                                  ├─ Patient-Number aus Subject/Filename (Regex: P-12345 oder "Patient 12345")
                                  ├─ Match gegen Directus leads + appointments (per patient_number)
                                  ├─ Wenn Match: POST /api/leads/:id/hkp-signed
                                  └─ Wenn No-Match: Email-Alert an Sales-Team mit Bild + Patient-Suche-Link
                                  
CRM-Endpoint (server/api/leads/[id]/hkp-signed.post.ts) — neu
  ├─ Status: hkp_sent → hkp_signed
  ├─ HKP-PDF in Directus-Files speichern, an Lead verknüpfen
  ├─ Activity „HKP unterschrieben eingegangen" mit Attachment
  ├─ Trigger: Modul-B-Anruf-Schlange aktivieren (Behandlungs-Termin vereinbaren!)
  └─ Auto-Email an Patient: „HKP-Eingang bestätigt, wir melden uns für Behandlungstermin"
```

**Komponenten:**
- n8n-Workflow (außerhalb des Repos, Doc als `docs/N8N_HKP_INGEST.md`)
- `server/api/leads/[id]/hkp-signed.post.ts` — **neu** im CRM
- `composables/usePatientLeads.ts` — `markHkpSigned(leadId, pdfFileId)` Methode
- `composables/useLeadStatusTransitions.ts` — `hkp_sent → hkp_signed` ist bereits erlaubt

**Risiken:**
- Regex-Match auf Patient-Number schlägt fehl → Fallback Mail an Sales-Team mit "manuelles Zuordnen"-Link
- Mehrere unterschriebene HKPs im selben Anhang → n8n splittet PDF-Pages, jeder als eigener Event
- Privacy: PDF mit Patient-Daten geht durch n8n → Hosting & Lösch-Policy klären (n8n self-hosted, < 30 Tage Aufbewahrung)

**Akzeptanzkriterien:**
- [ ] n8n-Workflow läuft auf `n8n.wunschlachen.app` (Self-Hosted)
- [ ] Eingang einer HKP-Email an `hkp-signed@…` → binnen 5 min Lead-Status `hkp_signed`
- [ ] PDF ist im Lead-Detail abrufbar (Directus-File-Link)
- [ ] Bei No-Match: Email an Sales-Team mit Zuordnungs-Link
- [ ] Privacy-Doc / DSGVO-Vermerk in `docs/N8N_HKP_INGEST.md`

**Aufwand:** 4–7 T (n8n-Setup + CRM-Endpoint + Edge-Case-Handling)

---

### Modul G — Behandlung-Done + Final-Umsatz-Eintragung

**Ziel:** Wenn `treatment_finished_date` im Kalender gesetzt wird, springt Lead auf `completed`. Sales-Agent (oder Praxis-MA) trägt den **final abgerechneten Umsatz** ein.

**Komponenten:**
- Modul C triggert bei `treatment_finished_date != null`: `lead.status = completed`
- Lead-Detail UI: Banner "Behandlung abgeschlossen — bitte Umsatz eintragen" wenn `revenue == null && status == 'completed'`
- Input-Feld `revenue` in `Lead` Type existiert bereits
- Notification an Sales-Manager wenn 14 Tage nach `completed` kein `revenue` eingetragen

**Akzeptanzkriterien:**
- [ ] Bei Kalender-Update `treatment_finished_date` → Lead `completed`, Activity „Behandlung abgeschlossen"
- [ ] Lead-Detail zeigt Banner mit Umsatz-Input
- [ ] Manager-Dashboard zeigt durchschnittlicher Umsatz pro Lead-Source
- [ ] Reminder 14 Tage nach `completed` ohne Revenue: Slack/Mail an Sales-Team

**Aufwand:** 2 T

---

## 4. Übergreifende Themen

### Daten-Modell-Ergänzungen (Directus)

Neue/erweiterte Felder auf `leads`:
- `welcome_sequence_position: number` — wo in der 40er-Mail-Sequenz steht der Lead
- `welcome_sequence_paused_at: timestamp` — wann pausiert (z.B. bei status `consultation_scheduled`)
- `successful_call_window: 'morning' | 'midday' | 'evening' | null`
- `last_call_attempt_at: timestamp`
- `call_attempt_count: number`
- `revenue: number` (existiert vermutlich, prüfen)

Neue Activity-Types (bereits angelegt in Iter2 Lost/Reschedule): keine zusätzlichen nötig — bestehende `email_sent / call / meeting / stage_change / reschedule / lost_rollback` reichen.

### Sicherheit & DSGVO

- Brevo-Unsubscribe-Link in **jedem** Marketing-Mail (Pflicht)
- Welcome-Mail mit `GDPR_accepted_at`-Check: wenn `null`, keine Mail (Lead hat nicht eingewilligt)
- n8n-HKP-Anhänge max. 30 Tage in n8n-Storage, dann gelöscht
- Brevo-Webhook-Endpoints HMAC-validiert (`server/api/brevo/webhook.post.ts`)
- Audit-Log für alle Status-Wechsel ist da (Activity `stage_change`)

### Idempotenz & Resilienz

- Welcome-Sequenz-Trigger: `welcome_sequence_position` als Watermark, niemals rückwärts
- Mail-Send: dedupe via `lead_id + template_id + scheduled_at` Composite-Key in `email_events`
- WebSocket-Reconnect mit Fallback-Polling alle 60 s
- n8n hat Retry + Error-Branch eingebaut

### Mess- & Beobachtbarkeit

- **CRM-Dashboard-Widgets (neu im `/dashboard`):**
  - Speed-to-Lead-Heatmap (gibt's, aufpolieren)
  - Welcome-Sequenz-Funnel (versandt / geöffnet / geklickt / Buchung)
  - Termin-Show-Up-Rate pro Lead-Source
  - Umsatz pro Lead-Source × Monat
- **Brevo-Events** sind via `email_events` schon im Lead-Detail sichtbar (Engagement-Card)

## 5. MVP-Schnitt & Reihenfolge

| Phase | Module | Dauer | Liefer-Wert |
|---|---|---|---|
| 1 | A (Welcome + 14-Tage-Sequenz, nicht alle 40) | 3 T | Lead bekommt direkt Touch + Vertrauens-Aufbau |
| 2 | C + D | 4 T | Termin-Buchung → CRM-Status automatisch + Bestätigungs-Mail |
| 3 | B | 5 T | Sales-Cockpit mit Smart-Callback |
| 4 | A (Steady-State 6 Mo + Specials) | 3 T | Volle Nurture-Sequenz |
| 5 | E | 2 T | No-Show-Recovery |
| 6 | G | 2 T | Umsatz-Tracking |
| 7 | F | 5 T | Dampsoft-Hack |

**MVP-Definition:** Phasen 1–3 (= Modul A-Welcome + B + C + D) liefern den größten Sales-Effekt und bringen den Sales-Agent in eine vollständig CRM-zentrische Workflow-Welt.

## 6. Offene Risiken & Annahmen

1. **Directus-WebSocket auf der Kalender-Instanz aktiviert?** Annahme: ja, weil Kalender-App `useSocket.ts` nutzt. Bei Phase 2 verifizieren.
2. **Welche Directus-Instanz?** Annahme: `wunschlachen.app` (laut Memory `reference_directus_mcp.md`). Bei Phase 2 testen, dass beide Apps gegen dieselbe Instanz laufen.
3. **`patient_number`-Mapping zwischen Lead und Kalender-Patient.** Existiert in `Lead` und `Patient` — Konsistenz prüfen, ggf. Migration.
4. **Brevo-Domain-Reputation** verträgt 40 Templates × Lead-Volumen. Bei Risiko Warm-up-Plan (5 → 10 → 25 → 40 Mails parallel).
5. **n8n-Hosting** muss vorab geklärt sein (DigitalOcean Droplet oder n8n.cloud). Self-Hosted präferiert wegen Patient-Daten.
6. **Dampsoft-Praxis-IT-Cooperation** für die HKP-Email-Postbox-Lösung. Annahme: ein Praxis-MA scannt + sendet (kein Software-seitiger Hook).

## 7. Out-of-Scope (explizit)

- Voice-AI für vollautomatische Anrufe (stub vorhanden, bewusst nicht im MVP)
- Multi-Channel-Cadence-Optimization mit ML (out)
- Patient-Self-Service-Portal mit Login (out — Patient bekommt nur Buchungs-Links)
- B2B-Pflegeheim-Funnel — gleicher Pattern denkbar aber eigenes Spec

## 8. Verweise

- [MIGRATION.md](../../MIGRATION.md) — Repo-Migration Plan v6
- [EMAIL_EVENTS_SCHEMA.md](../EMAIL_EVENTS_SCHEMA.md) — Brevo-Event-Datenmodell
- [EMAIL_TEMPLATES_SCHEMA.md](../EMAIL_TEMPLATES_SCHEMA.md) — Template-Struktur
- [CLOUDTALK_SETUP.md](../CLOUDTALK_SETUP.md) — Voice-Stack
- Kalender-Repo: https://github.com/ZAP-Wunschlachen/Kalender (Branch `live`)
- Dentaprime-Email-Referenz: lokal in `/tmp/dentaprime-emails/` (38 Mails, Mai–Okt 2024)

---

**Approval-Checkliste vor Implementation:**
- [ ] User reviewed dieses Spec
- [ ] Module-Reihenfolge bestätigt
- [ ] Template-Content-Ownership im Marketing-Team geklärt (40 Brevo-Templates)
- [ ] n8n-Hosting entschieden
- [ ] Brevo-Warm-up-Plan bestätigt
