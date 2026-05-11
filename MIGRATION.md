# wunschlachen-crm Migration Plan

**Stand:** 2026-05-11
**Branch:** `feat/full-merge`
**Snapshot-Tag:** `pre-full-merge` (auf `main` HEAD)
**Owner:** Tony Günther

---

## 1. Ziel (Restate)

`wunschlachen-crm` wird zum vereinigten Wunschlachen-CRM ausgebaut und ersetzt `ZAP-Wunschlachen/CRM` über DNS-Cutover, sobald komplett & stabil. Layer-Architektur (`base`/`pflegeheime`/`patienten`) bleibt.

**Drei Quellen, zwei Personas:**
- **B2B-Praxisteam** (Pflegeheim-Sales) — komplette Funktionalität aus `ZAP-Wunschlachen/CRM`
- **B2C-Praxisteam** (Implant-Lead-Funnel) — komplette Funktionalität aus `ZAP-Wunschlachen/patient-crm`
- Heimkunden-Bereich (customer-app) ist **nicht** im Scope.

---

## 2. Beantwortete Strategie-Fragen

| Frage | Antwort |
|---|---|
| Arbeits-Repo | `wunschlachen-crm` (lokal `~/TonyDev/wunschlachen-crm`) |
| Stack-Strategie | Vuetify ist Ziel — *aber siehe Stack-Realität in §5, Phase 1 wird viel kleiner als gedacht* |
| Reihenfolge | Stack → Navigation+Design → B2B-Vervollständigung → B2C-Vervollständigung → Backend/Auth → Tests → Cutover |
| Auth-Pattern | Externer Redirect zu `login.wunschlachen.app` (wie heute in `layers/base/composables/useAuth.ts`) — keine lokale Login-Seite nötig |
| Brevo-Migration | Mit eingebaut (public → server-only Nitro-Route) |
| CRM-Hauptrepo Feature-Freeze | Ja — keine neuen Features auf CRM während Migration |
| patient-crm-Repo | Bleibt als Backup, wird nicht weiter gepflegt |
| Routing-Konvention | `/crm/*` (B2B inkl. heime/index, heime/bewohner, heime/[id]) + `/patienten/*` (B2C) — CRM-Hauptrepo-Konvention, alles unter /crm/ |
| Directus-Extensions | Mit in `wunschlachen-crm/directus-extensions/` migrieren (Single-Source-of-Truth) |
| B2C Leads-Listen-View | `/patienten/liste` (oder ähnlich) als separate Page migrieren — neben Pipeline |
| Composable-Naming | Duplikate umbenennen: `usePflegeheimLeads` + `usePatientLeads`, gleiche Konvention für `useWorkflows`, `useEmailTemplates` falls dupliziert |
| Visuelle Soll-Definition | **Exakt wie CRM-Hauptrepo-Live** (`wl-shared-components` Vuetify-Theme as-is) — nahtloser DNS-Cutover, User merkt nichts |
| Directus-Rolle CRM-Zugriff | Tony Günther als initialer Test-User; finalen Rollennamen in Phase 5 setzen |
| Voice-AI Backend | Muss implementiert werden, geringere Prio, in Phase 5 optional |
| `wl-shared-components` | Aufnehmen (CRM-Hauptrepo nutzt es) |
| Staging-Setup | Entfällt — wunschlachen-crm ist der sichere Spielplatz, kein Live-Deploy bis komplett |

---

## 3. Inventur B2B — `ZAP-Wunschlachen/CRM` → `wunschlachen-crm/layers/pflegeheime`

### 3.1 Pages

