# SolarProof — Vollständige Produktdokumentation
**Single Source of Truth**

| Version | Inhalt | Datum | Status |
|---------|--------|-------|--------|
| 1.0 | Initiale Spezifikation | 2025 | ✅ |
| 1.1 | Integritätssicherung, Spalten-Mapping, Zeitzonen, Multi-File | 2025 | ✅ |
| 1.2 | SoC Carry-Over, DateTime-Feld, Duplikaterkennung, Akku-Spalten, Kostenvergleich | 2026 | ✅ vollständig implementiert |
| 2.0 | Plattform: Geführter Prozess, Vector-Integration, Geschäftsmodell | 2026 | 🔵 M1–M5 + Phase 7–8 gebaut, Phase 9–11 offen |
| Nachtrag | OLG Hamm 11.04.2025 — Landing Page + Kulanz-Check Anpassung | 2026 | ✅ implementiert |

**Produkt:** SolarProof — `solarproof.voltfair.de` → Ziel: `solarproof.de`
**Eigentümer:** Max Karastelev + Robert (50/50)
**Stack:** React + Vite + TypeScript + Tailwind + Radix/shadcn, Client-only SPA, Deploy auf voltfair-cli via GitHub Actions
**Repo:** `maxone-one/solarproof` (ehem. `Isgart1984/pv-analyse-pro`)

> **Kontext:** Robert ist Mitgründer von SolarProof und Kläger im Verfahren OLG Hamm Az. 2 U 5/25. Der Nachweis, den SolarProof erstellt, fließt direkt in dieses Verfahren ein.

---

# Teil 1 — Technische Spezifikation v1.2

## 1. Produktvision

### v1.2 — Das Tool

SolarProof analysiert CSV-Exportdaten von Photovoltaik-Speichern (primär SENEC) und erstellt ein gerichtsverwertbares PDF-Dokument mit SHA-256-Hash und RFC 3161-Zeitstempel. Das Dokument belegt den finanziellen Schaden durch Speicherdefekte anhand der vom Hersteller selbst erhobenen Daten.

**Kernargument:** Wenn SENEC eigene Daten für unverwertbar erklärt, können sie fremde nicht anfechten.

**Philosophie:** Klarer Fokus auf Schadensnachweis für Gerichtsverfahren. Nur das Notwendige.

**Kernfunktionen:**
- Multi-File CSV-Import mit interaktivem Spalten-Mapping und Auto-Accept
- Kombiniertes DateTime-Feld für SMA, Fronius und andere Hersteller ★
- Duplikaterkennung beim Upload mit Nutzer-Dialog ★
- Zeitzonenbehandlung (Europe/Berlin, UTC intern, DST-Warnung)
- SHA-256-Hash jeder Quelldatei via Web Crypto API
- Datenvollständigkeitsanalyse: Lücken, Intervalle, Überlappungen
- Speichersimulation mit SoC Carry-Over über Tagesgrenzen ★
- Akku Beladung / Entladung als optionale Tabellenspalten ★
- Kalender + Tagesdetail-Modal mit Charts
- PDF-Export: rechtssicher, SHA-256, RFC 3161, Engine-Version, Lückenprotokoll
- Landing Page als Fullscreen Overlay (PLG — Tool-first)
- Kostenvergleich: Anlage vs. Netzbezug ★

### v2.0 — Die Plattform

SolarProof ist kein Tool mehr. Es ist eine End-to-End-Plattform, die Menschen in einer Stresssituation vollständig begleitet — von der ersten Frage bis zum Anwaltsbriefing.

**Zielgruppe:** Eltern über 60. Kein technisches Vorwissen. Kein Wissen über Anwaltsrecht. Haben eine teure PV-Anlage gekauft, der Speicher ist defekt, SENEC bietet Kulanz an. Sie wissen nicht ob sie annehmen sollen. Sie wissen nicht wo sie anfangen sollen.

**Das Versprechen:** „Du musst nur klicken. Wir denken für dich mit."

