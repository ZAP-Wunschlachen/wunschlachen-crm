# CloudTalk Click-to-Call Integration

Plan v9 Phase D — Anrufe direkt aus dem CRM starten + automatisches Activity-Logging via Webhook.

## Architektur

```
Client (QuickActionBar / Lead-Detail)
      │
      │ Click on 📞
      ▼
useCloudTalk.initiateCall(lead)
      │
      │ POST /api/cloudtalk/call  { lead_id, phone }
      ▼
Server-Proxy (call.post.ts)
      │
      │ Basic-Auth(API_KEY_ID:SECRET)
      │ POST CloudTalk /calls/create.json
      ▼
CloudTalk → Agent-Telefon klingelt → Anruf läuft
      │
      │ Webhook (call_started, call_ended, call_missed)
      ▼
/api/inbound/cloudtalk-event
      │
      │ Lead-Match per phone
      ▼
Directus: lead_activities.create({ type: 'call', metadata.cloudtalk_call_id })
```

## ENV-Variablen

```bash
# .env.local
CLOUDTALK_API_KEY_ID=...
CLOUDTALK_API_KEY_SECRET=...
CLOUDTALK_AGENT_ID=123456    # Default-Agent (kann via call-body überschrieben werden)
CLOUDTALK_WEBHOOK_SECRET=... # optional HMAC für /api/inbound/cloudtalk-event
```

Im `nuxt.config.ts` runtimeConfig erweitern:

```ts
runtimeConfig: {
  cloudtalkApiKeyId: '',
  cloudtalkApiKeySecret: '',
  cloudtalkAgentId: '',
  cloudtalkWebhookSecret: '',
  // ...
}
```

## CloudTalk-Setup

1. CloudTalk → Settings → API-Access-Keys → "Create new key"
2. API-Key-ID + Secret in `.env.local` setzen
3. CloudTalk → Settings → Webhooks → "New webhook"
   - URL: `https://crm.wunschlachen.app/api/inbound/cloudtalk-event`
   - Events: `call_started`, `call_ended`, `call_missed`
   - Method: `POST`
   - Custom Header (optional): `x-cloudtalk-signature: <HMAC>` für Signature-Verifikation
4. Default-Agent-ID in Config setzen (Agent → Settings → URL enthält ID)

## Mock-Mode

Solange `CLOUDTALK_API_KEY_ID` fehlt → `useCloudTalk.initiateCall` legt nur eine `call`-Activity an und zeigt Toast. Kein API-Call.

Im Composable ist `USE_MOCK = true` zusätzlich hart gesetzt, damit lokal entwickelt werden kann ohne CloudTalk-Account.

Beim Wechsel auf Production:
1. `USE_MOCK = false` in `useCloudTalk.ts`
2. ENV setzen
3. Webhook in CloudTalk konfigurieren
4. `app/server/api/inbound/cloudtalk-event.post.ts` braucht Directus-Permission `lead_activities.create` für den API-Token

## Activity-Schema-Erweiterung

`lead_activities.metadata` (JSON) bekommt zusätzlich:
- `cloudtalk_call_id` (int) — für Dedup + Lookup
- `duration_seconds` (int)
- `recording_url` (string) — Audio-File auf CloudTalk-CDN
- `event_type` (call_started | call_ended | call_missed)

Keine Schema-Änderung notwendig, da `metadata` schon ein JSON-Feld ist.

## UI-Integration

- `QuickActionBar` action `call` → ruft `useCloudTalk.initiateCall(lead)` statt direkt `tel:`
- `CommunicationTimeline` zeigt für Activities mit `metadata.recording_url` einen „Audio anhören"-Button (Phase D.2)
- `NextBestActionCard` action `call` triggert ebenfalls CloudTalk
