import { useState, useEffect } from 'react'
import { DIAGNOSE_RESULT_KEY, type DiagnoseResult } from './MeilensteinDiagnose'

interface Props {
  onBack: () => void
  onComplete: () => void
}

function loadResult(): DiagnoseResult | null {
  try {
    const raw = localStorage.getItem(DIAGNOSE_RESULT_KEY)
    return raw ? (JSON.parse(raw) as DiagnoseResult) : null
  } catch {
    return null
  }
}

const DEFEKT_LABELS: Record<string, string> = {
  totalausfall: 'Totalausfall (Speicher lädt/entlädt nicht)',
  drosselung:   'Drosselung auf 70% der Kapazität',
  teilausfall:  'Teilausfall (eingeschränkte Funktion)',
  sonstiges:    'Sonstiger Defekt',
}

const AMPEL_LABELS: Record<string, string> = {
  gruen: 'Angebot annehmen (deckt Schaden vollständig)',
  gelb:  'Anwalt prüfen (Angebot unter 100%)',
  rot:   'Angebot ablehnen (Verzichtsklausel oder Drosselung)',
}

function buildEmail(r: DiagnoseResult | null): string {
  const modell  = r?.modell    || '[Ihr SENEC-Modell]'
  const kaufjahr = r?.kaufjahr  || '[Kaufjahr]'
  const defekt  = r?.defektArt  ? (DEFEKT_LABELS[r.defektArt] ?? r.defektArt) : '[Defekt beschreiben]'
  const kommuniziert = r?.kommuniziert === 'ja'
    ? 'Ich habe SENEC bereits über den Defekt informiert.'
    : 'Ich habe SENEC noch nicht kontaktiert.'

  let kulanzText = ''
  if (r?.kulanzangebot === 'ja') {
    const betrag = r.kulanzBetrag ? `${parseFloat(r.kulanzBetrag).toLocaleString('de-DE')} €` : '[Betrag]'
    const ampelLabel = r.ampel ? AMPEL_LABELS[r.ampel] : ''
    kulanzText = `\nSENEC hat mir ein Kulanzangebot in Höhe von ${betrag} unterbreitet.`
    if (r.verzichtsklausel === 'ja')
      kulanzText += ' Das Angebot enthält eine Verzichtsklausel.'
    if (r.coveragePct !== null)
      kulanzText += ` Das Angebot entspricht ${r.coveragePct}% meines Anlagenwerts.`
    if (ampelLabel)
      kulanzText += `\nEinschätzung nach OLG-Hamm-Prüfung: ${ampelLabel}.`
  } else if (r?.kulanzangebot === 'ausstehend') {
    kulanzText = '\nIch warte noch auf ein Kulanzangebot von SENEC.'
  } else if (r?.kulanzangebot === 'nein') {
    kulanzText = '\nSENEC hat mir bisher kein Kulanzangebot gemacht.'
  }

  const anlagenwertText = r?.anlagenwert
    ? `Der Anlagenwert beträgt ${parseFloat(r.anlagenwert).toLocaleString('de-DE')} €.`
    : ''

  return `Betreff: Anfrage SENEC-Speicherdefekt — ${modell} (${kaufjahr})

Sehr geehrte Damen und Herren,

ich wende mich an Sie wegen eines Defekts an meinem Batteriespeicher ${modell}, erworben ${kaufjahr}.

Problem: ${defekt}

${kommuniziert}${kulanzText}

${anlagenwertText}

Als Nachweis lege ich das SolarProof-Gutachten bei (SHA-256-Hash, RFC 3161-Zeitstempel, gerichtsverwertbar).

Rechtliche Grundlage: OLG Hamm, Az. 2 U 5/25 (11.04.2025) — Drosselung auf 70% = Sachmangel, Rücktrittsrecht. Bestätigt durch LG Darmstadt, LG Ellwangen, LG Münster, LG Rostock.

Ich bitte um eine Ersteinschätzung meines Falls.

Mit freundlichen Grüßen
[Ihr Name]
[Adresse]
[Telefon / E-Mail]`.trim()
}

const PAKET_ITEMS = [
  'SolarProof-PDF (SHA-256 + RFC 3161 Zeitstempel)',
  'Diagnose-Ergebnis & mögliche Ansprüche',
  'Kulanz-Check-Ergebnis nach OLG Hamm',
  'Vorausgefüllte E-Mail-Vorlage',
]