| Dimension | v1 — Tool | v2 — Plattform |
|-----------|-----------|----------------|
| Nutzerführung | Nutzer muss wissen was er tut | Plattform führt Schritt für Schritt |
| Prozess | Einmaliger Export | Durchgängiger begleiteter Prozess |
| Leistungsumfang | Nur Analyse | Diagnose, Analyse, Anwalt, Briefing |
| Geschäftsmodell | Keines | Anwaltsnetzwerk, Premium, Beteiligung |
| Marke | Teil von voltfair | Eigene Marke mit eigenem Auftritt |

---

## 2. Technischer Stack

| Bereich | Aktuell |
|---------|---------|
| Framework | React + Vite + TypeScript |
| Styling | Tailwind CSS + Radix UI + shadcn |
| CSV-Verarbeitung | PapaParse |
| PDF-Generierung | jsPDF 4.x + jsPDF-autotable 5.x |
| Kryptografie | Web Crypto API (SHA-256, nativ) |
| Zeitstempel | RFC 3161 via FreeTSA, Proxy `panel.maxone.one/functions/v1/tsa-proxy` |
| State | Zustand (IndexedDB-Persistenz) |
| Hosting | voltfair-cli (46.225.107.118), Traefik, GitHub Actions CI |

---

## 3. CSV-Import

### 3.1 Spalten-Mapping mit Auto-Accept

- **Alle erkannt:** Grüne Meldung + dezenter Link „Manuell anpassen →"
- **Teilerkennung:** Nur nicht erkannte Felder als Dropdown
- **Erkannte Felder:** Grüne Zeile ohne Interaktion — keine unnötige Friction

### 3.2 Kombiniertes DateTime-Feld ★

SMA, Fronius und andere Hersteller liefern Datum und Uhrzeit in einer Spalte.

| Interner Name | Beschreibung |
|---------------|-------------|
| `datum_uhrzeit` | Kombiniertes Feld — alternativ zu `datum` + `uhrzeit` |
| `datum` | Nur Datum: DD.MM.YYYY oder YYYY-MM-DD |
| `uhrzeit` | Nur Uhrzeit: HH:MM oder HH:MM:SS |

**Unterstützte Formate:**

| Format | Beispiel |
|--------|---------|
| DD.MM.YYYY HH:MM | 05.02.2026 14:30 |
| DD.MM.YYYY HH:MM:SS | 05.02.2026 14:30:00 |
| YYYY-MM-DD HH:MM:SS | 2026-02-05 14:30:00 |
| YYYY-MM-DDTHH:MM:SS | 2026-02-05T14:30:00 |
| YYYY-MM-DDTHH:MM:SSZ | 2026-02-05T14:30:00Z |
| DD/MM/YYYY HH:MM | 05/02/2026 14:30 |

Alle geparsten Zeitstempel sofort in UTC konvertieren via `zonedTimeToUtc` mit `Europe/Berlin`.

### 3.3 Duplikaterkennung beim Upload ★

| Szenario | Aktion |
|----------|--------|
| Keine Duplikate | Normaler Import, kein Dialog |
| Teilduplikate | Dialog: „X Einträge bereits vorhanden." → [Nur neue] [Alle ersetzen] [Abbrechen] |
| Vollständiges Duplikat | Warnung: „Diese Datei wurde bereits vollständig importiert." → [Trotzdem ersetzen] [Abbrechen] |

Timestamps für Duplikatprüfung auf Minutengenauigkeit runden — Sekunden ignorieren.

### 3.4 Unterstützte Hersteller

**SENEC (primär, vollständig spezifiziert):**
- Felder: `date_time`, `bat_power_minus`, `bat_power_plus`, `et_consumed`, `et_exported`, `et_produced`
- Einheiten: kWh oder kW (auto-erkannt — kW-Werte ×12 bei 5-Minuten-Intervallen)
- Bekannter Bug: `[kW]`-Format → 12.196-kWh-Fehler, gefixt Commit `26d2d96`

**Andere Hersteller (implementiert, weniger getestet):** SMA, Fronius, Huawei, Kostal — Spalten-Mapping via Hersteller-Profile.

---

## 4. Speichersimulation

### 4.1 Parameter

