<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    role="dialog"
    aria-modal="true"
    @click.self="close"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-5 space-y-4">
      <div class="flex items-start justify-between">
        <div>
          <h3 class="text-base font-semibold text-dental-blue-0 flex items-center gap-2">
            <i :class="iconClass" />
            {{ label }}
          </h3>
          <p class="text-[11px] text-dental-blue--3 mt-1">
            An <strong>{{ recipientLabel }}</strong> via {{ channelLabel }}
          </p>
        </div>
        <button class="text-dental-blue--3 hover:text-dental-blue-0" @click="close">
          <i class="pi pi-times" />
        </button>
      </div>

      <div v-if="channel === 'email'">
        <label class="text-[11px] font-medium text-dental-blue-0 mb-1 block">Betreff</label>
        <input v-model="form.subject" type="text" class="field-input bg-white" />
      </div>

      <div>
        <label class="text-[11px] font-medium text-dental-blue-0 mb-1 block">
          {{ channel === 'sms' || channel === 'whatsapp' ? 'Nachricht' : 'Inhalt' }}
          <span v-if="channel === 'sms'" class="text-dental-blue--3 ml-2">({{ form.body.length }} Zeichen)</span>
        </label>
        <textarea
          v-model="form.body"
          :rows="channel === 'email' ? 8 : 4"
          class="field-input bg-white"
        />
      </div>

      <div v-if="!recipientAddress" class="bg-amber-50 border border-amber-200 rounded p-2 text-[11px] text-amber-800">
        <i class="pi pi-exclamation-triangle mr-1" />
        Keine {{ channel === 'sms' || channel === 'whatsapp' ? 'Telefonnummer' : 'E-Mail-Adresse' }} im Lead — Senden nicht möglich.
      </div>

      <div class="flex gap-2 pt-2">
        <button
          type="button"
          class="flex-1 px-3 py-2 text-[12px] font-medium text-dental-blue-0 bg-white hover:bg-dental-blue--5 border border-dental-blue--4 rounded transition-colors"
          :disabled="sending"
          @click="close"
        >
          Abbrechen
        </button>
        <button
          type="button"
          class="flex-1 px-3 py-2 text-[12px] font-medium text-white bg-dental-blue-0 hover:bg-dental-blue-1 rounded transition-colors disabled:opacity-50"
          :disabled="sending || !recipientAddress || !form.body.trim()"
          @click="onSend"
        >
          <i v-if="sending" class="pi pi-spin pi-spinner text-[11px] mr-1" />
          <i v-else class="pi pi-send text-[11px] mr-1" />
          Senden
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Lead } from '~/types/crm'

type Channel = 'email' | 'sms' | 'whatsapp'

const props = defineProps<{
  lead: Lead | null
  channel: Channel
  label: string
  templateId?: string
}>()

const visible = defineModel<boolean>('visible', { default: false })
const emit = defineEmits<{ sent: [] }>()

const sending = ref(false)
const form = reactive({ subject: '', body: '' })

const channelLabel = computed(() => ({
  email: 'E-Mail', sms: 'SMS', whatsapp: 'WhatsApp',
}[props.channel]))

const iconClass = computed(() => ({
  email: 'pi pi-envelope text-blue-500',
  sms: 'pi pi-comment text-purple-500',
  whatsapp: 'pi pi-comments text-green-500',
}[props.channel]))

const recipientAddress = computed(() =>
  props.channel === 'email' ? props.lead?.mail : props.lead?.phone,
)
const recipientLabel = computed(() => {
  const name = `${props.lead?.first_name || ''} ${props.lead?.last_name || ''}`.trim() || '?'
  return recipientAddress.value ? `${name} (${recipientAddress.value})` : name
})

