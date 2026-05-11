/**
 * usePflegeheimWorkflows Composable
 *
 * CRUD for workflows + workflow execution engine.
 * LOCAL MODE: Uses localStorage for workflow data + client-side step execution.
 */

const WORKFLOW_FIELDS = [
  'id', 'name', 'description', 'trigger_type', 'steps',
  'is_active', 'date_created', 'date_updated', 'user_created',
]

const WORKFLOW_RUN_FIELDS = [
  'id', 'workflow_id', 'nursing_home_lead_id', 'status',
  'current_step', 'started_at', 'completed_at', 'log',
]

const USE_LOCAL = false
const STORAGE_KEY = 'crm_workflows'
const RUNS_STORAGE_KEY = 'crm_workflow_runs'

// ─── Shared localStorage state ────────────────────────────────────
const _allWorkflows = ref<CrmWorkflow[]>([])
const _allRuns = ref<CrmWorkflowRun[]>([])
let _loaded = false

const loadFromStorage = () => {
  if (_loaded) return
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) _allWorkflows.value = JSON.parse(stored)
    const runsStored = localStorage.getItem(RUNS_STORAGE_KEY)
    if (runsStored) _allRuns.value = JSON.parse(runsStored)
  } catch { /* ignore */ }
  _loaded = true
}

const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_allWorkflows.value))
  } catch { /* ignore */ }
}

const saveRunsToStorage = () => {
  try {
    localStorage.setItem(RUNS_STORAGE_KEY, JSON.stringify(_allRuns.value))
  } catch { /* ignore */ }
}

