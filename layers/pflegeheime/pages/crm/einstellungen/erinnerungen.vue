<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <div>
        <h2 class="text-[16px] font-semibold text-gray-900">Automatische Erinnerungen</h2>
        <p class="text-[11px] text-gray-400 mt-1">Regeln fuer automatische Erinnerungen und Follow-up-Benachrichtigungen konfigurieren.</p>
      </div>
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-[#172774] hover:bg-[#3d4a8e] rounded-lg transition-colors"
        @click="showNewRule = !showNewRule"
      >
        <i class="pi pi-plus text-[10px]" />
        Neue Regel
      </button>
    </div>

    <!-- Backend info banner -->
    <div class="flex items-center gap-2 px-3 py-2 mb-4 bg-amber-50 border border-amber-200/60 rounded-lg">
      <i class="pi pi-info-circle text-[11px] text-amber-500" />
      <p class="text-[10px] text-amber-700">Backend-Integration folgt. Die Regeln werden lokal gespeichert und koennen bereits konfiguriert werden.</p>
    </div>

    <!-- New rule form -->
    <div v-if="showNewRule" class="bg-white rounded-lg border border-[#172774]/20 p-4 mb-4">
      <h4 class="text-[12px] font-semibold text-gray-800 mb-3">Neue Regel erstellen</h4>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Name</label>
          <input
            v-model="newRule.name"
            type="text"
            placeholder="z.B. Follow-up Erinnerung"
            class="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
          />
        </div>
        <div>
          <label class="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Trigger</label>
          <select
            v-model="newRule.trigger_type"
            class="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
          >
            <option v-for="t in triggerTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tage</label>
          <input
            v-model.number="newRule.days"
            type="number"
            min="1"
            max="365"
            placeholder="7"
            class="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
          />
        </div>
        <div>
          <label class="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">E-Mail Vorlage</label>
          <select
            v-model="newRule.template"
            class="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
          >
            <option value="">Keine Vorlage</option>
            <option value="follow_up_standard">Follow-up Standard</option>
            <option value="no_activity_reminder">Inaktivitaets-Erinnerung</option>
            <option value="stage_stale_nudge">Stufen-Erinnerung</option>
          </select>
        </div>
      </div>
      <div class="flex items-center gap-2 mt-3">
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-[#172774] hover:bg-[#3d4a8e] rounded-md transition-colors disabled:opacity-50"
          :disabled="!newRule.name"
          @click="addRule"
        >
          <i class="pi pi-check text-[10px]" />
          Regel erstellen
        </button>
        <button
          class="px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
          @click="showNewRule = false"
        >
          Abbrechen
        </button>
      </div>
    </div>

    <!-- Suggested rules -->
    <div v-if="rules.length === 0 && !showNewRule" class="mb-5">
      <h4 class="text-[12px] font-semibold text-gray-600 mb-2">Vorgeschlagene Regeln</h4>
      <div class="space-y-2">
        <div
          v-for="suggestion in suggestions"
          :key="suggestion.name"
          class="bg-white rounded-lg border border-dashed border-gray-200 px-4 py-3 hover:border-[#172774]/30 transition-colors cursor-pointer"
          @click="applySuggestion(suggestion)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-[#172774]/5 flex items-center justify-center">
                <i class="pi pi-bell text-[12px] text-[#172774]" />
              </div>
              <div>
                <p class="text-[12px] font-medium text-gray-800">{{ suggestion.name }}</p>
                <p class="text-[10px] text-gray-400 mt-0.5">{{ suggestion.description }}</p>
              </div>
            </div>
            <button class="text-[10px] text-[#172774] hover:underline font-medium">
              Uebernehmen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Rules list -->
    <div v-if="rules.length > 0" class="space-y-2">
      <div
        v-for="(rule, idx) in rules"
        :key="idx"
        class="bg-white rounded-lg border border-gray-200/80 px-4 py-3 hover:border-gray-300 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-[12px] font-medium text-gray-800">{{ rule.name }}</p>
              <span
                class="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                :class="rule.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'"
              >
                {{ rule.is_active ? 'Aktiv' : 'Inaktiv' }}
              </span>
            </div>
            <div class="flex items-center gap-3 mt-1.5">
              <span class="text-[10px] text-gray-500 flex items-center gap-1">
                <i class="pi pi-bolt text-[9px]" />
                {{ triggerLabel(rule.trigger_type) }}
              </span>
              <span class="text-[10px] text-gray-500 flex items-center gap-1">
                <i class="pi pi-clock text-[9px]" />
                {{ rule.days }} Tage
              </span>
              <span v-if="rule.template" class="text-[10px] text-gray-500 flex items-center gap-1">
                <i class="pi pi-envelope text-[9px]" />
                {{ rule.template }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-3 ml-3">
            <!-- Active toggle -->
            <button
              class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
              :class="rule.is_active ? 'bg-[#172774]' : 'bg-gray-200'"
              @click="toggleRule(idx)"
            >
              <span
                class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm"
                :class="rule.is_active ? 'translate-x-[18px]' : 'translate-x-[3px]'"
              />
            </button>
            <button
              class="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
              title="Entfernen"
              @click="removeRule(idx)"
            >
              <i class="pi pi-trash text-[11px]" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state (after suggestions used) -->
    <div v-if="rules.length === 0 && showNewRule" class="text-center py-8">
      <i class="pi pi-bell text-3xl text-gray-200 mb-3" />
      <p class="text-[12px] text-gray-400">Noch keine Regeln angelegt</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'crm', middleware: 'auth' })

interface ReminderRule {
  name: string
  trigger_type: 'no_activity_days' | 'follow_up_overdue' | 'stage_stale'
  days: number
  template: string
  is_active: boolean
}

const triggerTypes = [
  { value: 'no_activity_days', label: 'Keine Aktivitaet seit X Tagen' },
  { value: 'follow_up_overdue', label: 'Follow-up ueberfaellig' },
  { value: 'stage_stale', label: 'Stufe unveraendert seit X Tagen' },
]

const suggestions = [
  {
    name: 'Kein Kontakt seit 7 Tagen',
    description: 'Erinnerung, wenn ein Lead 7 Tage keine Aktivitaet hatte',
    trigger_type: 'no_activity_days' as const,
    days: 7,
    template: 'no_activity_reminder',
  },
  {
    name: 'Follow-up ueberfaellig',
    description: 'Benachrichtigung, wenn das Follow-up-Datum ueberschritten ist',
    trigger_type: 'follow_up_overdue' as const,
    days: 1,
    template: 'follow_up_standard',
  },
  {
    name: 'Lead ohne Aktivitaet 14 Tage',
    description: 'Warnung bei Leads, die 14 Tage ohne jegliche Aktivitaet sind',
    trigger_type: 'no_activity_days' as const,
    days: 14,
    template: 'no_activity_reminder',
  },
]

const showNewRule = ref(false)
const newRule = ref<ReminderRule>({
  name: '',
  trigger_type: 'no_activity_days',
  days: 7,
  template: '',
  is_active: true,
})

const rules = ref<ReminderRule[]>([])

const triggerLabel = (type: string) =>
  triggerTypes.find(t => t.value === type)?.label || type

const addRule = () => {
  if (!newRule.value.name) return
  rules.value.push({ ...newRule.value })
  newRule.value = { name: '', trigger_type: 'no_activity_days', days: 7, template: '', is_active: true }
  showNewRule.value = false
  saveRules()
}

const applySuggestion = (suggestion: typeof suggestions[0]) => {
  rules.value.push({
    name: suggestion.name,
    trigger_type: suggestion.trigger_type,
    days: suggestion.days,
    template: suggestion.template,
    is_active: true,
  })
  saveRules()
}

const toggleRule = (idx: number) => {
  rules.value[idx].is_active = !rules.value[idx].is_active
  saveRules()
}

const removeRule = (idx: number) => {
  rules.value.splice(idx, 1)
  saveRules()
}

const saveRules = () => {
  try {
    localStorage.setItem('crm_reminder_rules', JSON.stringify(rules.value))
  } catch { /* ignore */ }
}

const loadRules = () => {
  try {
    const stored = localStorage.getItem('crm_reminder_rules')
    if (stored) rules.value = JSON.parse(stored)
  } catch { /* ignore */ }
}

onMounted(loadRules)
</script>
