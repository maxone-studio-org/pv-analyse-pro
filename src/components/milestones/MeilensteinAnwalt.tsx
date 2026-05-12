interface Props {
  onBack: () => void
}

export function MeilensteinAnwalt({ onBack }: Props) {
  return (
    <div className="min-h-[calc(100vh-112px)] flex flex-col items-center justify-center px-5 py-12">
      <div className="max-w-sm w-full text-center space-y-5">

        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-400 mb-1">Schritt 4 · Anwalt finden</p>
          <h1 className="text-xl font-bold text-gray-900">Noch nicht freigeschaltet</h1>
        </div>

        <p className="text-base text-gray-600 leading-relaxed">
          Schließen Sie zuerst Schritt 3 (Analyse) ab. Dann führen wir Sie
          direkt zum passenden Anwalt.
        </p>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left space-y-2">
          <p className="text-sm font-semibold text-blue-900">Was Sie hier erwartet:</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Anwälte mit SENEC-Erfahrung in Ihrer Region</li>
            <li>• Kein bezahltes Ranking — nur Relevanz</li>
            <li>• Kostenlose Ersteinschätzung vieler Partner</li>
          </ul>
        </div>

        <button
          onClick={onBack}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-base py-4 rounded-xl transition-colors"
        >
          ← Zurück zur Analyse
        </button>

      </div>
    </div>
  )
}
