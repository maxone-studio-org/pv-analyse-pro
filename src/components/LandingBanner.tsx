import { useState } from 'react'

const STORAGE_KEY = 'pv-analyse-pro-landing-seen'

export function LandingBanner({ onOpen }: { onOpen: () => void }) {
  const [dismissed] = useState(() => localStorage.getItem(STORAGE_KEY) === '1')

  if (dismissed) return null

  return (
    <div className="mx-6 mb-2">
      <button
        onClick={onOpen}
        className="w-full group relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 text-left transition-all hover:border-amber-300 hover:shadow-md"
      >
        <div className="flex items-center gap-4">
          <div className="shrink-0 w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              Warum existiert dieses Tool?
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Ein defekter Speicher. Ein Gerichtsverfahren. Und kein Werkzeug, das hilft.
            </p>
          </div>
          <div className="shrink-0">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 group-hover:text-amber-800">
              Die Geschichte
              <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          {['SHA-256 Integrität', 'RFC 3161 Zeitstempel', 'Gerichtsverwertbar', 'Kein Backend'].map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-white/80 border border-amber-100 px-2.5 py-0.5 text-[10px] font-medium text-amber-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </button>
    </div>
  )
}
