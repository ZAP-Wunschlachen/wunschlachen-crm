# Speed-to-Lead-Cockpit + Smart-Callback MVP Plan

**Goal:** Sales-Agent sieht beim Login die priorisierte Anrufliste. Bei nicht erreichten Leads schlägt das System automatisch einen neuen Slot vor (Rotation: jetzt → +2h andere Tageszeit → +1 Tag anderer Wochentag → Fail-Email/SMS). Erfolgreiche Slots lernen `lead.successful_call_window`.

**Architecture:** Pure-Logic-Composable `useCallbackScheduler` mit Slot-Rotation und Lern-Funktion. Composable `useSpeedToLead` (existiert) liefert Top-Priority-Leads. UI: Filter-Mode "Anruf-Schlange" in `pages/patienten/leads/index.vue`. Aktionen "Nicht erreicht" / "Erreicht" auf der Lead-Detail-Seite triggern die Rotation.

**Spec:** `docs/specs/2026-05-13-patient-funnel-automation.md` §3 Modul B

## File Structure

**New:**
- `layers/patienten/composables/useCallbackScheduler.ts` — Pure-Logic Slot-Rotation
- `layers/patienten/composables/useCallbackScheduler.test.ts` — Unit-Tests

**Modified:**
- `layers/patienten/types/crm.ts` — `Lead.successful_call_window`, `last_call_attempt_at`, `call_attempt_count`, `next_call_slot_at`
- `layers/patienten/pages/patienten/leads/[id].vue` — Buttons "Nicht erreicht" + "Erreicht" mit Slot-Rotation
- `layers/patienten/pages/patienten/leads/index.vue` — Sortier-Mode "Anruf-Schlange"

## Tasks

### Task 1: Lead-Type erweitern

Edit `layers/patienten/types/crm.ts`, nach den Appointment-Sync-Feldern:

```ts
  // Speed-to-Lead + Smart-Callback (Plan v9 Modul B MVP)
  successful_call_window?: 'morning' | 'midday' | 'evening'   // gelernter erfolgreicher Slot
  last_call_attempt_at?: string                               // ISO timestamp
  call_attempt_count?: number                                 // Anzahl Versuche im aktuellen Sub-Status
  next_call_slot_at?: string                                  // Vorgeschlagener nächster Slot
```

Commit: `feat(types): Lead.{successful_call_window,last_call_attempt_at,call_attempt_count,next_call_slot_at}`

### Task 2: `useCallbackScheduler` + Tests (TDD)