| CRM-Hauptrepo Page | Status in pflegeheime-Layer | Aktion |
|---|---|---|
| `pages/crm/aktivitaeten.vue` | ✅ vorhanden | ggf. Inhalts-Diff |
| `pages/crm/aufgaben.vue` | ✅ vorhanden | ggf. Inhalts-Diff |
| `pages/crm/duplikate.vue` | ✅ vorhanden | ggf. Inhalts-Diff |
| `pages/crm/einstellungen/crawler.vue` | ❌ **FEHLT** | migrieren |
| `pages/crm/einstellungen/email-vorlagen.vue` | ✅ vorhanden | ggf. Inhalts-Diff |
| `pages/crm/einstellungen/erinnerungen.vue` | ✅ vorhanden | ggf. Inhalts-Diff |
| `pages/crm/einstellungen/implementation.vue` | ❌ **FEHLT** | migrieren |
| `pages/crm/einstellungen/import.vue` | ✅ vorhanden | ggf. Inhalts-Diff |
| `pages/crm/einstellungen/index.vue` | ✅ vorhanden | ggf. Inhalts-Diff |
| `pages/crm/einstellungen/newsletter.vue` | ✅ vorhanden | ggf. Inhalts-Diff |
| `pages/crm/einstellungen/telefonie.vue` | ✅ vorhanden | ggf. Inhalts-Diff |
| `pages/crm/heime/[id].vue` | ⚠️ als `pflegeheime/[id].vue` umbenannt | Inhalts-Diff, Route ggf. anpassen |
| `pages/crm/inbox.vue` | ✅ vorhanden | ggf. Inhalts-Diff |
| `pages/crm/index.vue` | ❌ **FEHLT** | migrieren (CRM-Übersicht) |
| `pages/crm/kontakte.vue` | ✅ vorhanden | ggf. Inhalts-Diff |
| `pages/crm/leads/[id].vue` | ✅ vorhanden | ggf. Inhalts-Diff |
| `pages/crm/leads/index.vue` | ✅ vorhanden | ggf. Inhalts-Diff |
| `pages/crm/pipeline.vue` | ✅ vorhanden | ggf. Inhalts-Diff |
| `pages/crm/statistiken.vue` | ✅ vorhanden | ggf. Inhalts-Diff |
| `pages/crm/termine.vue` | ❌ **FEHLT** | migrieren |
| `pages/crm/workflows/[id].vue` | ✅ vorhanden | ggf. Inhalts-Diff |
| `pages/crm/workflows/index.vue` | ✅ vorhanden | ggf. Inhalts-Diff |
| `pages/dash.vue` | n/a | Heimkunden — nicht im Scope |
| `pages/login.vue` / `logout.vue` | n/a | Auth in base/ |

**Fehlende B2B-Pages: 4** (`einstellungen/crawler`, `einstellungen/implementation`, `crm/index`, `crm/termine`) + Route-Klärung für `heime/[id]`

**pflegeheime-Layer Bonus-Pages (in CRM nicht vorhanden):**
- `pages/pflegeheime/bewohner/index.vue`
- `pages/pflegeheime/index.vue`

### 3.2 Components

**CRM-Hauptrepo Components mit Status in pflegeheime-Layer:**

