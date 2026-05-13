# Modul F — Dampsoft-HKP-Signed via n8n-Email-Postbox MVP

**Goal:** Unterschriebene HKPs aus Dampsoft kommen halbautomatisch ins CRM. Praxis-MA scannt + mailt an dedizierte Inbox → n8n parsed → CRM-Endpoint setzt Lead auf `hkp_signed` + speichert PDF + Activity. Plus: manueller Fallback-Upload im Lead-Detail UI für Edge-Cases.

**Spec:** §3 Modul F.

## Architektur

```
Praxis-MA scannt HKP
       │
       ▼ Email mit PDF an hkp-signed@wunschlachen.app
       │
n8n IMAP-Trigger      n8n-Email-Postbox-Workflow
       │
       ├─ Parse Subject/Filename → Patient-Number-Regex
       ├─ Match → POST /api/leads/match-and-attach-hkp
       └─ No-Match → Email-Alert an Sales-Team
       
CRM-Endpoint (server/api/leads/match-and-attach-hkp.post.ts):
  ├─ Match Lead via patient_number ODER mail
  ├─ Status hkp_sent → hkp_signed
  ├─ PDF in Directus-files via Multipart-Upload
  ├─ Activity „HKP unterschrieben eingegangen"
  ├─ Bestätigungs-Mail an Patient
  └─ Trigger Modul B Callback-Schlange für Behandlungs-Termin
```

## File Structure

**New:**
- `layers/patienten/composables/useHkpExtract.ts` — Pure-Logic: patient_number aus Subject/Filename extrahieren
- `layers/patienten/composables/useHkpExtract.test.ts`
- `app/server/api/leads/match-and-attach-hkp.post.ts` — n8n-Callback-Endpoint
- `layers/patienten/components/patienten/HkpUploadDialog.vue` — UI-Fallback für manuelle Uploads
- n8n-Workflow `[TONY] CRM HKP-Postbox Inbound` (deaktiviert, IMAP-Credentials später)
- `docs/HKP_INGEST_OPS.md` — Operations-Runbook

**Modified:**
- `layers/patienten/types/crm.ts` — `Lead.hkp_signed_pdf_id`
- `layers/patienten/pages/patienten/leads/[id].vue` — Button „HKP unterschrieben hochladen" bei `status=hkp_sent`

## Tasks

### Task F1: Lead-Type erweitern + Activity-Type

Edit `layers/patienten/types/crm.ts`, nach den Callback-Feldern:

```ts
  // HKP-Signed via Dampsoft-Postbox (Plan v9 Modul F MVP)
  hkp_signed_pdf_id?: string             // Directus-File-ID der eingegangenen PDF
  hkp_signed_received_at?: string        // ISO timestamp
```

Activity-Type erweitern (in der `LeadActivityType`-Union):

```ts
export type LeadActivityType = ... | 'hkp_ingest'
```

Plus im `ACTIVITY_TYPE_CONFIG`:

```ts
hkp_ingest: { label: 'HKP eingegangen', icon: 'pi pi-file-pdf', color: '#16a34a', bgColor: '#f0fdf4' },
```

### Task F2: useHkpExtract Pure-Logic + Tests

