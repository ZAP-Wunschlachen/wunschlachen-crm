export interface NewsletterTopic {
  id: string
  category: string
  categoryIcon: string
  title: string
  description: string
  body: string
  frequency: 'einmalig' | 'monatlich' | 'quartalsweise'
  tags: string[]
}

export interface NewsletterCategory {
  id: string
  label: string
  icon: string
  color: string
  bg: string
}

export const NEWSLETTER_CATEGORIES: NewsletterCategory[] = [
  { id: 'prophylaxe', label: 'Prophylaxe & Mundpflege', icon: 'pi pi-heart', color: '#dc2626', bg: '#fef2f2' },
  { id: 'prothesen', label: 'Prothesen & Zahnersatz', icon: 'pi pi-cog', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'demenz', label: 'Mundgesundheit bei Demenz', icon: 'pi pi-shield', color: '#0891b2', bg: '#ecfeff' },
  { id: 'notfall', label: 'Zahnmedizinische Notfalle', icon: 'pi pi-exclamation-triangle', color: '#ea580c', bg: '#fff7ed' },
  { id: 'ernaehrung', label: 'Ernahrung & Mundgesundheit', icon: 'pi pi-apple', color: '#16a34a', bg: '#f0fdf4' },
  { id: 'medikamente', label: 'Medikamente & Nebenwirkungen', icon: 'pi pi-box', color: '#2563eb', bg: '#eff6ff' },
  { id: 'recht', label: 'Recht & Kooperation', icon: 'pi pi-file-edit', color: '#64748b', bg: '#f8fafc' },
  { id: 'schulung', label: 'Schulungen & Fortbildung', icon: 'pi pi-book', color: '#b45309', bg: '#fffbeb' },
]

