/**
 * Directus Endpoint Extension: CRM Email Service
 *
 * Provides email sending (SMTP) and reading (IMAP) for IONOS and Gmail.
 * Endpoints:
 *   POST /email-service/send       — Send an email
 *   GET  /email-service/inbox       — Fetch inbox messages
 *   GET  /email-service/accounts    — List configured accounts
 *   POST /email-service/sync        — Sync inbox to nursing_home_lead_activities
 */

import { defineEndpoint } from '@directus/extensions-sdk'
import { createTransport } from 'nodemailer'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'

// Provider presets
const PROVIDER_PRESETS: Record<string, { imap: { host: string; port: number }; smtp: { host: string; port: number } }> = {
  ionos: {
    imap: { host: 'imap.ionos.de', port: 993 },
    smtp: { host: 'smtp.ionos.de', port: 465 },
  },
  gmail: {
    imap: { host: 'imap.gmail.com', port: 993 },
    smtp: { host: 'smtp.gmail.com', port: 465 },
  },
  custom: {
    imap: { host: '', port: 993 },
    smtp: { host: '', port: 465 },
  },
}

export default defineEndpoint((router, context) => {
  const { services, getSchema, env, database, logger } = context

  /**
   * Get email account config from environment or database
   * Env vars: EMAIL_PROVIDER, EMAIL_USER, EMAIL_PASSWORD
   * Optional: EMAIL_IMAP_HOST, EMAIL_SMTP_HOST (for custom)
   */
  const getAccountConfig = () => {
    const provider = env['EMAIL_PROVIDER'] || 'ionos'
    const preset = PROVIDER_PRESETS[provider] || PROVIDER_PRESETS.custom

    return {
      provider,
      user: env['EMAIL_USER'] || '',
      password: env['EMAIL_PASSWORD'] || '',
      imap: {
        host: env['EMAIL_IMAP_HOST'] || preset.imap.host,
        port: parseInt(env['EMAIL_IMAP_PORT'] || String(preset.imap.port)),
      },
      smtp: {
        host: env['EMAIL_SMTP_HOST'] || preset.smtp.host,
        port: parseInt(env['EMAIL_SMTP_PORT'] || String(preset.smtp.port)),
      },
    }
  }

  /**
   * Create SMTP transporter
   */
  const createSmtpTransport = (config: ReturnType<typeof getAccountConfig>) => {
    return createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.user,
        pass: config.password,
      },
    })
  }

  /**
   * Create IMAP client
   */
  const createImapClient = (config: ReturnType<typeof getAccountConfig>) => {
    return new ImapFlow({
      host: config.imap.host,
      port: config.imap.port,
      secure: true,
      auth: {
        user: config.user,
        pass: config.password,
      },
      logger: false,
    })
  }

  // ─── POST /email-service/send ───────────────────────────────────

  router.post('/send', async (req: any, res: any) => {
    try {
      // Auth check
      if (!req.accountability?.user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const { to, subject, body_html, body_text, lead_id, contact_id } = req.body

      if (!to || !subject) {
        return res.status(400).json({ error: 'Missing required fields: to, subject' })
      }

      const config = getAccountConfig()

      if (!config.user || !config.password) {
        return res.status(500).json({ error: 'Email account not configured. Set EMAIL_USER and EMAIL_PASSWORD env vars.' })
      }

      const transporter = createSmtpTransport(config)

      // Send email
      const info = await transporter.sendMail({
        from: config.user,
        to,
        subject,
        html: body_html || undefined,
        text: body_text || body_html?.replace(/<[^>]*>/g, '') || '',
      })

      logger.info(`Email sent to ${to}: ${info.messageId}`)

      // Create activity record
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
          type: 'email_sent',
          subject,
          content: body_text || body_html?.replace(/<[^>]*>/g, '') || null,
          direction: 'outbound',
          metadata: {
            to,
            message_id: info.messageId,
            provider: config.provider,
            status: 'sent',
          },
        })
      }

      return res.json({
        success: true,
        message_id: info.messageId,
      })
    } catch (err: any) {
      logger.error(`Email send error: ${err.message}`)
      return res.status(500).json({ error: err.message })
    }
  })

  // ─── GET /email-service/inbox ───────────────────────────────────

  router.get('/inbox', async (req: any, res: any) => {
    try {
      if (!req.accountability?.user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const config = getAccountConfig()

      if (!config.user || !config.password) {
        return res.status(500).json({ error: 'Email account not configured' })
      }

      const limit = parseInt(req.query.limit || '50')
      const folder = req.query.folder || 'INBOX'

      const client = createImapClient(config)
      await client.connect()

      const lock = await client.getMailboxLock(folder)

      try {
        const messages: any[] = []

        // Fetch latest messages
        const fetchRange = client.mailbox?.exists
          ? `${Math.max(1, (client.mailbox.exists as number) - limit + 1)}:*`
          : '1:*'

        for await (const message of client.fetch(fetchRange, {
          envelope: true,
          source: true,
          flags: true,
        })) {
          const parsed = await simpleParser(message.source)

          messages.push({
            uid: message.uid,
            message_id: message.envelope?.messageId,
            from: message.envelope?.from?.[0] || null,
            to: message.envelope?.to || [],
            subject: message.envelope?.subject || '(kein Betreff)',
            date: message.envelope?.date?.toISOString() || null,
            text: parsed.text?.substring(0, 500) || null,
            html: parsed.html || null,
            flags: Array.from(message.flags || []),
            seen: message.flags?.has('\\Seen') || false,
          })
        }

        // Reverse: newest first
        messages.reverse()

        return res.json({ data: messages, total: messages.length })
      } finally {
        lock.release()
        await client.logout()
      }
    } catch (err: any) {
      logger.error(`IMAP inbox error: ${err.message}`)
      return res.status(500).json({ error: err.message })
    }
  })

  // ─── POST /email-service/sync ───────────────────────────────────

  router.post('/sync', async (req: any, res: any) => {
    try {
      if (!req.accountability?.user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const config = getAccountConfig()

      if (!config.user || !config.password) {
        return res.status(500).json({ error: 'Email account not configured' })
      }

      const limit = parseInt(req.query.limit || '20')
      const client = createImapClient(config)
      await client.connect()

      const lock = await client.getMailboxLock('INBOX')
      const schema = await getSchema()
      const { ItemsService } = services

      const activitiesService = new ItemsService('nursing_home_lead_activities', {
        schema,
        accountability: req.accountability,
      })

      let synced = 0

      try {
        const fetchRange = client.mailbox?.exists
          ? `${Math.max(1, (client.mailbox.exists as number) - limit + 1)}:*`
          : '1:*'

        for await (const message of client.fetch(fetchRange, {
          envelope: true,
          source: true,
        })) {
          const parsed = await simpleParser(message.source)
          const messageId = message.envelope?.messageId

          if (!messageId) continue

          // Check if already synced (by message_id in metadata)
          const existing = await activitiesService.readByQuery({
            filter: {
              metadata: { _contains: messageId },
              type: { _eq: 'email_received' },
            },
            limit: 1,
          })

          if (existing.length > 0) continue

          // Try to match sender to a lead contact
          const fromEmail = message.envelope?.from?.[0]?.address
          let leadId = null

          if (fromEmail) {
            const { ItemsService: ContactsService } = services
            const contactsSvc = new ContactsService('nursing_home_contacts', {
              schema,
              accountability: req.accountability,
            })

            const contacts = await contactsSvc.readByQuery({
              filter: { email: { _eq: fromEmail } },
              limit: 1,
              fields: ['nursing_home_id'],
            })

            if (contacts.length > 0) {
              // Find lead by nursing_home_id
              const leadsSvc = new ItemsService('nursing_home_leads', {
                schema,
                accountability: req.accountability,
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

          // Create activity (even without lead match for manual assignment later)
          if (leadId) {
            await activitiesService.createOne({
              nursing_home_lead_id: leadId,
              type: 'email_received',
              subject: message.envelope?.subject || '(kein Betreff)',
              content: parsed.text?.substring(0, 2000) || null,
              direction: 'inbound',
              metadata: {
                message_id: messageId,
                from: message.envelope?.from?.[0],
                to: message.envelope?.to,
                date: message.envelope?.date?.toISOString(),
                provider: config.provider,
              },
            })
            synced++
          }
        }
      } finally {
        lock.release()
        await client.logout()
      }

      return res.json({ success: true, synced })
    } catch (err: any) {
      logger.error(`Email sync error: ${err.message}`)
      return res.status(500).json({ error: err.message })
    }
  })

  // ─── GET /email-service/accounts ────────────────────────────────

  router.get('/accounts', async (req: any, res: any) => {
    if (!req.accountability?.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const config = getAccountConfig()

    return res.json({
      data: [{
        provider: config.provider,
        user: config.user,
        configured: !!(config.user && config.password),
        imap_host: config.imap.host,
        smtp_host: config.smtp.host,
      }],
    })
  })
})