| CRM-Component | Status | Aktion |
|---|---|---|
| `crm/ActivityFeed.vue` | ✅ | Inhalts-Diff |
| `crm/ActivityFeedPlaceholder.vue` | ❌ **FEHLT** | migrieren |
| `crm/ActivityIcon.vue` | ❌ **FEHLT** | migrieren |
| `crm/ActivityLogDialog.vue` | ✅ | Inhalts-Diff |
| `crm/ActivityQuickActions.vue` | ✅ | Inhalts-Diff |
| `crm/AiCallBriefing.vue` | ✅ | Inhalts-Diff |
| `crm/AiEmailSuggestion.vue` | ✅ | Inhalts-Diff |
| `crm/AiSummarizeButton.vue` | ❌ **FEHLT** | migrieren |
| `crm/CallHistory.vue` | ✅ | Inhalts-Diff |
| `crm/CallLogDialog.vue` | ✅ | Inhalts-Diff |
| `crm/CallScriptPanel.vue` | ✅ | Inhalts-Diff |
| `crm/ContactBar.vue` | ✅ | Inhalts-Diff |
| `crm/ContactsList.vue` | ✅ | Inhalts-Diff |
| `crm/CreateLeadDialog.vue` | ✅ | Inhalts-Diff |
| `crm/DocumentList.vue` | ✅ | Inhalts-Diff |
| `crm/DocumentUploadDialog.vue` | ✅ | Inhalts-Diff |
| `crm/EmailComposeDialog.vue` | ✅ | Inhalts-Diff |
| `crm/EmailTemplateEditor.vue` | ✅ | Inhalts-Diff |
| `crm/EmailTemplateSelector.vue` | ✅ | Inhalts-Diff |
| `crm/FollowUpIndicator.vue` | ❌ **FEHLT** | migrieren |
| `crm/GhostingRiskBadge.vue` | ✅ | Inhalts-Diff |
| `crm/InfoRow.vue` | ❌ **FEHLT** | migrieren |
| `crm/LeadCard.vue` | ✅ | Inhalts-Diff |
| `crm/LeadLocationMap.vue` | ❌ **FEHLT** | migrieren |
| `crm/LeadNearbyMap.vue` | ❌ **FEHLT** | migrieren |
| `crm/LeadStatusBadge.vue` | ✅ | Inhalts-Diff |
| `crm/LeadTimeline.vue` | ✅ | Inhalts-Diff |
| `crm/NewsletterContentEditor.vue` | ❌ **FEHLT** | migrieren |
| `crm/NewsletterDialog.vue` | ✅ | Inhalts-Diff |
| `crm/NextLeadSuggestion.vue` | ✅ | Inhalts-Diff |
| `crm/PhoneButton.vue` | ✅ | Inhalts-Diff |
| `crm/PipelineKanban.vue` | ✅ | Inhalts-Diff |
| `crm/PriorityBadge.vue` | ❌ **FEHLT** | migrieren |
| `crm/SaveViewDialog.vue` | ❌ **FEHLT** | migrieren |
| `crm/SmartViewSidebar.vue` | ✅ | Inhalts-Diff |
| `crm/WhatsNewPopup.vue` | ❌ **FEHLT** | migrieren |
| `Dashboard/*`, `General/*`, `Icons/*`, `Nav/*`, `AddNewPatient.vue` | n/a | Heimkunden / Base — nicht im B2B-Scope |

**Fehlende B2B-Components: 11**

### 3.3 Composables

| CRM-Composable | Status in wunschlachen-crm | Aktion |
|---|---|---|
| `useActivities.ts` | ✅ pflegeheime | Inhalts-Diff |
| `useAuth.ts` | ✅ base | Inhalts-Diff |
| `useBrevo.ts` | ❌ **FEHLT** | migrieren (B2B-Brevo-Variante) |
| `useContacts.ts` | ✅ pflegeheime | Inhalts-Diff |
| `useDirectusUtils.ts` | ✅ base | Inhalts-Diff |
| `useDocuments.ts` | ✅ pflegeheime | Inhalts-Diff |
| `useDuplicates.ts` | ✅ pflegeheime | Inhalts-Diff |
| `useEmailTemplates.ts` | ⚠️ in patienten, nicht pflegeheime | klären ob shared oder dupliziert |
| `useGeocode.ts` | ✅ pflegeheime | Inhalts-Diff |
| `useLeads.ts` | ✅ pflegeheime | Inhalts-Diff (auch in patienten — anderes Schema?) |
| `useNewsletterContent.ts` | ✅ pflegeheime | Inhalts-Diff |
| `useNextLeadQueue.ts` | ✅ pflegeheime | Inhalts-Diff |
| `useNursingHomes.ts` | ✅ pflegeheime | Inhalts-Diff |
| `usePlacetel.ts` | ✅ pflegeheime | Inhalts-Diff |
| `useSecureData.ts` | ✅ base | Inhalts-Diff |
| `useSmartViews.ts` | ✅ pflegeheime | Inhalts-Diff |
| `useSocket.ts` | ✅ pflegeheime | Inhalts-Diff |
| `useUserRole.ts` | ✅ base | Inhalts-Diff |
| `useWorkflows.ts` | ✅ pflegeheime | Inhalts-Diff (auch in patienten) |

