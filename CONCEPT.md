# CONCEPT — SolarProof

> Pflicht-Dokument nach [Standard 015](https://github.com/maxone-one/maxone-standards/blob/main/standards/015-concept-gate.md).
> Erstellt 2026-05-12 (retroaktiv). Zuletzt aktualisiert 2026-05-18.

---

## Problem

SENEC-Kunden haben defekte Photovoltaik-Speicher und erhalten unzureichende
Kulanz-Angebote — oft mit Verzichtsklauseln. Sie wissen nicht, ob das Angebot
fair ist, kennen ihre Rechte nicht und finden keinen Anwalt mit SENEC-Erfahrung.

## Ziel / Erfolgs-Kriterium

Betroffene SENEC-Kunden können ihren Fall in unter 30 Minuten vollständig
dokumentieren, das Kulanz-Angebot einschätzen lassen und einen geeigneten Anwalt
kontaktieren — ohne eigenes juristisches Vorwissen.

## Nutzer

| Rolle              | Anonym? | Eingeloggt? | Zahlend? | Anzahl bei Launch |
|--------------------|---------|-------------|----------|-------------------|
| SENEC-Geschädigter | ja      | nein        | nein     | ∞ (öffentlich)    |
| Partner-Anwalt     | nein    | ja (Phase 2)| ja (B2B) | 9 (Stand 2026-05) |
| Admin              | nein    | ja          | nein     | 1–2               |

**Kernentscheidung:** Der Endkunde bezahlt nie. Monetarisierung ausschließlich
über Partner-Kanzleien (B2B). Begründung: Endkunden sind skeptisch und ängstlich,
Anwälte haben klares wirtschaftliches Interesse und sind leichter zu überzeugen.
Leads sind stark vorqualifiziert (Diagnose + PDF + Ampel-Bewertung vorhanden).

---

## Business-Modell — Drei Partnermodelle für Kanzleien

Alle Modelle basieren auf dem Prinzip: **Anwälte zahlen, Endkunden nie.**

Die Leads sind stark vorqualifiziert: Nutzer hat Diagnose abgeschlossen,
SENEC-Modell und Defektart dokumentiert, Kulanz-Angebot bewertet (Ampel),
PDF mit RFC 3161-Zeitstempel erstellt. Geschätzte Konversionsrate Lead → Mandat:
30–50 % (vs. 5–15 % bei Google Ads).

Vergleichswert: Google Ads CPL im Rechtswesen Deutschland: € 100–400.
Bei SENEC-Streitwerten typisch € 8.000–20.000.

### Modell 1 — Qualifizierter Lead (Anwalt trägt Risiko)

- Anwalt zahlt einmalig bei Übergabe des Leads
- SolarProof trägt kein Ausfall-Risiko
- Preis: **€ 150–250** einmalig
- Geeignet für: Kanzleien mit eigener SENEC-Erfahrung und bekannter Win-Rate
- Tracking: Klick auf Kanzlei-Website wird in `sp-referrals` (localStorage)
  gespeichert; Kontaktbestätigung durch Nutzer optional

### Modell 2 — Hybrid (geteiltes Risiko)

- Kleine Anzahlung bei Lead-Übergabe: **€ 75**
- Restzahlung bei gewonnenem Fall oder außergerichtlichem Vergleich: **€ 250**
- Gesamt bei Erfolg: **€ 325**
- Geeignet für: Kanzleien die Commitment zeigen wollen ohne Vollrisiko
- SolarProof trägt anteiliges Ausfall-Risiko

### Modell 3 — Pay-Per-Close (kein Risiko für den Anwalt)

- Anwalt zahlt **ausschließlich** bei gewonnenem Fall oder Vergleich
- 100 % sicheres Geschäft für die Kanzlei
- Preis: **€ 450–600** pro abgeschlossenem Fall
- Geeignet für: Kanzleien ohne SENEC-Erfahrung, die kein Risiko eingehen wollen
- Für SolarProof: höchster Einzelpreis, aber Expected Value (bei 40 % Win-Rate)
  liegt bei € 180–240 — niedriger als Modell 1

**Upselling-Logik:** Modell 1 als Standard-Einstieg für etablierte Partner.
Modell 3 als Premium-Option sobald Win-Rate-Daten aus echten Fällen vorliegen.

---

## Datenmodell

| Entität         | Felder                                                        | Sensitivität                   |
|-----------------|---------------------------------------------------------------|--------------------------------|
| `lawyers`       | id, name, kanzlei, plz, ort, bundesland, schwerpunkte, ...   | öffentlich (Anwaltsdaten)      |
| `sp-referrals`  | lawyerId, kanzlei, ts, status, contactedAt (localStorage)     | nicht-personenbezogen          |

**Besondere Kategorien (Art. 9 DSGVO):** nein.
**DSFA fällig:** nein.

---

## Auth-Modell

| Funktion          | Zugang                            |
|-------------------|-----------------------------------|
| Tool nutzen       | anonym, ohne Login                |
| Anwälte lesen     | anon-Key (public)                 |
| Anwälte schreiben | SERVICE_ROLE_KEY (Admin-only)     |

---

## Externe Dienste

| Dienst            | Zweck                         | Region | AVV/DPA    | Datenkategorie       |
|-------------------|-------------------------------|--------|------------|----------------------|
| Hetzner           | Hosting (voltfair-cli)        | EU     | ✅ Standard | Build-Artefakte      |
| Supabase (maxone) | DB (lawyers) + Edge Functions | EU     | ✅ Pro-Plan | Anwaltsdaten         |
| Vector / Claude   | KI-Kulanz-Analyse (kulanz-ai) | EU     | via maxone | Diagnosedaten (anon) |

---

## Stack

| Schicht            | Wahl                    | Warum?                                   |
|--------------------|-------------------------|------------------------------------------|
| Frontend           | React + Vite + Tailwind | SPA, kein SSR nötig, schneller Build     |
| Hosting            | voltfair-cli (Hetzner)  | EU, eigene Infra, Blue/Green             |
| DB + Functions     | Supabase (maxone-prod)  | lawyers-Tabelle + kulanz-ai Edge Fn      |
| KI                 | Claude via Edge Fn      | Kulanz-Analyse, Vector-Widget            |
| PDF                | jsPDF + RFC 3161        | Manipulationssicherer Nachweis           |

## Out of Scope

- Mobile App
- ~~Login / Nutzerkonto~~ (implementiert 2026-05-18, OTP-Auth + Cloud-Sync)
- Endkunden-Zahlung (bewusste Entscheidung, 2026-05-18)
- Bayern-Kanzlei (noch nicht gefunden, Stand 2026-05-18)
- Anwalt-Dashboard / Multi-User → **PRD-ANWALT.md** (Phase 2)

---

## Threat-Model

| Bedrohung                              | Wahrscheinlichkeit | Auswirkung | Maßnahme                                                          |
|----------------------------------------|--------------------|------------|-------------------------------------------------------------------|
| KI-Halluzination (Kulanz-Analyse)      | mittel             | mittel     | Disclaimer + kein verbindlicher Rechtsbescheid — nur Orientierung |
| Falsche Anwaltsdaten (veraltete DB)    | mittel             | mittel     | Admin-Edit + Anwalt-selbst-Onboarding (Phase 2)                   |
| Scraping der Anwaltsliste              | hoch               | niedrig    | anon-Key ist öffentlich — Anwaltsdaten sind sowieso öffentlich    |
| PDF-Manipulation nach Download         | niedrig            | mittel     | RFC 3161-Zeitstempel macht Manipulationen nachweisbar              |
| Missbrauch Lead-Empfehlung (Spam)      | mittel             | niedrig    | localStorage ohne Account — kein persistenter State auf Server    |
| DSGVO-Verstoß (Sonderdaten Art. 9)     | niedrig            | hoch       | Tool verarbeitet nur Geräte- und Vertragsinfos — keine Gesundheitsdaten |

**Ergebnis:** Kein High-Risk-Szenario, das eine DSFA nach Art. 35 DSGVO auslöst.

---

## Gate 1 — Konzept-Sign-Off

- **Vorgeschlagen von:** Max Karastelev (@karastoni) + Robert
- **Reviewed von:** Max Karastelev (@karastoni) am 2026-05-18
- **Gate 1:** PASSIERT
- **Bekannte Risiken:** Win-Rate-Daten für Modell 3 fehlen noch; Bayern-Kanzlei offen
- **DSFA fällig (DSGVO Art. 35):** nein — keine Gesundheits- oder Sonderdaten
- **Standard 016 (Stack-Whitelist) konform:** ja