Tests-File `layers/patienten/composables/useCallbackScheduler.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { useCallbackScheduler } from './useCallbackScheduler'
import type { Lead } from '../types/crm'

const mkLead = (overrides: Partial<Lead> = {}): Lead => ({
  id: 'l-1', first_name: 'A', last_name: 'B', mail: 'a@b.de',
  status: 'new', date_created: '2026-05-01T08:00:00Z', date_updated: '2026-05-01T08:00:00Z',
  ...overrides,
})

describe('useCallbackScheduler.classifySlot', () => {
  const { classifySlot } = useCallbackScheduler()

  it('morning für 08-11 Uhr', () => {
    expect(classifySlot(new Date('2026-05-01T09:00:00Z'))).toBe('morning')
    expect(classifySlot(new Date('2026-05-01T10:30:00Z'))).toBe('morning')
  })
  it('midday für 11-15 Uhr', () => {
    expect(classifySlot(new Date('2026-05-01T12:00:00Z'))).toBe('midday')
    expect(classifySlot(new Date('2026-05-01T14:30:00Z'))).toBe('midday')
  })
  it('evening für 15-20 Uhr', () => {
    expect(classifySlot(new Date('2026-05-01T16:00:00Z'))).toBe('evening')
    expect(classifySlot(new Date('2026-05-01T19:30:00Z'))).toBe('evening')
  })
  it('null außerhalb Geschäftszeiten', () => {
    expect(classifySlot(new Date('2026-05-01T05:00:00Z'))).toBeNull()
    expect(classifySlot(new Date('2026-05-01T23:00:00Z'))).toBeNull()
  })
})

describe('useCallbackScheduler.nextRetrySlot', () => {
  const { nextRetrySlot } = useCallbackScheduler()
  const now = new Date('2026-05-04T10:00:00Z') // Montag morgen

  it('Versuch 1 → +2h (anderer Slot)', () => {
    const lead = mkLead({ call_attempt_count: 1, last_call_attempt_at: now.toISOString() })
    const next = nextRetrySlot(lead, now)
    expect(next).not.toBeNull()
    const diffHours = (next!.getTime() - now.getTime()) / 3600000
    expect(diffHours).toBeGreaterThanOrEqual(2)
    expect(diffHours).toBeLessThan(5)
  })

  it('Versuch 2 → +1 Tag (anderer Wochentag)', () => {
    const lead = mkLead({ call_attempt_count: 2, last_call_attempt_at: now.toISOString() })
    const next = nextRetrySlot(lead, now)
    expect(next).not.toBeNull()
    const diffHours = (next!.getTime() - now.getTime()) / 3600000
    expect(diffHours).toBeGreaterThanOrEqual(20)
    expect(diffHours).toBeLessThan(30)
  })

  it('Versuch 3 → +7 Tage (Wiedervorlage nach Email/SMS)', () => {
    const lead = mkLead({ call_attempt_count: 3, last_call_attempt_at: now.toISOString() })
    const next = nextRetrySlot(lead, now)
    expect(next).not.toBeNull()
    const diffDays = (next!.getTime() - now.getTime()) / 86400000
    expect(diffDays).toBeGreaterThanOrEqual(7)
    expect(diffDays).toBeLessThan(8)
  })

  it('Versuch >3 → null (keine weiteren Versuche)', () => {
    const lead = mkLead({ call_attempt_count: 5, last_call_attempt_at: now.toISOString() })
    expect(nextRetrySlot(lead, now)).toBeNull()
  })

  it('Bei successful_call_window bevorzugt diesen Slot', () => {
    const lead = mkLead({
      call_attempt_count: 1,
      last_call_attempt_at: now.toISOString(),
      successful_call_window: 'evening',
    })
    const next = nextRetrySlot(lead, now)
    expect(next).not.toBeNull()
    const hour = next!.getUTCHours()
    expect(hour).toBeGreaterThanOrEqual(15)
    expect(hour).toBeLessThan(20)
  })
})

describe('useCallbackScheduler.shouldFailover', () => {
  const { shouldFailover } = useCallbackScheduler()

  it('true ab 3 fehlgeschlagenen Versuchen', () => {
    expect(shouldFailover({ call_attempt_count: 2 } as Lead)).toBe(false)
    expect(shouldFailover({ call_attempt_count: 3 } as Lead)).toBe(true)
    expect(shouldFailover({ call_attempt_count: 5 } as Lead)).toBe(true)
  })
})

describe('useCallbackScheduler.urgencyScore', () => {
  const { urgencyScore } = useCallbackScheduler()
  const now = new Date('2026-05-04T10:00:00Z')

  it('hoher Score für neuen, unbearbeiteten Lead', () => {
    const lead = mkLead({ status: 'new', date_created: now.toISOString() })
    expect(urgencyScore(lead, now)).toBeGreaterThan(80)
  })

  it('niedriger Score für mehrfach versuchten Lead', () => {
    const lead = mkLead({
      status: 'contacting',
      date_created: '2026-05-01T08:00:00Z',
      call_attempt_count: 3,
      last_call_attempt_at: '2026-05-04T09:00:00Z',
    })
    expect(urgencyScore(lead, now)).toBeLessThan(40)
  })

  it('Score 0 für lost/completed', () => {
    expect(urgencyScore(mkLead({ status: 'lost' }), now)).toBe(0)
    expect(urgencyScore(mkLead({ status: 'completed' }), now)).toBe(0)
  })

  it('Score 0 wenn next_call_slot_at in der Zukunft', () => {
    const lead = mkLead({
      status: 'new',
      next_call_slot_at: new Date(now.getTime() + 3600000).toISOString(),
    })
    expect(urgencyScore(lead, now)).toBe(0)
  })
})
```

Composable `layers/patienten/composables/useCallbackScheduler.ts`:

