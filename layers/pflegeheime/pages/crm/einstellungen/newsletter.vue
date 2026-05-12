<template>
  <div class="max-w-4xl">
    <div class="mb-4">
      <h2 class="text-[14px] font-semibold text-gray-800">Newsletter-Workflows</h2>
      <p class="text-[11px] text-gray-400 mt-0.5">
        Edukative Inhalte an Pflegeheim-Leads senden
      </p>
    </div>

    <div class="space-y-5">
      <!-- Brevo Konfiguration -->
      <div class="bg-white rounded-lg border border-gray-200/80 p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 flex-shrink-0">
              <i class="pi pi-send text-[14px] text-blue-600" />
            </div>
            <div>
              <h3 class="text-[13px] font-semibold text-gray-800">Brevo E-Mail-Versand</h3>
              <p class="text-[11px] text-gray-400 mt-0.5">API-Zugangsdaten für den Newsletter-Versand</p>
            </div>
          </div>
          <span
            class="text-[10px] px-2 py-0.5 rounded-full font-medium"
            :class="brevoConfigured ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-600'"
          >
            {{ brevoConfigured ? 'Aktiv' : 'Nicht konfiguriert' }}
          </span>
        </div>

        <div class="space-y-3">
          <!-- API Key -->
          <div>
            <label class="block text-[11px] text-gray-500 mb-1 font-medium">API-Key</label>
            <div class="flex gap-2">
              <div class="relative flex-1">
                <input
                  :type="showApiKey ? 'text' : 'password'"
                  :value="brevoApiKey"
                  @input="updateBrevoConfig({ apiKey: ($event.target as HTMLInputElement).value })"
                  placeholder="xkeysib-..."
                  class="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] pr-8 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                />
                <button
                  @click="showApiKey = !showApiKey"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i :class="showApiKey ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-[11px]" />
                </button>
              </div>
              <button
                @click="runBrevoTest"
                :disabled="!brevoApiKey || brevoTesting"
                class="flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-30"
              >
                <i :class="brevoTesting ? 'pi pi-spin pi-spinner' : 'pi pi-bolt'" class="text-[10px]" />
                Testen
              </button>
            </div>
          </div>

          <!-- Sender Email -->
          <div>
            <label class="block text-[11px] text-gray-500 mb-1 font-medium">Absender E-Mail</label>
            <input
              type="email"
              :value="brevoSenderEmailDisplay"
              @input="updateBrevoConfig({ senderEmail: ($event.target as HTMLInputElement).value })"
              placeholder="info@wunschlachen.de"
              class="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
            />
          </div>

          <!-- Sender Name -->
          <div>
            <label class="block text-[11px] text-gray-500 mb-1 font-medium">Absender Name</label>
            <input
              type="text"
              :value="brevoSenderName"
              @input="updateBrevoConfig({ senderName: ($event.target as HTMLInputElement).value })"
              placeholder="Wunschlachen"
              class="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
            />
          </div>
        </div>

        <!-- Test Result -->
        <div v-if="brevoTestResult" class="mt-3 rounded-md p-2 text-[11px] flex items-center gap-1.5" :class="brevoTestResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
          <i :class="brevoTestResult.success ? 'pi pi-check-circle' : 'pi pi-times-circle'" class="text-[11px]" />
          {{ brevoTestResult.message }}
        </div>
      </div>

      <!-- Active subscriptions -->
      <div v-if="activeSubscriptions.length > 0" class="bg-white rounded-lg border border-gray-200/80 p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-[13px] font-semibold text-gray-800">Aktive Newsletter</h3>
          <span class="text-[10px] text-gray-400 tabular-nums">{{ activeSubscriptions.length }} aktiv</span>
        </div>
        <div class="space-y-2">
          <div
            v-for="sub in activeSubscriptions"
            :key="sub.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex items-center justify-center w-8 h-8 rounded-lg"
                :style="{ backgroundColor: getCategoryById(sub.categoryId)?.bg }"
              >
                <i
                  :class="getCategoryById(sub.categoryId)?.icon"
                  class="text-[13px]"
                  :style="{ color: getCategoryById(sub.categoryId)?.color }"
                />
              </div>
              <div>
                <p class="text-[12px] font-medium text-gray-800">{{ getTopicTitle(sub.topicId) }}</p>
                <p class="text-[10px] text-gray-400">
                  {{ getCategoryById(sub.categoryId)?.label }} ·
                  <span class="capitalize">{{ sub.frequency }}</span>
                  · {{ sub.leadIds?.length || 0 }} Leads
                  <span v-if="sub.lastSentAt"> · Zuletzt: {{ formatDate(sub.lastSentAt) }}</span>
                </p>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <button
                @click="resendSubscription(sub)"
                class="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-[#172774] bg-[#172774]/5 border border-[#172774]/20 rounded hover:bg-[#172774]/10 transition-colors"
                title="Erneut senden"
              >
                <i class="pi pi-send text-[9px]" />
                Senden
              </button>
              <button
                @click="toggleSubscription(sub.id)"
                class="flex items-center justify-center w-7 h-7 rounded hover:bg-gray-200 transition-colors"
                :title="sub.active ? 'Pausieren' : 'Aktivieren'"
              >
                <i :class="sub.active ? 'pi pi-pause' : 'pi pi-play'" class="text-[11px] text-gray-500" />
              </button>
              <button
                @click="removeSubscription(sub.id)"
                class="flex items-center justify-center w-7 h-7 rounded hover:bg-red-50 transition-colors"
                title="Entfernen"
              >
                <i class="pi pi-trash text-[11px] text-gray-400 hover:text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Category browser -->
      <div class="bg-white rounded-lg border border-gray-200/80 p-4">
        <h3 class="text-[13px] font-semibold text-gray-800 mb-3">Themen-Katalog</h3>
        <p class="text-[11px] text-gray-400 mb-4">
          Wahle Themen aus, die als Newsletter an deine Leads gesendet werden sollen.
        </p>

        <!-- Category tabs -->
        <div class="flex flex-wrap gap-1.5 mb-4">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectedCategory = cat.id"
            class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all"
            :class="selectedCategory === cat.id
              ? 'bg-[#172774] text-white shadow-sm'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'"
          >
            <i :class="cat.icon" class="text-[10px]" />
            {{ cat.label }}
          </button>
        </div>

        <!-- Topics list -->
        <div class="space-y-2">
          <div
            v-for="topic in filteredTopics"
            :key="topic.id"
            class="group p-3 rounded-lg border border-gray-100 hover:border-[#172774]/20 hover:bg-[#172774]/[0.02] transition-all"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <p class="text-[12px] font-medium text-gray-800">{{ topic.title }}</p>
                  <span
                    class="text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0"
                    :class="{
                      'bg-blue-50 text-blue-600': topic.frequency === 'einmalig',
                      'bg-green-50 text-green-600': topic.frequency === 'monatlich',
                      'bg-amber-50 text-amber-600': topic.frequency === 'quartalsweise',
                    }"
                  >
                    {{ topic.frequency }}
                  </span>
                </div>
                <p class="text-[11px] text-gray-500 leading-relaxed">{{ topic.description }}</p>
                <div class="flex flex-wrap gap-1 mt-1.5">
                  <span
                    v-for="tag in topic.tags"
                    :key="tag"
                    class="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              <div class="flex-shrink-0 flex flex-col gap-1">
                <button
                  @click="openContentEditor(topic)"
                  class="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <i class="pi pi-pencil text-[9px]" />
                  Inhalt
                </button>
                <button
                  v-if="!isSubscribed(topic.id)"
                  @click="openSubscribeDialog(topic)"
                  class="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium text-[#172774] bg-[#172774]/5 border border-[#172774]/20 rounded-md hover:bg-[#172774]/10 transition-colors"
                >
                  <i class="pi pi-send text-[9px]" />
                  Senden
                </button>
                <span
                  v-else
                  class="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium text-green-600 bg-green-50 rounded-md"
                >
                  <i class="pi pi-check text-[9px]" />
                  Aktiv
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Editor Dialog -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="contentEditorVisible" class="fixed inset-0 bg-black/30 z-[9998] flex items-center justify-center p-4" @click.self="contentEditorVisible = false">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 class="text-[14px] font-semibold text-gray-800">{{ contentEditorTopic?.title }}</h3>
              <p class="text-[10px] text-gray-400 mt-0.5">Newsletter-Inhalt bearbeiten</p>
            </div>
            <div class="flex-1 overflow-y-auto px-5 py-4">
              <CrmNewsletterContentEditor
                v-if="contentEditorTopic"
                :topic-id="contentEditorTopic.id"
              />
            </div>
            <div class="flex items-center justify-end px-5 py-3 border-t border-gray-100 flex-shrink-0">
              <button
                @click="contentEditorVisible = false"
                class="px-4 py-1.5 text-[11px] font-medium text-white bg-[#172774] rounded-md hover:bg-[#3d4a8e] transition-colors"
              >
                Fertig
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Subscribe / Send Dialog -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="dialogVisible" class="fixed inset-0 bg-black/30 z-[9998] flex items-center justify-center p-4" @click.self="dialogVisible = false">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 class="text-[14px] font-semibold text-gray-800">Newsletter senden</h3>
              <p class="text-[11px] text-gray-400 mt-0.5">{{ dialogTopic?.title }}</p>
            </div>

            <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <!-- Frequency -->
              <div>
                <label class="block text-[11px] text-gray-500 mb-1.5 font-medium">Versand-Frequenz</label>
                <div class="flex gap-2">
                  <button
                    v-for="freq in frequencyOptions"
                    :key="freq.value"
                    @click="dialogFrequency = freq.value"
                    class="flex-1 px-3 py-2 rounded-md text-[11px] font-medium border transition-all"
                    :class="dialogFrequency === freq.value
                      ? 'border-[#172774] bg-[#172774]/5 text-[#172774]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
                  >
                    {{ freq.label }}
                  </button>
                </div>
              </div>

              <!-- Lead selection mode -->
              <div>
                <label class="block text-[11px] text-gray-500 mb-1.5 font-medium">Leads auswählen</label>
                <div class="space-y-1.5">
                  <button
                    v-for="opt in leadTargetOptions"
                    :key="opt.value"
                    @click="dialogLeadTarget = opt.value"
                    class="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left border transition-all"
                    :class="dialogLeadTarget === opt.value
                      ? 'border-[#172774] bg-[#172774]/5'
                      : 'border-gray-200 hover:bg-gray-50'"
                  >
                    <i :class="opt.icon" class="text-[12px]" :style="{ color: dialogLeadTarget === opt.value ? '#172774' : '#9ca3af' }" />
                    <div class="flex-1">
                      <p class="text-[11px] font-medium" :class="dialogLeadTarget === opt.value ? 'text-[#172774]' : 'text-gray-700'">
                        {{ opt.label }}
                      </p>
                      <p class="text-[10px] text-gray-400">{{ opt.description }}</p>
                    </div>
                    <span class="text-[10px] text-gray-400 tabular-nums">{{ getTargetCount(opt.value) }}</span>
                  </button>
                </div>
              </div>

              <!-- Individual lead picker -->
              <div v-if="dialogLeadTarget === 'select'">
                <label class="block text-[11px] text-gray-500 mb-1.5 font-medium">
                  Leads suchen und auswählen
                  <span class="text-gray-400">({{ selectedLeadIds.size }} ausgewählt)</span>
                </label>
                <input
                  v-model="leadSearchQuery"
                  type="text"
                  placeholder="Name oder Stadt suchen..."
                  class="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] mb-2 focus:outline-none focus:ring-1 focus:ring-[#172774]/30 focus:border-[#172774]/40"
                />
                <div class="max-h-[200px] overflow-y-auto space-y-1 border border-gray-100 rounded-lg p-1.5">
                  <label
                    v-for="lead in filteredLeadList"
                    :key="lead.id"
                    class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      :checked="selectedLeadIds.has(lead.id)"
                      @change="toggleLeadSelection(lead.id)"
                      class="rounded border-gray-300 text-[#172774] focus:ring-[#172774]/30 w-3.5 h-3.5"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="text-[11px] font-medium text-gray-700 truncate">{{ getNhName(lead) }}</p>
                      <p class="text-[10px] text-gray-400 truncate">{{ getNhLocation(lead) }}</p>
                    </div>
                    <span class="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 flex-shrink-0">
                      {{ lead.opportunity_stage }}
                    </span>
                  </label>
                  <p v-if="filteredLeadList.length === 0" class="text-[11px] text-gray-400 text-center py-3">
                    Keine Leads gefunden
                  </p>
                </div>
              </div>

              <!-- Summary -->
              <div class="bg-blue-50 rounded-lg p-3">
                <p class="text-[11px] text-blue-800">
                  <i class="pi pi-info-circle text-[10px] mr-1" />
                  <strong>{{ resolvedLeadIds.length }}</strong> Lead(s) erhalten den Newsletter
                  <strong>"{{ dialogTopic?.title }}"</strong>.
                  <template v-if="dialogFrequency !== 'einmalig'">
                    Versand wird <strong>{{ dialogFrequency }}</strong> wiederholt.
                  </template>
                </p>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100 flex-shrink-0">
              <button
                @click="dialogVisible = false"
                class="px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Abbrechen
              </button>
              <button
                :disabled="resolvedLeadIds.length === 0 || sending"
                @click="confirmAndSend"
                class="flex items-center gap-1 px-4 py-1.5 text-[11px] font-medium text-white bg-[#172774] rounded-md hover:bg-[#3d4a8e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <i v-if="sending" class="pi pi-spin pi-spinner text-[10px]" />
                <i v-else class="pi pi-send text-[10px]" />
                Jetzt senden ({{ resolvedLeadIds.length }})
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Success toast -->
    <Teleport to="body">
      <transition name="slide-up">
        <div
          v-if="toastVisible"
          class="fixed bottom-6 right-6 z-[9999] bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
        >
          <i class="pi pi-check-circle text-[14px]" />
          <span class="text-[12px] font-medium">{{ toastMessage }}</span>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { NEWSLETTER_CATEGORIES, getTopicsByCategory, getTopicById } from '~/data/newsletterTopics'
