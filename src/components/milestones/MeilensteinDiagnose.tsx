interface Props {
  onComplete: () => void
}

export function MeilensteinDiagnose({ onComplete }: Props) {
  return (
    <div className="min-h-[calc(100vh-112px)] flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full px-5 py-8 space-y-6">

        <div>
          <p className="text-sm font-semibold text-blue-600 mb-1">Schritt 1 von 5</p>
          <h1 className="text-2xl font-bold text-gray-900">Diagnose &amp; Kulanz-Check</h1>
          <p className="mt-2 text-base text-gray-600 leading-relaxed">
            Wir klären, welche Ansprüche Sie haben — und ob das Angebot von SENEC
            fair ist oder Sie kämpfen sollten.
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Welche Ansprüche habe ich?</h2>
              <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                6 kurze Fragen zu Ihrer Anlage — wir zeigen Ihnen welche Rechte Sie haben.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Soll ich das Kulanz-Angebot annehmen?</h2>
              <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                Wir vergleichen das Angebot mit Ihrem geschätzten Schaden und geben eine
                klare Ampel-Empfehlung.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>Hinweis:</strong> SolarProof gibt keine Rechtsberatung. Die Einschätzung
            ersetzt nicht den Rat eines Anwalts — sie ist Ihre Grundlage für eine informierte
            Entscheidung.
          </p>
        </div>

        {/* Placeholder CTA — wird durch echten Fragenkatalog ersetzt */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center">
          <p className="text-sm text-gray-500 mb-3">
            Der Diagnose-Fragekatalog wird in Phase 2 gebaut.
          </p>
          <button
            onClick={onComplete}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm py-2.5 px-5 rounded-xl transition-colors"
          >
            Weiter zu Schritt 2 →
          </button>
        </div>

      </div>
    </div>
  )
}
