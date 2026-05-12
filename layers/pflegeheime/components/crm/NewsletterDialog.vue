<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="visible" class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" @click.self="close">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          <!-- Header -->
          <div class="px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0369a1]/10">
                  <i class="pi pi-megaphone text-[14px] text-[#0369a1]" />
                </div>
                <div>
                  <h3 class="text-[14px] font-semibold text-gray-800">
                    {{ step === 'pick' ? 'Thema wählen' : selectedTopic?.title }}
                  </h3>
                  <p class="text-[10px] text-gray-400">
                    {{ step === 'pick' ? 'Edukatives Thema für diesen Lead auswählen' : 'Inhalt anpassen und versenden' }}
                  </p>
                </div>
              </div>
              <button
                v-if="step === 'edit'"
                @click="step = 'pick'"
                class="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i class="pi pi-arrow-left text-[9px] mr-1" />
                Zurück
              </button>
            </div>
          </div>

          <!-- Step 1: Topic picker -->
          <template v-if="step === 'pick'">
            <!-- Category tabs -->
            <div class="px-5 pt-3 pb-2 flex-shrink-0">
              <div class="flex flex-wrap gap-1">
                <button
                  v-for="cat in categories"
                  :key="cat.id"
                  @click="selectedCategory = cat.id"
                  class="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all"
                  :class="selectedCategory === cat.id
                    ? 'bg-[#172774] text-white'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'"
                >
                  <i :class="cat.icon" class="text-[9px]" />
                  {{ cat.label.split(' ')[0] }}
                </button>
              </div>
            </div>

            <!-- Topics list -->
            <div class="flex-1 overflow-y-auto px-5 py-2">
              <div class="space-y-1.5">
                <button
                  v-for="topic in filteredTopics"
                  :key="topic.id"
                  @click="selectTopic(topic)"
                  class="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-[#172774]/30 hover:bg-[#172774]/[0.02] transition-all"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <p class="text-[11px] font-medium text-gray-800">{{ topic.title }}</p>
                      <p class="text-[10px] text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{{ topic.description }}</p>
                    </div>
                    <div class="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                      <span
                        class="text-[8px] px-1.5 py-0.5 rounded-full font-semibold"
                        :class="{
                          'bg-blue-50 text-blue-600': topic.frequency === 'einmalig',
                          'bg-green-50 text-green-600': topic.frequency === 'monatlich',
                          'bg-amber-50 text-amber-600': topic.frequency === 'quartalsweise',
                        }"
                      >
                        {{ topic.frequency }}
                      </span>
                      <i class="pi pi-chevron-right text-[9px] text-gray-300" />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </template>

          <!-- Step 2: Content editor + settings -->
          <template v-if="step === 'edit' && selectedTopic">
            <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <!-- Content editor -->
              <CrmNewsletterContentEditor
                :topic-id="selectedTopic.id"
                :contact="contact"
                :nursing-home="nursingHome"
              />

              <!-- Frequency -->
              <div>
                <label class="block text-[10px] text-gray-400 mb-1.5 font-medium">Versand-Frequenz</label>
                <div class="flex gap-1.5">
                  <button
                    v-for="freq in frequencyOptions"
                    :key="freq.value"
                    @click="selectedFrequency = freq.value"
                    class="flex-1 px-2.5 py-1.5 rounded text-[10px] font-medium border transition-all"
                    :class="selectedFrequency === freq.value
                      ? 'border-[#172774] bg-[#172774]/5 text-[#172774]'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'"
                  >
                    {{ freq.label }}
                  </button>
                </div>
              </div>

              <!-- Send timing -->
              <div>
                <label class="block text-[10px] text-gray-400 mb-1.5 font-medium">Versandzeitpunkt</label>
                <div class="flex gap-1.5 mb-2">
                  <button
                    @click="sendTiming = 'now'"
                    class="flex-1 px-2.5 py-1.5 rounded text-[10px] font-medium border transition-all"
                    :class="sendTiming === 'now'
                      ? 'border-[#4f46e5] bg-[#4f46e5]/5 text-[#4f46e5]'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'"
                  >
                    Sofort senden
                  </button>
                  <button
                    @click="sendTiming = 'scheduled'"
                    class="flex-1 px-2.5 py-1.5 rounded text-[10px] font-medium border transition-all"
                    :class="sendTiming === 'scheduled'
                      ? 'border-[#4f46e5] bg-[#4f46e5]/5 text-[#4f46e5]'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'"
                  >
                    Zeitversetzt
                  </button>
                </div>
                <div v-if="sendTiming === 'scheduled'" class="flex gap-2">
                  <input
                    v-model="scheduledDate"
                    type="date"
                    :min="minDate"
                    class="flex-1 px-2.5 py-1.5 border border-gray-200 rounded text-[11px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5]/40"
                  />
                  <input
                    v-model="scheduledTime"
                    type="time"
                    class="w-24 px-2.5 py-1.5 border border-gray-200 rounded text-[11px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5]/40"
                  />
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 flex-shrink-0">
              <button
                @click="close"
                class="px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Abbrechen
              </button>
              <button
                @click="send"
                :disabled="sendTiming === 'scheduled' && !scheduledDate"
                class="flex items-center gap-1 px-4 py-1.5 text-[11px] font-medium text-white bg-[#172774] rounded-md hover:bg-[#3d4a8e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <i :class="sendTiming === 'scheduled' ? 'pi pi-clock' : 'pi pi-send'" class="text-[10px]" />
                {{ sendTiming === 'scheduled' ? 'Newsletter planen' : 'Newsletter senden' }}
              </button>
            </div>
          </template>

          <!-- Footer for step 1 -->
          <div v-if="step === 'pick'" class="flex items-center justify-end px-5 py-3 border-t border-gray-100 flex-shrink-0">
            <button
              @click="close"
              class="px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { NEWSLETTER_CATEGORIES, getTopicsByCategory } from '~/data/newsletterTopics'
