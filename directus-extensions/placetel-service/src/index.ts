/**
 * Directus Endpoint Extension: Placetel Telephony Service
 *
 * Click-to-Call via Placetel REST API v2 + Webhook-Empfang.
 * Endpoints:
 *   POST /placetel-service/dial        — Anruf auslösen (Click-to-Call)
 *   POST /placetel-service/webhook     — Placetel Call Events empfangen
 *   GET  /placetel-service/status      — Konfigurationsstatus prüfen
 *
 * Env vars:
 *   PLACETEL_API_TOKEN  — Bearer Token für Placetel REST API v2
 *   PLACETEL_SIP_USER   — SIP-User ID (eigene Nebenstelle)
 */

import { defineEndpoint } from '@directus/extensions-sdk'

const PLACETEL_API_BASE = 'https://api.placetel.de/v2'

export default defineEndpoint((router, context) => {
  const { services, getSchema, env, logger } = context

  const getApiToken = () => env['PLACETEL_API_TOKEN'] || ''
  const getDefaultSipUser = () => env['PLACETEL_SIP_USER'] || ''

  // ─── POST /placetel-service/dial ─────────────────────────────────
  // Click-to-Call: Klingelt erst eigenes Telefon, dann Kontakt
  router.post('/dial', async (req: any, res: any) => {
    try {
      if (!req.accountability?.user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const { phone_number, sip_user, lead_id, contact_id } = req.body

      if (!phone_number) {
        return res.status(400).json({ error: 'phone_number ist erforderlich' })
      }

      const apiToken = getApiToken()
      if (!apiToken) {
        return res.status(500).json({ error: 'PLACETEL_API_TOKEN nicht konfiguriert' })
      }

      const sipUser = sip_user || getDefaultSipUser()
      if (!sipUser) {
        return res.status(400).json({ error: 'Kein SIP-User konfiguriert. PLACETEL_SIP_USER setzen oder sip_user mitgeben.' })
      }

      // Placetel API: Anruf initiieren
      const response = await fetch(`${PLACETEL_API_BASE}/calls`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callee: phone_number,
          caller: sipUser,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        logger.error(`Placetel dial error: ${response.status} ${errorBody}`)
        return res.status(response.status).json({
          error: `Placetel API Fehler: ${response.status}`,
          details: errorBody,
        })
      }

      const callData = await response.json()
      logger.info(`Placetel call initiated: ${phone_number} via ${sipUser}`)

      // Optional: Activity sofort als "dialing" erstellen
      if (lead_id) {
        const schema = await getSchema()
        const { ItemsService } = services
        const activitiesService = new ItemsService('nursing_home_lead_activities', {
          schema,
          accountability: req.accountability,
        })

        await activitiesService.createOne({
          nursing_home_lead_id: lead_id,
          contact_id: contact_id || null,
          type: 'call',
          subject: `Anruf: ${phone_number}`,
          direction: 'outbound',
          metadata: {
            phone_number,
            sip_user: sipUser,
            placetel_call_id: callData.call_id || null,
            source: 'placetel',
            status: 'dialing',
          },
        })
      }

      return res.json({
        success: true,
        call_id: callData.call_id || null,
        phone_number,
        sip_user: sipUser,
      })
    } catch (err: any) {
      logger.error(`Placetel dial error: ${err.message}`)
      return res.status(500).json({ error: err.message })
    }
  })

  // ─── POST /placetel-service/webhook ──────────────────────────────
  // Empfängt Placetel Call Notify Events
  // Events: IncomingCall, OutgoingCall, CallAccepted, HungUp
  router.post('/webhook', async (req: any, res: any) => {
    try {
      const event = req.body

      if (!event || !event.event) {
        return res.status(400).json({ error: 'Invalid webhook payload' })
      }

      logger.info(`Placetel webhook: ${event.event} from ${event.from} to ${event.to}`)

      // Nur bei HungUp (Anruf beendet) eine Activity erstellen/updaten
      if (event.event === 'HungUp') {
        const schema = await getSchema()
        const { ItemsService } = services

        // System-Accountability für Webhook (kein User-Context)
        const activitiesService = new ItemsService('nursing_home_lead_activities', {
          schema,
          accountability: { admin: true },
        })

        // Versuche den zugehörigen Lead über Telefonnummer zu finden
        const contactsSvc = new ItemsService('nursing_home_contacts', {
          schema,
          accountability: { admin: true },
        })

        const phone = event.direction === 'in' ? event.from : event.to
        let leadId = null
        let contactId = null

        if (phone) {
          // Suche Kontakt mit dieser Telefonnummer
          const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '')
          const contacts = await contactsSvc.readByQuery({
            filter: {
              _or: [
                { phone: { _contains: normalizedPhone.slice(-8) } },
                { mobile: { _contains: normalizedPhone.slice(-8) } },
              ],
            },
            limit: 1,
            fields: ['id', 'nursing_home_id', 'first_name', 'last_name'],
          })

          if (contacts.length > 0) {
            contactId = contacts[0].id
            // Find lead by nursing_home_id
            const leadsSvc = new ItemsService('nursing_home_leads', {
              schema,
              accountability: { admin: true },
            })
            const leads = await leadsSvc.readByQuery({
              filter: { nursing_home_id: { _eq: contacts[0].nursing_home_id } },
              limit: 1,
              fields: ['id'],
            })
            if (leads.length > 0) {
              leadId = leads[0].id
            }
          }
        }

        // Bestimme Outcome basierend auf Placetel call type
        let outcome: string | null = null
        switch (event.type) {
          case 'accepted': outcome = 'successful'; break
          case 'missed': outcome = 'no_contact'; break
          case 'voicemail': outcome = 'no_contact'; break
          case 'busy': outcome = 'no_contact'; break
          default: outcome = null
        }

        // Activity erstellen (auch ohne Lead-Match für manuelles Zuordnen)
        const activityData: any = {
          type: 'call',
          subject: `${event.direction === 'in' ? 'Eingehender' : 'Ausgehender'} Anruf: ${phone || 'Unbekannt'}`,
          direction: event.direction === 'in' ? 'inbound' : 'outbound',
          outcome,
          duration_minutes: event.duration ? Math.ceil(event.duration / 60) : null,
          metadata: {
            phone_number: phone,
            placetel_call_id: event.call_id,
            placetel_event: event.event,
            placetel_type: event.type,
            from: event.from,
            to: event.to,
            source: 'placetel_webhook',
          },
        }

        if (leadId) activityData.nursing_home_lead_id = leadId
        if (contactId) activityData.contact_id = contactId

        await activitiesService.createOne(activityData)

        logger.info(`Placetel webhook: Activity created (lead: ${leadId}, outcome: ${outcome}, duration: ${event.duration}s)`)
      }

      return res.json({ success: true })
    } catch (err: any) {
      logger.error(`Placetel webhook error: ${err.message}`)
      return res.status(500).json({ error: err.message })
    }
  })

  // ─── GET /placetel-service/call-duration ─────────────────────────
  // Holt die echte Gesprächsdauer des letzten Anrufs zu/von einer Nummer
  // via Placetel GET /v2/calls
  router.get('/call-duration', async (req: any, res: any) => {
    try {
      if (!req.accountability?.user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const phoneNumber = req.query.phone_number
      if (!phoneNumber) {
        return res.status(400).json({ error: 'phone_number query parameter ist erforderlich' })
      }

      const apiToken = getApiToken()
      if (!apiToken) {
        return res.status(500).json({ error: 'PLACETEL_API_TOKEN nicht konfiguriert' })
      }

      // Fetch today's calls from Placetel
      const today = new Date().toISOString().split('T')[0]
      const url = new URL(`${PLACETEL_API_BASE}/calls`)
      url.searchParams.set('filter[date]', today)
      url.searchParams.set('per_page', '50')
      url.searchParams.set('order', 'desc')

      const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${apiToken}` },
      })

      if (!response.ok) {
        logger.error(`Placetel calls fetch error: ${response.status}`)
        return res.status(response.status).json({ error: 'Placetel API Fehler' })
      }

      const calls = await response.json()

      // Find the most recent call matching this phone number
      const normalizedSearch = phoneNumber.replace(/[\s\-\(\)\+]/g, '').slice(-8)
      const match = (Array.isArray(calls) ? calls : calls.data || []).find((call: any) => {
        const from = (call.from_number || call.from || '').replace(/[\s\-\(\)\+]/g, '')
        const to = (call.to_number?.number || call.to_number || call.to || '').replace(/[\s\-\(\)\+]/g, '')
        return from.includes(normalizedSearch) || to.includes(normalizedSearch)
      })

      if (match) {
        return res.json({
          found: true,
          duration_seconds: match.duration || 0,
          duration_minutes: match.duration ? Math.ceil(match.duration / 60) : 0,
          call_type: match.type || null,
          received_at: match.received_at || null,
        })
      }

      return res.json({ found: false, duration_seconds: 0, duration_minutes: 0 })
    } catch (err: any) {
      logger.error(`Placetel call-duration error: ${err.message}`)
      return res.status(500).json({ error: err.message })
    }
  })

  // ─── GET /placetel-service/status ────────────────────────────────
  // Prüft ob Placetel konfiguriert ist
  router.get('/status', async (req: any, res: any) => {
    if (!req.accountability?.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const apiToken = getApiToken()
    const sipUser = getDefaultSipUser()

    return res.json({
      configured: !!(apiToken && sipUser),
      has_api_token: !!apiToken,
      has_sip_user: !!sipUser,
      sip_user: sipUser || null,
    })
  })
})
