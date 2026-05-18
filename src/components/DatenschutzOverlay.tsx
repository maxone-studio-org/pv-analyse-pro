import { useEffect, useCallback } from 'react'

interface Props {
  open: boolean
  onClose: () => void
}

export function DatenschutzOverlay({ open, onClose }: Props) {
  const handleClose = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, handleClose])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-fade-in">
      <button
        onClick={handleClose}
        className="fixed top-6 right-6 z-10 p-2 rounded-full bg-white/80 backdrop-blur border border-gray-200 hover:bg-gray-100 transition-colors"
        aria-label="Schließen"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="max-w-2xl mx-auto px-6 py-20 space-y-10 text-sm text-gray-700 leading-relaxed">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-gray-500 mb-3">Rechtliches</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Datenschutzerklärung</h1>
          <p className="text-gray-500">Stand: Mai 2026</p>
        </div>

        {/* Verantwortlicher */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">1. Verantwortlicher</h2>
          <p>
            Verantwortlich im Sinne der DSGVO ist Max Karastelev (maxone). Kontakt und vollständige
            Angaben: siehe{' '}
            <button
              onClick={handleClose}
              className="text-amber-600 hover:underline"
            >
              Impressum
            </button>.
          </p>
        </section>

        {/* Grundsatz: keine Datenerhebung */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">2. Grundsatz — kein Tracking, keine Registrierung</h2>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-3">
            <p className="font-medium text-green-900">
              SolarProof erhebt, speichert oder überträgt keine personenbezogenen Daten.
            </p>
            <p className="text-green-800 mt-1">
              Es gibt keine Registrierung, kein Nutzerkonto, kein Tracking, keine Analyse-Skripte und
              keine Werbecookies.
            </p>
          </div>
          <p>
            Die gesamte Analyse — CSV-Import, Speichersimulation, PDF-Erstellung — läuft
            ausschließlich im Browser auf deinem Gerät. Keine Datei wird an einen Server gesendet.
          </p>
        </section>

        {/* Serverzugriffsdaten */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">3. Serverzugriffsdaten (Art. 6 Abs. 1 lit. f DSGVO)</h2>
          <p>
            Beim Aufrufen der Website speichert der Webserver automatisch technische Zugriffsdaten
            in sogenannten Server-Logs. Diese umfassen:
          </p>
          <ul className="mt-3 space-y-1 list-disc list-inside text-gray-600">
            <li>IP-Adresse (anonymisiert nach 7 Tagen)</li>
            <li>Datum und Uhrzeit des Abrufs</li>
            <li>Aufgerufene URL</li>
            <li>Browser-Typ und Betriebssystem (User-Agent)</li>
          </ul>
          <p className="mt-3">
            Diese Daten sind technisch notwendig für den Betrieb der Website und werden
            ausschließlich zur Fehleranalyse genutzt. Rechtsgrundlage: berechtigtes Interesse
            (Art. 6 Abs. 1 lit. f DSGVO). Speicherdauer: 7 Tage, danach automatische Löschung.
          </p>
        </section>

        {/* RFC 3161 */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">4. RFC 3161-Zeitstempel</h2>
          <p>
            Optional kann das erstellte PDF mit einem kryptografischen Zeitstempel versehen werden.
            Dabei wird ausschließlich der <strong>SHA-256-Hash des PDFs</strong> (ein 64-stelliger
            Fingerabdruck) an den Zeitstempeldienst FreeTSA (freetsa.org) übertragen —
            kein Inhalt des PDFs, keine Messdaten, keine personenbezogenen Informationen.
          </p>
          <p className="mt-3 text-gray-500 text-xs">
            FreeTSA ist ein freier, akkreditierter Zeitstempeldienst (RFC 3161 / eIDAS).
            Datenschutzhinweise von FreeTSA sind unter freetsa.org abrufbar.
          </p>
        </section>

        {/* Vector Chat */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">5. KI-Chat (Vector)</h2>
          <p>
            SolarProof bindet einen KI-Assistenten („Vector") ein, der Fragen zur Nutzung des Tools,
            zu CSV-Import, Simulation und rechtlichen Hintergründen beantwortet. Die Nutzung des
            Chats ist vollständig freiwillig.
          </p>
          <p className="mt-3">
            Wenn du den Chat öffnest und eine Nachricht sendest, wird der Inhalt dieser Nachricht
            an unsere eigene KI-Infrastruktur (maxone, EU-Server, Hetzner Nürnberg) übertragen und
            dort verarbeitet. Chat-Feedback (Daumen hoch/runter) wird in unserer Datenbank gespeichert.
            Es werden keine personenbezogenen Daten erhoben — es gibt keine Registrierung, keinen Account.
          </p>
          <p className="mt-3 font-medium text-gray-800">
            Wichtig: Gib bitte keine mandantenbezogenen oder personenbezogenen Informationen
            in den Chat ein. Der Chat ist nicht für vertrauliche Falldaten geeignet.
          </p>
          <p className="mt-3">
            Rechtsgrundlage: berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO) an der Bereitstellung
            einer hilfreichen Nutzerunterstützung. Der Chat ersetzt keine Rechtsberatung.
          </p>
        </section>

        {/* KI-Kulanzbewertung */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">7. KI-Kulanzbewertung (optional)</h2>
          <p>
            In Schritt 1 kannst du freiwillig den Wortlaut deines SENEC-Kulanzangebots eingeben,
            um eine KI-gestützte Einschätzung zu erhalten. Dieses Textfeld ist <strong>vollständig optional</strong> —
            du kannst SolarProof ohne diese Funktion vollständig nutzen.
          </p>
          <p className="mt-3">
            Gibst du Text ein und klickst auf „Angebot analysieren", wird <strong>ausschließlich der eingegebene
            Angebotstext</strong> an unsere KI-Infrastruktur (maxone, EU-Server) übertragen. Der Text enthält
            typischerweise keine personenbezogenen Daten (kein Name, keine Adresse). Er wird für die
            Dauer der Analyse verarbeitet und nicht dauerhaft gespeichert.
          </p>
          <p className="mt-3">
            Rechtsgrundlage: Einwilligung durch aktive Eingabe und Absenden (Art. 6 Abs. 1 lit. a DSGVO).
            Du kannst auf die Funktion jederzeit verzichten, ohne Nachteile für die übrige Nutzung.
          </p>
        </section>

        {/* Anwaltsliste und Einreichung */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">8. Anwaltsliste und Anwalt-Einreichung</h2>
          <p>
            SolarProof ruft eine öffentliche Liste von Anwälten mit SENEC-Erfahrung von unserem
            Server ab (maxone, EU-Server). Diese Daten sind öffentlich zugänglich und enthalten
            ausschließlich berufliche Informationen (Name, Kanzlei, Standort, Schwerpunkte).
          </p>
          <p className="mt-3">
            Du hast die Möglichkeit, einen Anwalt zur Aufnahme in die Liste vorzuschlagen. Dabei
            überträgst du folgende Angaben an unseren Server:
          </p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
            <li>Name des Anwalts und Kanzlei (Pflichtfelder)</li>
            <li>PLZ und Ort (Pflichtfelder)</li>
            <li>Website des Anwalts (optional)</li>
            <li>Deine Erfahrung mit dem Anwalt in Freitext (optional)</li>
          </ul>
          <p className="mt-3">
            Die Angaben beziehen sich auf den Anwalt, nicht auf dich persönlich. Der optionale
            Erfahrungstext kann jedoch indirekt Rückschlüsse auf deine Person ermöglichen.
            Einreichungen werden vor der Veröffentlichung manuell geprüft. Nicht freigegebene
            Einreichungen werden gelöscht.
          </p>
          <p className="mt-3">
            Rechtsgrundlage: Einwilligung durch aktives Absenden des Formulars
            (Art. 6 Abs. 1 lit. a DSGVO).
          </p>
        </section>

        {/* localStorage */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">9. Lokale Speicherung (localStorage)</h2>
          <p>
            SolarProof speichert Fortschritt und Analyseergebnisse ausschließlich im localStorage
            deines Browsers — lokal auf deinem Gerät, nicht auf einem Server. Diese Daten verlassen
            deinen Rechner nicht und werden nicht ausgelesen.
          </p>
          <p className="mt-2">
            Du kannst den localStorage jederzeit im Browser löschen
            (Einstellungen → Datenschutz → Browserdaten löschen).
          </p>
        </section>

        {/* Rechte */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">10. Deine Rechte (Art. 15–21 DSGVO)</h2>
          <p>
            Da wir keine personenbezogenen Daten erheben, gibt es de facto nichts zu beauskunften,
            zu korrigieren oder zu löschen. Solltest du dennoch Fragen zum Datenschutz haben,
            wende dich an die im Impressum genannte E-Mail-Adresse.
          </p>
          <p className="mt-3">
            Du hast ferner das Recht, dich bei einer Datenschutzaufsichtsbehörde zu beschweren
            (Art. 77 DSGVO), beispielsweise beim Bayerischen Landesamt für Datenschutzaufsicht (BayLDA).
          </p>
        </section>

        <button
          onClick={handleClose}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Zurück zum Tool
        </button>
      </div>
    </div>
  )
}
