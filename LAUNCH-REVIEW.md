# LAUNCH-REVIEW — SolarProof

> Pflicht-Dokument nach [Standard 013](https://github.com/maxone-one/maxone-standards/blob/main/standards/013-launch-gate-review.md).
> Erstellt 2026-04-27. Zuletzt aktualisiert 2026-05-18 (Supabase, Edge Functions, B2B-Modell).

---

## Projekt-Kontext

- **Projekt:** SolarProof
- **Domain:** solarproof.voltfair.de (Subdomain voltfair-cli)
- **Stack:** Vite / React / Tailwind — SPA mit Supabase-Backend
- **Externe Dienste:** voltfair-cli (Hetzner, statisches Hosting), Supabase maxone-prod (DB + Edge Functions), Vector Widget (KI)
- **Datenkategorien:** Anwaltsdaten (öffentlich), anonyme Diagnosedaten (lokal), Klick-Tracking localStorage (nicht-personenbezogen)
- **Erwartete Nutzerzahl:** öffentlich, unbegrenzt

---

## A. Code-Verständnis & Verantwortung

- [x] Black-Box-Anteil: ~30 % (KI-augmentiert, reviewed)
- [x] `npm audit --production`: Critical 0, High 0 (geprüft 2026-05-18)
- [x] Lockfile committed: ja
- [x] Review-Pass durch Max Karastelev

**Notizen:** SPA mit externen Calls zu Supabase Edge Functions (kulanz-ai, list-lawyers, add-lawyer). ANON_KEY ist öffentlich per Design (Row-Level-Security schützt Schreibzugriffe). SERVICE_ROLE_KEY nur server-seitig in Edge Functions.

## B. Auth & Authorization

- [x] Endnutzer: kein Login, kein Konto — vollständig anonym
- [x] Admin-Zugriff (Anwälte eintragen): SERVICE_ROLE_KEY, nie im Browser-Bundle
- [x] Bezahlfeatures: keine (Endkunde zahlt nie — B2B-Modell, Anwälte zahlen)

**Notizen:** `list-lawyers` erfordert nur ANON_KEY. `add-lawyer` erfordert SERVICE_ROLE_KEY (Bearer-Token, nur über Admin-Overlay zugänglich, Hash-geschützt).

## C. Datenbank-Sicherheit

- [x] Supabase RLS aktiv auf `lawyers`-Tabelle
- [x] Lesen: anon (public)
- [x] Schreiben: service_role only
- [x] Keine Nutzerdaten in DB gespeichert

**Notizen:** Einzige persistente Daten sind Anwaltsdaten (kein DSGVO-Sonderkategorie). Klick-Tracking läuft ausschließlich in localStorage des Browsers, kein Server-Write.

## D. Datenschutz / DSGVO

- [x] Keine personenbezogenen Nutzerdaten gesammelt (Diagnose läuft lokal)
- [x] localStorage `sp-referrals`: enthält nur Kanzlei-ID + Zeitstempel (keine Personendaten)
- [x] AVV: Hetzner ✅, Supabase ✅ (Pro-Plan, EU-Region)
- [x] Standard 041: data_processors aktualisiert
- [x] Google Fonts: nicht verwendet (System-Fonts)
- [x] Externe Embeds: Vector Widget (agent.maxone.one) — eigene Infra
- [x] Server-Region: EU (Hetzner Nürnberg)

**Notizen:** KI-Analyse (kulanz-ai): Nutzer sendet optional den Wortlaut seines Kulanz-Angebots — kein Pflichtfeld, enthält keine Namen/Adressen, ist nicht personenbezogen per se. Trotzdem Hinweis in Datenschutz empfohlen.

## E. Test/Prod-Trennung

- [x] ANON_KEY ist öffentlich per Design — kein Secret
- [x] SERVICE_ROLE_KEY nicht im Frontend-Bundle (geprüft mit `grep -r SERVICE_ROLE src/`)
- [x] Build-Artefakt: statisches dist/ + Edge Functions auf Supabase

## F. Frontend-Secrets / Public Bundle

- [x] Bundle-Scan: ANON_KEY ist öffentlich (Design) — kein privater Key im Bundle
- [x] Source-Maps: deaktiviert
- [x] PANEL_URL + ANON_KEY in `src/data/lawyers.ts`: öffentlich per Design, entspricht Supabase-Standard

**Notizen:** ANON_KEY ist ein JWT mit `role: anon` — gibt nur Leserechte auf `lawyers`. Kein Risiko.

## G. Externe Integrationen

- [x] Supabase Edge Functions: `list-lawyers`, `add-lawyer`, `kulanz-ai`, `impressum` — alle auf maxone-prod
- [x] Vector Widget: `agent.maxone.one/widget/vector-chat.js` — eigene Infra
- [x] Keine Drittanbieter-Tracking-Skripte (kein GA, kein Facebook Pixel)

## H. Infrastruktur

- [x] Standard 002 (no-build-on-prod): ✅ Build in CI (GitHub Actions)
- [x] Standard 003 (secrets-store): SERVICE_ROLE_KEY in `/opt/supabase/docker/.env`
- [x] Standard 004 (TLS DNS-01): ✅
- [x] Standard 005 (test-first): Playwright-Tests vorhanden
- [x] Standard 001 (blue-green): ✅ (voltfair-cli via Coolify)

## I. Operations / Recovery

- [x] Restart-Policy: `unless-stopped`
- [x] Monitoring: Uptime-Kuma (maxone-watchdog)
- [x] Edge Functions: `docker restart supabase-edge-functions` bei Änderungen

## J. Vibe-Coding-Lückenklassen

- [x] XSS: `dangerouslySetInnerHTML` — 0 Treffer im eigenen Code
- [x] Injection: Edge Functions bauen JSON per Supabase-Client, kein SQL-Concatenation
- [x] Standard 022 (gitleaks): 0 Findings (ANON_KEY ist öffentlich per Design)
- [x] Plattform-Lock-in: Claude Code — kein Lovable/Bolt/v0

---

## Sign-Off — 2026-05-18 (Re-Review nach Backend-Erweiterung)

- **Verantwortlich:** Max Karastelev (@karastoni)
- **Rolle:** Gründer / Lead Dev
- **Geprüft am:** 2026-05-18
- **Sektionen abgehakt:** A B C D E F G H I J
- **Wesentliche Änderungen seit 2026-04-27:**
  - Supabase-Backend hinzugekommen (lawyers-Tabelle, 3 Edge Functions)
  - Vector Widget eingebunden (eigene Infra)
  - Premium-Paywall entfernt — B2B-Modell (Anwälte zahlen, Kunden nie)
  - 9 Kanzleien in DB eingetragen
  - localStorage-Tracking `sp-referrals` für Pay-Per-Close
- **Bekannte Restrisiken:** keine — kulanz-ai-Freitext und Anwalt-Einreichung in Datenschutzerklärung dokumentiert (§§ 5+6, 2026-05-18)
- **Nächstes Re-Review fällig:** bei Login/Auth-Einführung oder nach 12 Monaten

---

> **Re-Review-Trigger:** Einführung von Auth/Login, Server-seitiges Nutzer-Tracking, Zahlungsintegration, oder spätestens 2027-05-18.
