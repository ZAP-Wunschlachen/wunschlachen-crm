<template>
  <div class="max-w-4xl">
    <div class="mb-5">
      <h2 class="text-[16px] font-semibold text-gray-900">Implementation Guide</h2>
      <p class="text-[11px] text-gray-400 mt-1">Schritt-fuer-Schritt Anleitung: localStorage → Directus Live-System</p>
    </div>

    <!-- Progress Overview -->
    <div class="bg-white rounded-lg border border-gray-200/80 p-5 mb-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-[13px] font-semibold text-gray-800">Fortschritt</h3>
        <span class="text-[11px] text-gray-400">{{ completedSteps }} / {{ totalSteps }} Schritte</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-2">
        <div class="bg-[#172774] rounded-full h-2 transition-all duration-300" :style="{ width: `${(completedSteps / totalSteps) * 100}%` }" />
      </div>
    </div>

    <!-- Steps -->
    <div class="space-y-3">
      <!-- BLOCK 1: Directus Collections -->
      <div class="bg-white rounded-lg border border-gray-200/80 overflow-hidden">
        <button class="w-full flex items-center justify-between px-5 py-4 text-left" @click="toggleBlock(1)">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-database text-[14px] text-orange-500" />
            </div>
            <div>
              <h3 class="text-[13px] font-semibold text-gray-800">Block 1: Directus Collections anlegen</h3>
              <p class="text-[10px] text-gray-400 mt-0.5">4 neue Collections im Directus Admin UI erstellen</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-gray-400">~30 Min</span>
            <i :class="openBlocks.includes(1) ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="text-[10px] text-gray-400" />
          </div>
        </button>

        <div v-if="openBlocks.includes(1)" class="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
          <!-- Priority Overview -->
          <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p class="text-[10px] font-semibold text-amber-700 mb-1.5">Prioritaets-Uebersicht: Was ist zwingend, was kann warten?</p>
            <div class="grid grid-cols-2 gap-2 text-[10px]">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                <span class="text-amber-800"><strong>nursing_home_lead_activities</strong> — MUSS (Kern-Feature, Extensions brauchen sie)</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                <span class="text-amber-800"><strong>nursing_home_lead_documents</strong> — KANN spaeter (Docs vorerst in Google Drive)</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                <span class="text-amber-800"><strong>nursing_home_lead_smart_views</strong> — KANN spaeter (Standard-Views sind hardcoded)</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                <span class="text-amber-800"><strong>nursing_home_email_templates</strong> — KANN spaeter (statische Vorlagen reichen)</span>
              </div>
            </div>
            <p class="text-[10px] text-amber-600 mt-2">
              Bestehende Collections (<code>nursing_home</code>, <code>nursing_home_leads</code>, <code>nursing_home_contacts</code>) existieren bereits in Directus — keine Aktion noetig.
            </p>
          </div>

          <!-- Step 1.1 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="steps.s1_1" class="rounded border-gray-300 text-[#172774]" />
              <h4 class="text-[12px] font-semibold text-gray-700">1.1 Collection: <code class="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] font-mono">nursing_home_lead_activities</code></h4>
            </div>
            <div class="ml-6 bg-gray-50 rounded-lg p-3">
              <!-- Warum -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mb-3">
                <p class="text-[10px] font-semibold text-blue-700 mb-1">Warum brauchen wir diese Collection?</p>
                <p class="text-[10px] text-blue-600 leading-relaxed">
                  Die <strong>zentrale Chronik</strong> des gesamten CRM. Jede Interaktion mit einem Pflegeheim wird hier gespeichert:
                  Anrufe (Placetel), E-Mails (gesendet/empfangen), Notizen, Stage-Wechsel, Newsletter-Versand, Termine.
                  Ohne diese Collection gibt es keinen Activity Feed auf der Lead-Detail-Seite, keine Anruf-Historie,
                  keine E-Mail-Logs und keine Statistiken ueber Vertriebsaktivitaeten.
                  <strong>Die Email-Service Extension und Placetel Extension schreiben beide direkt in diese Collection.</strong>
                </p>
                <p class="text-[10px] text-blue-500 mt-1.5">
                  <strong>Alternative falls nicht moeglich:</strong> Daten bleiben im Browser-localStorage — gehen aber verloren bei Cache-Leerung,
                  sind nicht zwischen Geraeten synchronisiert und fuer andere Teammitglieder unsichtbar. Keine echte Alternative fuer Produktion.
                </p>
              </div>
              <p class="text-[10px] text-gray-500 mb-2">Directus Admin → Settings → Data Model → "+" → Collection Name: <strong>nursing_home_lead_activities</strong></p>
              <p class="text-[10px] text-gray-500 mb-2">System-Felder aktivieren: <strong>date_created, user_created, date_updated, user_updated</strong></p>
              <table class="w-full text-[10px]">
                <thead><tr class="text-left text-gray-500 border-b border-gray-200">
                  <th class="pb-1 pr-3">Feld</th><th class="pb-1 pr-3">Interface</th><th class="pb-1 pr-3">Typ</th><th class="pb-1">Hinweise</th>
                </tr></thead>
                <tbody class="text-gray-700">
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">nursing_home_lead_id</td><td class="pr-3">Many-to-One</td><td class="pr-3">integer</td><td>FK → nursing_home_leads</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">nursing_home_id</td><td class="pr-3">Many-to-One</td><td class="pr-3">integer</td><td>FK → nursing_home, nullable</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">contact_id</td><td class="pr-3">Many-to-One</td><td class="pr-3">integer</td><td>FK → nursing_home_contacts, nullable</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">type</td><td class="pr-3">Dropdown</td><td class="pr-3">string</td><td>call, email_sent, email_received, sms, whatsapp, meeting, note, stage_change, task, document, newsletter</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">subject</td><td class="pr-3">Input</td><td class="pr-3">string(255)</td><td></td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">content</td><td class="pr-3">Textarea</td><td class="pr-3">text</td><td>nullable</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">direction</td><td class="pr-3">Dropdown</td><td class="pr-3">string</td><td>inbound, outbound — nullable</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">outcome</td><td class="pr-3">Dropdown</td><td class="pr-3">string</td><td>successful, no_contact, callback, rejection — nullable</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">duration_minutes</td><td class="pr-3">Input</td><td class="pr-3">integer</td><td>nullable</td></tr>
                  <tr><td class="py-1.5 pr-3 font-mono">metadata</td><td class="pr-3">Code (JSON)</td><td class="pr-3">json</td><td>nullable</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Step 1.2 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="steps.s1_2" class="rounded border-gray-300 text-[#172774]" />
              <h4 class="text-[12px] font-semibold text-gray-700">1.2 Collection: <code class="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] font-mono">nursing_home_lead_documents</code></h4>
            </div>
            <div class="ml-6 bg-gray-50 rounded-lg p-3">
              <!-- Warum -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mb-3">
                <p class="text-[10px] font-semibold text-blue-700 mb-1">Warum brauchen wir diese Collection?</p>
                <p class="text-[10px] text-blue-600 leading-relaxed">
                  Speichert <strong>Vertraege, Praesentationen, Korrespondenz und Onboarding-Unterlagen</strong> pro Lead.
                  Dateien werden ueber das Directus File-System verwaltet (direkter Upload in die Datenbank).
                  Ohne diese Collection koennen keine Dokumente an Leads angehaengt werden — z.B. Kooperationsvertraege,
                  Angebotsschreiben oder Praesentationsmaterial.
                </p>
                <p class="text-[10px] text-blue-500 mt-1.5">
                  <strong>Alternative:</strong> Dokumente koennten als base64-Strings in localStorage gespeichert werden (aktueller Stand),
                  aber das hat ein Limit von ca. 5 MB pro Browser und ist nicht zwischen Geraeten verfuegbar.
                  Oder: Dateien komplett extern (Google Drive, Dropbox) verwalten und nur Links in Notizen einfuegen — aber dann keine Integration im CRM.
                  <strong>Niedrigste Prioritaet</strong> — kann notfalls spaeter nachgezogen werden, wenn Dokument-Upload erstmal nicht gebraucht wird.
                </p>
              </div>
              <p class="text-[10px] text-gray-500 mb-2">System-Felder aktivieren: <strong>date_created, user_created</strong></p>
              <table class="w-full text-[10px]">
                <thead><tr class="text-left text-gray-500 border-b border-gray-200">
                  <th class="pb-1 pr-3">Feld</th><th class="pb-1 pr-3">Interface</th><th class="pb-1 pr-3">Typ</th><th class="pb-1">Hinweise</th>
                </tr></thead>
                <tbody class="text-gray-700">
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">nursing_home_lead_id</td><td class="pr-3">Many-to-One</td><td class="pr-3">integer</td><td>FK → nursing_home_leads</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">file_id</td><td class="pr-3">File</td><td class="pr-3">uuid</td><td>FK → directus_files</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">category</td><td class="pr-3">Dropdown</td><td class="pr-3">string</td><td>contract, presentation, onboarding, correspondence, other</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">name</td><td class="pr-3">Input</td><td class="pr-3">string</td><td></td></tr>
                  <tr><td class="py-1.5 pr-3 font-mono">notes</td><td class="pr-3">Textarea</td><td class="pr-3">text</td><td>nullable</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Step 1.3 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="steps.s1_3" class="rounded border-gray-300 text-[#172774]" />
              <h4 class="text-[12px] font-semibold text-gray-700">1.3 Collection: <code class="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] font-mono">nursing_home_lead_smart_views</code></h4>
            </div>
            <div class="ml-6 bg-gray-50 rounded-lg p-3">
              <!-- Warum -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mb-3">
                <p class="text-[10px] font-semibold text-blue-700 mb-1">Warum brauchen wir diese Collection?</p>
                <p class="text-[10px] text-blue-600 leading-relaxed">
                  Speichert <strong>benutzerdefinierte Filter-Ansichten</strong> fuer die Lead-Liste.
                  Z.B. "Alle Leads in Berlin mit Prioritaet A" oder "Follow-up diese Woche".
                  Diese Views erscheinen in der Sidebar und ermoeglichen schnellen Zugriff auf haeufig genutzte Filter-Kombinationen.
                  Ohne die Collection gehen selbst erstellte Views verloren wenn der Browser-Cache geleert wird.
                </p>
                <p class="text-[10px] text-blue-500 mt-1.5">
                  <strong>Alternative:</strong> Smart Views koennten komplett im localStorage bleiben — funktioniert fuer einen einzelnen Nutzer
                  auf einem einzelnen Geraet. Die 3 Standard-Views (Heisse Leads, Follow-up faellig, Ohne Aktivitaet) sind ohnehin hardcoded
                  und brauchen keine Datenbank. <strong>Kann uebersprungen werden</strong> wenn nur ein User das CRM nutzt und eigene Views nicht noetig sind.
                </p>
              </div>
              <p class="text-[10px] text-gray-500 mb-2">System-Felder aktivieren: <strong>date_created, user_created</strong></p>
              <table class="w-full text-[10px]">
                <thead><tr class="text-left text-gray-500 border-b border-gray-200">
                  <th class="pb-1 pr-3">Feld</th><th class="pb-1 pr-3">Interface</th><th class="pb-1 pr-3">Typ</th><th class="pb-1">Hinweise</th>
                </tr></thead>
                <tbody class="text-gray-700">
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">name</td><td class="pr-3">Input</td><td class="pr-3">string</td><td></td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">filters</td><td class="pr-3">Code (JSON)</td><td class="pr-3">json</td><td></td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">sort</td><td class="pr-3">Code (JSON)</td><td class="pr-3">json</td><td>nullable</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">icon</td><td class="pr-3">Input</td><td class="pr-3">string</td><td>nullable, z.B. "pi pi-bolt"</td></tr>
                  <tr><td class="py-1.5 pr-3 font-mono">is_shared</td><td class="pr-3">Toggle</td><td class="pr-3">boolean</td><td>default: false</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Step 1.4 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="steps.s1_4" class="rounded border-gray-300 text-[#172774]" />
              <h4 class="text-[12px] font-semibold text-gray-700">1.4 Collection: <code class="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] font-mono">nursing_home_email_templates</code></h4>
            </div>
            <div class="ml-6 bg-gray-50 rounded-lg p-3">
              <!-- Warum -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mb-3">
                <p class="text-[10px] font-semibold text-blue-700 mb-1">Warum brauchen wir diese Collection?</p>
                <p class="text-[10px] text-blue-600 leading-relaxed">
                  Speichert <strong>wiederverwendbare E-Mail-Vorlagen</strong> fuer Erstansprache, Follow-ups, Onboarding-Infos und Praesentationseinladungen.
                  Vorlagen enthalten Variablen wie <code v-pre>{{kontakt.vorname}}</code> die beim Versand automatisch ersetzt werden.
                  Ohne diese Collection muesste jede E-Mail von Grund auf neu geschrieben werden — kein standardisierter Vertriebsprozess moeglich.
                </p>
                <p class="text-[10px] text-blue-500 mt-1.5">
                  <strong>Alternative:</strong> Aktuell laden die Vorlagen aus einer statischen JSON-Datei im Code (<code>data/email-templates.json</code>)
                  + localStorage-Anpassungen. Das funktioniert, aber neue Vorlagen koennen nur durch Code-Deployment hinzugefuegt werden,
                  nicht durch den User im CRM. <strong>Kann uebersprungen werden</strong> — die statischen Vorlagen reichen fuer den Start,
                  spaeter nachruestbar wenn das Team eigene Vorlagen erstellen will.
                </p>
              </div>
              <p class="text-[10px] text-gray-500 mb-2">System-Felder aktivieren: <strong>date_created, user_created, date_updated, user_updated</strong></p>
              <table class="w-full text-[10px]">
                <thead><tr class="text-left text-gray-500 border-b border-gray-200">
                  <th class="pb-1 pr-3">Feld</th><th class="pb-1 pr-3">Interface</th><th class="pb-1 pr-3">Typ</th><th class="pb-1">Hinweise</th>
                </tr></thead>
                <tbody class="text-gray-700">
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">name</td><td class="pr-3">Input</td><td class="pr-3">string</td><td></td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">subject</td><td class="pr-3">Input</td><td class="pr-3">string</td><td></td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">body_html</td><td class="pr-3">WYSIWYG</td><td class="pr-3">text</td><td></td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">category</td><td class="pr-3">Dropdown</td><td class="pr-3">string</td><td>outreach, follow_up, onboarding, presentation, general</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono">variables</td><td class="pr-3">Code (JSON)</td><td class="pr-3">json</td><td>nullable</td></tr>
                  <tr><td class="py-1.5 pr-3 font-mono">is_active</td><td class="pr-3">Toggle</td><td class="pr-3">boolean</td><td>default: true</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Step 1.5 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="steps.s1_5" class="rounded border-gray-300 text-[#172774]" />
              <h4 class="text-[12px] font-semibold text-gray-700">1.5 Berechtigungen setzen</h4>
            </div>
            <div class="ml-6 bg-gray-50 rounded-lg p-3 text-[10px] text-gray-600 space-y-1">
              <!-- Warum -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mb-3">
                <p class="text-[10px] font-semibold text-blue-700 mb-1">Warum brauchen wir das?</p>
                <p class="text-[10px] text-blue-600 leading-relaxed">
                  Directus schuetzt standardmaessig alle Collections — ohne explizite Berechtigungen kann das CRM-Frontend
                  keine Daten lesen oder schreiben. Die API-Aufrufe vom Frontend laufen ueber einen authentifizierten User
                  mit einer bestimmten Rolle. Diese Rolle braucht Zugriff auf alle CRM-relevanten Collections.
                </p>
                <p class="text-[10px] text-blue-500 mt-1.5">
                  <strong>Alternative:</strong> Den Admin-User direkt verwenden — funktioniert, ist aber ein Sicherheitsrisiko
                  da der Admin-Token vollen Zugriff auf ALLES hat (auch System-Collections, User-Passwoerter etc.).
                  Besser: Eine eigene "CRM Sales" Rolle mit nur den noetigsten Rechten.
                </p>
              </div>
              <p>Directus Admin → Settings → Access Control → CRM-Rolle auswaehlen (oder neue erstellen)</p>
              <p><strong>Volle Rechte (CRUD)</strong> auf:</p>
              <ul class="list-disc ml-4 space-y-0.5">
                <li><code>nursing_home</code> — Pflegeheime</li>
                <li><code>nursing_home_leads</code> — Leads</li>
                <li><code>nursing_home_contacts</code> — Kontakte</li>
                <li><code>nursing_home_lead_activities</code> — Aktivitaeten</li>
                <li><code>nursing_home_lead_documents</code> — Dokumente</li>
                <li><code>nursing_home_lead_smart_views</code> — Smart Views</li>
                <li><code>nursing_home_email_templates</code> — E-Mail Vorlagen</li>
              </ul>
              <p class="mt-1"><strong>Lese-Rechte</strong> auf:</p>
              <ul class="list-disc ml-4 space-y-0.5">
                <li><code>directus_users</code> — fuer User-Zuordnung (wer hat welchen Lead bearbeitet)</li>
                <li><code>directus_files</code> — fuer Dokument-Upload und Anzeige</li>
              </ul>
              <p class="mt-2 text-orange-500 font-semibold">Tipp: Wenn ihr nicht sicher seid welche Rolle, nutzt erstmal "Administrator" zum Testen. Eigene Rolle kann spaeter erstellt werden.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- BLOCK 2: Extensions deployen -->
      <div class="bg-white rounded-lg border border-gray-200/80 overflow-hidden">
        <button class="w-full flex items-center justify-between px-5 py-4 text-left" @click="toggleBlock(2)">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-server text-[14px] text-blue-500" />
            </div>
            <div>
              <h3 class="text-[13px] font-semibold text-gray-800">Block 2: Directus Extensions deployen</h3>
              <p class="text-[10px] text-gray-400 mt-0.5">3 Endpoint-Extensions auf den Directus-Server kopieren</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-gray-400">~20 Min</span>
            <i :class="openBlocks.includes(2) ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="text-[10px] text-gray-400" />
          </div>
        </button>

        <div v-if="openBlocks.includes(2)" class="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
          <!-- 2.1 Email -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="steps.s2_1" class="rounded border-gray-300 text-[#172774]" />
              <h4 class="text-[12px] font-semibold text-gray-700">2.1 Email-Service Extension</h4>
            </div>
            <div class="ml-6 bg-gray-50 rounded-lg p-3 text-[10px] text-gray-600 space-y-2">
              <p class="font-semibold">Build:</p>
              <pre class="bg-gray-800 text-green-400 p-2 rounded text-[9px] overflow-x-auto">cd directus-extensions/email-service
