# SolarProof — Product Requirements Document
**Single Source of Truth**

| Version | Inhalt | Datum | Status |
|---------|--------|-------|--------|
| 1.2 | Technische Spezifikation: Tool, Integrität, Kostenvergleich | 2026-04 | ✅ vollständig implementiert |
| 2.0 | Plattform: Geführter Prozess, Vector-Integration, Geschäftsmodell | 2026-05 | 🔵 Planung |

**Produkt:** SolarProof — `solarproof.voltfair.de` → Ziel: `solarproof.de`
**Owner:** Max Karastelev / maxone
**Stack:** React + Vite + TypeScript + Tailwind + Radix/shadcn, Client-only SPA, Deploy auf voltfair-cli via GitHub Actions

---

## 1. Produktvision

### v1.2 — Das Tool
SolarProof analysiert CSV-Exportdaten von Photovoltaik-Speichern (primär SENEC) und erstellt ein gerichtsverwertbares PDF-Dokument mit SHA-256-Hash und RFC 3161-Zeitstempel. Das Dokument belegt den finanziellen Schaden durch Speicherdefekte anhand der vom Hersteller selbst erhobenen Daten — ein Argument, das SENEC nicht anfechten kann, ohne die eigene Datenqualität zu entwerten.

**Kernargument:** Wenn SENEC eigene Daten für unverwertbar erklärt, können sie fremde nicht anfechten.

### v2.0 — Die Plattform
SolarProof ist kein Tool mehr. Es ist eine End-to-End-Plattform, die Menschen in einer Stresssituation — defekter Speicher, laufendes oder drohendes Gerichtsverfahren — vollständig begleitet. Von der ersten Frage bis zum Anwaltsbriefing.

**Zielgruppe:** Eltern über 60. Kein technisches Vorwissen. Keine Kenntnis von Anwaltsrecht. Haben eine teure PV-Anlage gekauft, der Speicher ist defekt, SENEC bietet Kulanz an. Sie wissen nicht ob sie annehmen sollen. Sie wissen nicht wo sie anfangen sollen.

**Das Versprechen:** "Du musst nur klicken. Wir denken für dich mit."

| Dimension | SolarProof v1 — Tool | SolarProof v2 — Plattform |
|-----------|----------------------|---------------------------|
| Nutzerführung | Nutzer muss wissen was er tut | Plattform führt Schritt für Schritt |
| Prozess | Einmaliger Export | Durchgängiger begleiteter Prozess |
| Leistungsumfang | Nur Analyse | Diagnose, Analyse, Anwalt, Briefing |
| Geschäftsmodell | Keines | Anwaltsnetzwerk, Premium, Beteiligung |
| Marke | Teil von voltfair | Eigene Marke mit eigenem Auftritt |

---

## 2. Technische Spezifikation v1.2

### 2.1 Implementierungsstand (vollständig, Stand 2026-05)

| Modul | Datei | Status | Beschreibung |
|-------|-------|--------|--------------|
| CSV-Import | `src/utils/csv.ts` | ✅ | SENEC primär; SMA, Fronius, Huawei, Kostal via Auto-Detection |
| CSV-Import UI | `src/components/CsvImport.tsx` | ✅ | Papa Parse, Drag & Drop |
| Energie-Simulation | `src/utils/simulation.ts` | ✅ | Eigenverbrauch, Speicher-Laden/Entladen, Verlust, Autarkiegrad |
| Kostenvergleich | `src/utils/cost.ts` + `CostComparison.tsx` | ✅ | BDEW-Preise 2019–2026, Strompreisbremse-Caps 2022/23 |
| Gap-Detection | `src/utils/gapDetection.ts` | ✅ | Fehlende Tage, Überlappungen, DST-Behandlung, Dedup |
| SHA-256 Hash | `src/utils/hash.ts` | ✅ | Web Crypto API, Hash der Original-CSV |
| RFC 3161 Timestamp | `src/utils/timestamp.ts` | ✅ | ASN.1 DER, FreeTSA via Proxy `panel.maxone.one/functions/v1/tsa-proxy` |
| PDF-Export | `src/utils/pdf.ts` | ✅ | jsPDF 4.x + jsPDF-autotable 5.x, SHA-256, Git-Commit, Lückenprotokoll |
| Zeitzonen | `src/utils/timezone.ts` | ✅ | DST-Transitionen, Schaltjahr, CEST/CET |
| Store | `src/store/index.ts` | ✅ | Zentraler App-State (566 Zeilen) |

