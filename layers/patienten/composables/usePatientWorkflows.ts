// composables/usePatientWorkflows.ts — Workflow engine for Praxis CRM

import type {
  Workflow,
  WorkflowRun,
  WorkflowRunLogEntry,
  WorkflowTriggerType,
  WorkflowStep,
  WorkflowStepEmailConfig,
  WorkflowStepSmsConfig,
  WorkflowStepWhatsAppConfig,
  WorkflowStepWaitConfig,
  WorkflowStepTaskConfig,
  WorkflowStepConditionConfig,
  WorkflowStepNewsletterConfig,
} from '~/types/workflow'
import type { Lead } from '~/types/crm'
import templateData from '~/data/workflow-templates.json'

const WORKFLOWS_KEY = 'praxis-crm-workflows'
const RUNS_KEY = 'praxis-crm-workflow-runs'

// --- Storage helpers ---
const readWorkflows = (): Workflow[] => {
  try {
    const raw = localStorage.getItem(WORKFLOWS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

const writeWorkflows = (workflows: Workflow[]) => {
  localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows))
}

const readRuns = (): WorkflowRun[] => {
  try {
    const raw = localStorage.getItem(RUNS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

const writeRuns = (runs: WorkflowRun[]) => {
  localStorage.setItem(RUNS_KEY, JSON.stringify(runs))
}

// --- Condition evaluator ---
const evaluateCondition = (lead: Lead, config: WorkflowStepConditionConfig): boolean => {
  const fieldValue = String((lead as any)[config.field] ?? '')
  const compareValue = config.value

  switch (config.operator) {
    case 'equals': return fieldValue === compareValue
    case 'not_equals': return fieldValue !== compareValue
    case 'contains': return fieldValue.includes(compareValue)
    case 'greater_than': return Number(fieldValue) > Number(compareValue)
    case 'less_than': return Number(fieldValue) < Number(compareValue)
    default: return false
  }
}

// --- Composable ---
export const usePatientWorkflows = () => {
  const workflows = ref<Workflow[]>([])

  const fetchWorkflows = (triggerType?: WorkflowTriggerType): Workflow[] => {
    let result = readWorkflows()
    if (triggerType) result = result.filter(w => w.trigger_type === triggerType)
    workflows.value = result
    return result
  }

  const fetchWorkflow = (id: string): Workflow | null => {
    return readWorkflows().find(w => w.id === id) || null
  }

  const createWorkflow = (data: Partial<Workflow>): Workflow => {
    const workflow: Workflow = {
      id: crypto.randomUUID(),
      name: data.name || 'Neuer Workflow',
      description: data.description || undefined,
      trigger_type: data.trigger_type || 'manual',
      trigger_config: data.trigger_config,
      steps: data.steps || [],
      is_active: data.is_active ?? true,
      date_created: new Date().toISOString(),
      date_updated: new Date().toISOString(),
    }
    const all = readWorkflows()
    all.push(workflow)
    writeWorkflows(all)
    return workflow
  }

  const updateWorkflow = (id: string, data: Partial<Workflow>): Workflow | null => {
    const all = readWorkflows()
    const idx = all.findIndex(w => w.id === id)
    if (idx === -1) return null
    all[idx] = { ...all[idx], ...data, date_updated: new Date().toISOString() }
    writeWorkflows(all)
    return all[idx]
  }

  const removeWorkflow = (id: string): void => {
    writeWorkflows(readWorkflows().filter(w => w.id !== id))
  }

  const fetchWorkflowRuns = (workflowId: string, limit = 50): WorkflowRun[] => {
    return readRuns()
      .filter(r => r.workflow_id === workflowId)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      .slice(0, limit)
  }

  const executeWorkflow = async (
    workflowId: string,
    leads: Lead[],
  ): Promise<{ completed: number; failed: number }> => {
    const workflow = fetchWorkflow(workflowId)
    if (!workflow) throw new Error('Workflow nicht gefunden')

    const { addActivity } = useLeadActivities()
    const { sendEmail: sendViaDirectus, checkConfig } = useEmail()
    const { sendSms, sendWhatsApp } = useBrevoCom()
    const { resolveTemplate, fetchTemplate } = useEmailTemplates()

    const emailConfigured = await checkConfig()
    let completed = 0
    let failed = 0

    for (const lead of leads) {
      const run: WorkflowRun = {
        id: crypto.randomUUID(),
        workflow_id: workflowId,
        lead_id: lead.id,
        lead_name: `${lead.first_name} ${lead.last_name}`,
        status: 'running',
        current_step: 0,
        started_at: new Date().toISOString(),
        log: [],
      }

      const templateContext = {
        patient: {
          first_name: lead.first_name || '',
          last_name: lead.last_name || '',
          email: lead.mail || '',
        },
        location: {
          name: typeof lead.location === 'object' ? lead.location?.name || '' : '',
        },
      }

      let aborted = false

      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i]
        run.current_step = i

        try {
          if (step.type === 'email') {
            const cfg = step.config as WorkflowStepEmailConfig
            let subject = step.label || 'Workflow E-Mail'
            let bodyText = ''

            if (cfg.template_id) {
              const tpl = await fetchTemplate(cfg.template_id)
              if (tpl) {
                subject = resolveTemplate(tpl.subject, templateContext)
                const div = typeof document !== 'undefined' ? document.createElement('div') : null
                if (div) {
                  div.innerHTML = resolveTemplate(tpl.body_html, templateContext)
                  bodyText = div.textContent || div.innerText || ''
                }
              }
            }

            if (emailConfigured && lead.mail) {
              await sendViaDirectus({
                to: lead.mail,
                subject,
                body_text: bodyText,
                body_html: `<pre style="font-family: sans-serif; white-space: pre-wrap;">${bodyText}</pre>`,
                lead_id: lead.id,
              })
            }

            addActivity({
              lead_id: lead.id,
              type: 'email_sent',
              subject,
              content: bodyText || undefined,
              direction: 'outbound',
              metadata: { workflow_id: workflowId, step_index: i },
            })

            run.log.push({ step_index: i, step_type: 'email', status: 'done', message: `E-Mail: ${subject}`, timestamp: new Date().toISOString() })

          } else if (step.type === 'sms') {
            const cfg = step.config as WorkflowStepSmsConfig
            const message = cfg.message.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, path: string) => {
              const [obj, field] = path.split('.')
              return (templateContext as any)[obj]?.[field]?.toString() || ''
            })

            if (lead.phone) {
              await sendSms(lead.phone, message)
            }

            addActivity({
              lead_id: lead.id,
              type: 'sms',
              subject: step.label || 'Workflow SMS',
              content: message,
              direction: 'outbound',
              metadata: { workflow_id: workflowId, step_index: i },
            })

            run.log.push({ step_index: i, step_type: 'sms', status: 'done', message: `SMS: ${message.slice(0, 50)}...`, timestamp: new Date().toISOString() })

          } else if (step.type === 'whatsapp') {
            const cfg = step.config as WorkflowStepWhatsAppConfig
            const message = cfg.message.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, path: string) => {
              const [obj, field] = path.split('.')
              return (templateContext as any)[obj]?.[field]?.toString() || ''
            })

            if (lead.phone) {
              await sendWhatsApp(lead.phone, message)
            }

            addActivity({
              lead_id: lead.id,
              type: 'whatsapp',
              subject: step.label || 'Workflow WhatsApp',
              content: message,
              direction: 'outbound',
              metadata: { workflow_id: workflowId, step_index: i },
            })

            run.log.push({ step_index: i, step_type: 'whatsapp', status: 'done', message: `WhatsApp: ${message.slice(0, 50)}...`, timestamp: new Date().toISOString() })

          } else if (step.type === 'wait') {
            const cfg = step.config as WorkflowStepWaitConfig
            run.log.push({ step_index: i, step_type: 'wait', status: 'done', message: `Warten: ${cfg.days} Tage (übersprungen — Client-Modus)`, timestamp: new Date().toISOString() })

          } else if (step.type === 'task') {
            const cfg = step.config as WorkflowStepTaskConfig

            addActivity({
              lead_id: lead.id,
              type: 'task',
              subject: step.label || 'Workflow-Aufgabe',
              content: cfg.description,
              metadata: { workflow_id: workflowId, step_index: i },
            })

            run.log.push({ step_index: i, step_type: 'task', status: 'done', message: `Aufgabe: ${cfg.description}`, timestamp: new Date().toISOString() })

          } else if (step.type === 'condition') {
            const cfg = step.config as WorkflowStepConditionConfig
            const passed = evaluateCondition(lead, cfg)

            if (!passed) {
              run.log.push({ step_index: i, step_type: 'condition', status: 'skipped', message: `Bedingung nicht erfüllt: ${cfg.field} ${cfg.operator} ${cfg.value}`, timestamp: new Date().toISOString() })
              aborted = true
              break
            }

            run.log.push({ step_index: i, step_type: 'condition', status: 'done', message: `Bedingung erfüllt: ${cfg.field} ${cfg.operator} ${cfg.value}`, timestamp: new Date().toISOString() })

          } else if (step.type === 'newsletter') {
            const cfg = step.config as WorkflowStepNewsletterConfig

            addActivity({
              lead_id: lead.id,
              type: 'newsletter',
              subject: cfg.subject || step.label || 'Newsletter',
              content: cfg.message || undefined,
              metadata: { workflow_id: workflowId, step_index: i },
            })

            run.log.push({ step_index: i, step_type: 'newsletter', status: 'done', message: `Newsletter: ${cfg.subject || step.label}`, timestamp: new Date().toISOString() })
          }
        } catch (err: any) {
          run.log.push({ step_index: i, step_type: step.type, status: 'error', message: err.message || 'Unbekannter Fehler', timestamp: new Date().toISOString() })
        }
      }

      run.status = aborted ? 'completed' : (run.log.some(l => l.status === 'error') ? 'failed' : 'completed')
      run.completed_at = new Date().toISOString()

      const allRuns = readRuns()
      allRuns.push(run)
      writeRuns(allRuns)

      if (run.status === 'completed') completed++
      else failed++
    }

    return { completed, failed }
  }

  const getTemplates = () => templateData as Partial<Workflow>[]

  return {
    workflows,
    fetchWorkflows,
    fetchWorkflow,
    createWorkflow,
    updateWorkflow,
    removeWorkflow,
    fetchWorkflowRuns,
    executeWorkflow,
    getTemplates,
  }
}
