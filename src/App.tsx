import { useState, useEffect, lazy, Suspense } from 'react'
import { useAuth } from './hooks/useAuth'
import { Header } from './components/Header'
import { Prozessleiste } from './components/Prozessleiste'
import { ErrorBoundary } from './components/ErrorBoundary'
import { DuplicateDialog } from './components/DuplicateDialog'
import { useMilestones } from './hooks/useMilestones'
import { useAppStore } from './store'
import { useContent } from './hooks/useContent'
import { TRUST_STRIP_DEFAULT, type TrustStripItems } from './data/contentDefaults'
// Lokale Kopie — verhindert statischen Import von MeilensteinDiagnose (würde Lazy-Chunk brechen)
const SP_DIAGNOSE_KEY = 'sp-diagnose-result'
interface DiagnoseSnapshot { modell?: string; defektArt?: string; ampel?: string }

// ── Lazy chunks ──────────────────────────────────────────────────────────────
// Milestone-Schritte und schwere Overlays landen nicht im Initial-Bundle.
// M3Analyse kapselt jsPDF + chart.js — größter Spareffekt.

const MeilensteinDiagnose  = lazy(() => import('./components/milestones/MeilensteinDiagnose').then(m => ({ default: m.MeilensteinDiagnose })))
const MeilensteinExport    = lazy(() => import('./components/milestones/MeilensteinExport').then(m => ({ default: m.MeilensteinExport })))
const MeilensteinAnwalt    = lazy(() => import('./components/milestones/MeilensteinAnwalt').then(m => ({ default: m.MeilensteinAnwalt })))
const MeilensteinBriefing  = lazy(() => import('./components/milestones/MeilensteinBriefing').then(m => ({ default: m.MeilensteinBriefing })))
const M3Analyse            = lazy(() => import('./components/M3Analyse').then(m => ({ default: m.M3Analyse })))
const LandingOverlay       = lazy(() => import('./components/LandingOverlay').then(m => ({ default: m.LandingOverlay })))
const CreditsOverlay       = lazy(() => import('./components/CreditsOverlay').then(m => ({ default: m.CreditsOverlay })))
const ImpressumOverlay     = lazy(() => import('./components/ImpressumOverlay').then(m => ({ default: m.ImpressumOverlay })))
const DatenschutzOverlay   = lazy(() => import('./components/DatenschutzOverlay').then(m => ({ default: m.DatenschutzOverlay })))
const AdminOverlay              = lazy(() => import('./components/AdminOverlay').then(m => ({ default: m.AdminOverlay })))
const UeberUnsOverlay           = lazy(() => import('./components/UeberUnsOverlay').then(m => ({ default: m.UeberUnsOverlay })))
const AnwaltEmpfehlenOverlay    = lazy(() => import('./components/AnwaltEmpfehlenOverlay').then(m => ({ default: m.AnwaltEmpfehlenOverlay })))
const AuthOverlay               = lazy(() => import('./components/AuthOverlay').then(m => ({ default: m.AuthOverlay })))

