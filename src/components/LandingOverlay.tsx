import { useEffect, useCallback, useState } from 'react'

const STORAGE_KEY = 'sp-landing-seen'

interface Props {
  open: boolean
  onClose: () => void
}

export function LandingOverlay({ open, onClose }: Props) {
  const handleClose = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, '1')
    onClose()
  }, [onClose])

  // Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, handleClose])

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-fade-in">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="fixed top-6 right-6 z-10 p-2 rounded-full bg-white/80 backdrop-blur border border-gray-200 hover:bg-gray-100 transition-colors"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-xs font-medium text-amber-800">Open Source — kostenlos — kein Account</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
          Dein Speicher ist defekt.<br />Dein Recht nicht.
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
          SolarProof begleitet dich von der Diagnose bis zum Anwaltsbriefing —
          kostenlos, ohne Account, alles in deinem Browser.
        </p>
        <button
          onClick={handleClose}
          className="mt-8 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
        >
          Tool starten
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </section>

      {/* ── Problem / Lösung ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Das Problem</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Dein Batteriespeicher ist defekt. Seit Monaten speist du Strom ins Netz ein,
              den du eigentlich selbst hättest nutzen können. Der Hersteller reagiert nicht.
              Du ziehst vor Gericht.
            </p>
            <p>
              Und dann die Frage des Richters:
              <span className="font-semibold text-gray-900"> "Wie hoch ist dein tatsächlicher Schaden?"</span>
            </p>
            <p>
              Du hast Messdaten aus deinem Wechselrichter. Aber kein Werkzeug, das daraus
              einen belastbaren, nachvollziehbaren Nachweis macht.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Die Lösung</h2>
          <p className="text-gray-600 leading-relaxed">
            SolarProof nimmt deine realen Messdaten, simuliert einen funktionierenden
            Speicher mit den exakten Parametern deiner Anlage und erstellt ein PDF-Gutachten
            mit kryptografischer Integritätssicherung — gerichtsverwertbar und reproduzierbar.
          </p>
        </div>
      </section>

      {/* ── Das SENEC-Argument ── */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-3">Das SENEC-Argument</p>
            <h2 className="text-xl font-bold text-gray-900 mb-4 leading-snug">
              SENEC hat deine Daten selbst erhoben.<br />
              SENEC kann sie nicht anfechten.
            </h2>
            <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
              <p>
                Wenn du deinen Schaden mit eigenen Berechnungen belegen willst, wird SENEC
                deine Methodik anzweifeln. Das ist ihr Standard-Argument vor Gericht.
              </p>
              <p>
                SolarProof nutzt ausschließlich Daten, die SENEC selbst in seinem eigenen
                Kundenportal mit seiner eigenen Messtechnik erfasst hat. Jede Messung stammt
                von SENEC — nicht von dir.
              </p>
              <p className="font-semibold text-gray-900">
                Was SENEC selbst gemessen hat, kann SENEC nicht als unzuverlässig bezeichnen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">Was das Tool kann</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<UploadIcon />}
              title="CSV-Import"
              description="Messdaten von SMA, Fronius, Huawei, Kostal, SENEC — automatische Spaltenerkennung."
            />
            <FeatureCard
              icon={<CpuIcon />}
              title="Speichersimulation"
              description="Kapazität, Entladetiefe, Wirkungsgrade — alle Parameter konfigurierbar und dokumentiert."
            />
            <FeatureCard
              icon={<FileIcon />}
              title="PDF-Gutachten"
              description="Monatsbericht mit Tagesdaten, Charts, Simulationsparametern und Disclaimer."
            />
            <FeatureCard
              icon={<ShieldIcon />}
              title="SHA-256 Integrität"
              description="Kryptografischer Fingerabdruck der Quelldatei — Manipulation nachweisbar ausgeschlossen."
            />
            <FeatureCard
              icon={<ClockIcon />}
              title="RFC 3161 Zeitstempel"
              description="Akkreditierte Zeitstempelbehörde bestätigt: Dieses Dokument existierte zu diesem Zeitpunkt."
            />
            <FeatureCard
              icon={<CodeIcon />}
              title="Reproduzierbar"
              description="Engine-Version und Git-Commit im PDF — die Berechnung ist auch Jahre später nachvollziehbar."
            />
          </div>
        </div>
      </section>

      {/* ── 5 Meilensteine ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Dein Weg in 5 Schritten</h2>
          <p className="text-center text-gray-500 text-sm mb-10">Von der ersten Frage bis zum Anwaltsbriefing</p>
          <div className="space-y-6">
            <Step number="1" title="Diagnose & Kulanz-Check"
              description="Bis zu 8 kurze Fragen klären deine Ansprüche. Das SENEC-Kulanz-Angebot wird nach OLG Hamm bewertet — mit klarer Ampel: annehmen oder ablehnen." />
            <Step number="2" title="Daten exportieren"
              description="Schritt-für-Schritt-Anleitung für das SENEC-Portal. Du weißt genau wo du klicken musst." />
            <Step number="3" title="SolarProof Analyse"
              description="CSV hochladen, Speicher simulieren, gerichtsverwertbares PDF mit SHA-256 und RFC 3161 Zeitstempel exportieren." />
            <Step number="4" title="Anwalt finden"
              description="Anwälte mit SENEC-Erfahrung in deiner Region. Kein bezahltes Ranking — nur Relevanz." />
            <Step number="5" title="Anwalt briefen"
              description="Automatisches Briefing-Paket: SolarProof-PDF, Fallzusammenfassung, Kulanz-Ergebnis, vorausgefüllte E-Mail." />
          </div>
        </div>
      </section>

      {/* ── Vertrauen ── */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Warum gerichtsverwertbar?</h2>
          <p className="text-gray-600 mb-10 max-w-xl mx-auto">
            Drei unabhängige Mechanismen sichern die Integrität des Ergebnisses.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <TrustCard
              title="Quelldaten-Hash"
              description="SHA-256 der CSV-Datei wird beim Upload berechnet und im PDF dokumentiert. Jede Änderung an den Eingabedaten wäre sofort nachweisbar."
            />
            <TrustCard
              title="Zeitstempel"
              description="Das fertige PDF wird bei einer akkreditierten Stelle (RFC 3161 / eIDAS) signiert. Das beweist, wann das Dokument erstellt wurde."
            />
            <TrustCard
              title="Versionierung"
              description="App-Version und Git-Commit-Hash sind im PDF dokumentiert. Die Berechnung kann jederzeit exakt reproduziert werden."
            />
          </div>
        </div>
      </section>

      {/* ── Rechtliche Grundlage ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 bg-blue-600 rounded-full" />
            <h2 className="text-2xl font-bold text-gray-900">Rechtliche Grundlage</h2>
          </div>
          <p className="text-sm text-gray-500 mb-8 ml-3">OLG Hamm, Az. 2 U 5/25 — Urteil vom 11. April 2025</p>

          <blockquote className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <p className="text-base text-gray-700 leading-relaxed italic border-l-4 border-blue-500 pl-4">
              „Die Parteien haben insoweit eine Vereinbarung über die Beschaffenheit des
              Batteriespeichers getroffen, als das Gerät unstreitig eine maximale
              Speicherkapazität von 5 KWh aufweisen sollte. Diese Vorgaben erfüllt der
              Batteriespeicher seit August 2023 infolge der durch die Streithelferin
              veranlassten Drosselung auf nur noch 70% der vereinbarten Speicherkapazität
              nicht."
            </p>
            <p className="mt-3 text-xs text-gray-400">Rn. 11 — BeckRS 2025, 14268</p>
          </blockquote>

          <p className="text-gray-600 leading-relaxed mb-4">
            Das OLG Hamm hat entschieden: Schon eine Drosselung auf 70% der vereinbarten
            Kapazität ist ein <strong>Sachmangel</strong>, der zum{' '}
            <strong>Rücktritt berechtigt</strong>. Bei einem Totalausfall gilt das erst recht.
            Fünf weitere Gerichte haben dies bestätigt.
          </p>

          <div className="space-y-2">
            {[
              { az: 'LG Darmstadt, 19 O 73/24', datum: '08.11.2024', text: 'Zahlenmäßige Unterschreitung = Mangel' },
              { az: 'LG Ellwangen, 6 O 163/24',  datum: '',          text: 'Drosselung = Sachmangel' },
              { az: 'LG Münster, 216 O 109/23',   datum: '',          text: 'Drosselung = Sachmangel' },
              { az: 'LG Rostock',                  datum: '',          text: 'Drosselung = Sachmangel' },
            ].map(({ az, datum, text }) => (
              <div key={az} className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-3.5">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">{az}{datum && ` (${datum})`}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm font-medium text-gray-700">
            Die Rechtslage ist klar. SolarProof liefert den Nachweis.
          </p>
        </div>
      </section>

      {/* ── Ehrliche Einschränkung ── */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white border-2 border-amber-200 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Ehrlich gesagt</h2>
            <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
              SolarProof ersetzt keinen Sachverständigen und keine Rechtsberatung.
              Es ist dein erster Schritt — nicht dein letzter.
              Der Nachweis schafft eine Faktenbasis. Was du damit machst, entscheidest du
              gemeinsam mit einem Anwalt.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Das Produkt ist quelloffen, kostenlos, und läuft vollständig in deinem Browser.
              Keine Daten verlassen deinen Rechner.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Häufige Fragen</h2>
          <FaqList />
        </div>
      </section>

      {/* ── CTA Footer ── */}
      <section className="py-16 bg-gradient-to-b from-white to-amber-50">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Bereit?</h2>
          <p className="text-gray-600 mb-8">
            Kostenlos. Ohne Anmeldung. Alles läuft in deinem Browser — keine Daten verlassen deinen Rechner.
          </p>
          <button
            onClick={handleClose}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-10 py-3.5 rounded-xl transition-colors"
          >
            Jetzt starten
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="mt-6 text-xs text-gray-400">
            SolarProof v{__APP_VERSION__} — Open Source auf GitHub
          </p>
        </div>
      </section>
    </div>
  )
}

// ── Sub-Components ────────────────────────────────────

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-gray-200 p-5 bg-white">
      <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </div>
  )
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-sm flex items-center justify-center">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )
}