| Parameter | Standard | Einheit |
|-----------|---------|---------|
| Speicherkapazität | 10 | kWh |
| Entladetiefe (DoD) | 90 | % |
| Ladewirkungsgrad | 95 | % |
| Entladewirkungsgrad | 95 | % |
| Anfangs-SoC | 0 | % (nur erster Tag) |

### 4.2 SoC Carry-Over ★

- Anfangs-SoC gilt nur für den allerersten Tag
- Jeder Folgetag startet mit dem letzten SoC-Wert des Vortags
- Simulation läuft einmal chronologisch — kein Tages-Reset
- „Simulation zurücksetzen"-Button startet neu mit konfiguriertem Anfangs-SoC
- Lücke im Datensatz: SoC fortschreiben + Warnung

### 4.3 Akku-Spalten in der Tagesübersicht ★

| Spalte | Feldname | Standard |
|--------|---------|----------|
| Akku Beladung | `akku_ladung_kwh` | ausgeblendet |
| Akku Entladung | `akku_entladung_kwh` | ausgeblendet |
| Speicher % | `speicher_soc_pct` | sichtbar |

Tagesübersichtszeile (fett): Summe Beladung, Summe Entladung, SoC am Tagesende.

---

## 5. Integritätssicherung

### 5.1 SHA-256 Hash

- Web Crypto API, kein externer Dienst
- Jede Quelldatei bekommt einen eigenen Hash
- PDF: Dateiname, Dateigröße, SHA-256, Importzeitpunkt pro Datei

### 5.2 RFC 3161 Trusted Timestamp

- PDF-Hash → TSA (FreeTSA) → .tsr-Token
- Download-Bundle: PDF + .tsr-Datei
- EU eIDAS-konform
- Proxy: `panel.maxone.one/functions/v1/tsa-proxy`

### 5.3 Engine-Versionierung

- Version + Git-Commit-Hash im PDF (`VITE_GIT_COMMIT` via Build-Injektion)
- Simulation jederzeit reproduzierbar — auch Jahre später

---

## 6. Datenvollständigkeitsanalyse

- **Fehlende Tage:** Kalendervergleich zwischen aufeinanderfolgenden Datentagen
- **Fehlende Intervalle:** Median-basiert — typisches Intervall erkennen, Lücken > 2× melden
- **DST-bedingte Lücken:** Separat klassifiziert — kein falscher Alarm
- **Überlappungen:** Erste Datei gewinnt, mit Quelldatei-Attribution im Protokoll
- **Simulation:** Läuft nur auf vorhandenen Daten — keine stille Interpolation

---

## 7. PDF-Export

- Deckblatt: Anlagenname, Monat, Erstellungsdatum
- Alle Quelldateien mit Name, Größe und SHA-256 einzeln aufgelistet
- Alle Simulationsparameter dokumentiert
- Engine-Version + Git-Commit-Hash
- Abschnitt „Datenvollständigkeit — Lückenprotokoll"
- RFC 3161 .tsr-Token im Download-Bundle
- Hinweis: „Parameter vom Nutzer festgelegt — Validierung durch Sachverständigen empfohlen"

---

## 8. Kostenvergleich: Anlage vs. Netzbezug

**Kernfrage:** Wäre es günstiger gewesen, den Strom einfach zu kaufen?

**Hauptaussage:** „Für Ihre Gesamtkosten von X € hätten Sie Y kWh Strom aus dem Netz kaufen können. Sie haben Z kWh selbst erzeugt und genutzt."

### 8.1 Kosteneingaben

| Kategorie | Typ |
|-----------|-----|
| Kreditrate | EUR/Monat |
| Nachzahlung Versorger | EUR/Jahr |
| Rückerstattung Versorger | EUR/Jahr |
| Wartung & Reparatur | EUR/Jahr |
| Cloud-Speicher-Abo | EUR/Monat |

### 8.2 BDEW-Strompreise

| Jahr | BDEW ct/kWh | Deckelung | Effektiv |
|------|------------|-----------|---------|
| 2019 | 31,20 | — | 31,20 |
| 2020 | 32,30 | — | 32,30 |
| 2021 | 32,80 | — | 32,80 |
| 2022 | 46,30 | 40,00 | 40,00 |
| 2023 | 47,00 | 40,00 | 40,00 |
| 2024 | 40,20 | — | 40,20 |
| 2025 | 39,30 | — | 39,30 |
| 2026 | 37,20 | — | 37,20 |