**Fehlende B2B-Composables: 1-2** (`useBrevo`, evtl. `useEmailTemplates`-B2B-Variante)

### 3.4 Directus-Extensions

CRM-Hauptrepo hat `directus-extensions/`:
- `placetel-service/` — Placetel-Integration (Telefonie)
- `crawler-service/` — Lead-Crawler
- `email-service/` — E-Mail-Versand

❓ Diese sind eigenständige Directus-Extensions, nicht Teil des Frontends. In wunschlachen-crm aktuell nicht vorhanden. **Entscheidung nötig:** Mit migrieren? Oder bleiben sie im CRM-Repo / werden separat deployed?

### 3.5 Docs aus CRM-Hauptrepo zu prüfen
- `CUSTOMER_APP_STATE_MACHINE.md`
- `SECURITY_FIXES_SUMMARY.md`

---

## 4. Inventur B2C — `ZAP-Wunschlachen/patient-crm` → `wunschlachen-crm/layers/patienten`

### 4.1 Pages

| patient-crm Page | Status in patienten-Layer | Routing-Note |
|---|---|---|
| `pages/crm/index.vue` | ✅ als `patienten/index.vue` | Route von `/crm` → `/patienten` |
| `pages/crm/pipeline.vue` | ✅ als `patienten/pipeline.vue` | |
| `pages/crm/leads/[id].vue` | ✅ als `patienten/[id].vue` | flatter |
| `pages/crm/leads/index.vue` | ⚠️ **fehlt als eigene Lead-Liste** | klären: ersetzt durch Pipeline? |
| `pages/crm/termine/index.vue` | ✅ als `patienten/termine/index.vue` | |
| `pages/crm/workflows/index.vue` | ✅ | |
| `pages/crm/workflows/[id].vue` | ✅ | |
| `pages/crm/bewertungen/index.vue` | ✅ als `patienten/bewertungen.vue` | |
| `pages/crm/einstellungen/index.vue` | ✅ | |
| `pages/crm/einstellungen/brevo.vue` | ✅ | |
| `pages/crm/einstellungen/lead-scoring.vue` | ✅ | |
| `pages/crm/einstellungen/email-vorlagen.vue` | ✅ | |
| `pages/crm/einstellungen/bewertungen.vue` | ✅ | |
| `pages/index.vue` / `login.vue` / `logout.vue` | n/a | base/auth |

**Fehlende B2C-Pages: 0-1** (klären ob `leads/index.vue` als separate Lead-Listen-View nötig)

**patienten-Layer Bonus-Pages (in patient-crm nicht vorhanden):**
- `patienten/marketing.vue` ⭐
- `patienten/voice-ai.vue` ⭐

### 4.2 Components

| patient-crm Component | Status in patienten-Layer | Aktion |
|---|---|---|
| `crm/ActivityFeed.vue` | ✅ | Inhalts-Diff |
| `crm/ActivityLogDialog.vue` | ✅ | Inhalts-Diff |
| `crm/ActivityQuickActions.vue` | ❌ **FEHLT** | migrieren |
| `crm/AppointmentCalendarView.vue` | ✅ | Inhalts-Diff |
| `crm/AppointmentCreateDialog.vue` | ✅ | Inhalts-Diff |
| `crm/AppointmentListView.vue` | ✅ | Inhalts-Diff |
| `crm/AppointmentStatusBadge.vue` | ❌ **FEHLT** | migrieren |
| `crm/CreateLeadDialog.vue` | ✅ | Inhalts-Diff |
| `crm/DashboardKPIs.vue` | ✅ | Inhalts-Diff |
| `crm/EmailComposeDialog.vue` | ✅ | Inhalts-Diff |
| `crm/EmailTemplateEditor.vue` | ✅ | Inhalts-Diff |
| `crm/EmailTemplateSelector.vue` | ✅ | Inhalts-Diff |
| `crm/GoogleReviewCard.vue` | ✅ | Inhalts-Diff |
| `crm/GoogleReviewsWidget.vue` | ✅ | Inhalts-Diff |
| `crm/LeadAppointments.vue` | ❌ **FEHLT** | migrieren |
| `crm/LeadCard.vue` | ✅ | Inhalts-Diff |
| `crm/LeadScoreBadge.vue` | ✅ | Inhalts-Diff |
| `crm/LeadScoreBreakdown.vue` | ❌ **FEHLT** | migrieren |
| `crm/LeadSourceChart.vue` | ❌ **FEHLT** | migrieren |
| `crm/LeadStatusBadge.vue` | ✅ | Inhalts-Diff |
| `crm/PipelineKanban.vue` | ✅ | Inhalts-Diff |
| `crm/PipelineKPIs.vue` | ✅ | Inhalts-Diff |
| `crm/ReactivationList.vue` | ✅ | Inhalts-Diff |
| `crm/ResponseTimeBadge.vue` | ✅ | Inhalts-Diff |
| `crm/TimeRangeFilter.vue` | ❌ **FEHLT** | migrieren |
| `crm/WorkflowStepEditor.vue` | ✅ | Inhalts-Diff |
| `Icons/Logo.vue` | n/a | base/ |

