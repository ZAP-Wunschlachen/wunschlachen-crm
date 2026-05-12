# Directus Collection: `email_templates`

Status-spezifische Mail-Templates mit Mapping zu Brevo (Plan v9 Phase C).

## Felder

| Feld | Typ | Constraints | Notiz |
|------|-----|------------|-------|
| `id` | uuid | PK | |
| `key` | string (60) | UNIQUE, NOT NULL | Stabiler Lookup-Key, z.B. `reactivation-financing` |
| `name` | string (120) | NOT NULL | UI-Label |
| `subject` | string (255) | nullable | E-Mail-Betreff (mit Variablen) |
| `body_html` | text | nullable | HTML-Body (mit Variablen) |
| `category` | string (enum) | NOT NULL | `erstansprache` \| `follow_up` \| `termin_erinnerung` \| `hkp` \| `reactivation` \| `review_request` \| `nachsorge` \| `allgemein` |
| `variables` | json (string[]) | nullable | Liste erlaubter Platzhalter |
| `brevo_template_id` | int | nullable | wenn Template in Brevo gepflegt (überschreibt body_html bei Versand) |
| `for_status` | json (string[]) | nullable | Empfohlene Lead-Stati — UI filtert darauf |
| `is_active` | bool | default true | |
| `date_created` | timestamp | default now | |
| `date_updated` | timestamp | auto | |

## Indices

```sql
CREATE UNIQUE INDEX idx_email_templates_key ON email_templates (key);
CREATE INDEX idx_email_templates_category ON email_templates (category) WHERE is_active = true;
CREATE INDEX idx_email_templates_status ON email_templates USING gin (for_status);
```

## Seed-Templates

Beim Anlegen der Collection diese Keys aus
`layers/patienten/data/email-templates.json` importieren:

| key | category | for_status |
|-----|----------|-----------|
| `welcome` | erstansprache | new, contacting |
| `followup-appointment` | follow_up | contacted |
| `followup-consultation` | follow_up | consultation_done |
| `consultation-reminder` | termin_erinnerung | consultation_scheduled, treatment_scheduled |
| `hkp-followup` | hkp | hkp_sent |
| `hkp-followup-second` | hkp | hkp_sent |
| `reactivation-financing` | reactivation | lost |
| `reactivation-soft` | reactivation | lost |
| `reactivation-feedback` | reactivation | lost |
| `review-request` | review_request | completed |
| `aftercare` | nachsorge | completed |
| `blank` | allgemein | — |

## Versand-Endpoints

### Inline-Content (existing)

```
POST /api/brevo/send-email
{ to, subject, htmlContent, tags }
```

### Template-Mode (Phase C)

Variante A — Brevo-Template via ID:
```
POST /api/brevo/send-email
{ to, templateId: 12345, params: { firstName: "Maria" }, tags: ["lead-pl-1"] }
```

Variante B — unser Template, lokal resolved, dann Inline-Versand:
```ts
const { getByKey, resolveTemplate } = useEmailTemplates()
const tpl = getByKey('reactivation-financing')
if (!tpl) return
const ctx = { patient: lead, location: { name: 'Wunschlachen Berlin' } }
const subject = resolveTemplate(tpl.subject, ctx)
const html = resolveTemplate(tpl.body_html, ctx)

await $fetch('/api/brevo/send-email', {
  method: 'POST',
  body: { to: [{ email: lead.mail }], subject, htmlContent: html, tags: [`lead-${lead.id}`, `template-${tpl.key}`] }
})
```

## UI-Konsum

- `EmailComposeDialog` zeigt Template-Picker gefiltert nach `lead.status` (über `getForStatus`)
- `NextBestActionCard`-Actions wie `reactivation` / `send_hkp` öffnen den Dialog mit vorgewähltem Template
- `useReactivationQueue.getStrategy(lead).template_id` mappt jetzt auf die `key`s oben
