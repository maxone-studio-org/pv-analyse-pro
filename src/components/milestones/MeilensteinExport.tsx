interface Props {
  onComplete: () => void
}

const SENEC_STEPS = [
  { n: 1, text: 'mein-senec.de aufrufen und einloggen' },
  { n: 2, text: 'Bereich „Auswertungen" öffnen' },
  { n: 3, text: 'Zeitraum wählen — mindestens 12 Monate' },
  { n: 4, text: 'Export als CSV auslösen' },
  { n: 5, text: 'Datei speichern und hier hochladen' },
]

export function MeilensteinExport({ onComplete }: Props) {
  return (
    <div className="min-h-[calc(100vh-112px)] flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full px-5 py-8 space-y-6">

        <div>
          <p className="text-sm font-semibold text-blue-600 mb-1">Schritt 2 von 5</p>
          <h1 className="text-2xl font-bold text-gray-900">Daten exportieren</h1>
          <p className="mt-2 text-base text-gray-600 leading-relaxed">
            Laden Sie Ihre SENEC-Messdaten herunter. SolarProof erklärt jeden Klick
            mit Screenshot-Anleitung.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded">SENEC</span>
              <span className="text-sm font-semibold text-gray-700">mein-senec.de</span>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {SENEC_STEPS.map((s) => (
              <div key={s.n} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {s.n}
                </span>
                <span className="text-sm text-gray-700 leading-relaxed">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Andere Hersteller</h3>
          <div className="flex flex-wrap gap-2">
            {['SMA · Sunny Portal', 'Fronius · Solar.web', 'Huawei · FusionSolar', 'Kostal · Solar Portal'].map((h) => (
              <span key={h} className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg">
                {h}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400">Anleitungen folgen in einer nächsten Version.</p>
        </div>

        {/* Placeholder CTA */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center">
          <p className="text-sm text-gray-500 mb-3">
            Die Screenshot-Anleitung wird in Phase 3 gebaut.
          </p>
          <button
            onClick={onComplete}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm py-2.5 px-5 rounded-xl transition-colors"
          >
            Weiter zu Schritt 3 — Analyse →
          </button>
        </div>

      </div>
    </div>
  )
}