Toggle pro Jahr: Preisdeckelung aktiv/inaktiv. 2022 und 2023 standardmäßig mit 40 ct vorbelegt.

### 8.3 Ausgabe

| Kennzahl | Beschreibung |
|----------|-------------|
| Eigenverbrauch kWh | Selbst genutzter PV-Strom aus CSV |
| Gesamtkosten EUR | Alle Kostenpositionen summiert |
| Äquivalenter Netzstrom kWh | Gesamtkosten ÷ BDEW-Preis |
| Differenz kWh | Eigenverbrauch − Äquivalent |
| Bewertung | Grün: Anlage günstiger / Rot: Netz wäre günstiger |

---

## 9. Implementierungsstand v1.2 (alle Features ✅)

| Modul | Datei | Tests |
|-------|-------|-------|
| CSV-Import + Parsing | `src/utils/csv.ts` | 47 Tests ✅ |
| Energie-Simulation | `src/utils/simulation.ts` | 42 Tests ✅ |
| Kostenvergleich | `src/utils/cost.ts` | 39 Tests ✅ |
| Gap-Detection | `src/utils/gapDetection.ts` | 39 Tests ✅ |
| Zeitzonen | `src/utils/timezone.ts` | 18 DST Tests ✅ |
| SHA-256 | `src/utils/hash.ts` | indirekt ✅ |
| RFC 3161 | `src/utils/timestamp.ts` | indirekt ✅ |
| PDF-Export | `src/utils/pdf.ts` | — |
| Extremwerte | — | 44 Tests ✅ |
| Jahres-Regression | — | 11 Tests ✅ |
| Smoke | `test/smoke.mjs` | 11 Tests ✅ |
| **Gesamt** | | **273/273** |

---

## 10. Offene Entscheidungen (v1.2)

| # | Frage | Priorität | Entscheidung |
|---|-------|-----------|-------------|
| 1 | `einspeiseverguetung_eur` nicht in `gesamtkosten_eur` — beabsichtigt? | Hoch | ✅ Beabsichtigt — `gesamtkosten_eur` zeigt Bruttokosten ohne Einspeisvergütungsabzug. Konservative Annahme zugunsten des Schadensanspruchs. |
| 2 | Jahr ohne BDEW-Preis (z.B. 2027+): Fehler oder überspringen? | Mittel | Offen — aktuell stilles `continue`; bei Bedarf Warnung ergänzen |
| 3 | `einspeisung > erzeugung` — hard error, warning oder clamp? | Mittel | Offen |
| 4 | `kapazitaet_kwh = 0` — Verhalten definieren (Crash-Risiko) | Hoch | ✅ Gefixt — `runSimulation` gibt `[]` zurück; `DayDetailModal` nutzt `cap = kwh \|\| 1` |
| 5 | Roberts 2024/2025-CSVs für Golden-Reference-Tests verfügbar? | Niedrig | Offen |
| 6 | `VectorChat.tsx` (375 Zeilen, unused) — löschen? | Niedrig | ✅ Datei existiert nicht mehr |

---

# Teil 2 — PRD v2.0: Von Tool zu Plattform

## 11. Der geführte Prozess — 5 Meilensteine

| # | Meilenstein | Was passiert | Ergebnis | Status |
|---|------------|-------------|---------|--------|
| 1 | Diagnose & Kulanz-Check | Ansprüche klären, SENEC-Angebot bewerten | Klare Empfehlung | 🔵 Phase 2 |
| 2 | Datenexport | Schritt-für-Schritt Anleitung SENEC-Portal | CSV liegt vor | 🔵 Phase 3 |
| 3 | SolarProof Analyse | Tool läuft, PDF wird erstellt | Gerichtsverwertbares Dokument | ✅ fertig |
| 4 | Anwalt finden | Kuratiertes Netzwerk, Matching | Anwalt identifiziert | 🔵 Phase 5 |
| 5 | Anwalt briefen | Automatisches Briefing-Paket | Nutzer schickt ab | 🔵 Phase 6 |