npm install
npm run build</pre>
              <p class="font-semibold mt-2">Deploy:</p>
              <p>Den gesamten Ordner <code>email-service/</code> kopieren nach:<br/>
              <code>&lt;directus-root&gt;/extensions/endpoints/email-service/</code></p>
              <p>Alternativ: Nur <code>dist/index.js</code> + <code>package.json</code> + <code>node_modules/</code></p>
              <p class="font-semibold mt-2">Environment-Variablen (in Directus .env):</p>
              <pre class="bg-gray-800 text-green-400 p-2 rounded text-[9px] overflow-x-auto">EMAIL_PROVIDER=ionos
EMAIL_USER=info@wunschlachen.de
EMAIL_PASSWORD=***euer-email-passwort***</pre>
              <p class="text-orange-500">Danach: Directus neustarten!</p>
            </div>
          </div>

          <!-- 2.2 Crawler -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="steps.s2_2" class="rounded border-gray-300 text-[#172774]" />
              <h4 class="text-[12px] font-semibold text-gray-700">2.2 Crawler-Service Extension</h4>
            </div>
            <div class="ml-6 bg-gray-50 rounded-lg p-3 text-[10px] text-gray-600 space-y-2">
              <p class="font-semibold">Build:</p>
              <pre class="bg-gray-800 text-green-400 p-2 rounded text-[9px] overflow-x-auto">cd directus-extensions/crawler-service