### 2.2 CSV-Unterstützung

**SENEC (primär, vollständig spezifiziert):**
- Format: `date_time`, `bat_power_minus` (Entladen), `bat_power_plus` (Laden), `et_consumed`, `et_exported`, `et_produced`
- Einheiten: kWh oder kW (automatisch erkannt — kritisch: kW-Werte mit ×12 multiplizieren für 5-Minuten-Intervalle)
- Bekannter Bug aus 2026: `[kW]`-Format → 12.196-kWh-Fehler, gefixt in Commit `26d2d96`

**Andere Hersteller (implementiert, weniger getestet):**
- SMA, Fronius, Huawei, Kostal — Spalten-Mapping via Hersteller-Profile

### 2.3 Berechnungslogik

**Speicher-Simulation:**
- Modus-Erkennung: Lade/Entlade basierend auf Vorzeichen von `bat_power`
- Effizienz: 90 % Roundtrip (konfigurierbar via `efficiency`-Parameter)
- DoD/minSoC: konfigurierbar
- SoC-Carry-Over: über Tagesgrenzen korrekt fortgeführt
- Invariante: nie gleichzeitig laden + entladen

**Kostenvergleich:**
- BDEW-Durchschnittspreise ct/kWh für 2019–2026 eingebettet
- Strompreisbremse-Caps: 2022 (40 ct), 2023 (40 ct) berücksichtigt
- Einspeisung: Einspeisevergütung separat (noch nicht in `gesamtkosten_eur` eingerechnet — offene Entscheidung, siehe Abschnitt 9)
- Teilzeit-Skalierung: anteiliger Jahreswert bei nicht-vollen Jahren

**PDF-Inhalt (gerichtsverwertbar):**
- SHA-256-Hash der Original-CSV mit Dateiname + Größe
- RFC 3161-Zeitstempel (ASN.1 DER, FreeTSA)
- Git-Commit-SHA des SolarProof-Tools zur Reproduzierbarkeit
- Daten-Lückenprotokoll (fehlende Tage, Inkonsistenzen)
- Konflikt-Log (Überlappungen zwischen mehreren CSV-Dateien)
- Engine-Metadaten (Version, Berechnungsparameter)
- Charts: SoC-Verlauf, Erzeugung vs. Verbrauch

### 2.4 Test-Coverage (Stand 2026-05, alle grün)

| Datei | Tests | Scope |
|-------|------:|-------|
| `test/units.mjs` | 13 | CSV-Parsing, Power-Integration, SENEC-Woche 43/2021 Golden Reference |
| `test/cost.test.mjs` | 39 | BDEW-Katalog 2019–2026, Cap-Logik, Eigenverbrauch, Multi-Year |
| `test/simulation.test.mjs` | 38 | Batterie-Grenzen, Effizienz, Invarianten, SoC-Carry-Over |
| `test/gapDetection.test.mjs` | 39 | Lücken, Überlappungen, DST-Transition, Dedup |
| `test/extremes.test.mjs` | 44 | 0 kWp, Mini, Groß, 0/50% Speicher, keine NaN/Infinity |
| `test/dst.test.mjs` | 18 | Spring-Forward 2024-03-31, Fall-Back 2024-10-27, Schaltjahr 2024-02-29 |
| `test/annual.test.mjs` | 11 | 12.196-kWh-Regressions-Test, 365/366 Tage, synthetische Jahreskurve |
| `test/csv.test.mjs` | 47 | BOM, CRLF, Delimiter, Hersteller-Mapping, NaN-Handling |
| Smoke-Tests | 11 | Site-Reachability, Widget, CORS, Endpoints |
| **Gesamt** | **260** | |

**Noch nicht abgedeckt:** Browser-Rendering, Full-Flow CSV→PDF, Roberts Mehrjahresdaten (nur Woche 43/2021), Visual Regression.

---

## 3. Der geführte Prozess v2.0 — 5 Meilensteine

