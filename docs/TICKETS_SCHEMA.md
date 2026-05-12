# Ticket-System — Directus-Schema (Phase 9)

**Stand:** 2026-05-12
**Verwendung:** Diese Datei dokumentiert die in Directus anzulegenden Collections und Felder. Tony oder Directus-Admin legt das Schema gemäß dieser Spec an.

---

## Collections

### `tickets`

Eingangs-Ticket pro Anfrage. Jede E-Mail/SMS/WhatsApp/Form-Submission erzeugt entweder ein neues Ticket oder hängt eine `ticket_message` an ein bestehendes.

| Feld | Typ | Required | Default | Beschreibung |
|---|---|---|---|---|
| `id` | UUID | ✓ | auto | Primary Key |
| `subject` | string (255) | ✓ | — | Betreff (bei E-Mail: Header; bei SMS/Form: erste Zeile/Auto-gen) |
| `status` | enum | ✓ | `neu` | `neu` / `offen` / `wartend_kunde` / `in_bearbeitung` / `geloest` / `geschlossen` |
| `priority` | enum | ✓ | `mittel` | `niedrig` / `mittel` / `hoch` / `dringend` |
| `channel` | enum | ✓ | — | `email` / `sms` / `whatsapp` / `phone` / `form` / `chat` |
| `customer_type` | enum | ✓ | `unbekannt` | `heimkunde` / `patient` / `unbekannt` |
| `customer_id` | UUID | – | — | FK auf `Leads` (B2B) ODER `patient_leads` (B2C) — polymorph; in Anwendung via `customer_type` aufgelöst |
| `assignee_id` | UUID | – | — | FK auf `directus_users` |
| `tags` | JSON (array) | – | `[]` | Free-form Tags für Filter/Search |
| `related_lead_id` | UUID | – | — | Optional: explizite Lead-Verknüpfung (kann von `customer_id` abweichen) |
| `first_response_at` | timestamp | – | — | Zeit der ersten outbound-Reply (für SLA) |
| `resolved_at` | timestamp | – | — | Zeit Status `geloest` |
| `sla_breach` | boolean | ✓ | `false` | Computed per Background-Job |
| `date_created` | timestamp | auto | now() | Directus-Standard |
| `date_updated` | timestamp | auto | now() | Directus-Standard |
| `user_created` | UUID | auto | — | Directus-Standard FK directus_users |
| `user_updated` | UUID | auto | — | Directus-Standard FK directus_users |

**Indizes:**
- `idx_tickets_status` auf `status` (Filter-Performance)
- `idx_tickets_assignee` auf `assignee_id`
- `idx_tickets_customer` auf `(customer_type, customer_id)` (polymorphe Suche)
- `idx_tickets_channel` auf `channel`
- `idx_tickets_created` auf `date_created DESC` (Liste sortiert nach neueste)

**Permissions:**
- `read`: alle internen Rollen
- `create`: server-side (Nitro-Webhooks) + manuell durch CRM-User
- `update`: assignee + admin
- `delete`: admin only

---

### `ticket_messages`

Eine einzelne Nachricht innerhalb eines Tickets — inbound (vom Kunden) oder outbound (Reply vom Team).

| Feld | Typ | Required | Default | Beschreibung |
|---|---|---|---|---|
| `id` | UUID | ✓ | auto | |
| `ticket_id` | UUID | ✓ | — | FK auf `tickets` (CASCADE DELETE) |
| `direction` | enum | ✓ | — | `inbound` / `outbound` |
| `channel` | enum | ✓ | — | `email` / `sms` / `whatsapp` / `phone` / `form` |
| `from_address` | string (255) | – | — | Bei E-Mail: From-Address; bei SMS/WhatsApp: Telefonnummer |
| `to_address` | string (255) | – | — | Empfänger |
| `subject` | string (500) | – | — | Nur bei E-Mail relevant |
| `body_html` | text | – | — | HTML-Body (E-Mail) |
| `body_text` | text | ✓ | — | Text-Body (überall, fallback) |
| `attachments` | JSON (array) | – | `[]` | Array von Directus-File-IDs |
| `sender_user_id` | UUID | – | — | Bei outbound: FK auf directus_users |
| `external_message_id` | string (255) | – | — | Provider-ID (Brevo Message-ID etc.) für Threading/Deduplizierung |
| `read_at` | timestamp | – | — | Wann die Nachricht intern gelesen wurde |
| `date_created` | timestamp | auto | now() | |

