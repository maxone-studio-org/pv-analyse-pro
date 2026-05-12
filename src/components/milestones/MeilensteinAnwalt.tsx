interface Props {
  onBack: () => void
  onComplete: () => void
}

const TIPPS = [
  {
    title: 'Schwerpunkt: Produkthaftung oder Kaufrecht',
    desc: 'Suchen Sie nach Anwälten mit Erfahrung in „Produkthaftung", „PV-Anlagen" oder „Kaufrechtsmängel". SENEC-Fälle häufen sich — viele Kanzleien haben bereits Erfahrung.',
  },
  {
    title: 'Anwaltssuche: anwaltauskunft.de oder advocado.de',
    desc: 'PLZ eingeben, Schwerpunkt wählen. Viele Anwälte bieten eine kostenlose oder günstige Erstberatung an.',
  },
  {
    title: 'Das bringen Sie mit',
    desc: 'SolarProof-PDF, Kaufvertrag, alle Schreiben mit SENEC, Kulanz-Angebot (wenn vorhanden). Je mehr Dokumentation, desto schneller die Einschätzung.',
  },
  {
    title: 'OLG Hamm als Argument',
    desc: 'Az. 2 U 5/25 (11.04.2025) — Drosselung auf 70% = Sachmangel, Rücktrittsrecht. Bei Totalausfall gilt das erst recht.',
  },
]

const LINKS = [
  { label: 'anwaltauskunft.de', href: 'https://www.anwaltauskunft.de' },
  { label: 'advocado.de',       href: 'https://www.advocado.de' },
]

export function MeilensteinAnwalt({ onBack, onComplete }: Props) {
  return (
    <div className="min-h-[calc(100vh-112px)] flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full px-5 py-8 space-y-5">

        <div>
          <p className="text-sm font-semibold text-blue-600 mb-1">Schritt 4 von 5</p>
          <h1 className="text-2xl font-bold text-gray-900">Anwalt finden</h1>
          <p className="mt-2 text-base text-gray-600 leading-relaxed">
            Ihr SolarProof-Nachweis ist erstellt. Jetzt brauchen Sie einen Anwalt mit SENEC-Erfahrung.
          </p>
        </div>

        {/* Nachweis-Bestätigung */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3.5">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-green-900">Nachweis erstellt</p>
            <p className="text-sm text-green-700 mt-0.5 leading-relaxed">
              Ihr SolarProof-PDF mit SHA-256-Hash und RFC 3161-Zeitstempel ist bereit.
              Zeigen Sie es bei der ersten Anwaltsberatung vor.
            </p>
          </div>
        </div>

        {/* Tipps */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">So finden Sie den richtigen Anwalt</h3>
          </div>
          <div className="p-5 space-y-4">
            {TIPPS.map((t, i) => (
              <div key={i} className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{t.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Direkt-Links */}
        <div className="grid grid-cols-2 gap-3">
          {LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 bg-white border-2 border-gray-200 hover:border-blue-300 text-gray-700 font-medium text-sm py-3.5 rounded-xl transition-colors"
            >
              {label}
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
        </div>

        {/* Coming soon */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-1.5">
          <p className="text-sm font-semibold text-blue-900">Demnächst: Automatisches Matching</p>
          <p className="text-sm text-blue-700 leading-relaxed">
            Wir bauen ein Netzwerk von Anwälten mit SENEC-Erfahrung in Ihrer Region —
            kein bezahltes Ranking, nur Relevanz, kostenlose Ersteinschätzung vieler Partner.
          </p>
        </div>

        <button
          onClick={onComplete}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-base py-4 rounded-xl transition-colors"
        >
          Weiter zu Schritt 5 — Anwalt briefen →
        </button>

        <button
          onClick={onBack}
          className="w-full text-sm text-gray-400 hover:text-gray-600 py-2"
        >
          ← Zurück zur Analyse
        </button>

      </div>
    </div>
  )
}