`layers/patienten/composables/useHkpExtract.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { useHkpExtract } from './useHkpExtract'

describe('extractPatientNumber', () => {
  const { extractPatientNumber } = useHkpExtract()

  it('aus Subject "P-12345"', () => {
    expect(extractPatientNumber('HKP unterschrieben P-12345', '')).toBe('12345')
  })
  it('aus Subject "Patient 4567"', () => {
    expect(extractPatientNumber('HKP für Patient 4567 zurück', '')).toBe('4567')
  })
  it('aus Filename "HKP_27525_Mueller.pdf"', () => {
    expect(extractPatientNumber('', 'HKP_27525_Mueller.pdf')).toBe('27525')
  })
  it('aus Filename "27525-hkp-signed.pdf"', () => {
    expect(extractPatientNumber('', '27525-hkp-signed.pdf')).toBe('27525')
  })
  it('returns null wenn nichts matched', () => {
    expect(extractPatientNumber('Anhang', 'document.pdf')).toBeNull()
  })
  it('Subject hat Vorrang vor Filename bei Konflikt', () => {
    expect(extractPatientNumber('Patient 111', 'HKP_222.pdf')).toBe('111')
  })
  it('mindestens 4 Ziffern (verhindert false-positives)', () => {
    expect(extractPatientNumber('HKP 12', '')).toBeNull()
    expect(extractPatientNumber('', 'doc_99.pdf')).toBeNull()
  })
})

describe('extractEmailFromSender', () => {
  const { extractEmailFromSender } = useHkpExtract()
  it('"Name <mail>" → mail', () => {
    expect(extractEmailFromSender('Praxis Dr. Müller <praxis@example.de>')).toBe('praxis@example.de')
  })
  it('Plain Email', () => {
    expect(extractEmailFromSender('praxis@example.de')).toBe('praxis@example.de')
  })
  it('null für invalid', () => {
    expect(extractEmailFromSender('')).toBeNull()
    expect(extractEmailFromSender('kein-email')).toBeNull()
  })
})
```

Composable `layers/patienten/composables/useHkpExtract.ts`:

```ts
/**
 * useHkpExtract — Patient-Number aus Email-Subject + Filename extrahieren.
 *
 * Regex-Reihenfolge:
 *   1. "P-XXXXX" oder "P XXXXX"
 *   2. "Patient XXXXX" (mit/ohne Doppelpunkt)
 *   3. erste Ziffernfolge >= 4 Stellen im Subject
 *   4. erste Ziffernfolge >= 4 Stellen im Filename
 */

const NUMBER_PATTERNS = [
  /\bP[-_\s]?(\d{4,})\b/i,
  /\bPatient[-_\s:]+(\d{4,})\b/i,
  /\b(\d{4,})\b/,
]

const tryPatterns = (source: string): string | null => {
  for (const re of NUMBER_PATTERNS) {
    const m = source.match(re)
    if (m && m[1]) return m[1]
  }
  return null
}

export const useHkpExtract = () => {
  const extractPatientNumber = (subject: string, filename: string): string | null => {
    return tryPatterns(subject || '') || tryPatterns(filename || '') || null
  }

  const extractEmailFromSender = (sender: string): string | null => {
    if (!sender) return null
    const angle = sender.match(/<([^>]+)>/)
    if (angle && angle[1].includes('@')) return angle[1].trim().toLowerCase()
    if (sender.includes('@')) return sender.trim().toLowerCase()
    return null
  }

  return { extractPatientNumber, extractEmailFromSender }
}
```

### Task F3: CRM-Endpoint

`app/server/api/leads/match-and-attach-hkp.post.ts`:

Nimmt JSON-Body von n8n:
```json
{
  "patient_number": "12345",
  "sender_email": "praxis@example.de",
  "subject": "HKP für Patient 12345",
  "pdf_base64": "...",
  "pdf_filename": "HKP_12345.pdf"
}
```

- Auth via `x-hkp-ingest-secret`
- Match Lead per patient_number (primär) oder sender_email als Fallback
- Wenn Match + status `hkp_sent`:
  - PDF in Directus uploaden (POST /files mit multipart, oder POST /items/files mit base64)
  - PATCH Lead: status=hkp_signed, hkp_signed_pdf_id=<file-id>, hkp_signed_received_at=now
  - Activity Type `hkp_ingest` mit Verweis auf PDF
  - Bestätigungs-Mail an Patient
- Wenn No-Match: Response 404 mit Hinweis, n8n soll Alert-Mail senden

