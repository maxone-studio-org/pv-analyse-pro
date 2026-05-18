import { useState, useEffect } from 'react'
import { AnwaltEmpfehlenForm } from './AnwaltEmpfehlenForm'

interface Props {
  onClose: () => void
}

export function AnwaltEmpfehlenOverlay({ onClose }: Props) {
  const [done, setDone] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-8">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Anwalt empfehlen</h2>
            <p className="text-xs text-gray-500 mt-0.5">Hilf anderen SENEC-Betroffenen deutschlandweit.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {done ? (
          <div className="px-6 py-8 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-bold text-green-900">Danke für deine Empfehlung!</p>
            <p className="text-sm text-green-700 leading-relaxed">
              Wir prüfen den Eintrag und schalten ihn frei — damit hilfst du anderen SENEC-Betroffenen.
            </p>
            <button onClick={onClose}
              className="mt-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors">
              Schließen
            </button>
          </div>
        ) : (
          <div className="px-6 py-5">
            <AnwaltEmpfehlenForm onSuccess={() => setDone(true)} />
          </div>
        )}
      </div>
    </div>
  )
}
