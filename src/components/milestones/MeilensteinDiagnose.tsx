import { useState, useEffect, useRef } from 'react'

const KULANZ_AI_URL = 'https://panel.maxone.one/functions/v1/kulanz-ai'

export const DIAGNOSE_RESULT_KEY = 'sp-diagnose-result'

export interface DiagnoseResult {
  kaufjahr: string
  modell: string
  defektArt: string
  kommuniziert: string
  kulanzangebot: string
  anlagenwert: string
  verzichtsklausel: string
  kulanzBetrag: string
  ampel: 'gruen' | 'gelb' | 'rot' | null
  coveragePct: number | null
}

type Step =
  | 'kaufjahr' | 'modell' | 'defektArt' | 'kommuniziert'
  | 'kulanzangebot' | 'anlagenwert' | 'verzichtsklausel'
  | 'kulanzBetrag' | 'ergebnis'

interface Answers {
  kaufjahr: string
  modell: string
  defektArt: string
  kommuniziert: string
  kulanzangebot: string
  anlagenwert: string
  verzichtsklausel: string
  kulanzBetrag: string
}

const EMPTY: Answers = {
  kaufjahr: '', modell: '', defektArt: '', kommuniziert: '',
  kulanzangebot: '', anlagenwert: '', verzichtsklausel: '', kulanzBetrag: '',
}

const KAUFJAHRE = ['2015','2016','2017','2018','2019','2020','2021','2022','2023','2024','2025']

const SENEC_MODELLE = [
  'SENEC.Home V2',
  'SENEC.Home V2.1',
  'SENEC.Home V2.5',
  'SENEC.Home V3 Hybrid',
  'SENEC.Home V3 Hybrid duo',
  'Sonstiges / Unbekannt',
]

const DEFEKTE = [
  { id: 'totalausfall', label: 'Totalausfall', desc: 'Speicher lädt oder entlädt nicht mehr' },
  { id: 'drosselung',   label: 'Drosselung auf 70%', desc: 'SENEC hat den Speicher per Software begrenzt' },
  { id: 'teilausfall',  label: 'Teilausfall', desc: 'Speicher arbeitet, aber schlechter als erwartet' },
  { id: 'sonstiges',   label: 'Sonstiges', desc: 'Anderes Problem mit dem Speicher' },
]

function loadSaved(): { history: Step[]; answers: Answers } {
  try {
    const raw = localStorage.getItem(DIAGNOSE_RESULT_KEY)
    if (!raw) return { history: ['kaufjahr'], answers: EMPTY }
    const r = JSON.parse(raw) as DiagnoseResult
    const a: Answers = {
      kaufjahr:        r.kaufjahr        ?? '',
      modell:          r.modell          ?? '',
      defektArt:       r.defektArt       ?? '',
      kommuniziert:    r.kommuniziert    ?? '',
      kulanzangebot:   r.kulanzangebot   ?? '',
      anlagenwert:     r.anlagenwert     ?? '',
      verzichtsklausel: r.verzichtsklausel ?? '',
      kulanzBetrag:    r.kulanzBetrag    ?? '',
    }
    return { history: ['kaufjahr', 'ergebnis'], answers: a }
  } catch {
    return { history: ['kaufjahr'], answers: EMPTY }
  }
}

interface Props { onComplete: () => void }