---

## 12. Meilenstein 1 — Diagnose & Kulanz-Check

### 12.1 Teil A: Ansprüche klären

Fragenkatalog (6 Fragen, kein KI-Einsatz):

| Frage | Warum relevant |
|-------|---------------|
| Kaufdatum der Anlage | Garantiefrist: 2 Jahre gesetzlich, 5–10 Jahre vertraglich |
| SENEC-Modell | Bekannte Seriendefekte modellspezifisch |
| Art des Defekts | Totalausfall vs. Teilausfall → Schadenshöhe |
| Bereits mit SENEC kommuniziert? | Fristen und Dokumentation prüfen |
| Kulanzangebot erhalten? | Wenn ja → Teil B |
| Anlagenwert + Kreditlaufzeit | Grundlage Schadensberechnung |

### 12.2 Teil B: Kulanz-Check

> ⚠️ **Aktualisiert nach OLG Hamm — Schwellenwerte geändert (Nachtrag, Abschnitt 16)**

**Pflichtfrage:** Enthält das Angebot eine Verzichtsklausel auf weitere Ansprüche?
→ Wenn ja: automatisch 🔴 **Rot**, unabhängig vom Betrag.

**Ampel-Logik:**

| Ampel | Bedingung | Empfehlung |
|-------|----------|-----------|
| 🟢 Grün | Deckt 100% Schaden UND keine Verzichtsklausel | Annehmen |
| 🟡 Gelb | Deckt 80–99% ohne Verzichtsklausel | Anwalt konsultieren |
| 🔴 Rot | Unter 80% ODER Verzichtsklausel ODER Drosselung statt Reparatur | Ablehnen |

**Hinweistext bei Rot:**
> „Nach dem Urteil des OLG Hamm vom 11.04.2025 stellt bereits eine Drosselung Ihres Speichers einen Sachmangel dar, der Sie zum Rücktritt berechtigt. Bei einem Totalausfall gilt das erst recht."

---

## 13. Meilenstein 2 — Datenexport

**Primär: SENEC.** Andere Hersteller (SMA, Fronius, Huawei, Kostal) in späterer Phase.

| Schritt | Aktion |
|---------|--------|
| 1 | mein-senec.de aufrufen + einloggen |
| 2 | Bereich „Auswertungen" öffnen |
| 3 | Zeitraum wählen: gesamter Schadenszeitraum (mind. 12 Monate) |
| 4 | Export als CSV auslösen |
| 5 | Datei speichern (`SENEC_Export_YYYY-MM.csv`) |
| 6 | Zurück zu SolarProof, Datei hochladen |

**Häufige Probleme:**
- Kein Zugang → Zugangsdaten-Reset Anleitung
- Export-Button fehlt → Alternativweg für ältere SENEC-Modelle
- Datei leer/fehlerhaft → Hinweis: lückenhafte Portaldaten sind bereits ein Argument

---

## 14. Meilenstein 3 — SolarProof Analyse

Vollständig implementiert (v1.2). Neu in v2.0:
- Vector begleitet die Parametereingabe
- Nach PDF-Export: automatische Weiterleitung zu Meilenstein 4
- Meilenstein-Badge „Nachweis erstellt" in der Prozessleiste

---

## 15. Meilensteine 4 + 5

**M4 — Anwalt finden:**
- PLZ-basiertes Matching, Schwerpunkt PV-/Produkthaftungsrecht
- Anwaltsprofil: Erfahrung SENEC-Fälle, Erstberatungsgebühr, Community-Bewertungen
- Gelistete Anwälte: monatliche Listinggebühr oder Cost-per-Lead
- **Rechtliche Prüfung vor Launch: BRAO § 49b**

**M5 — Anwalt briefen:**
- Paket: SolarProof PDF + Fallzusammenfassung + Kulanz-Ergebnis + Erste-Schritte-Guide
- Versand: vorausgefüllte E-Mail, ZIP-Download, Buchungskalender-Integration

---