Der Nutzer bewegt sich durch fünf Meilensteine. Nach jedem Meilenstein kehrt er zu SolarProof zurück. Die Plattform ist die Zentrale — kein Medienwechsel, kein Verlust des Fadens.

| # | Meilenstein | Was passiert | Ergebnis |
|---|-------------|--------------|----------|
| 1 | Diagnose und Kulanz-Check | Ansprüche klären, SENEC-Angebot bewerten | Klare Empfehlung: annehmen oder kämpfen |
| 2 | Datenexport | Schritt-für-Schritt Anleitung SENEC-Portal | CSV-Datei liegt vor |
| 3 | SolarProof Analyse | Tool läuft, PDF wird erstellt | Gerichtsverwertbares Dokument |
| 4 | Anwalt finden | Kuratiertes Netzwerk, passender Anwalt | Anwalt identifiziert |
| 5 | Anwalt briefen | Automatisches Briefing-Paket | Nutzer schickt ab, Anwalt informiert |

> **Meilenstein 3 ist vollständig implementiert** (v1.2). Die anderen vier Meilensteine sind v2.0-Scope.

### 3.1 Meilenstein 1 — Diagnose und Kulanz-Check

**Teil A: Ansprüche klären**

Vector führt durch einen Fragenkatalog. Die Antworten bestimmen automatisch welche Ansprüche relevant sind.

| Frage | Warum relevant |
|-------|----------------|
| Kaufdatum der Anlage | Garantiefrist: 2 Jahre gesetzlich, häufig 5–10 Jahre vertraglich |
| SENEC-Modell | Bestimmte Modelle mit bekannten Seriendefekten |
| Art des Defekts | Totalausfall vs. Teilausfall bestimmt Schadenshöhe |
| Bereits mit SENEC kommuniziert? | Fristen und Dokumentation prüfen |
| Kulanzangebot erhalten? | Wenn ja: Weiterleitung zu Teil B |
| Anlagenwert und Kreditlaufzeit | Grundlage für Schadensberechnung |

Ausgabe: Übersicht der relevanten Ansprüche in Klarsprache. Hinweis dass ein Anwalt für verbindliche Einschätzung benötigt wird.

**Teil B: Kulanz-Check**

SENEC-Kulanzangebote sind oft so formuliert, dass sie attraktiv wirken aber alle weiteren Ansprüche abschneiden.

Logik:
1. Nutzer gibt Kulanzangebot ein (Betrag, enthaltene Leistungen, Bedingungen)
2. System vergleicht mit typischen SENEC-Kulanzpaketen aus bekannten Fällen
3. Berechnung: Angebotswert vs. geschätzter Gesamtschaden aus Teil A
4. Ausgabe: Ampel-Bewertung

| Ampel | Bedeutung | Empfehlung |
|-------|-----------|------------|
| 🟢 Grün | Angebot deckt >90 % des geschätzten Schadens | Annehmen — rechtlicher Aufwand lohnt nicht |
| 🟡 Gelb | Angebot deckt 50–90 % des Schadens | Anwalt konsultieren vor Entscheidung |
| 🔴 Rot | Angebot <50 % oder mit Verzichtsklausel | Ablehnen — weiterkämpfen lohnt sich |

> Kein Kulanzangebot annehmen bevor dieser Check durchgeführt wurde.

### 3.2 Meilenstein 2 — Datenexport

**SENEC-Export (primär implementiert):**

| Schritt | Aktion | Hilfestellung |
|---------|--------|---------------|
| 1 | mein-senec.de aufrufen | Screenshot des Login-Bildschirms |
| 2 | Mit Zugangsdaten einloggen | Passwort-Reset Anleitung |
| 3 | Bereich Auswertungen öffnen | Screenshot mit Pfeil-Markierung |
| 4 | Zeitraum wählen (gesamter Schadenszeitraum) | Empfehlung: mindestens 12 Monate |
| 5 | Export als CSV auslösen | Screenshot des Export-Buttons |
| 6 | Datei speichern | Empfohlener Name: `SENEC_Export_YYYY-MM.csv` |
| 7 | Zurück zu SolarProof: Datei hochladen | Weiterleitung zu Meilenstein 3 |

**Häufige Probleme:**
- Kein Zugang: Anleitung für Zugangsdaten-Reset
- Export-Button nicht sichtbar: Alternativweg für ältere SENEC-Modelle
- Datei leer/fehlerhaft: Hinweis dass lückenhafte Portaldaten bereits ein Argument sind

