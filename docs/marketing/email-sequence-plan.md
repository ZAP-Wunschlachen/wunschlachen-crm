# Wunschlachen Email-Marketing-Funnel — Komplettkonzept

**Datum:** 2026-05-13
**Owner:** Tony Günther
**Version:** 1.0
**Branch:** feat/full-merge
**Bezug:** [docs/specs/2026-05-13-patient-funnel-automation.md](../specs/2026-05-13-patient-funnel-automation.md) Modul A

---

## Inhaltsverzeichnis

1. [Strategie-Layer](#1-strategie-layer)
   1. [Brand-Voice-Definition](#11-brand-voice-wunschlachen-vs-dentaprime)
   2. [USP-Statements](#12-usp-statements)
   3. [Zielgruppen-Psychografie & Einwände](#13-zielgruppen-psychografie--einwände)
   4. [Sequenz-Architektur & Frequenz](#14-sequenz-architektur--frequenz)
2. [Themen-Cluster — Übersicht aller 44 Templates](#2-themen-cluster--übersicht-aller-44-templates)
3. [Welcome-Sequenz Tag 0–14 (6 Mails) — Detailblock](#3-welcome-sequenz-tag-014-6-mails--detailblock)
4. [Steady-State-Sequenz Wochen 3–26 (~34 Mails) — Detailblock](#4-steady-state-sequenz-wochen-326-34-mails--detailblock)
5. [Saison-Specials](#5-saison-specials)
6. [Termin-bezogene Trigger-Mails](#6-termin-bezogene-trigger-mails)
7. [Re-Engagement-Sequenz für Lost-Leads](#7-re-engagement-sequenz-für-lost-leads)
8. [KPIs & A/B-Tests](#8-kpis--ab-tests)
9. [Brevo-Setup-Hinweise](#9-brevo-setup-hinweise)
10. [Nächste Schritte für das Marketing-Team](#10-nächste-schritte-für-das-marketing-team)

---

## 1. Strategie-Layer

### 1.1 Brand-Voice — Wunschlachen vs. Dentaprime

**Wer ist Dentaprime?**
Dentaprime ist eine bulgarische Zahnklinik, die deutsche Patienten mit Niedrigpreis-Argumenten ("60 % günstiger als in Deutschland") und Reisepaketen wirbt. Die Emails sind aufmerksamkeitsstark, nutzen aggressive FOMO-Formulierungen ("Sie verdienen Zahnimplantate!", "Keine Ausreden mehr!") und setzen stark auf emotionale Schock-Trigger. Das Format ist fast ausschließlich HTML-heavy, visuelle Banner dominieren über Text-Substanz. Der Ton ist vertrieblich — ein Zahnarzt würde so nicht mit einem Patienten reden.

**Wer ist Wunschlachen?**
Wunschlachen ist eine deutsche Zahnimplantat-Praxisgruppe. Die Nähe zum Patienten ist kein Marketing-Argument — sie ist einfach die Realität: kurze Anfahrt, gleiche Sprache, bekannte Krankenkassen, kontinuierliche Betreuung durch denselben Zahnarzt von der Erstberatung bis zur Nachkontrolle. Das ist der strukturelle Vorteil gegenüber einer Auslandsklinik, den Dentaprime nie replizieren kann.

**Voice-Prinzipien für alle Emails:**

| Dimension | Dentaprime-Stil (vermeiden) | Wunschlachen-Stil (anstreben) |
|---|---|---|
| Ansprache | Herr/Frau + Nachname, formell-distanziert | Vorname (`{{firstName}}`), warm aber respektvoll |
| Ton | Vertrieblich, drängend, emotional aufgeladen | Sachkundig, ruhig, aufklärend — wie ein Arzt beim Beratungsgespräch |
| Dringlichkeit | Künstlich ("JETZT!", "Keine Ausreden mehr!") | Echt: Wartezeiten sind real; gute Slots vergehen — das reicht |
| Länge | Sehr kurze Texte, primär Bild | Mittellang (200–350 Wörter im Copywriter-Draft), Substanz über Style |
| CTA | Einzelner dominanter Button, oft rot | Dezenter primärer CTA + weiche Sekundär-Option ("oder rufen Sie uns an") |
| Zahlen | Große Versprechen ohne Kontext | Konkret wenn belegt, "typischerweise" wenn nicht — keine erfundenen Garantien |
| Abschluss | Anonym ("Das Dentaprime-Team") | Person: Behandler-Name oder Praxisname mit Telefonnummer sichtbar |

**Wunschlachen-Tonalität in einem Satz:**
*"Wir informieren Sie so, wie wir selbst informiert werden möchten — ehrlich, fachlich korrekt, ohne Verkaufsdruck."*

---

### 1.2 USP-Statements

Die folgenden USPs sind auf Basis des deutschen Markt-Kontexts angenommen. **Tony sollte diese Liste gegen die tatsächliche Praxis-Positionierung prüfen und korrigieren.**

**USP 1 — Keine Reise, kein Risiko**
Komplikationen nach einer Implantat-Behandlung können auftreten — auch wenn sie selten sind. Bei Dentaprime bedeutet ein Problem: einen Flug buchen, erneut Urlaub nehmen, ein fremdes Krankenhaus aufsuchen. Bei Wunschlachen: kurzer Anruf, nächster verfügbarer Slot in der vertrauten Praxis. Diese After-Care-Sicherheit ist für viele Patienten der eigentliche Kaufentscheid.

**USP 2 — Deutscher Zahnarzt mit voller rechtlicher Absicherung**
Deutsche Approbation, deutsches Haftungsrecht, PKV/GKV-Abrechnung nach GOZ/BEMA. Kein Übersetzungsrisiko, keine unbekannten Abrechnungsstrukturen, volle Patientenrechte.

**USP 3 — Kontinuierliche Behandler-Beziehung**
Von der Erstberatung bis zur Nachkontrolle in 5 Jahren derselbe Zahnarzt. Keine Rotations-Teams, keine Übergaben an unbekannte Ärzte zwischen Besuchen. Das schafft Vertrauen und verbessert klinische Ergebnisse (der Arzt kennt die Anamnese).

**USP 4 — Krankenkassen-Kompetenz**
Wunschlachen rechnet direkt mit GKV und PKV ab und kennt den Festzuschuss-Dschungel. Patienten erhalten proaktiv Unterstützung beim Kostenvoranschlag, nicht erst auf Nachfrage.

**USP 5 — Transparente Kostenplanung (kein Preisschock)**
Detaillierter Heil- und Kostenplan (HKP) vor jeder Behandlung. Keine versteckten Aufpreise für Material oder Prothesensitze. Wunschlachen ist nicht das billigste Angebot — aber das Gesamtpaket (kein Reiseaufwand, keine Folgereisekosten, volle GKV-Abrechnung) ist oft vergleichbar oder günstiger als das Bulgarien-Paket.

**USP 6 — Moderne Technologie ohne Klinik-Tourismus-Aufpreis**
3D-Röntgen, digitaler Abdruck, CAD/CAM-Fertigung sind in deutschen Praxen heute Standard — nicht exklusiv für Dental-Touristen. (Annahme — bitte gegen tatsächliche Ausstattung prüfen.)

---

### 1.3 Zielgruppen-Psychografie & Einwände

**Typisches Lead-Profil:**
Person zwischen 45–70 Jahren, ein oder mehrere fehlende Zähne oder stark geschädigte Zähne, hat sich bereits online informiert, ist preissensibel aber qualitätsbewusst, hat möglicherweise bereits von Auslandskliniken gehört. Hat auf einer Wunschlachen-Seite ein Kontaktformular ausgefüllt — das ist aktives Informationsinteresse, kein impulsiver Klick.

**Die 5 Kern-Einwände und wie der Funnel sie adressiert:**

| Einwand | Unterströmung | Funnel-Antwort |
|---|---|---|
| "Das ist zu teuer" | Unklarheit über Gesamtkosten; Vergleich mit Ausland ohne Reisekosten-Kalkulation | Kosten-Mail (T+10, dann mehrfach in Steady-State): transparenter HKP-Prozess, Festzuschuss-Erklärung, Finanzierungsoptionen |
| "Das tut bestimmt weh" | Angst vor dem unbekannten Eingriff; schlechte Erfahrungen beim Zahnarzt früher | Schmerzfreiheits-Mail (T+7), Behandlungsablauf-Erklärung, Patient-Story-Mails |
| "Ich muss das noch überlegen" | Entscheidungsaufschub als Selbstschutz-Mechanismus | Kontinuierliche Informationsdosis ohne Druck; bei Status "contacted": Urgency-Trigger einbauen |
| "Kann ich euch vertrauen?" | Unbekannte Praxis, kein persönlicher Empfehler | Team-Vorstellung, Dr.-Profil-Mails, Patienten-Feedback, Zertifikate/Zugehörigkeiten |
| "Sieht man, dass das Zahnersatz ist?" | Ästhetischer Selbstzweifel | Ästhetik-Mails, "natürliches Lächeln"-Thema, vorher-nachher-Kontext (ohne reißerische Bilder) |

---

### 1.4 Sequenz-Architektur & Frequenz

```
SIGN-UP
   │
   ▼ T+0  (< 60 Sek)
   Mail 1: Welcome + sofortiger Buchungs-CTA
   │
   ▼ T+1
   Mail 2: Team-Vorstellung (Trust)
   │
   ▼ T+3
   Mail 3: Mythen-Aufklärung
   │
   ▼ T+7
   Mail 4: Schmerzfreiheit / Angstabbau
   │
   ▼ T+10
   Mail 5: Kosten / Finanzierung
   │
   ▼ T+14
   Mail 6: Direkter Buchungs-CTA ("Jetzt oder nie")
   │
   ▼ WOCHE 3–26 (Steady-State)
   Mittwoch: Content-Mail (kein Druck-CTA)
   Sonntag: Booking-CTA-Mail
   ⊕ Zusätzlich: Saison-Specials nach Kalender
```

**Frequenzlogik:**
- Wochen 1–2: Täglich bis alle 3 Tage (Welcome-Sequenz = 6 Mails in 14 Tagen)
- Wochen 3–26: 2×/Woche (Mi + So) = ~48 Steady-State-Mails über 6 Monate
- Davon entfallen: ~34 auf reguläre Steady-State-Slots (Wochen 3–20), ~4 Saison-Specials

**Pause-Bedingungen (für das Marketing-Team verständlich):**
- `consultation_scheduled` und alle nachfolgenden Status: Nurture stoppt, eigene Reihe (Termin-Bestätigung → Reminder → Nach-Beratung) übernimmt
- Status `lost`: Lead kommt in die Re-Engagement-Queue (90 Tage Pause, dann 3-Touch-Reaktivierung)
- Brevo-Unsubscribe: Kein weiteres Marketing-Mail. Transaktionale Mails (Termin-Bestätigung) weiterhin erlaubt wenn separat konfiguriert
- `GDPR_accepted_at = null`: Keine Mail überhaupt — DSGVO-Pflicht

---

## 2. Themen-Cluster — Übersicht aller 44 Templates

> Legende Slot-Format: W = Welcome (Tag-Offset), Mi = Mittwoch Woche n, So = Sonntag Woche n, S = Saison-Special

| # | Slot | Cluster | Subject-Zeile | Pre-Header (~80 Z.) | Body-Skelett (Hook → Story → CTA) | Primärer CTA | Brevo-Tag |
|---|---|---|---|---|---|---|---|
| **1** | W T+0 | cta_booking | Re: Ihre Anfrage zu Zahnimplantaten | Wir haben Ihre Nachricht — so geht es jetzt weiter | Hook: sofortige Bestätigung. Story: kurze Praxis-Vorstellung, was passiert als nächstes. CTA: Beratungstermin direkt buchen | Beratung buchen | `welcome-day-0-cta` |
| **2** | W T+1 | trust | Ihr Wunschlachen-Team stellt sich vor | Lernen Sie die Menschen hinter Ihrer Behandlung kennen | Hook: "Wissen Sie, wer Ihren Zahn behandeln wird?" Story: Team-Vorstellung, Qualifikationen, Praxis-Werte. CTA: Team-Seite besuchen | Team kennenlernen | `welcome-day-1-trust` |
| **3** | W T+3 | mythen | 5 Mythen über Zahnimplantate — was wirklich stimmt | "Es tut weh", "sieht man sofort", "zu teuer" — wir klären auf | Hook: häufigste Mythen nennen. Story: 5 kurze Fakten-vs-Mythos-Blöcke. CTA: Beratung buchen | Mythen-FAQ lesen | `welcome-day-3-mythen` |
| **4** | W T+7 | pain_point | Schmerzfrei zum neuen Lächeln, {{firstName}} | Angst vor dem Eingriff? Hier ist, was Sie wirklich erwartet | Hook: "Die häufigste Frage bei uns: 'Tut das weh?'" Story: Lokal-Anästhesie-Konzept, Sedierungs-Option, typischer Behandlungsablauf. CTA: Fragen jetzt klären | Beratung buchen | `welcome-day-7-pain` |
| **5** | W T+10 | cost | Was Zahnimplantate bei Wunschlachen wirklich kosten | Ohne Schockmoment: transparente Kostenübersicht mit GKV-Anteil | Hook: "Die Kosten-Frage ist die ehrlichste Frage." Story: HKP-Prozess, Festzuschuss erklären, Finanzierungsoption erwähnen. CTA: Kostenrechner | Kostenrechner nutzen | `welcome-day-10-cost` |
| **6** | W T+14 | cta_booking | {{firstName}}, Ihr nächster Schritt zu festen Zähnen | Zwei Wochen Infos — jetzt ist der richtige Moment | Hook: Zusammenfassung der 5 Kernpunkte in 5 Sätzen. Story: Keine weiteren Argumente — Einladung zum ersten Schritt. CTA: Beratungstermin (telefonisch oder vor Ort) | Termin vereinbaren | `welcome-day-14-last-call` |
| **7** | Mi-W3 | trust | Wie läuft eine Erstberatung bei Wunschlachen ab? | In 45 Minuten zu Ihrem persönlichen Behandlungsplan | Hook: Ungewissheit vor dem ersten Termin abbauen. Story: Schritt-für-Schritt-Ablauf (Anamnese → Röntgen → HKP). CTA: Termin buchen | Termin buchen | `ss-w3-mi-ablauf` |
| **8** | So-W3 | cta_booking | Ihr Beratungstermin: jetzt in 2 Minuten buchen | Online-Buchung: wählen Sie den Slot, der zu Ihnen passt | Hook: kurze Erinnerung warum frühzeitig buchen sinnvoll ist. Story: Buchungsprozess in 3 Schritten. CTA: Online-Termin buchen | Online-Termin buchen | `ss-w3-so-cta` |
| **9** | Mi-W4 | mythen | "Sieht man denn nicht, dass das künstlich ist?" | Wie natürlich wirken Zahnimplantate wirklich? | Hook: Zitat einer Patientenfrage. Story: Keramik-Krone, individuelle Farbabstimmung, Foto-Erklärung (kein Vorher-Nachher-Reißerformat). CTA: Bilder ansehen / Beratung | Beratung buchen | `ss-w4-mi-optik` |
| **10** | So-W4 | cta_booking | {{firstName}}, der nächste freie Beratungs-Slot ist für Sie | Gute Slots vergehen — so sichern Sie sich Ihren | Hook: echte Knappheit ohne Druck. Story: warum frühe Planung sinnvoll ist (Osseointegration, Behandlungsplanung). CTA: Termin | Termin sichern | `ss-w4-so-cta` |
| **11** | Mi-W5 | pain_point | Wie lange dauert die Implantat-Behandlung insgesamt? | Von der Erstberatung bis zum fertigen Implantat — ehrlich erklärt | Hook: Frage stellen die jeder hat aber selten fragt. Story: Zeitplan-Übersicht (Einsetzen → Einheilung → Krone), Abweichungen nennen. CTA: Individuelle Zeitplanung besprechen | Termin buchen | `ss-w5-mi-zeitplan` |
| **12** | So-W5 | cta_booking | Heute Termin buchen — schon nächsten Monat lächeln? | So realistisch ist Ihre Zeitplanung | Hook: konkretes Datum / Monat einsetzen. Story: Ablauf für Einzelimplantat vs. Vollversorgung. CTA: Termin jetzt buchen | Termin buchen | `ss-w5-so-cta` |
| **13** | Mi-W6 | cost | GKV und Zahnimplantate — was zahlt Ihre Krankenkasse wirklich? | Festzuschuss, Bonus-Heft, Zusatzversicherung: alles erklärt | Hook: verbreiteter Irrtum ("GKV zahlt sowieso nichts"). Story: Festzuschuss-Erklärung, Bonus-Heft-Tipp, PKV-Erstattung. CTA: Kostencheck | Kostencheck anfragen | `ss-w6-mi-gkv` |
| **14** | So-W6 | cta_booking | Was würde Ihr Implantat bei Wunschlachen kosten? | Jetzt kostenfrei berechnen — ohne Verbindlichkeit | Hook: unverbindlicher Kostenrechner-Hinweis. Story: 3 Schritte zur Kostenschätzung. CTA: Kostenrechner | Kostenrechner | `ss-w6-so-cta` |
| **15** | Mi-W7 | trust | Unsere Patienten erzählen — Erfahrungsberichte | Was andere sagen, wenn sie uns empfehlen | Hook: kurzes Zitat eines (anonymisierten oder eingewilligten) Patienten. Story: Kontextualisierung — wer war der Patient, was war das Problem, was ist das Ergebnis. CTA: Mehr Erfahrungen lesen | Beratung buchen | `ss-w7-mi-referenzen` |
| **16** | So-W7 | cta_booking | Jetzt Termin buchen: {{firstName}}, Ihr Lächeln wartet | Drei Klicks zum Beratungstermin — ohne Warteschleife | Hook: konkreter Call-to-Action mit einfachem Booking-Weg. Story: Wie einfach die Online-Buchung funktioniert. CTA: Termin buchen | Termin buchen | `ss-w7-so-cta` |
| **17** | Mi-W8 | lifestyle | Wie festes Zähnen Ihr Alltagsleben verändert — 5 echte Beispiele | Nicht nur Ästhetik: was Menschen nach dem Implantat berichten | Hook: "Das hätte ich früher nicht erwartet..."-Format. Story: 5 konkrete Alltagsverbesserungen (Kauen, Sprechen, Selbstbewusstsein, Sport, Schlaf). CTA: Beratung | Beratung buchen | `ss-w8-mi-lifestyle` |
| **18** | So-W8 | cta_booking | {{firstName}}, wann buchen Sie Ihren Termin? | Erinnerung — Ihr Beratungstermin lässt sich in 2 Minuten sichern | Hook: sanfte Erinnerung ohne Druck. Story: Was in der Erstberatung passiert (keine Verpflichtung, nur Informationen). CTA: Termin | Termin buchen | `ss-w8-so-cta` |
| **19** | Mi-W9 | mythen | Zahnimplantate im Alter — ab wann ist es "zu spät"? | Die Antwort überrascht viele Patienten | Hook: Patientenfrage "Bin ich zu alt?". Story: Fakten zur Knochen-Grundvoraussetzung, Altersgrenzen (keine nach oben), medizinische Voraussetzungen. CTA: Individuelle Prüfung | Beratung buchen | `ss-w9-mi-alter` |
| **20** | So-W9 | cta_booking | Individuelle Beratung: Was geht bei Ihnen? | Jeder Fall ist anders — deshalb gibt es die kostenfreie Erstberatung | Hook: kein generisches Angebot, sondern persönliche Behandlungsplanung. Story: Was der Arzt beim ersten Termin prüft. CTA: Termin | Termin buchen | `ss-w9-so-cta` |
| **21** | Mi-W10 | cost | Zahnimplantate auf Raten — wie funktioniert das? | Finanzierung ohne Kompromisse bei der Qualität | Hook: "Müssen Sie wirklich sofort alles zahlen?" Story: Finanzierungspartner, Laufzeiten, was bei Zahnersatz möglich ist. CTA: Finanzierungsoptionen anfragen | Beratung buchen | `ss-w10-mi-finanzierung` |
| **22** | So-W10 | cta_booking | Ihr Beratungstermin — kostenlos, unverbindlich, informativ | So funktioniert der erste Schritt bei Wunschlachen | Hook: Barrieren abbauen (kein Termin = keine Verpflichtung). Story: Was genau passiert in der Erstberatung. CTA: Termin buchen | Termin buchen | `ss-w10-so-cta` |
| **23** | Mi-W11 | trust | Hinter den Kulissen: So arbeitet das Wunschlachen-Team | Ein Einblick in unseren Behandlungsalltag | Hook: Was man in einer Zahnarztpraxis normalerweise nicht sieht. Story: Hygiene-Standards, Sterilisation, Materialwahl, Teamkultur. CTA: Team kennenlernen | Team-Seite besuchen | `ss-w11-mi-behind` |
| **24** | So-W11 | cta_booking | Noch heute Termin sichern, {{firstName}} | Freie Slots sind begrenzt — das ist keine Phrase | Hook: ehrliche Knappheits-Aussage (keine künstliche FOMO). Story: wie viele Erstberatungen pro Woche stattfinden, warum frühzeitig buchen lohnt. CTA: Termin | Termin buchen | `ss-w11-so-cta` |
| **25** | Mi-W12 | faq | Die 10 häufigsten Fragen zu Zahnimplantaten — beantwortet | Von Schmerzen bis Langlebigkeit: Ihr FAQ | Hook: "Was würden Sie fragen, wenn Sie sich trauen würden?" Story: 10 Fragen in kompakter Form (Qualität über Quantität). CTA: Alle Fragen persönlich klären | Beratung buchen | `ss-w12-mi-faq` |
| **26** | So-W12 | cta_booking | {{firstName}}: 3 Monate nach Ihrer Anfrage — wie steht es? | Erinnerung: Ihr Lächeln wartet noch immer | Hook: Rückblick auf Kontaktaufnahme. Story: Was sich in diesen 3 Monaten bei anderen Patienten verändert hat. CTA: Termin | Termin buchen | `ss-w12-so-3monate` |
| **27** | Mi-W13 | pain_point | Angst vor dem Zahnarzt — Sie sind nicht allein | Wie wir mit Zahnarztangst umgehen: ehrlich erklärt | Hook: Statistik (branchenüblich: ein erheblicher Teil der Bevölkerung hat Zahnarztangst). Story: konkrete Methoden (Kommunikation, Stopp-Signal, Sedierung). CTA: Angst ansprechen — Termin buchen | Beratung buchen | `ss-w13-mi-angst` |
| **28** | So-W13 | cta_booking | Telefonische Beratung: jetzt sofort kostenfrei | 10 Minuten am Telefon klären mehr als 10 Emails | Hook: Effizienz-Argument für telefonischen Kontakt. Story: Was man in einem kurzen Anruf klären kann. CTA: Rückruf anfragen | Rückruf anfragen | `ss-w13-so-telefon` |
| **29** | Mi-W14 | lifestyle | Lächeln und Karriere — was Studien zeigen | Kein Verkaufsgespräch: was die Forschung über Lächeln sagt | Hook: überraschende Forschungs-Anekdote. Story: psychologische Effekte von Selbstbewusstsein, nicht verkäuferisch überzeichnet. CTA: Beratung | Beratung buchen | `ss-w14-mi-karriere` |
| **30** | So-W14 | cta_booking | Bereit für den ersten Schritt, {{firstName}}? | Die Erstberatung kostet Sie nichts — nur 45 Minuten | Hook: Kosten-Einwand für den Termin eliminieren. Story: Was die Erstberatung kostet (nichts), was dabei rauskommt (persönlicher Plan). CTA: Termin | Termin buchen | `ss-w14-so-cta` |
| **31** | Mi-W15 | trust | Implantologie in Deutschland — welche Qualitätsstandards gelten? | Was deutsche Approbation und DGI-Mitgliedschaft bedeuten | Hook: "Was unterscheidet einen Implantologen vom Zahnarzt?" Story: Deutsche Ausbildungsstandards, Fortbildungspflicht, DGI/DGZMK. CTA: Qualitätsversprechen | Beratung buchen | `ss-w15-mi-qualität` |
| **32** | So-W15 | cta_booking | {{firstName}}, buchen Sie noch heute | Noch 3–4 Werktage für einen Termin im nächsten Monat | Hook: konkrete Zeitplanung anbieten. Story: Wie schnell ein Termin verfügbar ist. CTA: Termin | Termin buchen | `ss-w15-so-cta` |
| **33** | Mi-W16 | mythen | Implantate halten lebenslang — Mythos oder Wahrheit? | Was die Langzeitstudien wirklich zeigen | Hook: Versprechen analysieren. Story: Studienlage zu Implantat-Haltbarkeit, Pflege-Faktoren, was die Lebensdauer beeinflusst. CTA: Nachfragen | Beratung buchen | `ss-w16-mi-haltbarkeit` |
| **34** | So-W16 | cta_booking | Ihr Implantat — wann starten wir, {{firstName}}? | Persönliche Einladung zur Erstberatung | Hook: direkte persönliche Ansprache. Story: sehr kurz — wir sind bereit, wenn Sie es sind. CTA: Termin buchen | Termin buchen | `ss-w16-so-cta` |
| **35** | Mi-W17 | cost | Wie viel zahlt eine Zusatzversicherung bei Implantaten? | Was Sie wissen sollten, bevor Sie eine Zusatzversicherung abschließen | Hook: Häufiges Missverständnis adressieren. Story: Was Zahnzusatzversicherungen typischerweise leisten (und was nicht), Wartezeiten-Hinweis. CTA: Beratung | Beratung buchen | `ss-w17-mi-zusatzversicherung` |
| **36** | So-W17 | cta_booking | Heute ist ein guter Tag für Ihren ersten Schritt | Online-Buchung dauert 90 Sekunden | Hook: Barriere Minimum — 90 Sekunden. Story: Buchungsschritte in drei Sätzen. CTA: Termin | Termin buchen | `ss-w17-so-cta` |
| **37** | Mi-W18 | lifestyle | Essen, was Sie wollen — was das bedeutet | Patienten berichten: das erste Steak nach Jahren | Hook: emotionale Story-Eröffnung (nicht reißerisch). Story: wie Kauproblemen die Lebensqualität einschränken, was sich nach dem Implantat ändert. CTA: Beratung | Beratung buchen | `ss-w18-mi-essen` |
| **38** | So-W18 | cta_booking | {{firstName}}, Ihr letzter Beratungsplatz diesen Monat | Jetzt buchen — nächste freie Slots im übernächsten Monat | Hook: echte Verfügbarkeit als Argument. Story: kurz. CTA: Termin | Termin buchen | `ss-w18-so-cta` |
| **39** | Mi-W19 | trust | Was passiert bei Komplikationen nach dem Implantat? | Ehrliche Antwort: wie wir mit Problemen umgehen | Hook: Tabu-Thema ansprechen. Story: Komplikationsrate-Kontext (wissenschaftlich), was bei Wunschlachen im Fall der Fälle passiert (Erreichbarkeit, Nachbehandlung in derselben Praxis). CTA: Vertrauen aufbauen | Beratung buchen | `ss-w19-mi-komplikationen` |
| **40** | So-W19 | cta_booking | 5 Monate Infos — jetzt ein konkretes Gespräch | Was wir in 20 Minuten am Telefon klären | Hook: Punkt im Funnel benennen (5 Monate). Story: Liste was in einem Anruf/Termin konkret besprochen wird. CTA: Rückruf oder Termin | Rückruf anfragen | `ss-w19-so-cta` |
| **41** | Mi-W20 | faq | Implantat vs. Brücke vs. Prothese — was ist für Sie das Richtige? | Ein fairer Vergleich ohne Verkaufsabsicht | Hook: "Es gibt Fälle, wo ein Implantat nicht die beste Option ist." Story: Ehrlicher Vergleich der Optionen, wann welche Lösung sinnvoll ist. CTA: Individuelle Beratung | Beratung buchen | `ss-w20-mi-vergleich` |
| **42** | So-W20 | cta_booking | {{firstName}} — ein halbes Jahr nach Ihrer Anfrage | Ihr Lächeln hat auf Sie gewartet. Wir auch. | Hook: emotionaler Moment ohne Druck. Story: Was in 6 Monaten hätte sein können (nicht anklagend). CTA: Termin — letzter regulärer Steady-State-CTA | Termin buchen | `ss-w20-so-6monate` |
| **S1** | Saison | saison | Ihr Sommer-Lächeln — jetzt planen | Bis zum Sommer feste Zähne? Das ist realistisch | Hook: Sommer-Kontext. Story: Zeitplanung für Behandlungsstart im Frühjahr. CTA: Termin | Termin buchen | `saison-sommer-lächeln` |
| **S2** | Saison | saison | Neues Jahr, neues Lächeln — Ihr Vorsatz für {{year}} | Zahngesundheit als Jahres-Investment | Hook: Neujahrs-Kontext. Story: Warum Zahngesundheit wie Fitness-Vorsätze funktioniert (jetzt anfangen). CTA: Termin | Termin buchen | `saison-neujahr` |

*Saison-Specials S3–S4 siehe §5*

---

## 3. Welcome-Sequenz Tag 0–14 (6 Mails) — Detailblock

Diese 6 Mails bilden den heißesten Teil des Funnels. Der Lead hat gerade eine Anfrage gestellt — die Aufmerksamkeit ist maximal. Jede Mail muss präzise liefern, keine Wiederholungen, keine leeren Floskeln.

---

### Mail 1 — Tag 0 (< 60 Sekunden nach Sign-up)

**Slot:** `welcome-day-0-cta`
**Subject:** `Re: Ihre Anfrage zu Zahnimplantaten bei Wunschlachen`
**Pre-Header:** Ihre Nachricht ist bei uns angekommen — so geht es weiter

**Warum "Re:"?**
Dentaprime nutzt dieses Muster mit gutem Grund: "Re:" signalisiert menschliche Antwort, nicht Automation. Es erhöht die Open-Rate erheblich. Wunschlachen kann dasselbe nutzen — mit dem Unterschied, dass das tatsächlich der Beginn eines menschlichen Prozesses ist (Sales-Agent ruft innerhalb von 24h an).

**Body-Skelett:**
- **Hook:** "Hallo {{firstName}}, wir haben Ihre Nachricht erhalten und freuen uns, von Ihnen zu hören."
- **Orientierung:** Was passiert jetzt? Ein Mitarbeiter meldet sich innerhalb von [X Stunden/1 Werktag] telefonisch. In der Zwischenzeit können Sie vorab lesen/sich vorbereiten.
- **Sofort-Option:** Wer nicht warten möchte: Online-Buchungslink für Erstberatung (sofort verfügbar)
- **Praxis-Info:** Adresse, Telefon, Öffnungszeiten — sichtbar, nicht vergraben
- **Abschluss:** Name/Funktion des Team-Mitglieds, das sich melden wird (oder generisch: "Ihr Wunschlachen-Team")

**CTA:** Beratungstermin direkt buchen (primär) | Telefon anrufen (sekundär)
**Unsubscribe-Hinweis:** Pflicht in Brevo-Template-Footer

---

### Mail 2 — Tag 1

**Slot:** `welcome-day-1-trust`
**Subject:** `Das Wunschlachen-Team — wer behandelt Sie?`
**Pre-Header:** Persönliche Vorstellung: Ihre Ansprechpartner von Erstberatung bis Nachkontrolle

**Body-Skelett:**
- **Hook:** "Bevor Sie zu uns kommen, möchten wir Ihnen sagen, wer Sie empfängt."
- **Team-Block:** Kurze Vorstellung der behandelnden Ärzte (Ausbildung, Spezialisierung, ein persönlicher Satz). Keine PR-Floskeln, echte Personen.
- **Praxis-Philosophie:** Was Wunschlachen-Implantologie von einer Standard-Zahnarztpraxis unterscheidet (Spezialisierung, Behandler-Kontinuität)
- **Abschluss:** "Wir freuen uns darauf, Sie persönlich kennenzulernen."
- **CTA:** Team-Seite / Über-uns-Seite + weicher Booking-Link

**CTA:** Team kennenlernen (primär) | Termin buchen (sekundär)

---

### Mail 3 — Tag 3

**Slot:** `welcome-day-3-mythen`
**Subject:** `Mythen über Zahnimplantate — was wirklich stimmt, {{firstName}}`
**Pre-Header:** 5 häufige Irrtümer, die viele Patienten von der richtigen Entscheidung abhalten

**Body-Skelett:**
- **Hook:** "Fast jeder Patient kommt zu uns mit mindestens einem dieser Missverständnisse."
- **5 Mythen:** Kompakt-Format (Mythos fett → 2 Sätze Fakten):
  1. "Implantate sieht man sofort" → Keramik-Krone ist individuell angefertigt
  2. "Das tut sehr weh" → Lokal-Anästhesie macht Eingriff schmerzfrei
  3. "Das ist zu teuer" → GKV-Festzuschuss, Finanzierungsoptionen existieren
  4. "Zu alt für Implantate" → Kein Oberlimit, nur Knochensubstanz ist relevant
  5. "Implantate halten nicht lange" → Langzeit-Daten zeigen hohe Erfolgsrate bei richtiger Pflege
- **Abschluss:** "Haben Sie weitere Fragen? Im Beratungsgespräch beantworten wir sie alle — ohne Zeitdruck."

**CTA:** Beratungstermin buchen

---

### Mail 4 — Tag 7

**Slot:** `welcome-day-7-pain`
**Subject:** `Schmerzfrei zum neuen Lächeln — wie das bei Wunschlachen funktioniert`
**Pre-Header:** Angst vor dem Eingriff? Hier ist, was Sie in der Behandlung wirklich erwartet

**Body-Skelett:**
- **Hook:** "Die häufigste Frage unserer Patienten: 'Tut das weh?'"
- **Fakten-Block:** Lokal-Anästhesie erklärt (kein Fachjargon), Sedierungs-Option für Patienten mit Zahnarztangst, Behandlungsablauf Schritt für Schritt
- **Nach der Behandlung:** Was ist normal (leichte Schwellung 1–2 Tage), was nicht (wann man anrufen sollte). Das zeigt Kompetenz und Vertrauen.
- **Patient-Perspektive:** Anonymisiertes Zitat oder kurze Story eines Patienten der Angst hatte und die Behandlung als "viel besser als erwartet" beschreibt
- **Abschluss:** "Sie können Angst ansprechen — unser Team hört zu."

**CTA:** Beratung vereinbaren (mit Hinweis: Angst-Fragen sind willkommen)

---

### Mail 5 — Tag 10

**Slot:** `welcome-day-10-cost`
**Subject:** `Zahnimplantate bei Wunschlachen — was kostet das wirklich?`
**Pre-Header:** Transparente Kostenübersicht: Festzuschuss, Finanzierung, was Sie wirklich zahlen

**Body-Skelett:**
- **Hook:** "Die Kostenfrage ist die ehrlichste Frage — und sie verdient eine ehrliche Antwort."
- **HKP-Prozess:** Wie der Heil- und Kostenplan funktioniert, warum es keine Pauschalpreise gibt, was eine seriöse Praxis vorab festlegt
- **GKV-Erklärung:** Festzuschuss, wie Bonus-Heft genutzt werden kann, Kassenleistung für Zahnersatz (korrekt, nicht aufgebauscht)
- **Finanzierung:** Falls angeboten — Ratenzahlung, Partner, Laufzeiten
- **Direkter Vergleich:** Warum "billiger" nicht immer günstiger ist (Folgebehandlung, Nachkontrolle, Reisekosten wenn relevant)
- **Abschluss:** "Der erste Schritt ist kostenlos: Erstberatung mit persönlichem Kostenvoranschlag."

**CTA:** Kostenrechner (wenn vorhanden) | Beratungstermin buchen

---

### Mail 6 — Tag 14

**Slot:** `welcome-day-14-last-call`
**Subject:** `{{firstName}}, wann ist der richtige Moment für Ihren ersten Schritt?`
**Pre-Header:** Zwei Wochen Informationen — jetzt ein 45-Minuten-Gespräch statt 45 weiterer Emails

**Body-Skelett:**
- **Hook:** "Wir haben Ihnen in den letzten zwei Wochen viel geschrieben." (Ehrlichkeit über den Prozess)
- **5-Punkte-Recap:** Ein Satz pro Kernpunkt (Schmerzfreiheit, Kosten, Team, Langlebigkeit, Ablauf)
- **Direkter Appell:** Ohne Druck — "Der nächste Schritt ist ein kostenfreies Gespräch. Kein Kaufzwang, keine Verbindlichkeit."
- **Beide Optionen:** Online-Buchung + Telefonnummer für spontane Anrufer
- **Abschluss:** Persönlicher Ton: "Wir freuen uns auf Sie — wann auch immer Sie bereit sind."

**CTA:** Termin buchen (primär) | Uns anrufen (sekundär)

---

## 4. Steady-State-Sequenz Wochen 3–26 (~34 Mails) — Detailblock

### Rhythmus

```
Mittwoch (Content):  Informations-Mail, kein direkter Kaufdruck
                     Themen: Trust, Mythen, Pain Point, Cost, Lifestyle, FAQ
Sonntag (CTA):       Booking-Reminder, direkt und knapp
                     Variiert in Formulierung, nicht identisch
```

### Mittwoch-Mails — Grundprinzipien

1. **Jede Mail hat eine eigene Aussage.** Kein Auffüllen mit generischem Content. Wenn der Copywriter nichts Substanzielles zu sagen hat, lieber kürzen als aufblähen.
2. **Keine versteckten CTAs.** Mittwoch-Mails haben einen weichen "Wenn Sie das interessiert"-Link, keinen dominant-platzierten Button.
3. **Ton wie ein kompetenter Arzt.** Erklärend, nicht wertend. "Manche Patienten fragen uns..." ist besser als "Wussten Sie, dass...?"

### Sonntag-Mails — Grundprinzipien

1. **Kurz und direkt.** Maximal 100 Wörter im Body, ein großer CTA.
2. **Variation im Framing.** Nicht jede Woche "Termin buchen" — manchmal "Rückruf anfragen", manchmal "10 Minuten am Telefon", manchmal konkreter Monat/Datum.
3. **Nie identisch.** Brevo-Tags erlauben zu prüfen, wer vorherige Mails geöffnet hat — wenn ein Lead Mi regelmäßig öffnet und So nie klickt, ist das ein Segmentierungs-Signal für den Sales-Agent.

### Cluster-Rotation-Plan (Wochen 3–20)

| Woche | Mi-Cluster | So-Stil | Notiz |
|---|---|---|---|
| 3 | Trust: Behandlungsablauf | Standard-CTA | Übergang aus Welcome |
| 4 | Mythen: Optik/Ästhetik | Standard-CTA | |
| 5 | Pain Point: Zeitplan | Zeitplan-CTA | |
| 6 | Cost: GKV-Erklärung | Kostenrechner-CTA | |
| 7 | Trust: Patienten-Referenz | Standard-CTA | |
| 8 | Lifestyle: Alltagsveränderung | Erinnerungs-CTA | |
| 9 | Mythen: Alter / Voraussetzungen | Individuell-CTA | |
| 10 | Cost: Finanzierung | Unverbindlich-CTA | |
| 11 | Trust: Behind-the-Scenes | Knappheits-CTA | |
| 12 | FAQ: Top 10 | 3-Monats-Reminder | Milestone: 3 Monate |
| 13 | Pain Point: Zahnarztangst | Telefon-CTA | |
| 14 | Lifestyle: Karriere | Barrier-CTA | |
| 15 | Trust: Qualitätsstandards DE | Standard-CTA | |
| 16 | Mythen: Haltbarkeit | Persönlich-CTA | |
| 17 | Cost: Zusatzversicherung | Einfach-CTA | |
| 18 | Lifestyle: Essen / Kauen | Knappheits-CTA | |
| 19 | Trust: Komplikationen (Tabu-Thema) | Telefon-CTA | |
| 20 | FAQ: Implantat vs. Alternativen | 6-Monats-Abschluss | Milestone: 6 Monate |

---

## 5. Saison-Specials

Saison-Mails ersetzen die reguläre Mi/So-Mail für diese Woche. Sie werden zusätzlich zur Sequenz als Broadcast an alle aktiven Leads versandt, die die Saison-Bedingung erfüllen (Sequenz läuft, kein Termin). Maximale Saison-Broadcasts: 1×/Saison pro Lead.

| # | Titel | Timing | Subject-Zeile | Cluster | Body-Skelett | CTA | Brevo-Tag |
|---|---|---|---|---|---|---|---|
| S1 | Sommer-Lächeln | April/Mai | Strahlendes Lächeln im Sommer — jetzt planen | saison | Hook: Sommer kommt, wer will dann mit Zahnproblemen Einschränkungen haben. Story: realistischer Zeitplan von Erstberatung bis Krone (Einzelimplantat: ca. 3–6 Monate). CTA: Termin jetzt buchen. | Termin buchen | `saison-sommer` |
| S2 | Weihnachten / Jahresende | November | Mit welchem Lächeln gehen Sie ins neue Jahr? | saison | Hook: Jahresende als natürlicher Reflexionspunkt. Story: Kassen-Budget: restliche Jahresleistungen nutzen, Bonus-Heft. CTA: Beratung noch dieses Jahr | Termin buchen | `saison-weihnachten` |
| S3 | Neujahr / Vorsätze | Januar | Ihr Vorsatz für {{year}}: in Ihre Zahngesundheit investieren | saison | Hook: Vorsätze brauchen einen ersten konkreten Schritt. Story: Was ein Implantat bedeutet (kein Luxus, sondern Gesundheitsinvestition). CTA: Kostenlosen Ersttermin buchen | Termin buchen | `saison-neujahr` |
| S4 | EM/WM | Mai-Juli (in EM/WM-Jahren) | {{firstName}}, Ihr Lächeln verdient einen Platz im Finale | saison/lifestyle | Hook: sportliches Erfolgs-Framing (nicht reißerisch à la Dentaprime, sondern leicht). Story: Energie für Veränderungen — Turnier-Momente als Erinnerung. CTA: Termin | Termin buchen | `saison-sport-event` |

**Wichtig:** S4 nur in Jahren mit EM oder WM aktiv schalten. Segment: Leads mit `status: new/contacting/contacted AND welcome_sequence_position >= 3`. Kein S4-Broadcast an frische Leads (T+0 bis T+14) — da läuft die Welcome-Sequenz.

---

## 6. Termin-bezogene Trigger-Mails

Diese Mails sind **transaktionale Mails**, keine Marketing-Mails. Sie laufen auf einem separaten Brevo-Sender/Liste (aus Compliance-Gründen und weil sie bei unsubscribed Leads trotzdem gesendet werden dürfen, wenn DSGVO-Einwilligung für Behandlungskommunikation vorliegt).

Trigger kommt aus **Modul C** (Kalender-Sync, Spec §3) — nicht aus dem Email-Cron.

### 6.1 Termin-Bestätigung

**Trigger:** `appointments INSERT + treatment.name = 'Beratung'`
**Timing:** Sofort (< 2 Minuten nach Buchung)
**Subject:** `Ihr Beratungstermin bei Wunschlachen — Bestätigung`
**Pre-Header:** {{appointmentDate}}, {{appointmentTime}} Uhr — alles Wichtige auf einen Blick

**Body-Inhalt:**
- Termin-Datum, -Uhrzeit, Behandler-Name
- Praxis-Adresse mit Google-Maps-Link (oder Standort-Link)
- "Was bringen Sie mit": Krankenversicherungskarte, Bonusheft (falls vorhanden), Röntgenbilder (falls vorhanden)
- Kontakt für Rückfragen / Stornierung (Telefon + Email)
- DSGVO-Hinweis: "Diese Mail enthält Informationen zu Ihrem gebuchten Termin."

**Brevo-Tag:** `transactional-appt-confirmation`

---

### 6.2 Termin-Reminder 24h vorher

**Trigger:** Cron täglich 09:00 — alle Termine mit `start_date_time = morgen`
**Timing:** 24h vor Termin
**Subject:** `Erinnerung: Ihr Termin bei Wunschlachen morgen um {{time}} Uhr`
**Pre-Header:** Ihr Termin ist morgen — wir freuen uns auf Sie

**Body-Inhalt:**
- Termin-Zusammenfassung (Datum, Zeit, Ort)
- "Was mitbringen" — kurze Liste
- Storno-Hinweis: "Wenn Sie absagen müssen, bitte bis [X Stunden vorher] melden — Telefon [Nummer]"
- Warm-up: "Haben Sie noch Fragen? Rufen Sie uns an — wir sind bis [Zeit] erreichbar."

**Brevo-Tag:** `transactional-appt-reminder-24h`

---

### 6.3 Nach-Beratung-Mail (HKP-Erläuterung)

**Trigger:** `appointments UPDATE arrival_date != null` (Termin stattgefunden)
**Timing:** Selber Tag, ~2 Stunden nach Termin-Startzeit
**Subject:** `Nach Ihrer Beratung bei Wunschlachen — Ihre nächsten Schritte`
**Pre-Header:** Alles Besprochen zusammengefasst — und wie es weitergeht

**Body-Inhalt:**
- Dankeschön für den Besuch (persönlicher Ton)
- HKP-Erläuterung: "Sie haben einen Heil- und Kostenplan erhalten / erhalten ihn in den nächsten Tagen. Was das bedeutet: ..."
- Nächste Schritte: Was passiert bevor der Behandlungstermin (HKP-Einreichung GKV, Rückfragen klären)
- Kontakt: "Fragen zum HKP? Melden Sie sich direkt bei uns — [Telefon / Email]"
- Soft-CTA: "Wenn Sie bereit sind, rufen wir an, um den Behandlungstermin festzulegen."

**Brevo-Tag:** `transactional-post-consultation`

---

### 6.4 Vor-Behandlung-Mail ("Was mitbringen")

**Trigger:** `appointments INSERT treatment.category = 'behandlung'` + 24h-Cron
**Timing:** 24–48h vor Behandlungstermin
**Subject:** `Ihr Behandlungstermin bei Wunschlachen — Vorbereitung`
**Pre-Header:** So bereiten Sie sich optimal auf Ihren Behandlungstag vor

**Body-Inhalt:**
- Termin-Datum und -Uhrzeit
- Praktische Vorbereitung: Nüchternheit (falls Sedierung), leichte Mahlzeit vorher, keine aufwendigen Pläne direkt danach
- Was mitbringen: Versicherungskarte, HKP unterschrieben (falls noch nicht übergeben)
- Nachsorge-Hinweis kurz: "Nach dem Eingriff: Schonung heute empfohlen — Details erläutern wir direkt danach"
- Kontakt für Fragen

**Brevo-Tag:** `transactional-pre-treatment`

---

### 6.5 Nach-Behandlung-Mail (Pflege + Review-Anfrage)

**Trigger:** `appointments UPDATE treatment_finished_date != null`
**Timing:** 24–48h nach Behandlung
**Subject:** `Nach Ihrer Behandlung bei Wunschlachen — Pflege-Tipps`
**Pre-Header:** So pflegen Sie Ihr Implantat in den ersten Wochen

**Body-Inhalt:**
- Glückwunsch (ruhig, nicht übertrieben)
- Pflege-Hinweise in der Einheilungsphase: Mund-Hygienehinweise, was zu vermeiden ist, wann welche Einschränkungen aufgehoben werden
- Wann ist ein Anruf nötig: klare Symptom-Liste (Blutung die nicht aufhört, starke Schwellung nach Tag 3 etc.)
- Nächster Termin: Nachkontrolle-Termin nennen / Erinnerung
- **Review-Anfrage:** Sanft und optional — "Wenn Sie zufrieden sind und anderen Patienten helfen möchten: Eine kurze Bewertung bei [Google / Jameda] hilft uns sehr." Link. Kein Druck.

**Brevo-Tag:** `transactional-post-treatment`

---

## 7. Re-Engagement-Sequenz für Lost-Leads

### Kontext

Ein Lead bekommt Status `lost` wenn:
- Sales-Agent nach mehrfachen Kontaktversuchen keinen Kontakt herstellen konnte
- Patient hat explizit abgesagt
- Termin wurde nicht gebucht trotz mehrfacher Nachfrage

In diesem Zustand: alle Nurture-Mails stoppen sofort. Nach 90 Tagen startet eine einmalige 3-Touch-Reactivation-Sequenz — sofern kein Unsubscribe vorliegt.

### Philosophie

Lost-Leads reaktivieren ist sensitiv. Kein Druck, kein "Sie haben uns vergessen!". Der Ton ist: "Wir denken an Sie — wenn sich etwas geändert hat, sind wir da."

### 3-Touch-Sequenz

**Touch 1 — Tag 90 nach Lost-Status**
- **Subject:** `{{firstName}}, haben sich Ihre Wünsche verändert?`
- **Pre-Header:** Wir melden uns nach einiger Zeit — ohne Druck
- **Body-Skelett:**
  - Hook: Sachliche Ansprache — "Vor einigen Monaten haben Sie sich bei uns gemeldet. Wir wollten nicht aufdringlich sein und haben Abstand gehalten."
  - Angebot: "Falls sich etwas geändert hat — Ihre Situation, Ihre Fragen, Ihre Bereitschaft — sind wir gern für Sie da."
  - CTA: Sehr weich — "Wenn Sie möchten, können Sie hier einen neuen Termin vereinbaren. Wenn nicht, ist das vollständig in Ordnung."
  - Unsubscribe-Link prominent: "Sie möchten keine weiteren Nachrichten von uns? Hier können Sie sich abmelden."
- **CTA:** Termin vereinbaren (sehr weich) | Abmelden
- **Brevo-Tag:** `reengagement-day-90`

**Touch 2 — Tag 105 (2 Wochen nach Touch 1)**
- **Subject:** `Zahngesundheit — ein kurzer Hinweis für {{firstName}}`
- **Pre-Header:** Etwas Nützliches, das Sie vielleicht noch nicht wussten
- **Body-Skelett:**
  - Kein Verweis auf vorherigen Kontakt
  - Substanzieller Inhalt: ein nützlicher medizinischer Hinweis (z.B. Knochen-Atrophie bei fehlendem Zahn — warum frühzeitige Behandlung besser ist)
  - Weicher CTA: "Falls wir helfen können — wir sind erreichbar."
- **CTA:** Termin vereinbaren | Abmelden
- **Brevo-Tag:** `reengagement-day-105`

**Touch 3 — Tag 120 (2 Wochen nach Touch 2)**
- **Subject:** `Letzte Nachricht von uns, {{firstName}}`
- **Pre-Header:** Wir respektieren Ihre Entscheidung — aber wollten uns verabschieden
- **Body-Skelett:**
  - Hook: "Das ist unsere letzte Nachricht, wenn wir nichts von Ihnen hören."
  - Klares Angebot: "Falls Sie jemals eine Erstberatung möchten — unsere Türen stehen offen. Kein Druck, kein Verfallsdatum."
  - Kontaktdaten nochmals sichtbar
  - Abmelde-Link prominent
- **CTA:** Termin vereinbaren | Abmelden
- **Brevo-Tag:** `reengagement-day-120-final`

**Nach Touch 3:**
Wenn keine Reaktion (kein Klick, keine Buchung): Lead bleibt im Status `lost`. Keine weiteren automatisierten Mails. Sales-Agent kann manuell reaktivieren.

**Abbruch-Bedingungen innerhalb der 3-Touch-Sequenz:**
- Lead bucht Termin → Sequenz stoppt, Termin-Flow aus §6 übernimmt
- Lead meldet sich ab → Sequenz stoppt, kein weiteres Mail
- Lead antwortet auf Mail (Brevo-Reply-Tracking) → Sequenz pausieren, Sales-Agent reagiert manuell

---

## 8. KPIs & A/B-Tests

### 8.1 Metriken pro Email-Slot

Die folgenden Ziele sind **branchen-typische Orientierungswerte** für deutschsprachige Medizin/Gesundheits-Emails — keine garantierten Benchmarks.

| Slot-Typ | Primäre KPI | Sekundäre KPI | Gesundheits-Zielbereich (Schätzung) |
|---|---|---|---|
| Welcome T+0 | Open-Rate | Click-to-Booking | Open > 50% (frischer Lead), Click-to-Booking 5–15% |
| Welcome T+1 bis T+14 | Open-Rate | Click-Rate | Open 35–50% (sinkend), Click 5–12% |
| Steady-State Mittwoch | Open-Rate | Time-on-Mail (wenn trackbar) | Open 20–35%, kein Booking-Druck |
| Steady-State Sonntag | Click-to-Booking | Unsubscribe-Rate | Click-to-Booking 2–8%, Unsub < 0,5% |
| Termin-Trigger | Open-Rate | No-Show-Rate | Open > 70%, No-Show-Ziel < 20% |
| Re-Engagement Touch 1 | Open-Rate | Reaktivierungsrate | Open 15–25%, Reaktivierung 3–8% |

**Im CRM sichtbar (via `email_events`-Schema):**
- Open, Click, Bounce, Spam-Report pro Lead — bereits in Modul A vorgesehen
- Welcome-Sequenz-Position ("Mail #6 von 6 versandt") — via `welcome_sequence_position`
- Engagement-Heatmap im Sales-Dashboard (wer hat was geöffnet) — hilft dem Sales-Agent beim Priorisieren von Anrufen

### 8.2 A/B-Test-Vorschläge (Priorität 1–5)

**A/B-Test 1: Subject-Line "Re:" vs. ohne (Welcome T+0)**
- Variante A: `Re: Ihre Anfrage zu Zahnimplantaten bei Wunschlachen`
- Variante B: `Ihre Anfrage ist bei uns eingegangen — so geht es weiter`
- Metrik: Open-Rate T+0
- Hypothese: "Re:" erhöht Open-Rate, weil es menschliche Antwort signalisiert
- Laufzeit: Minimum 200 Leads pro Variante

**A/B-Test 2: CTA-Wording Termin-Buchung**
- Variante A: `Beratungstermin buchen`
- Variante B: `Kostenlosen Ersttermin sichern`
- Variante C: `Jetzt Termin vereinbaren`
- Metrik: Click-to-Booking über alle CTA-Mails (Sonntag-Slots)
- Hypothese: "kostenlos" erhöht CTR, weil es Kostenhürde explizit adressiert

**A/B-Test 3: Versand-Zeit Sonntag-CTA**
- Variante A: Sonntag 10:00 Uhr
- Variante B: Sonntag 18:00 Uhr
- Metrik: Open-Rate + Click-Rate
- Hypothese: Morgens ist der Lead aktiver (Kaffee, ruhige Zeit), abends möglicherweise entspannter für Buchungsentscheidung
- Hinweis: Brevo erlaubt zeitzonenbasiertes Senden

**A/B-Test 4: Personalisierungstiefe**
- Variante A: Nur `{{firstName}}` in Subject und Anrede
- Variante B: `{{firstName}}` + Hinweis auf Anfrage-Datum ("Seit Ihrer Anfrage am {{signupDate}}")
- Metrik: Open-Rate + Click-Rate
- Hypothese: Kontext-Personalisierung kann positiv wirken (führt sich relevanter an) oder negativ (wirkt trackend/aufdringlich)
- DSGVO-Note: Beide Varianten DSGVO-konform solange nur intern gespeicherte Daten genutzt werden

**A/B-Test 5: Frequenz Welcome-Sequenz**
- Variante A: Standard-Sequenz (T+0, T+1, T+3, T+7, T+10, T+14)
- Variante B: Schlankere Sequenz (T+0, T+3, T+7, T+14) — nur 4 Mails
- Metrik: Unsubscribe-Rate in den ersten 14 Tagen + Conversion-to-Booking
- Hypothese: Weniger Mails = weniger Unsubscribes, aber auch weniger Touchpoints; relevant wenn Frequenz-Beschwerden auftreten

---

## 9. Brevo-Setup-Hinweise

### 9.1 Listen-Struktur

```
Brevo-Listen:
├── patient-leads-active         → alle Leads mit GDPR + Status new/contacting/contacted
├── patient-leads-consultation   → Leads ab consultation_scheduled (Termin-Trigger-Mails)
├── patient-leads-reengagement   → Leads mit status=lost (90-Tage-Pause dann 3-Touch)
└── patient-leads-unsubscribed   → Suppression-Liste (Brevo verwaltet das automatisch)
```

**Wichtig:** Transaktionale Mails (§6) sollten über **Transactional Email API** in Brevo gesendet werden — nicht über Campaign-Listen. Das stellt sicher, dass sie auch bei Unsubscribes zugestellt werden (wenn separate Einwilligung vorliegt) und aus dem Domain-Reputation-Pool der Marketing-Mails herausgehalten werden.

### 9.2 Template-Struktur in Brevo

**Pflicht in jedem Marketing-Template:**
- Unsubscribe-Link (Brevo-Standard: `{{unsubscribeLink}}`)
- Praxis-Adresse im Footer (DSGVO-Impressum-Pflicht)
- Absender: `service@wunschlachen.app` (DSGVO: erkennbarer Absender)

**Empfohlene Template-Kategorien in Brevo:**
- Kategorie `welcome_sequence` → Templates 1001–1006 (6 Mails)
- Kategorie `steady_state` → Templates 2001–2042 (34 Mails)
- Kategorie `season_specials` → Templates 3001–3004 (4 Mails)
- Kategorie `transactional` → Templates 4001–4005 (5 Trigger-Mails)
- Kategorie `reengagement` → Templates 5001–5003 (3 Touch-Mails)

**Gesamtzahl: 52 Templates** (44 reguläre + 5 transaktional + 3 Re-Engagement)

### 9.3 Suppression-Liste

Brevo verwaltet Bounces und Unsubscribes automatisch in der Suppression-Liste. Zusätzlich:
- DSGVO-Löschungsanfragen müssen auch in Directus (`leads.mail`, `leads.GDPR_accepted_at`) verarbeitet werden — nicht nur in Brevo
- Spam-Reports: Brevo-Webhook → `email_events` → Lead bekommt Tag `spam_report` → Sales-Agent informiert → kein weiterer Kontakt

### 9.4 Sender-Domain

- Domain `wunschlachen.app` oder `wunschlachen.de` in Brevo verifizieren (SPF + DKIM)
- Warm-up-Plan falls Domain neu: in ersten 4 Wochen täglich +20% des Volumens hochfahren
- Separate Subdomain für Transactional empfehlenswert: `mail.wunschlachen.app` (isoliert Reputation)

### 9.5 Brevo-Webhook-Konfiguration

Folgende Events per Webhook an `CRM /api/brevo/webhook` senden (bereits in Spec geplant):
- `email.opened`
- `email.clicked`
- `email.bounced` (Hard + Soft)
- `email.spam`
- `email.unsubscribed`

Webhook-Endpoint validiert HMAC-Signature (Spec §4, Sicherheit).

---

## 10. Nächste Schritte für das Marketing-Team

### 10.1 Prioritäten-Übersicht

| Priorität | Aufgabe | Owner | Deadline-Vorschlag | Status |
|---|---|---|---|---|
| P0 | USP-Liste aus §1.2 gegen echte Praxis-Positionierung prüfen | Tony | Sofort | offen |
| P0 | Brevo-Sender-Domain verifizieren (SPF/DKIM) | IT/Tony | Vor erstem Mail-Versand | offen |
| P1 | 6 Welcome-Templates (1001–1006) in Brevo anlegen | Marketing | 2 Wochen | offen |
| P1 | Template-IDs in `welcome-sequence-slots.ts` eintragen | Entwicklung | Nach P1 | offen |
| P2 | 5 Transaktionale Templates (4001–4005) anlegen | Marketing | 3 Wochen | offen |
| P2 | 3 Re-Engagement-Templates (5001–5003) anlegen | Marketing | 3 Wochen | offen |
| P3 | Steady-State-Templates (Woche 3–12, also ~20 Templates) first batch | Marketing | 4–6 Wochen | offen |
| P3 | Steady-State-Templates Woche 13–20 (2. Batch) | Marketing | 6–10 Wochen | offen |
| P4 | Saison-Specials (S1–S4) — zum richtigen Timing | Marketing | Kalender-gesteuert | offen |
| P5 | A/B-Tests konfigurieren (§8.2) | Marketing + Tech | Nach 2 Monaten Live-Betrieb | offen |

### 10.2 Copywriting-Brief-Vorlage

Für jedes Template erhält der Copywriter folgenden Brief:

```
COPYWRITING-BRIEF: [Template-Nummer] — [Slot-Name]

Zielgruppe:    Erwachsene 45–70 Jahre, Implantat-Interessent, 
               deutschsprachig, GKV/PKV-Patient

Slot:          [Tag-Offset / Woche-Position]
Cluster:       [Trust / Mythen / Pain Point / Cost / Lifestyle / CTA]
Subject:       [Subject-Zeile aus Tabelle §2 — nur als Ausgangspunkt, kann angepasst werden]
Pre-Header:    [Pre-Header aus §2 — 75–90 Zeichen Ziel]

Brand-Voice:   Sachkundig-warm, keine Drängerei, kein Vertriebsjargon.
               Referenz: §1.1 Brand-Voice-Tabelle.

Body:
  - Hook:      [aus Body-Skelett §2 oder §3-§7]
  - Story:     [aus Body-Skelett]
  - CTA:       [primär + sekundär aus §2]

Länge:         200–350 Wörter (fertig formuliert)
Format:        HTML-kompatibel, ein <h1> erlaubt, 1 CTA-Button
DSGVO-Footer:  Unsubscribe-Link + Praxis-Adresse (Brevo fügt Footer-Template ein)

Deliverable:   Notion-Seite oder Google-Doc mit:
               - Fertig formulierter Subject-Zeile
               - Body-Text (HTML-bereit)
               - Alternativ-Subject (für A/B-Test wenn relevant)
```

### 10.3 Qualitätsprüfung vor Aktivierung

Vor dem ersten Live-Versand der Welcome-Sequenz:
- [ ] Alle 6 Welcome-Templates intern getestet (Inbox-Rendering, Links funktionieren)
- [ ] Unsubscribe-Link in jedem Template verifiziert
- [ ] "Re:" Subject-Line intern getestet (kein Spam-Filter-Problem)
- [ ] DSGVO-Footer mit korrekter Praxis-Adresse
- [ ] Brevo-Webhook aktiv und `email_events` werden in Directus geschrieben
- [ ] Cron-Endpoint (Modul A) einmalig manuell getriggert mit echten Test-Leads (eigene Email-Adressen)

---

*Dieses Dokument ist die Grundlage für Content-Erstellung und technische Umsetzung. Es ist kein finaler Copywriting-Stand — Texte werden vom Marketing-Team ausgearbeitet. Für technische Details zur Cron-Implementierung: [docs/WELCOME_SEQUENCE_OPS.md](../WELCOME_SEQUENCE_OPS.md).*

*Letzte Aktualisierung: 2026-05-13*