export function MeilensteinBriefing({ onBack, onComplete }: Props) {
  const [result]  = useState<DiagnoseResult | null>(loadResult)
  const [copied, setCopied] = useState(false)
  const [done, setDone]     = useState(false)

  const email = buildEmail(result)

  // Reset "Kopiert" badge after 2s
  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(t)
  }, [copied])

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
    } catch {
      // fallback: select the textarea
      const el = document.getElementById('sp-briefing-email') as HTMLTextAreaElement | null
      el?.select()
    }
  }

  if (done) {
    return (
      <div className="min-h-[calc(100vh-112px)] flex flex-col items-center justify-center px-5 py-12">
        <div className="max-w-sm w-full text-center space-y-5">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-green-600 mb-1">Alle 5 Schritte abgeschlossen</p>
            <h1 className="text-xl font-bold text-gray-900">Ihr Briefing-Paket ist fertig</h1>
          </div>
          <p className="text-base text-gray-600 leading-relaxed">
            Sie haben alles, was Ihr Anwalt für eine Ersteinschätzung braucht.
            Schicken Sie das SolarProof-PDF + die E-Mail ab — und warten Sie auf Rückmeldung.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left">
            <p className="text-xs font-semibold text-blue-900 mb-2">Nächste Schritte</p>
            <ol className="text-xs text-blue-800 space-y-1.5 list-decimal list-inside">
              <li>SolarProof-PDF aus Schritt 3 öffnen</li>
              <li>E-Mail-Vorlage an Ihren Anwalt senden</li>
              <li>SolarProof-PDF als Anhang hinzufügen</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-112px)] flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full px-5 py-8 space-y-5">

        <div>
          <p className="text-sm font-semibold text-blue-600 mb-1">Schritt 5 von 5</p>
          <h1 className="text-2xl font-bold text-gray-900">Anwalt briefen</h1>
          <p className="mt-2 text-base text-gray-600 leading-relaxed">
            Ihr Briefing-Paket ist vollständig. Kopieren Sie die E-Mail-Vorlage und hängen Sie das SolarProof-PDF an.
          </p>
        </div>

        {/* Paket-Inhalt */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Das Paket enthält</h3>
          </div>
          <div className="p-5 space-y-3">
            {PAKET_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnose-Zusammenfassung wenn verfügbar */}
        {result && (
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Ihre Diagnose-Daten</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <span className="text-gray-500">Kaufjahr</span>
              <span className="font-medium text-gray-800">{result.kaufjahr || '—'}</span>
              <span className="text-gray-500">Modell</span>
              <span className="font-medium text-gray-800">{result.modell || '—'}</span>
              <span className="text-gray-500">Defekt</span>
              <span className="font-medium text-gray-800">{(DEFEKT_LABELS[result.defektArt] ?? result.defektArt) || '—'}</span>
              {result.kulanzangebot === 'ja' && result.ampel && (
                <>
                  <span className="text-gray-500">Kulanz-Check</span>
                  <span className={`font-semibold ${result.ampel === 'gruen' ? 'text-green-700' : result.ampel === 'gelb' ? 'text-amber-700' : 'text-red-700'}`}>
                    {result.ampel === 'gruen' ? '🟢 Annehmen' : result.ampel === 'gelb' ? '🟡 Prüfen lassen' : '🔴 Ablehnen'}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* E-Mail-Vorlage */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">E-Mail-Vorlage</h3>
            <button
              onClick={copyEmail}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Kopiert
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Kopieren
                </>
              )}
            </button>
          </div>
          <div className="p-5">
            <textarea
              id="sp-briefing-email"
              readOnly
              value={email}
              rows={18}
              className="w-full text-xs text-gray-700 font-mono leading-relaxed bg-gray-50 rounded-xl border border-gray-100 p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <p className="text-xs text-gray-400 mt-2">
              Passen Sie die Vorlage an und fügen Sie das SolarProof-PDF als Anhang hinzu.
            </p>
          </div>
        </div>

        {/* Hinweis */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Hinweis:</strong> Ersetzen Sie alle Felder in eckigen Klammern [Ihr Name] etc.
            SolarProof gibt keine Rechtsberatung — die E-Mail-Vorlage ist ein Ausgangspunkt, kein fertiggestelltes Schreiben.
          </p>
        </div>

        <button
          onClick={() => { setDone(true); onComplete() }}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-base py-4 rounded-xl transition-colors"
        >
          Briefing-Paket ist fertig ✓
        </button>

        <button
          onClick={onBack}
          className="w-full text-sm text-gray-400 hover:text-gray-600 py-2"
        >
          ← Zurück zu Anwalt finden
        </button>

      </div>
    </div>
  )
}