const FAQ_ITEMS = [
  {
    q: 'Funktioniert SolarProof auch ohne SENEC — z.B. SMA oder Fronius?',
    a: 'Ja. SolarProof importiert CSV-Dateien von SMA, Fronius, Huawei, Kostal und anderen Herstellern. Die Spalten werden per Mapping zugeordnet. Die juristische Situation (SENEC-spezifische Urteile) gilt aber nur für SENEC-Speicher.',
  },
  {
    q: 'Ist das PDF wirklich "gerichtsverwertbar"?',
    a: 'Das PDF enthält einen kryptografischen SHA-256-Fingerabdruck der Quelldatei und einen RFC 3161-Zeitstempel einer akkreditierten Stelle. Damit ist nachweisbar, welche Daten zu welchem Zeitpunkt ausgewertet wurden — und dass sie nicht verändert wurden. Ob und wie ein Gericht das gewichtet, entscheidet der Richter. SolarProof ersetzt keine sachverständige Begutachtung.',
  },
  {
    q: 'Werden meine Daten irgendwo hochgeladen?',
    a: 'Nein. Die gesamte Analyse läuft im Browser auf deinem Gerät. Es wird keine Datei an einen Server gesendet. Einzige Ausnahme: der Zeitstempel-Request sendet den SHA-256-Hash (nicht die Daten selbst) an FreeTSA für die RFC-3161-Signatur.',
  },
  {
    q: 'Welche CSV-Datei brauche ich?',
    a: 'Den CSV-Export aus deinem SENEC-Kundenportal (mein-senec.de). Wähle den gesamten Schadenszeitraum — mindestens 12 Monate. Schritt 2 der Plattform erklärt dir genau wie.',
  },
  {
    q: 'Muss ich das Kulanz-Angebot vor der Analyse ablehnen?',
    a: 'Nein. Der Diagnose-Check in Schritt 1 sagt dir, ob du das Angebot annehmen oder ablehnen solltest — das ist der erste Schritt, noch bevor du Daten hochlädst. Unterschreibe nichts, solange du dir nicht sicher bist.',
  },
  {
    q: 'Ich habe keinen Anwalt gefunden — was nun?',
    a: 'Über anwaltauskunft.de und advocado.de findest du Anwälte nach Postleitzahl und Schwerpunkt. Such nach "Produkthaftung" oder "Kaufrechtsmängel PV-Anlage". Viele Kanzleien bieten eine kostenlose oder günstige Erstberatung an.',
  },
]

function FaqList() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full text-left px-5 py-4 flex items-start justify-between gap-4"
          >
            <span className="text-sm font-semibold text-gray-900 leading-snug">{item.q}</span>
            <svg
              className={`w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5 transition-transform ${open === i ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function TrustCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 text-sm mb-2">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────

function UploadIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  )
}

function CpuIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  )
}