**Indizes:**
- `idx_ticket_messages_ticket` auf `ticket_id`
- `idx_ticket_messages_external` auf `external_message_id` (Webhook-Idempotenz)

---

### `ticket_macros`

Vordefinierte Antworten (Quick-Replies) — kanal-spezifisch.

| Feld | Typ | Required | Default | Beschreibung |
|---|---|---|---|---|
| `id` | UUID | ✓ | auto | |
| `name` | string (100) | ✓ | — | Anzeige-Name |
| `description` | text | – | — | Optional erklärender Text |
| `channel` | enum | ✓ | — | `email` / `sms` / `whatsapp` / `phone` / `any` |
| `applies_to_customer_type` | enum | – | `any` | `heimkunde` / `patient` / `any` |
| `subject_template` | string (255) | – | — | Bei E-Mail: Betreff-Template (mit Variablen `{{var}}`) |
| `body_template` | text | ✓ | — | Body-Template |
| `available_variables` | JSON (array) | – | `[]` | z.B. `["first_name", "last_name", "ticket_id"]` |
| `is_active` | boolean | ✓ | `true` | Soft-Delete-Pattern |
| `date_created`, `date_updated`, `user_created`, `user_updated` | (Standard) | | | |

**Indizes:**
- `idx_ticket_macros_channel` auf `(channel, is_active)`

---

## Relationen

```
tickets 1 ─── n  ticket_messages   (FK ticket_id, CASCADE)
tickets n ─── 1  directus_users    (FK assignee_id, SET NULL)
tickets n ─── 1  Leads             (FK customer_id WHERE customer_type='heimkunde')
tickets n ─── 1  patient_leads     (FK customer_id WHERE customer_type='patient')
ticket_messages n ─── 1  directus_users  (FK sender_user_id, SET NULL)
```

Hinweis polymorphe Beziehung: Directus unterstützt M2A (Many-to-Any). Alternativ kann `customer_id` als string gespeichert + applikationsseitig aufgelöst werden.

---

## Default-Macros (zur Ersteinrichtung)

| Name | Channel | Customer-Type | Body |
|---|---|---|---|
| „Erstkontakt Heim" | email | heimkunde | "Vielen Dank für Ihre Anfrage, {{first_name}}. Wir melden uns innerhalb von 24h..." |
| „Erstkontakt Patient" | email | patient | "Hallo {{first_name}}, vielen Dank für Ihr Interesse..." |
| „Termin-Bestätigung" | sms | any | "Ihr Termin am {{date}} um {{time}} ist bestätigt." |
| „Rückruf-Zusage" | any | any | "Hallo, wir rufen Sie heute zwischen {{time_start}}-{{time_end}} zurück." |

---

## SLA-Definitionen (Default)

| Priority | First-Response-Frist | Resolution-Frist |
|---|---|---|
| dringend | 1h | 4h |
| hoch | 4h | 1 Werktag |
| mittel | 24h | 3 Werktage |
| niedrig | 48h | 7 Werktage |

Background-Job (zu Phase 9 T7): markiert `sla_breach=true` wenn Frist abgelaufen ohne Status-Wechsel.

---

## Migration-Order (für Directus)

1. Collection `ticket_macros` (keine Abhängigkeiten)
2. Collection `tickets` (Foreign Keys auf existing `Leads` / `patient_leads` / `directus_users`)
3. Collection `ticket_messages` (FK auf `tickets`)
4. Indizes anlegen
5. Default-Macros einfügen (siehe oben)
6. Permissions setzen

---

## Hinweise zur Implementierung im Frontend

- Composable `useTickets()` wird in `layers/base/composables/useTickets.ts` angelegt (kanal-übergreifend, beide Personas)
- Polymorphe `customer_id` wird via `customer_type` aufgelöst:
  ```ts
  const customer = customer_type === 'heimkunde'
    ? await getItem({ collection: 'Leads', id: customer_id })
    : await getItem({ collection: 'patient_leads', id: customer_id })
  ```
- Real-time-Update via Directus-Subscription (WebSocket) für neue inbound-Nachrichten — wenn `useSocket` (pflegeheime-Layer) zu base/ gehoben wird

---

**Frontend-Code in dieser Phase nutzt zunächst Mock-Daten**, bis Schema in Directus angelegt ist.