**Andere Hersteller (spätere Phase):** SMA (Sunny Portal), Fronius (Solar.web), Huawei (FusionSolar), Kostal (Solar Portal)

### 3.3 Meilenstein 3 — SolarProof Analyse

**Vollständig implementiert in v1.2.** Neu in v2.0:
- Vector begleitet die Parametereingabe mit erklärenden Texten
- Nach PDF-Export: automatische Weiterleitung zu Meilenstein 4
- Meilenstein-Badge: "Nachweis erstellt" in der Prozessleiste

### 3.4 Meilenstein 4 — Anwalt finden

Kuratiertes Anwaltsnetzwerk. Kein bezahltes Ranking. Relevanz basiert auf Erfahrung mit SENEC- und PV-Fällen.

**Matching-Logik:**
- Region (PLZ-basiert)
- Schadenshöhe aus Meilenstein 1
- Ob Kulanzangebot vorliegt
- Bevorzugter Kommunikationsweg: Telefon, E-Mail, Video

**Anwaltsprofil:** Name, Kanzlei, Standort, Schwerpunkte, bekannte SENEC-Fälle (anonymisiert), Erstberatungsgebühr, Community-Bewertungen.

Gelistete Anwälte zahlen eine monatliche Listinggebühr oder Cost-per-Lead. Rechtliche Prüfung erforderlich vor Launch (BRAO § 49b).

### 3.5 Meilenstein 5 — Anwalt briefen

Das Briefing-Paket wird automatisch zusammengestellt.

**Inhalt:**
- SolarProof PDF (Meilenstein 3)
- Fallzusammenfassung: Ansprüche, Schadenshöhe, Zeitraum (Meilenstein 1)
- Kulanz-Check-Ergebnis falls vorhanden
- Empfohlene erste Schritte für den Anwalt

**Versandoptionen:**
- E-Mail direkt aus SolarProof (vorausgefüllte Vorlage)
- Download als ZIP
- Direktverbindung zu Anwalt-Buchungskalender (falls vorhanden)

---

## 4. Vector-Integration

### 4.1 Automatisierte Flows — kein Token-Burn

Vorkonfigurierte Antworten basierend auf Prozessschritt und Nutzereingaben. Kein echter KI-Aufruf.

| Situation | Vector-Verhalten |
|-----------|-----------------|
| Nutzer erreicht neuen Meilenstein | Erklärung was als nächstes kommt |
| Fehler bei CSV-Upload | Fehlermeldung mit Lösung |
| Parametereingabe Speicher | Tooltips und Erklärungen |
| FAQ-Muster | Antworten aus Wissensbasis |
| Anwalt ausgewählt | Bestätigung und nächster Schritt |
| Meilenstein abgeschlossen | Glückwunsch-Feedback |

### 4.2 Echter KI-Einsatz — nur wo nötig

| Situation | Warum echter KI-Einsatz |
|-----------|------------------------|
| Kulanz-Check: individuelles Angebot bewerten | Jedes Angebot ist anders |
| Nutzer beschreibt unbekanntes Problem | Keine vorkonfigurierte Antwort möglich |
| Premium: persönliche Fallbegleitung | Individuelle Beratung auf Basis aller Nutzerdaten |
| Anwaltsbriefing verfassen | Individueller Falltext |

**Faustregel:** Prozessposition abhängig aber nicht vom individuellen Inhalt → vorkonfiguriert. Individuellen Inhalt verstehen nötig → echter KI-Einsatz.

**Technische Umsetzung:** Claude Code CLI als Subprocess (kein Anthropic API-Key, kein SDK — `claude -p "<prompt>" --output-format text` via Edge Function oder Supabase Function).

### 4.3 Prozessleiste

Oben auf jeder Seite: 5-Schritt-Fortschrittsleiste. Immer sichtbar.
- Erledigter Schritt: grün mit Haken, anklickbar
- Aktueller Schritt: blau aktiv
- Zukünftiger Schritt: grau, nicht anklickbar (linearer Prozess)
- Mobile: kollabiert zu "Schritt X von 5"

Persistenz: `localStorage` (kein Backend-Zwang für Basis-Flow)

