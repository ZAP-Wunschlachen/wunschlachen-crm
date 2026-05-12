/**
 * Auto-Assign Endpoint (Phase 9 T7)
 *
 * Wird intern aufgerufen wenn neues Ticket erstellt wird ODER per Cron
 * für alle unassignten Tickets. Strategie aktuell: Round-Robin über aktive
 * Internal-User. Erweiterbar zu Skill-basiert / Workload-basiert.
 *
 * Body: { ticket_id?: string }  (wenn nicht gesetzt: alle unassignten)
 */

import { defineEventHandler, readBody, createError, getRequestHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const cronSecret = (config.cronSecret as string) || ''
  if (cronSecret) {
    const supplied = getRequestHeader(event, 'x-cron-secret')
    if (supplied !== cronSecret) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid cron secret' })
    }
  }

  const body = await readBody<{ ticket_id?: string }>(event).catch(() => ({}))
  const directusUrl = config.public.directusUrl as string
  const authHeader = config.brevoToken ? `Bearer ${config.brevoToken}` : ''

  // Aktive interne User holen (vereinfacht: alle Active-User mit Rolle != customer)
  const usersRes = await $fetch<{ data: any[] }>(`${directusUrl}/users`, {
    params: {
      'filter[status][_eq]': 'active',
      'filter[role][_neq]': 'customer',
      fields: 'id,first_name,last_name',
      limit: 100,
    },
    headers: authHeader ? { Authorization: authHeader } : {},
  }).catch(() => ({ data: [] }))

  const users = usersRes.data || []
  if (users.length === 0) {
    return { success: false, error: 'Keine internen User gefunden' }
  }

  // Unassignte Tickets
  const targetFilter = body.ticket_id
    ? { 'filter[id][_eq]': body.ticket_id }
    : { 'filter[assignee_id][_null]': true, 'filter[status][_in]': 'neu,offen' }

  const unassigned = await $fetch<{ data: any[] }>(`${directusUrl}/items/tickets`, {
    params: {
      ...targetFilter,
      fields: 'id,customer_type',
      limit: 200,
    },
    headers: authHeader ? { Authorization: authHeader } : {},
  }).catch(() => ({ data: [] }))

  const assigned: { ticket_id: string; user_id: string }[] = []
  let idx = 0
  for (const t of unassigned.data || []) {
    const user = users[idx % users.length]
    idx++
    try {
      await $fetch(`${directusUrl}/items/tickets/${t.id}`, {
        method: 'PATCH',
        body: { assignee_id: user.id },
        headers: authHeader
          ? { Authorization: authHeader, 'Content-Type': 'application/json' }
          : { 'Content-Type': 'application/json' },
      })
      assigned.push({ ticket_id: t.id, user_id: user.id })
    } catch (err) {
      console.warn(`[auto-assign] failed for ticket ${t.id}:`, err)
    }
  }

  return { success: true, total: unassigned.data?.length || 0, assigned_count: assigned.length, assigned }
})
