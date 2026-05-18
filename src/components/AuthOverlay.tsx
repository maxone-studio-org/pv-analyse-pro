import { useState } from 'react'
import type { AuthState } from '../hooks/useAuth'

interface Props {
  auth: AuthState
  onClose: () => void
}

export function AuthOverlay({ auth, onClose }: Props) {
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await auth.signIn(email.trim())
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Konto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="px-6 py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-bold text-gray-900">Magic Link gesendet</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Schau in dein Postfach bei <strong>{email}</strong> — klick den Link und du bist drin. Kein Passwort nötig.
            </p>
            <button onClick={onClose} className="mt-2 text-sm text-gray-400 hover:text-gray-600">Schließen</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <p className="text-sm text-gray-500 leading-relaxed">
              Gib deine E-Mail-Adresse ein — wir schicken dir einen Magic Link. Kein Passwort, kein Abo.
            </p>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="deine@email.de"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-400 focus:outline-none"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
            >
              {loading ? 'Wird gesendet …' : 'Magic Link senden →'}
            </button>
            <p className="text-xs text-gray-400 text-center">
              Mit der Anmeldung stimmst du zu, dass deine Falldaten optional in der Cloud gespeichert werden können.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