export const usePflegeheimWorkflows = () => {
  const secureData = USE_LOCAL ? null : useSecureData()
  const getItems = secureData?.getItems ?? (async () => [])
  const getItem = secureData?.getItem ?? (async () => null as any)
  const createItem = secureData?.createItem ?? (async () => null as any)
  const updateItem = secureData?.updateItem ?? (async () => null as any)
  const deleteItem = secureData?.deleteItem ?? (async () => null as any)
  const isLoading = secureData?.isLoading ?? ref(false)
  const error = secureData?.error ?? ref(null)

  const workflows = ref<CrmWorkflow[]>([])
  const workflowRuns = ref<CrmWorkflowRun[]>([])

  if (USE_LOCAL && import.meta.client) loadFromStorage()

  // ─── LOCAL implementations ────────────────────────────────────

  const fetchWorkflowsLocal = (triggerType?: WorkflowTriggerType | null) => {
    let result = [..._allWorkflows.value]
    if (triggerType) result = result.filter(w => w.trigger_type === triggerType)
    result.sort((a, b) => (b.date_updated || '').localeCompare(a.date_updated || ''))
    workflows.value = result
    return result
  }

  const fetchWorkflowLocal = (id: string) => {
    return _allWorkflows.value.find(w => w.id === id) || null
  }

  const createWorkflowLocal = (data: Partial<CrmWorkflow>) => {
    const now = new Date().toISOString()
    const newWf: CrmWorkflow = {
      id: `wf_${Date.now()}`,
      name: data.name || 'Neuer Workflow',
      description: data.description || '',
      trigger_type: data.trigger_type || 'manual',
      steps: data.steps || [],
      is_active: data.is_active ?? false,
      date_created: now,
      date_updated: now,
    }
    _allWorkflows.value.push(newWf)
    saveToStorage()
    return newWf
  }

  const updateWorkflowLocal = (id: string, data: Partial<CrmWorkflow>) => {
    const idx = _allWorkflows.value.findIndex(w => w.id === id)
    if (idx !== -1) {
      _allWorkflows.value[idx] = { ..._allWorkflows.value[idx], ...data, date_updated: new Date().toISOString() }
      saveToStorage()

      const listIdx = workflows.value.findIndex(w => w.id === id)
      if (listIdx !== -1) workflows.value[listIdx] = { ...workflows.value[listIdx], ...data }
    }
    return _allWorkflows.value.find(w => w.id === id) || null
  }

  const removeWorkflowLocal = (id: string) => {
    _allWorkflows.value = _allWorkflows.value.filter(w => w.id !== id)
    saveToStorage()
    workflows.value = workflows.value.filter(w => w.id !== id)
  }

  const fetchWorkflowRunsLocal = (workflowId: string) => {
    workflowRuns.value = _allRuns.value
      .filter(r => r.workflow_id === workflowId)
      .sort((a, b) => (b.started_at || '').localeCompare(a.started_at || ''))
      .slice(0, 50)
    return workflowRuns.value
  }

  // ─── Workflow Execution Engine ────────────────────────────────

  const executeWorkflow = async (workflowId: string, leadIds: string[]) => {
    const wf = USE_LOCAL
      ? _allWorkflows.value.find(w => w.id === workflowId)
      : await getItem<CrmWorkflow>({ collection: 'crm_workflows', id: workflowId, params: { fields: WORKFLOW_FIELDS } })

    if (!wf || !wf.steps || wf.steps.length === 0) return []

    const { createActivity } = useActivities()
    const { fetchLead } = usePflegeheimLeads()

    const runs: CrmWorkflowRun[] = []

    for (const leadId of leadIds) {
      const now = new Date().toISOString()
      const run: CrmWorkflowRun = {
        id: `run_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        workflow_id: workflowId,
        nursing_home_lead_id: leadId,
        status: 'running',
        current_step: 0,
        started_at: now,
        log: [],
      }

      const lead = await fetchLead(leadId)

      let aborted = false
      for (let i = 0; i < wf.steps.length; i++) {
        const step = wf.steps[i]
        run.current_step = i

        try {
          switch (step.type) {
            case 'email': {
              const config = step.config as { template_id?: string; delay_days?: number }
              await createActivity({
                nursing_home_lead_id: leadId,
                type: 'email_sent',
                subject: `Workflow: ${step.label || 'E-Mail'} (${wf.name})`,
                content: config.template_id
                  ? `E-Mail-Vorlage: ${config.template_id}`
                  : `Automatische E-Mail aus Workflow "${wf.name}"`,
                direction: 'outbound',
                metadata: {
                  workflow_id: workflowId,
                  workflow_name: wf.name,
                  step_index: i,
                  step_label: step.label,
                  template_id: config.template_id || null,
                  source: 'workflow',
                },
              })
              run.log!.push({ step: i, type: 'email', status: 'done', timestamp: new Date().toISOString() })
              break
            }

            case 'task': {
              const config = step.config as { description?: string }
              await createActivity({
                nursing_home_lead_id: leadId,
                type: 'task',
                subject: `Aufgabe: ${step.label || 'Task'} (${wf.name})`,
                content: config.description || null,
                metadata: {
                  workflow_id: workflowId,
                  workflow_name: wf.name,
                  step_index: i,
                  step_label: step.label,
                  source: 'workflow',
                },
              })
              run.log!.push({ step: i, type: 'task', status: 'done', timestamp: new Date().toISOString() })
              break
            }

            case 'wait': {
              const config = step.config as { days?: number }
              run.log!.push({
                step: i, type: 'wait', status: 'done',
                message: `${config.days || 1} Tage Wartezeit (uebersprungen im lokalen Modus)`,
                timestamp: new Date().toISOString(),
              })
              break
            }

            case 'condition': {
              const config = step.config as { field?: string; operator?: string; value?: string }
              if (!lead || !config.field) {
                run.log!.push({ step: i, type: 'condition', status: 'skipped', message: 'Kein Lead oder Feld', timestamp: new Date().toISOString() })
                break
              }

              const leadValue = String((lead as any)[config.field] ?? '')
              const compareValue = config.value || ''
              let passed = false

              switch (config.operator) {
                case 'equals': passed = leadValue === compareValue; break
                case 'not_equals': passed = leadValue !== compareValue; break
                case 'contains': passed = leadValue.toLowerCase().includes(compareValue.toLowerCase()); break
                case 'greater_than': passed = Number(leadValue) > Number(compareValue); break
                case 'less_than': passed = Number(leadValue) < Number(compareValue); break
                default: passed = false
              }

              run.log!.push({
                step: i, type: 'condition',
                status: passed ? 'passed' : 'failed',
                message: `${config.field} ${config.operator} "${compareValue}" -> ${passed ? 'Ja' : 'Nein (Workflow beendet)'}`,
                timestamp: new Date().toISOString(),
              })

              if (!passed) {
                aborted = true
              }
              break
            }

            case 'sms': {
              const config = step.config as { message?: string }
              await createActivity({
                nursing_home_lead_id: leadId,
                type: 'sms',
                subject: `SMS: ${step.label || 'Nachricht'} (${wf.name})`,
                content: config.message || null,
                direction: 'outbound',
                metadata: {
                  workflow_id: workflowId,
                  workflow_name: wf.name,
                  step_index: i,
                  source: 'workflow',
                },
              })
              run.log!.push({ step: i, type: 'sms', status: 'done', timestamp: new Date().toISOString() })
              break
            }
          }
        } catch (err: any) {
          run.log!.push({ step: i, type: step.type, status: 'error', message: err.message, timestamp: new Date().toISOString() })
        }

        if (aborted) break
      }

      run.status = aborted ? 'failed' : 'completed'
      run.completed_at = new Date().toISOString()
      run.current_step = aborted ? run.current_step : wf.steps.length - 1

      if (USE_LOCAL) {
        _allRuns.value.push(run)
        saveRunsToStorage()
      }

      runs.push(run)
    }

    return runs
  }

  // ─── Public API ────────────────────────────────────────────────

  const fetchWorkflows = async (triggerType?: WorkflowTriggerType | null) => {
    if (USE_LOCAL) return fetchWorkflowsLocal(triggerType)

    const filter: Record<string, any> = {}
    if (triggerType) filter.trigger_type = { _eq: triggerType }

    const result = await getItems<CrmWorkflow>({
      collection: 'crm_workflows',
      params: {
        fields: WORKFLOW_FIELDS,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        sort: ['-date_updated'],
      },
    })
    workflows.value = result
    return result
  }

  const fetchWorkflow = async (id: string) => {
    if (USE_LOCAL) return fetchWorkflowLocal(id)
    return await getItem<CrmWorkflow>({
      collection: 'crm_workflows',
      id,
      params: { fields: WORKFLOW_FIELDS },
    })
  }

  const createWorkflow = async (data: Partial<CrmWorkflow>) => {
    if (USE_LOCAL) return createWorkflowLocal(data)
    return await createItem<Partial<CrmWorkflow>>({
      collection: 'crm_workflows',
      data,
    })
  }

  const updateWorkflow = async (id: string, data: Partial<CrmWorkflow>) => {
    if (USE_LOCAL) return updateWorkflowLocal(id, data)

    const result = await updateItem<CrmWorkflow>({
      collection: 'crm_workflows',
      id,
      data,
    })
    const index = workflows.value.findIndex(w => w.id === id)
    if (index !== -1) workflows.value[index] = { ...workflows.value[index], ...data }
    return result
  }

  const removeWorkflow = async (id: string) => {
    if (USE_LOCAL) return removeWorkflowLocal(id)
    await deleteItem({ collection: 'crm_workflows', id })
    workflows.value = workflows.value.filter(w => w.id !== id)
  }

  const fetchWorkflowRuns = async (workflowId: string, limit = 50) => {
    if (USE_LOCAL) return fetchWorkflowRunsLocal(workflowId)

    const result = await getItems<CrmWorkflowRun>({
      collection: 'crm_workflow_runs',
      params: {
        fields: WORKFLOW_RUN_FIELDS,
        filter: { workflow_id: { _eq: workflowId } },
        sort: ['-started_at'],
        limit,
      },
    })
    workflowRuns.value = result
    return result
  }

  return {
    workflows,
    workflowRuns,
    isLoading,
    error,
    fetchWorkflows,
    fetchWorkflow,
    createWorkflow,
    updateWorkflow,
    removeWorkflow,
    fetchWorkflowRuns,
    executeWorkflow,
  }
}