## 16. Vector-Integration

**Automatisierte Flows (kein Token-Burn):** Meilensteinübergänge, CSV-Fehler, FAQ, Tooltips, Bestätigungen.

**Echter KI-Einsatz:** Kulanz-Check individuelles Angebot, unbekannte Probleme, Premium-Fallbegleitung, Anwaltsbriefing.

**Faustregel:** Prozessposition bestimmt → vorkonfiguriert. Individueller Inhalt nötig → CLI-Aufruf.

**Technisch:** `claude -p "<prompt>" --output-format text` als Subprocess (kein Anthropic API-Key, kein SDK).

---

## 17. Marke & Positionierung

| Attribut | Definition |
|----------|-----------|
| Name | SolarProof |
| Tagline | Dein Speicher ist defekt. Dein Recht nicht. |
| Tonalität | Ehrlich, klar, auf Augenhöhe, keine Versprechen |
| Zielgruppe | 60+ ohne Vorwissen, SENEC-Geschädigte |
| Domain jetzt | solarproof.voltfair.de |
| Domain Ziel | solarproof.de |

**Landing Page — Struktur:**
1. Hero: „Dein Speicher ist defekt. Dein Recht nicht."
2. Problem: Eigene Berechnungen werden angefochten — nicht weil sie falsch sind
3. Das SENEC-Argument
4. **Rechtliche Grundlage: OLG Hamm 11.04.2025** ← neu nach Nachtrag
5. Wie es funktioniert: 5 Meilensteine
6. Warum es standhält: SHA-256, RFC 3161, Open Source
7. Ehrliche Einschränkung: „SolarProof ersetzt keinen Sachverständigen. Es ist dein erster Schritt, nicht dein letzter."
8. FAQ

---

## 18. Geschäftsmodell

**Anwaltsnetzwerk:** Listing-Gebühr oder Cost-per-Lead. Rechtsprüfung BRAO § 49b vor Launch.

**Premium:** Basis kostenlos (5 Meilensteine). Premium: individuelle Vector-Fallanalyse, priorisiertes Matching. Zahlung via **Mollie** (kein Stripe).

**Beteiligungsmodell:** Erst nach etabliertem Netzwerk. Selektiv, nur starke Fälle.

---

## 19. Implementierungsreihenfolge v2.0

| Phase | Meilenstein | Aufgabe | Priorität | Status |
|-------|------------|---------|-----------|--------|
| 1 | Rahmen | Prozessleiste + Zustandsmaschine | Pflicht | ✅ gebaut |
| 2 | M1 | Diagnose-Fragekatalog | Pflicht | ✅ gebaut |
| 2 | M1 | Kulanz-Check inkl. OLG-Hamm-Logik | Pflicht | ✅ gebaut |
| 3 | M2 | SENEC Export-Anleitung mit Screenshots | Pflicht | ✅ gebaut |
| 4 | M3 | Tool in Prozess integriert | Pflicht | ✅ gebaut |
| 5 | M4 | Anwalt finden — praktischer Guide + Links + Weiter-CTA | Pflicht | ✅ gebaut |
| 5 | Landing | v2.0 Hero, 5-Schritte, OLG Hamm Sektion | Pflicht | ✅ gebaut |
| 6 | M5 | Briefing-Generator | Pflicht | ✅ gebaut |
| 7 | Vector | Automatisierte Flows | Pflicht | ✅ gebaut |
| 8 | Vector | KI-Einsatz: Kulanz-Check + Premium | Pflicht | ✅ gebaut |
| 9 | Business | Anwaltsnetzwerk-Onboarding | Pflicht | 🔵 offen |
| 10 | Business | Premium-Modell | Optional | 🔵 offen |
| 11 | Business | Beteiligungsmodell | Später | 🔵 offen |

---

# Teil 3 — Nachtrag: OLG Hamm 11.04.2025

## 20. Rechtliche Grundlage — OLG Hamm Az. 2 U 5/25

> **Kontext:** Robert ist Kläger in diesem Verfahren. Der SolarProof-Nachweis fließt direkt ein.

### 20.1 Was das Gericht entschieden hat