---

## 5. Marke und Positionierung

| Attribut | Definition |
|----------|-----------|
| Name | SolarProof |
| Tagline | Dein Speicher ist defekt. Dein Recht nicht. |
| Tonalität | Ehrlich, klar, keine Versprechen, auf Augmaß mit dem Nutzer |
| Zielgruppe | 60+ ohne technisches Vorwissen, SENEC-Geschädigte |
| Positionierung | End-to-End Begleitung, nicht nur Tool |
| Domain jetzt | solarproof.voltfair.de |
| Domain Ziel | solarproof.de |

### Landing Page

- **Hero:** Dein Speicher ist defekt. Dein Recht nicht.
- **Problem:** Eigene Berechnungen werden von SENEC angefochten — nicht weil sie falsch sind
- **Das SENEC-Argument:** Wenn SENEC eigene Daten für unverwertbar erklärt, können sie fremde nicht anfechten
- **Wie es funktioniert:** 5 Meilensteine in einfacher Sprache
- **Warum es standhält:** SHA-256, RFC 3161, Open Source, reproduzierbar
- **Ehrliche Einschränkung:** SolarProof ersetzt keinen Sachverständigen. Es ist dein erster Schritt.
- **FAQ:** Muss ich einen Sachverständigen einschalten? Welche Hersteller? Sind meine Daten sicher?

---

## 6. Geschäftsmodell

### 6.1 Anwaltsnetzwerk

Anwälte listen sich im SolarProof-Netzwerk. SolarProof liefert qualifizierte Leads: Nutzer die bereits alle Unterlagen zusammen haben und aktiv einen Anwalt suchen.

| Modell | Beschreibung |
|--------|-------------|
| Monatliches Listing | Pauschalgebühr für Eintrag |
| Cost-per-Lead | Gebühr pro weitergeleiteten Kontakt |
| Premium-Placement | Höhere Sichtbarkeit im Matching |

Rechtliche Prüfung vor Launch: BRAO § 49b gilt für Anwälte, nicht für Vermittlungsplattformen. Vergleichsmodell: anwalt.de, advocado.

### 6.2 Premium

| Tier | Inhalt | Preis |
|------|--------|-------|
| Basis (kostenlos) | Alle 5 Meilensteine mit automatisierten Flows | — |
| Premium (bezahlt) | Individuelle Fallanalyse durch Vector, priorisiertes Matching, unbegrenzte Rückfragen | Einmalig pro Fall oder Abo |

Zahlungsabwicklung: **Mollie** (kein Stripe).

### 6.3 Beteiligungsmodell

Selektiv für starke Fälle mit klarer Beweislage und Schadenshöhe über Schwellenwert.
- Rechtliche Struktur: als Dienstleister für Dokumentation und Vorbereitung, nicht als Anwalt
- Vertrag mit dem fall­führenden Anwalt
- **Erst angehen nach ersten etablierten Fällen und funktionierendem Netzwerk.**

---

## 7. Technische Architektur v2.0

| Komponente | Beschreibung | Implementierungsstand |
|------------|--------------|----------------------|
| Prozessleiste | Zustandsmaschine: 5 Meilensteine, linear, localStorage-Persistenz | 🔵 v2.0 |
| Diagnose-Modul | Fragekatalog mit Entscheidungsbaum, kein KI-Einsatz | 🔵 v2.0 |
| Kulanz-Check | Eingabe + Regelwerk + Ampel-Ausgabe, kein KI-Einsatz | 🔵 v2.0 |
| Export-Anleitung | Statische Schritt-für-Schritt Seiten mit Screenshots | 🔵 v2.0 |
| SolarProof Analyse-Tool | CSV-Import, Simulation, SHA-256, RFC 3161, PDF | ✅ v1.2 |
| Anwaltsnetzwerk | Datenbank (Supabase) mit Filterfunktion, PLZ-Matching | 🔵 v2.0 |
| Briefing-Generator | Template-Engine für automatisches Briefing-Paket | 🔵 v2.0 |
| Vector Flows | Vorkonfigurierte Dialogbäume — kein Token-Burn | 🔵 v2.0 |
| Vector KI | Echter CLI-Einsatz für individuelle Anfragen | 🔵 v2.0 |
| Backend | Supabase — Anwaltsdaten, Nutzerfeedback, Lead-Tracking | 🔵 v2.0 |

