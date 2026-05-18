import { useState, useEffect } from 'react'
import { fetchLawyers, plzToBundesland, type Lawyer } from '../../data/lawyers'
import { AnwaltEmpfehlenForm } from '../AnwaltEmpfehlenForm'
import { useContent } from '../../hooks/useContent'
import { ANWALT_TIPPS_DEFAULT, type AnwaltTippsContent } from '../../data/contentDefaults'

interface Props {
  onBack: () => void
  onComplete: () => void
}


function AnwaltEmpfehlenCard() {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3.5">
        <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-green-900 text-sm">Danke für deine Empfehlung!</p>
          <p className="text-xs text-green-700 mt-0.5 leading-relaxed">
            Wir prüfen den Eintrag und schalten ihn frei — damit hilfst du anderen SENEC-Betroffenen.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border-2 transition-colors overflow-hidden ${open ? 'border-blue-300 bg-blue-50' : 'border-dashed border-blue-200 bg-white hover:border-blue-300'}`}>
      {!open ? (
        <button onClick={() => setOpen(true)} className="w-full p-5 flex items-center gap-4 text-left">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">Kennst du einen Anwalt mit SENEC-Erfahrung?</p>
            <p className="text-xs text-gray-500 mt-0.5">Empfiehl ihn — und hilf anderen Betroffenen deutschlandweit.</p>
          </div>
          <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ) : (
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-blue-900">Anwalt empfehlen</p>
            <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <AnwaltEmpfehlenForm onSuccess={() => setDone(true)} />
        </div>
      )}
    </div>
  )
}

function LawyerCard({ lawyer, onContact }: { lawyer: Lawyer; onContact: (l: Lawyer) => void }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 space-y-3 ${lawyer.listing_typ === 'premium' ? 'border-blue-200' : 'border-gray-100'}`}>
      {lawyer.listing_typ === 'premium' && (
        <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">Partner</span>
      )}
      <div>
        <p className="font-bold text-gray-900 text-sm">{lawyer.name}</p>
        <p className="text-xs text-gray-500">{lawyer.kanzlei}</p>
        <p className="text-xs text-gray-400 mt-0.5">{lawyer.ort} · {lawyer.bundesland}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {lawyer.schwerpunkte.map(s => (
          <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        {lawyer.senec_faelle > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-[10px]">✓</span>
            {lawyer.senec_faelle} SENEC-Fälle
          </span>
        )}
        <span>
          {lawyer.erstberatung_kostenlos
            ? '✓ Erstberatung kostenlos'
            : lawyer.erstberatung_eur
              ? `Erstberatung ab ${lawyer.erstberatung_eur} €`
              : 'Erstberatung auf Anfrage'}
        </span>
      </div>

      {lawyer.beschreibung && (
        <p className="text-xs text-gray-600 leading-relaxed">{lawyer.beschreibung}</p>
      )}

      {lawyer.website && (
        <a
          href={lawyer.website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onContact(lawyer)}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
        >
          {lawyer.website.replace(/^https?:\/\//, '')}
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  )
}

function trackClick(lawyer: Lawyer, status: 'clicked' | 'contacted') {
  try {
    const prev: { lawyerId: string; kanzlei: string; ts: number; status: string; contactedAt?: number }[] =
      JSON.parse(localStorage.getItem('sp-referrals') || '[]')
    const existing = prev.findIndex(r => r.lawyerId === lawyer.id)
    if (existing >= 0) {
      prev[existing] = { ...prev[existing], status, ...(status === 'contacted' ? { contactedAt: Date.now() } : {}) }
    } else {
      prev.push({ lawyerId: lawyer.id, kanzlei: lawyer.kanzlei, ts: Date.now(), status })
    }
    localStorage.setItem('sp-referrals', JSON.stringify(prev))
  } catch {}
}

export function MeilensteinAnwalt({ onBack, onComplete }: Props) {
  const tippsContent = useContent<AnwaltTippsContent>('anwalt_tipps', ANWALT_TIPPS_DEFAULT)
  const [plz, setPlz] = useState('')
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [clickedLawyer, setClickedLawyer] = useState<Lawyer | null>(null)
  const [contactStep, setContactStep] = useState<'idle' | 'skipped'>('idle')

  function handleLawyerContact(lawyer: Lawyer) {
    setClickedLawyer(lawyer)
    trackClick(lawyer, 'clicked')
  }

  function confirmContact() {
    if (clickedLawyer) trackClick(clickedLawyer, 'contacted')
    onComplete()
  }

  useEffect(() => {
    fetchLawyers()
      .then(setLawyers)
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
  }, [])

  const filtered = plz.length >= 5
    ? lawyers.filter(l => l.plz.slice(0, 2) === plz.slice(0, 2))
    : lawyers

  const regional   = plz.length >= 5 ? filtered : []
  const bundesweit = plz.length >= 5 ? lawyers.filter(l => l.plz.slice(0, 2) !== plz.slice(0, 2)) : lawyers

  const userRegion = plz.length >= 5 ? plzToBundesland(plz) : null

  return (
    <div className="min-h-[calc(100vh-112px)] flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full px-5 py-8 space-y-5">

        <div>
          <p className="text-sm font-semibold text-blue-600 mb-1">Schritt 4 von 5</p>
          <h1 className="text-2xl font-bold text-gray-900">Anwalt finden</h1>
          <p className="mt-2 text-base text-gray-600 leading-relaxed">
            Dein SolarProof-Nachweis ist erstellt. Jetzt brauchst du einen Anwalt mit SENEC-Erfahrung.
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
              Dein SolarProof-PDF mit SHA-256-Hash und RFC 3161-Zeitstempel ist bereit.
              Zeig es bei der ersten Anwaltsberatung vor.
            </p>
          </div>
        </div>

        {/* PLZ-Suche */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Anwälte in deiner Nähe</h3>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={plz}
              onChange={e => setPlz(e.target.value.replace(/\D/g, ''))}
              placeholder="PLZ eingeben …"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-400 focus:outline-none"
            />
            {userRegion && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">{userRegion}</span>
            )}
          </div>

          {loading && (
            <div className="flex items-center gap-2 py-4 justify-center">
              <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-sm text-gray-400">Lade Anwälte …</span>
            </div>
          )}

          {!loading && !fetchError && lawyers.length === 0 && (
            <div className="py-4 text-center space-y-1">
              <p className="text-sm text-gray-500">Noch keine regionalen Partner eingetragen.</p>
              <p className="text-xs text-gray-400">Nutzen Sie die externen Suchen weiter unten.</p>
            </div>
          )}

          {!loading && regional.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">In deiner Region</p>
              {regional.map(l => <LawyerCard key={l.id} lawyer={l} onContact={handleLawyerContact} />)}
            </div>
          )}

          {!loading && plz.length >= 5 && regional.length === 0 && lawyers.length > 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
              Keine Einträge für {userRegion} — bundesweite Anwälte weiter unten.
            </p>
          )}

          {!loading && bundesweit.length > 0 && (
            <div className="space-y-3">
              {plz.length >= 5 && <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Bundesweit</p>}
              {bundesweit.map(l => <LawyerCard key={l.id} lawyer={l} onContact={handleLawyerContact} />)}
            </div>
          )}
        </div>

        {/* Anwalt empfehlen */}
        <AnwaltEmpfehlenCard />

        {/* Tipps */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">So finden Sie den richtigen Anwalt</h3>
          </div>
          <div className="p-5 space-y-4">
            {tippsContent.tipps.map((t, i) => (
              <div key={i} className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{t.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Externe Suchen */}
        <div className="grid grid-cols-2 gap-3">
          {tippsContent.externe_links.map(({ label, href }) => (
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

        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Hinweis:</strong> Diese Liste ist kein bezahltes Ranking und keine Vermittlung im Sinne von BRAO § 49b.
            Alle Anwälte sind öffentlich verifizierbar. SolarProof gibt keine Rechtsberatung.
          </p>
        </div>

        {/* Kontakt-Bestätigung — erscheint nach erstem Kanzlei-Klick */}
        {clickedLawyer && contactStep === 'idle' ? (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <p className="text-sm font-semibold text-blue-900">{clickedLawyer.kanzlei} geöffnet</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Hast du bereits Kontakt aufgenommen?</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Deine Bestätigung schaltet das persönliche Briefing-Paket für deinen Anwaltstermin frei.
              </p>
            </div>
            <button
              onClick={confirmContact}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm py-4 rounded-xl transition-colors"
            >
              ✓ Ja, ich habe kontaktiert — weiter zu Schritt 5 →
            </button>
            <button
              onClick={() => setContactStep('skipped')}
              className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors"
            >
              Noch nicht — ich schaue mich noch um
            </button>
          </div>
        ) : (
          <button
            onClick={onComplete}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-base py-4 rounded-xl transition-colors"
          >
            Weiter zu Schritt 5 — Anwalt briefen →
          </button>
        )}

        <button onClick={onBack} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">
          ← Zurück zur Analyse
        </button>

      </div>
    </div>
  )
}
