import { useAppStore } from '../store'

export function ImportWarnings() {
  const importErrors = useAppStore((s) => s.importErrors)
  const dstWarnings = useAppStore((s) => s.dstWarnings)
  const importStep = useAppStore((s) => s.importStep)
  const days = useAppStore((s) => s.days)

  if (importStep !== 'done') return null

  const parseErrors = importErrors.filter((e) => e.line > 0)
  const totalRows = days.reduce((s, d) => s + d.intervals.length, 0)

  return (
    <div className="space-y-2">
      {/* Success banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm text-green-700">
          {totalRows} Zeilen erfolgreich importiert ({days.length} Tage)
        </span>
      </div>

      {/* Parse errors */}
      {parseErrors.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
          <p className="text-sm font-medium text-yellow-800 mb-1">
            {parseErrors.length} Zeilen mit Fehlern:
          </p>
          <ul className="text-xs text-yellow-700 space-y-0.5 max-h-24 overflow-y-auto">
            {parseErrors.slice(0, 10).map((e, i) => (
              <li key={i}>Zeile {e.line}: {e.message}</li>
            ))}
            {parseErrors.length > 10 && (
              <li>... und {parseErrors.length - 10} weitere</li>
            )}
          </ul>
        </div>
      )}

      {/* DST warnings */}
      {dstWarnings.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <p className="text-sm font-medium text-blue-800 mb-1">Zeitzonenwarnungen:</p>
          <ul className="text-xs text-blue-700 space-y-0.5">
            {dstWarnings.map((w, i) => (
              <li key={i}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