Das OLG Hamm hat am **11.04.2025** (Az. 2 U 5/25, BeckRS 2025, 14268) festgestellt: Ein Speicher, der zur Erfüllung von Produktsicherheitspflichten gedrosselt wird und nicht mehr im vertraglich vereinbarten Regelbetrieb arbeitet, ist **vertragswidrig** — unabhängig davon wie der Hersteller die Maßnahme bezeichnet.

**Wörtlich, Randnummer 11:**
> „Die Parteien haben insoweit eine Vereinbarung über die Beschaffenheit des Batteriespeichers getroffen, als das Gerät unstreitig eine maximale Speicherkapazität von 5 KWh aufweisen sollte. Diese Vorgaben erfüllt der Batteriespeicher seit August 2023 infolge der durch die Streithelferin veranlassten Drosselung auf nur noch 70% der vereinbarten Speicherkapazität nicht."

**Weitere Urteile:**

| Gericht / Aktenzeichen | Entscheidung |
|------------------------|-------------|
| **OLG Hamm, 2 U 5/25, 11.04.2025** | Drosselung auf 70% = Sachmangel, berechtigt zum Rücktritt |
| LG Darmstadt, 19 O 73/24, 08.11.2024 | Zahlenmäßige Unterschreitung = Mangel |
| LG Ellwangen, 6 O 163/24 | Drosselung = Sachmangel |
| LG Münster, 216 O 109/23 | Drosselung = Sachmangel |
| LG Rostock | Drosselung = Sachmangel |

**Für Totalausfälle:** Die Urteile betrafen 70%-Drosselung. Bei Totalausfall (0%) gilt *argumentum a majore ad minus* — wenn 70% ein erheblicher Mangel ist, ist 0% erst recht einer.

### 20.2 Konsequenz: Landing Page

Neuer Abschnitt „Rechtliche Grundlage" zwischen „Warum es standhält" und FAQ:

> „Das OLG Hamm hat im April 2025 entschieden: Schon eine Drosselung auf 70% der vereinbarten Speicherkapazität ist ein Sachmangel, der zum Rücktritt berechtigt. Bei einem Totalausfall gilt das erst recht. Fünf weitere Gerichte haben dies bestätigt. Die Rechtslage ist klar."

- Quellenangabe: BeckRS 2025, 14268 als Fußnote
- **Aktualisierungspflicht:** Neue Urteile in diesen Abschnitt einarbeiten

### 20.3 Konsequenz: Kulanz-Check (Änderung gegenüber ursprünglichem PRD)

| Bereich | Ursprünglich | Nach OLG Hamm |
|---------|-------------|---------------|
| 🟢 Grün-Schwelle | >90% Deckung | 100% UND keine Verzichtsklausel |
| 🟡 Gelb-Bereich | 50–90% | 80–99% ohne Verzichtsklausel |
| 🔴 Rot-Schwelle | <50% | <80% ODER Verzichtsklausel ODER Drosselung |
| Verzichtsklausel | Nicht geprüft | Eigene Pflichtfrage → immer Rot |
| Rot-Hinweistext | Generisch | OLG Hamm explizit mit Datum + AZ |

---

## 21. Datenschutz & Compliance

- **v1.2:** Keine personenbezogenen Daten — reines Client-side-Tool
- **v2.0 Backend:** Bei Supabase-Einführung: AVV Hetzner, DSGVO Art. 13/14
- **Anwaltsnetzwerk:** BRAO § 49b vor Launch prüfen
- **Hosting:** Hetzner EU, DPA geprüft, TLS DNS-01 via INWX

---

## 22. Aktualisierungspflicht

Dieses Dokument wird aktualisiert wenn:
- Neue Gerichtsurteile zu SENEC oder Batteriespeichern vorliegen
- Neue BDEW-Strompreise veröffentlicht werden
- Neue Hersteller-Exportanleitungen hinzukommen
- Neue Features implementiert werden oder sich der Implementierungsstand ändert

---

*SolarProof — solarproof.voltfair.de*
*Ein Projekt von maxone-studio | 50/50 mit Robert*
*Letzte Aktualisierung: 2026-05-12*