**Fehlende B2C-Components: 6**

**patienten-Layer Bonus-Components:**
- `BantScoreCard.vue` ⭐
- `SpeedToLeadKpi.vue` ⭐
- `VoiceAiCallDialog.vue` ⭐
- `VoiceAiDashboard.vue` ⭐

### 4.3 Composables

| patient-crm Composable | Status in patienten-Layer | Aktion |
|---|---|---|
| `useAppointments.ts` | ✅ | Inhalts-Diff |
| `useAuth.ts` | ✅ in base/ | konsolidiert |
| `useBrevoCom.ts` | ✅ | Inhalts-Diff + Brevo-Server-Migration |
| `useDentalServices.ts` | ✅ | Inhalts-Diff |
| `useEmail.ts` | ✅ | Inhalts-Diff |
| `useEmailTemplates.ts` | ✅ | Inhalts-Diff |
| `useExport.ts` | ✅ | Inhalts-Diff |
| `useGoogleReviews.ts` | ✅ | Inhalts-Diff |
| `useLeadActivities.ts` | ✅ | Inhalts-Diff |
| `useLeads.ts` | ✅ | Inhalts-Diff |
| `useLeadScoring.ts` | ✅ | Inhalts-Diff |
| `useLocations.ts` | ✅ | Inhalts-Diff |
| `usePipelineAnalytics.ts` | ✅ | Inhalts-Diff |
| `useReactivation.ts` | ✅ | Inhalts-Diff |
| `useResponseTime.ts` | ✅ | Inhalts-Diff |
| `useSecureData.ts` | ✅ in base/ | konsolidiert |
| `useWorkflows.ts` | ✅ | Inhalts-Diff |

**Fehlende B2C-Composables: 0**

**patienten-Layer Bonus-Composables:**
- `useSpeedToLead.ts` ⭐
- `useVoiceAgent.ts` ⭐

---

## 5. Stack-Realität (kritisches Plan-Update)

**Erkenntnis aus Code-Scan:** PrimeVue ist als Dependency in allen drei Repos installiert (CRM, patient-crm, wunschlachen-crm), wird aber **kaum als Komponenten-Library genutzt**:

| Repo | PrimeVue-Components-Usage | Vuetify-Usage | UI-Realität |
|---|---|---|---|
| `wunschlachen-crm` | 0 Tag-Verwendungen | 0 | Reines Tailwind + HTML elements |
| `CRM` (Hauptrepo) | 0 Tag-Verwendungen (nur Theme-Init) | 18× `<v-icon>`, 1× `<v-btn>` | Reines Tailwind + HTML + wl-shared-components-Plugin |
| `patient-crm` | 3× `<Toast>`, 3× `<Dialog>` | 2× `<v-chart>` | Reines Tailwind + HTML |

**Konsequenz:** Es gibt keinen großen "Vuetify-Komplett-Port" zu machen. Was wirklich passieren muss:

1. **`@zap-wunschlachen/wl-shared-components` als Dependency aufnehmen** + Plugin registrieren (wie im CRM-Hauptrepo) — das bringt Vuetify mit vorkonfiguriertem Wunschlachen-Theme
2. **`@primevue/nuxt-module` aus `layers/base/nuxt.config.ts` entfernen** (wird ja nicht genutzt)
3. **PrimeVue + Aura + primeicons als Deps entfernen** (oder vorerst behalten als Sicherheit)
4. **PrimeIcons (`pi pi-*`) in Templates** durch Material Design Icons (`mdi-*` via `<v-icon>`) ersetzen — Find-and-Replace-Job
5. **3-6 `<Toast>`/`<Dialog>`-Verwendungen** in patient-crm-Pages bei Migration direkt durch Vuetify-Pendants ersetzen

**Aufwand Phase 1 dadurch: 18-22 Tage → 3-5 Tage.**

---

## 6. Aktualisierte Phasen-Übersicht (Plan v7, final)

### Plan v7 Erweiterung
Nach Phase 0-7 kommen zwei neue Phasen:

| Phase | Inhalt | Aufwand |
|---|---|---|
| **8 Navigation v2** | Salesforce-Style Sidebar (funktions-orientiert), `<CustomerTypeTabs>`-Component, Top-Level-Pages in app/ die zwischen Heimkunden/Patienten umschalten, `useUnified*`-Wrapper-Composables | 8-12 Tage |
| **9 Ticket-System** | Zendesk-Style Inbox mit E-Mail/SMS/WhatsApp/Form/Phone-Channels, Directus-Schema (tickets, ticket_messages, ticket_macros), Nitro-Webhooks für Inbound, SLA + Auto-Assign | 15-25 Tage |

**Personas (final, ohne Bewohner — die deckt customer-app):**
- **Heimkunden** = Pflegeheim-Institutionen (B2B)
- **Patienten** = Implant-Lead-Funnel (B2C)
- Tab-Switch pro Page: `Alle | Heimkunden | Patienten`

**Reihenfolge:** Phase 8 vor Phase 9. Phase 5c/5e (Backend gegen real Directus) und Phase 6/7 (Tests + Cutover) laufen danach.

### Plan v6 unverändert

| Phase | Inhalt | Aufwand |
|---|---|---|
| **0** | Vorbereitung + diese Inventur + Branch `feat/full-merge` + Tag `pre-full-merge` | 2 Tage |
| **1** | **Stack-Konsolidierung**: wl-shared-components rein, PrimeVue-Module raus, PrimeIcons→mdi, Vuetify-Plugin via wl-shared-components in `layers/base/` | **3-5 Tage** |
| **2** | Navigation + Theme **as-is aus wl-shared-components** (nahtloser Cutover-Look), Sidebar, app/dashboard | **4-5 Tage** |
| **3** | B2B-Vervollständigung: 4 fehlende Pages, 11 fehlende Components, `useBrevo`-Composable, **Pflegeheime-Routing → /crm/heime/{index,bewohner,[id]}**, **Directus-Extensions migrieren** (placetel/crawler/email-service) | **11-16 Tage** |
| **4** | B2C-Vervollständigung: 6 fehlende Components, **`leads/index.vue` (Listen-View) migrieren**, Routing-Konsolidierung | **5-7 Tage** |
| **5** | Backend/Auth/Daten verdrahten: Directus pro Composable, Brevo-Server-Migration, Voice-AI (optional), Socket, Rollen-Middleware | 10-14 Tage |
| **6** | Tests (Playwright, Smoke, Visual Regression gegen CRM-Live) | 5 Tage |
| **7** | Cutover-Vorbereitung (DO-Deploy inkl. Directus-Extensions, DNS-Plan, CRM-Hauptrepo-Archivierung) | 3-5 Tage |
| **Verteilt über 3+4** | **Composable-Naming-Refactor**: `useLeads` → `usePflegeheimLeads`/`usePatientLeads`, gleiches für `useWorkflows`, `useEmailTemplates` | +2-3 Tage |
| **Summe** | | **45-62 Tage** |