import type { NewsletterTopic } from '~/data/newsletterTopics'
import type { ActivityType, NursingHome, NursingHomeContact } from '~/types/crm'

const props = defineProps<{
  visible: boolean
  leadId: string
  contact?: NursingHomeContact | null
  nursingHome?: NursingHome | null
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
  saved: []
}>()

const { createActivity } = useActivities()
const { getPreview } = useNewsletterContent()
const { isConfigured: brevoConfigured, sendNewsletter: brevoSendNewsletter } = useBrevo()

const step = ref<'pick' | 'edit'>('pick')
const categories = NEWSLETTER_CATEGORIES
const selectedCategory = ref(categories[0].id)
const selectedTopic = ref<NewsletterTopic | null>(null)
const selectedFrequency = ref<'einmalig' | 'monatlich' | 'quartalsweise'>('einmalig')
const sendTiming = ref<'now' | 'scheduled'>('now')
const scheduledDate = ref('')
const scheduledTime = ref('09:00')
const minDate = computed(() => new Date().toISOString().split('T')[0])

const filteredTopics = computed(() => getTopicsByCategory(selectedCategory.value))

const frequencyOptions = [
  { value: 'einmalig' as const, label: 'Einmalig' },
  { value: 'monatlich' as const, label: 'Monatlich' },
  { value: 'quartalsweise' as const, label: 'Quartalsweise' },
]

const selectTopic = (topic: NewsletterTopic) => {
  selectedTopic.value = topic
  selectedFrequency.value = topic.frequency
  step.value = 'edit'
}

watch(() => props.visible, (val) => {
  if (val) {
    step.value = 'pick'
    selectedCategory.value = categories[0].id
    selectedTopic.value = null
    selectedFrequency.value = 'einmalig'
    sendTiming.value = 'now'
    scheduledDate.value = ''
    scheduledTime.value = '09:00'
  }
})

const close = () => emit('update:visible', false)

const textToHtml = (text: string, title: string): string => {
  const bodyHtml = text
    .split('\n\n')
    .map(paragraph => {
      const lines = paragraph.split('\n')
      if (lines.every(l => l.trim().startsWith('-') || l.trim() === '')) {
        const items = lines
          .filter(l => l.trim().startsWith('-'))
          .map(l => `<li style="margin-bottom:4px;">${l.trim().substring(1).trim()}</li>`)
          .join('')
        return `<ul style="padding-left:20px;margin:12px 0;">${items}</ul>`
      }
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

const send = async () => {
  if (!selectedTopic.value) return

  const resolvedContent = getPreview(selectedTopic.value.id, props.contact, props.nursingHome)
  let sentVia = 'local_only'

  // Send via Brevo if configured
  if (brevoConfigured.value) {
    const email = props.nursingHome?.email || (props.contact as any)?.email || ''
    if (email) {
      const htmlContent = textToHtml(resolvedContent, selectedTopic.value.title)
      const result = await brevoSendNewsletter(
        [{ email, name: props.nursingHome?.name }],
        `${selectedTopic.value.title} — Zahnarztpraxis Wunschlachen`,
        htmlContent,
        selectedTopic.value.id,
      )
      sentVia = result.sent > 0 ? 'brevo' : 'brevo_failed'
      if (result.errors.length > 0) {
        console.error('[Brevo] Newsletter-Fehler:', result.errors)
      }
      console.log(`[Newsletter] Gesendet an ${email}: ${sentVia}`, result)
    } else {
      sentVia = 'no_email'
      console.warn('[Newsletter] Kein E-Mail für diesen Lead gefunden')
    }
  }

  const scheduledAt = sendTiming.value === 'scheduled' && scheduledDate.value
    ? `${scheduledDate.value}T${scheduledTime.value}:00`
    : null

  await createActivity({
    nursing_home_lead_id: props.leadId,
    type: 'newsletter' as ActivityType,
    subject: `Newsletter: ${selectedTopic.value.title}${scheduledAt ? ' (geplant)' : ''}`,
    content: resolvedContent,
    direction: 'outbound',
    metadata: {
      topic_id: selectedTopic.value.id,
      category: selectedTopic.value.category,
      frequency: selectedFrequency.value,
      sent_via: scheduledAt ? 'scheduled' : sentVia,
      scheduled_at: scheduledAt,
    },
  })

  // Save subscription
  try {
    const STORAGE_KEY = 'crm_newsletter_subscriptions'
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    stored.push({
      id: `sub_${Date.now()}`,
      topicId: selectedTopic.value.id,
      categoryId: selectedTopic.value.category,
      frequency: selectedFrequency.value,
      leadTarget: 'single',
      leadId: props.leadId,
      active: true,
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch { /* ignore */ }

  close()
  emit('saved')
}
</script>

<style scoped>
.fade-enter-active { transition: opacity 0.2s ease; }
.fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
