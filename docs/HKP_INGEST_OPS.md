# HKP-Ingest Operations Runbook

**Modul F — Dampsoft-HKP-Signed via n8n-Webhook-Postbox**
Stand: 2026-05-13 | Plan v9 Modul F MVP

---

## Was es macht

Praxis-MA scannt den unterschriebenen HKP aus Dampsoft und mailt die PDF an eine dedizierte Postbox.
n8n empfängt die Mail (oder direkt via Webhook), extrahiert die Patienten-Nummer aus Subject/Filename,
und ruft den CRM-Endpoint `POST /api/leads/match-and-attach-hkp` auf. Der Endpoint:

1. Matcht den Lead via `patient_number` (primär) oder `sender_email` (Fallback)
2. Prüft ob Lead im Status `hkp_sent` ist
3. Lädt die PDF in Directus-Files hoch
4. Patcht den Lead auf Status `hkp_signed` + speichert File-ID + Timestamp
5. Legt Activity `hkp_ingest` an
6. Sendet Bestätigungs-Mail an Patienten (non-fatal — schlägt der Brevo-Call fehl, wird der HKP trotzdem verarbeitet)

---

## Inbox-Adresse

**TBD vom Praxis-IT-Team konfigurieren.**

MVP-Plan nutzt Webhook statt IMAP-Trigger. Für Phase 2 (IMAP):
- Postfach anlegen: `hkp-signed@wunschlachen.app`
- Zugangsdaten in n8n als IMAP-Credential hinterlegen (Workflow-Node austauschen)

**MVP Webhook-URL:**
```
https://workflows.wunschlachen.de/webhook/hkp-postbox-inbound
```
n8n muss dafür aktiviert sein. POST mit JSON-Body:
```json
{
  "subject": "HKP P-12345 Müller",
  "filename": "HKP_12345_Mueller.pdf",
  "sender": "praxis@beispiel.de",
  "pdf_base64": "<base64-encoded PDF>"
}
```

---

## n8n Workflow

- **Name:** `[TONY] CRM HKP-Postbox Inbound`
- **Workflow-ID:** `XkNlJ0Wowqh4rfzc`
- **Status:** deaktiviert (IMAP-Trigger + Aktivierung in Phase 2)
- **Trigger:** Webhook POST auf `/hkp-postbox-inbound`
- **Aktivieren:** `curl -X POST "https://workflows.wunschlachen.de/api/v1/workflows/XkNlJ0Wowqh4rfzc/activate" -H "X-N8N-API-KEY: <key>"`

---

## HKP-Ingest-Secret

Secret liegt in `~/.claude/wunschlachen-credentials.md` § n8n § CRM-Workflows, Key `HKP_INGEST_SECRET`.

Im CRM-Deployment (DO App Platform) als Env-Variable setzen:
```
NUXT_HKP_INGEST_SECRET=<wert aus credentials.md>
```

---

## Vor-Live-Checkliste

1. `NUXT_HKP_INGEST_SECRET` auf DO App Platform für die CRM-App setzen
2. n8n-Workflow IMAP-Trigger konfigurieren ODER Inbound-Webhook-URL an Praxis-IT weitergeben
3. Workflow aktivieren (erst nach CRM-Deployment!)
4. Test-Mail an Postbox senden mit bekannter Patienten-Nummer → Lead muss auf `hkp_signed` springen

---

## Troubleshooting

### `status: 'no_match'` — Patient-Number nicht erkannt

**Ursache:** Kein Match für `patient_number` und `sender_email` im System.

**Debug-Schritte:**
1. Subject und Filename prüfen — Patienten-Nummer muss >= 4 Stellen haben
2. Unterstützte Formate: `P-12345`, `P 12345`, `Patient 12345`, reine Ziffernfolge `12345`
3. Mit dem `extractPatientNumber`-Composable testen: `useHkpExtract().extractPatientNumber(subject, filename)`
4. Sender-Mail prüfen: muss exakt mit `Lead.mail` übereinstimmen (case-insensitive)

**Sofortmaßnahme:** Manueller Upload über UI-Fallback im Lead-Detail (Status muss `hkp_sent` sein).

### `status: 'wrong_lead_status'` — Lead nicht in `hkp_sent`

**Ursache:** Der gematchte Lead ist in einem anderen Status (z.B. schon `hkp_signed` oder `treatment_scheduled`).

**Debug-Schritte:**
1. Lead im CRM suchen → aktuellen Status prüfen
2. Wenn PDF noch nicht hochgeladen: Status manuell auf `hkp_sent` zurücksetzen, dann erneut triggern
3. Wenn bereits `hkp_signed`: PDF eventuell schon verarbeitet — Aktivitäts-Log prüfen

### `status 502` — Directus File Upload fehlgeschlagen

**Ursache:** Directus Service-Token hat keine Schreibrechte auf `/files`.

**Debug-Schritte:**
1. Directus → Settings → Roles & Permissions → Service-Role → Files: Create + Read erlauben
2. `NUXT_DIRECTUS_SERVICE_TOKEN` im Deployment prüfen — kein `undefined` oder leerer Wert

### Bestätigungs-Mail nicht angekommen

Mail-Fehler ist non-fatal (catch-block im Endpoint). PDF und Status-Wechsel wurden trotzdem durchgeführt.
Brevo-Log unter https://app.brevo.com → Transactional → Emails prüfen.

---

## DSGVO / Datenschutz

- PDFs liegen verschlüsselt in Directus-Files (Storage: DO Spaces, Frankfurt-Region)
- Retention-Policy: **30 Tage nach `completed`**, dann archivieren oder löschen
- Umsetzung: out of scope für MVP — im Backlog als Phase-2-Task erfasst
- Rechtsgrundlage: Behandlungsvertrag (Art. 9 DSGVO, § 630f BGB)

---

## UI-Upload-Fallback

Im Lead-Detail erscheint bei Status `hkp_sent` ein Datei-Upload-Block.
Dieser ruft denselben Endpoint auf, sendet aber `x-hkp-ingest-secret: manual-upload-token` (kein echter Secret).

**Phase-2-Refactoring-TODO:** Manueller Upload soll einen dedizierten Endpoint
`POST /api/leads/:id/upload-hkp` nutzen, der Session-Cookie-Auth verwendet (wie alle anderen Lead-CRUD-Calls).
Bis dahin: UI-Block nur intern erreichbar (hinter Auth-Firewall, CRM nicht öffentlich).
