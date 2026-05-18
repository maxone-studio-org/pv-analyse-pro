import { useState } from 'react'
import { submitLawyer } from '../data/lawyers'

interface Props {
  onSuccess: () => void
}

const inputCls = 'w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-blue-400 focus:outline-none'

export function AnwaltEmpfehlenForm({ onSuccess }: Props) {
  const [name, setName]                     = useState('')
  const [kanzlei, setKanzlei]               = useState('')
  const [plz, setPlz]                       = useState('')
  const [ort, setOrt]                       = useState('')
  const [website, setWebsite]               = useState('')
  const [beschreibung, setBeschreibung]     = useState('')
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await submitLawyer({ name, kanzlei, plz, ort, website: website || undefined, beschreibung: beschreibung || undefined })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <input required value={name} onChange={e => setName(e.target.value)}
            placeholder="Name des Anwalts *" className={inputCls} />
        </div>
        <div className="col-span-2">
          <input required value={kanzlei} onChange={e => setKanzlei(e.target.value)}
            placeholder="Kanzleiname *" className={inputCls} />
        </div>
        <input required value={plz} onChange={e => setPlz(e.target.value.replace(/\D/g, '').slice(0, 5))}
          placeholder="PLZ *" inputMode="numeric" maxLength={5}
          className="bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-blue-400 focus:outline-none" />
        <input required value={ort} onChange={e => setOrt(e.target.value)}
          placeholder="Ort *"
          className="bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-blue-400 focus:outline-none" />
        <div className="col-span-2">
          <input value={website} onChange={e => setWebsite(e.target.value)}
            placeholder="Website (optional)" className={inputCls} />
        </div>
        <div className="col-span-2">
          <textarea value={beschreibung} onChange={e => setBeschreibung(e.target.value)}
            placeholder="Deine Erfahrung mit dem Anwalt (optional) — hilft anderen Betroffenen"
            rows={3} className={`${inputCls} resize-none`} />
        </div>
      </div>

      {error && <p className="text-xs text-red-500 break-all">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors">
        {loading ? 'Wird eingereicht …' : 'Anwalt empfehlen →'}
      </button>
      <p className="text-xs text-gray-400 text-center">Wir prüfen jeden Eintrag vor der Veröffentlichung.</p>
    </form>
  )
}
