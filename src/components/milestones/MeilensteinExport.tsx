import { useState, type ReactNode } from 'react'

interface Props {
  onComplete: () => void
}

const SENEC_STEPS = [
  {
    n: 1,
    action: 'mein-senec.de aufrufen und einloggen',
    detail: 'Nutze deine SENEC-Kundendaten. Bei Problemen: „Passwort vergessen" auf der Login-Seite.',
  },
  {
    n: 2,
    action: 'Bereich „Auswertungen" öffnen',
    detail: 'Den Menüpunkt finden Sie links in der Navigation — manchmal auch unter „Statistiken".',
  },
  {
    n: 3,
    action: 'Zeitraum wählen — mindestens 12 Monate',
    detail: 'Wählen Sie als Startdatum mindestens 12 Monate vor dem ersten Defekt. Je mehr Daten, desto besser.',
  },
  {
    n: 4,
    action: 'Export als CSV auslösen',
    detail: 'Klicken Sie auf „Export" oder das Download-Symbol. Die Datei heißt üblicherweise SENEC_Export_YYYY-MM.csv.',
  },
  {
    n: 5,
    action: 'Datei speichern — im nächsten Schritt hochladen',
    detail: 'Speichere die Datei auf deinem Gerät. In Schritt 3 kannst du sie direkt hochladen.',
  },
]

const PROBLEME: { q: string; a: ReactNode }[] = [
  {
    q: 'Ich komme nicht in mein SENEC-Konto.',
    a: 'Nutze die „Passwort vergessen"-Funktion auf mein-senec.de. Falls das Konto nicht existiert: Registriere dich mit der E-Mail-Adresse aus deinem Kaufvertrag.',
  },
  {
    q: 'Ich sehe keinen Export-Button.',
    a: (
      <div className="space-y-3">
        <p>
          Bei älteren SENEC-Modellen (V2 und früher) sind Messdaten manchmal nur per Anfrage
          beim Kundendienst erhältlich. Das ist dein Recht:{' '}
          <strong>Art. 15 DSGVO verpflichtet SENEC, deine personenbezogenen Daten auf Anfrage herauszugeben.</strong>
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 space-y-2">
          <p className="text-xs font-semibold text-gray-700">Vorlage: E-Mail an service@senec.com</p>
          <p className="text-xs text-gray-500 italic">
            Betreff: Auskunft und Herausgabe Messdaten gem. Art. 15 DSGVO — Kundennr. [deine Nummer]
          </p>
          <p className="text-xs text-gray-600 leading-relaxed italic">
            „Sehr geehrte Damen und Herren, ich bitte um Herausgabe meiner vollständigen Messdaten
            (Lade- und Entladevorgänge, Energiebilanz) für den Zeitraum [Datum von] bis [Datum bis]
            in maschinenlesbarem Format (CSV oder Excel). Rechtsgrundlage: Art. 15 DSGVO.
            Bitte antworten Sie innerhalb von 30 Tagen."
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Keine Antwort nach 30 Tagen?</strong> Wenden Sie sich an die zuständige
            Datenschutzaufsichtsbehörde (Bayern: BayLDA). Der schriftliche Antrag
            selbst ist bereits ein Beweisstück — bewahren Sie Datum und Versandnachweis auf.
          </p>
        </div>
      </div>
    ),
  },
  {
    q: 'Die Datei ist leer oder enthält keine sinnvollen Daten.',
    a: 'Das ist kein Fehler von dir — es ist ein weiteres Indiz. Eine leere oder fehlerhafte Exportdatei belegt, dass SENEC selbst keine verwertbaren Messdaten führt. Lade die Datei trotzdem hoch.',
  },
  {
    q: 'Ich habe mehrere CSV-Dateien (z.B. eine pro Monat).',
    a: 'SolarProof kann mehrere Dateien gleichzeitig verarbeiten. Laden Sie alle hoch — das Tool erkennt Überschneidungen automatisch.',
  },
]

export function MeilensteinExport({ onComplete }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-[calc(100vh-112px)] flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full px-5 py-8 space-y-5">

        <div>
          <p className="text-sm font-semibold text-blue-600 mb-1">Schritt 2 von 5</p>
          <h1 className="text-2xl font-bold text-gray-900">Daten exportieren</h1>
          <p className="mt-2 text-base text-gray-600 leading-relaxed">
            Lade deine SENEC-Messdaten herunter. Folge den 5 Schritten unten.
          </p>
        </div>

        {/* Direct link to SENEC portal */}
        <a
          href="https://mein-senec.de"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl px-5 py-4 transition-colors"
        >
          <div>
            <p className="font-semibold text-base">SENEC-Portal öffnen</p>
            <p className="text-sm text-blue-200 mt-0.5">mein-senec.de</p>
          </div>
          <svg className="w-6 h-6 text-blue-200 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        {/* Step-by-step guide */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
            <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded">SENEC</span>
            <span className="text-sm font-semibold text-gray-700">Schritt-für-Schritt</span>
          </div>
          <div className="p-5 space-y-4">
            {SENEC_STEPS.map((s) => (
              <div key={s.n} className="flex items-start gap-3.5">
                <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {s.n}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{s.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ — Häufige Probleme */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Häufige Probleme</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {PROBLEME.map((p, i) => (
              <div key={i}>
                <button
                  className="w-full text-left px-5 py-3.5 flex items-start justify-between gap-3"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-medium text-gray-800 leading-relaxed">{p.q}</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                    {p.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Other manufacturers */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Andere Hersteller</h3>
          <div className="flex flex-wrap gap-2">
            {['SMA · Sunny Portal', 'Fronius · Solar.web', 'Huawei · FusionSolar', 'Kostal · Solar Portal'].map((h) => (
              <span key={h} className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg">{h}</span>
            ))}
          </div>
          <p className="text-xs text-gray-400">Anleitungen folgen in einer nächsten Version.</p>
        </div>

        <button
          onClick={onComplete}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-base py-4 rounded-xl transition-colors"
        >
          Ich habe die Datei — weiter zu Schritt 3 →
        </button>

      </div>
    </div>
  )
}