npm install
npm run build</pre>
              <p class="font-semibold mt-2">Deploy:</p>
              <p><code>&lt;directus-root&gt;/extensions/endpoints/crawler-service/</code></p>
              <p class="text-gray-400">Keine extra Env-Vars noetig.</p>
            </div>
          </div>

          <!-- 2.3 Placetel -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="steps.s2_3" class="rounded border-gray-300 text-[#172774]" />
              <h4 class="text-[12px] font-semibold text-gray-700">2.3 Placetel-Service Extension</h4>
            </div>
            <div class="ml-6 bg-gray-50 rounded-lg p-3 text-[10px] text-gray-600 space-y-2">
              <p class="font-semibold">Build:</p>
              <pre class="bg-gray-800 text-green-400 p-2 rounded text-[9px] overflow-x-auto">cd directus-extensions/placetel-service
npm install
npm run build</pre>
              <p class="font-semibold mt-2">Deploy:</p>
              <p><code>&lt;directus-root&gt;/extensions/endpoints/placetel-service/</code></p>
              <p class="font-semibold mt-2">Environment-Variablen:</p>
              <pre class="bg-gray-800 text-green-400 p-2 rounded text-[9px] overflow-x-auto">PLACETEL_API_TOKEN=***euer-placetel-api-token***