```ts
/**
 * useCallbackScheduler — Smart-Callback-Rotation (Plan v9 Modul B MVP).
 *
 * 3-Slot-Rotation + Tag-Variation + Lern-Komponente:
 *  Versuch 1 → +2h, anderer Tagesabschnitt
 *  Versuch 2 → +1 Tag, andere Tageszeit
 *  Versuch 3 → +7 Tage (vorher SMS+Email triggern, das macht der Caller)
 *  Versuch >3 → null
 *
 * Bei gelerntem successful_call_window bevorzugt dieser.
 *
 * Plus: urgencyScore() für die Anruf-Schlange-Sortierung.
 */

import type { Lead } from '~/types/crm'

export type CallSlot = 'morning' | 'midday' | 'evening'

const SLOT_HOURS: Record<CallSlot, { start: number; end: number; preferred: number }> = {
  morning: { start: 8, end: 11, preferred: 9 },
  midday:  { start: 11, end: 15, preferred: 13 },
  evening: { start: 15, end: 20, preferred: 17 },
}

const SLOT_ORDER: CallSlot[] = ['morning', 'midday', 'evening']

const nextSlotInRotation = (current: CallSlot | null): CallSlot => {
  if (!current) return 'morning'
  const idx = SLOT_ORDER.indexOf(current)
  return SLOT_ORDER[(idx + 1) % SLOT_ORDER.length]
}

const setHourInSlot = (date: Date, slot: CallSlot): Date => {
  const d = new Date(date)
  d.setUTCHours(SLOT_HOURS[slot].preferred, 0, 0, 0)
  return d
}

export const useCallbackScheduler = () => {
  const classifySlot = (when: Date): CallSlot | null => {
    const h = when.getUTCHours()
    for (const slot of SLOT_ORDER) {
      const { start, end } = SLOT_HOURS[slot]
      if (h >= start && h < end) return slot
    }
    return null
  }

  const nextRetrySlot = (lead: Lead, now: Date = new Date()): Date | null => {
    const attempts = lead.call_attempt_count ?? 0
    if (attempts >= 4) return null

    const lastTry = lead.last_call_attempt_at ? new Date(lead.last_call_attempt_at) : now
    const learnedSlot = lead.successful_call_window as CallSlot | undefined
    const currentSlot = classifySlot(lastTry)
    const targetSlot: CallSlot = learnedSlot ?? nextSlotInRotation(currentSlot)

    if (attempts === 0 || attempts === 1) {
      // +2h, im Ziel-Slot
      const candidate = setHourInSlot(lastTry, targetSlot)
      if (candidate.getTime() - lastTry.getTime() < 2 * 3600 * 1000) {
        // anderer Slot später am Tag — wenn schon vorbei, +1 Tag in den preferred Slot
        const tomorrow = new Date(lastTry)
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
        return setHourInSlot(tomorrow, targetSlot)
      }
      return candidate
    }
    if (attempts === 2) {
      // +1 Tag, andere Tageszeit (oder gelernter Slot)
      const tomorrow = new Date(lastTry)
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
      return setHourInSlot(tomorrow, targetSlot)
    }
    if (attempts === 3) {
      // +7 Tage (nach Failover-Email/SMS)
      const inWeek = new Date(lastTry)
      inWeek.setUTCDate(inWeek.getUTCDate() + 7)
      return setHourInSlot(inWeek, targetSlot)
    }
    return null
  }

  const shouldFailover = (lead: Lead): boolean => (lead.call_attempt_count ?? 0) >= 3

  /**
   * Urgency-Score 0-100 für Anruf-Schlangen-Sortierung.
   * Berücksichtigt: Status, Alter, Anzahl Versuche, Wartezeit auf nächsten Slot.
   */
  const urgencyScore = (lead: Lead, now: Date = new Date()): number => {
    if (lead.status === 'lost' || lead.status === 'completed') return 0
    if (lead.next_call_slot_at && new Date(lead.next_call_slot_at).getTime() > now.getTime()) return 0

    let score = 50
    // Status-Boost
    if (lead.status === 'new') score += 40
    else if (lead.status === 'contacting') score += 20
    else if (lead.status === 'contacted') score += 10
    // Alter (älter = dringender — Speed-to-Lead-Penalty)
    const ageHours = (now.getTime() - new Date(lead.date_created).getTime()) / 3600000
    if (ageHours < 1) score += 20
    else if (ageHours < 24) score += 10
    else if (ageHours > 72) score -= 10
    // Versuche-Penalty
    const attempts = lead.call_attempt_count ?? 0
    score -= attempts * 15
    return Math.max(0, Math.min(100, score))
  }

  return { classifySlot, nextRetrySlot, shouldFailover, urgencyScore, SLOT_ORDER }
}
```

Run + commit:
```bash
cd ~/TonyDev/wunschlachen-crm/app && npx pnpm@9 test:run 2>&1 | tail -10
cd ~/TonyDev/wunschlachen-crm
git add layers/patienten/composables/useCallbackScheduler.ts layers/patienten/composables/useCallbackScheduler.test.ts
git commit -m "feat(callback): useCallbackScheduler + 14 Unit-Tests"
```

### Task 3: Lead-Detail Buttons + UI-Reactivity

In `layers/patienten/pages/patienten/leads/[id].vue` direkt unter dem Status-Card-Block einen "Anruf-Schlange"-Block einfügen:

