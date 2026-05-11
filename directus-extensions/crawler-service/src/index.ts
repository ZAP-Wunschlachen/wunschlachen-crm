/**
 * Directus Endpoint Extension: CRM Crawler Service
 *
 * Crawls public nursing home directories and matches against existing data.
 * Endpoints:
 *   POST /crawler-service/crawl       — Run a crawl for a given source
 *   GET  /crawler-service/results     — Get crawl results
 *   POST /crawler-service/import      — Import a crawl result as nursing_home + lead
 *   POST /crawler-service/import-bulk — Import multiple results at once
 *   POST /crawler-service/dismiss     — Remove a result
 */

import { defineEndpoint } from '@directus/extensions-sdk'
import * as cheerio from 'cheerio'

interface CrawledHome {
  name: string
  street?: string
  number?: string
  zip?: string
  city?: string
  phone?: string
  email?: string
  website?: string
  capacity?: number
  source_url?: string
  source_type: string
}

type CrawlResult = CrawledHome & {
  id: string
  found_date: string
  status: 'new' | 'existing' | 'updated'
}

// In-memory storage (resets on Directus restart)
let crawlResults: CrawlResult[] = []
let lastCrawlDate: string | null = null

export default defineEndpoint((router, context) => {
  const { services, getSchema, logger } = context

  // ─── Helpers ──────────────────────────────────────────────────────

  const fetchPage = async (url: string): Promise<string> => {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    return await response.text()
  }

  /**
   * Parse German address: "Musterstr. 12, 50674 Köln" → {street, number, zip, city}
   */
  const parseAddress = (raw: string): { street?: string; number?: string; zip?: string; city?: string } => {
    const result: { street?: string; number?: string; zip?: string; city?: string } = {}
    const clean = raw.replace(/\s+/g, ' ').trim()

    // Extract ZIP + city
    const zipMatch = clean.match(/(\d{5})\s+([A-Za-zäöüÄÖÜßé\s\-\.\/]+)/)
    if (zipMatch) {
      result.zip = zipMatch[1]
      result.city = zipMatch[2].replace(/[,;].*$/, '').trim()
    }

    // Extract street + number (everything before the ZIP)
    const streetPart = clean.replace(/,?\s*\d{5}\s+.*$/, '').trim()
    if (streetPart) {
      // "Musterstr. 12a" or "Musterstraße 12-14"
      const streetMatch = streetPart.match(/^(.+?)\s+(\d+[\s\-\/]*\w*\d*)$/)
      if (streetMatch) {
        result.street = streetMatch[1].trim()
        result.number = streetMatch[2].trim()
      } else {
        result.street = streetPart
      }
    }

    return result
  }

  /**
   * Clean text: remove excessive whitespace, SVG remnants, etc.
   */
  const cleanText = (text: string): string => {
    return text
      .replace(/\s+/g, ' ')
      .replace(/^\s+|\s+$/g, '')
      .trim()
  }

  /**
   * Deduplicate by name (case-insensitive)
   */
  const deduplicateHomes = (homes: CrawledHome[]): CrawledHome[] => {
    const seen = new Set<string>()
    return homes.filter(home => {
      const key = home.name.toLowerCase().trim()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  // ─── Site-specific Scrapers ───────────────────────────────────────

  /**
   * Seniorenportal.de — uses .teaser-item-wrapper cards with h2 for names
   */
  const scrapeSeniorenportal = ($: cheerio.CheerioAPI, url: string): CrawledHome[] => {
    const homes: CrawledHome[] = []

    $('.teaser-item-wrapper').each((_i, el) => {
      const $el = $(el)

      // Name is in h2 element
      const name = cleanText($el.find('h2').first().text())
      if (!name || name.length < 3) return

      // Address from inner HTML — match street patterns + 5-digit ZIP
      const innerHtml = $el.html() || ''
      const addrMatch = innerHtml.match(
        /([A-Za-zäöüÄÖÜßé\.\-\s]+\s+\d+[^,<]{0,10}),?\s*(\d{5})\s+([A-Za-zäöüÄÖÜßé\s\-]+?)(?:<|$)/i
      )

      let addr: { street?: string; number?: string; zip?: string; city?: string } = {}
      if (addrMatch) {
        const streetFull = addrMatch[1].trim()
        const streetParts = streetFull.match(/^(.+?)\s+(\d+[\-\/\w]*)$/)
        addr = {
          street: streetParts ? streetParts[1] : streetFull,
          number: streetParts ? streetParts[2] : undefined,
          zip: addrMatch[2],
          city: addrMatch[3].trim(),
        }
      }

      // Website from facility link
      const link = $el.find('a[href*="/betreuungsangebote/"]').first().attr('href')
        || $el.find('a[href*="/anbieter/"]').first().attr('href')
      const website = link
        ? (link.startsWith('http') ? link : `https://www.seniorenportal.de${link}`)
        : undefined

      homes.push({ name, ...addr, website, source_url: url, source_type: 'seniorenportal' })
    })

    return deduplicateHomes(homes)
  }

  // ─── Generic Scraper ──────────────────────────────────────────────

  const scrapeGeneric = ($: cheerio.CheerioAPI, url: string): CrawledHome[] => {
    const homes: CrawledHome[] = []

    // Strategy 1: JSON-LD structured data
    $('script[type="application/ld+json"]').each((_i, el) => {
      try {
        const data = JSON.parse($(el).html() || '')
        const items = Array.isArray(data) ? data : [data]
        for (const item of items) {
          if (['LocalBusiness', 'MedicalOrganization', 'NursingHome', 'Hospital'].includes(item['@type'])) {
            const addr = item.address || {}
            const addrParsed = addr.streetAddress ? parseAddress(`${addr.streetAddress}, ${addr.postalCode || ''} ${addr.addressLocality || ''}`) : {}
            homes.push({
              name: item.name,
              ...addrParsed,
              zip: addr.postalCode || addrParsed.zip,
              city: addr.addressLocality || addrParsed.city,
              phone: item.telephone,
              email: item.email,
              website: item.url,
              source_url: url,
              source_type: 'json_ld',
            })
          }
        }
      } catch { /* malformed JSON-LD */ }
    })

    if (homes.length > 0) return deduplicateHomes(homes)

    // Strategy 2: CSS selector patterns for list items
    const cardSelectors = [
      '.facility-card', '.result-item', '.search-result', '.listing-item',
      '.institution-card', '.care-facility', '.einrichtung', '.pflegeheim',
      '.result-entry', '.entry-card', '.teaser-item-wrapper',
      'article.result', '[data-facility]',
    ]

    for (const selector of cardSelectors) {
      const items = $(selector)
      if (items.length < 2) continue // Need at least 2 to be a list

      items.each((_i, el) => {
        const $el = $(el)
        const name = cleanText($el.find('h2, h3, h4, .name, .title, .facility-name').first().text())
        if (!name || name.length < 3) return

        // Address
        const addrEl = $el.find('.address, .addr, .location, .anschrift').first()
        let addr: ReturnType<typeof parseAddress> = {}
        if (addrEl.length) {
          addr = parseAddress(cleanText(addrEl.text()))
        } else {
          // Fallback: search for address pattern in full text
          const text = cleanText($el.text())
          const addrMatch = text.match(/[A-Za-zäöüÄÖÜß\.\-]+\s+\d+[a-z]?,?\s*\d{5}\s+[A-Za-zäöüÄÖÜß\s\-]+/)
          if (addrMatch) addr = parseAddress(addrMatch[0])
        }

        // Phone
        const phoneHref = $el.find('a[href^="tel:"]').first().attr('href')
        const phoneText = $el.find('.phone, .telefon, .tel').first().text()
        const phone = phoneHref?.replace('tel:', '') || cleanText(phoneText) || undefined

        // Email
        const emailHref = $el.find('a[href^="mailto:"]').first().attr('href')
        const emailText = $el.find('.email, .mail').first().text()
        const email = emailHref?.replace('mailto:', '') || cleanText(emailText) || undefined

        // Website
        const website = $el.find('a[href^="http"]:not([href*="tel"]):not([href*="mailto"])').first().attr('href')

        // Capacity
        const capText = $el.find('.capacity, .plaetze, .beds').first().text()
        const capMatch = capText.match(/(\d+)/)

        homes.push({
          name,
          ...addr,
          phone: phone || undefined,
          email: email || undefined,
          website: website || undefined,
          capacity: capMatch ? parseInt(capMatch[1]) : undefined,
          source_url: url,
          source_type: 'css_pattern',
        })
      })

      if (homes.length > 0) return deduplicateHomes(homes)
    }

    // Strategy 3: Tables
    $('table').each((_i, table) => {
      const $table = $(table)
      const rows = $table.find('tr')
      if (rows.length < 3) return

      const headerText = $table.find('th').text().toLowerCase()
      const isRelevant = ['name', 'einrichtung', 'pflegeheim', 'heim', 'facility'].some(
        kw => headerText.includes(kw)
      )
      if (!isRelevant) return

      rows.each((_j, row) => {
        if (_j === 0) return // Skip header
        const cells = $(row).find('td')
        if (cells.length < 2) return

        const name = cleanText(cells.eq(0).text())
        if (!name || name.length < 3) return

        const addrText = cleanText(cells.eq(1).text())
        const addr = addrText ? parseAddress(addrText) : {}
        const phone = cells.length > 2 ? cleanText(cells.eq(2).text()) : undefined

        homes.push({
          name, ...addr,
          phone: phone || undefined,
          source_url: url,
          source_type: 'table',
        })
      })
    })

    return deduplicateHomes(homes)
  }

  // ─── Main Scraper ─────────────────────────────────────────────────

  const scrapeUrl = async (url: string, type?: string): Promise<CrawledHome[]> => {
    const html = await fetchPage(url)
    const $ = cheerio.load(html)

    // Try site-specific scraper first
    if (url.includes('seniorenportal.de')) {
      const results = scrapeSeniorenportal($, url)
      if (results.length > 0) return results
    }

    // Fallback to generic
    return scrapeGeneric($, url)
  }

  // ─── Match Against Existing ───────────────────────────────────────

  const matchExisting = async (
    crawled: CrawledHome[],
    accountability: any
  ): Promise<CrawlResult[]> => {
    const schema = await getSchema()
    const { ItemsService } = services

    const nhService = new ItemsService('nursing_home', { schema, accountability })
    const existing = await nhService.readByQuery({
      fields: ['id', 'name', 'city', 'zip', 'email', 'fone'],
      limit: -1,
    })

    const now = new Date().toISOString()

    return crawled.map((home, idx) => {
      // Exact match: same name + same city or ZIP
      const exactMatch = existing.find((ex: any) => {
        const nameMatch = ex.name?.toLowerCase().trim() === home.name?.toLowerCase().trim()
        const locMatch = (home.city && ex.city?.toLowerCase().trim() === home.city?.toLowerCase().trim())
          || (home.zip && ex.zip === home.zip)
        return nameMatch && locMatch
      })

      // Partial match: name contains the other + same location
      const partialMatch = !exactMatch ? existing.find((ex: any) => {
        const exName = (ex.name || '').toLowerCase().trim()
        const crawlName = (home.name || '').toLowerCase().trim()
        if (exName.length < 6 || crawlName.length < 6) return false
        const nameOverlap = exName.includes(crawlName) || crawlName.includes(exName)
        const locMatch = (home.city?.toLowerCase() === ex.city?.toLowerCase()) || (home.zip === ex.zip)
        return nameOverlap && locMatch
      }) : null

      let status: 'new' | 'existing' | 'updated' = 'new'
      if (exactMatch || partialMatch) {
        const match = exactMatch || partialMatch
        const hasNewData = (home.email && !match.email) || (home.phone && !match.fone)
        status = hasNewData ? 'updated' : 'existing'
      }

      return {
        ...home,
        id: `crawl_${Date.now()}_${idx}`,
        found_date: now,
        status,
      }
    })
  }

  // ─── Endpoints ────────────────────────────────────────────────────

  router.post('/crawl', async (req: any, res: any) => {
    try {
      if (!req.accountability?.user) return res.status(401).json({ error: 'Unauthorized' })

      const { url, type, name } = req.body
      if (!url) return res.status(400).json({ error: 'Missing required field: url' })

      logger.info(`Starting crawl: ${name || url} (type: ${type || 'auto'})`)

      const crawled = await scrapeUrl(url, type)

      if (crawled.length === 0) {
        return res.json({
          success: true,
          message: 'Keine Pflegeheime auf dieser Seite gefunden. Die Seite lädt Daten vermutlich per JavaScript — versuche eine andere URL oder eine Seite mit statischem HTML.',
          results: [],
          total: 0,
        })
      }

      const results = await matchExisting(crawled, req.accountability)
      crawlResults = results
      lastCrawlDate = new Date().toISOString()

      const summary = {
        total: results.length,
        new_count: results.filter(r => r.status === 'new').length,
        existing_count: results.filter(r => r.status === 'existing').length,
        updated_count: results.filter(r => r.status === 'updated').length,
      }

      logger.info(`Crawl complete: ${summary.total} found (${summary.new_count} new, ${summary.existing_count} existing, ${summary.updated_count} updated)`)

      return res.json({ success: true, results, ...summary, last_crawl: lastCrawlDate })
    } catch (err: any) {
      logger.error(`Crawl error: ${err.message}`)
      return res.status(500).json({ error: err.message })
    }
  })

  router.get('/results', async (req: any, res: any) => {
    if (!req.accountability?.user) return res.status(401).json({ error: 'Unauthorized' })
    return res.json({ data: crawlResults, total: crawlResults.length, last_crawl: lastCrawlDate })
  })

  router.post('/import', async (req: any, res: any) => {
    try {
      if (!req.accountability?.user) return res.status(401).json({ error: 'Unauthorized' })

      const { result_id } = req.body
      if (!result_id) return res.status(400).json({ error: 'Missing: result_id' })

      const result = crawlResults.find(r => r.id === result_id)
      if (!result) return res.status(404).json({ error: 'Result not found' })

      const schema = await getSchema()
      const { ItemsService } = services

      const nhData: Record<string, any> = { name: result.name }
      if (result.street) nhData.Street = result.street
      if (result.number) nhData.number = result.number
      if (result.zip) nhData.zip = result.zip
      if (result.city) nhData.city = result.city
      if (result.phone) nhData.fone = result.phone
      if (result.email) nhData.email = result.email
      if (result.website) nhData.website = result.website
      if (result.capacity) nhData.total_capacity = result.capacity

      const nhId = await new ItemsService('nursing_home', { schema, accountability: req.accountability }).createOne(nhData)
      const leadId = await new ItemsService('nursing_home_leads', { schema, accountability: req.accountability }).createOne({
        nursing_home_id: nhId,
        opportunity_stage: 'Unqualified',
      })

      result.status = 'existing'
      logger.info(`Imported: ${result.name} → NH:${nhId}, Lead:${leadId}`)

      return res.json({ success: true, nursing_home_id: nhId, lead_id: leadId })
    } catch (err: any) {
      logger.error(`Import error: ${err.message}`)
      return res.status(500).json({ error: err.message })
    }
  })

  router.post('/import-bulk', async (req: any, res: any) => {
    try {
      if (!req.accountability?.user) return res.status(401).json({ error: 'Unauthorized' })

      const { result_ids } = req.body
      if (!result_ids?.length) return res.status(400).json({ error: 'Missing: result_ids' })

      const schema = await getSchema()
      const { ItemsService } = services
      const nhService = new ItemsService('nursing_home', { schema, accountability: req.accountability })
      const leadService = new ItemsService('nursing_home_leads', { schema, accountability: req.accountability })

      const imported: { name: string; nursing_home_id: any; lead_id: any }[] = []
      const errors: { name: string; error: string }[] = []

      for (const resultId of result_ids) {
        const result = crawlResults.find(r => r.id === resultId && r.status === 'new')
        if (!result) continue

        try {
          const nhData: Record<string, any> = { name: result.name }
          if (result.street) nhData.Street = result.street
          if (result.number) nhData.number = result.number
          if (result.zip) nhData.zip = result.zip
          if (result.city) nhData.city = result.city
          if (result.phone) nhData.fone = result.phone
          if (result.email) nhData.email = result.email
          if (result.website) nhData.website = result.website
          if (result.capacity) nhData.total_capacity = result.capacity

          const nhId = await nhService.createOne(nhData)
          const leadId = await leadService.createOne({ nursing_home_id: nhId, opportunity_stage: 'Unqualified' })

          result.status = 'existing'
          imported.push({ name: result.name, nursing_home_id: nhId, lead_id: leadId })
        } catch (err: any) {
          errors.push({ name: result.name, error: err.message })
        }
      }

      logger.info(`Bulk import: ${imported.length} OK, ${errors.length} errors`)
      return res.json({ success: true, imported: imported.length, errors: errors.length, details: { imported, errors } })
    } catch (err: any) {
      logger.error(`Bulk import error: ${err.message}`)
      return res.status(500).json({ error: err.message })
    }
  })

  router.post('/dismiss', async (req: any, res: any) => {
    if (!req.accountability?.user) return res.status(401).json({ error: 'Unauthorized' })
    crawlResults = crawlResults.filter(r => r.id !== req.body.result_id)
    return res.json({ success: true })
  })
})