PLACETEL_SIP_USER=***eure-sip-user-id***</pre>
              <p class="font-semibold mt-2">Webhook einrichten:</p>
              <p>In Placetel Dashboard → Integrationen → Webhook URL:<br/>
              <code>https://wunschlachen.app/placetel-service/webhook</code></p>
              <p>Events aktivieren: <strong>IncomingCall, OutgoingCall, CallAccepted, HungUp</strong></p>
            </div>
          </div>

          <!-- 2.4 Directus Restart -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="steps.s2_4" class="rounded border-gray-300 text-[#172774]" />
              <h4 class="text-[12px] font-semibold text-gray-700">2.4 Directus neustarten</h4>
            </div>
            <div class="ml-6 bg-gray-50 rounded-lg p-3 text-[10px] text-gray-600">
              <pre class="bg-gray-800 text-green-400 p-2 rounded text-[9px] overflow-x-auto"># Docker
docker compose restart directus

# Oder systemd
sudo systemctl restart directus

# Oder PM2
pm2 restart directus</pre>
              <p class="mt-2">Danach in Directus Admin einloggen und pruefen ob die Extensions geladen wurden:<br/>
              Settings → Extensions → Alle 3 sollten als "Endpoint" gelistet sein</p>
            </div>
          </div>
        </div>
      </div>

      <!-- BLOCK 3: Environment -->
      <div class="bg-white rounded-lg border border-gray-200/80 overflow-hidden">
        <button class="w-full flex items-center justify-between px-5 py-4 text-left" @click="toggleBlock(3)">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-key text-[14px] text-green-500" />
            </div>
            <div>
              <h3 class="text-[13px] font-semibold text-gray-800">Block 3: Environment-Variablen</h3>
              <p class="text-[10px] text-gray-400 mt-0.5">Frontend + Backend Konfiguration</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-gray-400">~10 Min</span>
            <i :class="openBlocks.includes(3) ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="text-[10px] text-gray-400" />
          </div>
        </button>

        <div v-if="openBlocks.includes(3)" class="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="steps.s3_1" class="rounded border-gray-300 text-[#172774]" />
              <h4 class="text-[12px] font-semibold text-gray-700">3.1 Frontend (DigitalOcean App Platform)</h4>
            </div>
            <div class="ml-6 bg-gray-50 rounded-lg p-3 text-[10px] text-gray-600 space-y-2">
              <p>In DO App Platform → App Settings → Environment Variables:</p>
              <pre class="bg-gray-800 text-green-400 p-2 rounded text-[9px] overflow-x-auto">DIRECTUS_URL=https://wunschlachen.app
SOCKET_URL=wss://wunschlachen.app/websocket</pre>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="steps.s3_2" class="rounded border-gray-300 text-[#172774]" />
              <h4 class="text-[12px] font-semibold text-gray-700">3.2 Directus Backend (.env)</h4>
            </div>
            <div class="ml-6 bg-gray-50 rounded-lg p-3 text-[10px] text-gray-600 space-y-2">
              <p>Alle neuen Variablen fuer die Directus .env:</p>
              <pre class="bg-gray-800 text-green-400 p-2 rounded text-[9px] overflow-x-auto"># Email Service
EMAIL_PROVIDER=ionos
EMAIL_USER=info@wunschlachen.de
EMAIL_PASSWORD=***

# Placetel Telefonie
PLACETEL_API_TOKEN=***
PLACETEL_SIP_USER=***

# CORS (falls noetig — CRM-Domain erlauben)
CORS_ORIGIN=https://tony.wunschlachen.app,http://localhost:3000
CORS_CREDENTIALS=true</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- BLOCK 4: Daten-Migration -->
      <div class="bg-white rounded-lg border border-gray-200/80 overflow-hidden">
        <button class="w-full flex items-center justify-between px-5 py-4 text-left" @click="toggleBlock(4)">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-sync text-[14px] text-purple-500" />
            </div>
            <div>
              <h3 class="text-[13px] font-semibold text-gray-800">Block 4: Daten-Migration (localStorage → Directus)</h3>
              <p class="text-[10px] text-gray-400 mt-0.5">Bestehende Daten aus dem Browser in die Datenbank uebertragen</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-gray-400">~15 Min</span>
            <i :class="openBlocks.includes(4) ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="text-[10px] text-gray-400" />
          </div>
        </button>

        <div v-if="openBlocks.includes(4)" class="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
          <!-- Migration Status -->
          <div class="bg-gray-50 rounded-lg p-3 text-[10px] text-gray-600">
            <p class="font-semibold mb-2">Aktuelle localStorage-Daten:</p>
            <div class="grid grid-cols-2 gap-2">
              <div class="flex items-center justify-between bg-white rounded px-2.5 py-1.5 border border-gray-200">
                <span>Leads</span>
                <span class="font-mono font-semibold" :class="migrationCounts.leads > 0 ? 'text-[#172774]' : 'text-gray-300'">{{ migrationCounts.leads }}</span>
              </div>
              <div class="flex items-center justify-between bg-white rounded px-2.5 py-1.5 border border-gray-200">
                <span>Kontakte</span>
                <span class="font-mono font-semibold" :class="migrationCounts.contacts > 0 ? 'text-[#172774]' : 'text-gray-300'">{{ migrationCounts.contacts }}</span>
              </div>
              <div class="flex items-center justify-between bg-white rounded px-2.5 py-1.5 border border-gray-200">
                <span>Aktivitaeten</span>
                <span class="font-mono font-semibold" :class="migrationCounts.activities > 0 ? 'text-[#172774]' : 'text-gray-300'">{{ migrationCounts.activities }}</span>
              </div>
              <div class="flex items-center justify-between bg-white rounded px-2.5 py-1.5 border border-gray-200">
                <span>Dokumente</span>
                <span class="font-mono font-semibold" :class="migrationCounts.documents > 0 ? 'text-[#172774]' : 'text-gray-300'">{{ migrationCounts.documents }}</span>
              </div>
              <div class="flex items-center justify-between bg-white rounded px-2.5 py-1.5 border border-gray-200">
                <span>Smart Views</span>
                <span class="font-mono font-semibold" :class="migrationCounts.smartViews > 0 ? 'text-[#172774]' : 'text-gray-300'">{{ migrationCounts.smartViews }}</span>
              </div>
            </div>
          </div>

          <!-- Migration Actions -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="steps.s4_1" class="rounded border-gray-300 text-[#172774]" />
              <h4 class="text-[12px] font-semibold text-gray-700">4.1 Migration starten</h4>
            </div>
            <div class="ml-6 space-y-2">
              <p class="text-[10px] text-gray-500">
                Wichtig: Erst ausfuehren wenn Block 1 (Collections) und Block 3 (Environment) abgeschlossen sind!
                Die Migration liest alle Daten aus localStorage und schreibt sie ueber die Directus API in die Datenbank.
              </p>
              <div class="flex items-center gap-2">
                <button
                  :disabled="migrating || migrationCounts.total === 0"
                  class="flex items-center gap-1.5 px-4 py-2 text-[11px] font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  @click="runMigration"
                >
                  <i v-if="migrating" class="pi pi-spin pi-spinner text-[10px]" />
                  <i v-else class="pi pi-database text-[10px]" />
                  Migration starten ({{ migrationCounts.total }} Datensaetze)
                </button>
                <button
                  v-if="migrationLog.length > 0"
                  class="px-3 py-2 text-[11px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  @click="migrationLog = []"
                >
                  Log leeren
                </button>
              </div>

              <!-- Migration Log -->
              <div v-if="migrationLog.length > 0" class="bg-gray-800 rounded-lg p-3 max-h-[200px] overflow-y-auto">
                <p v-for="(log, i) in migrationLog" :key="i" :class="[
                  'text-[9px] font-mono leading-relaxed',
                  log.type === 'success' ? 'text-green-400' : log.type === 'error' ? 'text-red-400' : 'text-gray-400'
                ]">
                  {{ log.message }}
                </p>
              </div>
            </div>
          </div>

          <!-- Export as JSON -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="steps.s4_2" class="rounded border-gray-300 text-[#172774]" />
              <h4 class="text-[12px] font-semibold text-gray-700">4.2 Alternative: JSON-Export herunterladen</h4>
            </div>
            <div class="ml-6 space-y-2">
              <p class="text-[10px] text-gray-500">
                Falls die direkte Migration nicht funktioniert: Alle localStorage-Daten als JSON-Datei herunterladen
                und manuell in Directus importieren (Admin → Collection → Import).
              </p>
              <button
                :disabled="migrationCounts.total === 0"
                class="flex items-center gap-1.5 px-4 py-2 text-[11px] font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                @click="exportAsJson"
              >
                <i class="pi pi-download text-[10px]" />
                JSON-Export herunterladen
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- BLOCK 5: Code-Switch -->
      <div class="bg-white rounded-lg border border-gray-200/80 overflow-hidden">
        <button class="w-full flex items-center justify-between px-5 py-4 text-left" @click="toggleBlock(5)">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-code text-[14px] text-red-500" />
            </div>
            <div>
              <h3 class="text-[13px] font-semibold text-gray-800">Block 5: Code-Switch (USE_LOCAL → false)</h3>
              <p class="text-[10px] text-gray-400 mt-0.5">Frontend von localStorage auf Directus API umschalten — von Claude erledigt</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-gray-400">Claude macht das</span>
            <i :class="openBlocks.includes(5) ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="text-[10px] text-gray-400" />
          </div>
        </button>

        <div v-if="openBlocks.includes(5)" class="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
          <div class="bg-gray-50 rounded-lg p-3 text-[10px] text-gray-600 space-y-2">
            <p class="font-semibold">Diese Dateien muessen geaendert werden (von Claude auf Anweisung):</p>
            <table class="w-full text-[10px]">
              <thead><tr class="text-left text-gray-500 border-b border-gray-200">
                <th class="pb-1 pr-3">Datei</th><th class="pb-1 pr-3">Aenderung</th><th class="pb-1">Status</th>
              </tr></thead>
              <tbody class="text-gray-700">
                <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono text-[9px]">composables/usePflegeheimLeads.ts</td><td class="pr-3">USE_LOCAL = false</td><td><span class="text-orange-500">Ausstehend</span></td></tr>
                <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono text-[9px]">composables/useContacts.ts</td><td class="pr-3">USE_LOCAL = false</td><td><span class="text-orange-500">Ausstehend</span></td></tr>
                <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono text-[9px]">composables/useActivities.ts</td><td class="pr-3">USE_LOCAL = false</td><td><span class="text-orange-500">Ausstehend</span></td></tr>
                <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono text-[9px]">composables/useDocuments.ts</td><td class="pr-3">USE_LOCAL = false</td><td><span class="text-orange-500">Ausstehend</span></td></tr>
                <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono text-[9px]">composables/useSmartViews.ts</td><td class="pr-3">USE_LOCAL = false</td><td><span class="text-orange-500">Ausstehend</span></td></tr>
                <tr class="border-b border-gray-100"><td class="py-1.5 pr-3 font-mono text-[9px]">composables/usePlacetel.ts</td><td class="pr-3">USE_MOCK = false</td><td><span class="text-orange-500">Ausstehend</span></td></tr>
                <tr><td class="py-1.5 pr-3 font-mono text-[9px]">middleware/auth.ts</td><td class="pr-3">LOCAL_MODE = false</td><td><span class="text-orange-500">Ausstehend</span></td></tr>
              </tbody>
            </table>
            <p class="text-orange-500 mt-2 font-semibold">Erst umschalten wenn Block 1-4 abgeschlossen sind!</p>
            <p>Dann Claude sagen: "Schalte alle USE_LOCAL auf false" — er aendert alle 7 Dateien, baut, committed und pushed.</p>
          </div>
        </div>
      </div>

      <!-- BLOCK 6: Testing -->
      <div class="bg-white rounded-lg border border-gray-200/80 overflow-hidden">
        <button class="w-full flex items-center justify-between px-5 py-4 text-left" @click="toggleBlock(6)">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-check-circle text-[14px] text-emerald-500" />
            </div>
            <div>
              <h3 class="text-[13px] font-semibold text-gray-800">Block 6: Testen</h3>
              <p class="text-[10px] text-gray-400 mt-0.5">Alle Features pruefen</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-gray-400">~30 Min</span>
            <i :class="openBlocks.includes(6) ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="text-[10px] text-gray-400" />
          </div>
        </button>

        <div v-if="openBlocks.includes(6)" class="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
          <div v-for="test in testChecklist" :key="test.id" class="flex items-start gap-2">
            <input type="checkbox" v-model="steps[test.id]" class="rounded border-gray-300 text-[#172774] mt-0.5" />
            <div>
              <p class="text-[11px] font-medium text-gray-700">{{ test.label }}</p>
              <p class="text-[10px] text-gray-400">{{ test.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reset Button -->
    <div class="mt-6 flex justify-end">
      <button
        class="text-[10px] text-gray-400 hover:text-red-500 transition-colors"
        @click="resetProgress"
      >
        Fortschritt zuruecksetzen
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'crm', middleware: 'auth' })