import type { NewsletterTopic } from '~/data/newsletterTopics'
import type { NursingHomeLead, ActivityType } from '~/types/crm'
import { getLocalLeads } from '~/composables/usePflegeheimLeads'

definePageMeta({ layout: 'crm', middleware: 'auth' })

const STORAGE_KEY = 'crm_newsletter_subscriptions'

interface NewsletterSubscription {
  id: string
  topicId: string
  categoryId: string
  frequency: 'einmalig' | 'monatlich' | 'quartalsweise'
  leadTarget: 'all' | 'active' | 'qualified' | 'select'
  leadIds?: string[]
  active: boolean
  lastSentAt?: string
  createdAt: string
}

const { createActivity } = useActivities()
const { getPreview } = useNewsletterContent()
const { isConfigured: brevoConfigured, senderEmail: brevoSenderEmailDisplay, senderName: brevoSenderName, apiKey: brevoApiKey, updateConfig: updateBrevoConfig, testConnection: testBrevoConnection, sendNewsletter: brevoSendNewsletter } = useBrevo()

const brevoTesting = ref(false)
const brevoTestResult = ref<{ success: boolean; message: string } | null>(null)
const showApiKey = ref(false)

const runBrevoTest = async () => {
  brevoTesting.value = true
  brevoTestResult.value = null
  brevoTestResult.value = await testBrevoConnection()
  brevoTesting.value = false
}

