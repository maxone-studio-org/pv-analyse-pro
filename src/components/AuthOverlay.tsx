import { useState, useRef, useEffect } from 'react'
import type { AuthState } from '../hooks/useAuth'

interface Props {
  auth: AuthState
  onClose: () => void
}

export function AuthOverlay({ auth, onClose }: Props) {
  const [email, setEmail]     = useState('')
  const [otp, setOtp]         = useState(['', '', '', '', '', ''])
  const [step, setStep]       = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const inputRefs             = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (step === 'otp') inputRefs.current[0]?.focus()
  }, [step])

  async function sendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await auth.signIn(email.trim())
      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }

  async function confirmCode(e: React.FormEvent) {
    e.preventDefault()
    const token = otp.join('')
    if (token.length < 6) return
    setLoading(true)
    setError('')
    try {
      await auth.verifyOtp(email.trim(), token)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ungültiger Code')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  function handleOtpInput(i: number, value: string) {
    const digit = value.replace(/\D/, '').slice(-1)
    const next = [...otp]
    next[i] = digit
    setOtp(next)
    if (digit && i < 5) inputRefs.current[i + 1]?.focus()
  }

  function handleOtpKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus()
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('')
    if (digits.length === 6) {
      setOtp(digits)
      inputRefs.current[5]?.focus()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {step === 'email' ? 'Anmelden' : 'Code eingeben'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 'email' ? (
          <form onSubmit={sendCode} className="px-6 py-5 space-y-4">
            <p className="text-sm text-gray-500 leading-relaxed">
              Wir schicken dir einen 6-stelligen Code. Kein Passwort, kein Abo.
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
              {loading ? 'Wird gesendet …' : 'Code senden →'}
            </button>
            <p className="text-xs text-gray-400 text-center">
              Mit der Anmeldung stimmst du zu, dass deine Falldaten optional in der Cloud gespeichert werden können.
            </p>
          </form>
        ) : (
          <form onSubmit={confirmCode} className="px-6 py-5 space-y-4">
            <p className="text-sm text-gray-500 leading-relaxed">
              Code an <strong>{email}</strong> gesendet. Gib die 6 Ziffern ein:
            </p>
            <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleOtpInput(i, e.target.value)}
                  onKeyDown={e => handleOtpKey(i, e)}
                  className="w-11 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                />
              ))}
            </div>
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || otp.join('').length < 6}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
            >
              {loading ? 'Wird geprüft …' : 'Bestätigen →'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setError('') }}
              className="w-full text-xs text-gray-400 hover:text-gray-600 py-1"
            >
              Andere E-Mail-Adresse
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
