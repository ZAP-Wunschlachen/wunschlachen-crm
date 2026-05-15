# Wunschlachen Email-Marketing-Funnel — Praxisgruppen-Komplettkonzept

**Datum:** 2026-05-15
**Owner:** Tony Günther
**Version:** 2.0 — Komplettüberarbeitung auf Basis realer Directus-Stammdaten
**Branch:** feat/full-merge
**Bezug:** [docs/specs/2026-05-13-patient-funnel-automation.md](../specs/2026-05-13-patient-funnel-automation.md) Modul A

> **Hinweis zur Überarbeitung:** v1.0 dieses Dokuments ging fälschlich davon aus, dass Wunschlachen eine auf Implantat-Dental-Tourismus spezialisierte Gruppe sei (USPs wie „keine Bulgarien-Reise", Vergleich mit Dentaprime). Das war ein Fehler. Wunschlachen ist eine **sechsköpfige Berliner Zahnarzt-Praxisgruppe** mit breit aufgestelltem Leistungsspektrum und klarer Standort-Spezialisierung. Alle Inhalte wurden neu kalibriert.

---

## Inhaltsverzeichnis

1. [Strategie + Markenpositionierung](#1-strategie--markenpositionierung)
   1. [Wer ist Wunschlachen — korrekte Selbstbeschreibung](#11-wer-ist-wunschlachen--korrekte-selbstbeschreibung)
   2. [Brand-Voice-Prinzipien](#12-brand-voice-prinzipien)
   3. [USP-Statements (korrigiert)](#13-usp-statements-korrigiert)
   4. [Zielgruppen-Psychografie + Kern-Einwände](#14-zielgruppen-psychografie--kern-einwände)
   5. [Sequenz-Architektur + Frequenz](#15-sequenz-architektur--frequenz)
2. [Standort-Strukturen + USPs pro Standort](#2-standort-strukturen--usps-pro-standort)
3. [Lead-Segmentierung nach dental_service](#3-lead-segmentierung-nach-dental_service)
4. [Themen-Cluster — Übersicht aller ~65 Templates](#4-themen-cluster--übersicht-aller-65-templates)
5. [Welcome-Sequenz Tag 0–14 — Detailblock (Mails 1001–1006)](#5-welcome-sequenz-tag-014--detailblock-mails-10011006)
6. [Segment-Sequenzen Wochen 3–26](#6-segment-sequenzen-wochen-326)
   1. [Segment A — Implantate + Zahnersatz (IDs 1010–1019)](#61-segment-a--implantate--zahnersatz-ids-10101019)
   2. [Segment B — KFO + Aligner (IDs 1020–1029)](#62-segment-b--kfo--aligner-ids-10201029)
   3. [Segment C — Ästhetik + White Cocoon (IDs 1030–1039)](#63-segment-c--ästhetik--white-cocoon-ids-10301039)
   4. [Segment D — Angstpatienten + Sanfte Behandlung (IDs 1040–1049)](#64-segment-d--angstpatienten--sanfte-behandlung-ids-10401049)
   5. [Segment E — Vorsorge + Zahnreinigung (IDs 1050–1059)](#65-segment-e--vorsorge--zahnreinigung-ids-10501059)
   6. [Segment F — Default / Allgemein (IDs 1060–1079)](#66-segment-f--default--allgemein-ids-10601079)
7. [Saison-Specials](#7-saison-specials)
8. [Termin-bezogene Trigger-Mails](#8-termin-bezogene-trigger-mails)
9. [Re-Engagement-Sequenz für Lost-Leads](#9-re-engagement-sequenz-für-lost-leads)
10. [KPIs + A/B-Tests](#10-kpis--ab-tests)
11. [Brevo-Setup-Hinweise + Template-ID-Schema](#11-brevo-setup-hinweise--template-id-schema)
12. [Nächste Schritte für das Marketing-Team](#12-nächste-schritte-für-das-marketing-team)

---

## 1. Strategie + Markenpositionierung

### 1.1 Wer ist Wunschlachen — korrekte Selbstbeschreibung

Wunschlachen ist eine **Berliner Zahnarzt-Praxisgruppe mit sechs Standorten**, die das gesamte Spektrum moderner Zahnmedizin abdeckt — von der Kinderzahnheilkunde über Kieferorthopädie und klassische Zahnerhaltung bis hin zu Implantologie und der ästhetischen Speziallinie „White Cocoon by Wunschlachen". Die Standorte sind gezielt auf Berliner Bezirke verteilt; die Spezialisierungen sind ortsbezogen gebündelt, sodass Patienten kurze Wege zum richtigen Angebot haben.

**In einem Satz für den Leser:** *„Wunschlachen ist Ihr Berliner Zahnarzt mit sechs Standorten — einer für jeden Bedarf, alle kurz erreichbar."*

Das bedeutet konkret: Ein Implantat-Patient wird in Friedrichstraße oder den Implantat-Standorten in Reinickendorf/Schöneberg hervorragend versorgt. Eltern mit kieferorthopädisch zu behandelnden Kindern finden in den KFO+Kinder-Standorten spezialisierte Kompetenz. Wer ein strahlend weißes, ästhetisch optimiertes Lächeln möchte, ist in der White Cocoon-Praxis in Charlottenburg richtig. Das ist kein Marketing — das ist die tatsächliche Struktur.

---

### 1.2 Brand-Voice-Prinzipien

| Dimension | Vermeiden | Anstreben |
|---|---|---|
| Ansprache | Formell-distanziert, anonymes „Team" | Vorname `{{firstName}}`, warmherzig aber respektvoll |
| Ton | Vertrieblich, drängend, emotionaler Druck | Sachkundig, aufklärend — wie ein Arzt beim Erstgespräch |
| Dringlichkeit | Künstliche FOMO-Formulierungen | Echt: gute Termine werden vergeben, das reicht als Argument |
| Länge | Nur Bilder, minimaler Text | 200–350 Wörter im Draft, Substanz über Stil |
| CTA | Dominanter roter Button, Einzeloption | Dezenter primärer CTA + weiche Sekundäroption (Anrufen) |
| Zahlen | Unbeelegte Versprechen, erfundene %-Angaben | Konkret wenn belegt, „branchen-typisch" wenn nicht |
| Abschluss | Anonym | Person: Praxisname + Telefon sichtbar, gerne Behandler-Name |
| Berliner Bezug | Austauschbar deutschlandweit | Bezirke, Kiez, U-Bahn-Nähe — Wunschlachen ist lokal |

**Tonalität in einem Satz:**
*„Wir informieren so, wie wir selbst informiert werden möchten — ehrlich, fachlich korrekt, lokal verwurzelt, ohne Verkaufsdruck."*

---

### 1.3 USP-Statements (korrigiert)

> Tony: Bitte diese Punkte gegen eure interne Positionierung prüfen. Was unten steht, basiert auf den Directus-Stammdaten, nicht auf Gesprächen mit dem Team.

**USP 1 — Sechs Berliner Standorte, spezialisiert und koordiniert**
Kein langer Weg zu einem Spezialisten außerhalb Berlins. Die Wunschlachen-Gruppe bietet innerhalb Berlins Implantologie, Kieferorthopädie, Kinderzahnheilkunde und ästhetische Zahnmedizin — aufgeteilt auf Standorte, die für ihren Schwerpunkt optimiert sind. Für Patienten, die mehrere Behandlungen benötigen, bleibt alles in einem Netz.

**USP 2 — Eine Praxisgruppe für die ganze Familie**
Kleinkind mit erstem Zahnarzttermin, Jugendlicher mit Aligner-Bedarf, Erwachsener mit Implantat-Wunsch, Senior mit Zahnersatz — all das kann Wunschlachen abbilden. Das vereinfacht Eltern-Kind-Koordination und schafft ein echtes langfristiges Behandlungsverhältnis.

**USP 3 — White Cocoon: Ästhetik ohne Kompromiss**
Die Sub-Marke White Cocoon in Charlottenburg steht für ästhetische Zahnmedizin auf Spezialisten-Niveau. Bleaching, Veneers, Ästhetik-Aligner — in einem Umfeld, das diesem Anspruch gerecht wird. Für Patienten, bei denen das Lächeln Visitenkarte ist.

**USP 4 — Angstpatienten-Konzept: Lachgas und Vollnarkose**
Zahnarztangst ist weit verbreitet. Wunschlachen bietet Lachgas-Sedierung und Behandlung unter Vollnarkose an — damit auch Patienten, die jahrelang notwendige Behandlungen vermieden haben, einen sicheren Weg zurück zur Zahngesundheit finden.

**USP 5 — Berliner Kontinuität: kein Behandler-Wechsel**
Wer bei Wunschlachen behandelt wird, hat einen festen Ansprechpartner in seiner Praxis — nicht ein rotierendes Team-System. Von der Erstberatung bis zur Nachkontrolle kennt der Behandler die Patientengeschichte.

**USP 6 — GKV + PKV + Transparenter HKP**
Direkte Abrechnung mit allen deutschen Krankenversicherungen. Heil- und Kostenplan vor jeder Behandlung — keine Überraschungen. Festzuschuss-Beratung für Implantat-Patienten inklusive.

---

### 1.4 Zielgruppen-Psychografie + Kern-Einwände

Wunschlachen bedient mehrere deutlich unterschiedliche Zielgruppen. Die Psychografie hängt stark vom Segment ab (siehe §3), aber folgende Einwände sind übergreifend relevant:

| Einwand | Unterströmung | Funnel-Antwort |
|---|---|---|
| „Das ist zu teuer" | Unklarheit über GKV-Anteil, Finanzierungsoptionen unbekannt | Kosten-Mails pro Segment: HKP-Prozess, Festzuschuss, Ratenzahlung |
| „Das tut weh" / „Ich habe Angst" | Schlechte Erfahrungen früher, unbekannter Eingriff | Angstpatienten-Cluster als eigener Funnel-Pfad; Lachgas/Vollnarkose prominent |
| „Ich muss das noch überlegen" | Aufschub als Selbstschutz | Regelmäßige, druckfreie Informationsdosis; kein aggressives Follow-up |
| „Kann ich euch vertrauen?" | Unbekannte Praxis, kein persönlicher Empfehler | Team-Vorstellung, Standort-Spotlight, Patienten-Feedback |
| „Bin ich am richtigen Standort?" | Berliner Kiez-Denken: Reinickendorf ≠ Charlottenburg | Standort-Routing im Lead-Formular; Standort-Spotlight-Mails |
| „Ist das bei Kindern richtig?" | Eltern-Zweifel vor KFO-Behandlung | Familien-Cluster: edukative Inhalte über Kinderzahnheilkunde + KFO-Timing |

---

### 1.5 Sequenz-Architektur + Frequenz

```
SIGN-UP (dental_service aus Formular → Segment-Routing)
   │
   ▼ T+0  (< 60 Sek)
   Mail 1001: Welcome — Segment-aware (Default oder spezifisch)
   │
   ▼ T+1
   Mail 1002: Team + Standort-Vorstellung
   │
   ▼ T+3
   Mail 1003: Segment-spezifische Aufklärung (Mythen / Fragen)
   │
   ▼ T+7
   Mail 1004: Pain-Point-Adressierung (Angst / Kosten / Skepsis)
   │
   ▼ T+10
   Mail 1005: Kosten + Finanzierung
   │
   ▼ T+14
   Mail 1006: Direkter Buchungs-CTA (Welcome-Abschluss)
   │
   ▼ WOCHE 3–26 — Segment-Sequenz (IDs 1010–1079)
   Mittwoch: Content-Mail (Information, kein Druck-CTA)
   Sonntag:  Booking-CTA-Mail
   ⊕ Zusätzlich: Saison-Specials nach Kalender-Trigger
```

**Frequenzlogik:**
- Wochen 1–2: Welcome-Sequenz (6 Mails, 1001–1006)
- Wochen 3–26: 2×/Woche (Mi + So) = ~48 Slots à Segment, davon ~10 Segment-spezifisch + Rest aus Default-Pool
- Saison-Specials: 4–6 pro Jahr, überschreiben den regulären Slot bei Relevanz

**Pause-Bedingungen:**
- `consultation_scheduled` → Nurture stoppt; Termin-Trigger-Kette übernimmt (§8)
- Status `lost` → Re-Engagement-Queue nach 90 Tagen Pause (§9)
- Brevo-Unsubscribe → kein Marketing-Mail mehr; transaktionale Mails (Termin-Bestätigung) separat konfiguriert
- `GDPR_accepted_at = null` → keine Mail; DSGVO-Pflicht

---

## 2. Standort-Strukturen + USPs pro Standort

| Standort | Bezirk | Spezialisierung | Zielgruppe | Standort-USP (Email-Messaging) |
|---|---|---|---|---|
| White Cocoon by Wunschlachen | Charlottenburg | Ästhetische Zahnmedizin | Erwachsene mit Ästhetik-Fokus | Sub-Marke, Premium-Umfeld, Spezialisten für Veneers/Bleaching/Smile Design |
| Wunschlachen Friedrichstraße | Mitte | Zahnarzt & Implantate | Berufstätige Berlin-Mitte, Implantat-Patienten | Zentrallage, gut per ÖPNV erreichbar, Implantat-Spezialisierung |
| Wunschlachen Reinickendorf (1) | Reinickendorf | Kieferorthopädie & Kinderzahnmedizin | Familien, Kinder, Jugendliche | Kinder-freundliche Praxis, KFO-Spezialist vor Ort |
| Wunschlachen Reinickendorf (2) | Reinickendorf | Zahnarzt & Implantate | Implantat-Patienten im Norden Berlins | Implantat-Kompetenz ohne weite Anreise für Reinickendorf/Spandau |
| Wunschlachen Schöneberg (1) | Schöneberg | Kieferorthopädie & Kinderzahnarzt | Familien, Kinder, Jugendliche | KFO + Kinder im südlichen Berlin, entspannte Praxis-Atmosphäre |
| Wunschlachen Schöneberg (2) | Schöneberg | Zahnarzt & Implantate | Implantat-Patienten im Süden Berlins | Implantologie im Kiez — kein langer Weg für Schöneberger/Tempelhof-Patienten |

**Drei Spezialisierungs-Cluster für Email-Routing:**
- **Implantat-Cluster:** Friedrichstraße + Reinickendorf (2) + Schöneberg (2)
- **KFO+Kinder-Cluster:** Reinickendorf (1) + Schöneberg (1)
- **Ästhetik-Cluster:** Charlottenburg White Cocoon

> Tony: Bitte genaue Adressen + ÖPNV-Infos für Mails ergänzen (für Standort-Spotlight-Mails notwendig).

---

## 3. Lead-Segmentierung nach dental_service

Das Lead-Formular enthält das Feld `dental_service` mit den 23 Leistungsoptionen aus Directus. Dieses Feld bestimmt, in welchen Segment-Funnel der Lead eingeteilt wird.

### Mapping-Tabelle: 23 Leistungen → 5 Segmente + Default

| dental_service (Formular-Wert) | Segment | Funnel-Name | Brevo-Tag |
|---|---|---|---|
| Implantate | A | Implantat-Funnel | `seg-implantate` |
| Zahnersatz | A | Implantat-Funnel | `seg-implantate` |
| Füllungstherapien | A (wenn komplex) / F (Default) | Implantat-Funnel oder Default | `seg-implantate` / `seg-default` |
| Aligner | B | KFO+Aligner-Funnel | `seg-kfo` |
| Kieferorthopädie | B | KFO+Aligner-Funnel | `seg-kfo` |
| Ästhetik | C | Ästhetik-Funnel (White Cocoon) | `seg-aesthetik` |
| Bleaching | C | Ästhetik-Funnel (White Cocoon) | `seg-aesthetik` |
| Zahnschmuck | C | Ästhetik-Funnel (White Cocoon) | `seg-aesthetik` |
| Angstpatienten | D | Sanfte-Behandlung-Funnel | `seg-angst` |
| Lachgas | D | Sanfte-Behandlung-Funnel | `seg-angst` |
| Vollnarkose | D | Sanfte-Behandlung-Funnel | `seg-angst` |
| Zahnreinigung/Prophylaxe | E | Vorsorge-Funnel | `seg-vorsorge` |
| Kontrolltermin | E | Vorsorge-Funnel | `seg-vorsorge` |
| Beratungstermin | E | Vorsorge-Funnel | `seg-vorsorge` |
| Karies | E (mit Up-Sell) | Vorsorge-Funnel | `seg-vorsorge` |
| Parodontitis | E (mit Up-Sell) | Vorsorge-Funnel | `seg-vorsorge` |
| Mundgeruch | E | Vorsorge-Funnel | `seg-vorsorge` |
| Wurzelbehandlung | F | Default / Allgemein | `seg-default` |
| Funktionsdiagnostik | F | Default / Allgemein | `seg-default` |
| Knirsch- & Schnarchschiene | F | Default / Allgemein | `seg-default` |
| Laser-Behandlung | F | Default / Allgemein | `seg-default` |
| Akupunktur | F | Default / Allgemein | `seg-default` |
| Sonstige | F | Default / Allgemein | `seg-default` |
| *(nicht ausgefüllt / leer)* | F | Default / Allgemein | `seg-default` |

**Routing-Logik in Brevo:**
1. Lead füllt Formular aus → Segment-Tag wird gesetzt
2. Welcome-Sequenz 1001–1006 läuft bei allen Segmenten gleich (universell formuliert, kein harter Segment-Lock)
3. Ab Woche 3: Brevo-Automation prüft Segment-Tag → schaltet die richtige Steady-State-Sequenz frei
4. Kein Segment-Tag gesetzt → Default-Sequenz (Seg F)

> Tony validieren: Soll `Füllungstherapien` wirklich in Seg A oder eher Seg F? Zahnfüllungen sind kein Implantat-Einstieg — ggf. Seg F sinnvoller.

---

## 4. Themen-Cluster — Übersicht aller ~65 Templates

> Legende: **W** = Welcome (Tag-Offset), **Mi** = Mittwoch Woche n, **So** = Sonntag Woche n, **T** = Trigger-Mail, **RE** = Re-Engagement, **S** = Saison-Special

### Welcome-Sequenz (Mails 1001–1006) — Alle Segmente

| ID | Slot | Cluster | Subject-Zeile | Pre-Header | Body-Skelett | Primärer CTA | Brevo-Tag |
|---|---|---|---|---|---|---|---|
| 1001 | W T+0 | cta_booking | Re: Ihre Anfrage bei Wunschlachen, {{firstName}} | Ihre Nachricht ist da — so geht es jetzt weiter | Hook: Bestätigung. Story: Was passiert als nächstes (Rückruf + Online-Option). Praxis-Info sichtbar. | Beratung buchen | `welcome-day-0-cta` |
| 1002 | W T+1 | trust | Ihr Wunschlachen-Team + Ihr Standort | 6 Standorte in Berlin — der richtige für Sie | Hook: Kurze Standort-Übersicht. Story: Welcher Standort passt zu `dental_service`. Team-Vorstellung allgemein. | Standort entdecken | `welcome-day-1-trust` |
| 1003 | W T+3 | aufklärung | Die häufigsten Fragen — ehrlich beantwortet | Was Sie wirklich wissen möchten, bevor Sie kommen | Hook: „Fast jeder Patient hat diese Fragen." Story: 4–5 Fragen segment-angepasst (generisch: Ablauf, Schmerz, Kosten, Dauer). | Beratung buchen | `welcome-day-3-faq` |
| 1004 | W T+7 | pain_point | Sorgen vor dem Zahnarzt? Das ist bei uns anders | Wie wir mit Nervosität, Fragen und Unsicherheit umgehen | Hook: Angst + Unsicherheit normalisieren. Story: Angstpatienten-Konzept (Lachgas, Vollnarkose erwähnen), Stop-Signal, ruhige Atmosphäre. | Fragen stellen — Beratung | `welcome-day-7-angst` |
| 1005 | W T+10 | cost | Was kostet Ihre Behandlung bei Wunschlachen? | Kein Schockmoment: transparente Kostenübersicht, GKV-Anteil, Finanzierungsoptionen | Hook: „Die Kostenfrage ist die ehrlichste Frage." Story: HKP-Prozess, Festzuschuss, Finanzierungspartner. | Kostencheck anfragen | `welcome-day-10-cost` |
| 1006 | W T+14 | cta_booking | {{firstName}}, Ihr nächster Schritt — wir sind bereit | Zwei Wochen Infos — jetzt ist der richtige Moment für den ersten Schritt | Hook: 5-Satz-Zusammenfassung. Story: Einladung, keine weiteren Argumente. Telefon + Online-Option. | Termin vereinbaren | `welcome-day-14-last-call` |

---

### Segment A — Implantate + Zahnersatz (Kurzübersicht, Detail in §6.1)

| ID | Slot | Cluster | Subject-Zeile | Pre-Header | Brevo-Tag |
|---|---|---|---|---|---|
| 1010 | Mi-W3 | trust | Wie läuft eine Implantat-Erstberatung ab? | 45 Minuten für Ihren persönlichen Behandlungsplan | `seg-a-w3-mi-ablauf` |
| 1011 | So-W3 | cta_booking | Ihren Termin in 2 Minuten sichern | Online-Buchung: wählen Sie den Slot, der zu Ihnen passt | `seg-a-w3-so-cta` |
| 1012 | Mi-W4 | mythen | „Sieht man, dass das ein Implantat ist?" | Wie natürlich wirken moderne Zahnimplantate? | `seg-a-w4-mi-optik` |
| 1013 | So-W4 | cta_booking | Gute Slots vergehen — so sichern Sie sich Ihren | {{firstName}}, der nächste freie Beratungsslot | `seg-a-w4-so-cta` |
| 1014 | Mi-W5 | aufklärung | Wie lange dauert die Implantat-Behandlung? | Von der Erstberatung bis zum fertigen Implantat — ehrlich erklärt | `seg-a-w5-mi-zeitplan` |
| 1015 | So-W5 | cta_booking | Heute buchen — schon nächsten Monat lächeln? | So realistisch ist Ihre Zeitplanung | `seg-a-w5-so-cta` |
| 1016 | Mi-W7 | cost | GKV und Zahnimplantate — was zahlt Ihre Kasse? | Festzuschuss, Bonus-Heft, Zusatzversicherung: alles erklärt | `seg-a-w7-mi-gkv` |
| 1017 | So-W7 | cta_booking | Was würde Ihr Implantat kosten? | Jetzt kostenfrei abschätzen — unverbindlich | `seg-a-w7-so-cta` |
| 1018 | Mi-W10 | lifestyle | Essen, was Sie wollen — was sich nach dem Implantat ändert | Patienten berichten: das erste Steak nach Jahren | `seg-a-w10-mi-lifestyle` |
| 1019 | Mi-W14 | trust | Was passiert bei Komplikationen? | Ehrliche Antwort: wie wir mit Problemen umgehen | `seg-a-w14-mi-komplikationen` |

---

### Segment B — KFO + Aligner (Kurzübersicht, Detail in §6.2)

| ID | Slot | Cluster | Subject-Zeile | Pre-Header | Brevo-Tag |
|---|---|---|---|---|---|
| 1020 | Mi-W3 | trust | Aligner oder Spange — was passt zu Ihnen? | Kieferorthopädie für Erwachsene: was heute möglich ist | `seg-b-w3-mi-aligner-vs-spange` |
| 1021 | So-W3 | cta_booking | KFO-Beratung: kostenlos, unverbindlich, in Berlin | Ihr nächster Schritt zu geraden Zähnen | `seg-b-w3-so-cta` |
| 1022 | Mi-W4 | aufklärung | Wie lange muss man Aligner tragen? | Typischer Behandlungsplan: Monate, nicht Jahre | `seg-b-w4-mi-dauer` |
| 1023 | So-W4 | cta_booking | {{firstName}}, Ihr KFO-Beratungstermin | Jetzt Termin im KFO-Standort sichern | `seg-b-w4-so-cta` |
| 1024 | Mi-W5 | familien | KFO für Kinder: wann ist der richtige Zeitpunkt? | Was Eltern über den ersten KFO-Termin wissen sollten | `seg-b-w5-mi-kinder-kfo` |
| 1025 | So-W5 | cta_booking | Termin für Ihr Kind: unkompliziert und kindgerecht | Unsere KFO+Kinder-Standorte in Reinickendorf und Schöneberg | `seg-b-w5-so-cta` |
| 1026 | Mi-W7 | cost | Was kostet eine Aligner-Behandlung? | GKV-Anteil, Eigenanteil, Finanzierungsoptionen — ehrlich erklärt | `seg-b-w7-mi-cost` |
| 1027 | So-W7 | cta_booking | Ihr geradeaus-Lächeln: wann starten wir? | Erstberatung buchen — kostenlos, ohne Wartezeit | `seg-b-w7-so-cta` |
| 1028 | Mi-W10 | lifestyle | Aligner im Alltag: was wirklich passiert | Essen, Zähneputzen, soziale Situationen — ohne Beschönigung | `seg-b-w10-mi-lifestyle` |
| 1029 | Mi-W14 | mythen | „Aligner funktionieren nicht wirklich" — stimmt das? | Was die klinische Evidenz zeigt | `seg-b-w14-mi-mythen` |

---

### Segment C — Ästhetik + White Cocoon (Kurzübersicht, Detail in §6.3)

| ID | Slot | Cluster | Subject-Zeile | Pre-Header | Brevo-Tag |
|---|---|---|---|---|---|
| 1030 | Mi-W3 | trust | White Cocoon by Wunschlachen — was steckt dahinter? | Ästhetische Zahnmedizin auf Spezialisten-Niveau in Charlottenburg | `seg-c-w3-mi-white-cocoon` |
| 1031 | So-W3 | cta_booking | Ihr Lächeln verdient Spezialisten | White Cocoon Erstberatung — Termin sichern | `seg-c-w3-so-cta` |
| 1032 | Mi-W4 | aufklärung | Veneers, Bleaching oder Aligner — was ist für Sie richtig? | Smile Design ohne Reißbrett: Ihre individuelle Lösung | `seg-c-w4-mi-optionen` |
| 1033 | So-W4 | cta_booking | {{firstName}}, Ihr Lächeln als Statement | Jetzt Beratungstermin in der White Cocoon-Praxis | `seg-c-w4-so-cta` |
| 1034 | Mi-W5 | mythen | „Bleaching schädigt die Zähne" — Mythos oder Fakt? | Was professionelles Bleaching von Supermarkt-Produkten unterscheidet | `seg-c-w5-mi-bleaching-mythen` |
| 1035 | So-W5 | cta_booking | Helles Lächeln in Charlottenburg: Termin buchen | Professionelles Bleaching bei White Cocoon | `seg-c-w5-so-cta` |
| 1036 | Mi-W7 | cost | Was kostet Smile Design bei White Cocoon? | Veneers, Bleaching, Aligner: Kostenrahmen ohne Überraschungen | `seg-c-w7-mi-cost` |
| 1037 | So-W7 | cta_booking | Ihr neues Lächeln: wann darf es beginnen? | Termin bei White Cocoon sichern | `seg-c-w7-so-cta` |
| 1038 | Mi-W10 | lifestyle | Ein Lächeln als Visitenkarte — was Patienten berichten | Wie sich ästhetische Zahnmedizin im Alltag anfühlt | `seg-c-w10-mi-lifestyle` |
| 1039 | Mi-W14 | trust | Warum Spezialisierung bei Ästhetik entscheidend ist | Was White Cocoon von einer allgemeinen Zahnarztpraxis unterscheidet | `seg-c-w14-mi-spezialisierung` |

---

### Segment D — Angstpatienten + Sanfte Behandlung (Kurzübersicht, Detail in §6.4)

| ID | Slot | Cluster | Subject-Zeile | Pre-Header | Brevo-Tag |
|---|---|---|---|---|---|
| 1040 | Mi-W3 | angst | Sie sind nicht allein mit Ihrer Zahnarztangst | Wie wir mit Nervosität und Angst umgehen — konkret | `seg-d-w3-mi-angst` |
| 1041 | So-W3 | cta_booking | Erster Schritt ohne Druck: einfach anrufen | Unverbindliches Vorgespräch — telefonisch oder per Mail | `seg-d-w3-so-cta` |
| 1042 | Mi-W4 | aufklärung | Lachgas beim Zahnarzt: was Sie erwartet | Wie Lachgas-Sedierung funktioniert und wann sie sinnvoll ist | `seg-d-w4-mi-lachgas` |
| 1043 | So-W4 | cta_booking | {{firstName}}, Ihr erster Termin bei uns | Wir nehmen uns Zeit — kein Druck, kein Eiltempo | `seg-d-w4-so-cta` |
| 1044 | Mi-W5 | aufklärung | Behandlung unter Vollnarkose — wann und wie? | Für Patienten, die eine andere Lösung brauchen | `seg-d-w5-mi-vollnarkose` |
| 1045 | So-W5 | cta_booking | Auf Ihrem Tempo: Termin vereinbaren | Kein Zeitdruck — Sie entscheiden, wann Sie kommen | `seg-d-w5-so-cta` |
| 1046 | Mi-W7 | trust | Was passiert beim ersten Angstpatienten-Termin? | Schritt für Schritt: kein Eingriff ohne Ihr OK | `seg-d-w7-mi-ablauf` |
| 1047 | So-W7 | cta_booking | Telefonisch vorab klären: wir hören zu | 10 Minuten am Telefon können viel Unsicherheit nehmen | `seg-d-w7-so-telefon` |
| 1048 | Mi-W10 | lifestyle | Was Angst-Patienten nach ihrem ersten Termin sagen | Erfahrungsberichte — anonym, ehrlich | `seg-d-w10-mi-berichte` |
| 1049 | Mi-W14 | mythen | „Ich werde das nie schaffen" — doch, mit dem richtigen Rahmen | Zahnarztangst ist behandelbar; die Zähne auch | `seg-d-w14-mi-mut` |

---

### Segment E — Vorsorge + Zahnreinigung (Kurzübersicht, Detail in §6.5)

| ID | Slot | Cluster | Subject-Zeile | Pre-Header | Brevo-Tag |
|---|---|---|---|---|---|
| 1050 | Mi-W3 | trust | Warum regelmäßige Kontrolle mehr als Prophylaxe ist | Was ein Kontrolltermin bei Wunschlachen beinhaltet | `seg-e-w3-mi-kontrolle` |
| 1051 | So-W3 | cta_booking | Termin für Zahnreinigung: in 2 Minuten gebucht | Nächster freier Slot — unkompliziert online buchen | `seg-e-w3-so-cta` |
| 1052 | Mi-W4 | aufklärung | Parodontitis: oft unbemerkt, früh behandelbar | Was Ihr Kontrolltermin erkennt, bevor es teuer wird | `seg-e-w4-mi-paro` |
| 1053 | So-W4 | cta_booking | {{firstName}}, Ihre Zahngesundheit als Investment | Jetzt Termin sichern — Vorsorge zahlt sich aus | `seg-e-w4-so-cta` |
| 1054 | Mi-W5 | aufklärung | GKV-Prophylaxe: was zahlt Ihre Kasse? | Festzuschuss, Bonus-Heft, was übrig bleibt | `seg-e-w5-mi-gkv` |
| 1055 | So-W5 | cta_booking | Termin für die ganze Familie: unkompliziert | Kinderzahnheilkunde und Erwachsene — alles bei Wunschlachen | `seg-e-w5-so-familien` |
| 1056 | Mi-W7 | upsell | Über die Reinigung hinaus: was wäre noch möglich? | Wenn beim Kontrolltermin mehr sichtbar wird | `seg-e-w7-mi-upsell` |
| 1057 | So-W7 | cta_booking | Ihr Halbjahres-Check: wann war der letzte? | Erinnerung — Prophylaxe-Termin jetzt sichern | `seg-e-w7-so-cta` |
| 1058 | Mi-W10 | lifestyle | Zähne, die ein Leben lang halten — was das braucht | Prophylaxe + Kontrolle als langfristige Strategie | `seg-e-w10-mi-lifestyle` |
| 1059 | Mi-W14 | familien | Kinderzahnheilkunde: erster Termin ohne Angst | Wie wir Kinder an den Zahnarzt gewöhnen | `seg-e-w14-mi-kinder` |

---

### Segment F — Default / Allgemein (Kurzübersicht, Detail in §6.6)

| ID | Slot | Cluster | Subject-Zeile | Pre-Header | Brevo-Tag |
|---|---|---|---|---|---|
| 1060 | Mi-W3 | trust | Was Wunschlachen von anderen Praxen unterscheidet | 6 Standorte in Berlin — eine Praxis-Gruppe für alle | `seg-f-w3-mi-usp` |
| 1061 | So-W3 | cta_booking | Termin bei Wunschlachen: online in 2 Minuten | Welcher Standort passt zu Ihnen? | `seg-f-w3-so-cta` |
| 1062 | Mi-W4 | aufklärung | Zahnarzt-Angst ist häufiger als Sie denken | Wie Wunschlachen damit umgeht | `seg-f-w4-mi-angst` |
| 1063 | So-W4 | cta_booking | {{firstName}}, Ihr persönlicher Ansprechpartner wartet | Erstberatung buchen — kostenlos und unverbindlich | `seg-f-w4-so-cta` |
| 1064 | Mi-W5 | aufklärung | Alle Leistungen bei Wunschlachen — eine Übersicht | Von der Prophylaxe bis zur Implantologie | `seg-f-w5-mi-leistungen` |
| 1065 | So-W5 | cta_booking | Ihr Berliner Zahnarzt: nah, spezialisiert, vertrauenswürdig | Jetzt Termin sichern | `seg-f-w5-so-cta` |
| 1066 | Mi-W7 | cost | Was kostet eine Behandlung bei Wunschlachen? | Transparente Kostenplanung vor jedem Eingriff | `seg-f-w7-mi-cost` |
| 1067 | So-W7 | cta_booking | Wann dürfen wir Sie begrüßen? | Freie Slots — jetzt wählen | `seg-f-w7-so-cta` |
| 1068 | Mi-W10 | lifestyle | Zahngesundheit als Lebensqualität | Was Berliner Patienten über Wunschlachen sagen | `seg-f-w10-mi-lifestyle` |
| 1069 | Mi-W14 | trust | Wunschlachen für die ganze Familie | Eine Praxis-Gruppe von Klein bis Implantat | `seg-f-w14-mi-familie` |
| 1070 | Mi-W16 | trust | Hinter den Kulissen: so arbeitet Wunschlachen | Hygiene, Technologie, Team-Kultur | `seg-f-w16-mi-behind` |
| 1071 | So-W16 | cta_booking | {{firstName}}, noch heute Termin sichern | Freie Beratungsslots sind begrenzt — das ist keine Phrase | `seg-f-w16-so-cta` |
| 1072 | Mi-W18 | saison | Frühjahrspflege für Ihre Zähne | Nach dem Winter: Prophylaxe + Check in einem Termin | `seg-f-w18-mi-frühling` |
| 1073 | So-W18 | cta_booking | Jetzt Termin buchen — bevor der Sommer beginnt | Beliebte Slots vergehen schnell | `seg-f-w18-so-cta` |
| 1074 | Mi-W20 | trust | 5 Monate nach Ihrer Anfrage — wir sind noch da | Was bei anderen Patienten in dieser Zeit passiert ist | `seg-f-w20-mi-5monate` |
| 1075 | So-W20 | cta_booking | {{firstName}} — letzter regulärer Buchungs-CTA | Ihr Lächeln hat auf Sie gewartet. Wir auch. | `seg-f-w20-so-6monate` |

---

### Transaktionale Trigger-Mails (T-Serie)

| ID | Trigger | Subject-Zeile | Brevo-Tag |
|---|---|---|---|
| T-001 | Termin bestätigt | Ihr Termin bei Wunschlachen — Bestätigung | `trigger-termin-bestaetigung` |
| T-002 | 48h vor Termin | Erinnerung: Ihr Termin morgen | `trigger-termin-reminder-48h` |
| T-003 | 2h vor Termin | Ihr Termin in 2 Stunden — Wegbeschreibung | `trigger-termin-reminder-2h` |
| T-004 | Nach Beratung | {{firstName}}, wie war Ihre Beratung? | `trigger-post-beratung` |
| T-005 | HKP gesendet | Ihr Heil- und Kostenplan liegt vor | `trigger-hkp-gesendet` |

---

### Re-Engagement (RE-Serie)

| ID | Slot | Subject-Zeile | Pre-Header | Brevo-Tag |
|---|---|---|---|---|
| RE-001 | RE Tag 0 | {{firstName}}, vermissen Sie uns? | Wir haben Sie eine Weile nicht gesehen — ist alles in Ordnung? | `re-engagement-1` |
| RE-002 | RE Tag 14 | Ein letzter Gedanke zu Ihrer Zahngesundheit | Kein Druck — nur ein kurzer Hinweis, falls es hilfreich ist | `re-engagement-2` |
| RE-003 | RE Tag 28 | Abmelden oder weiterlesen? Sie entscheiden | Wir machen es kurz: Soll Ihr Postfach frei bleiben? | `re-engagement-3-sunset` |

---

### Saison-Specials (S-Serie)

| ID | Saison | Subject-Zeile | Brevo-Tag |
|---|---|---|---|
| S-001 | Januar | Neues Jahr, frischer Start für Ihre Zähne | `saison-neujahr` |
| S-002 | März/April | Frühjahrspflege: Prophylaxe-Termin jetzt sichern | `saison-frühjahr` |
| S-003 | Juni | Sommerlächeln: rechtzeitig Bleaching-Termin planen | `saison-sommer` |
| S-004 | September | Zurück aus dem Urlaub — Kontrolltermin nachgeholt? | `saison-herbst` |
| S-005 | November | Jahresende-Check: Bonus-Heft aktuell? | `saison-jahresende-bonus` |
| S-006 | Dezember | Das schönste Geschenk: ein Lächeln ohne Schmerzen | `saison-advent` |

---

## 5. Welcome-Sequenz Tag 0–14 — Detailblock (Mails 1001–1006)

Diese 6 Mails bilden den heißesten Funnel-Abschnitt. Der Lead hat gerade eine Anfrage gestellt — Aufmerksamkeit ist maximal. Alle Mails laufen segmentübergreifend (universell formuliert), da zu diesem Zeitpunkt die Segment-Zuordnung noch nicht genutzt wird.

> **CRM-Hinweis:** Im Modul-A-Code sind diese 6 Mails als Slot-IDs 1001–1006 implementiert. Das sind die ersten Templates, die im Brevo-Dashboard angelegt werden müssen.

---

### Mail 1001 — Tag 0 (< 60 Sekunden nach Sign-up)

**Subject:** `Re: Ihre Anfrage bei Wunschlachen, {{firstName}}`
**Pre-Header:** Ihre Nachricht ist angekommen — so geht es jetzt weiter

**Body-Skelett:**
- **Hook:** „Hallo {{firstName}}, Ihre Anfrage ist bei uns angekommen — danke, dass Sie sich an Wunschlachen gerichtet haben."
- **Orientierung:** Was passiert jetzt? Ein Mitarbeiter meldet sich innerhalb von [X Stunden / 1 Werktag] telefonisch. Wer nicht warten möchte: Online-Buchungslink sofort verfügbar.
- **Praxis-Infos:** Adresse(n), Telefon, Öffnungszeiten — sichtbar, nicht vergraben
- **Abschluss:** Name/Funktion des Teammitglieds oder „Ihr Wunschlachen-Team"

**CTA:** Beratungstermin direkt buchen (primär) | Telefon anrufen (sekundär)
**Unsubscribe:** Pflicht-Footer in jedem Brevo-Template

---

### Mail 1002 — Tag 1

**Subject:** `Ihr Wunschlachen-Team + Ihr Standort in Berlin`
**Pre-Header:** Sechs Standorte — der richtige für Sie ist nah

**Body-Skelett:**
- **Hook:** „Bevor Sie zu uns kommen, möchten wir Ihnen zeigen, wer Sie erwartet."
- **Standort-Übersicht:** Kurze Tabelle oder Liste: Standort → Spezialisierung → Bezirk
- **Segment-Hinweis (soft):** „Je nachdem, was Sie beschäftigt — unser Team hilft Ihnen beim ersten Kontakt, den richtigen Standort zu finden."
- **Team:** Ein Satz pro Behandlungs-Cluster (Implantologie, KFO, Ästhetik, Kinder, Angstpatienten)
- **Abschluss:** „Wir freuen uns darauf, Sie kennenzulernen."

**CTA:** Standort-Übersicht besuchen (primär) | Termin buchen (sekundär)
**Unsubscribe:** Pflicht-Footer

---

### Mail 1003 — Tag 3

**Subject:** `Die häufigsten Fragen — ehrlich beantwortet, {{firstName}}`
**Pre-Header:** Was Patienten wirklich wissen möchten, bevor sie den ersten Termin buchen

**Body-Skelett:**
- **Hook:** „Fast jeder Patient kommt zu uns mit denselben Fragen — das ist gut so."
- **4–5 FAQ-Blöcke (generisch, kein Segment-Lock):**
  1. „Tut das weh?" → Lokale Anästhesie, Lachgas-Option, Stop-Signal
  2. „Wie lange dauert eine Behandlung?" → Je nach Art: Prophylaxe = 1h, Implantat = Monate
  3. „Was zahlt meine Krankenkasse?" → GKV Grundleistungen + Festzuschuss + Zusatz
  4. „Muss ich gleich beim ersten Termin etwas entscheiden?" → Nein: Erstberatung ist informativ
  5. „Welcher Standort ist für mich?" → Auf Rückfrage oder beim Buchen
- **Abschluss:** Einladung, weitere Fragen per Mail oder Telefon zu stellen

**CTA:** Beratung buchen | oder: Frage stellen (Reply / Telefon)
**Unsubscribe:** Pflicht-Footer

---

### Mail 1004 — Tag 7

**Subject:** `Nervös vor dem Zahnarzt? Das ist bei uns anders.`
**Pre-Header:** Wie wir mit Zahnarztangst umgehen — konkret und ohne Verharmlosung

**Body-Skelett:**
- **Hook:** „Zahnarztangst ist weit verbreitet — und kein Grund, Behandlungen aufzuschieben."
- **Konkretes Konzept:** Stop-Signal, ruhige Atmosphäre, kein Zeitdruck, Lachgas-Sedierung, ggf. Vollnarkose
- **Zitat (anonym/eingewilligt):** Kurzer Patientensatz über die Erfahrung
- **Normalisierung:** „Viele unserer Patienten haben jahrelang gezögert — wir urteilen nicht, wir helfen."

**CTA:** Angst-freundliche Beratung buchen (primär) | Telefonisch vorab sprechen (sekundär)
**Unsubscribe:** Pflicht-Footer

---

### Mail 1005 — Tag 10

**Subject:** `Was Ihre Behandlung bei Wunschlachen kostet — ohne Überraschungen`
**Pre-Header:** Heil- und Kostenplan, GKV-Anteil, Finanzierungsoptionen: klar erklärt

**Body-Skelett:**
- **Hook:** „Die Kostenfrage ist die ehrlichste Frage. Hier ist unsere ehrliche Antwort."
- **HKP-Prozess:** Vor jeder Behandlung schriftlicher Plan — keine Überraschungen
- **GKV-Grundlagen:** Festzuschuss für Zahnersatz, Bonus-Heft-Tipp (konservativ formulieren — kein %-Versprechen)
- **Finanzierungsoptionen:** Ratenzahlung möglich — kurze Erwähnung
- **PKV-Patienten:** Direkte Abrechnung, GOZ-Standard

**CTA:** Kostenfragen klären — Beratung buchen
**Unsubscribe:** Pflicht-Footer

---

### Mail 1006 — Tag 14

**Subject:** `{{firstName}}, Ihr nächster Schritt — wir sind bereit`
**Pre-Header:** Zwei Wochen Informationen — jetzt der erste konkrete Schritt

**Body-Skelett:**
- **Hook:** Kurze Zusammenfassung in 5 Sätzen: wer wir sind, was wir können, warum Berlin, wie der Termin läuft, was er kostet (nichts)
- **Story:** Keine neuen Argumente — Einladung. „Wir haben Ihnen alles gesagt, was wir für wichtig halten. Den Rest klären wir persönlich."
- **Beide Optionen präsent:** Online-Buchung + Telefon + Standort-Adresse

**CTA:** Termin vereinbaren (primär) | Uns anrufen (sekundär)
**Unsubscribe:** Pflicht-Footer

---

## 6. Segment-Sequenzen Wochen 3–26

Jedes Segment bekommt ab Woche 3 eine eigene Steady-State-Sequenz. Das Mi/So-Rhythmus-Schema bleibt gleich. Hier werden die wichtigsten Mails pro Segment detailliert; die restlichen Slots folgen dem gleichen Skelett-Format.

---

### 6.1 Segment A — Implantate + Zahnersatz

**Segment-Kontext:** Leads, die `Implantate` oder `Zahnersatz` im Formular angegeben haben. Meist Erwachsene 45+, ein oder mehrere fehlende Zähne, preissensibel aber qualitätsorientiert. Einwand-Schwerpunkt: Kosten, Schmerz, Dauer, Ästhetik.

**Standort-Routing:** Friedrichstraße, Reinickendorf (2), Schöneberg (2)

---

#### Mail 1010 — Mi Woche 3

**Subject:** `Wie läuft eine Implantat-Erstberatung bei Wunschlachen ab?`
**Pre-Header:** 45 Minuten für Ihren persönlichen Behandlungsplan — was Sie erwartet

**Body-Skelett:**
- **Hook:** Ungewissheit vor dem ersten Termin abbauen — „Was passiert da eigentlich?"
- **Schritt-für-Schritt:** Anamnese → Röntgen (3D wenn nötig) → Befund erklären → HKP-Entwurf → Fragen beantworten
- **Keine Verpflichtung:** Erstberatung ≠ Behandlungsbeginn. Patient entscheidet danach.
- **Abschluss:** Praxis-Adresse des Implantat-Standorts + Buchungslink

**CTA:** Erstberatung buchen
**Unsubscribe:** Pflicht-Footer

---

#### Mail 1012 — Mi Woche 4

**Subject:** `„Sieht man, dass das ein Implantat ist?" — eine ehrliche Antwort`
**Pre-Header:** Wie natürlich wirken moderne Implantate und Keramikkronen?

**Body-Skelett:**
- **Hook:** Patientenzitat als Eröffnung
- **Erklärung:** Individuelle Keramikkrone, Farbabstimmung, natürlicher Zahnersatz
- **Keine Vorher-Nachher-Reißer-Bilder** — eher technische Erklärung + ruhiger Ton
- **Fazit:** In den meisten Fällen nicht erkennbar — aber ehrlich: es kommt auf Ausgangssituation an

**CTA:** Ästhetische Beratung im Implantat-Termin ansprechen
**Unsubscribe:** Pflicht-Footer

---

#### Mail 1016 — Mi Woche 7

**Subject:** `GKV und Zahnimplantate — was zahlt Ihre Krankenkasse wirklich?`
**Pre-Header:** Festzuschuss, Bonus-Heft, Zusatzversicherung: alles erklärt ohne Fachjargon

**Body-Skelett:**
- **Hook:** Weit verbreitetes Missverständnis ansprechen: „GKV zahlt bei Implantaten sowieso nichts."
- **Fakten:** Festzuschuss auf Zahnersatz (nicht auf das Implantat selbst, aber auf die Krone/Versorgung), Bonus-Heft-Tipp
- **PKV:** Direktabrechnung, in der Regel höhere Erstattung
- **Finanzierung:** Falls GKV-Anteil nicht reicht — Ratenzahlung möglich
- **Keine %-Zahlen erfinden** — „branchen-typisch" formulieren

**CTA:** Kostenfragen im Erstgespräch klären
**Unsubscribe:** Pflicht-Footer

---

#### Mail 1019 — Mi Woche 14

**Subject:** `Was passiert, wenn nach einem Implantat etwas nicht stimmt?`
**Pre-Header:** Ehrliche Antwort: wie wir mit Komplikationen umgehen

**Body-Skelett:**
- **Hook:** Tabu-Thema direkt ansprechen — Vertrauen entsteht durch Offenheit
- **Kontext:** Komplikationsrate bei Implantaten ist branchen-typisch gering — ohne konkrete %-Zahl
- **Wunschlachen-Antwort:** Kurzer Anruf, nächster Slot in der vertrauten Praxis — kein Fremdkrankenhaus, kein langer Weg
- **Abschluss:** Kontinuität als echtes Versprechen (kein Marketing-Text)

**CTA:** Vertrauensgespräch — Termin buchen
**Unsubscribe:** Pflicht-Footer

---

### 6.2 Segment B — KFO + Aligner

**Segment-Kontext:** Leads mit `Aligner` oder `Kieferorthopädie`. Zwei Untergruppen: (a) Erwachsene, die bisher keine KFO hatten oder eine verbessern möchten; (b) Eltern für ihre Kinder. Der Funnel adressiert beide.

**Standort-Routing:** Reinickendorf (1), Schöneberg (1)

---

#### Mail 1020 — Mi Woche 3

**Subject:** `Aligner oder Spange — was passt zu Ihnen (oder Ihrem Kind)?`
**Pre-Header:** Kieferorthopädie für Erwachsene und Kinder: was heute möglich ist

**Body-Skelett:**
- **Hook:** KFO ist nicht mehr nur für Teenager — Erwachsenen-KFO ist heute Standard
- **Vergleich:** Feste Spange vs. Aligner — wann was sinnvoll ist (keine generelle Empfehlung, da individual)
- **Kinder:** Frühzeitige Diagnose wichtig — wann der erste KFO-Check?
- **Fazit:** KFO-Beratung klärt das — kostenlos und ohne Verpflichtung

**CTA:** KFO-Beratungstermin buchen
**Unsubscribe:** Pflicht-Footer

---

#### Mail 1024 — Mi Woche 5

**Subject:** `KFO für Kinder: wann ist der richtige Zeitpunkt für den ersten Termin?`
**Pre-Header:** Was Eltern über den ersten KFO-Check wissen sollten — und wann er stattfinden sollte

**Body-Skelett:**
- **Hook:** Eltern-Frage: „Wann soll ich mein Kind zum KFO bringen?"
- **Antwort:** Empfehlungen zum optimalen Ersttermin-Alter (ohne konkrete %-Zahlen, allgemein: „in der Regel zwischen X und X Jahren" — Tony bitte fachlich abstimmen)
- **Wunschlachen-Standorte:** KFO + Kinderzahnheilkunde in Reinickendorf und Schöneberg
- **Kinder-freundliche Praxis:** Atmosphäre, kein Druck, spielerischer Einstieg

**CTA:** Termin für Ihr Kind — jetzt buchen
**Unsubscribe:** Pflicht-Footer

---

### 6.3 Segment C — Ästhetik + White Cocoon

**Segment-Kontext:** Leads mit `Ästhetik`, `Bleaching`, `Zahnschmuck`. Häufig berufstätige Erwachsene, die ihr Lächeln als Ausdrucksmittel verstehen. Preissensibel aber bereit für Premium, wenn Qualität überzeugend.

**Standort-Routing:** Charlottenburg White Cocoon

---

#### Mail 1030 — Mi Woche 3

**Subject:** `White Cocoon by Wunschlachen — was steckt hinter der Sub-Marke?`
**Pre-Header:** Ästhetische Zahnmedizin auf Spezialisten-Niveau in Charlottenburg

**Body-Skelett:**
- **Hook:** „White Cocoon ist nicht einfach ein anderer Name für denselben Zahnarzt."
- **Was White Cocoon ist:** Spezialisierter Standort für ästhetische Zahnmedizin — Veneers, Bleaching, Smile Design, Ästhetik-Aligner
- **Atmosphäre:** Charlottenburg-Setting, auf ästhetische Patientenzielgruppe ausgerichtet
- **Abgrenzung:** Kein Luxus-Marketing, aber klares Bekenntnis zur Spezialisierung

**CTA:** White Cocoon kennenlernen — Termin buchen
**Unsubscribe:** Pflicht-Footer

---

#### Mail 1034 — Mi Woche 5

**Subject:** `„Bleaching schädigt doch die Zähne" — stimmt das wirklich?`
**Pre-Header:** Was professionelles Bleaching von Supermarkt-Produkten unterscheidet

**Body-Skelett:**
- **Hook:** Häufigster Bleaching-Mythos direkt ansprechen
- **Fakten:** Professionelles Bleaching mit ärztlicher Aufsicht vs. OTC-Produkte ohne Dosierungs-Kontrolle
- **Wann nicht:** Kontraindikationen kurz erwähnen (z.B. empfindliche Zähne, Restaurationen)
- **Fazit:** Professionell durchgeführt und angemessen eingesetzt ist Bleaching sicher — Beratung klärt, ob es für Sie passt

**CTA:** Bleaching-Beratung bei White Cocoon buchen
**Unsubscribe:** Pflicht-Footer

---

### 6.4 Segment D — Angstpatienten + Sanfte Behandlung

**Segment-Kontext:** Leads mit `Angstpatienten`, `Lachgas`, `Vollnarkose`. Hochsensible Gruppe — Ton muss besonders empathisch, langsam und ohne jeden Druck sein. Kein FOMO, kein Zeitdruck.

**Standort-Routing:** Alle Standorte (Angstpatienten-Konzept ist standortübergreifend)

---

#### Mail 1040 — Mi Woche 3

**Subject:** `Zahnarztangst — Sie sind damit nicht allein`
**Pre-Header:** Wie wir mit Nervosität und Angst umgehen — konkret, nicht als Marketing-Phrase

**Body-Skelett:**
- **Hook:** Zahnarztangst normalisieren — ein erheblicher Teil der Bevölkerung betroffen (ohne konkrete %-Zahl)
- **Kein Urteil:** „Wir verstehen, warum Sie zögern. Und wir beurteilen das nicht."
- **Konkrete Maßnahmen:** Stop-Signal, kein Zeitdruck, Gespräch vor jeder Maßnahme, Lachgas-Option, Vollnarkose für ausgeprägte Fälle
- **Erster Schritt:** Kann auch nur ein Telefongespräch sein — kein Stuhl, kein Eingriff

**CTA:** Unverbindliches Vorgespräch — anrufen oder buchen
**Unsubscribe:** Pflicht-Footer

---

#### Mail 1042 — Mi Woche 4

**Subject:** `Lachgas beim Zahnarzt: was Sie wirklich erwartet`
**Pre-Header:** Wie Lachgas-Sedierung funktioniert, wann sie sinnvoll ist — ehrlich erklärt

**Body-Skelett:**
- **Hook:** „Viele Patienten haben von Lachgas gehört, wissen aber nicht, was es ist."
- **Was Lachgas ist/nicht ist:** Kein Vollnarkose-Äquivalent, aber deutliche Entspannung. Patient bleibt ansprechbar.
- **Ablauf:** Maske, Einsatz nach wenigen Minuten, Abklingen nach Behandlung
- **Für wen geeignet:** Leichte bis mittlere Angst, Kinder, Patienten mit Würgereiz
- **Wann nicht:** Schwangerschaft, bestimmte Vorerkrankungen — Aufklärungsgespräch klärt das

**CTA:** Lachgas-Beratung buchen
**Unsubscribe:** Pflicht-Footer

---

### 6.5 Segment E — Vorsorge + Zahnreinigung

**Segment-Kontext:** Leads mit `Zahnreinigung/Prophylaxe`, `Kontrolltermin`, `Beratungstermin`, `Karies`, `Parodontitis`, `Mundgeruch`. Vorsorge-orientierte Patienten — häufig bereits „gute" Zahnarzt-Nutzer, die einen neuen Berliner Zahnarzt suchen oder nach langer Pause zurückkehren. Wichtiges Up-Sell-Potenzial zu komplexeren Behandlungen.

**Standort-Routing:** Alle Standorte

---

#### Mail 1050 — Mi Woche 3

**Subject:** `Warum ein Kontrolltermin bei Wunschlachen mehr ist als Prophylaxe`
**Pre-Header:** Was eine professionelle Kontrolluntersuchung beinhaltet — und was Sie davon haben

**Body-Skelett:**
- **Hook:** „Prophylaxe ist gut. Prophylaxe plus frühzeitige Diagnose ist besser."
- **Was passiert:** Zahnreinigung + Befund + ggf. Röntgen + Beratung in einem Termin
- **Frühzeitige Erkennung:** Parodontitis, Karies, Schliffflächen — was früh erkannt günstig bleibt
- **Familien-Hinweis:** Kinder-Prophylaxe an den KFO+Kinder-Standorten

**CTA:** Prophylaxe-Termin buchen
**Unsubscribe:** Pflicht-Footer

---

#### Mail 1056 — Mi Woche 7

**Subject:** `Bei Ihrer Zahnreinigung wurde etwas sichtbar — was dann?`
**Pre-Header:** Wenn beim Kontrolltermin Bedarf für weitere Behandlungen erkannt wird

**Body-Skelett:**
- **Hook:** „Was passiert, wenn beim Prophylaxe-Termin mehr sichtbar wird als erwartet?"
- **Ablauf:** Kein sofortiger Eingriff ohne Absprache — zuerst Befund erklären, dann gemeinsam entscheiden
- **Optionen:** Welche weiterführenden Leistungen Wunschlachen anbietet (Übersicht der 23 Leistungen kurz erwähnt)
- **Kein Druck:** Wenn nichts eilig ist, kann alles in Ruhe geplant werden

**CTA:** Kontrolltermin buchen — alles andere ergibt sich
**Unsubscribe:** Pflicht-Footer

---

### 6.6 Segment F — Default / Allgemein

Enthält die allgemeine Wunschlachen-USP-Kommunikation für alle Leads ohne spezifisches Segment. Baut auf USPs aus §1.3 auf. Mails 1060–1075 abgedeckt in der Kurzübersicht in §4.

---

## 7. Saison-Specials

Saison-Specials überschreiben den regulären Slot (Mi oder So) wenn der Kalender-Trigger feuert. Sie werden in allen aktiven Segmenten ausgespielt (mit leichter Segment-Anpassung wenn sinnvoll).

| ID | Saison | Timing | Subject-Zeile | Body-Fokus | Brevo-Tag |
|---|---|---|---|---|---|
| S-001 | Neujahr | 1.–10. Januar | Neues Jahr, frischer Start für Ihre Zähne | Jahresvorsatz Zahngesundheit; Bonus-Heft auffüllen | `saison-neujahr` |
| S-002 | Frühjahr | März | Frühjahrspflege: Prophylaxe-Termin jetzt sichern | Saisonaler Reminder Prophylaxe; Kindertermin für das neue Schuljahr | `saison-frühjahr` |
| S-003 | Sommer | Mai/Juni | Sommerlächeln: Bleaching oder Prophylaxe vor dem Urlaub | White Cocoon-Verweis für Ästhetik-Leads; allgemein: Vorsorge vor Reise | `saison-sommer` |
| S-004 | Herbst | September | Zurück aus dem Urlaub — Kontrolltermin verpasst? | Erinnerung nach Urlaubssaison; Bonus-Heft-Tipp | `saison-herbst` |
| S-005 | Jahresende | Oktober/November | Restbudget für Zahngesundheit nutzen? | Zusatzversicherungs-Hinweis; was GKV noch im laufenden Jahr zahlt | `saison-jahresende-bonus` |
| S-006 | Advent | Dezember | Das schönste Geschenk: ein Lächeln ohne Schmerzen | Emotional warm — kein Verkaufsdruck, aber sanfter CTA | `saison-advent` |

---

## 8. Termin-bezogene Trigger-Mails

Diese Mails sind transaktional und laufen außerhalb des Marketing-Funnels. DSGVO-Pflicht gilt dennoch; Unsubscribe-Footer muss vorhanden sein (transaktionale Mails dürfen in Brevo separat konfiguriert werden — kein Nurture-Stop nötig).

---

### T-001 — Termin bestätigt

**Subject:** `Ihr Termin bei Wunschlachen — Bestätigung`
**Pre-Header:** Datum, Uhrzeit, Standort und was Sie mitbringen sollten

**Body-Skelett:**
- Datum + Uhrzeit + Standortadresse
- Anfahrt / ÖPNV-Hinweis
- Was mitbringen: Krankenkassenkarte, ggf. Überweisung, Bonus-Heft
- Storno/Umbuchung: Wie und bis wann

**Unsubscribe:** Pflicht-Footer

---

### T-002 — 48h Erinnerung

**Subject:** `Erinnerung: Ihr Termin morgen bei Wunschlachen`
**Pre-Header:** Ihr Termin am [Datum] um [Uhrzeit] in [Standort]

**Body-Skelett:**
- Kurze Erinnerung: Datum, Uhrzeit, Standort
- Anfahrt + Kontaktnummer falls Fragen
- Storno bis [X Stunden vorher]

---

### T-003 — 2h Erinnerung

**Subject:** `Ihr Termin in 2 Stunden — schnelle Wegbeschreibung`
**Pre-Header:** Wir freuen uns auf Sie

**Body-Skelett:**
- Zeit + Standort + Maps-Link
- Kurzer Warm-up: „Sollten Sie Fragen haben, rufen Sie uns an."

---

### T-004 — Nach Beratung

**Subject:** `{{firstName}}, wie war Ihre Beratung bei uns?`
**Pre-Header:** Kurzes Feedback hilft uns — und Ihnen

**Body-Skelett:**
- Dank für den Besuch
- Feedback-Link (falls vorhanden)
- Nächster Schritt: HKP prüfen, Termin vereinbaren, Fragen stellen
- Kontaktnummer sichtbar

---

### T-005 — HKP gesendet

**Subject:** `Ihr Heil- und Kostenplan liegt vor, {{firstName}}`
**Pre-Header:** Bitte prüfen — und bei Fragen melden Sie sich

**Body-Skelett:**
- HKP als Anhang oder Verweis auf Patientenportal
- Erläuterung: Was steht im HKP, wie lesen Sie ihn
- Nächster Schritt: Termin für Behandlungsbeginn
- Finanzierungsoptionen kurz erwähnt

---

## 9. Re-Engagement-Sequenz für Lost-Leads

Tritt in Kraft nach 90 Tagen ohne Termin + Status `lost` oder 90 Tage ohne Öffnung. 3-Touch-Sequenz, dann Sunset.

---

### RE-001 — Re-Engagement Tag 0

**Subject:** `{{firstName}}, wir haben Sie eine Weile nicht gehört`
**Pre-Header:** Falls sich etwas verändert hat — wir sind noch da

**Body-Skelett:**
- **Hook:** „Es ist eine Weile her seit Ihrer Anfrage. Wir machen uns keine Vorwürfe — das Leben ist voll."
- **Keine Anklage:** Kein „Warum haben Sie nicht gebucht?"
- **Erinnerung an USPs:** 6 Standorte, neue Möglichkeit (ggf. Segment-spezifisch)
- **CTA:** Termin buchen | oder: Einfach anrufen

---

### RE-002 — Re-Engagement Tag 14

**Subject:** `Ein letzter Gedanke zu Ihrer Zahngesundheit, {{firstName}}`
**Pre-Header:** Kein Druck — nur ein kurzer Hinweis, falls er hilfreich ist

**Body-Skelett:**
- **Sehr kurz:** 3–4 Sätze
- **Inhalt:** Ein konkreter Tipp oder Fakt (je nach Segment) — kein Verkaufsdruck
- **CTA:** Termin buchen (dezent) | oder: nichts — wir sehen uns

---

### RE-003 — Sunset Tag 28

**Subject:** `Abmelden oder weiterlesen, {{firstName}}? Sie entscheiden.`
**Pre-Header:** Wir machen es kurz — und respektieren Ihre Entscheidung

**Body-Skelett:**
- **Sehr kurz:** Klare Wahl anbieten
- **Option A:** Weiterhin informiert bleiben → Klick-Link
- **Option B:** Kein weiteres Marketing → Unsubscribe-Link
- **Kein Druck:** Wer abmeldet, wird nicht mehr kontaktiert (außer transaktional)
- **Abschluss:** „Vielen Dank, dass Sie sich an Wunschlachen gerichtet haben."

---

## 10. KPIs + A/B-Tests

> Keine erfundenen Conversion-Rates. Folgende KPIs sind als Tracking-Ziele definiert — Benchmarks nach branchen-typischen Werten zu kalibrieren.

### Wichtigste KPIs pro Sequenz-Abschnitt

| KPI | Messbar in Brevo | Ziel-Bereich (branchen-typisch) |
|---|---|---|
| Open Rate Welcome (1001–1006) | Ja | Deutlich über allgemeinem Durchschnitt — Welcome-Mails sind traditionell öffnungsstärker |
| Click-Through Rate (CTR) | Ja | Booking-CTA-Mails: höher als Content-Mails |
| Booking-Conversion (Mail → Termin) | Extern (CRM-Integration) | Primär-KPI: Leads die einen Termin gebucht haben |
| Segment-Routing-Fehlerquote | Manuell | Wie viele Leads landen in `seg-default` ohne echten Grund? → Formular-Optimierung |
| Re-Engagement-Rate | Ja | Wie viele Lost-Leads werden durch RE-001–RE-003 reaktiviert? |
| Unsubscribe-Rate | Ja | Wenn zu hoch: Frequenz oder Relevanz anpassen |

### A/B-Test-Vorschläge

| Test | Variable A | Variable B | Entscheidung nach |
|---|---|---|---|
| Subject-Line 1001 | „Re: Ihre Anfrage..." | „Hallo {{firstName}}, Ihre Anfrage bei Wunschlachen" | 200+ Öffnungen |
| CTA-Text 1006 | „Termin vereinbaren" | „Jetzt Erstgespräch buchen" | 500+ Klicks |
| Frequenz Steady-State | 2×/Woche | 1×/Woche | Unsubscribe-Rate + Booking-Rate nach 4 Wochen |
| Segment-Routing | Formular-Pflichtfeld | Formular-Optional | Ausfüllrate + Routing-Qualität |

---

## 11. Brevo-Setup-Hinweise + Template-ID-Schema

### Template-ID-Reservierungen

| ID-Bereich | Verwendung | Status |
|---|---|---|
| 1001–1006 | Welcome-Sequenz (alle Segmente, universell) | **Im CRM-Code implementiert — erste Priorität** |
| 1010–1019 | Segment A — Implantate + Zahnersatz | Anzulegen nach Welcome-Sequenz |
| 1020–1029 | Segment B — KFO + Aligner | Anzulegen nach Seg A |
| 1030–1039 | Segment C — Ästhetik + White Cocoon | Anzulegen nach Seg A |
| 1040–1049 | Segment D — Angstpatienten + Sanfte Behandlung | Anzulegen nach Seg A |
| 1050–1059 | Segment E — Vorsorge + Zahnreinigung | Anzulegen nach Seg A |
| 1060–1079 | Segment F — Default / Allgemein | Anlegen parallel zu Seg A–E |
| T-001–T-005 | Transaktionale Trigger-Mails | Separat als transaktionale Templates anlegen |
| RE-001–RE-003 | Re-Engagement | Erst nach Go-Live der anderen Sequenzen |
| S-001–S-006 | Saison-Specials | Kalender-Trigger, nach Bedarf anlegen |

### Brevo-Automation-Logik (Zusammenfassung)

1. **Lead kommt rein** → Brevo-Kontakt angelegt, Segment-Tag gesetzt (aus `dental_service`)
2. **Welcome-Automation** startet sofort → Mails 1001–1006 nach Zeitplan
3. **Nach Tag 14** → Automation prüft Segment-Tag → schaltet richtige Steady-State-Sequenz ein
4. **Status-Check** → wenn `consultation_scheduled` → Nurture-Automation pausieren, Trigger-Kette starten
5. **90 Tage ohne Termin + kein Öffnen** → Re-Engagement-Automation starten

### Brevo-Tag-Konventionen

- Segment-Tags: `seg-implantate`, `seg-kfo`, `seg-aesthetik`, `seg-angst`, `seg-vorsorge`, `seg-default`
- Status-Tags: `welcome-active`, `steady-state-active`, `termin-scheduled`, `re-engagement-active`, `lost`, `unsubscribed`
- Mail-Tags: Format `welcome-day-0-cta`, `seg-a-w3-mi-ablauf` usw. (aus §4)

---

## 12. Nächste Schritte für das Marketing-Team

### Priorisierte Reihenfolge für Brevo-Umsetzung

**Phase 1 — Sofort (Welcome-Sequenz, IDs 1001–1006)**
- [ ] 6 Templates in Brevo anlegen (IDs 1001–1006)
- [ ] Automation für Welcome-Sequenz (T+0 bis T+14) konfigurieren
- [ ] Test-Lead durchlaufen lassen (echte Mail-Adressen, alle 6 Mails prüfen)
- [ ] Unsubscribe-Footer-Pflicht in jedem Template überprüfen
- [ ] DSGVO: Sicherstellen, dass `GDPR_accepted_at` vor Mail-Versand geprüft wird

**Phase 2 — Parallel (Transaktionale Mails T-001–T-005)**
- [ ] 5 transaktionale Templates anlegen (getrennt von Marketing-Automation)
- [ ] Termin-Bestätigung + Reminder testen
- [ ] HKP-Mail mit Dateianhang oder Verweis konfigurieren

**Phase 3 — Danach (Segment-Sequenzen, IDs 1010–1079)**
- [ ] Segment A (Implantate) als erstes, da vermutlich stärkster Traffic-Kanal
- [ ] Segment D (Angstpatienten) sorgfältig testen — Tonalität besonders wichtig
- [ ] Segment F (Default) als Fallback immer aktiv halten
- [ ] Routing-Logik für `dental_service` → Segment-Tag in Brevo testen

**Phase 4 — Go-Live-Optimierung**
- [ ] Re-Engagement-Sequenz (RE-001–RE-003) nach 90 Tagen Go-Live-Erfahrung aktivieren
- [ ] Saison-Specials nach Kalender zeitnah befüllen (S-001 Neujahr: Deadline Ende Dezember)
- [ ] A/B-Tests für Subject Lines 1001 + 1006 starten

### Was Tony noch validieren muss

1. **Standort-Adressen + ÖPNV** für Standort-Spotlight-Mails konkret hinterlegen
2. **Team-Fotos und Behandler-Namen** für Mail 1002 und Trust-Mails
3. **Booking-Link-URL** (Onlinebuchungs-System) für alle CTAs
4. **Segment-Zuordnung `Füllungstherapien`** — Seg A oder Seg F?
5. **KFO-Ersttermin-Altersempfehlung** für Mail 1024 fachlich abstimmen
6. **Finanzierungspartner** — welche Ratenzahlungs-Option wird konkret angeboten?
7. **Lachgas/Vollnarkose-Verfügbarkeit** — an welchen Standorten genau?
8. **Patienten-Feedback/Zitate** — liegen eingewilligte Patientenstimmen vor oder müssen diese erst eingeholt werden?

---

*Dieses Dokument ist das operative Konzept für das Wunschlachen Email-Marketing-System. Alle Templates sollten vor dem Live-Gang vom Marketing-Team und dem ärztlichen Leiter auf Richtigkeit geprüft werden. Medizinische Aussagen (Lachgas-Indikation, Implantat-Komplikationsrate, KFO-Altersgrenzen) sind als Skelett-Hinweise formuliert und müssen fachlich vor der Finalisierung freigegeben werden.*

*DSGVO-Hinweis: Jede Mail enthält einen Pflicht-Unsubscribe-Footer gemäß deutschem und europäischem Datenschutzrecht. Marketing-Mails werden ausschließlich an Kontakte versendet, bei denen `GDPR_accepted_at` gesetzt ist.*