/**
 * Convert plain text newsletter content to a styled HTML email
 */
const textToHtml = (text: string, title: string): string => {
  const bodyHtml = text
    .split('\n\n')
    .map(paragraph => {
      const lines = paragraph.split('\n')
      // Check if paragraph is a list (lines starting with -)
      if (lines.every(l => l.trim().startsWith('-') || l.trim() === '')) {
        const items = lines
          .filter(l => l.trim().startsWith('-'))
          .map(l => `<li style="margin-bottom:4px;">${l.trim().substring(1).trim()}</li>`)
          .join('')
        return `<ul style="padding-left:20px;margin:12px 0;">${items}</ul>`
      }
      // Check if it looks like a heading (short, no period)
      if (paragraph.length < 80 && !paragraph.includes('.') && !paragraph.startsWith('Liebe')) {
        return `<h3 style="color:#172774;margin:20px 0 8px;font-size:15px;">${paragraph}</h3>`
      }
      return `<p style="margin:12px 0;line-height:1.6;">${paragraph.replace(/\n/g, '<br>')}</p>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#172774;padding:24px 32px;">
      <h1 style="color:#ffffff;margin:0;font-size:18px;font-weight:600;">${title}</h1>
      <p style="color:#94a3b8;margin:6px 0 0;font-size:12px;">Zahnarztpraxis Wunschlachen</p>
    </div>
    <div style="padding:24px 32px;color:#374151;font-size:14px;">
      ${bodyHtml}
    </div>
    <div style="padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="color:#9ca3af;font-size:11px;margin:0;">
        Zahnarztpraxis Wunschlachen · Gotthardstraße 27 · 13407 Berlin<br>
        Sie erhalten diese E-Mail als Kooperationspartner.
      </p>
    </div>
  </div>
</body>
</html>`
}

const categories = NEWSLETTER_CATEGORIES
const selectedCategory = ref(categories[0].id)
const allLeads = ref<NursingHomeLead[]>([])

const subscriptions = ref<NewsletterSubscription[]>([])
const filteredTopics = computed(() => getTopicsByCategory(selectedCategory.value))
const activeSubscriptions = computed(() => subscriptions.value)
const isSubscribed = (topicId: string) => subscriptions.value.some(s => s.topicId === topicId)
const getCategoryById = (id: string) => categories.find(c => c.id === id)
const getTopicTitle = (topicId: string) => getTopicById(topicId)?.title || topicId
const formatDate = (d?: string) => {
  if (!d) return ''
  try { return format(parseISO(d), 'dd.MM.yy', { locale: de }) } catch { return '' }
}

// ─── Lead helpers ─────────────────────────────────────────────────

const getNhName = (l: NursingHomeLead) =>
  typeof l.nursing_home_id === 'object' ? l.nursing_home_id?.name || '–' : '–'

const getNhLocation = (l: NursingHomeLead) => {
  if (typeof l.nursing_home_id !== 'object' || !l.nursing_home_id) return ''
  return [l.nursing_home_id.zip, l.nursing_home_id.city].filter(Boolean).join(' ')
}

const getLeadsByTarget = (target: string): NursingHomeLead[] => {
  const excludedStages = ['Won', 'Lost', 'Cancelled']
  const qualifiedStages = ['Qualified', 'Follow-up', 'Email', 'Presentation', 'Emergency Phone', 'Further Education', 'Won']

  switch (target) {
    case 'all':
      return allLeads.value
    case 'active':
      return allLeads.value.filter(l => !excludedStages.includes(l.opportunity_stage))
    case 'qualified':
      return allLeads.value.filter(l => qualifiedStages.includes(l.opportunity_stage))
    default:
      return []
  }
}

const getTargetCount = (target: string) => {
  if (target === 'select') return ''
  return getLeadsByTarget(target).length
}

// ─── Content Editor ──────────────────────────────────────────────
const contentEditorVisible = ref(false)
const contentEditorTopic = ref<NewsletterTopic | null>(null)

const openContentEditor = (topic: NewsletterTopic) => {
  contentEditorTopic.value = topic
  contentEditorVisible.value = true
}

// ─── Dialog ──────────────────────────────────────────────────────
const dialogVisible = ref(false)
const dialogTopic = ref<NewsletterTopic | null>(null)
const dialogFrequency = ref<'einmalig' | 'monatlich' | 'quartalsweise'>('einmalig')
const dialogLeadTarget = ref<'all' | 'active' | 'qualified' | 'select'>('active')
const selectedLeadIds = ref<Set<string>>(new Set())
const leadSearchQuery = ref('')
const sending = ref(false)

const frequencyOptions = [
  { value: 'einmalig' as const, label: 'Einmalig' },
  { value: 'monatlich' as const, label: 'Monatlich' },
  { value: 'quartalsweise' as const, label: 'Quartalsweise' },
]

const leadTargetOptions = [
  { value: 'all' as const, label: 'Alle Leads', description: 'Newsletter an alle Leads', icon: 'pi pi-users' },
  { value: 'active' as const, label: 'Aktive Pipeline', description: 'Nur Leads in aktiven Stages', icon: 'pi pi-filter' },
  { value: 'qualified' as const, label: 'Qualifiziert+', description: 'Ab Stage "Qualified"', icon: 'pi pi-star' },
  { value: 'select' as const, label: 'Einzelne Leads', description: 'Manuell auswählen', icon: 'pi pi-check-square' },
]

const filteredLeadList = computed(() => {
  const q = leadSearchQuery.value.toLowerCase()
  if (!q) return allLeads.value
  return allLeads.value.filter(l => {
    const name = getNhName(l).toLowerCase()
    const loc = getNhLocation(l).toLowerCase()
    return name.includes(q) || loc.includes(q)
  })
})

const resolvedLeadIds = computed<string[]>(() => {
  if (dialogLeadTarget.value === 'select') {
    return [...selectedLeadIds.value]
  }
  return getLeadsByTarget(dialogLeadTarget.value).map(l => l.id)
})

const toggleLeadSelection = (id: string) => {
  const s = new Set(selectedLeadIds.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selectedLeadIds.value = s
}

const openSubscribeDialog = (topic: NewsletterTopic) => {
  dialogTopic.value = topic
  dialogFrequency.value = topic.frequency
  dialogLeadTarget.value = 'active'
  selectedLeadIds.value = new Set()
  leadSearchQuery.value = ''
  dialogVisible.value = true
}

// ─── Toast ───────────────────────────────────────────────────────
const toastVisible = ref(false)
const toastMessage = ref('')
let toastTimeout: ReturnType<typeof setTimeout>

const showToast = (msg: string) => {
  toastMessage.value = msg
  toastVisible.value = true
  clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => { toastVisible.value = false }, 3000)
}

// ─── Send ────────────────────────────────────────────────────────

const sendNewsletterToLeads = async (topicId: string, leadIds: string[]) => {
  const topic = getTopicById(topicId)
  if (!topic) return 0

  let sent = 0

  // If Brevo is configured, collect recipients and send via Brevo
  console.log('[Newsletter] brevoConfigured:', brevoConfigured.value, '| apiKey:', !!brevoApiKey.value, '| senderEmail:', brevoSenderEmailDisplay.value)

  if (brevoConfigured.value) {
    const recipients: { email: string; name?: string; leadId: string; content: string }[] = []
    const noEmailLeads: string[] = []

    for (const leadId of leadIds) {
      const lead = allLeads.value.find(l => l.id === leadId)
      const nh = typeof lead?.nursing_home_id === 'object' ? lead.nursing_home_id : null
      const content = getPreview(topicId, null, nh)

      // Try nursing home email first, then contacts
      let email = nh?.email || ''
      if (!email && lead) {
        // Try to find contact email from lead contacts
        const contacts = typeof lead.contacts === 'object' && Array.isArray(lead.contacts)
          ? lead.contacts : []
        const contactWithEmail = contacts.find((c: any) => c?.email)
        if (contactWithEmail) email = (contactWithEmail as any).email
      }

      console.log(`[Newsletter] Lead ${getNhName(lead!)}: email=${email || 'KEINE'}`)

      if (email) {
        recipients.push({ email, name: nh?.name, leadId, content })
      } else {
        noEmailLeads.push(getNhName(lead!))
      }
    }

    if (noEmailLeads.length > 0) {
      console.warn('[Newsletter] Leads ohne E-Mail:', noEmailLeads)
    }

    console.log(`[Newsletter] ${recipients.length} Empfänger, ${noEmailLeads.length} ohne E-Mail`)

    if (recipients.length > 0) {
      // Send individually for personalized content per lead
      for (const r of recipients) {
        const htmlContent = textToHtml(r.content, topic.title)
        console.log(`[Newsletter] Sende an ${r.email}...`)
        const result = await brevoSendNewsletter(
          [{ email: r.email, name: r.name }],
          `${topic.title} — Zahnarztpraxis Wunschlachen`,
          htmlContent,
          topicId,
        )
        console.log(`[Newsletter] Ergebnis für ${r.email}:`, JSON.stringify(result))
        if (result.sent > 0) sent++
        if (result.errors.length > 0) {
          console.error(`[Brevo] Fehler für ${r.email}:`, result.errors)
        }
      }
    } else {
      console.warn('[Newsletter] Keine Empfänger mit E-Mail gefunden!')
    }

    // Log activities for all leads
    for (const leadId of leadIds) {
      const lead = allLeads.value.find(l => l.id === leadId)
      const nh = typeof lead?.nursing_home_id === 'object' ? lead.nursing_home_id : null
      const content = getPreview(topicId, null, nh)
      const recipientEntry = recipients.find(r => r.leadId === leadId)

      await createActivity({
        nursing_home_lead_id: leadId,
        type: 'newsletter' as ActivityType,
        subject: `Newsletter: ${topic.title}`,
        content,
        direction: 'outbound',
        metadata: {
          topic_id: topicId,
          category: topic.category,
          frequency: dialogFrequency.value,
          sent_via: recipientEntry ? 'brevo' : 'no_email',
          recipient_email: recipientEntry?.email || null,
        },
      })
    }

    // Show warning if some leads had no email
    if (noEmailLeads.length > 0 && sent > 0) {
      showToast(`${sent} gesendet, ${noEmailLeads.length} Lead(s) ohne E-Mail übersprungen`)
    }

    return sent
  }

  // Fallback: just log activities (no actual email sending)
  for (const leadId of leadIds) {
    const lead = allLeads.value.find(l => l.id === leadId)
    const nh = typeof lead?.nursing_home_id === 'object' ? lead.nursing_home_id : null
    const content = getPreview(topicId, null, nh)

    await createActivity({
      nursing_home_lead_id: leadId,
      type: 'newsletter' as ActivityType,
      subject: `Newsletter: ${topic.title}`,
      content,
      direction: 'outbound',
      metadata: {
        topic_id: topicId,
        category: topic.category,
        frequency: dialogFrequency.value,
        sent_via: 'local_only',
      },
    })
    sent++
  }
  return sent
}

const confirmAndSend = async () => {
  if (!dialogTopic.value || resolvedLeadIds.value.length === 0) return
  sending.value = true

  try {
    const leadIds = [...resolvedLeadIds.value]
    const sent = await sendNewsletterToLeads(dialogTopic.value.id, leadIds)

    // Save subscription
    const sub: NewsletterSubscription = {
      id: `sub_${Date.now()}`,
      topicId: dialogTopic.value.id,
      categoryId: dialogTopic.value.category,
      frequency: dialogFrequency.value,
      leadTarget: dialogLeadTarget.value,
      leadIds,
      active: dialogFrequency.value !== 'einmalig',
      lastSentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    // Replace existing subscription for same topic or add new
    const existingIdx = subscriptions.value.findIndex(s => s.topicId === dialogTopic.value!.id)
    if (existingIdx !== -1) {
      subscriptions.value[existingIdx] = sub
    } else {
      subscriptions.value.push(sub)
    }
    saveSubscriptions()

    dialogVisible.value = false
    showToast(`Newsletter an ${sent} Lead(s) gesendet`)
  } catch (err) {
    console.error('Failed to send newsletter:', err)
  } finally {
    sending.value = false
  }
}

const resendSubscription = async (sub: NewsletterSubscription) => {
  if (!sub.leadIds?.length) return
  sending.value = true
  try {
    const sent = await sendNewsletterToLeads(sub.topicId, sub.leadIds)
    sub.lastSentAt = new Date().toISOString()
    saveSubscriptions()
    showToast(`Newsletter an ${sent} Lead(s) erneut gesendet`)
  } finally {
    sending.value = false
  }
}

const toggleSubscription = (id: string) => {
  const sub = subscriptions.value.find(s => s.id === id)
  if (sub) {
    sub.active = !sub.active
    saveSubscriptions()
  }
}

const removeSubscription = (id: string) => {
  subscriptions.value = subscriptions.value.filter(s => s.id !== id)
  saveSubscriptions()
}

// ─── Persistence ─────────────────────────────────────────────────
const loadSubscriptions = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) subscriptions.value = JSON.parse(stored)
  } catch { /* ignore */ }
}

const saveSubscriptions = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions.value))
  } catch { /* ignore */ }
}

onMounted(() => {
  loadSubscriptions()
  allLeads.value = getLocalLeads()
})
</script>

<style scoped>
.fade-enter-active { transition: opacity 0.2s ease; }
.fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active { transition: all 0.3s ease; }
.slide-up-leave-active { transition: all 0.2s ease; }
.slide-up-enter-from { opacity: 0; transform: translateY(20px); }
.slide-up-leave-to { opacity: 0; transform: translateY(20px); }
</style>