export const NEWSLETTER_TOPICS: NewsletterTopic[] = [
  // ─── Prophylaxe & Mundpflege ───────────────────────────────────
  {
    id: 'prophylaxe-grundlagen',
    category: 'prophylaxe',
    categoryIcon: 'pi pi-heart',
    title: 'Grundlagen der Mundpflege im Pflegeheim',
    description: 'Schritt-fur-Schritt-Anleitung zur taglichen Mundpflege bei Bewohnern mit unterschiedlichen Pflegegraden. Inkl. Checkliste fur Pflegekrafte.',
    body: `Liebe/r {{kontakt.vorname}},

eine gute Mundpflege ist für Bewohner im Pflegeheim weit mehr als Komfort — sie ist ein entscheidender Faktor für Lebensqualität, Ernährung und Infektionsschutz. Hier ist eine bewährte Schritt-für-Schritt-Anleitung für den Pflegealltag in {{pflegeheim.name}}:

Schritt 1 – Vorbereitung: Einmalhandschuhe anziehen, Bewohner in aufrechte oder halbaufrechte Position bringen. Notwendige Utensilien bereitlegen (Zahnbürste, Zahnpasta, Becher, Nierenschale).

Schritt 2 – Zähne reinigen: Zähne und Zahnfleischrand mit weicher Bürste in kreisenden Bewegungen reinigen. Pro Quadrant mindestens 30 Sekunden. Bei bettlägerigen Bewohnern Kopf zur Seite drehen, um Aspiration zu vermeiden.

Schritt 3 – Mundschleimhaut und Zunge: Mit einem feuchten Mundpflegestäbchen Gaumen, Wangen und Zunge sanft reinigen.

Schritt 4 – Ausspülen: Bewohner zum Ausspülen auffordern oder vorsichtig absaugen. Bei Schluckstörungen kein Wasser anbieten.

Schritt 5 – Prothesen: Separat reinigen und einlegen (Details im Newsletter zu Prothesenpflege).

Checkliste für Pflegekräfte:
- Mundpflege mindestens 2x täglich
- Weiche Zahnbürste, erbsengroße Menge fluoridhaltiger Zahnpasta
- Auffälligkeiten (Rötungen, Schwellungen, Ulzera) dokumentieren und melden

Wir als {{praxis.name}} stehen Ihnen gerne für Rückfragen zur Verfügung. Eine gute Mundpflege schützt — und wir unterstützen Sie dabei.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Basis', 'Pflege', 'Checkliste'],
  },
  {
    id: 'prophylaxe-hilfsmittel',
    category: 'prophylaxe',
    categoryIcon: 'pi pi-heart',
    title: 'Die richtigen Mundpflege-Hilfsmittel',
    description: 'Welche Zahnbursten, Interdentalbuersten und Mundspuelungen eignen sich fur altere Patienten? Ubersicht und Empfehlungen.',
    body: `Liebe/r {{kontakt.vorname}},

die Wahl der richtigen Mundpflege-Hilfsmittel macht einen enormen Unterschied — gerade bei älteren Pflegeheimbewohnern, die oft eingeschränkte Motorik, empfindliche Schleimhäute oder Schluckprobleme haben. Hier unsere Empfehlungen für {{pflegeheim.name}}:

Zahnbürsten:
Für die meisten Senioren empfehlen wir elektrische Zahnbürsten mit rundem Bürstenkopf — sie reinigen deutlich gründlicher als Handzahnbürsten, auch wenn die Handbewegung eingeschränkt ist. Bei Handanlage durch Pflegekräfte sind weiche Handzahnbürsten mit kurzem Kopf und langem, griffigem Stiel ideal.

Interdentalbürsten und Zahnseide:
Interdentalbürsten sind für die meisten Senioren leichter zu handhaben als Zahnseide. Für Bewohner mit Brücken oder größeren Zahnzwischenräumen unbedingt empfohlen. Auf die richtige Größe achten — wir beraten gerne persönlich.

Mundspülungen:
Alkoholhaltige Mundspülungen meiden — sie verstärken Mundtrockenheit. Empfehlenswert sind fluoridhaltige Lösungen ohne Alkohol oder Chlorhexidin-Spülungen bei erhöhtem Kariesrisiko (max. 4 Wochen kontinuierlich).

Mundpflegestäbchen:
Bei Bewohnern ohne eigene Zähne oder bei Schluckstörungen sind Mundpflegestäbchen eine gute Alternative zur Bürste — sie befeuchten und reinigen die Schleimhäute sanft.

Gerne besuchen wir {{pflegeheim.name}} für eine praktische Vorstellung geeigneter Produkte. Sprechen Sie uns einfach an!

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Hilfsmittel', 'Produkte'],
  },
  {
    id: 'prophylaxe-xerostomie',
    category: 'prophylaxe',
    categoryIcon: 'pi pi-heart',
    title: 'Mundtrockenheit (Xerostomie) erkennen und behandeln',
    description: 'Ursachen, Symptome und praktische Tipps gegen Mundtrockenheit — eines der haufigsten Probleme bei Senioren.',
    body: `Liebe/r {{kontakt.vorname}},

Mundtrockenheit — medizinisch Xerostomie — betrifft schätzungsweise 30 bis 40 Prozent aller Pflegeheimbewohner. Sie ist schmerzhaft, gefährlich und wird im Pflegealltag häufig unterschätzt.

Ursachen:
Die häufigste Ursache in der stationären Pflege ist die Medikation. Über 400 Wirkstoffe können den Speichelfluss reduzieren, darunter Antihypertensiva, Antidepressiva, Anticholinergika und Diuretika. Hinzu kommen unzureichende Trinkmenge und Mundatmung.

Woran erkennt man Xerostomie?
- Trockene, rissige Lippen und Mundschleimhaut
- Klebriger, zähflüssiger Speichel
- Beschwerden beim Kauen und Schlucken
- Häufige Kandidainfektionen
- Klagen über Brennen im Mund
- Schlechter Prothesenhalt

Was können Pflegekräfte tun?
- Regelmäßige Trinkprotokolle führen (Ziel: mind. 1,5 l täglich)
- Mundbefeuchtungs-Gele oder Kunstspeichel-Sprays einsetzen (z. B. Glandosane, BioXtra)
- Zuckerfreie Kaugummis oder Bonbons zur Speichelstimulation anbieten (wenn Kauakt möglich)
- Mundatmung durch korrekte Lagerung reduzieren
- Medikamentenliste kritisch prüfen — gemeinsam mit dem behandelnden Arzt

Nicht behandelte Xerostomie führt zu Karies, Pilzinfektionen und Schluckbeschwerden. Wir von {{praxis.name}} helfen Ihnen gerne, betroffene Bewohner von {{pflegeheim.name}} gezielt zu versorgen.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'quartalsweise',
    tags: ['Xerostomie', 'Symptome', 'Tipps'],
  },
  {
    id: 'prophylaxe-fluorid',
    category: 'prophylaxe',
    categoryIcon: 'pi pi-heart',
    title: 'Fluoridierung im Alter: Sinn oder Unsinn?',
    description: 'Warum hochdosierte Fluorid-Zahnpasta bei alteren Patienten besonders wichtig ist und wie sie richtig angewendet wird.',
    body: `Liebe/r {{kontakt.vorname}},

"Fluorid ist doch nur für Kinder wichtig" — dieses Missverständnis hält sich hartnäckig. Tatsächlich ist Fluorid bei älteren Menschen noch bedeutsamer als in der Kindheit. Warum? Weil Wurzelkaries eine der häufigsten und aggressivsten Zahnerkrankungen bei Senioren ist.

Warum Senioren besonders gefährdet sind:
Im Alter zieht sich das Zahnfleisch oft zurück, die empfindlichen Zahnwurzeln liegen frei. Wurzelzement ist weit weniger widerstandsfähig als Zahnschmelz — Karies entsteht hier schnell und schreitet rasch fort. Hinzu kommt bei vielen Bewohnern Mundtrockenheit, die den natürlichen Schutz des Speichels eliminiert.

Die Empfehlung der DGZMK (Deutsche Gesellschaft für Zahn-, Mund- und Kieferheilkunde):
Für pflegebedürftige Senioren empfiehlt sich eine Zahnpasta mit erhöhtem Fluoridgehalt von 1.450 ppm oder sogar 5.000 ppm (Elmex Erosionsschutz oder verschreibungspflichtige Hochdosis-Präparate). Beim professionellen Zahnarztbesuch werden zusätzlich Fluoridlacke aufgetragen.

Was Sie in {{pflegeheim.name}} tun können:
- Prüfen Sie, welche Zahnpasta aktuell verwendet wird
- Stellen Sie auf fluoridhaltige Produkte mit mindestens 1.450 ppm um
- Achten Sie darauf, dass nach dem Zähneputzen nicht gespült wird — kurzes Ausspülen reicht

Für Rückfragen zu geeigneten Produkten stehen wir von {{praxis.name}} jederzeit zur Verfügung.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Fluorid', 'Prophylaxe'],
  },
  {
    id: 'prophylaxe-zungenreinigung',
    category: 'prophylaxe',
    categoryIcon: 'pi pi-heart',
    title: 'Zungenreinigung und Mundgeruch-Pravention',
    description: 'Warum Zungenreinigung oft vergessen wird und wie sie Mundgeruch und Infektionsrisiken reduziert.',
    body: `Liebe/r {{kontakt.vorname}},

Wenn Sie Ihr Pflegeteam in {{pflegeheim.name}} fragen, was zur Mundpflege gehört, werden die meisten antworten: Zähne putzen, Prothese reinigen. Zungenreinigung? Wird oft vergessen — dabei ist sie einer der wirksamsten Schritte gegen Mundgeruch und Infektionsrisiken.

Warum die Zunge so wichtig ist:
Die raue Oberfläche der Zunge ist ein idealer Lebensraum für Bakterien. Auf dem sogenannten Zungenbelag sammeln sich täglich Millionen von Mikroorganismen — sie sind Hauptverursacher von Mundgeruch (Halitosis) und können bei aspirierten Sekreten zu Atemwegsinfektionen beitragen.

Bei bettlägerigen oder schlecht hydratierten Bewohnern ist der Zungenbelag besonders ausgeprägt.

So geht's richtig:
- Einen Zungenreiniger (oder den Rücken einer weichen Zahnbürste) von hinten nach vorne über die Zunge führen
- 3 bis 5 Striche genügen
- Danach mit Wasser nachspülen
- Einmal täglich, am besten morgens, durchführen

Für Bewohner mit Würgereiz: Zungenreiniger sind kürzer und weniger irritierend als Zahnbürsten. Flach und gleichmäßig aufsetzen, nicht zu weit hinten beginnen.

Einfacher Zusatzschritt mit großer Wirkung: Die Zungenreinigung dauert unter 30 Sekunden und kann Mundgeruch bei Bewohnern signifikant reduzieren — was auch für ihr Wohlbefinden und ihre sozialen Kontakte wichtig ist.

Ihr Team von {{praxis.name}} freut sich, Sie und Ihre Kolleginnen und Kollegen in {{pflegeheim.name}} weiter zu unterstützen.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'quartalsweise',
    tags: ['Zunge', 'Halitosis', 'Hygiene'],
  },
  {
    id: 'prophylaxe-mundschleimhaut',
    category: 'prophylaxe',
    categoryIcon: 'pi pi-heart',
    title: 'Mundschleimhaut-Inspektion: Worauf achten?',
    description: 'Anleitung fur Pflegekrafte zur regelmaessigen Kontrolle der Mundschleimhaut. Warnzeichen fur Entzuendungen, Pilzbefall und Druckstellen.',
    body: `Liebe/r {{kontakt.vorname}},

Die regelmäßige Inspektion der Mundschleimhaut ist ein oft unterschätzter Teil der Pflegearbeit — und doch kann sie Leben retten. Früherkannte Veränderungen lassen sich behandeln; übersehene Befunde können sich zu ernsthaften Erkrankungen entwickeln.

Was Pflegekräfte in {{pflegeheim.name}} einmal wöchentlich kontrollieren sollten:

Zahnfleisch: Ist es rot, geschwollen oder blutet es beim leichten Berühren? Das können Zeichen einer Gingivitis oder Parodontitis sein.

Wangen- und Lippenschleimhaut: Weißliche Beläge, die sich nicht abwischen lassen, können auf eine Candidainfektion (Mundsoor) hinweisen. Weißliche Flecken, die fest haften, sollten umgehend einem Zahnarzt gezeigt werden (Leukoplakie — mögliche Vorstufe).

Gaumen und Zungenunterseite: Schwellungen, Ulzera oder unklare Veränderungen immer dokumentieren und dem behandelnden Zahnarzt oder Arzt melden.

Lippen: Risse, Krusten und Bläschen können auf Herpes labialis oder Vitaminmangel hindeuten.

Praktische Anleitung:
- Gute Lichtquelle verwenden (Taschenlampe oder Stirnlampe)
- Handschuhe tragen
- Bewohner bitten, Mund weit zu öffnen und "Ahhh" zu sagen
- Befunde in der Pflegedokumentation festhalten

Veränderungen, die länger als 2 Wochen bestehen und nicht auf einfache Maßnahmen ansprechen, sollten immer zahnärztlich abgeklärt werden. Wir von {{praxis.name}} sind für Sie da.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'quartalsweise',
    tags: ['Inspektion', 'Fruherkennung'],
  },

  // ─── Prothesen & Zahnersatz ────────────────────────────────────
  {
    id: 'prothesen-reinigung',
    category: 'prothesen',
    categoryIcon: 'pi pi-cog',
    title: 'Prothesenpflege: Das 1x1 fur Pflegekrafte',
    description: 'Tagliche Reinigung, nachtliches Einlegen, Prothesenreiniger vs. Zahnpasta — alle wichtigen Regeln auf einen Blick.',
    body: `Liebe/r {{kontakt.vorname}},

Herausnehmbare Prothesen sind auf eine konsequente tägliche Pflege angewiesen — sowohl für die Haltbarkeit der Prothese als auch für die Mundgesundheit des Bewohners. Hier das Wichtigste für den Alltag in {{pflegeheim.name}}:

Tägliche Reinigung — so geht's richtig:
1. Prothese nach jeder Mahlzeit mit lauwarmem Wasser abspülen.
2. Mindestens einmal täglich (idealerweise abends) gründlich mit einer Prothesenbürste und speziellem Prothesenreiniger säubern.
3. Keine normale Zahnpasta verwenden — sie enthält Schleifmittel, die die Prothese verkratzen und Bakterien ansammeln lassen.
4. Prothesen nicht mit heißem Wasser reinigen — das kann zu Verformung führen.

Nächtliche Aufbewahrung:
Prothesen sollten nachts herausgenommen und trocken oder in einem Reinigungsbad aufbewahrt werden. Das gibt der Mundschleimhaut wichtige Regenerationszeit und beugt Pilzinfektionen vor. Reinigungstabletten über Nacht wirken bakterizid — empfehlenswert.

Prothesenreiniger vs. Zahnpasta:
Prothesenreiniger (Tabletten oder Gel) sind sanfter und effektiver. Zahnpasta ist zu abrasiv und sollte nur für echte Zähne verwendet werden.

Häufige Fehler:
- Prothese mit der Zahnbürste des Bewohners reinigen (Kreuzkontamination)
- Prothese die Nacht im Mund belassen
- Prothese in der Hosentasche aufbewahren (Bruchgefahr)

Wir von {{praxis.name}} unterstützen das Team von {{pflegeheim.name}} gerne mit weiterführenden Informationen.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Reinigung', 'Basis', 'Anleitung'],
  },
  {
    id: 'prothesen-druckstellen',
    category: 'prothesen',
    categoryIcon: 'pi pi-cog',
    title: 'Druckstellen durch Prothesen erkennen und handeln',
    description: 'Woran erkennt man Druckstellen? Wann ist ein Zahnarztbesuch noetig? Erste-Hilfe-Massnahmen im Pflegeheim.',
    body: `Liebe/r {{kontakt.vorname}},

Druckstellen durch schlecht sitzende Prothesen sind im Pflegealltag häufig — und werden leider oft zu spät erkannt. Besonders bei Bewohnern mit Demenz oder eingeschränkter Kommunikationsfähigkeit ist aktives Beobachten durch Pflegekräfte essenziell.

Woran erkennt man Druckstellen?

Äußere Zeichen:
- Rötungen oder weiße Bereiche unter der Prothese
- Geschwüre oder kleine Wunden an Zahnfleisch, Gaumen oder Wangeninnenseite
- Schwellung im Mundbereich

Verhaltenszeichen:
- Bewohner zieht Prothese häufig heraus
- Verweigert Mahlzeiten oder kaut nur auf einer Seite
- Wirkt unruhig, gereizt oder zieht sich zurück

Was sofort zu tun ist:
1. Prothese herausnehmen und Mundschleimhaut inspizieren.
2. Wunde dokumentieren (Lage, Größe, Aussehen).
3. Prothese erst nach Rücksprache mit Zahnarzt wieder einsetzen lassen.
4. Bei starker Schwellung, Fieber oder Schluckbeschwerden: sofort zahnärztlich oder ärztlich vorstellen.

Wann ist ein Zahnarztbesuch nötig?
Druckstellen, die sich binnen 3 bis 5 Tagen nach Prothesenpause nicht bessern, müssen zahnärztlich behandelt werden. Schlecht sitzende Prothesen können durch Unterfütterung oder Neuanfertigung angepasst werden.

Wir von {{praxis.name}} kommen auf Wunsch auch direkt nach {{pflegeheim.name}} — sprechen Sie uns an.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'quartalsweise',
    tags: ['Druckstellen', 'Schmerzen', 'Notfall'],
  },
  {
    id: 'prothesen-haftcreme',
    category: 'prothesen',
    categoryIcon: 'pi pi-cog',
    title: 'Haftcreme richtig verwenden',
    description: 'Wann ist Haftcreme sinnvoll, wann ein Zeichen fuer schlechten Sitz? Anwendungstipps und Alternativen.',
    body: `Liebe/r {{kontakt.vorname}},

Haftcreme ist in vielen Pflegeheimen ein Standardprodukt — aber ihr Einsatz wird oft missverstanden. Wann ist Haftcreme sinnvoll, und wann ist sie ein Signal, dass die Prothese dringend angepasst werden muss?

Wann Haftcreme sinnvoll ist:
- Bei gut sitzenden Prothesen, wenn Bewohner trotzdem mehr Stabilität wünschen (besonders für die Unterkieferprothese)
- Bei trockener Mundschleimhaut (Xerostomie), die den natürlichen Saughalt reduziert
- Als kurzfristige Überbrückung nach Gewichtsverlust bis zur Prothesenkorrektur

Wann Haftcreme ein Warnsignal ist:
- Wenn die Prothese ohne Haftcreme gar nicht mehr sitzt
- Wenn täglich große Mengen benötigt werden
- Wenn sich Druckstellen trotz Haftcreme bilden

In diesen Fällen ist die Prothese nicht mehr passend — und Haftcreme überdeckt das Problem nur, anstatt es zu lösen. Schlecht sitzende Prothesen können zu Knochenschwund im Kieferbereich führen.

Richtige Anwendung:
- Erbsengroße Mengen auf 3 bis 4 Stellen der Prothesenbasis auftragen
- Nicht zu viel — überschüssige Creme quillt beim Einsetzen hervor
- Vor dem Einsetzen sicherstellen, dass die Prothese gründlich gereinigt ist

Zinkhaltige Haftcremes sollten bei Langzeitanwendung vermieden werden — zu viel Zink kann neurologische Beschwerden verursachen. Empfehlenswert sind zinkfreie Alternativen.

Wir von {{praxis.name}} helfen gerne bei der Beurteilung des Prothesensitzes bei Bewohnern in {{pflegeheim.name}}.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Haftcreme', 'Sitz', 'Tipps'],
  },
  {
    id: 'prothesen-beschriftung',
    category: 'prothesen',
    categoryIcon: 'pi pi-cog',
    title: 'Prothesenbeschriftung: Verwechslungen vermeiden',
    description: 'Methoden zur individuellen Kennzeichnung von Prothesen im Pflegeheim — von Gravur bis Markierungssystem.',
    body: `Liebe/r {{kontakt.vorname}},

Verwechselte Prothesen sind im Pflegeheimalltag kein Einzelfall — sie kommen häufiger vor, als man denkt, und können ernsthafte hygienische und gesundheitliche Folgen haben. Eine einfache Kennzeichnung kann das Problem vollständig lösen.

Warum Beschriftung so wichtig ist:
- Bei zentraler Reinigung (z. B. in der Spülküche) gehen Prothesen ohne Kennzeichnung leicht durcheinander
- Prothesen, die in der Nacht aus dem Mund genommen werden, landen manchmal im falschen Glas
- Bei Krankenhausaufenthalten oder Verlegungen gehen Prothesen verloren oder werden vertauscht

Methoden zur Kennzeichnung:

1. Labeling-Kit (z. B. Sticker + Lack): Einfache Etiketten werden auf die Prothese geklebt und mit klarem Lack versiegelt. Preisgünstig, aber nicht dauerhaft.

2. Gravur: Zahnarztpraxen können den Namen oder eine Identifikationsnummer dauerhaft in die Prothese gravieren. Hygienisch, dauerhaft und empfehlenswert für alle Neumachungen.

3. Spezialstift mit Versiegelung: Im Sanitätsfachhandel erhältlich. Zahlen oder Kürzel werden aufgemalt und versiegelt.

Empfehlung für {{pflegeheim.name}}:
Führen Sie ein Prothesenregister mit Bewohnername, Prothesen-ID, Datum der Anfertigung und Lichtbild der Prothese. Bei Neumachungen bitten wir als {{praxis.name}} automatisch um Gravur — sprechen Sie uns beim nächsten Besuch darauf an.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Kennzeichnung', 'Organisation'],
  },
  {
    id: 'prothesen-stomatitis',
    category: 'prothesen',
    categoryIcon: 'pi pi-cog',
    title: 'Prothesenstomatitis: Pilzinfektionen vorbeugen',
    description: 'Candida-Befall unter Prothesen ist extrem verbreitet. Ursachen, Erkennung und Praventionsmassnahmen fuer den Pflegealltag.',
    body: `Liebe/r {{kontakt.vorname}},

Prothesenstomatitis ist eine der häufigsten Munderkrankungen bei Prothesenträgern — und wird im Pflegeheim regelmäßig übersehen. Bis zu 70 Prozent aller Menschen mit herausnehmbarem Zahnersatz sind betroffen, viele ohne es zu wissen.

Was ist Prothesenstomatitis?
Es handelt sich um eine chronische Entzündung der Mundschleimhaut unter der Prothese, meist verursacht durch Candida albicans (Hefepilz). Die betroffene Schleimhaut wirkt gerötet, manchmal geschwollen — oft ohne Schmerzen, weshalb sie so lange unentdeckt bleibt.

Risikofaktoren:
- Prothese wird nachts nicht herausgenommen
- Schlechte oder unregelmäßige Prothesenhygiene
- Mundtrockenheit
- Immunsuppression (z. B. durch Kortison, Chemotherapie, Diabetes)
- Antibiotika-Therapie

Wie erkennt man sie?
- Gleichmäßige Rötung unter der Oberkieferprothese
- Gelegentliches Brennen oder Jucken
- Weißliche Beläge, die sich abwischen lassen (Mundsoor)

Was ist zu tun?
1. Prothese nachts konsequent herausnehmen und in antimikrobiellem Bad aufbewahren.
2. Prothese täglich mit Prothesenreiniger reinigen.
3. Bei Verdacht: zahnärztliche Behandlung mit Antimykotika (z. B. Nystatin).
4. Ursachen beheben: Sitz der Prothese prüfen, Mundhygiene optimieren.

Wir von {{praxis.name}} erkennen Prothesenstomatitis zuverlässig und behandeln sie effektiv. Sprechen Sie uns für einen Besuch in {{pflegeheim.name}} an.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'quartalsweise',
    tags: ['Candida', 'Infektion', 'Pravention'],
  },
  {
    id: 'prothesen-implantate',
    category: 'prothesen',
    categoryIcon: 'pi pi-cog',
    title: 'Implantat-getragener Zahnersatz in der Pflege',
    description: 'Besonderheiten bei der Pflege von Implantat-Prothesen. Was Pflegekrafte wissen mussen.',
    body: `Liebe/r {{kontakt.vorname}},

Immer mehr Senioren kommen mit implantatgetragenem Zahnersatz ins Pflegeheim. Für Pflegekräfte in {{pflegeheim.name}} bedeutet das: Die Anforderungen an die Mundpflege steigen — denn Implantate brauchen besondere Aufmerksamkeit.

Was ist implantatgetragener Zahnersatz?
Implantate sind künstliche Zahnwurzeln aus Titan, die in den Kieferknochen eingesetzt werden. Auf ihnen können Kronen, Brücken oder herausnehmbare Prothesen verankert werden. Der Vorteil: besserer Halt und Kaufunktion. Der Nachteil im Pflegekontext: erhöhter Pflegeaufwand.

Besonderheiten der Implantatpflege:

Herausnehmbare Implantatprothesen:
- Locatoren oder Stege (Verbindungselemente) täglich reinigen
- Keine harten Bürsten verwenden — Kunststoffteile können verkratzen
- Auf festen Sitz der Verbindungselemente achten — wackeln ist ein Warnsignal

Festsitzender Implantatersatz:
- Spezielle Interdentalbürsten oder Implantat-Floss verwenden
- Den Übergang zwischen Implantat und Zahnfleisch täglich reinigen (kritische Zone für Periimplantitis)

Warnsignale — sofort zahnärztlich melden:
- Zahnfleisch um das Implantat gerötet oder geschwollen
- Implantat wackelt
- Bewohner klagt über Druckgefühl oder Schmerzen

Periimplantitis (Entzündung um das Implantat) führt unbehandelt zum Implantatverlust. Frühzeitige Behandlung ist entscheidend.

Wir von {{praxis.name}} beraten das Pflegeteam von {{pflegeheim.name}} gerne zu individuellen Pflegeprotokollen für Implantatpatienten.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Implantate', 'Spezialpflege'],
  },

  // ─── Mundgesundheit bei Demenz ─────────────────────────────────
  {
    id: 'demenz-mundpflege',
    category: 'demenz',
    categoryIcon: 'pi pi-shield',
    title: 'Mundpflege bei Demenz: Strategien bei Abwehrverhalten',
    description: 'Praktische Techniken fur Pflegekrafte wenn demenzkranke Bewohner die Mundpflege verweigern. Kommunikationstipps und Alternativen.',
    body: `Liebe/r {{kontakt.vorname}},

Mundpflege bei demenzkranken Bewohnern gehört zu den anspruchsvollsten Aufgaben im Pflegealltag. Abwehrverhalten, Beißen, Zukneifen des Mundes — viele Pflegekräfte in {{pflegeheim.name}} kennen diese Situationen. Hier sind bewährte Strategien:

Den richtigen Moment wählen:
Demenzkranke haben "gute Zeiten" — meist morgens nach dem Aufwachen oder nach dem Frühstück. Erzwungene Mundpflege in Stressphasen eskaliert. Beobachten Sie, wann der Bewohner ruhiger und kooperativer ist.

Kommunikation anpassen:
- Kurze, einfache Sätze: "Ich putze jetzt Ihre Zähne."
- Handlungen ankündigen, langsam beginnen
- Sanften Körperkontakt aufbauen (Hand halten, Schulter berühren)
- Nie von hinten herantreten

Mimikry-Technik:
Machen Sie die Mundbewegungen selbst vor — viele Demenzkranke ahmen unbewusst nach.

Hilfsmittel clever einsetzen:
- Drei-Kopf-Zahnbürste reinigt schneller, wenn Mitwirkung nur kurz möglich ist
- Mundpflegestäbchen als sanfter Einstieg, wenn Bürste abgelehnt wird
- Fingerling (Gummi-Aufsatz auf Finger) als Alternative zur Bürste

Wenn gar nichts hilft:
Dokumentieren Sie das Abwehrverhalten. Es kann ein Zeichen für Schmerzen im Mundbereich sein. Wir von {{praxis.name}} empfehlen in solchen Fällen eine zahnärztliche Inspektion — oft liegt eine unbemerkte Ursache vor.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Abwehr', 'Kommunikation', 'Strategien'],
  },
  {
    id: 'demenz-schmerzzeichen',
    category: 'demenz',
    categoryIcon: 'pi pi-shield',
    title: 'Zahnschmerzen bei Demenz erkennen',
    description: 'Demenzkranke koennen Schmerzen oft nicht artikulieren. Indirekte Schmerzzeichen und Verhaltensaenderungen richtig deuten.',
    body: `Liebe/r {{kontakt.vorname}},

Ein demenzkranker Bewohner, der plötzlich unruhiger wird, die Mahlzeiten verweigert oder sich häufig ins Gesicht fasst — hinter solchen Verhaltensänderungen verbergen sich oft Zahnschmerzen. Da viele Betroffene ihren Schmerz nicht verbalisieren können, sind aufmerksame Pflegekräfte in {{pflegeheim.name}} die wichtigste Frühwarnstufe.

Indirekte Schmerzzeichen, auf die Sie achten sollten:

Verändertes Essverhalten:
- Mahlzeitenablehnung ohne erkennbaren Grund
- Ausschließlich weiches Essen akzeptieren
- Nahrung auf einer Seite kauen oder im Mund behalten ohne zu schlucken

Verhaltensauffälligkeiten:
- Plötzlich gesteigerte Unruhe oder Aggressivität
- Zunehmende Verweigerung der Mundpflege
- Häufiges Reiben oder Greifen an Wange, Kinn oder Ohr
- Stöhnen ohne erkennbaren Anlass

Körperliche Zeichen:
- Geschwollene Wange oder Kieferbereich
- Gerötetes oder blutendes Zahnfleisch
- Auffälliger Mundgeruch trotz regelmäßiger Pflege
- Fieber ohne anderweitige Ursache

Praktische Empfehlung:
Führen Sie in {{pflegeheim.name}} bei Verhaltensauffälligkeiten eine kurze Mundinspektion durch. Dokumentieren Sie Beobachtungen und leiten Sie diese an den zuständigen Zahnarzt weiter. Wir von {{praxis.name}} reagieren schnell auf Hinweise und kommen bei Bedarf zum Besuch.

Zahnschmerzen bei Demenz sind vermeidbar — wenn sie früh erkannt werden.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'quartalsweise',
    tags: ['Schmerz', 'Beobachtung', 'Fruherkennung'],
  },
  {
    id: 'demenz-nahrungsaufnahme',
    category: 'demenz',
    categoryIcon: 'pi pi-shield',
    title: 'Mundgesundheit und Nahrungsaufnahme bei Demenz',
    description: 'Wie Zahnprobleme die Ernahrungssituation bei demenzkranken Bewohnern verschlechtern und was dagegen getan werden kann.',
    body: `Liebe/r {{kontakt.vorname}},

Gewichtsverlust bei demenzkranken Bewohnern wird häufig der Erkrankung selbst zugeschrieben — aber eine häufig übersehene Ursache sind Probleme im Mundbereich. Schmerzen, schlecht sitzende Prothesen oder fehlende Zähne können die Nahrungsaufnahme erheblich einschränken.

Der Zusammenhang:
Kauprobleme führen dazu, dass Bewohner weniger essen, einseitig essen oder Speisen ablehnen, die sie eigentlich mögen. Bei Demenz fehlt die Möglichkeit, dieses Problem klar zu kommunizieren. Stattdessen zeigen sich Gewichtsabnahme, Mangelernährung und ein schlechterer Allgemeinzustand.

Häufige mundbedingte Kauhindernisse:
- Schlecht sitzende oder kaputte Prothesen
- Druckstellen und Schmerzen beim Kauen
- Fehlende Zähne ohne adäquaten Ersatz
- Mundtrockenheit, die das Schlucken erschwert
- Candidainfektionen, die Brennen und Unbehagen verursachen

Was Pflegekräfte in {{pflegeheim.name}} tun können:
- Kauleistung beim Essen beobachten und dokumentieren
- Prothesensitz regelmäßig prüfen (passt die Prothese nach Gewichtsverlust noch?)
- Kostform und Zahnstatus abgleichen — wer kaum noch Zähne hat, braucht weiche Kost
- Zahnarzt hinzuziehen, wenn Essmengen ohne Erklärung sinken

Wir von {{praxis.name}} haben Erfahrung in der Versorgung von Bewohnern mit Demenz und kommen auf Wunsch zu einem Screening-Termin nach {{pflegeheim.name}}.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'quartalsweise',
    tags: ['Ernahrung', 'Gewichtsverlust', 'Dysphagie'],
  },
  {
    id: 'demenz-biografie',
    category: 'demenz',
    categoryIcon: 'pi pi-shield',
    title: 'Biografiearbeit in der Mundpflege',
    description: 'Gewohnte Rituale nutzen: Wie biografische Informationen die Mundpflege-Akzeptanz bei Demenz verbessern.',
    body: `Liebe/r {{kontakt.vorname}},

"Herr Müller hat sich früher immer nach dem Frühstück die Zähne geputzt, bevor er zur Arbeit ging." Solche biografischen Details sind Gold wert — und können die Mundpflege bei demenzkranken Bewohnern grundlegend verändern.

Warum Biografie in der Mundpflege hilft:
Das Langzeitgedächtnis bei Demenz bleibt oft länger erhalten als das Kurzzeitgedächtnis. Vertraute Rituale, Gerüche und Gegenstände können Brücken bauen — auch wenn der Bewohner nicht mehr versteht, wer Sie sind oder was Sie gerade tun.

Praktische Ansätze:

Gewohnte Zeit einhalten:
Fragen Sie Angehörige: Wann hat der Bewohner früher die Zähne geputzt? Morgens nach dem Aufstehen? Abends vor dem Schlafengehen? Diesen Rhythmus beibehalten.

Vertraute Produkte verwenden:
Dieselbe Zahncreme wie zu Hause — ein vertrauter Geruch kann Kooperation fördern. Fragen Sie Angehörige, welche Produkte der Bewohner benutzt hat.

Sprache und Tonfall:
Manche Bewohner reagieren besser auf Dialekt, auf bestimmte Anredeformen oder vertraute Phrasen aus ihrem früheren Leben.

Musik als Hilfsmittel:
Bekannte Lieder aus der Jugend des Bewohners während der Mundpflege abspielen — das kann Stresszustände deutlich reduzieren.

Dokumentation in {{pflegeheim.name}}:
Halten Sie mundpflegerelevante biografische Details im Pflegeplan fest. Wir von {{praxis.name}} freuen uns, wenn wir beim Zahnarzttermin auf diese Informationen zurückgreifen können.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Biografie', 'Gewohnheiten', 'Akzeptanz'],
  },
  {
    id: 'demenz-hilfsmittel',
    category: 'demenz',
    categoryIcon: 'pi pi-shield',
    title: 'Spezielle Hilfsmittel fur die Mundpflege bei Demenz',
    description: 'Drei-Kopf-Zahnbursten, Mundpflegestabchen, Fingerlinge — welche Hilfsmittel wirklich helfen.',
    body: `Liebe/r {{kontakt.vorname}},

Die richtige Ausrüstung kann bei der Mundpflege von demenzkranken Bewohnern den entscheidenden Unterschied machen. Hier stellen wir die wichtigsten Spezialhilfsmittel vor, die in {{pflegeheim.name}} zum Einsatz kommen können:

Drei-Kopf-Zahnbürste:
Diese Bürste hat drei Bürstenköpfe, die gleichzeitig Ober-, Unter- und Kaufläche reinigen. Vorteil: Die Reinigung ist in wenigen Sekunden erledigt — ideal, wenn die Mitwirkung des Bewohners nur kurz möglich ist. Nachteil: Passt nicht für jeden Kiefertyp; ausprobieren lohnt sich.

Mundpflegestäbchen (Tupfer):
Stäbchen mit weichem Schaumstoffkopf, getränkt mit Mundpflegelösung. Geeignet als sanfte Alternative zur Bürste, besonders bei Bewohnern, die jede Bürste ablehnen. Eignen sich auch gut zur Schleimhautbefeuchtung. Achtung: Stäbchen ersetzen nicht das Zähneputzen, wenn noch eigene Zähne vorhanden sind.

Fingerling (Fingeraufsatz):
Ein weicher Gummiüberzug für den Zeigefinger mit Borsten oder Noppen. Gibt der pflegenden Person mehr Kontrolle und Gefühl. Manche Bewohner tolerieren den Finger besser als eine Bürste. Setzt Vertrauen voraus — langsam einführen.

Beißring / Mundöffnungshilfe:
Bei starkem Beißen zum Schutz der Pflegenden. Nur in Ausnahmefällen und mit zahnärztlicher Empfehlung verwenden.

Elektrische Kinderzahnbürste:
Kleiner Kopf, leises Surren, sanfte Vibration — für manche Bewohner angenehmer als eine Handzahnbürste.

Wir von {{praxis.name}} beraten das Team von {{pflegeheim.name}} gerne zu einem passenden Hilfsmittelset.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Hilfsmittel', 'Produkte', 'Speziell'],
  },

  // ─── Zahnmedizinische Notfalle ─────────────────────────────────
  {
    id: 'notfall-zahnschmerzen',
    category: 'notfall',
    categoryIcon: 'pi pi-exclamation-triangle',
    title: 'Akute Zahnschmerzen: Sofortmassnahmen im Heim',
    description: 'Was tun bei akuten Zahnschmerzen ausserhalb der Sprechzeiten? Schmerzmanagement und Kontaktprotokoll.',
    body: `Liebe/r {{kontakt.vorname}},

Akute Zahnschmerzen am Abend, am Wochenende oder an Feiertagen — eine Situation, die Pflegekräfte in {{pflegeheim.name}} kennen und auf die sie vorbereitet sein sollten. Hier ist ein klares Handlungsprotokoll:

Sofortmaßnahmen bei akuten Zahnschmerzen:

1. Einschätzung der Dringlichkeit:
- Schwellung im Gesicht, Kiefer oder Hals → sofortige ärztliche Vorstellung (Notaufnahme), das ist ein Notfall!
- Fieber zusätzlich zu Zahnschmerzen → ebenfalls Notaufnahme
- Starke Schmerzen ohne Schwellung → zahnärztlichen Notfalldienst kontaktieren
- Leichte bis mäßige Schmerzen → überbrücken bis zur nächsten Sprechstunde

2. Schmerzlinderung überbrücken:
- Ibuprofen 400 mg (wenn keine Gegenanzeigen) oder Paracetamol 500–1000 mg
- Immer Medikamentenliste und Vorerkrankungen prüfen
- Keine Aspirin bei Zahnschmerzen (verstärkt Blutungsneigung)
- Keine Wärmeanwendung (verstärkt Entzündung)

3. Dokumentieren:
- Zeitpunkt des Schmerzbeginns, Lokalisation, Intensität (NRS-Skala), Begleitumstände notieren

Unser Notfallkontakt:
Wir von {{praxis.name}} sind unter [Telefonnummer] erreichbar. Außerhalb unserer Öffnungszeiten ist der zahnärztliche Notfalldienst Ihres Bezirks unter der zentralen Nummer 116 117 erreichbar.

Bitte speichern Sie diese Nummer gut sichtbar im Stationszimmer von {{pflegeheim.name}} ab.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Akut', 'Schmerz', 'Erste Hilfe'],
  },
  {
    id: 'notfall-prothesenbruch',
    category: 'notfall',
    categoryIcon: 'pi pi-exclamation-triangle',
    title: 'Prothesenbruch: Was nun?',
    description: 'Erste Hilfe bei gebrochener Prothese. Wann reparierbar, wann Neufertigung noetig? Interim-Loesungen.',
    body: `Liebe/r {{kontakt.vorname}},

Eine zerbrochene Prothese ist im Pflegeheimalltag keine Seltenheit — und löst oft unnötige Panik aus. Mit dem richtigen Vorgehen lässt sich in vielen Fällen schnell geholfen werden.

Was tun, wenn eine Prothese bricht?

Schritt 1 — Alle Teile sichern:
Sammeln Sie alle Bruchstücke sorgfältig ein, auch kleine Splitter. Fehlende Fragmente können dazu führen, dass eine Reparatur nicht möglich ist. Teile in einem sauberen, trockenen Behälter aufbewahren — nicht einfach ins Wasserglas legen.

Schritt 2 — Einschätzung:
- Ist der Bruch frisch und sauber? → Reparatur oft innerhalb von 24–48 Stunden möglich
- Ist die Prothese alt und mehrfach repariert? → Neufertigung wahrscheinlich nötig
- Hat der Bewohner noch eigene Zähne? → Kauen eingeschränkt, aber kein absoluter Notfall
- Hat der Bewohner keine eigenen Zähne mehr? → Dringlichkeit höher; weiches Essen anbieten

Schritt 3 — Zahnarzt kontaktieren:
Kontaktieren Sie uns als {{praxis.name}} so früh wie möglich — idealerweise am gleichen Tag. Wir prüfen, ob eine Reparatur oder ein Expressauftrag beim Zahntechniker möglich ist.

Was Sie NICHT tun sollten:
- Prothese selbst kleben (Sekundenkleber ist giftig und verhindert professionelle Reparatur)
- Gebrochene Prothese einsetzen lassen — scharfe Kanten können die Mundschleimhaut verletzen

In der Zwischenzeit:
Weiche Kost anbieten. Den Bewohner über die Situation informieren — Geduld und Verständnis helfen.

Wir von {{praxis.name}} sind für Notfälle in {{pflegeheim.name}} da.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Prothese', 'Bruch', 'Reparatur'],
  },
  {
    id: 'notfall-blutung',
    category: 'notfall',
    categoryIcon: 'pi pi-exclamation-triangle',
    title: 'Mundblutungen bei Blutverdunner-Patienten',
    description: 'Antikoagulantien erhoehen das Blutungsrisiko. Richtiges Vorgehen bei Zahnfleischblutungen unter Marcumar/NOAKs.',
    body: `Liebe/r {{kontakt.vorname}},

Zahnfleischblutungen bei Bewohnern, die Blutverdünner einnehmen, können bedrohlich wirken — sind aber in den meisten Fällen beherrschbar, wenn das richtige Vorgehen bekannt ist. In {{pflegeheim.name}} ist das Thema Antikoagulation besonders relevant, da ein großer Teil der Bewohner entsprechende Medikamente erhält.

Häufige Blutverdünner im Pflegeheim:
- Marcumar / Phenprocoumon (Vitamin-K-Antagonist)
- NOAKs: Rivaroxaban (Xarelto), Apixaban (Eliquis), Edoxaban, Dabigatran
- Aspirin (ASS) — oft unterschätzt als Blutungsrisiko

Sofortmaßnahmen bei Mundblutungen:

1. Ruhe bewahren und Bewohner beruhigen.
2. Sterile Kompresse auf die Blutungsstelle legen — Bewohner fest darauf beißen lassen (ca. 15–20 Minuten).
3. Kein Spülen, Saugen oder Ausspucken — das löst das sich bildende Blutgerinnsel.
4. Kühlen (Eiswürfel in Tuch) von außen kann helfen.
5. Blutungsdauer dokumentieren.

Wann ist es ein Notfall?
- Blutung sistiert nicht nach 30 Minuten Kompression
- Bewohner schluckt viel Blut (Aspirationsgefahr)
- Starke Schwellung im Mund- oder Halsbereich
→ In diesen Fällen Notaufnahme aufsuchen oder 112 rufen.

Für geplante Zahnarzttermine gilt: Blutverdünner sollten in der Regel NICHT eigenständig abgesetzt werden. Wir stimmen uns als {{praxis.name}} vorab mit dem behandelnden Arzt ab.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'quartalsweise',
    tags: ['Blutung', 'Antikoagulation', 'Risiko'],
  },
  {
    id: 'notfall-abszess',
    category: 'notfall',
    categoryIcon: 'pi pi-exclamation-triangle',
    title: 'Mundabszess: Erkennen und richtig reagieren',
    description: 'Schwellung, Fieber, Schluckbeschwerden — Warnzeichen eines dentalen Abszesses und warum schnelles Handeln lebenswichtig ist.',
    body: `Liebe/r {{kontakt.vorname}},

Ein dentaler Abszess ist ein zahnmedizinischer Notfall, der rasch zu einer lebensbedrohlichen Situation werden kann. Für Pflegekräfte in {{pflegeheim.name}} ist es entscheidend, die Warnzeichen frühzeitig zu erkennen.

Was ist ein Mundabszess?
Ein Abszess ist eine abgekapselte Eiteransammlung im Zahn- oder Kieferbereich. Er entsteht meist durch eine unbehandelte Zahnentzündung oder als Folge einer tiefen Kariesläsion. Unbehandelt kann er sich auf den Kieferknochen, den Hals oder sogar das Mediastinum ausbreiten — mit lebensbedrohlichen Folgen (Ludwigs Angina, Sepsis).

Warnzeichen, die sofortiges Handeln erfordern:
- Sichtbare Schwellung im Wangen-, Kiefer- oder Halsbereich
- Schwellung, die sich rasch vergrößert
- Fieber (über 38,5°C) in Kombination mit Mundschmerzen
- Schluck- oder Atembeschwerden → sofort Notaufnahme!
- Kieferklemme (Mund kann nicht mehr vollständig geöffnet werden)
- Deutlicher Mundgeruch in Verbindung mit Schwellung

Was zu tun ist:
Bei Schwellung + Fieber + Schluckbeschwerden: Sofort 112 rufen oder Notaufnahme aufsuchen — dies duldet keinen Aufschub.

Bei Schwellung ohne Allgemeinsymptome: Noch am selben Tag zahnärztlich vorstellen. Wir von {{praxis.name}} halten Terminslots für Notfälle frei.

Was Sie NICHT tun sollten:
- Abszess aufstechen oder drücken
- Wärme anwenden (verstärkt Ausbreitung)
- Schmerzmittel als Ersatz für zahnärztliche Behandlung einsetzen

Bei Verdacht auf Mundabszess in {{pflegeheim.name}}: Bitte sofort Kontakt zu uns aufnehmen.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'quartalsweise',
    tags: ['Abszess', 'Schwellung', 'Dringend'],
  },
  {
    id: 'notfall-aspiration',
    category: 'notfall',
    categoryIcon: 'pi pi-exclamation-triangle',
    title: 'Aspirationsprophylaxe und Mundgesundheit',
    description: 'Der Zusammenhang zwischen mangelnder Mundpflege und Aspirationspneumonie — eine der haeufigsten Todesursachen in Pflegeheimen.',
    body: `Liebe/r {{kontakt.vorname}},

Aspirationspneumonie — eine Lungenentzündung durch versehentlich eingeatmete Mundflüssigkeit oder Speisereste — ist eine der häufigsten Todesursachen bei Pflegeheimbewohnern. Der direkte Zusammenhang mit schlechter Mundpflege ist durch zahlreiche Studien belegt.

Wie entsteht der Zusammenhang?
Im Mund befinden sich normalerweise Tausende von Bakterien. Bei schlechter Mundhygiene vermehren sich pathogene Keime massiv im Zahnbelag, an der Zunge und in Zahnfleischtaschen. Wenn diese bakterienreiche Flüssigkeit — auch geringe Mengen Speichel — in die Lunge gelangt (besonders nachts bei liegenden oder schluckschwachen Bewohnern), kann eine schwere Pneumonie entstehen.

Risikopatienten in {{pflegeheim.name}} besonders im Blick behalten:
- Bewohner mit Schluckstörungen (Dysphagie)
- Bettlägerige Bewohner
- Demenzkranke
- Bewohner mit Magensonde oder PEG
- Patienten nach Schlaganfall

Präventionsmaßnahmen:
1. Konsequente Mundpflege mindestens zweimal täglich — auch bei bettlägerigen Bewohnern
2. Bewohner beim Essen und Trinken aufrecht positionieren (mindestens 30–45 Grad)
3. Prothesen täglich reinigen und Mundschleimhaut befeuchten
4. Zunge reinigen (reduziert Bakterienlast signifikant)
5. Nach dem Essen Bewohner noch mindestens 30 Minuten aufrecht halten

Studien zeigen: Konsequente Mundpflege kann die Rate von Aspirationspneumonien in Pflegeheimen um bis zu 40 Prozent senken. Wir von {{praxis.name}} unterstützen Sie dabei aktiv.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Aspiration', 'Pneumonie', 'Pravention'],
  },

  // ─── Ernahrung & Mundgesundheit ────────────────────────────────
  {
    id: 'ernaehrung-zucker',
    category: 'ernaehrung',
    categoryIcon: 'pi pi-apple',
    title: 'Zucker in der Heimverpflegung: Risiken fur die Mundgesundheit',
    description: 'Versteckter Zucker in Brei, Nahrungsergaenzungen und Medikamenten. Auswirkungen auf Restzaehne und Prothesen.',
    body: `Liebe/r {{kontakt.vorname}},

Karies wird im Pflegeheim oft als Problem der Vergangenheit betrachtet — schließlich haben viele Bewohner kaum noch eigene Zähne. Doch wer noch Restzähne hat, ist durch den täglichen Zuckerkonsum stark gefährdet. Und das Problem liegt oft nicht beim offensichtlichen Zucker.

Versteckter Zucker im Pflegealltag:

Breikost und Trinknahrung:
Viele industriell hergestellten Breimahlzeiten und Trinknahrungen (z. B. Fresubin, Ensure) enthalten erhebliche Zuckermengen — oft als Maltodextrin, Glukosesirup oder Fruktose deklariert, die auf dem ersten Blick nicht als "Zucker" erkennbar sind.

Süße Medikamentensäfte:
Hustensäfte, flüssige Vitaminpräparate und viele Tropfenpräparate sind mit Zucker oder zuckerverwandten Süßungsmitteln angereichert, die kariogen wirken können — besonders problematisch bei häufiger Gabe.

Nahrungsergänzungsmittel:
Proteinpulver, Multivitaminpräparate und Aufbaupräparate enthalten oft Zucker als Geschmacksträger.

Was Sie in {{pflegeheim.name}} tun können:
- Zuckerhaltige Getränke und Säfte durch Wasser oder ungesüßten Tee ersetzen
- Zuckerhaltige Medikamente wenn möglich durch zuckerfreie Alternativen ersetzen (Rücksprache mit Arzt)
- Nach süßen Mahlzeiten oder Medikamentengaben Mund mit Wasser ausspülen lassen
- Bewohner mit Restzähnen regelmäßiger zahnärztlich kontrollieren lassen

Wir von {{praxis.name}} unterstützen Sie mit einem individuellen Beratungsgespräch für das Ernährungs- und Pflegeteam von {{pflegeheim.name}}.

Mit freundlichen Grüßen,
Ihr Team von {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Zucker', 'Ernahrung', 'Karies'],
  },
  {
    id: 'ernaehrung-konsistenz',
    category: 'ernaehrung',
    categoryIcon: 'pi pi-apple',
    title: 'Kostformen und Zahnstatus abstimmen',
    description: 'Passierte Kost, weiche Kost, Normalkost — wie der Zahnstatus die Kostform bestimmt und warum die Abstimmung mit dem Zahnarzt wichtig ist.',
    body: `Liebe/r {{kontakt.vorname}},

die Frage, welche Kostform für einen Bewohner geeignet ist, wird in Pflegeheimen häufig von Ernährungsberater:innen und Küchenpersonal entschieden — doch ein entscheidender Faktor wird dabei oft übersehen: der aktuelle Zahnstatus.

Ob ein Bewohner Normalkost kauen kann, hängt direkt davon ab, wie viele funktionsfähige Zähne noch vorhanden sind, ob eine gut sitzende Prothese getragen wird und ob schmerzfreies Kauen möglich ist. Eine lose Prothese oder ein nicht behandelter Zahnschmerz kann dazu führen, dass Bewohner auf weichere Kost ausweichen — ohne dass dies jemals dokumentiert oder zahnärztlich abgeklärt wurde.

Als {{praxis.name}} empfehlen wir: Nehmen Sie den Zahnstatus aktiv in die Kostform-Bewertung auf. Konkret bedeutet das:

- Bei jeder Kostformumstellung: zahnärztliche Rücksprache einholen
- Prothesensitz regelmäßig prüfen (mindestens einmal jährlich)
- Dokumentieren, wenn Bewohner bestimmte Lebensmittel meiden

Die Zusammenarbeit zwischen Pflege, Küchenteam und Zahnarztpraxis ist hier der Schlüssel. Wir stehen Ihnen im Rahmen unserer Kooperation jederzeit für Rückfragen zur Verfügung.

Mit freundlichen Grüßen,
Ihr Team der {{praxis.name}}`,
    frequency: 'quartalsweise',
    tags: ['Kostform', 'Kaufahigkeit', 'Abstimmung'],
  },
  {
    id: 'ernaehrung-mangelernahrung',
    category: 'ernaehrung',
    categoryIcon: 'pi pi-apple',
    title: 'Mangelernahrung durch schlechte Zahne verhindern',
    description: 'Bis zu 30% der Pflegeheimbewohner sind mangelernahrt. Schlechter Zahnstatus ist ein Hauptrisikofaktor.',
    body: `Sehr geehrte/r {{kontakt.vorname}} {{kontakt.nachname}},

Studien zeigen: Bis zu 30 % der Bewohner in deutschen Pflegeheimen sind mangelernährt oder von Mangelernährung bedroht. Ein häufig unterschätzter Faktor dabei ist der Zustand der Zähne und des Mundraums.

Fehlen Zähne oder sitzt die Prothese schlecht, können viele Lebensmittel nicht ausreichend gekaut werden. Die Folge: Bewohner meiden Fleisch, rohes Gemüse, harte Brotsorten — genau jene Lebensmittel, die wichtige Proteine, Ballaststoffe und Vitamine liefern. Langfristig entsteht ein ernährungsbedingter Teufelskreis: schlechte Mundgesundheit führt zu schlechterer Ernährung, schlechtere Ernährung schwächt die Mundschleimhäute weiter.

Was Pflegekräfte in {{pflegeheim.name}} tun können:

- MNA-Screening (Mini Nutritional Assessment) mit Zahnstatus verknüpfen
- Gewichtsverluste dokumentieren und zahnärztlich abklären lassen
- Bei Essverweigerung immer auch Zahnschmerzen als Ursache in Betracht ziehen

Als {{praxis.name}} beobachten wir bei unseren Heimbewohnern regelmäßig, wie gezielte zahnärztliche Versorgung die Nahrungsaufnahme deutlich verbessert. Sprechen Sie uns an — wir helfen gerne.

Herzliche Grüße,
Ihr Team der {{praxis.name}}`,
    frequency: 'quartalsweise',
    tags: ['Mangelernahrung', 'Gewicht', 'Screening'],
  },
  {
    id: 'ernaehrung-trinken',
    category: 'ernaehrung',
    categoryIcon: 'pi pi-apple',
    title: 'Trinkmenge und Mundgesundheit',
    description: 'Dehydration verschlechtert die Mundgesundheit drastisch. Trinkprotokolle und deren Bedeutung fur Speichelfluss und Schleimhaute.',
    body: `Liebe/r {{kontakt.vorname}},

ausreichend trinken ist für ältere Menschen lebensnotwendig — doch viele Pflegeheimbewohner trinken deutlich zu wenig. Was weniger bekannt ist: Dehydration hat direkte und schnelle Auswirkungen auf die Mundgesundheit.

Der Speichel ist das natürliche Schutzschild der Mundschleimhaut. Er neutralisiert Säuren, bekämpft Bakterien und schützt die Zahnsubstanz. Bei zu geringer Flüssigkeitszufuhr nimmt die Speichelproduktion ab — Mundtrockenheit (Xerostomie) entsteht. Die Folgen: erhöhtes Kariesrisiko, Entzündungen der Mundschleimhaut, Schluckbeschwerden und eine deutlich geringere Lebensqualität.

In {{pflegeheim.name}} können einfache Maßnahmen helfen:

- Trinkprotokolle führen und mindestens 1,5 Liter pro Tag sicherstellen
- Mundbenetzung mit feuchten Tupfern bei bettlägerigen Bewohnern
- Zuckerfreien Kaugummi anbieten (regt Speichelfluss an)
- Bei anhaltender Mundtrockenheit Medikamentenliste prüfen (viele Medikamente verstärken Xerostomie)

Als {{praxis.name}} empfehlen wir: Trinkmenge und Mundgesundheit sollten gemeinsam betrachtet werden. Wir stehen für Fragen zur Verfügung und kommen auf Wunsch direkt in Ihre Einrichtung.

Herzliche Grüße,
Ihr Team der {{praxis.name}}`,
    frequency: 'monatlich',
    tags: ['Trinken', 'Dehydration', 'Speichel'],
  },
  {
    id: 'ernaehrung-vitamine',
    category: 'ernaehrung',
    categoryIcon: 'pi pi-apple',
    title: 'Vitamin- und Mineralstoffmangel im Mund erkennen',
    description: 'B12-, Eisen- und Vitamin-C-Mangel zeigen sich oft zuerst in der Mundhoehle. Typische Anzeichen fuer Pflegekraefte.',
    body: `Sehr geehrte/r {{kontakt.vorname}} {{kontakt.nachname}},

Mängel an Vitaminen und Mineralstoffen sind bei Pflegeheimbewohnern weit verbreitet — und viele dieser Mängel zeigen sich zuerst sichtbar im Mundraum, noch bevor Laborwerte auffällig werden.

Hier die wichtigsten Zusammenhänge, die Pflegekräfte kennen sollten:

Vitamin-C-Mangel: Zahnfleischblutungen, lockere Zähne, schlecht heilende Wunden im Mund — klassische Zeichen eines Skorbut-Frühstadiums, das auch heute noch in Pflegeheimen vorkommt.

Vitamin-B12-Mangel: Brennendes Gefühl auf der Zunge (Glossodynie), glatte, rote Zunge (Hunter-Glossitis), Aphthen und Mundwinkelrhagaden.

Eisenmangel: Blasse Mundschleimhäute, Mundwinkeleinrisse, Zungenbrennen, Schluckbeschwerden.

Vitamin-D-Mangel: Erhöht das Risiko für Parodontitis und Knochenschwund im Kieferbereich.

Wenn Sie in {{pflegeheim.name}} eines dieser Zeichen beobachten, lohnt sich eine gezielte Labordiagnostik und die Rücksprache mit dem Hausarzt. Wir als {{praxis.name}} stehen Ihnen gerne zur Seite, um mundgesundheitliche Auffälligkeiten einzuordnen und an das richtige medizinische Team weiterzuleiten.

Freundliche Grüße,
Ihr Team der {{praxis.name}}`,
    frequency: 'quartalsweise',
    tags: ['Vitamine', 'Mangel', 'Diagnostik'],
  },

  // ─── Medikamente & Nebenwirkungen ──────────────────────────────
  {
    id: 'medikamente-xerostomie',
    category: 'medikamente',
    categoryIcon: 'pi pi-box',
    title: 'Top 20 Medikamente die Mundtrockenheit verursachen',
    description: 'Welche haufig verordneten Medikamente den Speichelfluss reduzieren und was Pflegekrafte dagegen tun koennen.',
    body: `Liebe/r {{kontakt.vorname}},

Mundtrockenheit ist in Pflegeheimen allgegenwärtig — und Medikamente sind in den meisten Fällen die Hauptursache. Wir möchten Ihnen heute einen praktischen Überblick geben, welche häufig verordneten Wirkstoffe den Speichelfluss reduzieren.

Die wichtigsten Substanzklassen:

- Antidepressiva (z. B. Amitriptylin, Duloxetin)
- Antihypertensiva (z. B. Ramipril, Bisoprolol)
- Diuretika (z. B. Furosemid, HCT)
- Antihistaminika (z. B. Cetirizin, Loratadin)
- Anticholinergika (z. B. Oxybutynin, Biperiden)
- Neuroleptika (z. B. Haloperidol, Quetiapin)
- Benzodiazepine
- Opioide

Je mehr Medikamente ein Bewohner einnimmt (Polypharmazie), desto wahrscheinlicher ist ein kumulativer Effekt auf den Speichelfluss.

Was hilft: regelmäßiges Mundbefeuchten, zuckerfreie Lutschpastillen, spezielle Speichelersatzmittel und eine gute Mundhygiene zur Kariesprävention.

Als {{praxis.name}} bitten wir darum: Teilen Sie uns bei Heimbesuchen die aktuelle Medikamentenliste mit. So können wir die Mundgesundheit gezielt einschätzen und präventive Maßnahmen empfehlen.

Herzliche Grüße,
Ihr Team der {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Medikamente', 'Xerostomie', 'Liste'],
  },
  {
    id: 'medikamente-zahnfleisch',
    category: 'medikamente',
    categoryIcon: 'pi pi-box',
    title: 'Medikamentoese Zahnfleischwucherungen',
    description: 'Kalziumkanalblocker, Antiepileptika und Immunsuppressiva koennen Gingivahyperplasie verursachen. Erkennung und Massnahmen.',
    body: `Sehr geehrte/r {{kontakt.vorname}} {{kontakt.nachname}},

wussten Sie, dass bestimmte Medikamente das Zahnfleisch zum Wachsen bringen können? Diese als Gingivahyperplasie bezeichnete Nebenwirkung ist in Pflegeheimen keine Seltenheit — und wird oft fälschlicherweise als "normales Zahnfleischproblem" eingestuft.

Die drei wichtigsten Wirkstoffgruppen, die Zahnfleischwucherungen verursachen können:

Kalziumkanalblocker (Herzkreislauf-Medikamente): besonders Nifedipin, Amlodipin und Verapamil. Etwa 20–50 % der Langzeitpatienten entwickeln eine Hyperplasie.

Antiepileptika: Phenytoin ist der klassische Verursacher; bis zu 50 % der Patienten sind betroffen.

Immunsuppressiva: Ciclosporin (nach Transplantation) führt häufig zu ausgeprägten Wucherungen.

Woran erkennt man es? Das Zahnfleisch erscheint vergrößert, wulstig und überwächst teilweise die Zahnoberflächen. Es ist meist nicht schmerzhaft, erhöht aber das Risiko für Entzündungen und erschwert die Mundhygiene erheblich.

Wenn Sie solche Veränderungen bei Bewohnern in {{pflegeheim.name}} beobachten, informieren Sie uns bitte — als {{praxis.name}} können wir einschätzen, ob zahnärztliche Behandlung oder eine Rücksprache mit dem verordnenden Arzt sinnvoll ist.

Mit freundlichen Grüßen,
Ihr Team der {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Zahnfleisch', 'Hyperplasie', 'Wucherung'],
  },
  {
    id: 'medikamente-bisphosphonate',
    category: 'medikamente',
    categoryIcon: 'pi pi-box',
    title: 'Bisphosphonate und Kiefernekrose: Was Pflegeheime wissen mussen',
    description: 'Viele Osteoporose-Patienten nehmen Bisphosphonate. Warum das fur zahnmedizinische Eingriffe hochrelevant ist.',
    body: `Liebe/r {{kontakt.vorname}},

ein Thema, das in der Zusammenarbeit zwischen Pflege und Zahnarztpraxis besondere Aufmerksamkeit verdient: Bisphosphonate und das Risiko einer Kiefernekrose (MRONJ — Medication-Related Osteonecrosis of the Jaw).

Bisphosphonate werden häufig bei Osteoporose, aber auch bei Knochenmetastasen eingesetzt. Typische Präparate: Alendronsäure (z. B. Fosamax), Zoledronat, Ibandronsäure. In Pflegeheimen ist ein erheblicher Anteil der Bewohner — vor allem ältere Frauen — mit diesen Medikamenten behandelt.

Das Problem: Bisphosphonate reichern sich dauerhaft im Knochen an und hemmen den Knochenumbau. Bei zahnärztlichen Eingriffen (besonders Zahnextraktionen) kann die Wundheilung erheblich gestört sein — im schlimmsten Fall entsteht ein freiliegender, nicht heilender Kieferknochen.

Was das für {{pflegeheim.name}} bedeutet:
- Teilen Sie uns bei jedem Bewohner die Bisphosphonat-Einnahme mit (Präparat und Dauer!)
- Mündlich verabreichte Bisphosphonate (z. B. Wochentabletten) sind geringer risikobehaftet als intravenöse Formen
- Präventive Maßnahmen (z. B. Zahnsteinentfernung) vor geplantem Therapiebeginn sind entscheidend

Als {{praxis.name}} nehmen wir dieses Risiko sehr ernst. Gute Kommunikation rettet hier Kiefer — und Lebensqualität.

Herzliche Grüße,
Ihr Team der {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Bisphosphonate', 'Osteoporose', 'Kiefernekrose'],
  },
  {
    id: 'medikamente-inhalativa',
    category: 'medikamente',
    categoryIcon: 'pi pi-box',
    title: 'Inhalativa und Mundpilz: Pravention nach dem Inhalieren',
    description: 'Kortisonhaltige Inhalationssprays erhoehen das Candida-Risiko. Die einfache Loesung: Mund ausspulen nach Inhalation.',
    body: `Sehr geehrte/r {{kontakt.vorname}} {{kontakt.nachname}},

viele Bewohner in Pflegeheimen leiden an COPD oder Asthma und inhalieren regelmäßig kortisonhaltige Sprays (inhalative Kortikosteroide wie Budesonid, Fluticason oder Beclometason). Diese Medikamente sind wichtig und lebensnotwendig — aber sie haben eine häufig übersehene Nebenwirkung im Mundraum.

Kortison, das sich nach dem Inhalieren an Mundschleimhaut und Rachen absetzt, unterdrückt das lokale Immunsystem. Dies führt bei einem erheblichen Teil der Dauernutzer zu einem Mundpilz (oropharyngeale Candidiasis). Typische Zeichen: weißliche Beläge auf Zunge und Wangenschleimhaut, Brennen, Schluckbeschwerden, rote Flecken im Rachen.

Die gute Nachricht: Die Prävention ist denkbar einfach.

Bitte stellen Sie sicher, dass Bewohner in {{pflegeheim.name}} nach jeder Inhalation den Mund mit Wasser ausspülen und das Wasser ausspucken. Diese einfache Maßnahme reduziert die Kortisonablagerung im Mund erheblich.

Zusätzlich gilt: Zahnprothesen nach dem Inhalieren ebenfalls reinigen, da sich Kortison auch am Prothesenkunststoff absetzt.

Als {{praxis.name}} prüfen wir bei unseren Heimbesuchen routinemäßig auf Candida-Befall. Sprechen Sie uns an, wenn Sie Auffälliges beobachten.

Freundliche Grüße,
Ihr Team der {{praxis.name}}`,
    frequency: 'quartalsweise',
    tags: ['Inhalation', 'Kortison', 'Candida'],
  },
  {
    id: 'medikamente-antikoagulation',
    category: 'medikamente',
    categoryIcon: 'pi pi-box',
    title: 'Zahnarztbesuch unter Blutverdunnung: Was beachten?',
    description: 'NOAKs, Marcumar, ASS — wann muss abgesetzt werden, wann nicht? Aktuelle Empfehlungen fur die Abstimmung mit dem Zahnarzt.',
    body: `Liebe/r {{kontakt.vorname}},

viele Bewohner nehmen gerinnungshemmende Medikamente — sei es Marcumar (Phenprocoumon), neuere orale Antikoagulanzien (NOAKs wie Rivaroxaban, Apixaban oder Dabigatran) oder Thrombozytenaggregationshemmer wie ASS oder Clopidogrel.

Vor zahnärztlichen Eingriffen stellt sich immer wieder die Frage: Muss das Medikament abgesetzt werden? Die kurze Antwort nach aktueller Leitlinienlage: In den meisten Fällen nein.

Das Absetzen von Antikoagulanzien vor zahnärztlichen Eingriffen ist oft gefährlicher als die mögliche Mehrblutung — das Thromboembolie-Risiko überwiegt in vielen Situationen.

Was jedoch wichtig ist:

- Informieren Sie uns vor jedem Besuch über alle gerinnungsaktiven Medikamente des Bewohners (Präparat, Dosis, Indikation)
- Bei Marcumar: aktuellen INR-Wert wenn möglich mitteilen (ideal: 2–3 für die meisten Eingriffe noch vertretbar)
- Bei NOAKs: Einnahmetiming beachten — wir planen den Eingriff entsprechend
- Mundblutungen nach Eingriffen: lokale Maßnahmen (Kompressen) sind fast immer ausreichend

Als {{praxis.name}} koordinieren wir dies eng mit dem behandelnden Arzt. Ihre transparente Kommunikation schützt die Bewohner von {{pflegeheim.name}} optimal.

Herzliche Grüße,
Ihr Team der {{praxis.name}}`,
    frequency: 'quartalsweise',
    tags: ['Antikoagulation', 'Blutverdunner', 'Planung'],
  },

  // ─── Recht & Kooperation ───────────────────────────────────────
  {
    id: 'recht-22a',
    category: 'recht',
    categoryIcon: 'pi pi-file-edit',
    title: 'SS22a SGB V: Kooperationsvertrag richtig umsetzen',
    description: 'Was der Kooperationsvertrag zwischen Zahnarzt und Pflegeheim beinhaltet, welche Leistungen abgedeckt sind und welche Pflichten bestehen.',
    body: `Sehr geehrte/r {{kontakt.vorname}} {{kontakt.nachname}},

seit der Einführung des §22a SGB V besteht für Zahnarztpraxen die Möglichkeit, Kooperationsverträge mit Pflegeeinrichtungen abzuschließen. Doch was genau ist darin geregelt — und was bedeutet das für den Alltag in {{pflegeheim.name}}?

Was der Kooperationsvertrag beinhaltet:

Die kooperierende Zahnarztpraxis verpflichtet sich, regelmäßige Besuche in der Pflegeeinrichtung durchzuführen. Mindestens einmal jährlich soll eine Mund- und Zahngesundheitsuntersuchung für jeden Bewohner angeboten werden. Eingriffe, die im Heim möglich sind (z. B. Prothesenkorrekturen, Zahnsteinentfernung, einfache Extraktionen), können direkt vor Ort erbracht werden.

Was die Praxis abrechnen darf:

Zahnärzte, die im Rahmen von §22a SGB V tätig sind, können spezifische Leistungspositionen abrechnen — darunter die aufsuchende Untersuchung, Wegegelder und Zuschlagsleistungen für besondere Pflegebedürftigkeit. Die Krankenkassen tragen diese Kosten.

Was das Pflegeheim beitragen muss:

Aktive Unterstützung bei der Organisation der Besuche, Information der Bewohner und Angehörigen, Bereitstellung eines geeigneten Untersuchungsraums und Übermittlung relevanter Gesundheitsinformationen.

Als {{praxis.name}} begleiten wir Sie gerne bei der Umsetzung. Sprechen Sie uns auf Optimierungsbedarf an.

Mit freundlichen Grüßen,
Ihr Team der {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['SS22a', 'Kooperation', 'Vertrag'],
  },
  {
    id: 'recht-dokumentation',
    category: 'recht',
    categoryIcon: 'pi pi-file-edit',
    title: 'Mundpflege-Dokumentation fur die MDK-Prufung',
    description: 'Was bei der MDK-Qualitaetsprufung in Bezug auf Mundgesundheit und Zahnpflege dokumentiert sein muss.',
    body: `Liebe/r {{kontakt.vorname}},

die MDK-Qualitätsprüfung stellt Pflegeheime regelmäßig auf den Prüfstand — auch in Bezug auf Mundgesundheit und Zahnpflege. Seit der Einführung des neuen Qualitätssystems (MDS-Grundsatzstellungnahme und QM-Richtlinie) ist Mundpflege explizit als Pflegeziel verankert.

Was bei der Prüfung bewertet wird:

Erstens: Ist der Mundzustand des Bewohners in der Pflegedokumentation erfasst? Dies umfasst den Zahnstatus (eigene Zähne / Prothese / zahnlos), den Pflegebedarf und eventuelle Besonderheiten wie Mundtrockenheit oder Schluckstörungen.

Zweitens: Sind Mundpflegemaßnahmen als Pflegeziel definiert und im Pflegeplan dokumentiert?

Drittens: Wird die tägliche Durchführung der Mundpflege nachvollziehbar dokumentiert — insbesondere bei Bewohnern, die keine Selbstpflege mehr leisten können?

Viertens: Gibt es eine Kooperation mit einer Zahnarztpraxis, und ist der letzte zahnärztliche Kontakt dokumentiert?

Lücken in der Dokumentation können zu Abwertungen im MDK-Bericht führen. Als {{praxis.name}} stellen wir nach jedem Besuch eine schriftliche Rückmeldung bereit, die Sie direkt in die Pflegedokumentation übernehmen können.

Sprechen Sie uns an — wir unterstützen {{pflegeheim.name}} gerne dabei, prüfsicher aufgestellt zu sein.

Herzliche Grüße,
Ihr Team der {{praxis.name}}`,
    frequency: 'quartalsweise',
    tags: ['MDK', 'Dokumentation', 'Qualitat'],
  },
  {
    id: 'recht-einwilligung',
    category: 'recht',
    categoryIcon: 'pi pi-file-edit',
    title: 'Einwilligung zur Zahnbehandlung bei nicht einwilligungsfahigen Bewohnern',
    description: 'Rechtliche Grundlagen: Betreuer, Vorsorgevollmacht, Behandlung im Notfall — wer entscheidet?',
    body: `Sehr geehrte/r {{kontakt.vorname}} {{kontakt.nachname}},

eine der häufigsten Rechtsfragen in der Zusammenarbeit zwischen Pflegeheim und Zahnarztpraxis lautet: Wer darf in eine Zahnbehandlung einwilligen, wenn der Bewohner dies selbst nicht mehr kann?

Grundsatz: Jede medizinische Behandlung bedarf der Einwilligung des Patienten. Bei fehlender Einwilligungsfähigkeit (z. B. durch fortgeschrittene Demenz) gelten folgende Regeln:

Vorsorgevollmacht: Hat der Bewohner eine Vorsorgevollmacht erteilt, kann der Bevollmächtigte in medizinische Maßnahmen einwilligen — sofern Gesundheitsangelegenheiten explizit eingeschlossen sind.

Rechtlicher Betreuer: Wenn kein Bevollmächtigter vorhanden ist, muss ein gerichtlich bestellter Betreuer einwilligen. Je nach Umfang des Betreuerauftrags kann dieser auch zahnmedizinische Entscheidungen treffen.

Notfallbehandlung: In akuten Situationen (z. B. schwerer Abszess mit Infektionsgefahr) kann ohne vorherige Einwilligung gehandelt werden, wenn Gefahr für Leib und Leben besteht. Die Maßnahme muss anschließend dokumentiert werden.

Als {{praxis.name}} bitten wir darum, dass für jeden Bewohner in {{pflegeheim.name}} hinterlegt ist, ob eine Vollmacht oder Betreuung vorliegt und wer kontaktiert werden soll. Dies erleichtert die schnelle und rechtssichere Abstimmung.

Freundliche Grüße,
Ihr Team der {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Einwilligung', 'Betreuung', 'Recht'],
  },
  {
    id: 'recht-haftung',
    category: 'recht',
    categoryIcon: 'pi pi-file-edit',
    title: 'Haftung bei mangelnder Mundpflege',
    description: 'Wann kann eine Pflegeeinrichtung haftbar gemacht werden? Praezedenzfaelle und Praeventionsstrategien.',
    body: `Liebe/r {{kontakt.vorname}},

Mundpflege ist nicht nur eine pflegerische, sondern auch eine rechtliche Pflicht. Pflegeeinrichtungen, die ihrer Sorgfaltspflicht in Bezug auf die Mundgesundheit nicht nachkommen, können haftbar gemacht werden — und Urteile hierzu nehmen in Deutschland zu.

Wann entsteht Haftungsrisiko?

Wenn Mundpflege in der Pflegedokumentation als Bedarf erkannt, aber nicht erbracht wurde. Wenn Druckstellen durch Prothesen über einen längeren Zeitraum nicht behandelt wurden. Wenn ein Mundabszess nicht rechtzeitig erkannt und zahnärztlich behandelt wurde. Wenn Bewohner aufgrund schlechter Mundgesundheit Schmerzen erlitten oder an Aspiration erkrankten, obwohl präventive Maßnahmen möglich gewesen wären.

Präventive Strategien für {{pflegeheim.name}}:

- Lückenlose Dokumentation der täglichen Mundpflege
- Regelmäßige Schulungen des Pflegepersonals
- Kooperationsvertrag mit einer Zahnarztpraxis (§22a SGB V)
- Klare Zuständigkeitsregelungen und Eskalationspfade bei Auffälligkeiten

Als {{praxis.name}} sind wir Ihr Partner für rechtssichere Mundgesundheitsversorgung. Unsere regelmäßigen Heimbesuche und Dokumentationen verringern Ihr Haftungsrisiko erheblich.

Mit freundlichen Grüßen,
Ihr Team der {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Haftung', 'Recht', 'Risiko'],
  },
  {
    id: 'recht-abrechnung',
    category: 'recht',
    categoryIcon: 'pi pi-file-edit',
    title: 'Zahnmedizinische Leistungen im Heim: Was zahlt die Kasse?',
    description: 'Uebersicht der abrechnungsfaehigen Leistungen bei Pflegeheim-Besuchen nach SS22a inkl. Wegepauschale und Zuschlaege.',
    body: `Sehr geehrte/r {{kontakt.vorname}} {{kontakt.nachname}},

ein häufiges Missverständnis in der Kooperation zwischen Pflegeheimen und Zahnarztpraxen betrifft die Kostenfrage: Was zahlt die gesetzliche Krankenversicherung bei aufsuchenden zahnärztlichen Leistungen, und was muss der Bewohner selbst tragen?

Die gute Nachricht: Die GKV übernimmt bei Pflegebedürftigen eine Reihe von Leistungen, die im Rahmen von §22a SGB V erbracht werden.

Kassenleistungen bei Heimbesuchen:

Die aufsuchende Untersuchung selbst ist abrechnungsfähig. Ein Zuschlag für die Fahrt (Wegepauschale) wird vergütet. Leistungen wie Zahnsteinentfernung, Füllungen, einfache Extraktionen, Prothesenkorrekturen und Prothesenreparaturen werden — abhängig von Versicherungsstatus und Befund — übernommen. Für Pflegebedürftige (Pflegegrad 2–5) oder Menschen mit Behinderung gibt es eigene GOZ/BEMA-Positionen.

Was nicht übernommen wird:

Hochwertige Prothetik mit Aufzahlungen, bestimmte Implantate und rein ästhetische Leistungen bleiben Privatangelegenheit.

Als {{praxis.name}} klären wir vor jedem Eingriff transparent auf, welche Kosten die Kasse übernimmt und was der Bewohner selbst zahlt. So gibt es für {{pflegeheim.name}} und die Angehörigen keine unangenehmen Überraschungen.

Herzliche Grüße,
Ihr Team der {{praxis.name}}`,
    frequency: 'quartalsweise',
    tags: ['Abrechnung', 'Kasse', 'Leistungen'],
  },

  // ─── Schulungen & Fortbildung ──────────────────────────────────
  {
    id: 'schulung-mundpflege-basics',
    category: 'schulung',
    categoryIcon: 'pi pi-book',
    title: 'Mundpflege-Schulung fur neue Pflegekrafte',
    description: 'Kompakte Schulungsunterlage fur die Einarbeitung neuer Mitarbeiter. Grundlagen der Mundpflege in 30 Minuten.',
    body: `Liebe/r {{kontakt.vorname}},

neue Pflegekräfte stehen vor vielen Aufgaben gleichzeitig — und Mundpflege gerät dabei manchmal in den Hintergrund. Dabei ist sie ein zentraler Bestandteil der Grundpflege. Mit dieser kompakten Schulungsunterlage möchten wir als {{praxis.name}} Ihnen eine praktische Orientierungshilfe geben.

Die fünf wichtigsten Grundregeln:

Zweimal täglich: Mundpflege morgens und abends — bei pflegebedürftigen Bewohnern durch das Pflegepersonal sicherstellen.

Richtige Bürste: Weiche Zahnbürste für sensibles Zahnfleisch. Elektrische Bürsten können helfen, sind aber nicht für alle Bewohner geeignet.

Fluoridhaltige Zahnpasta: Bei älteren Patienten bitte immer Erwachsenen-Zahnpasta mit 1.450 ppm Fluorid verwenden.

Prothesen: Nachts herausnehmen, mit Bürste unter fließendem Wasser reinigen (keine Zahnpasta!), in trockenem Behälter aufbewahren.

Mundschleimhaut inspizieren: Veränderungen (Rötungen, weißliche Beläge, Druckstellen) dokumentieren und zahnärztlich abklären lassen.

Bei Bewohnern, die Mundpflege ablehnen: Ruhige Ansprache, vertraute Routinen nutzen, ggf. Ablenkung durch Gespräch. Niemals mit Gewalt.

Für Rückfragen und vertiefte Schulungen steht Ihnen das Team der {{praxis.name}} jederzeit zur Verfügung. Gerne kommen wir auch persönlich in {{pflegeheim.name}}.

Herzliche Grüße,
Ihr Team der {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Einarbeitung', 'Schulung', 'Basis'],
  },
  {
    id: 'schulung-praxistag',
    category: 'schulung',
    categoryIcon: 'pi pi-book',
    title: 'Zahnarzt-Besuchstag optimal vorbereiten',
    description: 'Checkliste fur Pflegekrafte: Was vor dem Zahnarztbesuch vorbereitet sein sollte. Medikamentenliste, Prothesen, Lagerung.',
    body: `Sehr geehrte/r {{kontakt.vorname}} {{kontakt.nachname}},

ein gut vorbereiteter Zahnarzt-Besuchstag ist für alle Beteiligten ein Gewinn: Bewohner werden effizienter versorgt, und das Pflegeteam behält den Überblick. Wir möchten Ihnen heute eine praktische Checkliste an die Hand geben.

Vor dem Besuch — am Vortag:

- Liste aller Bewohner erstellen, die untersucht werden sollen (nach Priorität sortieren: Beschwerden zuerst)
- Medikamentenlisten aktualisieren und bereithalten
- Informationen zu Betreuungsverhältnis / Bevollmächtigtem prüfen
- Allergien und relevante Diagnosen (z. B. Bisphosphonate, Antikoagulation) kennzeichnen
- Prothesen beschriftet und zugeordnet bereithalten

Am Tag des Besuchs:

- Ruhigen, gut beleuchteten Untersuchungsraum oder -platz bereitstellen
- Pflegekraft als Ansprechpartner während des gesamten Besuchs
- Bewohner rechtzeitig informieren und abholen
- Nach Untersuchung: Notizen des Zahnarztes in die Pflegedokumentation übernehmen

Nach dem Besuch:

- Rückmeldungen an Betreuer / Angehörige wenn nötig
- Geplante Folgetermine koordinieren
- Auffälligkeiten aus dem Besuch im Pflegeplan aktualisieren

Als {{praxis.name}} schicken wir Ihnen im Anschluss an jeden Besuch in {{pflegeheim.name}} eine strukturierte Befundrückmeldung.

Freundliche Grüße,
Ihr Team der {{praxis.name}}`,
    frequency: 'quartalsweise',
    tags: ['Vorbereitung', 'Checkliste', 'Besuchstag'],
  },
  {
    id: 'schulung-sturzrisiko',
    category: 'schulung',
    categoryIcon: 'pi pi-book',
    title: 'Mundgesundheit und Sturzrisiko',
    description: 'Neue Studien zeigen: Schlechte Mundgesundheit erhoht das Sturzrisiko bei Senioren. Zusammenhange und Praventionsmassnahmen.',
    body: `Liebe/r {{kontakt.vorname}},

Stürze zählen zu den gefährlichsten Ereignissen in Pflegeheimen — und ein überraschend unterschätzter Risikofaktor ist schlechte Mundgesundheit. Aktuelle Studien belegen diesen Zusammenhang eindeutig.

Wie hängt das zusammen?

Erstens: Schlechte oder fehlende Zähne verändern das Kauen und die Muskelspannung im Kiefer und Nackenbereich, was die körperliche Balance beeinflussen kann.

Zweitens: Lose Prothesen führen dazu, dass Bewohner beim Gehen den Kiefer unbewusst verkrampfen — das beeinträchtigt die Haltungsstabilität.

Drittens: Chronische Mundschmerzen oder Entzündungen führen zu Schlafstörungen und erhöhter Erschöpfung — ein bekannter Sturzrisikofaktor.

Viertens: Schlechte Mundgesundheit ist mit ernährungsbedingter Muskelschwäche (Sarkopenie) assoziiert — ein direkter Sturzrisikofaktor.

Was das für {{pflegeheim.name}} bedeutet:

Integrieren Sie den Zahnstatus und Prothesenpass in Ihr Sturzrisikoassessment. Bei Bewohnern mit erhöhtem Sturzrisiko sollte zahnärztliche Versorgung aktiv mitgedacht werden.

Als {{praxis.name}} freuen wir uns über die Zusammenarbeit mit Ihrem Pflegeteam. Gemeinsam können wir Sturzrisiken ganzheitlich reduzieren.

Herzliche Grüße,
Ihr Team der {{praxis.name}}`,
    frequency: 'quartalsweise',
    tags: ['Sturz', 'Risiko', 'Forschung'],
  },
  {
    id: 'schulung-diabetes',
    category: 'schulung',
    categoryIcon: 'pi pi-book',
    title: 'Diabetes und Parodontitis: Die gefahrliche Wechselwirkung',
    description: 'Diabetiker haben ein 3x hoeheres Parodontitis-Risiko. Was das fur die Pflege bedeutet und worauf zu achten ist.',
    body: `Sehr geehrte/r {{kontakt.vorname}} {{kontakt.nachname}},

Diabetes mellitus ist in deutschen Pflegeheimen weit verbreitet — und seine Wechselwirkung mit der Mundgesundheit ist medizinisch gut belegt, in der Pflegepraxis aber oft wenig bekannt.

Die zentrale Erkenntnis: Diabetiker haben ein bis zu dreimal erhöhtes Risiko für Parodontitis. Und umgekehrt: Eine unbehandelte Parodontitis verschlechtert die Blutzuckereinstellung erheblich — ein Teufelskreis.

Warum das so ist:

Diabetes schwächt das Immunsystem und reduziert die Durchblutung im Zahnfleischgewebe. Bakterielle Entzündungen im Mund setzen Entzündungsbotenstoffe frei, die die Insulinwirkung im gesamten Körper beeinträchtigen. Eine erfolgreiche Parodontaltherapie kann den HbA1c-Wert nachweislich verbessern.

Was Pflegekräfte in {{pflegeheim.name}} tun können:

- Bei Diabetikern besonders konsequente Mundpflege und häufige Zahnfleischkontrolle
- Blutende, geschwollene oder zurückgegangene Zahnfleischränder umgehend melden
- Zahnärztliche Kontrolle halbjährlich empfehlen (statt jährlich)
- Blutzuckerentgleisungen niemals isoliert betrachten — auch an Mundinfektionen denken

Als {{praxis.name}} arbeiten wir eng mit den Hausärzten zusammen, um die Versorgung diabetischer Bewohner ganzheitlich zu sichern.

Freundliche Grüße,
Ihr Team der {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Diabetes', 'Parodontitis', 'Wechselwirkung'],
  },
  {
    id: 'schulung-palliativ',
    category: 'schulung',
    categoryIcon: 'pi pi-book',
    title: 'Mundpflege in der Palliativversorgung',
    description: 'Mundpflege am Lebensende: Lippenplege, Befeuchtung, Schmerzlinderung — wurdevolle Begleitung bis zuletzt.',
    body: `Liebe/r {{kontakt.vorname}},

Mundpflege am Lebensende gehört zu den würdevollsten und gleichzeitig anspruchsvollsten pflegerischen Aufgaben. In der Palliativversorgung verschiebt sich der Fokus: Nicht Heilung, sondern Linderung von Beschwerden und Erhalt der Lebensqualität stehen im Mittelpunkt.

Was in dieser Phase besonders wichtig ist:

Lippenpflege: Trockene, aufgesprungene Lippen bereiten Sterbenden oft erheblichen Schmerz. Regelmäßige Befeuchtung mit Lippenbalsam oder Wundsalbe ist einfach und wirksam.

Mundschleimhaut befeuchten: Wenn Schlucken nicht mehr möglich ist, feuchte Tupfer oder Mundpflegestäbchen verwenden — zuckerfreie Varianten bevorzugen. Eiswürfel in Gazetuch eingewickelt können wohltuend sein.

Prothesen: Sind Prothesen unangenehm oder nicht mehr sitzend, müssen sie nicht getragen werden. Lebensqualität hat Vorrang vor ästhetischer Norm.

Schmerzlinderung: Mundschleimhaut-Entzündungen oder Druckstellen können mit schleimhautbetäubenden Gels (z. B. Lidocain-Gel) gelindert werden.

Kommunikation: Auch wenn Bewohner nicht mehr sprechen — Mundpflege ist ein Moment der Nähe und Zuwendung. Erklären Sie leise, was Sie tun.

Als {{praxis.name}} stehen wir für Rückfragen in der Palliativsituation jederzeit zur Verfügung — auch für telefonische Beratung des Pflegeteams in {{pflegeheim.name}}.

Herzliche Grüße,
Ihr Team der {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Palliativ', 'Lebensende', 'Wurdevolle Pflege'],
  },
  {
    id: 'schulung-hygiene',
    category: 'schulung',
    categoryIcon: 'pi pi-book',
    title: 'Hygienestandards bei der Mundpflege',
    description: 'Handschuhe, Einmal-Produkte, Desinfektion — Hygienerichtlinien fur die Mundpflege im Pflegeheim nach RKI-Empfehlungen.',
    body: `Sehr geehrte/r {{kontakt.vorname}} {{kontakt.nachname}},

Hygienestandards bei der Mundpflege sind nicht nur eine Frage der Qualität, sondern des Infektionsschutzes — für Bewohner und Pflegekräfte gleichermaßen. Wir möchten Ihnen heute einen Überblick über die relevanten Empfehlungen geben.

Persönliche Schutzausrüstung:

Bei jeder Mundpflegemaßnahme sind Einmalhandschuhe Pflicht. Bei Bewohnern mit bekannten Infektionskrankheiten (z. B. MRSA, Hepatitis) zusätzlich Mund-Nasen-Schutz und ggf. Schutzbrille entsprechend RKI-Empfehlung.

Gerätehygiene:

Zahnbürsten sind personenbezogen und werden nicht geteilt. Wechsel spätestens alle drei Monate oder nach Infektionen. Prothesenbehälter täglich reinigen. Mundspülbecher ebenfalls personenbezogen oder als Einwegvariante.

Einmal-Produkte:

Mundpflegestäbchen, Zungenreiniger und Tupfer sollten als Einwegartikel eingesetzt werden. Wiederverwendbare Produkte bieten Keimübertragungsrisiko.

Desinfektion:

Arbeitsflächen vor und nach der Mundpflege desinfizieren. Bei prothesentragenden Bewohnern: Prothesenbehälter mit geeignetem Desinfektionsmittel (nicht Alkohol — kann Kunststoff angreifen) reinigen.

Als {{praxis.name}} empfehlen wir, die Hygienestandards für Mundpflege in den internen Hygieneplan von {{pflegeheim.name}} aufzunehmen und regelmäßig zu schulen. Gerne unterstützen wir Sie dabei.

Freundliche Grüße,
Ihr Team der {{praxis.name}}`,
    frequency: 'einmalig',
    tags: ['Hygiene', 'RKI', 'Standards'],
  },
]

export const getTopicsByCategory = (categoryId: string): NewsletterTopic[] =>
  NEWSLETTER_TOPICS.filter(t => t.category === categoryId)

export const getTopicById = (id: string): NewsletterTopic | undefined =>
  NEWSLETTER_TOPICS.find(t => t.id === id)
