import { defineEventHandler, getHeader, readBody, createError } from 'h3'
import type { Lead } from '../../../../layers/patienten/types/crm'

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
  const expected = config.hkpIngestSecret as string
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

  // Lead suchen — primär per patient_number, Fallback per mail
  let lead: Lead | undefined
  if (body.patient_number) {
    const r = await $fetch<{ data: Lead[] }>(`${directusUrl}/items/Leads`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${directusToken}` },
      query: {
        fields: 'id,first_name,last_name,mail,status,patient_number',
        'filter[patient_number][_eq]': body.patient_number,
        limit: '1',
      },
    })
    lead = r?.data?.[0]
  }
  if (!lead && body.sender_email) {
    const target = normalizeMail(body.sender_email)
    if (target) {
      const r = await $fetch<{ data: Lead[] }>(`${directusUrl}/items/Leads`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${directusToken}` },
        query: {
          fields: 'id,first_name,last_name,mail,status,patient_number',
          'filter[mail][_iequals]': target,
          limit: '1',
        },
      })
      lead = r?.data?.[0]
    }
  }

  if (!lead) {
    return {
      status: 'no_match',
      message: `no lead for patient_number=${body.patient_number} sender=${body.sender_email}`,
    }
  }
  if (lead.status !== 'hkp_sent') {
    return {
      status: 'wrong_lead_status',
      lead_id: lead.id,
      message: `lead ${lead.id} is in status ${lead.status}, expected hkp_sent`,
    }
  }

  // PDF in Directus uploaden via Web-API (Nitro-Edge-Runtime-kompatibel)
  const pdfBytes = Uint8Array.from(atob(body.pdf_base64), c => c.charCodeAt(0))
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const form = new FormData()
  form.append('file', blob, body.pdf_filename)

  const fileResp = await $fetch<{ data: { id: string } }>(`${directusUrl}/files`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${directusToken}` },
    body: form,
  })
  const fileId = fileResp?.data?.id
  if (!fileId) throw createError({ statusCode: 502, statusMessage: 'directus file upload failed' })

  const now = new Date().toISOString()

  // Lead patchen: Status hkp_signed + PDF-Referenz
  await $fetch(`${directusUrl}/items/Leads/${lead.id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${directusToken}` },
    body: {
      status: 'hkp_signed',
      hkp_signed_pdf_id: fileId,
      hkp_signed_received_at: now,
      last_status_change_at: now,
    },
  })

  // Activity anlegen
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

  // Bestätigungs-Mail an Patient (non-fatal)
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
    }
    catch (_e) { /* mail failure ist non-fatal */ }
  }

  return { status: 'matched', lead_id: lead.id, file_id: fileId, message: `HKP für Lead ${lead.id} verarbeitet` }
})