**Solo realistisch ~9-12 Wochen.** Mit Hilfe parallel ~7-9 Wochen.

(Plan v4: 60-64 Tage → Plan v5: 39-50 → Plan v6: 45-62. Erhöhung ggü. v5 durch Tonys Entscheidungen 1A+2A+3B = +6-12 Tage; Reduktion durch 5A = -1-2 Tage)

---

## 7. Risiken (aktualisiert)

| Risiko | Severity | Mitigation |
|---|---|---|
| `wl-shared-components` API-Inkompatibilität mit Nuxt-Layer-Setup | 🟡 mittel | Phase 1 Smoke-Test im base-Layer, Fallback: eigener Vuetify-Setup |
| Directus-Schema deckt nicht alle Composables ab (Voice-AI, neue B2B-Felder) | 🟡 mittel | Phase 5 Schema-Inventur am Start |
| Brevo-Server-Migration bricht E-Mail-Versand | 🔴 hoch | Sandbox-Token, Phase-6-Tests, Feature-Toggle |
| AI-Features (NextLeadSuggestion, GhostingRiskBadge) hängen an externen Services | 🟡 mittel | Phase 3 Service-Inventur |
| Composable-Duplikate (useLeads B2B vs B2C, useWorkflows B2B vs B2C) | 🟡 mittel | Phase 3+4: bewusst getrennt halten ODER zu base/ heben |
| Directus-Extensions (placetel, crawler, email-service) Migration | 🟡 mittel | Phase 3 entscheiden ob mit migriert oder separat deployed |
| Live-CRM-Look ≠ wunschlachen-crm-Look heute | 🟡 mittel | Phase 2 visuelle Anpassung gegen CRM-Live-Screenshots |
| Cutover-Pannen | 🟡 mittel | DNS-TTL vorher senken, Rollback-Plan, CRM-Hauptrepo als Backup-Read-Only |
| Voice-AI Backend muss noch implementiert werden | 🟡 mittel | Phase 5 optional; ggf. Folge-Ticket nach Cutover |

---

## 8. Beantwortete Entscheidungen

1. ✅ **Directus-Extensions**: **MIT migrieren** in `wunschlachen-crm/directus-extensions/` (Single-Source-of-Truth). Build-Pipeline für Extensions in Phase 7 mit aufsetzen.
2. ✅ **B2C `leads/index.vue` (Listen-View)**: **MIT migrieren** als separate Page (z.B. `/patienten/liste` oder `/patienten/leads`) neben Pipeline. Empfohlen: beide Views verfügbar machen.
3. ✅ **Composable-Duplikate**: **Umbenennen für Klarheit** → `usePflegeheimLeads` + `usePatientLeads`, analog für `useWorkflows` → `usePflegeheimWorkflows` + `usePatientWorkflows`, `useEmailTemplates` falls dupliziert.
4. ✅ **Pflegeheime-Routing**: **Alles unter `/crm/*`** — `/crm/heime/index` (Liste), `/crm/heime/bewohner` (Bewohner-Liste), `/crm/heime/[id]` (Detail). Bestehende `pflegeheime/*`-Pages werden umgemappt.
5. ✅ **Visuelle Soll-Definition**: **Exakt wie CRM-Hauptrepo-Live** (`wl-shared-components` Vuetify-Theme as-is). Nahtloser DNS-Cutover ohne sichtbare Veränderung.

### Restliche offene Fragen (nicht plan-blockierend)

- **Directus-Rolle CRM-Zugriff**: konkreter Rollenname → vor Phase 5 Middleware-Implementierung klären
- **Voice-AI Backend-Architektur**: in Phase 5 entscheiden (eigener Service vs externer Provider wie ElevenLabs/Vapi)
- **CRM-Hauptrepo Read-Only nach Cutover**: archivieren (GitHub) oder als Legacy-Backup laufen lassen?

---

## 9. Branch & Tag