const STEPS_KEY = 'crm_implementation_steps'

// ─── Steps State ──────────────────────────────────────────────────
const steps = ref<Record<string, boolean>>({
  s1_1: false, s1_2: false, s1_3: false, s1_4: false, s1_5: false,
  s2_1: false, s2_2: false, s2_3: false, s2_4: false,
  s3_1: false, s3_2: false,
  s4_1: false, s4_2: false,
  t_login: false, t_leads: false, t_create: false, t_edit: false,
  t_contacts: false, t_activities: false, t_pipeline: false,
  t_smart: false, t_email: false, t_newsletter: false,
  t_crawler: false, t_docs: false, t_phone: false,
})

const totalSteps = computed(() => Object.keys(steps.value).length)
const completedSteps = computed(() => Object.values(steps.value).filter(Boolean).length)

const openBlocks = ref<number[]>([])

const toggleBlock = (id: number) => {
  const idx = openBlocks.value.indexOf(id)
  if (idx === -1) openBlocks.value.push(id)
  else openBlocks.value.splice(idx, 1)
}

// Persist steps
watch(steps, (val) => {
  try { localStorage.setItem(STEPS_KEY, JSON.stringify(val)) } catch {}
}, { deep: true })

onMounted(() => {
  try {
    const stored = localStorage.getItem(STEPS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      Object.assign(steps.value, parsed)
    }
  } catch {}
})