**Deployment:** voltfair-cli (46.225.107.118), Traefik als Reverse Proxy, DNS-01 TLS via INWX, GitHub Actions CI (ubuntu-latest, node:24-alpine Docker Build, SSH-Transfer).

---

## 8. Implementierungsreihenfolge v2.0

| Phase | Meilenstein | Aufgabe | Priorität |
|-------|-------------|---------|-----------|
| 1 | Rahmen | Prozessleiste mit 5 Schritten und Zustandsmaschine | Pflicht |
| 2 | M1 | Diagnose-Fragekatalog mit Anspruchs-Ausgabe | Pflicht |
| 2 | M1 | Kulanz-Check mit Ampel-Bewertung | Pflicht |
| 3 | M2 | SENEC Export-Anleitung mit Screenshots | Pflicht |
| 4 | M3 | SolarProof Tool in Prozess integrieren (bereits fertig) | Pflicht |
| 5 | M4 | Anwaltsnetzwerk: Datenbank und Matching | Pflicht |
| 6 | M5 | Briefing-Generator: automatisches Paket | Pflicht |
| 7 | Vector | Automatisierte Flows für alle Meilensteine | Pflicht |
| 8 | Vector | Echter KI-Einsatz: Kulanz-Check und Premium | Pflicht |
| 9 | Business | Anwaltsnetzwerk-Onboarding und Gebührenstruktur | Pflicht |
| 10 | Business | Premium-Modell aktivieren | Optional |
| 11 | Business | Beteiligungsmodell: erst nach ersten Fällen | Später |

---

## 9. Offene Entscheidungen

Diese Fragen sind aus der Test- und Implementierungsarbeit entstanden. Antworten von Max benötigt bevor die entsprechenden Features weiterentwickelt werden.

| # | Frage | Bereich | Priorität |
|---|-------|---------|-----------|
| 1 | `einspeiseverguetung_eur` ist aktuell nicht in `gesamtkosten_eur` eingerechnet — beabsichtigt? | `cost.ts` | Hoch |
| 2 | Jahr ohne BDEW-Preis (z.B. 2027+): Fehler werfen oder Jahr überspringen? | `cost.ts` | Mittel |
| 3 | `einspeisung > erzeugung` — hard error, warning oder clamp auf 0? | `simulation.ts` | Mittel |
| 4 | `kapazitaet_kwh = 0` — aktuell Crash-Risiko. Welches Verhalten ist gewollt? | `simulation.ts` | Hoch |
| 5 | Roberts 2024/2025-CSVs verfügbar für Golden-Reference-Tests? | Testing | Niedrig |
| 6 | `VectorChat.tsx` (375 Zeilen, laut Code-Stand unused) — löschen? | Cleanup | Niedrig |
| 7 | `double_hour`-Warnung in `timezone.ts` — toter Code oder bewusst behalten? | Cleanup | Niedrig |

---

## 10. Datenschutz und Compliance

- **Personenbezogene Daten in v1.2:** keine — reines Client-side-Tool, keine Daten verlassen den Browser
- **v2.0 Supabase-Backend:** bei Einführung von Anwaltsnetzwerk und Lead-Tracking: AVV mit Hetzner (vorhanden), DSGVO Art. 13/14 Informationspflichten prüfen, DSFA bei sensiblen Falldaten evaluieren
- **Anwaltsnetzwerk:** BRAO § 49b vor Launch klären
- **Hosting:** Hetzner EU, DPA geprüft
- **TLS:** DNS-01 via INWX, kein HTTP-01

---

## 11. Changelog

| Datum | Version | Was |
|-------|---------|-----|
| 2026-04 | 1.0 | Erste Version: CSV-Import, Simulation, PDF |
| 2026-04 | 1.1 | Kostenvergleich, Multi-Hersteller, DST-Fixes |
| 2026-05 | 1.2 | SHA-256, RFC 3161, vollständige Test-Coverage (260 Tests) |
| 2026-05 | 2.0 | Plattform-Vision: 5 Meilensteine, Vector, Geschäftsmodell |

---

*Letzte Aktualisierung: 2026-05-12 — SolarProof PRD SSoT*