```
Branch: feat/full-merge (von main)
Tag:    pre-full-merge (auf main HEAD = commit 9b5fd6d)
Remote: origin = https://github.com/ZAP-Wunschlachen/wunschlachen-crm.git
```

Rollback: `git checkout main && git tag -d feat/full-merge` (Branch löschen, Tag bleibt)

---

## 10. Nächste Schritte nach OK

**Phase 1 Start (Stack-Konsolidierung, 3-5 Tage):**

1. `layers/base/package.json`: `@zap-wunschlachen/wl-shared-components ^1.0.38` hinzufügen, `pinia` + `@pinia/nuxt` bleiben (nicht aktiv genutzt aber als Dep behalten für späteren Bedarf)
2. `layers/base/nuxt.config.ts`:
   - `@primevue/nuxt-module` aus `modules` raus
   - `primevue`-Block raus
   - `build.transpile` um `@zap-wunschlachen/wl-shared-components` ergänzen
   - `vuetify`-Transpile sicherstellen
3. `layers/base/plugins/vuetify.client.ts` neu (importiert aus wl-shared-components, analog CRM-Hauptrepo `plugins/vuetify.js`)
4. `layers/base/plugins/wlSharedComponents.client.ts` neu (analog CRM-Hauptrepo `plugins/wlSharedComponents.js`)
5. PrimeIcons-Cleanup: `pi pi-*` Klassen in Templates entscheiden — entweder weiter nutzen (primeicons CSS bleibt) oder schrittweise auf `<v-icon>mdi-*</v-icon>` umstellen. **Empfehlung Phase 1**: primeicons CSS lassen, Migration erfolgt opportunistisch bei jeder Page-Berührung
6. `pnpm install` + `pnpm dev` Smoke-Build
7. Visual-Check (app/dashboard rendert, kein PrimeVue-Fehler), Smoke aller bisherigen Pages
8. Commit Phase 1 in `feat/full-merge`

## 11. Routing-Konvention (final)

**B2B `/crm/*`:**
- `/crm/` (CRM-Übersicht — fehlt aktuell, in Phase 3 migrieren)
- `/crm/pipeline` (Lead-Pipeline-Kanban)
- `/crm/leads/` (Lead-Liste)
- `/crm/leads/:id` (Lead-Detail)
- `/crm/heime/` (Pflegeheim-Liste — Migration aus `pflegeheime/index.vue`)
- `/crm/heime/bewohner` (Bewohner-Liste — Migration aus `pflegeheime/bewohner/index.vue`)
- `/crm/heime/:id` (Pflegeheim-Detail — Migration aus `pflegeheime/[id].vue` UND aus CRM-Hauptrepo)
- `/crm/kontakte`, `/crm/aktivitaeten`, `/crm/aufgaben`, `/crm/duplikate`, `/crm/inbox`, `/crm/statistiken`, `/crm/termine`
- `/crm/workflows/`, `/crm/workflows/:id`
- `/crm/einstellungen/{crawler, email-vorlagen, erinnerungen, implementation, import, newsletter, telefonie}`

**B2C `/patienten/*`:**
- `/patienten/` (Patienten-CRM-Übersicht)
- `/patienten/pipeline` (Lead-Pipeline-Kanban)
- `/patienten/leads/` (Lead-Liste — Migration aus `patient-crm/pages/crm/leads/index.vue`)
- `/patienten/:id` (Patient-Lead-Detail — bereits vorhanden als `patienten/[id].vue`)
- `/patienten/termine`, `/patienten/bewertungen`, `/patienten/marketing`, `/patienten/voice-ai`
- `/patienten/workflows/`, `/patienten/workflows/:id`
- `/patienten/einstellungen/{brevo, lead-scoring, email-vorlagen, bewertungen}`

**App-übergreifend:**
- `/` (Loading + Routing-Decision basierend auf User-Rolle)
- `/dashboard` (Übersichts-Dashboard mit KPIs aus beiden Bereichen)
- Auth via Redirect zu `login.wunschlachen.app` (extern)