const resetProgress = () => {
  Object.keys(steps.value).forEach(k => steps.value[k] = false)
  localStorage.removeItem(STEPS_KEY)
}

// ─── Test Checklist ───────────────────────────────────────────────
const testChecklist = [
  { id: 't_login', label: 'Login', description: '/login → Einloggen → Redirect zu /crm' },
  { id: 't_leads', label: 'Leads laden', description: 'Lead-Liste zeigt Daten aus Directus' },
  { id: 't_create', label: 'Lead erstellen', description: '"Lead erstellen" Button → neuer Lead erscheint in Liste' },
  { id: 't_edit', label: 'Lead bearbeiten', description: 'Stage aendern, Priority setzen, Follow-up Datum' },
  { id: 't_contacts', label: 'Kontakte', description: 'Kontakt anlegen, bearbeiten, loeschen auf Lead-Detail' },
  { id: 't_activities', label: 'Aktivitaeten', description: 'Notiz, Anruf, E-Mail loggen im Activity Feed' },
  { id: 't_pipeline', label: 'Pipeline', description: 'Kanban zeigt Leads, Drag & Drop funktioniert' },
  { id: 't_smart', label: 'Smart Views', description: 'View speichern, in Sidebar anklicken, Filter angewendet' },
  { id: 't_email', label: 'E-Mail senden', description: 'ComposeDialog → E-Mail wird ueber email-service gesendet' },
  { id: 't_newsletter', label: 'Newsletter', description: 'Topic auswaehlen, Leads auswaehlen, senden' },
  { id: 't_crawler', label: 'Web Crawler', description: 'URL eingeben, Ergebnisse werden geladen, Import funktioniert' },
  { id: 't_docs', label: 'Dokumente', description: 'Upload, Download, Kategorie auf Lead-Detail' },
  { id: 't_phone', label: 'Telefonie', description: 'Click-to-Call Button → Placetel Anruf wird ausgeloest' },
]