// Template-Auflösung: erst aus email-templates.json, sonst Fallback-Default
const resolveTemplate = () => {
  if (!props.lead) return
  const firstName = props.lead.first_name || ''
  const interpolate = (s: string) =>
    s.replace(/\{\{\s*patient\.first_name\s*\}\}/g, firstName)
      .replace(/\{\{\s*patient\.last_name\s*\}\}/g, props.lead?.last_name || '')
      .replace(/\{\{\s*firstName\s*\}\}/g, firstName)
      .replace(/\{\{\s*lastName\s*\}\}/g, props.lead?.last_name || '')

  // Default-Texte pro NBA-Slug
  const defaults: Record<string, { subject?: string; body: string }> = {
    'appt-reminder-24h': {
      body: `Hallo ${firstName}, kleine Erinnerung: morgen ist Ihr Termin bei Wunschlachen. Wir freuen uns auf Sie! Bei Fragen rufen Sie uns gerne an.`,
    },
    'pt-5': {
      subject: 'Anfahrt + Vorbereitung für Ihren Termin',
      body: `<p>Hallo ${firstName},</p><p>kurz die Infos für Ihren Termin morgen:</p><ul><li><strong>Anfahrt:</strong> [Standort-Adresse]</li><li><strong>Mitbringen:</strong> Versichertenkarte, ggf. aktuelle Röntgenbilder, Medikamentenliste</li><li><strong>Vorher:</strong> normal frühstücken, keine Anstrengung am Vortag</li></ul><p>Bei Fragen rufen Sie uns gerne an!</p><p>Herzliche Grüße<br>Ihr Wunschlachen-Team</p>`,
    },
  }

  // Versuche Template aus useEmailTemplates
  if (props.templateId && props.channel === 'email') {
    try {
      const { templates } = useEmailTemplates()
      const tpl = templates.value?.find((t: any) => t.id === props.templateId)
      if (tpl) {
        form.subject = interpolate(tpl.subject || '')
        form.body = interpolate(tpl.body_html || tpl.body_text || '')
        return
      }
    } catch { /* fall through to default */ }
  }

  // Fallback
  const def = props.templateId ? defaults[props.templateId] : null
  if (def) {
    form.subject = interpolate(def.subject || props.label)
    form.body = interpolate(def.body)
  } else {
    form.subject = props.label
    form.body = ''
  }
}

watch(visible, (v) => {
  if (v) resolveTemplate()
})

const close = () => {
  if (sending.value) return
  visible.value = false
}

const onSend = async () => {
  if (!props.lead || !recipientAddress.value) return
  sending.value = true
  const toast = useToast()
  const { addActivity } = useLeadActivities()
  const now = new Date().toISOString()
  try {
    if (props.channel === 'email') {
      await $fetch('/api/brevo/send-email', {
        method: 'POST',
        body: {
          to: [{ email: recipientAddress.value, name: `${props.lead.first_name} ${props.lead.last_name}`.trim() }],
          subject: form.subject,
          htmlContent: form.body,
          tags: ['nba-quick', props.templateId || props.channel].filter(Boolean),
        },
      })
    } else {
      // Brevo SMS/WhatsApp — server-side proxy würde sauberer sein, hier ist das
      // ein Browser-side Brevo-Call (analog zu useBrevoCom.sendSms). MVP-Variante.
      const { sendSms, sendWhatsApp, isConfigured } = useBrevoCom()
      if (!isConfigured.value) throw new Error('Brevo (Browser-Config) nicht konfiguriert')
      const result = props.channel === 'sms'
        ? await sendSms(recipientAddress.value, form.body, `nba-${props.templateId || 'sms'}`)
        : await sendWhatsApp(recipientAddress.value, form.body)
      if (!result?.success) throw new Error(result?.error || 'Send failed')
    }

    addActivity({
      lead_id: props.lead.id,
      type: props.channel === 'email' ? 'email_sent' : props.channel,
      subject: form.subject || props.label,
      content: form.body,
      direction: 'outbound',
      outcome: 'successful',
      date_created: now,
    } as any)

    toast.add({ severity: 'success', summary: `${channelLabel.value} versendet`, detail: recipientAddress.value })
    visible.value = false
    emit('sent')
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Versand fehlgeschlagen', detail: e?.message || String(e) })
  } finally {
    sending.value = false
  }
}
</script>