function MilestoneSpinner() {
  return (
    <div className="min-h-[calc(100vh-112px)] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )
}

// ── App ──────────────────────────────────────────────────────────────────────

function App() {
  const auth = useAuth()

  const rehydrate        = useAppStore((s) => s.rehydrate)
  const duplicateInfo    = useAppStore((s) => s.duplicateInfo)
  const confirmDuplicate = useAppStore((s) => s.confirmDuplicate)
  const cancelDuplicate  = useAppStore((s) => s.cancelDuplicate)

  // CSV-Zustand für kontextsensitives M3-Greeting (primitive → stabile deps)
  const importStep       = useAppStore((s) => s.importStep)
  const importErrorCount = useAppStore((s) => s.importErrors.length)
  const dataGapCount     = useAppStore((s) => s.dataGaps.length)
  const dstWarningCount  = useAppStore((s) => s.dstWarnings.length)
  const dayCount         = useAppStore((s) => s.days.length)

  const [landingOpen,     setLandingOpen]     = useState(false)
  const [creditsOpen,     setCreditsOpen]     = useState(false)
  const [impressumOpen,   setImpressumOpen]   = useState(false)
  const [datenschutzOpen, setDatenschutzOpen] = useState(false)
  const [ueberUnsOpen,           setUeberUnsOpen]           = useState(false)
  const [anwaltEmpfehlenOpen,    setAnwaltEmpfehlenOpen]    = useState(false)
  const [adminOpen,              setAdminOpen]              = useState(() => window.location.hash === '#sp-admin')
  const [authOpen,               setAuthOpen]               = useState(false)

  const trustStripItems = useContent<TrustStripItems>('trust_strip', TRUST_STRIP_DEFAULT)
  const { current, completed, goTo, complete } = useMilestones()

  useEffect(() => { rehydrate() }, [rehydrate])

  // Premium payment redirect handler
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paymentId = params.get('sp_payment')
    if (!paymentId) return
    // Clean URL immediately
    window.history.replaceState({}, '', window.location.pathname + window.location.hash)
    import('./data/premium').then(({ verifyPayment, storePremiumToken }) => {
      verifyPayment(paymentId).then(({ status, token }) => {
        if (status === 'paid' && token) {
          storePremiumToken(token)
          // Navigate to M1 to show premium state
          goTo(1)
        }
      }).catch(() => {/* silent — user can retry */})
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Vector Widget: kontextsensitives Greeting pro Meilenstein ────────────
  useEffect(() => {
    const el = document.querySelector('vector-chat')
    if (!el) return

    let result: DiagnoseSnapshot | null = null
    try {
      const raw = localStorage.getItem(SP_DIAGNOSE_KEY)
      result = raw ? (JSON.parse(raw) as DiagnoseSnapshot) : null
    } catch {}

    const DEFEKT: Record<string, string> = {
      totalausfall: 'Totalausfall',
      drosselung:   'Drosselung auf 70%',
      teilausfall:  'Teilausfall',
      sonstiges:    'sonstiger Defekt',
    }
    const AMPEL: Record<string, string> = {
      gruen: '🟢 Angebot annehmen',
      gelb:  '🟡 Anwalt prüfen',
      rot:   '🔴 Angebot ablehnen',
    }

    const diagnoseHinweis = result
      ? ` Deine Diagnose: ${result.modell || 'SENEC'}, ${(result.defektArt ? DEFEKT[result.defektArt] : undefined) ?? result.defektArt ?? ''}${result.ampel ? ` — Ampel: ${AMPEL[result.ampel]}` : ''}.`
      : ''

    // CSV-Kontext für M3 — spiegelt den aktuellen Import-Zustand wider
    let csvHinweis = ''
    if (current === 3) {
      if (importStep === 'idle') {
        csvHinweis = ' Noch keine CSV geladen — ich helfe dir beim Upload.'
      } else if (importStep === 'mapping') {
        csvHinweis = ' Du bist beim Spalten-Zuordnen — frag mich wenn du nicht weißt welche Spalte gemeint ist.'
      } else if (importStep === 'done') {
        if (importErrorCount > 0) {
          csvHinweis = ` ${importErrorCount} Import-Fehler erkannt — frag mich, ich helfe dir.`
        } else if (dayCount === 0) {
          csvHinweis = ' Die CSV wurde importiert, enthält aber keine verwertbaren Daten — frag mich.'
        } else {
          const warnParts: string[] = []
          if (dataGapCount > 0) warnParts.push(`${dataGapCount} Datenlücke${dataGapCount > 1 ? 'n' : ''}`)
          if (dstWarningCount > 0) warnParts.push('Zeitumstellungshinweise')
          csvHinweis = warnParts.length > 0
            ? ` Hinweis: ${warnParts.join(' + ')} in deinen Daten — ich erkläre was das bedeutet.`
            : ` ${dayCount} Tage Daten importiert.`
        }
      }
    }

    const greetings: Record<number, string> = {
      1: `Ich begleite dich durch die Diagnose.${diagnoseHinweis} Fragen zur Kulanz-Prüfung oder zu deinen Ansprüchen?`,
      2: 'Du bist beim Daten-Export. Ich helfe dir, die CSV aus dem SENEC-Portal zu bekommen — oder kläre, was zu tun ist wenn kein Export-Button sichtbar ist.',
      3: `Du bist bei der Analyse.${diagnoseHinweis}${csvHinweis} Frag mich zu CSV-Import, Simulation oder PDF-Export.`,
      4: `Nachweis erstellt.${diagnoseHinweis} Ich helfe dir, den richtigen Anwalt mit SENEC-Erfahrung zu finden.`,
      5: `Briefing-Paket wird zusammengestellt.${diagnoseHinweis} Fragen zur E-Mail-Vorlage oder zum nächsten Schritt?`,
    }

    el.setAttribute('greeting', greetings[current] ?? greetings[3])
  }, [current, importStep, importErrorCount, dataGapCount, dstWarningCount, dayCount])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        auth={auth}
        onAuth={() => setAuthOpen(true)}
        onUeberUns={() => setUeberUnsOpen(true)}
        onCredits={() => setCreditsOpen(true)}
        onImpressum={() => setImpressumOpen(true)}
        onDatenschutz={() => setDatenschutzOpen(true)}
      />
      <Prozessleiste current={current} completed={completed} onGoTo={goTo} />

      {/* ── Trust-Strip ─────────────────────────────────────────────────── */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-amber-800">
        {trustStripItems.flatMap((item, i) => [
          <span key={`item-${i}`}>{item}</span>,
          <span key={`dot-${i}`} className="text-amber-300">·</span>,
        ])}
        <button
          onClick={() => setUeberUnsOpen(true)}
          className="font-semibold underline underline-offset-2 hover:text-amber-900 transition-colors"
        >
          Wer steckt dahinter? →
        </button>
        <span className="text-amber-300">·</span>
        <button
          onClick={() => setAnwaltEmpfehlenOpen(true)}
          className="font-semibold underline underline-offset-2 hover:text-amber-900 transition-colors"
        >
          Anwalt empfehlen →
        </button>
      </div>

      {/* ── Milestone-Inhalt ─────────────────────────────────────────────── */}
      <ErrorBoundary>
        <Suspense fallback={<MilestoneSpinner />}>
          {current === 1 && <MeilensteinDiagnose onComplete={() => complete(1)} />}
          {current === 2 && <MeilensteinExport   onComplete={() => complete(2)} />}
          {current === 3 && (
            <M3Analyse
              onLandingOpen={() => setLandingOpen(true)}
              onPdfExported={() => complete(3)}
            />
          )}
          {current === 4 && <MeilensteinAnwalt  onBack={() => goTo(3)} onComplete={() => complete(4)} />}
          {current === 5 && <MeilensteinBriefing onBack={() => goTo(4)} onComplete={() => complete(5)} />}
        </Suspense>
      </ErrorBoundary>

      {/* ── Overlays (lazy, nur laden wenn geöffnet) ─────────────────────── */}
      <ErrorBoundary>
        <Suspense fallback={null}>
          {landingOpen     && <LandingOverlay     open onClose={() => setLandingOpen(false)} />}
          {creditsOpen     && <CreditsOverlay     open onClose={() => setCreditsOpen(false)} />}
          {impressumOpen   && <ImpressumOverlay   open onClose={() => setImpressumOpen(false)} />}
          {datenschutzOpen && <DatenschutzOverlay open onClose={() => setDatenschutzOpen(false)} />}
          {adminOpen              && <AdminOverlay onClose={() => { setAdminOpen(false); window.location.hash = '' }} />}
          {ueberUnsOpen           && <UeberUnsOverlay open onClose={() => setUeberUnsOpen(false)} />}
          {anwaltEmpfehlenOpen    && <AnwaltEmpfehlenOverlay onClose={() => setAnwaltEmpfehlenOpen(false)} />}
          {authOpen               && <AuthOverlay auth={auth} onClose={() => setAuthOpen(false)} />}
        </Suspense>
      </ErrorBoundary>

      {duplicateInfo && (
        <DuplicateDialog
          duplicateCount={duplicateInfo.duplicateCount}
          totalCount={duplicateInfo.totalCount}
          isFullDuplicate={duplicateInfo.isFullDuplicate}
          fileName={duplicateInfo.fileName}
          onImportNew={() => confirmDuplicate('new_only')}
          onReplaceAll={() => confirmDuplicate('replace')}
          onCancel={cancelDuplicate}
        />
      )}
    </div>
  )
}

export default App