// ─── Migration ────────────────────────────────────────────────────
const migrating = ref(false)
const migrationLog = ref<{ type: 'info' | 'success' | 'error'; message: string }[]>([])

const migrationCounts = computed(() => {
  const counts = { leads: 0, contacts: 0, activities: 0, documents: 0, smartViews: 0, total: 0 }
  try {
    const leads = localStorage.getItem('crm_leads')
    if (leads) counts.leads = JSON.parse(leads).length

    const contacts = localStorage.getItem('crm_contacts') || localStorage.getItem('crm_lead_contacts')
    if (contacts) counts.contacts = JSON.parse(contacts).length

    const activities = localStorage.getItem('nursing_home_lead_activities')
    if (activities) counts.activities = JSON.parse(activities).length

    const documents = localStorage.getItem('nursing_home_lead_documents')
    if (documents) counts.documents = JSON.parse(documents).length

    const views = localStorage.getItem('nursing_home_lead_smart_views')
    if (views) counts.smartViews = JSON.parse(views).length
  } catch {}
  counts.total = counts.leads + counts.contacts + counts.activities + counts.documents + counts.smartViews
  return counts
})

const addLog = (type: 'info' | 'success' | 'error', message: string) => {
  const time = new Date().toLocaleTimeString('de-DE')
  migrationLog.value.push({ type, message: `[${time}] ${message}` })
}