```ts
import { defineEventHandler, getHeader, readBody, createError } from 'h3'
import type { Lead } from '../../../layers/patienten/types/crm'

interface HkpIngestBody {
  patient_number?: string | null
  sender_email?: string | null
  subject?: string | null
  pdf_base64: string
  pdf_filename: string
}

interface Result {
  status: 'matched' | 'no_match' | 'wrong_lead_status'
  lead_id?: string
  file_id?: string
  message: string
}

const normalizeMail = (m?: string | null) => (m || '').trim().toLowerCase()

export default defineEventHandler(async (event): Promise<Result> => {
  const config = useRuntimeConfig()
  const expected = (config as any).hkpIngestSecret as string
  const provided = getHeader(event, 'x-hkp-ingest-secret')
  if (!expected || provided !== expected) {
    throw createError({ statusCode: 401, statusMessage: 'invalid hkp ingest secret' })
  }

  const body = await readBody<HkpIngestBody>(event)
  if (!body?.pdf_base64 || !body?.pdf_filename) {
    throw createError({ statusCode: 400, statusMessage: 'pdf_base64 + pdf_filename required' })
  }

  const directusUrl = config.directusUrl as string
  const directusToken = config.directusServiceToken as string
  if (!directusUrl || !directusToken) throw createError({ statusCode: 500, statusMessage: 'directus config missing' })

  // Lead suchen
  let lead: Lead | undefined
  if (body.patient_number) {
    const r = await $fetch<{ data: Lead[] }>(`${directusUrl}/items/Leads`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${directusToken}` },
      params: { fields: 'id,first_name,last_name,mail,status,patient_number', 'filter[patient_number][_eq]': body.patient_number, limit: '1' },
    })
    lead = r?.data?.[0]
  }
  if (!lead && body.sender_email) {
    const target = normalizeMail(body.sender_email)
    if (target) {
      const r = await $fetch<{ data: Lead[] }>(`${directusUrl}/items/Leads`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${directusToken}` },
        params: { fields: 'id,first_name,last_name,mail,status,patient_number', 'filter[mail][_iequals]': target, limit: '1' },
      })
      lead = r?.data?.[0]
    }
  }

  if (!lead) return { status: 'no_match', message: `no lead for patient_number=${body.patient_number} sender=${body.sender_email}` }
  if (lead.status !== 'hkp_sent') {
    return { status: 'wrong_lead_status', lead_id: lead.id, message: `lead ${lead.id} is in status ${lead.status}, expected hkp_sent` }
  }

  // PDF in Directus uploaden
  const form = new FormData()
  const pdfBuffer = Buffer.from(body.pdf_base64, 'base64')
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' })
  form.append('file', blob, body.pdf_filename)
  form.append('folder', '')

  const fileResp = await $fetch<{ data: { id: string } }>(`${directusUrl}/files`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${directusToken}` },
    body: form as any,
  })
  const fileId = fileResp?.data?.id
  if (!fileId) throw createError({ statusCode: 502, statusMessage: 'directus file upload failed' })

  const now = new Date().toISOString()

  await $fetch(`${directusUrl}/items/Leads/${lead.id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${directusToken}` },
    body: { status: 'hkp_signed', hkp_signed_pdf_id: fileId, hkp_signed_received_at: now, last_status_change_at: now },
  })

  await $fetch(`${directusUrl}/items/activities`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${directusToken}` },
    body: {
      lead_id: lead.id,
      type: 'hkp_ingest',
      subject: `HKP unterschrieben eingegangen (Patient ${body.patient_number || '?'})`,
      content: `Datei: ${body.pdf_filename}, Sender: ${body.sender_email || '?'}`,
      metadata: { file_id: fileId, source: 'n8n-hkp-postbox' },
      date_created: now,
      user_name: 'n8n:hkp-ingest',
    },
  })

  // Bestätigungs-Mail an Patient (optional, falls Mail vorhanden)
  if (lead.mail) {
    try {
      await $fetch('/api/brevo/send-email', {
        method: 'POST',
        body: {
          to: [{ email: lead.mail, name: `${lead.first_name} ${lead.last_name}` }],
          subject: 'HKP-Eingang bestätigt — wir melden uns für den Behandlungstermin',
          htmlContent: `<p>Hallo ${lead.first_name},</p><p>vielen Dank — Ihr unterschriebener HKP ist bei uns angekommen. Wir melden uns in Kürze, um den Behandlungstermin zu vereinbaren.</p><p>Herzliche Grüße<br>Ihr Wunschlachen-Team</p>`,
          tags: ['hkp-ingest', 'confirmation'],
        },
      })
    } catch (e) { /* mail failure ist non-fatal */ }
  }

  return { status: 'matched', lead_id: lead.id, file_id: fileId, message: `HKP für Lead ${lead.id} verarbeitet` }
})
```

Runtime-Config-Key in `app/nuxt.config.ts`:

```ts
hkpIngestSecret: '',   // env: NUXT_HKP_INGEST_SECRET
```

### Task F4: UI-Upload-Fallback

In `layers/patienten/pages/patienten/leads/[id].vue` bei `status === 'hkp_sent'` einen kleinen Block einfügen mit:

```vue
<div v-if="lead.status === 'hkp_sent'" class="bg-white rounded-lg p-4 border border-dental-blue--5 mt-3">
  <h2 class="text-sm font-semibold text-dental-blue-0 mb-2">HKP unterschrieben hochladen</h2>
  <input type="file" accept="application/pdf" class="text-[11px]" @change="onHkpUpload" />
  <p class="text-[10px] text-dental-blue--3 mt-1">Fallback wenn die n8n-Postbox-Ingest nicht greift</p>
</div>
```

Script-Funktion `onHkpUpload`:

```ts
const onHkpUpload = async (e: Event) => {
  if (!lead.value) return
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async () => {
    const base64 = (reader.result as string).split(',')[1] || ''
    try {
      const result = await $fetch('/api/leads/match-and-attach-hkp', {
        method: 'POST',
        headers: { 'x-hkp-ingest-secret': useRuntimeConfig().public.hkpIngestSecretBrowser as string || 'manual-upload' },
        body: {
          patient_number: lead.value?.patient_number,
          sender_email: lead.value?.mail,
          pdf_base64: base64,
          pdf_filename: file.name,
        },
      })
      toast.add({ severity: 'success', summary: 'HKP hochgeladen', detail: 'Status auf hkp_signed gesetzt' })
      await loadLead()
    } catch (err: any) {
      toast.add({ severity: 'error', summary: 'Upload fehlgeschlagen', detail: err?.message || String(err) })
    }
  }
  reader.readAsDataURL(file)
}
```

**Hinweis:** Manueller Upload sollte ein anderes Auth-Pattern haben als der n8n-Ingest. Pragmatisch: gleicher Secret, aber im Browser hardcoded (öffentlich) ist nicht ideal. Für MVP: Hinweis im Runbook dass der Upload nur intern erreichbar sein sollte (Firewall vor Production).

### Task F5: n8n-Workflow-Stub anlegen (deaktiviert)

Workflow `[TONY] CRM HKP-Postbox Inbound`:
- Trigger: IMAP Email (Node `n8n-nodes-base.emailReadImap`) — Konfiguration als TODO im Runbook
- Function Node: Patient-Number-Regex aus Subject/Filename extrahieren (gleiche Regex-Patterns wie useHkpExtract)
- HTTP-Request POST `https://crm.wunschlachen.app/api/leads/match-and-attach-hkp`
- Bei Response `status: 'no_match'`: Alert-Email an Sales-Team

Via API anlegen. Stub-IMAP-Credentials sind Platzhalter — User füllt sie nach.

### Task F6: Runbook `docs/HKP_INGEST_OPS.md`

Doku analog zu den anderen OPS-Runbooks: was es macht, Inbox-Adresse, n8n-Workflow-ID, Trouble-Shooting (häufigste No-Match-Fälle), DSGVO (PDF-Retention-Policy auf Directus).

### Task F7: Push + Issue
