# Directus Collection: `email_events`

Persistiert Brevo-Tracking-Events pro Lead (Plan v9 Phase B).

## Felder

| Feld | Typ | Constraints | Notiz |
|------|-----|------------|-------|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `lead_id` | uuid | FK → `Leads.id`, NOT NULL | |
| `activity_id` | uuid | FK → `lead_activities.id`, nullable | optional Verknüpfung zur ausgehenden Aktivität |
| `event_type` | string (enum) | NOT NULL | `sent` \| `delivered` \| `opened` \| `clicked` \| `bounced` \| `spam` \| `unsubscribed` |
| `occurred_at` | timestamp | NOT NULL | Zeitpunkt laut Brevo |
| `message_id` | string (255) | nullable | Brevo Message-ID für Threading |
| `click_url` | text | nullable | nur bei `event_type=clicked` |
| `raw_payload` | json | nullable | Brevo-Original-Payload für Audit |
| `date_created` | timestamp | default `now()` | |

## Indices

```sql
CREATE INDEX idx_email_events_lead_occurred ON email_events (lead_id, occurred_at DESC);
CREATE INDEX idx_email_events_activity ON email_events (activity_id) WHERE activity_id IS NOT NULL;
CREATE INDEX idx_email_events_type_occurred ON email_events (event_type, occurred_at);
CREATE INDEX idx_email_events_message_id ON email_events (message_id) WHERE message_id IS NOT NULL;
```

## Directus-Permissions

- Public: keine
- Authenticated User: nur `read` (eigene Leads)
- API-Token (Webhook-Service): `create`

## Brevo-Webhook-Setup

1. Brevo → SMTP & API → Webhooks → "Add a new webhook"
2. URL: `https://crm.wunschlachen.app/api/inbound/brevo-event`
3. Events anhaken: `delivered`, `opens`, `click`, `bounce`, `spam`, `unsubscribed`, `blocked`
4. Tag-Konvention: alle ausgehenden Mails mit `lead-<id>` taggen (siehe `app/server/api/brevo/send-email.post.ts`)

## Event-Mapping (Brevo → uns)

| Brevo | Intern |
|-------|--------|
| request | sent |
| delivered | delivered |
| opens | opened |
| click | clicked |
| bounce | bounced |
| blocked | bounced |
| spam | spam |
| unsubscribed | unsubscribed |

## UI-Konsum

- `useEmailEvents().getEmailStatus(activityId)` → höchster Status (clicked > opened > delivered > sent)
- `useEmailEvents().getEngagementStats(activities)` → Aggregat für `EngagementStatsCard`
- `CommunicationTimeline` zeigt Badge pro E-Mail-Activity

## Mock-Mode

`USE_MOCK = true` in `useEmailEvents.ts`: persistiert nach `localStorage['patient-crm-email-events']`. SEED-Daten werden einmal automatisch geschrieben (key `patient-crm-email-events-seeded`).

Beim Wechsel auf Production:
1. `USE_MOCK = false` setzen
2. `getEventsForActivity` / `getEventsForLead` auf Directus-Query umstellen
3. `recordEvent` entfernt (Brevo-Webhook schreibt direkt nach Directus)
