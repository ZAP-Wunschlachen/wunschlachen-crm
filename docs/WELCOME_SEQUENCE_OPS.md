# Welcome-Sequence Operations-Runbook

**Letzte Aktualisierung:** 2026-05-13
**Owner:** Tony Günther
**Spec:** [docs/specs/2026-05-13-patient-funnel-automation.md](specs/2026-05-13-patient-funnel-automation.md) Modul A MVP
**Plan:** [docs/superpowers/plans/2026-05-13-welcome-sequence-mvp.md](superpowers/plans/2026-05-13-welcome-sequence-mvp.md)
**Marketing-Konzept:** [docs/marketing/email-sequence-plan.md](marketing/email-sequence-plan.md)

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