export function MeilensteinDiagnose({ onComplete }: Props) {
  const saved = loadSaved()
  const [history, setHistory] = useState<Step[]>(saved.history)
  const [answers, setAnswers] = useState<Answers>(saved.answers)
  const [angebotText, setAngebotText] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const analysisRef = useRef<HTMLDivElement>(null)

  const step = history[history.length - 1]

  function set(k: keyof Answers, v: string) {
    setAnswers(prev => ({ ...prev, [k]: v }))
  }
  function push(s: Step) { setHistory(prev => [...prev, s]) }
  function goBack() { setHistory(prev => prev.length > 1 ? prev.slice(0, -1) : prev) }
  function reset() {
    try { localStorage.removeItem(DIAGNOSE_RESULT_KEY) } catch {}
    setHistory(['kaufjahr'])
    setAnswers(EMPTY)
    setAiAnalysis(null)
    setAiError(null)
    setAngebotText('')
  }

  async function analyzeWithVector() {
    setAiLoading(true)
    setAiError(null)
    setAiAnalysis(null)
    try {
      const aw = parseFloat(answers.anlagenwert)
      const kb = parseFloat(answers.kulanzBetrag)
      const pct = !isNaN(aw) && aw > 0 && !isNaN(kb) && kb > 0 ? Math.round((kb / aw) * 100) : null
      const diagnose = { ...answers, ampel: computeAmpel(), coveragePct: pct }
      const body: Record<string, unknown> = { diagnose, angebotText: angebotText.trim() || undefined }
      const res = await fetch(KULANZ_AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? 'Unbekannter Fehler')
      setAiAnalysis(data.analysis)
      setTimeout(() => analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (e) {
      setAiError(e instanceof Error ? e.message : String(e))
    } finally {
      setAiLoading(false)
    }
  }

  const questionSteps: Step[] = [
    'kaufjahr', 'modell', 'defektArt', 'kommuniziert', 'kulanzangebot', 'anlagenwert',
    ...(answers.kulanzangebot === 'ja' ? ['verzichtsklausel' as Step, 'kulanzBetrag' as Step] : []),
  ]
  const totalQ = questionSteps.length
  const currentQ = Math.max(1, questionSteps.indexOf(step) + 1)

  function computeAmpel(): 'gruen' | 'gelb' | 'rot' | null {
    if (answers.kulanzangebot !== 'ja') return null
    if (answers.verzichtsklausel === 'ja') return 'rot'
    if (answers.defektArt === 'drosselung') return 'rot'
    const aw = parseFloat(answers.anlagenwert)
    const kb = parseFloat(answers.kulanzBetrag)
    if (!isNaN(aw) && aw > 0 && !isNaN(kb) && kb > 0) {
      const pct = (kb / aw) * 100
      if (pct >= 100) return 'gruen'
      if (pct >= 80) return 'gelb'
      return 'rot'
    }
    return answers.verzichtsklausel === 'nein' ? 'gelb' : 'rot'
  }

  function getAnsprueche(): string[] {
    const age = 2026 - (parseInt(answers.kaufjahr) || 2020)
    const result: string[] = []
    if (age <= 2)
      result.push('Gesetzliche Gewährleistung (2 Jahre) — automatisch gültig')
    else if (age <= 5)
      result.push('Gesetzliche Gewährleistung abgelaufen — SENEC-Garantie prüfen (meist 5–10 Jahre)')
    else
      result.push('Gewährleistung abgelaufen — Ihren Garantievertrag mit SENEC prüfen')
    if (answers.defektArt === 'drosselung')
      result.push('Sachmangel: OLG Hamm Az. 2 U 5/25 (11.04.2025) — Drosselung = Rücktrittsrecht')
    else if (answers.defektArt === 'totalausfall')
      result.push('Erheblicher Sachmangel — Rücktritt und Schadensersatz möglich')
    else if (answers.defektArt === 'teilausfall')
      result.push('Sachmangel — Nachbesserung fordern; bei Fehlschlagen: Rücktritt')
    if (answers.kommuniziert === 'nein')
      result.push('Tipp: Mangel schriftlich bei SENEC melden — startet Fristen')
    return result
  }

  // Persist result to localStorage so M5 can read it
  useEffect(() => {
    if (step !== 'ergebnis') return
    const aw = parseFloat(answers.anlagenwert)
    const kb = parseFloat(answers.kulanzBetrag)
    const pct = !isNaN(aw) && aw > 0 && !isNaN(kb) && kb > 0
      ? Math.round((kb / aw) * 100)
      : null
    const result: DiagnoseResult = { ...answers, ampel: computeAmpel(), coveragePct: pct }
    try { localStorage.setItem(DIAGNOSE_RESULT_KEY, JSON.stringify(result)) } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // ─── Shared layout ─────────────────────────────────────────────────────────

  const progressBar = step !== 'ergebnis' && (
    <div className="space-y-1.5">
      {history.length > 1 && (
        <button onClick={goBack} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Zurück
        </button>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Frage {currentQ} von {totalQ}</span>
        <span className="text-xs font-medium text-blue-600">Diagnose</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${(currentQ / totalQ) * 100}%` }}
        />
      </div>
    </div>
  )

  function shell(children: React.ReactNode) {
    return (
      <div className="min-h-[calc(100vh-112px)] flex flex-col">
        <div className="flex-1 max-w-xl mx-auto w-full px-5 py-6 space-y-5">
          {progressBar}
          {children}
        </div>
      </div>
    )
  }

  // ─── Steps ─────────────────────────────────────────────────────────────────

  if (step === 'kaufjahr') return shell(
    <>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Wann haben Sie Ihre Anlage gekauft?</h2>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">Das Kaufdatum bestimmt Ihre Gewährleistungsrechte.</p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {KAUFJAHRE.map(y => (
          <button
            key={y}
            onClick={() => { set('kaufjahr', y); push('modell') }}
            className={`py-3.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
              answers.kaufjahr === y
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
            }`}
          >{y}</button>
        ))}
      </div>
    </>
  )

  if (step === 'modell') return shell(
    <>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Welches SENEC-Modell haben Sie?</h2>
        <p className="mt-1 text-sm text-gray-500">Steht auf dem Gerät oder in Ihren Unterlagen.</p>
      </div>
      <div className="space-y-2">
        {SENEC_MODELLE.map(m => (
          <button
            key={m}
            onClick={() => { set('modell', m); push('defektArt') }}
            className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-colors ${
              answers.modell === m
                ? 'bg-blue-50 border-blue-400 text-blue-900'
                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
            }`}
          >{m}</button>
        ))}
      </div>
    </>
  )

  if (step === 'defektArt') return shell(
    <>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Was ist das Problem mit Ihrem Speicher?</h2>
        <p className="mt-1 text-sm text-gray-500">Wählen Sie die beste Beschreibung.</p>
      </div>
      <div className="space-y-2.5">
        {DEFEKTE.map(d => (
          <button
            key={d.id}
            onClick={() => { set('defektArt', d.id); push('kommuniziert') }}
            className={`w-full text-left px-4 py-4 rounded-xl border-2 transition-colors ${
              answers.defektArt === d.id ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <p className={`font-semibold text-sm ${answers.defektArt === d.id ? 'text-blue-900' : 'text-gray-900'}`}>{d.label}</p>
            <p className={`text-xs mt-0.5 leading-relaxed ${answers.defektArt === d.id ? 'text-blue-600' : 'text-gray-500'}`}>{d.desc}</p>
          </button>
        ))}
      </div>
    </>
  )

  if (step === 'kommuniziert') return shell(
    <>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Haben Sie SENEC bereits kontaktiert?</h2>
        <p className="mt-1 text-sm text-gray-500">Z.B. per E-Mail, Telefon oder über das Kundenportal.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[{ v: 'ja', l: 'Ja' }, { v: 'nein', l: 'Nein' }].map(({ v, l }) => (
          <button
            key={v}
            onClick={() => { set('kommuniziert', v); push('kulanzangebot') }}
            className={`py-5 rounded-2xl text-base font-semibold border-2 transition-colors ${
              answers.kommuniziert === v
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
            }`}
          >{l}</button>
        ))}
      </div>
    </>
  )

  if (step === 'kulanzangebot') return shell(
    <>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Hat SENEC Ihnen ein Kulanz-Angebot gemacht?</h2>
        <p className="mt-1 text-sm text-gray-500">Ein schriftliches oder mündliches Angebot zur Lösung des Problems.</p>
      </div>
      <div className="space-y-2.5">
        {[
          { v: 'ja',        l: 'Ja, ich habe ein Angebot erhalten' },
          { v: 'ausstehend', l: 'Ich warte noch auf ein Angebot' },
          { v: 'nein',      l: 'Nein, kein Angebot' },
        ].map(({ v, l }) => (
          <button
            key={v}
            onClick={() => { set('kulanzangebot', v); push('anlagenwert') }}
            className={`w-full text-left px-4 py-4 rounded-xl border-2 text-sm font-medium transition-colors ${
              answers.kulanzangebot === v
                ? 'bg-blue-50 border-blue-400 text-blue-900'
                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
            }`}
          >{l}</button>
        ))}
      </div>
    </>
  )

  const nextAfterAnlagenwert: Step = answers.kulanzangebot === 'ja' ? 'verzichtsklausel' : 'ergebnis'

  if (step === 'anlagenwert') return shell(
    <>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Was hat der SENEC-Speicher beim Kauf gekostet?</h2>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
          Den einmaligen Kaufpreis des Speichers aus Ihrem Vertrag — keine Strom- oder Betriebskosten.
        </p>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Kombi-Kauf (Speicher + Module + Montage)?</strong> Tragen Sie nur den Speicher-Anteil ein.
          Er steht im Vertrag als eigene Position oder beträgt typisch 30–50 % des Gesamtpreises.
        </p>
      </div>
      <div className="space-y-3">
        <div className="relative">
          <input
            type="number"
            inputMode="numeric"
            placeholder="z.B. 8000"
            value={answers.anlagenwert}
            onChange={e => set('anlagenwert', e.target.value)}
            className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3.5 pr-14 text-base font-medium text-gray-900 focus:border-blue-400 focus:outline-none"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">EUR</span>
        </div>
        <button
          onClick={() => push(nextAfterAnlagenwert)}
          className="w-full py-3.5 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          {answers.anlagenwert ? 'Weiter →' : 'Überspringen →'}
        </button>
      </div>
    </>
  )

  if (step === 'verzichtsklausel') return shell(
    <>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Enthält das Angebot eine Verzichtsklausel?</h2>
        <p className="mt-1 text-sm text-gray-500">Eine Klausel, mit der Sie auf alle weiteren Ansprüche verzichten.</p>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Typische Formulierung:</strong> „Mit Annahme dieses Angebots verzichtet der Kunde auf alle weiteren Ansprüche gegenüber SENEC."
        </p>
      </div>
      <div className="space-y-2.5">
        {[
          { v: 'ja',       l: 'Ja, enthält eine Verzichtsklausel' },
          { v: 'nein',     l: 'Nein, keine Verzichtsklausel gefunden' },
          { v: 'unbekannt', l: 'Ich bin mir nicht sicher' },
        ].map(({ v, l }) => (
          <button
            key={v}
            onClick={() => { set('verzichtsklausel', v); push('kulanzBetrag') }}
            className={`w-full text-left px-4 py-4 rounded-xl border-2 text-sm font-medium transition-colors ${
              answers.verzichtsklausel === v
                ? 'bg-blue-50 border-blue-400 text-blue-900'
                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
            }`}
          >{l}</button>
        ))}
      </div>
    </>
  )

  if (step === 'kulanzBetrag') return shell(
    <>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Wie hoch ist das Kulanz-Angebot?</h2>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
          Den Betrag aus dem schriftlichen SENEC-Angebot — genau so wie auf dem Dokument angegeben.
        </p>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Mündliches Angebot?</strong> Tragen Sie den genannten Betrag ein und notieren Sie Datum
          und Gesprächspartner. Eine spätere schriftliche Bestätigung bei SENEC anzufordern ist empfehlenswert.
        </p>
      </div>
      <div className="space-y-3">
        <div className="relative">
          <input
            type="number"
            inputMode="numeric"
            placeholder="z.B. 3500"
            value={answers.kulanzBetrag}
            onChange={e => set('kulanzBetrag', e.target.value)}
            className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3.5 pr-14 text-base font-medium text-gray-900 focus:border-blue-400 focus:outline-none"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">EUR</span>
        </div>
        <button
          onClick={() => push('ergebnis')}
          disabled={!answers.kulanzBetrag}
          className="w-full py-3.5 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Auswertung anzeigen →
        </button>
        <button onClick={() => push('ergebnis')} className="w-full text-sm text-gray-400 hover:text-gray-600 py-1">
          Ohne Betrag fortfahren
        </button>
      </div>
    </>
  )

  // ─── Ergebnis ──────────────────────────────────────────────────────────────

  const ampel = computeAmpel()
  const ansprueche = getAnsprueche()

  const AMPEL_CFG = {
    gruen: {
      wrap: 'bg-green-50 border-green-200',
      badge: 'bg-green-600 text-white',
      text: 'text-green-800',
      heading: 'Angebot annehmen',
      icon: '✓',
      body: 'Das Angebot deckt Ihren Schaden vollständig ab — ohne Haken. Sie können es annehmen.',
    },
    gelb: {
      wrap: 'bg-amber-50 border-amber-200',
      badge: 'bg-amber-400 text-white',
      text: 'text-amber-800',
      heading: 'Anwalt konsultieren',
      icon: '!',
      body: 'Das Angebot deckt nicht Ihren vollen Schaden. Lassen Sie es von einem Anwalt prüfen, bevor Sie unterschreiben.',
    },
    rot: {
      wrap: 'bg-red-50 border-red-200',
      badge: 'bg-red-600 text-white',
      text: 'text-red-800',
      heading: 'Angebot ablehnen',
      icon: '✗',
      body: answers.verzichtsklausel === 'ja'
        ? 'Das Angebot enthält eine Verzichtsklausel. Mit Ihrer Unterschrift verlieren Sie alle weiteren Ansprüche — und das kann erheblich mehr sein.'
        : 'Nach dem Urteil des OLG Hamm vom 11.04.2025 stellt bereits eine Drosselung auf 70% einen Sachmangel dar, der zum Rücktritt berechtigt. Bei einem Totalausfall gilt das erst recht.',
    },
  }

  const aw = parseFloat(answers.anlagenwert)
  const kb = parseFloat(answers.kulanzBetrag)
  const coveragePct = !isNaN(aw) && aw > 0 && !isNaN(kb) && kb > 0
    ? Math.round((kb / aw) * 100)
    : null

  return (
    <div className="min-h-[calc(100vh-112px)] flex flex-col">
      <div className="flex-1 max-w-xl mx-auto w-full px-5 py-6 space-y-4">

        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-0.5">Schritt 1 · Diagnose</p>
          <h2 className="text-xl font-bold text-gray-900">Ihre Einschätzung</h2>
        </div>

        {ampel && (
          <div className={`rounded-2xl border p-5 ${AMPEL_CFG[ampel].wrap}`}>
            <div className="flex items-start gap-3.5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold ${AMPEL_CFG[ampel].badge}`}>
                {AMPEL_CFG[ampel].icon}
              </div>
              <div>
                <p className={`font-bold text-base ${AMPEL_CFG[ampel].text}`}>{AMPEL_CFG[ampel].heading}</p>
                <p className={`text-sm mt-1 leading-relaxed ${AMPEL_CFG[ampel].text}`}>{AMPEL_CFG[ampel].body}</p>
              </div>
            </div>
            {coveragePct !== null && (
              <p className={`text-xs mt-3 pt-3 border-t border-black/5 ${AMPEL_CFG[ampel].text}`}>
                Das Angebot ({kb.toLocaleString('de-DE')} €) entspricht <strong>{coveragePct}%</strong> des Speicher-Kaufpreises ({aw.toLocaleString('de-DE')} €).
              </p>
            )}
          </div>
        )}

        {/* Vector KI-Analyse */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Vector analysiert Ihr Angebot</h3>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Optional: Fügen Sie den Wortlaut Ihres SENEC-Angebots ein — Vector gibt Ihnen eine persönliche Einschätzung.
          </p>
          <textarea
            value={angebotText}
            onChange={e => setAngebotText(e.target.value)}
            placeholder="Wortlaut des Kulanz-Angebots (optional) ..."
            rows={3}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:outline-none resize-none"
          />
          <button
            onClick={() => { analyzeWithVector() }}
            disabled={aiLoading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {aiLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Vector analysiert …
              </>
            ) : 'Jetzt analysieren →'}
          </button>
          {aiError && (
            <p className="text-xs text-red-600 leading-relaxed">Fehler: {aiError}</p>
          )}
          {aiAnalysis && (
            <div ref={analysisRef} className="bg-gray-900 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">Vector</p>
              <p className="text-sm text-gray-100 leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Ihre möglichen Ansprüche</h3>
          <ul className="space-y-2.5">
            {ansprueche.map((a, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{a}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-800 leading-relaxed">
            SolarProof gibt keine Rechtsberatung. Diese Einschätzung ist Ihre Grundlage für eine informierte Entscheidung — kein Ersatz für anwaltlichen Rat.
          </p>
        </div>

        <button
          onClick={onComplete}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-base py-4 rounded-xl transition-colors"
        >
          Weiter zu Schritt 2 — Datenexport →
        </button>

        <button onClick={reset} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">
          Neu starten
        </button>

      </div>
    </div>
  )
}