const runMigration = async () => {
  migrating.value = true
  migrationLog.value = []

  const config = useRuntimeConfig()
  const baseURL = config.public.directusUrl || 'http://localhost:8080'

  addLog('info', `Migration gestartet → ${baseURL}`)

  try {
    // 1. Migrate Leads (nursing_home + nursing_home_leads)
    const leadsRaw = localStorage.getItem('crm_leads')
    if (leadsRaw) {
      const leads = JSON.parse(leadsRaw)
      addLog('info', `Migriere ${leads.length} Leads...`)

      let success = 0
      let errors = 0
      for (const lead of leads) {
        try {
          // Create nursing home first
          const nh = typeof lead.nursing_home_id === 'object' ? lead.nursing_home_id : null
          if (nh) {
            const nhRes = await $fetch(`${baseURL}/secure-data/items/nursing_home`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: {
                name: nh.name,
                Street: nh.Street || nh.street,
                number: nh.number,
                zip: nh.zip,
                city: nh.city,
                fone: nh.fone,
                email: nh.email,
                website: nh.website,
                total_capacity: nh.total_capacity,
                coordinates_lat: nh.coordinates_lat,
                coordinates_lon: nh.coordinates_lon,
              },
            }) as any

            const nhId = nhRes?.data?.id
            if (nhId) {
              // Create lead
              await $fetch(`${baseURL}/secure-data/items/nursing_home_leads`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: {
                  nursing_home_id: nhId,
                  opportunity_stage: lead.opportunity_stage || 'Unqualified',
                  priority: lead.priority || null,
                  follow_up_date: lead.follow_up_date || null,
                  has_cooperation_partner: lead.has_cooperation_partner || false,
                  user_id: lead.user_id || null,
                },
              })
              success++
            }
          }
        } catch (err: any) {
          errors++
          addLog('error', `  Lead "${(typeof lead.nursing_home_id === 'object' ? lead.nursing_home_id?.name : lead.id)}": ${err.message || err}`)
        }
      }
      addLog(errors > 0 ? 'error' : 'success', `Leads: ${success} erfolgreich, ${errors} Fehler`)
    }

    // 2. Migrate Contacts
    const contactsRaw = localStorage.getItem('crm_contacts') || localStorage.getItem('crm_lead_contacts')
    if (contactsRaw) {
      const contacts = JSON.parse(contactsRaw)
      addLog('info', `Migriere ${contacts.length} Kontakte...`)

      let success = 0
      let errors = 0
      for (const contact of contacts) {
        try {
          await $fetch(`${baseURL}/secure-data/items/nursing_home_contacts`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: {
              nursing_home_id: typeof contact.nursing_home_id === 'object' ? contact.nursing_home_id?.id : contact.nursing_home_id,
              first_name: contact.first_name,
              last_name: contact.last_name,
              email: contact.email,
              phone: contact.phone,
              mobile: contact.mobile,
              job_title: contact.job_title,
              is_primary: contact.is_primary,
            },
          })
          success++
        } catch (err: any) {
          errors++
          addLog('error', `  Kontakt "${contact.first_name} ${contact.last_name}": ${err.message || err}`)
        }
      }
      addLog(errors > 0 ? 'error' : 'success', `Kontakte: ${success} erfolgreich, ${errors} Fehler`)
    }

    // 3. Migrate Activities
    const activitiesRaw = localStorage.getItem('nursing_home_lead_activities')
    if (activitiesRaw) {
      const activities = JSON.parse(activitiesRaw)
      addLog('info', `Migriere ${activities.length} Aktivitaeten...`)

      let success = 0
      let errors = 0
      for (const act of activities) {
        try {
          await $fetch(`${baseURL}/secure-data/items/nursing_home_lead_activities`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: {
              nursing_home_lead_id: typeof act.nursing_home_lead_id === 'object' ? act.nursing_home_lead_id?.id : act.nursing_home_lead_id,
              type: act.type,
              subject: act.subject,
              content: act.content,
              direction: act.direction,
              outcome: act.outcome,
              duration_minutes: act.duration_minutes,
              metadata: act.metadata,
            },
          })
          success++
        } catch (err: any) {
          errors++
        }
      }
      addLog(errors > 0 ? 'error' : 'success', `Aktivitaeten: ${success} erfolgreich, ${errors} Fehler`)
    }

    // 4. Migrate Smart Views
    const viewsRaw = localStorage.getItem('nursing_home_lead_smart_views')
    if (viewsRaw) {
      const views = JSON.parse(viewsRaw)
      addLog('info', `Migriere ${views.length} Smart Views...`)

      let success = 0
      let errors = 0
      for (const view of views) {
        try {
          await $fetch(`${baseURL}/secure-data/items/nursing_home_lead_smart_views`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: {
              name: view.name,
              filters: view.filters,
              sort: view.sort,
              icon: view.icon,
              is_shared: view.is_shared || false,
            },
          })
          success++
        } catch (err: any) {
          errors++
        }
      }
      addLog(errors > 0 ? 'error' : 'success', `Smart Views: ${success} erfolgreich, ${errors} Fehler`)
    }

    addLog('success', 'Migration abgeschlossen!')
    steps.value.s4_1 = true
  } catch (err: any) {
    addLog('error', `Migration fehlgeschlagen: ${err.message}`)
  } finally {
    migrating.value = false
  }
}

const exportAsJson = () => {
  const data: Record<string, any> = {}

  const keys = ['crm_leads', 'crm_contacts', 'crm_lead_contacts', 'nursing_home_lead_activities', 'nursing_home_lead_documents', 'nursing_home_lead_smart_views']
  for (const key of keys) {
    const raw = localStorage.getItem(key)
    if (raw) {
      try { data[key] = JSON.parse(raw) } catch {}
    }
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `crm-migration-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  steps.value.s4_2 = true
}
</script>