```vue
<div v-if="lead.status === 'new' || lead.status === 'contacting' || lead.status === 'contacted'"
  class="bg-white rounded-lg p-4 border border-dental-blue--5">
  <h2 class="text-sm font-semibold text-dental-blue-0 mb-2">Anruf-Rotation</h2>
  <div class="flex gap-2 mb-2">
    <button class="flex-1 px-3 py-1.5 text-[11px] font-medium text-white bg-green-600 hover:bg-green-700 rounded transition-colors" @click="onCallSuccess">
      <i class="pi pi-check text-[10px] mr-1" /> Erreicht
    </button>
    <button class="flex-1 px-3 py-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors" @click="onCallFailed">
      <i class="pi pi-times text-[10px] mr-1" /> Nicht erreicht
    </button>
  </div>
  <p v-if="lead.call_attempt_count" class="text-[10px] text-dental-blue--3">
    Versuche: {{ lead.call_attempt_count }}
    <span v-if="lead.next_call_slot_at" class="ml-2">· nächster Slot: {{ formatDateTime(lead.next_call_slot_at) }}</span>
    <span v-if="lead.successful_call_window" class="ml-2 italic">· erfolgreich: {{ lead.successful_call_window }}</span>
  </p>
</div>
```

Script ergänzen:

```ts
const { classifySlot, nextRetrySlot, shouldFailover } = useCallbackScheduler()

const onCallSuccess = async () => {
  if (!lead.value) return
  const now = new Date()
  const slot = classifySlot(now)
  await saveField('last_call_attempt_at', now.toISOString())
  await saveField('successful_call_window', slot)
  await saveField('next_call_slot_at', null)
  try {
    await addActivity({
      lead_id: lead.value.id,
      type: 'call',
      subject: 'Patient erreicht',
      content: `Slot: ${slot || 'außerhalb Geschäftszeit'}`,
      direction: 'outbound',
      outcome: 'successful',
      metadata: { call_slot: slot },
      date_created: now.toISOString(),
    } as any)
    await loadActivities()
  } catch (e) { console.warn(e) }
  toast.add({ severity: 'success', summary: 'Erreicht', detail: `Slot ${slot} als erfolgreich markiert` })
}

const onCallFailed = async () => {
  if (!lead.value) return
  const now = new Date()
  const attempts = (lead.value.call_attempt_count || 0) + 1
  await saveField('last_call_attempt_at', now.toISOString())
  await saveField('call_attempt_count', attempts)
  const failover = shouldFailover({ ...lead.value, call_attempt_count: attempts } as any)
  const nextSlot = nextRetrySlot({ ...lead.value, call_attempt_count: attempts, last_call_attempt_at: now.toISOString() } as any, now)
  await saveField('next_call_slot_at', nextSlot ? nextSlot.toISOString() : null)
  try {
    await addActivity({
      lead_id: lead.value.id,
      type: 'call',
      subject: failover ? `Nicht erreicht (Versuch ${attempts}, Failover SMS+Email)` : `Nicht erreicht (Versuch ${attempts})`,
      content: nextSlot ? `Nächster Slot: ${nextSlot.toLocaleString('de-DE')}` : 'Keine weiteren Versuche geplant',
      direction: 'outbound',
      outcome: 'no_contact',
      metadata: { call_slot: classifySlot(now), next_slot: nextSlot?.toISOString() },
      date_created: now.toISOString(),
    } as any)
    await loadActivities()
  } catch (e) { console.warn(e) }
  toast.add({ severity: 'warn', summary: 'Nicht erreicht', detail: nextSlot ? `Wiedervorlage: ${nextSlot.toLocaleString('de-DE')}` : 'Keine weiteren Versuche' })
}

const formatDateTime = (iso: string) => new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
```

Commit: `feat(callback): Anruf-Rotation-Card auf Lead-Detail`

### Task 4: Leads-Liste mit "Anruf-Schlange"-Sortierung

In `layers/patienten/pages/patienten/leads/index.vue` einen neuen Filter-Mode anbieten. Vermutlich existiert schon eine Sortierung — wir ergänzen einen Tab/Toggle "Anruf-Schlange" der die Leads nach `urgencyScore` sortiert.

Pragmatik: einen `<button class="px-3 py-1.5 text-xs">Anruf-Schlange</button>` neben den bestehenden Filter-Buttons und einen `callQueueMode = ref(false)`. Wenn aktiv, sortiert `displayedLeads` nach urgencyScore und filtert auf Status `new|contacting|contacted`.

Commit: `feat(callback): Leads-Liste Anruf-Schlange-Sortierung`

### Task 5: Push + Verifikation

```bash
cd ~/TonyDev/wunschlachen-crm/app && npx pnpm@9 test:run
cd ~/TonyDev/wunschlachen-crm && git push origin feat/full-merge
```

Issue im Repo anlegen + schließen mit Verweis.
