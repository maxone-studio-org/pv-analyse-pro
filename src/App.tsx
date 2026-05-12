import { useState, useEffect, lazy, Suspense } from 'react'
import { Header } from './components/Header'
import { Prozessleiste } from './components/Prozessleiste'
import { ErrorBoundary } from './components/ErrorBoundary'
import { DuplicateDialog } from './components/DuplicateDialog'
import { useMilestones } from './hooks/useMilestones'
import { useAppStore } from './store'

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

function MilestoneSpinner() {
  return (
    <div className="min-h-[calc(100vh-112px)] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )
}

// ── App ──────────────────────────────────────────────────────────────────────

function App() {
  const rehydrate        = useAppStore((s) => s.rehydrate)
  const duplicateInfo    = useAppStore((s) => s.duplicateInfo)
  const confirmDuplicate = useAppStore((s) => s.confirmDuplicate)
  const cancelDuplicate  = useAppStore((s) => s.cancelDuplicate)

  const [landingOpen,     setLandingOpen]     = useState(false)
  const [creditsOpen,     setCreditsOpen]     = useState(false)
  const [impressumOpen,   setImpressumOpen]   = useState(false)
  const [datenschutzOpen, setDatenschutzOpen] = useState(false)

  const { current, completed, goTo, complete } = useMilestones()

  useEffect(() => { rehydrate() }, [rehydrate])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onCredits={() => setCreditsOpen(true)}
        onImpressum={() => setImpressumOpen(true)}
        onDatenschutz={() => setDatenschutzOpen(true)}
      />
      <Prozessleiste current={current} completed={completed} onGoTo={goTo} />

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
          {current === 4 && <MeilensteinAnwalt  onBack={() => goTo(3)} />}
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
